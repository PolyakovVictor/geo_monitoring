import datetime
import random
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from .models import SensorData
from .schemas import SensorDataCreate, SensorDataResponse
from .services import (
    EnvironmentalDataGenerator,
    EnvironmentalSensor,
    simulate_sensor_data_with_regions,
)
from .db import get_db
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

router = APIRouter()


def query_to_dict(query_result) -> List[dict]:
    return [
        {
            "date": row.date,
            "avg_nitrogen_dioxide": row.avg_nitrogen_dioxide,
            "avg_sulfur_dioxide": row.avg_sulfur_dioxide,
            "avg_pm2_5": row.avg_pm2_5,
            "avg_pm10": row.avg_pm10,
            "avg_lead": row.avg_lead,
            "avg_radiation": row.avg_radiation,
        }
        for row in query_result
    ]


@router.get("/sensor-data/region-pollution/")
def get_region_pollution(
    region: str,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    def parse_date(date_string: str) -> datetime:
        """Tries to parse date in multiple formats."""
        formats = ["%d-%m-%Y", "%m-%d-%Y", "%Y-%m-%d"]
        for fmt in formats:
            try:
                return datetime.strptime(date_string, fmt)
            except ValueError:
                continue
        raise ValueError(f"Invalid date format, expected one of {formats}")

    # Встановлення діапазону дат, якщо не вказано
    if start_date:
        try:
            start_date = parse_date(start_date)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid start_date format. Expected DD-MM-YYYY, MM-DD-YYYY, or YYYY-MM-DD.",
            )
    else:
        start_date = datetime.now() - timedelta(days=365)

    if end_date:
        try:
            end_date = parse_date(end_date)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid end_date format. Expected DD-MM-YYYY, MM-DD-YYYY, or YYYY-MM-DD.",
            )
    else:
        end_date = datetime.now()

    # Агрегація даних по забрудненню для регіону
    pollution_data = (
        db.query(
            func.date_trunc("day", SensorData.timestamp).label("date"),
            func.avg(SensorData.nitrogen_dioxide).label("avg_nitrogen_dioxide"),
            func.avg(SensorData.sulfur_dioxide).label("avg_sulfur_dioxide"),
            func.avg(SensorData.pm2_5).label("avg_pm2_5"),
            func.avg(SensorData.pm10).label("avg_pm10"),
            func.avg(SensorData.lead).label("avg_lead"),
            func.avg(SensorData.radiation_level).label("avg_radiation"),
        )
        .filter(
            SensorData.region == region,
            SensorData.timestamp.between(start_date, end_date),
        )
        .group_by(func.date_trunc("day", SensorData.timestamp))
        .order_by("date")
        .all()
    )

    # Convert query result to a list of dictionaries
    return query_to_dict(pollution_data)


@router.get("/sensor-data/regional-stats/")
def get_regional_stats(db: Session = Depends(get_db)):
    # Отримання статистики забруднення по кожному регіону
    regional_stats = (
        db.query(
            SensorData.region,
            func.avg(SensorData.nitrogen_dioxide).label("avg_nitrogen_dioxide"),
            func.avg(SensorData.sulfur_dioxide).label("avg_sulfur_dioxide"),
            func.avg(SensorData.pm2_5).label("avg_pm2_5"),
            func.max(SensorData.nitrogen_dioxide).label("max_nitrogen_dioxide"),
            func.max(SensorData.sulfur_dioxide).label("max_sulfur_dioxide"),
        )
        .group_by(SensorData.region)
        .all()
    )

    return [
        {
            "region": stat[0],
            "avg_nitrogen_dioxide": round(stat[1], 2),
            "avg_sulfur_dioxide": round(stat[2], 2),
            "avg_pm2_5": round(stat[3], 2),
            "max_nitrogen_dioxide": round(stat[4], 2),
            "max_sulfur_dioxide": round(stat[5], 2),
        }
        for stat in regional_stats
    ]


# Ендпоінт для симуляції даних
@router.post("/simulate-data/")
def simulate_environmental_data(
    days: int = 365, db: Session = Depends(get_db)  # Симуляція за рік
):
    generator = EnvironmentalDataGenerator()

    # Очищення старих даних
    db.query(SensorData).delete()

    # Генерація даних за вказаний період
    for day in range(days):
        current_date = datetime.now() - timedelta(days=day)

        # Генерація даних для кожного регіону
        for region in generator.REGIONS:
            # Створення 3-5 штучних сенсорів для кожного регіону
            for _ in range(random.randint(3, 5)):
                sensor_data = generator.generate_sensor_data(region, current_date)
                db_sensor_data = SensorData(
                    **sensor_data.dict(), timestamp=current_date
                )
                db.add(db_sensor_data)

    db.commit()
    return {"status": "Дані симульовано", "days": days}


# Додатковий ендпоінт для порівняння регіонів
@router.get("/sensor-data/compare-regions/")
def compare_regions(
    regions: List[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
):
    if not regions:
        regions = EnvironmentalDataGenerator.REGIONS

    if not start_date:
        start_date = datetime.now() - timedelta(days=365)
    if not end_date:
        end_date = datetime.now()

    comparison_data = {}
    for region in regions:
        pollution_data = (
            db.query(
                func.avg(SensorData.nitrogen_dioxide).label("avg_nitrogen_dioxide"),
                func.avg(SensorData.pm2_5).label("avg_pm2_5"),
                func.avg(SensorData.radiation_level).label("avg_radiation"),
            )
            .filter(
                SensorData.region == region,
                SensorData.timestamp.between(start_date, end_date),
            )
            .first()
        )

        comparison_data[region] = {
            "avg_nitrogen_dioxide": (
                round(pollution_data[0], 2) if pollution_data[0] else 0
            ),
            "avg_pm2_5": round(pollution_data[1], 2) if pollution_data[1] else 0,
            "avg_radiation": round(pollution_data[2], 2) if pollution_data[2] else 0,
        }

    return comparison_data
