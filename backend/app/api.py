from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Optional

from .db import get_db
from .models import SensorData, Location
from .services import simulate_sensor_data_for_location
from .schemas import LocationCreate
from .fuzzy_logic import AdvancedAirQualityFuzzySystem

router = APIRouter()


@router.post("/locations/")
def create_location(location: LocationCreate, db: Session = Depends(get_db)):
    db_location = Location(**location.dict())
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location


@router.get("/locations")
def read_locations(db: Session = Depends(get_db)):
    locations = db.query(Location).all()
    return locations


@router.get("/locations/pollution-summary/")
def get_location_pollution_summary(
    location_ids: List[int] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    if not start_date:
        start_date = datetime.now() - timedelta(days=365)
    if not end_date:
        end_date = datetime.now()

    query = (
        db.query(
            Location.id,
            Location.name,
            func.avg(SensorData.nitrogen_dioxide).label("avg_nitrogen_dioxide"),
            func.avg(SensorData.sulfur_dioxide).label("avg_sulfur_dioxide"),
            func.avg(SensorData.pm2_5).label("avg_pm2_5"),
        )
        .join(SensorData)
        .filter(SensorData.timestamp.between(start_date, end_date))
    )

    if location_ids:
        query = query.filter(Location.id.in_(location_ids))

    location_pollution = query.group_by(Location.id, Location.name).all()

    return [
        {
            "location_id": loc[0],
            "location_name": loc[1],
            "avg_nitrogen_dioxide": round(loc[2], 2),
            "avg_sulfur_dioxide": round(loc[3], 2),
            "avg_pm2_5": round(loc[4], 2),
        }
        for loc in location_pollution
    ]


@router.get("/sensor-data/")
def get_sensor_data(
    location_id: Optional[int] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
):
    if not start_date:
        start_date = datetime.now() - timedelta(days=365)
    if not end_date:
        end_date = datetime.now()

    query = db.query(SensorData).join(Location)

    if location_id:
        query = query.filter(SensorData.location_id == location_id)

    query = query.filter(
        SensorData.timestamp.between(start_date, end_date)
    )

    sensor_data = query.all()
    return sensor_data


@router.get("/locations/pollution-summary/")
def get_location_pollution_summary(db: Session = Depends(get_db)):
    location_pollution = (
        db.query(
            Location.id,
            Location.name,
            func.avg(SensorData.nitrogen_dioxide).label("avg_nitrogen_dioxide"),
            func.avg(SensorData.sulfur_dioxide).label("avg_sulfur_dioxide"),
            func.avg(SensorData.pm2_5).label("avg_pm2_5"),
        )
        .join(SensorData)
        .group_by(Location.id, Location.name)
        .all()
    )

    return [
        {
            "location_id": loc[0],
            "location_name": loc[1],
            "avg_nitrogen_dioxide": round(loc[2], 2),
            "avg_sulfur_dioxide": round(loc[3], 2),
            "avg_pm2_5": round(loc[4], 2),
        }
        for loc in location_pollution
    ]


@router.post("/simulate-data/")
def simulate_environmental_data(
    location_id: int,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    # Встановлення діапазону дат, якщо не вказано
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)

    if not end_date:
        end_date = datetime.now()

    try:
        # Видаляємо попередні дані для цієї локації в заданому діапазоні
        db.query(SensorData).filter(
            SensorData.location_id == location_id,
            SensorData.timestamp.between(start_date, end_date)
        ).delete()

        # Симуляція даних
        generated_records = simulate_sensor_data_for_location(
            db, location_id, start_date, end_date
        )

        return {
            "status": "Дані симульовано", 
            "location_id": location_id,
            "start_date": start_date,
            "end_date": end_date,
            "generated_records": generated_records
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Додатковий ендпоінт для отримання даних з певної локації за період
@router.get("/sensor-data/location/{location_id}")
def get_sensor_data_for_location(
    location_id: int,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    # Встановлення діапазону дат, якщо не вказано
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)

    if not end_date:
        end_date = datetime.now()

    # Отримання даних для локації за період
    sensor_data = (
        db.query(SensorData)
        .filter(
            SensorData.location_id == location_id,
            SensorData.timestamp.between(start_date, end_date)
        )
        .order_by(SensorData.timestamp)
        .all()
    )

    return {
        "location_id": location_id,
        "start_date": start_date,
        "end_date": end_date,
        "sensor_data": sensor_data
    }


# Створюємо глобальний екземпляр системи нечіткої логіки
fuzzy_system = AdvancedAirQualityFuzzySystem()


@router.get("/air-quality/location/{location_id}")
def get_air_quality_for_location(
    location_id: int,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    aggregation_method: Optional[str] = Query('average', enum=['average', 'worst', 'best']),
    db: Session = Depends(get_db)
):
    """
    Отримання оцінки якості повітря для певної локації
    
    Параметри:
    - location_id: ID локації
    - start_date: Початкова дата (опціонально)
    - end_date: Кінцева дата (опціонально)
    - aggregation_method: Метод агрегації (середнє, найгірше, найкраще значення)
    """
    # Встановлення діапазону дат, якщо не вказано
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)

    if not end_date:
        end_date = datetime.now()

    # Отримання даних сенсорів для локації
    sensor_data = (
        db.query(SensorData)
        .filter(
            SensorData.location_id == location_id,
            SensorData.timestamp.between(start_date, end_date)
        )
        .order_by(SensorData.timestamp)
        .all()
    )

    if not sensor_data:
        return {
            "message": "Немає даних для аналізу",
            "location_id": location_id
        }

    # Підготовка результатів нечіткої логіки
    fuzzy_results = []
    for data in sensor_data:
        # Перетворення даних моделі в словник
        data_dict = {
            'pm2_5': data.pm2_5,
            'pm10': data.pm10,
            'nitrogen_dioxide': data.nitrogen_dioxide,
            'sulfur_dioxide': data.sulfur_dioxide,
            'carbon_monoxide': data.carbon_monoxide,
            'ozone': data.ozone,
            'lead': data.lead,
            'cadmium': data.cadmium,
            'radiation_level': data.radiation_level
        }
        fuzzy_result = fuzzy_system.evaluate_air_quality(data_dict)
        fuzzy_results.append({
            'timestamp': data.timestamp,
            'air_quality_result': fuzzy_result
        })

    # Агрегація результатів
    if aggregation_method == 'worst':
        aggregated_result = max(fuzzy_results, key=lambda x: x['air_quality_result']['score'])
    elif aggregation_method == 'best':
        aggregated_result = min(fuzzy_results, key=lambda x: x['air_quality_result']['score'])
    else:  # average
        total_score = sum(result['air_quality_result']['score'] for result in fuzzy_results)
        avg_score = total_score / len(fuzzy_results)

        # Знаходимо результат, найближчий до середнього значення
        aggregated_result = min(fuzzy_results, key=lambda x: abs(x['air_quality_result']['score'] - avg_score))

    return {
        "location_id": location_id,
        "start_date": start_date,
        "end_date": end_date,
        "total_readings": len(sensor_data),
        "aggregation_method": aggregation_method,
        "air_quality": aggregated_result['air_quality_result'],
        "detailed_results": fuzzy_results
    }


@router.get("/air-quality/comparative-analysis")
def comparative_air_quality_analysis(
    location_ids: List[int] = Query(...),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Порівняльний аналіз якості повітря для декількох локацій
    """
    results = []

    for location_id in location_ids:
        location_result = get_air_quality_for_location(
            location_id,
            start_date,
            end_date,
            'average',
            db
        )
        
        results.append({
            'location_id': location_id,
            'air_quality': location_result['air_quality']
        })
    
    # Сортування локацій за якістю повітря
    results_sorted = sorted(results, key=lambda x: x['air_quality']['score'])
    
    return {
        "comparative_analysis": results_sorted,
        "best_location": results_sorted[0],
        "worst_location": results_sorted[-1]
    }