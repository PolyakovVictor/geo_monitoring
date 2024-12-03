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


class EmissionData(Base):
    __tablename__ = "emission_data"

    id = Column(Integer, primary_key=True, index=True)
    region = Column(String, index=True)  # Регіон
    city = Column(String, nullable=True)  # Місто (може бути пустим)
    year = Column(Integer)  # Рік
    emissions = Column(Float)  # Кількість викидів (тис. т)
