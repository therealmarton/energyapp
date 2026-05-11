from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import User


HARDCODED_USERS = [
    # name, profile_type, is_prosumer, solar_kwp
    ("Haz_1_Idos", "elderly", False, 0.0),
    ("Haz_2_Csalad", "family", False, 0.0),
    ("Haz_3_Egyedul", "single", False, 0.0),
    ("Haz_4_Solar_Idos", "elderly", True, 3.5),
    ("Haz_5_Solar_Csalad", "family", True, 6.0),
    ("Haz_6_Solar_Egyedul", "single", True, 4.0),
]


def ensure_seed(db: Session) -> None:
    existing = {u.name for u in db.scalars(select(User)).all()}
    created = False
    for name, profile, prosumer, kwp in HARDCODED_USERS:
        if name in existing:
            continue
        db.add(User(name=name, profile_type=profile, is_prosumer=prosumer, solar_kwp=kwp))
        created = True
    if created:
        db.commit()
