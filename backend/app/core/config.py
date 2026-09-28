"""
Central configuration for the backend.
All environment-specific values (DB credentials, etc.) come from .env — never hardcode them here.
"""
import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = "Capstone Group 20 - Business Sales Forecasting API"
    API_V1_PREFIX: str = "/api/v1"

    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "5432")
    DB_NAME: str = os.getenv("DB_NAME", "capstone_db")
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")

    USE_MOCK_DATA: bool = os.getenv("USE_MOCK_DATA", "true").lower() == "true"

    @property
    def DATABASE_URL(self) -> str:
        # quote_plus safely encodes special characters (like @) in the password
        safe_password = quote_plus(self.DB_PASSWORD)
        return (
            f"postgresql://{self.DB_USER}:{safe_password}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )


settings = Settings()