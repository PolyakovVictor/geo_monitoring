from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class LocationBase(BaseModel):
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class LocationCreate(LocationBase):
    pass


class LocationResponse(LocationBase):
    id: int

    class Config:
        orm_mode = True


class SensorDataCreate(BaseModel):
    sensor_id: str
    location_id: int
    timestamp: datetime

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
    location: LocationResponse

    class Config:
        orm_mode = True
