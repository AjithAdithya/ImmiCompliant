"""
Policy Monitoring Agent — tracks regulatory changes and generates impact assessments.

Monitors:
- USCIS policy alerts and processing time updates
- DOL bulletins and prevailing wage changes
- Federal Register immigration entries
- Visa Bulletin monthly updates
- Executive orders affecting immigration
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

POLICY_SYSTEM_PROMPT = """You are a regulatory monitoring specialist for immigration compliance.

You track changes from:
- USCIS (uscis.gov/news/alerts)
- DOL Office of Foreign Labor Certification (oflc.dol.gov)
- Federal Register (federalregister.gov)
- DOS Visa Office Visa Bulletin (travel.state.gov)

For each regulatory change, you:
1. Summarize in plain English (not legalese)
2. Identify which employees are affected (by visa type)
3. Generate specific action items for the compliance team
4. Assess the urgency and impact level

Always cite the source URL and publication date.
"""


@tool
async def fetch_uscis_updates() -> list[dict]:
    """
    Fetch recent USCIS policy alerts and news.
    Returns a list of updates from the past 30 days.
    """
    # In production: calls USCIS RSS feed / API
    # For now returns cached data
    return [
        {
            "title": "USCIS Updates H-1B Registration Fee to $215",
            "source": "USCIS",
            "date": "2026-02-15",
            "url": "https://www.uscis.gov/news",
            "summary": "Final rule increasing H-1B electronic registration fee.",
            "affected_visa_types": ["H-1B"],
            "impact": "medium",
        }
    ]


@tool
async def fetch_visa_bulletin() -> dict:
    """
    Fetch the latest DOS Visa Bulletin with priority date information.
    Returns final action dates and dates for filing by preference category.
    """
    return {
        "month": "March 2026",
        "source": "U.S. Department of State",
        "employment_based": {
            "eb1": {"china": "C", "india": "C", "mexico": "C", "philippines": "C", "row": "C"},
            "eb2": {"china": "2020-11-01", "india": "2013-01-01", "row": "C"},
            "eb3": {"china": "2020-07-01", "india": "2012-06-01", "row": "C"},
        },
    }


@tool
async def generate_impact_assessment(policy_update: dict, organization_id: str) -> dict:
    """
    Given a policy change, determine which employees are affected and what actions are needed.
    """
    return {
        "affected_employees": [],
        "action_items": [],
        "urgency": "medium",
    }


def policy_agent_node(state: ComplianceState) -> dict:
    """
    Monitor policy changes and assess their impact on the organization.
    """
    response = llm.invoke([
        SystemMessage(content=POLICY_SYSTEM_PROMPT),
        *state["messages"],
    ])

    return {
        "messages": [response],
        "policy_updates": state.get("policy_updates", []),
    }
