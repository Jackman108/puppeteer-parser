// src/searchForVacancy.js
import { personalData } from '../secrets.js';
import { SELECTORS, TIMEOUTS } from '../constants.js';

// Функция для поиска вакансии
export async function searchForVacancy(page) {
    const { vacancySearch } = personalData;
    await new Promise(r => setTimeout(r, TIMEOUTS.SEARCH));

    const vacancyInputSelector = await page.$(SELECTORS.VACANCY_INPUT);

    // Очистка содержимого поля ввода
    await page.$eval(SELECTORS.VACANCY_INPUT, input => {
        input.value = '';
    });

    // Вводим новое значение
    await vacancyInputSelector.type(vacancySearch);

    // Нажимаем кнопку "Enter" для запуска поиска
    await page.keyboard.press('Enter');
}