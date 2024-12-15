from datetime import datetime, timedelta
import random

from .models import SensorData, Location
from .schemas import SensorDataCreate


class EnvironmentalDataGenerator:
    @classmethod
    def generate_sensor_data_for_period(
        cls,
        location_id: int,
        start_date: datetime,
        end_date: datetime
    ):
        """
        Генерує дані сенсора для певної локації за вказаний період
        """
        current_date = start_date
        sensor_data_list = []

        while current_date <= end_date:
            # Генеруємо дані для кожної години
            sensor_data = SensorDataCreate(
                sensor_id=f"sensor_{location_id}",
                location_id=location_id,
                timestamp=current_date,  # Встановлюємо поточний час у проміжку
                nitrogen_dioxide=round(random.uniform(20, 200), 2),
                sulfur_dioxide=round(random.uniform(50, 500), 2),
                carbon_monoxide=round(random.uniform(1, 30), 2),
                ozone=round(random.uniform(10, 120), 2),
                pm2_5=round(random.uniform(10, 100), 2),
                pm10=round(random.uniform(20, 150), 2),
                lead=round(random.uniform(0.01, 1.0), 4),
                cadmium=round(random.uniform(0.001, 0.5), 4),
                temperature=round(random.uniform(-5, 35), 1),
                humidity=round(random.uniform(30, 90), 1),
                wind_speed=round(random.uniform(0, 15), 1),
                wind_direction=round(random.uniform(0, 360), 1),
                radiation_level=round(random.uniform(0.1, 5), 2),
            )
            sensor_data_list.append(sensor_data)

            # Переходимо до наступної години
            current_date += timedelta(days=1)

        return sensor_data_list


def simulate_sensor_data_for_location(
    db,
    location_id: int,
    start_date: datetime,
    end_date: datetime
):
    """
    Симуляція даних для конкретної локації за певний період
    """
    # Перевіряємо, чи існує локація
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise ValueError(f"Location with id {location_id} not found")

    # Генеруємо дані для локації
    sensor_data_list = EnvironmentalDataGenerator.generate_sensor_data_for_period(
        location_id, start_date, end_date
    )

    # Зберігаємо згенеровані дані
    for sensor_data in sensor_data_list:
        db_sensor_data = SensorData(**sensor_data.dict())
        db.add(db_sensor_data)

    db.commit()
    return len(sensor_data_list)