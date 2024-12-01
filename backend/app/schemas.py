from pydantic import BaseModel
from datetime import datetime


class SensorDataCreate(BaseModel):
    sensor_id: str
    pollutant: str
    value: float


class SensorDataOut(SensorDataCreate):
    timestamp: datetime


class SensorData(BaseModel):
    sensor_id: str
    pollutant: str
    value: float
    timestamp: datetime


class SensorDataBase(BaseModel):
    sensor_id: str
    pollutant: str
    value: float
    timestamp: datetime
    region: str  # Нове поле

    class Config:
        orm_mode = True
