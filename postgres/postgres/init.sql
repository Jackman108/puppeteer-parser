-- init.sql
SELECT 'CREATE DATABASE db_vacancy' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'db_vacancy');

\c db_vacancy;

CREATE TABLE IF NOT EXISTS vacancies (
    id BIGINT PRIMARY KEY,
    title_vacancy VARCHAR(255) NOT NULL,
    url_vacancy TEXT NOT NULL,
    title_company VARCHAR(255) NOT NULL,
    url_company TEXT NOT NULL,
    vacancy_status BOOLEAN NOT NULL DEFAULT FALSE,
    response_date TIMESTAMP
);