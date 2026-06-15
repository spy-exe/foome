from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuração da aplicação, lida de variáveis de ambiente / .env."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Banco
    database_url: str = "postgresql+psycopg2://foome:foome@db:5432/foome"

    # Auth / JWT
    jwt_secret: str = "troque-este-segredo-em-producao"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24          # 1 dia
    refresh_token_expire_minutes: int = 60 * 24 * 30    # 30 dias

    # App
    project_name: str = "Foome API"
    cors_origins: list[str] = ["*"]


settings = Settings()
