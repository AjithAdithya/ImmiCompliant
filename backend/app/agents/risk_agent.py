"""
Risk Assessment Agent — evaluates organization-wide compliance posture.

Calculates:
- Organization compliance score (0–100)
- Per-employee risk profiles
- Prioritized remediation task list
- Audit readiness assessment
"""

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import SystemMessage, AIMessage
from langchain_core.tools import tool

from app.agents.state import ComplianceState
from app.config import settings

llm = ChatAnthropic(
    model="claude-opus-4-6",
    api_key=settings.anthropic_api_key,
    temperature=0,
    max_tokens=4096,
)

RISK_SYSTEM_PROMPT = """You are a compliance risk assessment specialist for immigration compliance.

You evaluate an organization's immigration compliance posture and calculate risk scores based on:

**Scoring Weights:**
- I-9 accuracy (30%): Error rate, missing forms, reverification compliance
- PAF completeness (25%): All required documents present for each LCA
- Deadline adherence (25%): On-time filings, no expired work authorizations
- Document currency (20%): All documents valid and not approaching expiry

**Risk Levels:**
- 90-100: Low risk (green) — excellent compliance posture
- 75-89: Medium risk (yellow) — minor issues, monitor closely
- 60-74: High risk (orange) — significant issues requiring prompt attention
- <60: Critical risk (red) — immediate action required, potential violations

Provide specific, actionable remediation steps with timeline estimates.
"""


@tool
def calculate_i9_error_rate(organization_id: str) -> dict:
    """
    Query database for all I-9 records and calculate error rate.
    Returns error count, error types, and employees needing remediation.
    """
    # In production: queries PostgreSQL for i9_records
    return {
        "total_i9s": 7,
        "with_errors": 2,
        "needs_reverification": 1,
        "error_rate": 0.286,
        "critical_employees": ["emp-007", "emp-004"],
    }


@tool
def calculate_paf_completeness_score(organization_id: str) -> dict:
    """
    Check all PAFs for completeness.
    Returns per-LCA completeness scores and missing documents.
    """
    return {
        "total_pafs": 3,
        "audit_ready": 2,
        "incomplete": 1,
        "average_score": 86.7,
        "incomplete_pafs": [{"lca_id": "lca-002", "score": 60, "missing": ["Prevailing Wage Docs", "Benefits Docs"]}],
    }


@tool
def generate_risk_report(organization_id: str) -> dict:
    """
    Generate a comprehensive compliance risk report with prioritized actions.
    """
    return {
        "overall_score": 72,
        "trend": "declining",
        "trend_value": -5,
        "priority_actions": [
            {
                "priority": 1,
                "type": "critical",
                "title": "Andrei Popescu — Unauthorized Work Risk",
                "action": "Place on unpaid leave. MTR NOID response due 3/25/2026",
                "employee_id": "emp-007",
            },
            {
                "priority": 2,
                "type": "critical",
                "title": "Aisha Okonkwo — I-9 Reverification Overdue",
                "action": "Complete I-9 reverification immediately upon EAD receipt",
                "employee_id": "emp-004",
            },
            {
                "priority": 3,
                "type": "high",
                "title": "Wei Zhang PAF Incomplete",
                "action": "Add prevailing wage docs and benefits documentation to PAF",
                "employee_id": "emp-002",
            },
        ],
    }


def risk_agent_node(state: ComplianceState) -> dict:
    """
    Assess compliance risk and generate remediation recommendations.
    """
    response = llm.invoke([
        SystemMessage(content=RISK_SYSTEM_PROMPT),
        *state["messages"],
    ])

    return {
        "messages": [response],
        "compliance_findings": state.get("compliance_findings", []),
        "risk_scores": state.get("risk_scores", {}),
    }
