from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from .db import Base


# Модель бази даних
class SensorData(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String, index=True)
    location = Column(String)
    region = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # Основні показники забруднення
    nitrogen_dioxide = Column(Float)
    sulfur_dioxide = Column(Float)
    carbon_monoxide = Column(Float)
    ozone = Column(Float)

    # Дрібнодисперсні частинки
    pm2_5 = Column(Float)
    pm10 = Column(Float)

    # Важкі метали
    lead = Column(Float)
    cadmium = Column(Float)

    # Додаткові параметри
    temperature = Column(Float)
    humidity = Column(Float)
    wind_speed = Column(Float)
    wind_direction = Column(Float)
    radiation_level = Column(Float)
