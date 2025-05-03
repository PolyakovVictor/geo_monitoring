from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import router
from db import Base, engine


# Створення таблиць
Base.metadata.create_all(bind=engine)

# Ініціалізація FastAPI додатку
app = FastAPI(title="Environmental Monitoring System")

# CORS middleware для фронтенду
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Дозволити всі джерела
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

# Приклад використання
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
