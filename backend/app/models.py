from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .db import Base


class SensorData(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String, index=True)
    location_id = Column(Integer, ForeignKey('locations.id'), index=True)
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

    location_obj = relationship("Location", back_populates="sensor_data")


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    sensor_data = relationship("SensorData", back_populates="location_obj")
