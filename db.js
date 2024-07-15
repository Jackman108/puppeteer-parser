import pkg from 'pg';
const { Client } = pkg;

import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.POSTGRES_DB || 'db_vacancy'
});

client.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error:', err.stack));

export async function saveVacancy(vacancy) {
    const query = `
        INSERT INTO vacancies (id, title_vacancy, url_vacancy, title_company, url_company, vacancy_status, response_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE 
        SET title_vacancy = $2, url_vacancy = $3, title_company = $4, url_company = $5, vacancy_status = $6, response_date = $7;
    `;
    const values = [
        vacancy.id,
        vacancy.vacancyTitleText,
        vacancy.vacancyLinkText,
        vacancy.companyTitleText,
        vacancy.companyLinkText,
        vacancy.vacancyStatus,
        vacancy.responseDate
    ];

    try {
        await client.query(query, values);
        console.log(`Вакансия с ID ${vacancy.id} успешно сохранена в базу данных.`);
    } catch (err) {
        console.error('Ошибка при сохранении вакансии:', err);
    }
}
