"""
ImmiCompliant FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.v1.assistant import router as assistant_router

app = FastAPI(
    title=settings.app_name,
    description="AI-powered immigration compliance platform for SMBs — powered by LangGraph",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS — localhost in dev, Vercel frontend URL in production
# Set FRONTEND_URL env var on Railway to your Vercel deployment URL
_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]
if settings.frontend_url:
    _origins.append(settings.frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routers
app.include_router(assistant_router, prefix=settings.api_v1_prefix)


@app.get("/health")
async def health():
    return {"status": "ok", "service": settings.app_name}


@app.get("/")
async def root():
    return {
        "message": "ImmiCompliant API",
        "docs": "/api/docs",
        "version": "0.1.0",
    }
