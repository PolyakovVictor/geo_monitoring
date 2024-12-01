from app.api.sensor_simulation import router as sensor_simulation_router
from fastapi import FastAPI
from .api.routes import router
from .db import Base, engine
from fastapi.middleware.cors import CORSMiddleware


Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(router, prefix="/api")

app.include_router(
    sensor_simulation_router, prefix="/api/simulation", tags=["Simulation"]
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Дозволити всі джерела, або вкажіть ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],  # Дозволити всі методи
    allow_headers=["*"],  # Дозволити всі заголовки
)
