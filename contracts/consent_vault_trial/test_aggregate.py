"""Pytest coverage for the deterministic aggregation rules.

These tests pin down the priority + tie-breaking + scoring + copy templates
that mirror `lib/verdict.ts` in the frontend and the `_aggregate` helper in
`main.py`. If the contract verdict rules change, both this file and `main.py`
must move together.
"""

from __future__ import annotations

import ast
from pathlib import Path

import pytest

from aggregate import (
    aggregate,
    normalize_judgments,
    strip_code_fence,
    verdict_copy,
)


CASE = {"id": "case-voice-clone", "title": "Voice clone dispute"}
POLICY = {"creatorName": "Mara Ellison"}


def _judgment(id: str, verdict: str, confidence: float, evidence_ids):
    return {
        "id": id,
        "validatorName": id,
        "verdict": verdict,
        "confidence": confidence,
        "reasoning": f"{verdict} reasoning",
        "citedEvidenceIds": list(evidence_ids),
    }


class TestStripCodeFence:
    def test_strips_json_code_fence(self):
        text = '```json\n{"a": 1}\n```'
        assert strip_code_fence(text) == '{"a": 1}'

    def test_strips_plain_code_fence(self):
        text = "```\n{}\n```"
        assert strip_code_fence(text) == "{}"

    def test_returns_text_when_no_fence(self):
        assert strip_code_fence("  hello  ") == "hello"


class TestNormalizeJudgments:
    def test_sorts_by_id_and_canonicalizes_fields(self):
        result = normalize_judgments(
            [
                {"id": "b", "validatorName": "B", "verdict": "Allowed", "confidence": "0.5"},
                {"id": "a", "verdict": "Violation", "confidence": 0.9, "citedEvidenceIds": None},
            ]
        )

        assert [j["id"] for j in result] == ["a", "b"]
        assert result[0]["citedEvidenceIds"] == []
        assert result[0]["confidence"] == 0.9
        assert result[1]["confidence"] == 0.5
        assert all("reasoning" in j for j in result)


class TestAggregate:
    def test_picks_highest_total_support(self):
        judgments = [
            _judgment("a", "Allowed", 0.55, ["e1"]),
            _judgment("b", "Allowed", 0.54, ["e2"]),
            _judgment("c", "Violation", 0.95, ["e3"]),
        ]

        result = aggregate(judgments, CASE, POLICY)

        assert result["finalVerdict"] == "Allowed"
        assert result["supportingValidatorCount"] == 2
        assert result["supportingEvidenceCount"] == 2
        assert result["score"] == 55  # round((0.55+0.54)/2 * 100) = 55

    def test_breaks_ties_by_severity(self):
        judgments = [
            _judgment("a", "Allowed", 0.9, ["e1"]),
            _judgment("b", "Needs Attribution", 0.9, ["e2"]),
        ]

        result = aggregate(judgments, CASE, POLICY)

        assert result["finalVerdict"] == "Needs Attribution"
        assert result["score"] == 90

    def test_includes_case_id(self):
        result = aggregate(
            [_judgment("a", "Allowed", 0.7, ["e1"])],
            CASE,
            POLICY,
        )
        assert result["caseId"] == "case-voice-clone"

    def test_handles_impersonation_priority(self):
        judgments = [
            _judgment("signal-house", "Impersonation Risk", 0.94, ["ev-imp-source", "ev-imp-output"]),
            _judgment("persona-watch", "Impersonation Risk", 0.89, ["ev-imp-source"]),
            _judgment("rights-ledger", "Needs License", 0.76, ["ev-imp-output"]),
        ]

        result = aggregate(judgments, CASE, POLICY)

        assert result["finalVerdict"] == "Impersonation Risk"
        assert result["supportingValidatorCount"] == 2
        assert result["supportingEvidenceCount"] == 2
        # avg of 0.94 and 0.89 = 0.915 → 92
        assert result["score"] == 92

    def test_score_is_clamped_to_0_100(self):
        # Confidence above 1.0 should clamp at 100, below 0 at 0.
        judgments = [_judgment("x", "Allowed", 5.0, ["e"])]
        result = aggregate(judgments, CASE, POLICY)
        assert result["score"] == 100

        judgments = [_judgment("x", "Allowed", -1.0, ["e"])]
        result = aggregate(judgments, CASE, POLICY)
        assert result["score"] == 0

    def test_recommended_action_includes_creator_name_for_attribution(self):
        result = aggregate(
            [_judgment("a", "Needs Attribution", 0.8, ["e1"])],
            CASE,
            POLICY,
        )

        assert "Mara Ellison" in result["recommendedAction"]


