import random
from datetime import datetime
from fastapi import APIRouter
from typing import List
from ..schemas import SensorData

router = APIRouter()


# Список імітованих датчиків
SENSORS = ["sensor_1", "sensor_2", "sensor_3", "sensor_4"]
POLLUTANTS = ["CO2", "NO2", "SO2", "PM2.5"]


# Функція для генерації випадкових даних
def generate_sensor_data() -> List[SensorData]:
    data = []
    for sensor_id in SENSORS:
        pollutant = random.choice(POLLUTANTS)
        value = round(random.uniform(0.1, 500), 2)  # Значення в межах
        timestamp = datetime.now()
        data.append(
            SensorData(
                sensor_id=sensor_id,
                pollutant=pollutant,
                value=value,
                timestamp=timestamp,
            )
        )
    return data


# Ендпоінт для отримання даних датчиків
@router.get("/sensors", response_model=List[SensorData])
def get_fake_sensor_data():
    """
    Повертає імітовані дані від датчиків.
    """
    return generate_sensor_data()
