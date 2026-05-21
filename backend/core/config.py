from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    anthropic_api_key: str = ""
    google_maps_api_key: str = ""
    agent_mode: str = "mock"
    database_url: str = "postgresql+asyncpg://investmap:localdev@db:5432/investmap"
    redis_url: str = "redis://redis:6379"

    class Config:
        env_file = ".env"

settings = Settings()
