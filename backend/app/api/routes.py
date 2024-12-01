from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import SessionLocal
from ..crud import create_sensor_data, get_sensor_data, save_sensor_data
from ..schemas import SensorDataCreate, SensorDataOut
from .sensor_simulation import generate_sensor_data

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/data", response_model=SensorDataOut)
def create_data(data: SensorDataCreate, db: Session = Depends(get_db)):
    return create_sensor_data(db, data)


@router.get("/data")
def read_data(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_sensor_data(db, skip=skip, limit=limit)


@router.post("/save")
def save_fake_data(db: Session = Depends(get_db)):
    data = generate_sensor_data()
    save_sensor_data(db, data)
    return {"status": "Data saved", "count": len(data)}
