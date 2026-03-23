"""LangGraph state definition for the ImmiCompliant compliance agent graph."""

from typing import TypedDict, Annotated, Literal, Optional
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage


class ComplianceState(TypedDict):
    """
    Shared state for the multi-agent compliance graph.

    All agents read from and write to this state. The 'messages' field
    uses the add_messages reducer so appends are safe across concurrent nodes.
    """

    # ── Conversation ────────────────────────────────────────────────────────
    messages: Annotated[list[BaseMessage], add_messages]

    # ── Routing ─────────────────────────────────────────────────────────────
    # The supervisor sets this to decide which specialist agent runs next.
    next_agent: Optional[Literal[
        "document_agent",
        "policy_agent",
        "risk_agent",
        "qa_agent",
        "case_agent",
        "synthesizer",
    ]]

    # ── Request context ──────────────────────────────────────────────────────
    user_id: str
    organization_id: str
    # Employee-specific data injected before graph invocation (optional)
    employee_context: Optional[dict]

    # ── Agent working memory ─────────────────────────────────────────────────
    documents_analyzed: list[dict]      # From document_agent
    compliance_findings: list[dict]     # From risk_agent
    risk_scores: dict                   # org + per-employee scores
    policy_updates: list[dict]          # From policy_agent
    case_statuses: list[dict]           # From case_agent
    citations: list[dict]               # Regulatory citations from qa_agent

    # ── Human-in-the-loop ────────────────────────────────────────────────────
    # When the graph needs human approval before proceeding, it stores the
    # pending action here and calls interrupt(). The human's response is
    # stored in approval_status.
    pending_approval: Optional[dict]
    approval_status: Optional[Literal["approved", "rejected", "modified"]]
