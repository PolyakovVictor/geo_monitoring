from pydantic import BaseModel
from datetime import datetime


class SensorDataBase(BaseModel):
    sensor_id: str
    pollutant: str
    value: float
    timestamp: datetime
    region: str

    class Config:
        orm_mode = True


class SensorDataCreate(BaseModel):
    sensor_id: str
    pollutant: str
    value: float
    region: str  # Поле для вказання району


class SensorDataOut(SensorDataBase):
    id: int  # Додаємо поле для ідентифікатора
