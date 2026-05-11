from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://energy:energy@localhost:5433/energy_community"
    grid_buy_price: float = 40.0
    grid_sell_price: float = 5.0
    community_price: float = 22.5
    cors_origins: str = "http://localhost:5173"


settings = Settings()
