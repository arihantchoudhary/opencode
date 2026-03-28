from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    dynamodb_table_name: str = "stardrop-users-dev"
    dynamodb_sessions_table_name: str = "stardrop-sessions-dev"
    aws_region: str = "us-east-1"
    environment: str = "dev"
    cors_origins: str = "http://localhost:3000"
    github_app_id: str = ""
    github_app_private_key: str = ""
    twitter_bearer_token: str = ""
    twitter_access_token: str = ""
    twitter_access_token_secret: str = ""
    twitter_api_key: str = ""
    twitter_api_key_secret: str = ""
    twitter_oauth2_client_id: str = ""
    twitter_oauth2_client_secret: str = ""
    dynamodb_tweets_table_name: str = "stardrop-tweets-dev"
    twitter_cache_ttl_minutes: int = 15

    class Config:
        env_file = ".env"


settings = Settings()
