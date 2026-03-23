"""
Case Tracking Agent — checks USCIS case statuses and interprets results.

Integrates with:
- USCIS Case Status API (developer.uscis.gov)
- USCIS Processing Times (egov.uscis.gov/processing-times)
"""

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import SystemMessage
from langchain_core.tools import tool
import httpx

from app.agents.state import ComplianceState
from app.config import settings

llm = ChatAnthropic(
    model="claude-opus-4-6",
    api_key=settings.anthropic_api_key,
    temperature=0,
    max_tokens=4096,
)

CASE_SYSTEM_PROMPT = """You are a USCIS case tracking specialist.

You help employers understand the status of their immigration petitions and applications.

When interpreting case statuses:
1. Translate USCIS status codes into plain English
2. Explain what happens next in the process
3. Flag cases that require attention (RFEs, NOIDs, delays)
4. Provide realistic timeline estimates based on current processing times
5. Recommend premium processing when deadline pressure warrants it

Always provide the official USCIS case status alongside your interpretation.
"""


@tool
async def check_uscis_case_status(receipt_number: str) -> dict:
    """
    Check the USCIS Case Status API for a specific receipt number.

    Args:
        receipt_number: USCIS receipt number (e.g., WAC2512345678)

    Returns:
        Current case status with timestamp and description
    """
    # In production: calls https://developer.uscis.gov/api/case-status
    # Example API call:
    # async with httpx.AsyncClient() as client:
    #     response = await client.get(
    #         f"https://api.uscis.gov/case-status/{receipt_number}",
    #         headers={"apikey": settings.uscis_api_key}
    #     )
    #     return response.json()

    # Mock response for development
    return {
        "receipt_number": receipt_number,
        "status": "Case Was Approved",
        "description": "On January 15, 2026, we approved this case.",
        "last_updated": "2026-01-15",
        "form_type": "I-129",
    }


@tool
async def check_processing_times(form_type: str, service_center: str) -> dict:
    """
    Get current USCIS processing times for a form + service center combination.
    """
    return {
        "form": form_type,
        "service_center": service_center,
        "regular_processing_months": "7-8",
        "premium_processing_days": 15,
        "as_of_date": "2026-03-01",
    }


def case_agent_node(state: ComplianceState) -> dict:
    """
    Check and interpret USCIS case statuses.
    """
    response = llm.invoke([
        SystemMessage(content=CASE_SYSTEM_PROMPT),
        *state["messages"],
    ])

    return {
        "messages": [response],
        "case_statuses": state.get("case_statuses", []),
    }
