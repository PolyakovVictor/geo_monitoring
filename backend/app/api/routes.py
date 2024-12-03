from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..crud import create_sensor_data, get_sensor_data, save_sensor_data
from ..schemas import SensorDataCreate, SensorDataOut
from .sensor_simulation import generate_sensor_data
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
