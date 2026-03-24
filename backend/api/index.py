"""
Vercel serverless entry point.

Vercel looks for a FastAPI `app` instance in api/index.py when the
project root is set to the `backend/` directory.
"""

from app.main import app  # re-export the FastAPI app

__all__ = ["app"]
