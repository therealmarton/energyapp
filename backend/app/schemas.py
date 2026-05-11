from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class WebhookRecord(BaseModel):
    timestamp: str
    house_id: str
    profile: str | None = None
    consumption_kwh: float
    generation_kwh: float
    net_grid_flow: float
    meter_import_kwh: float = 0.0
    meter_export_kwh: float = 0.0


class WebhookPayload(BaseModel):
    type: str = Field(default="batch_update")
    data: list[WebhookRecord]


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    profile_type: str
    is_prosumer: bool
    solar_kwp: float


class PerUserSettlement(BaseModel):
    user_id: int
    name: str
    is_prosumer: bool
    consumption_kwh: float
    generation_kwh: float
    import_kwh: float
    export_kwh: float
    # Baseline (grid only)
    baseline_cost_ft: float
    # Community model
    community_purchased_kwh: float  # energy bought at community price
    community_sold_kwh: float       # energy sold to community at community price
    grid_purchased_kwh: float       # residual import from grid
    grid_sold_kwh: float            # residual export to grid
    community_cost_ft: float
    savings_ft: float
    prosumer_profit_increment_ft: float  # extra revenue vs selling at 5 Ft


class HourlyPoint(BaseModel):
    hour: datetime
    community_supply_kwh: float
    community_demand_kwh: float
    self_sufficiency_pct: float
    baseline_total_ft: float
    community_total_ft: float
    savings_ft: float


class SettlementResponse(BaseModel):
    start: datetime | None
    end: datetime | None
    total_baseline_ft: float
    total_community_ft: float
    total_savings_ft: float
    self_sufficiency_pct: float
    users: list[PerUserSettlement]
    hourly: list[HourlyPoint]


class DataRangeOut(BaseModel):
    first: datetime | None
    last: datetime | None
    record_count: int


class IngestResponse(BaseModel):
    received: int
    inserted: int
    skipped: int
