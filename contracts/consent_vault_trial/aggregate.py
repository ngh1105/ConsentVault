"""Pure-Python mirror of the deterministic aggregation logic in `main.py`.

This module is importable without the GenLayer runtime so the verdict copy and
scoring math can be exercised under `pytest`. Keep this file in sync with
`main.py` whenever the verdict rules change.
"""

from __future__ import annotations

from typing import Iterable, List, Mapping, Tuple


VERDICT_CATEGORIES: Tuple[str, ...] = (
    "Allowed",
    "Needs Attribution",
    "Needs License",
    "Impersonation Risk",
    "Violation",
)

VERDICT_PRIORITY: Mapping[str, int] = {
    "Allowed": 1,
    "Needs Attribution": 2,
    "Needs License": 3,
    "Impersonation Risk": 4,
    "Violation": 5,
}


def strip_code_fence(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        first_newline = text.find("\n")
        if first_newline != -1:
            text = text[first_newline + 1 :]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def normalize_judgments(judgments: Iterable[Mapping]) -> List[dict]:
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


def verdict_copy(
    verdict: str,
    creator_name: str,
    evidence_count: int,
    support_count: int,
) -> Tuple[str, str]:
    if verdict == "Allowed":
        return (
            f"{support_count} validators found the use compatible with {creator_name}'s policy after reviewing {evidence_count} linked evidence references.",
            "Archive the receipt, preserve the evidence trail, and monitor for future policy drift.",
        )
    if verdict == "Needs Attribution":
        return (
            f"{support_count} validators agreed the reuse is likely permissible, but {creator_name}'s attribution requirements were not carried through the {evidence_count} cited records.",
            f"Request corrected crediting and synthetic labeling before escalating beyond {creator_name}'s policy workflow.",
        )
    if verdict == "Needs License":
        return (
            f"{support_count} validators found that the reuse exceeds {creator_name}'s standing permissions and points to a licensing gap across {evidence_count} cited records.",
            "Pause further distribution and obtain a documented license or remove the reused material.",
        )
    if verdict == "Impersonation Risk":
        return (
            f"{support_count} validators detected likely identity imitation tied to {creator_name}'s protected persona, supported by {evidence_count} cited evidence references.",
            "Escalate to trust and safety with the evidence bundle and request urgent review for deceptive synthetic media.",
        )
    return (
        f"{support_count} validators concluded the reuse conflicts directly with {creator_name}'s policy and the {evidence_count} cited records support enforcement-ready escalation.",
        "Preserve the receipt, notify the platform, and prepare a formal enforcement or takedown request.",
    )


def aggregate(judgments: List[dict], case: Mapping, policy: Mapping) -> dict:
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

    summary, recommended = verdict_copy(
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
