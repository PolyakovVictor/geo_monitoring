FROM python:3.12

# Встановлення poetry
RUN pip install poetry

# Робоча директорія
WORKDIR /app

# Копіюємо файли залежностей
COPY ./pyproject.toml ./poetry.lock* /app/

# Встановлюємо залежності
RUN poetry config virtualenvs.create false
#   && poetry install --no-root --no-interaction --no-ansi

# Копіюємо код додатку
COPY . /app
