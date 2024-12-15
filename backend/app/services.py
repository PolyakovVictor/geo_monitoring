from datetime import datetime
import random

from .models import SensorData
from .schemas import SensorDataCreate


class EnvironmentalSensor:
    def generate_data(self, sensor_id: str, location: str):
        return SensorDataCreate(
            sensor_id=sensor_id,
            location=location,
            nitrogen_dioxide=round(random.uniform(0, 200), 2),
            sulfur_dioxide=round(random.uniform(0, 500), 2),
            carbon_monoxide=round(random.uniform(0, 30), 2),
            ozone=round(random.uniform(0, 120), 2),
            pm2_5=round(random.uniform(0, 100), 2),
            pm10=round(random.uniform(0, 150), 2),
            lead=round(random.uniform(0, 1), 4),
            cadmium=round(random.uniform(0, 0.5), 4),
            temperature=round(random.uniform(-10, 35), 1),
            humidity=round(random.uniform(20, 90), 1),
            wind_speed=round(random.uniform(0, 20), 1),
            wind_direction=round(random.uniform(0, 360), 1),
            radiation_level=round(random.uniform(0.1, 10), 2),
        )


class EnvironmentalDataGenerator:
    REGIONS = [
        "Київська",
        "Харківська",
        "Дніпропетровська",
        "Одеська",
        "Львівська",
        "Донецька",
        "Вінницька",
        "Запорізька",
        "Миколаївська",
    ]

    POLLUTION_PROFILES = {
        "Київська": {"base_pollution": 1.0, "industrial_impact": 0.8},
        "Харківська": {"base_pollution": 1.2, "industrial_impact": 1.1},
        "Дніпропетровська": {"base_pollution": 1.5, "industrial_impact": 1.5},
        "Донецька": {"base_pollution": 1.7, "industrial_impact": 1.7},
        # Інші регіони з різними профілями забруднення
    }

    @classmethod
    def generate_sensor_data(cls, region: str, timestamp: datetime) -> SensorDataCreate:
        profile = cls.POLLUTION_PROFILES.get(
            region, {"base_pollution": 1.0, "industrial_impact": 1.0}
        )

        return SensorDataCreate(
            sensor_id=f"{region}_sensor_{random.randint(1, 10)}",
            location=f"Промислова зона {region}",
            region=region,
            # Гази з врахуванням профілю забруднення
            nitrogen_dioxide=round(
                random.uniform(50, 250) * profile["industrial_impact"], 2
            ),
            sulfur_dioxide=round(
                random.uniform(100, 600) * profile["industrial_impact"], 2
            ),
            carbon_monoxide=round(random.uniform(5, 50) * profile["base_pollution"], 2),
            ozone=round(random.uniform(20, 150) * profile["base_pollution"], 2),
            # Дрібнодисперсні частинки
            pm2_5=round(random.uniform(20, 150) * profile["industrial_impact"], 2),
            pm10=round(random.uniform(50, 200) * profile["industrial_impact"], 2),
            # Важкі метали
            lead=round(random.uniform(0.1, 1.5) * profile["industrial_impact"], 4),
            cadmium=round(random.uniform(0.05, 0.7) * profile["industrial_impact"], 4),
            # Метеорологічні параметри
            temperature=round(random.uniform(-10, 35), 1),
            humidity=round(random.uniform(20, 90), 1),
            wind_speed=round(random.uniform(0, 20), 1),
            wind_direction=round(random.uniform(0, 360), 1),
            radiation_level=round(random.uniform(0.1, 10), 2),
        )


def simulate_sensor_data_with_regions(db):
    regions = [
        "Київська",
        "Харківська",
        "Дніпропетровська",
        "Одеська",
        "Львівська",
        "Донецька",
    ]

    for region in regions:
        sensor_data = SensorDataCreate(
            sensor_id=f"{region}_sensor_{random.randint(1, 10)}",
            location=f"Промислова зона {region}",
            region=region,
            # ... інші поля як раніше
        )
        # Збереження в базу
        db_sensor_data = SensorData(**sensor_data.dict())
        db.add(db_sensor_data)

    db.commit()
