// src/searchForVacancy.js
import { personalData } from '../secrets.js';

// Функция для поиска вакансии
export async function searchForVacancy(page) {
    const { vacancySearch } = personalData;
    await new Promise(r => setTimeout(r, 2000));

    const vacancyInputSelector = await page.$('#a11y-search-input');

    // Очистка содержимого поля ввода
    await page.$eval('#a11y-search-input', input => {
        input.value = '';
    });

    // Вводим новое значение
    await vacancyInputSelector.type(vacancySearch);

    // Нажимаем кнопку "Enter" для запуска поиска
    await page.keyboard.press('Enter');
}