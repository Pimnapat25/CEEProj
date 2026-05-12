from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    typhoon_api_key: str
    typhoon_base_url: str = "https://api.opentyphoon.ai/v1"
    supabase_url: str
    supabase_service_role_key: str

    class Config:
        env_file = ".env"


settings = Settings()
