# Використовуємо офіційний образ PostgreSQL
FROM postgres:14

# Копіюємо SQL-скрипти для ініціалізації бази даних
COPY init.sql /docker-entrypoint-initdb.d/

# Вказуємо, що база даних використовуватиме зазначену версію
ENV POSTGRES_USER=myuser
ENV POSTGRES_PASSWORD=mypassword
ENV POSTGRES_DB=pollution_monitoring
