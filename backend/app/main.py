from datetime import datetime

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import delete, func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from .models import EnergyRecord, User
from .schemas import (
    DataRangeOut,
    IngestResponse,
    SettlementResponse,
    UserOut,
    WebhookPayload,
)
from .seed import HARDCODED_USERS, ensure_seed
from .settlement import compute_settlement

app = FastAPI(title="Energy Community MVP", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,
)


@app.on_event("startup")
def _startup() -> None:
    from .database import SessionLocal

    with SessionLocal() as db:
        ensure_seed(db)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.scalars(select(User).order_by(User.name)).all()


@app.get("/api/data-range", response_model=DataRangeOut)
def data_range(db: Session = Depends(get_db)):
    first = db.scalar(select(func.min(EnergyRecord.timestamp)))
    last = db.scalar(select(func.max(EnergyRecord.timestamp)))
    count = db.scalar(select(func.count(EnergyRecord.id))) or 0
    return DataRangeOut(first=first, last=last, record_count=count)


@app.get("/api/settlement", response_model=SettlementResponse)
def settlement(
    start: datetime | None = Query(default=None),
    end: datetime | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return compute_settlement(db, start=start, end=end)


@app.post("/api/data-drop")
def data_drop(db: Session = Depends(get_db)):
    """Truncate energy_records (users remain so the community is preserved)."""
    db.execute(delete(EnergyRecord))
    db.commit()
    return {"status": "dropped"}


@app.post("/webhook/powermocker", response_model=IngestResponse)
def ingest_powermocker(payload: WebhookPayload, db: Session = Depends(get_db)):
    if payload.type != "batch_update":
        raise HTTPException(status_code=400, detail=f"Unsupported type: {payload.type}")

    users_by_name = {u.name: u.id for u in db.scalars(select(User)).all()}
    missing = set()
    rows = []
    for rec in payload.data:
        uid = users_by_name.get(rec.house_id)
        if uid is None:
            missing.add(rec.house_id)
            continue
        try:
            ts = datetime.fromisoformat(rec.timestamp.replace("Z", "+00:00"))
        except ValueError:
            continue
        if ts.tzinfo is not None:
            ts = ts.replace(tzinfo=None)
        rows.append(
            {
                "user_id": uid,
                "timestamp": ts,
                "consumption_kwh": rec.consumption_kwh,
                "generation_kwh": rec.generation_kwh,
                "net_grid_flow": rec.net_grid_flow,
                "meter_import_kwh": rec.meter_import_kwh,
                "meter_export_kwh": rec.meter_export_kwh,
            }
        )

    inserted = 0
    if rows:
        stmt = pg_insert(EnergyRecord).values(rows)
        stmt = stmt.on_conflict_do_nothing(index_elements=["user_id", "timestamp"])
        result = db.execute(stmt)
        inserted = result.rowcount or 0
        db.commit()

    return IngestResponse(
        received=len(payload.data),
        inserted=inserted,
        skipped=len(payload.data) - inserted,
    )
