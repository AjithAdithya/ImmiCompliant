"""
ImmiCompliant LangGraph — Main Graph Definition

Topology:
    START → supervisor → [specialist agents] → synthesizer → (approval?) → END
                                                              ↓
                                                         human_review → END

The supervisor routes requests to one of five specialist agents:
  - document_agent:  I-9, LCA, PAF analysis
  - policy_agent:    Regulatory monitoring
  - risk_agent:      Compliance scoring
  - qa_agent:        General Q&A with citations
  - case_agent:      USCIS case status

After the specialist runs, the synthesizer formats the final response.
If the action requires human approval, the graph pauses at human_review.
"""

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver  # Use PostgresSaver in production
from langgraph.types import interrupt

from app.agents.state import ComplianceState
from app.agents.supervisor import supervisor_node, route_to_agent
from app.agents.qa_agent import qa_agent_node
from app.agents.document_agent import document_agent_node
from app.agents.risk_agent import risk_agent_node
from app.agents.policy_agent import policy_agent_node
from app.agents.case_agent import case_agent_node


def synthesizer_node(state: ComplianceState) -> dict:
    """
    Synthesize the final response from specialist agent outputs.
    In most cases the specialist already set the final message;
    this node handles multi-agent coordination and formatting.
    """
    # The specialist agents already appended their response to state['messages'].
    # The synthesizer can optionally enrich it with citations, risk context, etc.
    return {}


def human_review_node(state: ComplianceState) -> dict:
    """
    Pause execution and wait for human approval of a pending action.

    Called when:
    - I-9 correction is about to be flagged (risk of worse violation)
    - An alert is about to be sent to an employee
    - A compliance task is about to be assigned
    - External communications are queued

    Uses LangGraph's interrupt() to pause the graph until the human responds.
    """
    pending = state.get("pending_approval")
    if pending:
        # This call pauses the graph until the human resumes it
        approval = interrupt({
            "type": "human_review_required",
            "action": pending,
            "message": "Please review and approve this compliance action before it proceeds.",
        })
        return {"approval_status": approval}
    return {}


def needs_approval(state: ComplianceState) -> str:
    """
    Conditional edge: does this response require human approval before acting?
    Returns 'human_review' or END.
    """
    if state.get("pending_approval"):
        return "human_review"
    return END


def build_graph(use_memory_checkpointer: bool = True):
    """
    Build and compile the compliance agent graph.

    Args:
        use_memory_checkpointer: Use in-memory checkpointer (dev) or PostgreSQL (prod)
    """
    builder = StateGraph(ComplianceState)

    # ── Register nodes ────────────────────────────────────────────────────────
    builder.add_node("supervisor", supervisor_node)
    builder.add_node("document_agent", document_agent_node)
    builder.add_node("policy_agent", policy_agent_node)
    builder.add_node("risk_agent", risk_agent_node)
    builder.add_node("qa_agent", qa_agent_node)
    builder.add_node("case_agent", case_agent_node)
    builder.add_node("synthesizer", synthesizer_node)
    builder.add_node("human_review", human_review_node)

    # ── Entry point ───────────────────────────────────────────────────────────
    builder.add_edge(START, "supervisor")

    # ── Supervisor routes to specialist ───────────────────────────────────────
    builder.add_conditional_edges(
        "supervisor",
        route_to_agent,
        {
            "document_agent": "document_agent",
            "policy_agent": "policy_agent",
            "risk_agent": "risk_agent",
            "qa_agent": "qa_agent",
            "case_agent": "case_agent",
            "synthesizer": "synthesizer",
        },
    )

    # ── Specialists route to synthesizer ─────────────────────────────────────
    for agent in ["document_agent", "policy_agent", "risk_agent", "qa_agent", "case_agent"]:
        builder.add_edge(agent, "synthesizer")

    # ── Synthesizer checks for approval requirement ───────────────────────────
    builder.add_conditional_edges(
        "synthesizer",
        needs_approval,
        {
            "human_review": "human_review",
            END: END,
        },
    )

    builder.add_edge("human_review", END)

    # ── Compile with checkpointer ─────────────────────────────────────────────
    if use_memory_checkpointer:
        # Development: in-memory (no persistence across restarts)
        checkpointer = MemorySaver()
    else:
        # Production: PostgreSQL-backed checkpointer
        # from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
        # checkpointer = AsyncPostgresSaver.from_conn_string(settings.database_url)
        checkpointer = MemorySaver()

    return builder.compile(checkpointer=checkpointer)


# Singleton graph instance (initialized on module import)
compliance_graph = build_graph()
