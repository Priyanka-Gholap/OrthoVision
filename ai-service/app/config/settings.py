import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    AI_SERVICE_KEY: str = ""

    # Load configuration from environment variables or .env file in parent directory
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Post load validation
if not settings.AI_SERVICE_KEY:
    print("[WARN] AI_SERVICE_KEY environment variable is empty. API calls will fail security validation.")
