from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    anthropic_api_key: str = ""
    google_maps_api_key: str = ""
    openrouter_api_key: str = ""
    agent_mode: str = "mock"
    database_url: str = "postgresql+asyncpg://investmap:localdev@db:5432/investmap"
    redis_url: str = "redis://redis:6379"

settings = Settings()
