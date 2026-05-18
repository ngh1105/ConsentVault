# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""ConsentVault — GenLayer Intelligent Contract.

Receives a serialized case + policy bundle from the ConsentVault DApp, runs a
single LLM call that produces three independent validator judgments, then
aggregates them into a final verdict using deterministic priority + confidence
rules. The result is persisted per case so the frontend can read it back via
`get_result_by_case` after the write transaction is finalized.

The aggregation logic is duplicated in `aggregate.py` for `pytest` coverage —
keep them in sync when iterating on verdict copy or scoring.
"""

from genlayer import *

import json


VERDICT_CATEGORIES = (
    "Allowed",
    "Needs Attribution",
    "Needs License",
    "Impersonation Risk",
    "Violation",
)

VERDICT_PRIORITY = {
    "Allowed": 1,
    "Needs Attribution": 2,
    "Needs License": 3,
    "Impersonation Risk": 4,
    "Violation": 5,
}

VALIDATOR_PERSONAS = (
    {
        "id": "validator-signal-house",
        "name": "Signal House",
        "lens": "voice + identity imitation, persona deception, endorsement signals",
    },
    {
        "id": "validator-rights-ledger",
        "name": "Rights Ledger",
        "lens": "license scope, commercial reuse, attribution, derivative work boundaries",
    },
    {
        "id": "validator-public-interest-lab",
        "name": "Public Interest Lab",
        "lens": "fair use, public-interest research, parody, transparency labels",
    },
)


def _build_prompt(case, policy):
    persona_lines = "\n".join(
        '  - id={id} name="{name}" lens="{lens}"'.format(**p) for p in VALIDATOR_PERSONAS
    )
    evidence_lines = "\n".join(
        '  - id={id} type={type} title="{title}" desc="{description}"'.format(
            id=ev.get("id", "?"),
            type=ev.get("type", "?"),
            title=ev.get("title", ""),
            description=ev.get("description", ""),
        )
        for ev in case.get("evidenceItems", [])
    )
    return (
        "You are arbitrating an AI-content consent dispute. Three independent "
        "validators evaluate the case from their lenses.\n\n"
        "Validators:\n" + persona_lines + "\n\n"
        "Verdict categories (must be one of these exactly): "
        + ", ".join(VERDICT_CATEGORIES)
        + "\n\n"
        "Creator policy ({creator}):\n"
        "- Allowed uses: {allowed}\n"
        "- Blocked uses: {blocked}\n"
        "- Attribution rules: {attribution}\n"
        "- License rules: {license}\n"
        "- Jurisdiction note: {jurisdiction}\n\n".format(
            creator=policy.get("creatorName", "Unknown"),
            allowed=policy.get("allowedUses", []),
            blocked=policy.get("blockedUses", []),
            attribution=policy.get("attributionRules", ""),
            license=policy.get("licenseRules", ""),
            jurisdiction=policy.get("jurisdictionNote", ""),
        )
        + 'Case "{title}" (id={id}):\n'
        "- Notes: {notes}\n"
        "- Original content: {original}\n"
        "- AI output: {ai}\n"
        "- Source URL: {src}\n"
        "- AI output URL: {ai_url}\n"
        "- Platform URL: {platform}\n\n".format(
            title=case.get("title", ""),
            id=case.get("id", ""),
            notes=case.get("notes", ""),
            original=case.get("originalContent", ""),
            ai=case.get("aiOutput", ""),
            src=case.get("sourceUrl", ""),
            ai_url=case.get("aiOutputUrl", ""),
            platform=case.get("platformUrl", ""),
        )
        + "Evidence items:\n" + evidence_lines + "\n\n"
        "For each validator, produce a judgment with keys: id, validatorName, "
        "verdict, confidence (float 0..1), reasoning (string), citedEvidenceIds "
        "(list of evidence ids). Use the validator id from the list above.\n\n"
        "Return ONLY a JSON object of the form:\n"
        '{ "judgments": [ { "id": "validator-signal-house", "validatorName": '
        '"Signal House", "verdict": "...", "confidence": 0.0, "reasoning": '
        '"...", "citedEvidenceIds": ["..."] }, ... ] }\n\n'
        "Do not include markdown code fences. Output must be valid JSON only."
    )


def _strip_code_fence(text):
    text = text.strip()
    if text.startswith("```"):
        first_newline = text.find("\n")
        if first_newline != -1:
            text = text[first_newline + 1 :]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def _normalize_judgments(judgments):
    return sorted(
        (
            {
                "id": j.get("id", ""),
                "validatorName": j.get("validatorName", ""),
                "verdict": j.get("verdict", ""),
                "confidence": float(j.get("confidence", 0)),
                "reasoning": j.get("reasoning", ""),
                "citedEvidenceIds": list(j.get("citedEvidenceIds", []) or []),
            }
            for j in judgments
        ),
        key=lambda j: j["id"],
    )


def _verdict_copy(verdict, creator_name, evidence_count, support_count):
    if verdict == "Allowed":
        return (
            "{count} validators found the use compatible with {creator}'s policy after reviewing {evidence} linked evidence references.".format(
                count=support_count, creator=creator_name, evidence=evidence_count
            ),
            "Archive the receipt, preserve the evidence trail, and monitor for future policy drift.",
        )
    if verdict == "Needs Attribution":
        return (
            "{count} validators agreed the reuse is likely permissible, but {creator}'s attribution requirements were not carried through the {evidence} cited records.".format(
                count=support_count, creator=creator_name, evidence=evidence_count
            ),
            "Request corrected crediting and synthetic labeling before escalating beyond {creator}'s policy workflow.".format(
                creator=creator_name
            ),
        )
    if verdict == "Needs License":
        return (
            "{count} validators found that the reuse exceeds {creator}'s standing permissions and points to a licensing gap across {evidence} cited records.".format(
                count=support_count, creator=creator_name, evidence=evidence_count
            ),
            "Pause further distribution and obtain a documented license or remove the reused material.",
        )
    if verdict == "Impersonation Risk":
        return (
            "{count} validators detected likely identity imitation tied to {creator}'s protected persona, supported by {evidence} cited evidence references.".format(
                count=support_count, creator=creator_name, evidence=evidence_count
            ),
            "Escalate to trust and safety with the evidence bundle and request urgent review for deceptive synthetic media.",
        )
    return (
        "{count} validators concluded the reuse conflicts directly with {creator}'s policy and the {evidence} cited records support enforcement-ready escalation.".format(
            count=support_count, creator=creator_name, evidence=evidence_count
        ),
        "Preserve the receipt, notify the platform, and prepare a formal enforcement or takedown request.",
    )


def _aggregate(judgments, case, policy):
    totals = {category: 0.0 for category in VERDICT_CATEGORIES}
    for j in judgments:
        verdict = j.get("verdict")
        if verdict in totals:
            totals[verdict] += float(j.get("confidence", 0))

    final_verdict = max(
        totals.items(),
        key=lambda kv: (kv[1], VERDICT_PRIORITY[kv[0]]),
    )[0]

    supporting = [j for j in judgments if j.get("verdict") == final_verdict]
    supporting_evidence_ids = sorted(
        {ev_id for j in supporting for ev_id in j.get("citedEvidenceIds", [])}
    )

    avg_conf = (
        sum(float(j.get("confidence", 0)) for j in supporting) / len(supporting)
        if supporting
        else 0.0
    )
    score = max(0, min(100, round(avg_conf * 100)))

    summary, recommended = _verdict_copy(
        final_verdict,
        policy.get("creatorName", "the creator"),
        len(supporting_evidence_ids),
        len(supporting),
    )

    return {
        "judgments": judgments,
        "finalVerdict": final_verdict,
        "score": score,
        "summary": summary,
        "recommendedAction": recommended,
        "supportingEvidenceCount": len(supporting_evidence_ids),
        "supportingValidatorCount": len(supporting),
        "caseId": case.get("id", ""),
    }


class ConsentVaultTrial(gl.Contract):
    last_result_by_case: TreeMap[str, str]

    def __init__(self):
        # TreeMap[str, str] is initialized empty by GenVM.
        pass

    @gl.public.write
    def run_trial(self, case_json: str, policy_json: str) -> str:
        """Run the three-validator trial and persist the JSON-encoded result."""
        case = json.loads(case_json)
        policy = json.loads(policy_json)
        prompt = _build_prompt(case, policy)

        def evaluate():
            raw = gl.nondet.exec_prompt(prompt)
            cleaned = _strip_code_fence(raw)
            data = json.loads(cleaned)
            normalized = _normalize_judgments(data.get("judgments", []))
            aggregated = _aggregate(normalized, case, policy)
            return json.dumps(aggregated, sort_keys=True)

        result = gl.eq_principle.prompt_comparative(
            evaluate,
            principle=(
                "The finalVerdict and recommendedAction must match across runs. "
                "Each validator's verdict (per id) must be identical. "
                "Confidence values must be within 0.15 between runs. "
                "Reasoning text may differ but must reference the same case context."
            ),
        )

        assert isinstance(result, str)
        case_id = case.get("id", "")
        if case_id:
            self.last_result_by_case[case_id] = result
        return result

    @gl.public.view
    def get_result_by_case(self, case_id: str) -> str:
        """Return the last persisted trial JSON for `case_id` or empty string."""
        if case_id in self.last_result_by_case:
            return self.last_result_by_case[case_id]
        return ""
