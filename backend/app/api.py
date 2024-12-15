from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional

from .db import get_db
from .models import SensorData, Location
from .services import simulate_sensor_data_for_location
from .schemas import LocationCreate

router = APIRouter()


@router.post("/locations/")
def create_location(location: LocationCreate, db: Session = Depends(get_db)):
    db_location = Location(**location.dict())
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location


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
