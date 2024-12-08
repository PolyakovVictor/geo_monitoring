from pydantic import BaseModel
from datetime import datetime


# Pydantic моделі для валідації
class SensorDataCreate(BaseModel):
    sensor_id: str
    location: str

    # Гази
    nitrogen_dioxide: float
    sulfur_dioxide: float
    carbon_monoxide: float
    ozone: float

    # Дрібнодисперсні частинки
    pm2_5: float
    pm10: float

    # Важкі метали
    lead: float
    cadmium: float

    # Метеорологічні параметри
    temperature: float
    humidity: float
    wind_speed: float
    wind_direction: float

    # Радіація
    radiation_level: float


class SensorDataResponse(SensorDataCreate):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True
