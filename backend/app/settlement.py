"""Mid-Price (Középár) settlement service.

Hourly loop:
  1. Aggregate per-user 15-min records into hourly imports/exports (from net_grid_flow).
  2. Community supply = sum of exports. Community demand = sum of imports.
  3. Pro-rata allocate shared community energy to deficit (importing) members.
  4. Bill shared energy at community price; residual at grid buy/sell.
  5. Compute savings per user vs baseline.
"""

from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Iterable

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .config import settings
from .models import EnergyRecord, User


@dataclass
class UserHourAgg:
    user_id: int
    name: str
    is_prosumer: bool
    hour: datetime
    consumption: float = 0.0
    generation: float = 0.0

    @property
    def net(self) -> float:
        # positive = import from grid (or community); negative = export
        return self.consumption - self.generation

    @property
    def import_kwh(self) -> float:
        return max(self.net, 0.0)

    @property
    def export_kwh(self) -> float:
        return max(-self.net, 0.0)


@dataclass
class UserTotals:
    user_id: int
    name: str
    is_prosumer: bool
    consumption_kwh: float = 0.0
    generation_kwh: float = 0.0
    import_kwh: float = 0.0
    export_kwh: float = 0.0
    community_purchased_kwh: float = 0.0
    community_sold_kwh: float = 0.0
    grid_purchased_kwh: float = 0.0
    grid_sold_kwh: float = 0.0
    baseline_cost_ft: float = 0.0
    community_cost_ft: float = 0.0

    @property
    def savings_ft(self) -> float:
        return self.baseline_cost_ft - self.community_cost_ft

    @property
    def prosumer_profit_increment_ft(self) -> float:
        # Extra income from selling into community (22.5) vs grid (5) per kWh.
        return self.community_sold_kwh * (settings.community_price - settings.grid_sell_price)


@dataclass
class HourlyTotals:
    hour: datetime
    community_supply_kwh: float = 0.0
    community_demand_kwh: float = 0.0
    shared_kwh: float = 0.0
    baseline_ft: float = 0.0
    community_ft: float = 0.0

    @property
    def self_sufficiency_pct(self) -> float:
        if self.community_demand_kwh <= 0:
            return 0.0
        return min(self.shared_kwh / self.community_demand_kwh, 1.0) * 100.0

    @property
    def savings_ft(self) -> float:
        return self.baseline_ft - self.community_ft


def _floor_hour(ts: datetime) -> datetime:
    return ts.replace(minute=0, second=0, microsecond=0)


def _aggregate_hourly(
    db: Session, start: datetime | None, end: datetime | None
) -> tuple[dict[int, User], dict[tuple[datetime, int], UserHourAgg]]:
    users = {u.id: u for u in db.scalars(select(User)).all()}

    stmt = select(EnergyRecord)
    if start is not None:
        stmt = stmt.where(EnergyRecord.timestamp >= start)
    if end is not None:
        stmt = stmt.where(EnergyRecord.timestamp < end)

    by_hour: dict[tuple[datetime, int], UserHourAgg] = {}
    for rec in db.scalars(stmt).all():
        hour = _floor_hour(rec.timestamp)
        key = (hour, rec.user_id)
        u = users[rec.user_id]
        agg = by_hour.get(key)
        if agg is None:
            agg = UserHourAgg(
                user_id=u.id, name=u.name, is_prosumer=u.is_prosumer, hour=hour
            )
            by_hour[key] = agg
        agg.consumption += rec.consumption_kwh
        agg.generation += rec.generation_kwh
    return users, by_hour


