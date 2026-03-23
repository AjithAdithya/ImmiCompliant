# ImmiCompliant

AI-powered immigration compliance platform for small and medium businesses.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | FastAPI (Python) + LangGraph multi-agent system |
| LLM | Claude (Anthropic SDK) via LangGraph |
| Database | PostgreSQL 16 + pgvector (for RAG) |
| Queue | Celery + Redis |
| Storage | AWS S3 |

## Getting Started

### Frontend only (fastest)

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### Full stack with Docker

```bash
# Copy and configure environment variables
cp backend/.env.example backend/.env
# Add your ANTHROPIC_API_KEY to backend/.env

docker-compose up
# Frontend: http://localhost:3000
# API docs: http://localhost:8000/api/docs
```

### Backend only

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your ANTHROPIC_API_KEY

uvicorn app.main:app --reload --port 8000
```

## Project Structure

```
ImmiCompliant/
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   └── layout/         # Sidebar, Header, DashboardLayout
│   │   ├── lib/
│   │   │   ├── types.ts        # TypeScript type definitions
│   │   │   ├── utils.ts        # Utility functions
│   │   │   └── mock-data.ts    # Realistic demo data
│   │   └── pages/              # All application pages
│   └── package.json
│
├── backend/                    # FastAPI + LangGraph backend
│   └── app/
│       ├── agents/
│       │   ├── graph.py        # LangGraph graph definition
│       │   ├── state.py        # ComplianceState TypedDict
│       │   ├── supervisor.py   # Router/orchestrator agent
│       │   ├── qa_agent.py     # Q&A with citations
│       │   ├── document_agent.py # I-9, LCA validation
│       │   ├── risk_agent.py   # Compliance scoring
│       │   ├── policy_agent.py # Regulatory monitoring
│       │   └── case_agent.py   # USCIS case tracking
│       ├── api/v1/
│       │   └── assistant.py    # Chat API endpoints
│       ├── config.py
│       └── main.py
│
└── docker-compose.yml
```

## LangGraph Agent Architecture

```
[User Request]
      │
      ▼
[Supervisor Agent]  ─── classifies intent, routes to specialist
      │
      ├── document_agent  ─── I-9 validation, LCA/PAF analysis
      ├── policy_agent    ─── USCIS/DOL regulatory monitoring
      ├── risk_agent      ─── compliance scoring, audit readiness
      ├── qa_agent        ─── Q&A with 8 CFR / INA / USCIS Policy Manual citations
      └── case_agent      ─── USCIS case status API integration
              │
              ▼
      [Synthesizer]  ─── formats final response
              │
     (needs approval?)
              │
      [Human Review]  ─── interrupt() pauses for critical decisions
```

## Features

- **Employee Dashboard** — visa type, status, expiration tracking for all foreign nationals
- **Case Management** — H-1B, L-1, O-1, TN, OPT, Green Card cases with full timeline
- **I-9 Audit Readiness** — bulk validation, error detection, mock audit simulation
- **PAF Management** — per-LCA checklists, completeness scoring, audit export
- **Policy Monitoring** — USCIS, DOL, ICE, DOS regulatory update tracking
- **Risk Assessment** — organization compliance score with remediation priorities
- **AI Assistant** — immigration Q&A with regulatory citations (powered by LangGraph + Claude)
- **Reports & Analytics** — compliance trends, visa distribution, case volume

## Notes

This is a compliance assistance tool, not a substitute for qualified immigration legal counsel.
Always consult licensed immigration attorneys for decisions affecting employee work authorization.
