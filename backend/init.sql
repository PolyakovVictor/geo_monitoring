-- init.sql
DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'pollution_monitoring') THEN
        CREATE DATABASE pollution_monitoring;
    END IF;
END
$$;
