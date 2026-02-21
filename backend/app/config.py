from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    dynamodb_table_name: str = "stardrop-users-dev"
    dynamodb_sessions_table_name: str = "stardrop-sessions-dev"
    aws_region: str = "us-east-1"
    environment: str = "dev"
    cors_origins: str = "http://localhost:3000"
    github_app_id: str = ""
    github_app_private_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
