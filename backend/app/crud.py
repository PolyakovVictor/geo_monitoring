from sqlalchemy.orm import Session
from .models import SensorData
from .schemas import SensorDataCreate


def create_sensor_data(db: Session, data: SensorDataCreate):
    sensor_data = SensorData(**data.dict())
    db.add(sensor_data)
    db.commit()
    db.refresh(sensor_data)
    return sensor_data


def get_sensor_data(db: Session, skip: int = 0, limit: int = 100):
    return db.query(SensorData).offset(skip).limit(limit).all()
