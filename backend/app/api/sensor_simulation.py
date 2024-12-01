import random
from datetime import datetime
from fastapi import APIRouter, Depends
from typing import List
from ..schemas import SensorData, SensorDataBase
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import SensorDataModel


router = APIRouter()


# Попередньо визначені райони
REGIONS = [
    "Industrial Zone A",
    "Industrial Zone B",
    "Residential Zone C",
    "Commercial Zone D",
]


def generate_sensor_data(db: Session):
    pollutants = ["PM2.5", "PM10", "SO2", "NO2", "CO", "O3"]
    sensor_ids = [f"sensor_{i}" for i in range(1, 11)]

    for _ in range(100):  # Генеруємо 100 записів
        data = SensorDataModel(
            sensor_id=random.choice(sensor_ids),
            pollutant=random.choice(pollutants),
            value=round(random.uniform(10, 300), 2),
            timestamp=datetime.utcnow(),
            region=random.choice(REGIONS),  # Додаємо випадковий район
        )
        db.add(data)
    db.commit()


# Ендпоінт для отримання даних датчиків
@router.get("/sensors")
def get_fake_sensor_data(db: Session = Depends(get_db)):
    """
    Повертає імітовані дані від датчиків.
    """
    return generate_sensor_data(db)


@router.get("/regions", response_model=any)
def get_data_by_region(db: Session = Depends(get_db)):
    data = db.query(
        SensorDataModel.region,
        SensorDataModel.pollutant,
        SensorDataModel.value,
        SensorDataModel.timestamp,
    ).all()
    result = {}

    if not data:  # Якщо даних немає
        return []  # Повертаємо пустий список

    for record in data:
        region = record.region
        if region not in result:
            result[region] = []
        result[region].append(
            {
                "pollutant": record.pollutant,
                "value": record.value,
                "timestamp": record.timestamp,
            }
        )

    return [{"region": key, "data": values} for key, values in result.items()]
