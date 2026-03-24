"""
Celery application — background task queue for scheduled agent runs.

Tasks:
  - poll_case_statuses: Daily USCIS case status polling for all active cases
  - check_deadlines:    Daily deadline engine — generates alerts for approaching expirations
  - monitor_policies:  Daily regulatory monitoring (USCIS/DOL/Federal Register)
  - recalculate_risk:  Weekly compliance score recalculation for all organizations
"""

from celery import Celery
from celery.schedules import crontab

from app.config import settings

celery_app = Celery(
    "immicompliant",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/New_York",
    enable_utc=True,
    # Beat schedule — runs on the worker with `--beat` flag or a separate beat service
    beat_schedule={
        "poll-case-statuses-daily": {
            "task": "app.tasks.tasks.poll_case_statuses",
            "schedule": crontab(hour=6, minute=0),  # 6am ET daily
        },
        "check-deadlines-daily": {
            "task": "app.tasks.tasks.check_deadlines",
            "schedule": crontab(hour=7, minute=0),  # 7am ET daily
        },
        "monitor-policies-daily": {
            "task": "app.tasks.tasks.monitor_policies",
            "schedule": crontab(hour=8, minute=0),  # 8am ET daily
        },
        "recalculate-risk-weekly": {
            "task": "app.tasks.tasks.recalculate_risk_scores",
            "schedule": crontab(day_of_week=1, hour=9, minute=0),  # Monday 9am ET
        },
    },
)
