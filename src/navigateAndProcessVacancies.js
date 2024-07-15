// src/navigateAndProcessVacancies.js
import { processVacancy } from './processVacancy.js';
import { getVacancies } from './getVacancies.js';
import { personalData } from '../secrets.js';
import { SELECTORS, TIMEOUTS } from '../constants.js';

// Функция для навигации и обработки страниц с вакансиями
export async function navigateAndProcessVacancies(page, counters) {
    let currentPage = 0;
    const { totalPages } = personalData;
    const processedVacanciesIds = new Set();

    while (currentPage < totalPages) {
        try {
            // Задержка для стабилизации контента
            console.log(`Обрабатываем страницу ${currentPage + 1} из ${totalPages}`);

            // Задержка для стабилизации контента
            await new Promise(r => setTimeout(r, TIMEOUTS.SHORT));
            let vacancies = await getVacancies(page);

            if (vacancies.length === 0) {
                console.log('Вакансии на странице не найдены. Завершение обработки.');
                break; 
            }
            
            for (let i = 0; i < vacancies.length; i++) {
                const { data, vacancyResponse } = vacancies[i];
                console.log('Отправленных откликов:', counters.successfullySubmittedCount);
                console.log('Неудачных откликов:', counters.unsuccessfullySubmittedCount);
    
                if (data.id && !processedVacanciesIds.has(data.id)) {
                    processedVacanciesIds.add(data.id);
                    await processVacancy(page, vacancyResponse, data, counters);
                    console.log(`Обработка вакансии с ID ${data.id}`);
                } else if (data.id) {
                    console.log(`Вакансия с ID ${data.id} уже была обработана. Пропускаем.`);
                } else {
                    console.log(`Ошибка: не удалось получить ID вакансии.`);
                }
                vacancies = await getVacancies(page);
                console.log('Список вакансий обновлен');
            }

            // Переходим на следующую страницу, только если все вакансии обработаны
            const nextPageButtonHandle = await page.$(SELECTORS.PAGER_NEXT);
            if (nextPageButtonHandle) {
                console.log('Переход на следующую страницу.');
                await nextPageButtonHandle.click();
                await new Promise(r => setTimeout(r, TIMEOUTS.SHORT));
                currentPage++;
            } else {
                console.log('Вакансии на последней странице обработаны.');
                break;
            }
        } catch (err) {
            console.error('Ошибка во время обработки страницы:', err);
        }
    }
}

