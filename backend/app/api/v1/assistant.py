"""
AI Assistant API endpoints — chat interface backed by the LangGraph agent graph.
"""

import uuid
from typing import AsyncIterator
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
import json

from app.agents.graph import compliance_graph

router = APIRouter(prefix="/assistant", tags=["assistant"])


class ChatRequest(BaseModel):
    message: str
    thread_id: str | None = None
    organization_id: str = "org-default"
    user_id: str = "user-default"
    employee_context: dict | None = None


class ChatResponse(BaseModel):
    thread_id: str
    message: str
    agent_type: str | None = None
    citations: list[dict] = []


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a message to the compliance agent and get a response.

    The thread_id enables conversation continuity — pass the same thread_id
    to continue an existing conversation. The graph's PostgreSQL checkpointer
    stores the full conversation state across requests.
    """
    thread_id = request.thread_id or str(uuid.uuid4())

    config = {
        "configurable": {
            "thread_id": thread_id,
        }
    }

    initial_state = {
        "messages": [HumanMessage(content=request.message)],
        "user_id": request.user_id,
        "organization_id": request.organization_id,
        "employee_context": request.employee_context,
        "documents_analyzed": [],
        "compliance_findings": [],
        "risk_scores": {},
        "policy_updates": [],
        "case_statuses": [],
        "citations": [],
        "pending_approval": None,
        "approval_status": None,
        "next_agent": None,
    }

    try:
        result = await compliance_graph.ainvoke(initial_state, config=config)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")

    # Extract the last AI message
    last_message = result["messages"][-1]
    content = last_message.content if hasattr(last_message, "content") else str(last_message)

    return ChatResponse(
        thread_id=thread_id,
        message=content,
        agent_type=result.get("next_agent"),
        citations=result.get("citations", []),
    )


@router.get("/threads/{thread_id}/history")
async def get_thread_history(thread_id: str):
    """
    Retrieve the conversation history for a given thread.
    Uses the graph's checkpointer to load persisted state.
    """
    config = {"configurable": {"thread_id": thread_id}}
    try:
        state = await compliance_graph.aget_state(config)
        if not state:
            raise HTTPException(status_code=404, detail="Thread not found")

        messages = state.values.get("messages", [])
        return {
            "thread_id": thread_id,
            "messages": [
                {
                    "role": "user" if isinstance(m, HumanMessage) else "assistant",
                    "content": m.content,
                }
                for m in messages
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
