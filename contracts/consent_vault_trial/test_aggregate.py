"""Pytest coverage for the deterministic aggregation rules.

These tests pin down the priority + tie-breaking + scoring + copy templates
that mirror `lib/verdict.ts` in the frontend and the `_aggregate` helper in
`main.py`. If the contract verdict rules change, both this file and `main.py`
must move together.
"""

from __future__ import annotations

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