def compute_settlement(
    db: Session,
    start: datetime | None = None,
    end: datetime | None = None,
) -> dict:
    users, by_hour = _aggregate_hourly(db, start, end)

    per_hour: dict[datetime, list[UserHourAgg]] = defaultdict(list)
    for (hour, _uid), agg in by_hour.items():
        per_hour[hour].append(agg)

    totals: dict[int, UserTotals] = {
        u.id: UserTotals(user_id=u.id, name=u.name, is_prosumer=u.is_prosumer)
        for u in users.values()
    }
    hourly_points: list[HourlyTotals] = []

    gb = settings.grid_buy_price
    gs = settings.grid_sell_price
    cp = settings.community_price

    for hour in sorted(per_hour.keys()):
        rows = per_hour[hour]
        supply = sum(r.export_kwh for r in rows)
        demand = sum(r.import_kwh for r in rows)
        shared = min(supply, demand)
        point = HourlyTotals(hour=hour, community_supply_kwh=supply, community_demand_kwh=demand, shared_kwh=shared)

        for r in rows:
            t = totals[r.user_id]
            t.consumption_kwh += r.consumption
            t.generation_kwh += r.generation
            t.import_kwh += r.import_kwh
            t.export_kwh += r.export_kwh

            baseline = r.import_kwh * gb - r.export_kwh * gs
            t.baseline_cost_ft += baseline
            point.baseline_ft += baseline

        # Pro-rata allocation
        if shared > 0:
            if demand > 0:
                demand_share = {r.user_id: (r.import_kwh / demand) for r in rows if r.import_kwh > 0}
            else:
                demand_share = {}
            if supply > 0:
                supply_share = {r.user_id: (r.export_kwh / supply) for r in rows if r.export_kwh > 0}
            else:
                supply_share = {}

            for r in rows:
                allocated_buy = shared * demand_share.get(r.user_id, 0.0)
                allocated_sell = shared * supply_share.get(r.user_id, 0.0)
                t = totals[r.user_id]
                t.community_purchased_kwh += allocated_buy
                t.community_sold_kwh += allocated_sell
                residual_import = r.import_kwh - allocated_buy
                residual_export = r.export_kwh - allocated_sell
                t.grid_purchased_kwh += residual_import
                t.grid_sold_kwh += residual_export
                cost = allocated_buy * cp - allocated_sell * cp + residual_import * gb - residual_export * gs
                t.community_cost_ft += cost
                point.community_ft += cost
        else:
            for r in rows:
                t = totals[r.user_id]
                t.grid_purchased_kwh += r.import_kwh
                t.grid_sold_kwh += r.export_kwh
                cost = r.import_kwh * gb - r.export_kwh * gs
                t.community_cost_ft += cost
                point.community_ft += cost

        hourly_points.append(point)

    total_baseline = sum(t.baseline_cost_ft for t in totals.values())
    total_community = sum(t.community_cost_ft for t in totals.values())
    total_demand = sum(p.community_demand_kwh for p in hourly_points)
    total_shared = sum(p.shared_kwh for p in hourly_points)
    sss = (total_shared / total_demand * 100.0) if total_demand > 0 else 0.0

    per_user = [
        {
            "user_id": t.user_id,
            "name": t.name,
            "is_prosumer": t.is_prosumer,
            "consumption_kwh": round(t.consumption_kwh, 4),
            "generation_kwh": round(t.generation_kwh, 4),
            "import_kwh": round(t.import_kwh, 4),
            "export_kwh": round(t.export_kwh, 4),
            "community_purchased_kwh": round(t.community_purchased_kwh, 4),
            "community_sold_kwh": round(t.community_sold_kwh, 4),
            "grid_purchased_kwh": round(t.grid_purchased_kwh, 4),
            "grid_sold_kwh": round(t.grid_sold_kwh, 4),
            "baseline_cost_ft": round(t.baseline_cost_ft, 2),
            "community_cost_ft": round(t.community_cost_ft, 2),
            "savings_ft": round(t.savings_ft, 2),
            "prosumer_profit_increment_ft": round(t.prosumer_profit_increment_ft, 2),
        }
        for t in sorted(totals.values(), key=lambda x: x.name)
    ]
    hourly = [
        {
            "hour": p.hour,
            "community_supply_kwh": round(p.community_supply_kwh, 4),
            "community_demand_kwh": round(p.community_demand_kwh, 4),
            "self_sufficiency_pct": round(p.self_sufficiency_pct, 2),
            "baseline_total_ft": round(p.baseline_ft, 2),
            "community_total_ft": round(p.community_ft, 2),
            "savings_ft": round(p.savings_ft, 2),
        }
        for p in hourly_points
    ]

    return {
        "start": start,
        "end": end,
        "total_baseline_ft": round(total_baseline, 2),
        "total_community_ft": round(total_community, 2),
        "total_savings_ft": round(total_baseline - total_community, 2),
        "self_sufficiency_pct": round(sss, 2),
        "users": per_user,
        "hourly": hourly,
    }
