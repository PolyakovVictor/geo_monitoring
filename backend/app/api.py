from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .models import SensorData
from .schemas import SensorDataCreate, SensorDataResponse
from .services import EnvironmentalSensor
from .db import get_db
from typing import List

router = APIRouter()


# Ендпоінт для збереження даних від сенсора
@router.post("/sensor-data/", response_model=SensorDataResponse)
def create_sensor_data(sensor_data: SensorDataCreate, db: Session = Depends(get_db)):
    db_sensor_data = SensorData(**sensor_data.dict())
    db.add(db_sensor_data)
    db.commit()
    db.refresh(db_sensor_data)
    return db_sensor_data


# Ендпоінт для отримання останніх записів
@router.get("/sensor-data/", response_model=List[SensorDataResponse])
def read_sensor_data(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    sensor_data = db.query(SensorData).offset(skip).limit(limit).all()
    return sensor_data


# Ендпоінт для отримання даних по конкретному сенсору
@router.get("/sensor-data/{sensor_id}", response_model=List[SensorDataResponse])
def read_sensor_data_by_id(
    sensor_id: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    sensor_data = (
        db.query(SensorData)
        .filter(SensorData.sensor_id == sensor_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return sensor_data


# Ендпоінт для симуляції надходження даних від сенсора
@router.post("/simulate-sensor/")
def simulate_sensor_data(
    sensor_id: str = "KYV_IND_001",
    location: str = "Промислова зона Київ",
    db: Session = Depends(get_db),
):
    sensor = EnvironmentalSensor()
    sensor_data = sensor.generate_data(sensor_id, location)

    db_sensor_data = SensorData(**sensor_data.dict())
    db.add(db_sensor_data)
    db.commit()
    db.refresh(db_sensor_data)

    return {"status": "Дані симульовано та збережено", "sensor_id": sensor_id}


# Додаткові корисні ендпоінти
@router.get("/sensor-stats/")
def get_sensor_stats(db: Session = Depends(get_db)):
    total_records = db.query(SensorData).count()
    unique_sensors = db.query(SensorData.sensor_id.distinct()).count()

    return {"total_records": total_records, "unique_sensors": unique_sensors}
