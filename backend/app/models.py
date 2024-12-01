from sqlalchemy import Column, Integer, String, Float, DateTime
from .db import Base


class SensorDataModel(Base):
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String, index=True)
    pollutant = Column(String)
    value = Column(Float)
    timestamp = Column(DateTime)
    region = Column(String)  # Нове поле для району
