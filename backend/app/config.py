from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    app_name: str = "ImmiCompliant API"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/immicompliant"

    # Redis / Celery
    redis_url: str = "redis://localhost:6379/0"

    # Auth
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 8  # 8 hours

    # Anthropic / LangGraph
    anthropic_api_key: str = ""
    langsmith_api_key: str = ""
    langsmith_tracing: bool = False

    # AWS S3 (document storage)
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "us-east-1"
    s3_bucket_name: str = "immicompliant-docs"

    # USCIS API
    uscis_api_key: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
