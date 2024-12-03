from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..crud import create_sensor_data, get_sensor_data, save_sensor_data
from ..schemas import SensorDataCreate, SensorDataOut
from .sensor_simulation import generate_sensor_data
from ..models import EmissionData2
from ..db import get_db
from typing import List

router = APIRouter()


@router.post("/data", response_model=SensorDataOut)
def create_data(data: SensorDataCreate, db: Session = Depends(get_db)):
    return create_sensor_data(db, data)


@router.get("/data", response_model=List[SensorDataOut])
def read_data(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_sensor_data(db, skip=skip, limit=limit)


@router.post("/save")
def save_fake_data(db: Session = Depends(get_db)):
    data = generate_sensor_data(db)
    save_sensor_data(db, data)
    return {"status": "Data saved", "count": len(data)}


@router.post("/upload")
def upload_emission_data(data: list[dict], db: Session = Depends(get_db)):
    """
    Завантаження даних у базу.
    data: [{"region": "Регіон", "year": 2017, "emissions": 2584.9}, ...]
    """
    for item in data:
        db_entry = EmissionData2(**item)
        db.add(db_entry)
    db.commit()
    return {"status": "success"}


@router.get("/emissions")
def get_emission_data(db: Session = Depends(get_db)):
    """
    Отримання даних для фронтенду.
    """
    data = db.query(EmissionData2).all()
    return [
        {
            "region": row.region,
            "year": row.year,
            "emissions": row.emissions,
        }
        for row in data
    ]
