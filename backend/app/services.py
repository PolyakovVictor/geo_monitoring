import random
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
