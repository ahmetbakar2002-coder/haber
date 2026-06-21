from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    DATABASE_URL: str
    RABBITMQ_URL: str
    REDIS_URL: str
    
    API_FOOTBALL_KEY: str = ""
    SPORTMONKS_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
