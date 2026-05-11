from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    profile_type: Mapped[str] = mapped_column(String(32))
    is_prosumer: Mapped[bool] = mapped_column(Boolean, default=False)
    solar_kwp: Mapped[float] = mapped_column(Float, default=0.0)

    records: Mapped[list["EnergyRecord"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class EnergyRecord(Base):
    __tablename__ = "energy_records"
    __table_args__ = (
        UniqueConstraint("user_id", "timestamp", name="uq_user_timestamp"),
        Index("ix_records_ts", "timestamp"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime)
    consumption_kwh: Mapped[float] = mapped_column(Float)
    generation_kwh: Mapped[float] = mapped_column(Float)
    net_grid_flow: Mapped[float] = mapped_column(Float)
    meter_import_kwh: Mapped[float] = mapped_column(Float)
    meter_export_kwh: Mapped[float] = mapped_column(Float)

    user: Mapped[User] = relationship(back_populates="records")
