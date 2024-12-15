from pydantic import BaseModel
from datetime import datetime


class SensorDataCreate(BaseModel):
    sensor_id: str
    location: str
    region: str

    # Повторюємо всі поля з моделі SensorData
    nitrogen_dioxide: float
    sulfur_dioxide: float
    carbon_monoxide: float
    ozone: float

    pm2_5: float
    pm10: float

    lead: float
    cadmium: float

    temperature: float
    humidity: float
    wind_speed: float
    wind_direction: float
    radiation_level: float


class SensorDataResponse(SensorDataCreate):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True
