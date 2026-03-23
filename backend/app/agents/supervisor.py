"""
Supervisor Agent — routes user requests to the appropriate specialist agent.

The supervisor is the entry point for all user interactions. It:
1. Classifies the user's intent
2. Sets state['next_agent'] to the appropriate specialist
3. After specialist agents run, synthesizes the final response
"""

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.types import interrupt

from app.agents.state import ComplianceState
from app.config import settings

# Shared LLM instance (claude-opus-4-6 for highest quality compliance guidance)
llm = ChatAnthropic(
    model="claude-opus-4-6",
    api_key=settings.anthropic_api_key,
    temperature=0,
    max_tokens=4096,
)

SUPERVISOR_SYSTEM_PROMPT = """You are the Compliance Supervisor for ImmiCompliant, an AI-powered
immigration compliance platform for small and medium businesses.

Your role is to:
1. Understand the user's immigration compliance question or request
2. Route it to the most appropriate specialist agent:
   - "document_agent": I-9 validation, LCA review, document analysis, PAF checks
   - "policy_agent": regulatory updates, USCIS/DOL changes, visa bulletin
   - "risk_agent": compliance scoring, risk assessment, audit readiness
   - "qa_agent": general immigration Q&A, regulations, policy interpretation
   - "case_agent": USCIS case status, processing times, case tracking
   - "synthesizer": if the question is simple enough to answer directly

Return ONLY one of these agent names as your response.

User context: {org_name} | {employee_count} employees on immigration status
"""


def supervisor_node(state: ComplianceState) -> dict:
    """
    Classify intent and route to the appropriate specialist agent.
    """
    last_message = state["messages"][-1]
    user_input = last_message.content if hasattr(last_message, "content") else str(last_message)

    system = SUPERVISOR_SYSTEM_PROMPT.format(
        org_name="TechCorp Inc.",
        employee_count=10,
    )

    response = llm.invoke([
        SystemMessage(content=system),
        HumanMessage(content=f"Route this request: {user_input}"),
    ])

    routing = response.content.strip().lower()

    # Default to qa_agent if routing is unclear
    valid_agents = {"document_agent", "policy_agent", "risk_agent", "qa_agent", "case_agent", "synthesizer"}
    next_agent = routing if routing in valid_agents else "qa_agent"

    return {"next_agent": next_agent}


def route_to_agent(state: ComplianceState) -> str:
    """Conditional edge function — returns the next node name."""
    return state.get("next_agent", "qa_agent")
