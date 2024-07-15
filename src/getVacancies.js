// src/getVacancies.js
import { SELECTORS, TIMEOUTS } from '../constants.js';
import { extractVacancyData } from '../vacancyUtils.js';

// Функция для получения списка вакансий на странице
export async function getVacancies(page) {
    try {
        await page.waitForSelector(SELECTORS.VACANCY_CARD, { timeout: TIMEOUTS.LONG });
        const vacancies = await page.$$(SELECTORS.VACANCY_CARD);
        const vacanciesWithResponse = [];
        const visitedIds = new Set();

        for (const vacancy of vacancies) {
            const vacancyTitle = await vacancy.$eval(SELECTORS.VACANCY_TITLE, el => el.innerText.trim());
            const vacancyLink = await vacancy.$eval(SELECTORS.VACANCY_LINK, el => el.href);
            const vacancyResponse = await vacancy.$(SELECTORS.RESPONSE_BUTTON_SPAN);
            const responseText = vacancyResponse ? await page.evaluate(el => el.textContent, vacancyResponse) : "";

            let companyTitle = 'Компания не указана';
            let companyLink = '#';
            const companyLinkElement = await vacancy.$(SELECTORS.COMPANY_LINK);

            if (companyLinkElement) {
                companyTitle = await vacancy.$eval(SELECTORS.COMPANY_LINK, el => el.textContent.trim());
                companyLink = await vacancy.$eval(SELECTORS.COMPANY_LINK, el => el.href);
            } 

            if (responseText.includes('Откликнуться')) {
                const data = await extractVacancyData(page, { vacancyTitle, vacancyLink, companyTitle, companyLink });
                
                if (!visitedIds.has(data.id)) {
                    visitedIds.add(data.id);
                    vacanciesWithResponse.push({ data, vacancyResponse });
                } else {
                    console.log(`Вакансия ${data.id} уже в списке. Пропускаем.`);
                }
            } else {
                console.log('Отсутствует кнопка "Откликнуться", пропускаем.');
            }
        }

        console.log('Найдено вакансий:', vacanciesWithResponse.length);
        return vacanciesWithResponse;
    } catch (error) {
        console.error('Ошибка во время обработки вакансий:', error.message);
        throw error;
    }
}