class TestVerdictCopy:
    @pytest.mark.parametrize(
        "verdict",
        [
            "Allowed",
            "Needs Attribution",
            "Needs License",
            "Impersonation Risk",
            "Violation",
        ],
    )
    def test_returns_summary_and_action_for_each_category(self, verdict):
        summary, action = verdict_copy(verdict, "Mara", 3, 2)
        assert isinstance(summary, str) and summary
        assert isinstance(action, str) and action


GOLDEN_VERDICT_COPY = {
    ("Allowed", "Acme", 0, 1): (
        "1 validators found the use compatible with Acme's policy after reviewing 0 linked evidence references.",
        "Archive the receipt, preserve the evidence trail, and monitor for future policy drift.",
    ),
    ("Needs Attribution", "Acme", 5, 2): (
        "2 validators agreed the reuse is likely permissible, but Acme's attribution requirements were not carried through the 5 cited records.",
        "Request corrected crediting and synthetic labeling before escalating beyond Acme's policy workflow.",
    ),
    ("Needs License", "Acme", 5, 3): (
        "3 validators found that the reuse exceeds Acme's standing permissions and points to a licensing gap across 5 cited records.",
        "Pause further distribution and obtain a documented license or remove the reused material.",
    ),
    ("Impersonation Risk", "Acme", 5, 1): (
        "1 validators detected likely identity imitation tied to Acme's protected persona, supported by 5 cited evidence references.",
        "Escalate to trust and safety with the evidence bundle and request urgent review for deceptive synthetic media.",
    ),
    ("Violation", "Acme", 5, 2): (
        "2 validators concluded the reuse conflicts directly with Acme's policy and the 5 cited records support enforcement-ready escalation.",
        "Preserve the receipt, notify the platform, and prepare a formal enforcement or takedown request.",
    ),
}


@pytest.mark.parametrize("args,expected", list(GOLDEN_VERDICT_COPY.items()))
def test_aggregate_verdict_copy_matches_golden(args, expected):
    verdict, creator, evidence, support = args
    assert verdict_copy(verdict, creator, evidence, support) == expected


def _extract_verdict_copy_from_main():
    main_src = Path(__file__).parent / "main.py"
    tree = ast.parse(main_src.read_text(encoding="utf-8"))
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and node.name == "_verdict_copy":
            module = ast.Module(body=[node], type_ignores=[])
            namespace: dict = {}
            exec(compile(module, str(main_src), "exec"), namespace)
            return namespace["_verdict_copy"]
    raise RuntimeError(
        "_verdict_copy not found anywhere in main.py (searched module + nested scopes via ast.walk)"
    )


@pytest.mark.parametrize("args,expected", list(GOLDEN_VERDICT_COPY.items()))
def test_main_py_verdict_copy_matches_golden(args, expected):
    main_verdict_copy = _extract_verdict_copy_from_main()
    assert main_verdict_copy(*args) == expected


def test_aggregate_caller_preserves_case_id():
    judgments = normalize_judgments([
        {"id": "v1", "verdict": "Allowed", "confidence": 0.9, "validatorName": "A"},
        {"id": "v2", "verdict": "Allowed", "confidence": 0.8, "validatorName": "B"},
        {"id": "v3", "verdict": "Allowed", "confidence": 0.7, "validatorName": "C"},
    ])
    result_with_id = aggregate(judgments, {"id": "case-123"}, {"creatorName": "Acme"})
    assert result_with_id["caseId"] == "case-123"

    result_without_id = aggregate(judgments, {"id": ""}, {"creatorName": "Acme"})
    assert result_without_id["caseId"] == ""


def _find_function_in_main(name: str, *, parent_class: str | None = None) -> ast.FunctionDef:
    """Find a top-level or class-method FunctionDef in main.py by name.

    If `parent_class` is provided, search only inside that class's body.
    Raises RuntimeError with diagnostic context if not found.
    """
    main_src = Path(__file__).parent / "main.py"
    tree = ast.parse(main_src.read_text(encoding="utf-8"))
    for node in ast.walk(tree):
        if not isinstance(node, ast.FunctionDef) or node.name != name:
            continue
        if parent_class is None:
            return node
        # Walk the class bodies to confirm parentage.
        for cls in ast.walk(tree):
            if isinstance(cls, ast.ClassDef) and cls.name == parent_class:
                if node in cls.body:
                    return node
    where = f"class {parent_class}" if parent_class else "module top level"
    raise RuntimeError(f"{name!r} not found in main.py ({where})")


def test_run_trial_asserts_non_empty_case_id():
    fn = _find_function_in_main("run_trial", parent_class="ConsentVaultTrial")
    asserts = [node for node in ast.walk(fn) if isinstance(node, ast.Assert)]
    case_id_asserts = [
        a for a in asserts
        if isinstance(a.test, ast.Name) and a.test.id == "case_id"
    ]
    assert case_id_asserts, (
        "run_trial must contain `assert case_id, ...` to reject empty case ids; "
        f"found asserts: {[ast.dump(a.test) for a in asserts]}"
    )
