from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    dynamodb_table_name: str = "stardrop-users-dev"
    aws_region: str = "us-east-1"
    environment: str = "dev"
    cors_origins: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
