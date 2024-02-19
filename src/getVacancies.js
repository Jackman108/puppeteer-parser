// src/getVacancies.js
import { SELECTORS, TIMEOUTS } from '../constants.js';

// Функция для получения списка вакансий на странице
export async function getVacancies(page) {
    await page.waitForSelector(SELECTORS.VACANCY_RESPONSE, { timeout: TIMEOUTS.LONG });
    // Отфильтруем вакансии, содержащие кнопку 'Откликнуться'
    const vacancies = await page.$$(SELECTORS.VACANCY_RESPONSE);
    const vacanciesWithResponse = [];

    for (const vacancy of vacancies) {
        const responseButton = await vacancy.$(
            SELECTORS.RESPONSE_BUTTON_SPAN
        );
        const text = responseButton ? await page.evaluate(el => el.textContent, responseButton) : "";
        if (text.includes('Откликнуться')) {
            vacanciesWithResponse.push(vacancy);
        }
    }
    console.log('Найдено вакансий:', vacanciesWithResponse.length);
    return vacanciesWithResponse;
}