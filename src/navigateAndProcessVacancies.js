// src/navigateAndProcessVacancies.js
import { processVacancy } from './processVacancy.js';
import { getVacancies } from './getVacancies.js';
import { personalData } from '../secrets.js';


// Функция для навигации и обработки страниц с вакансиями
export async function navigateAndProcessVacancies(page, counters) {
    let currentPage = 0;
    const processedVacanciesIds = new Set();
    const { totalPages } = personalData;

    while (currentPage < totalPages) {
        try {
            // Задержка для стабилизации контента
            console.log(`Обрабатываем страницу ${currentPage + 1} из ${totalPages}`);

            // Задержка для стабилизации контента
            await new Promise(r => setTimeout(r, 2000));
            let vacancies = await getVacancies(page);

            if (vacancies.length === 0) {
                console.log('Вакансии на странице не найдены. Завершение обработки.');
                break; // Выход из цикла, если вакансий нет
            }
            
            for (let i = 0; i < vacancies.length; i++) {
                const vacancy = vacancies[i];
                console.log('Всех вакансий:', vacancies.length);
                console.log('Отправленных откликов:', counters.successfullySubmittedCount);
                console.log('Неудачных откликов:', counters.unsuccessfullySubmittedCount);
    
                const vacancyId = await page.evaluate(el => {
                    const href = el.getAttribute('href');
                    const idIndex = href.indexOf('vacancyId=');
                    return idIndex !== -1 ? href.slice(idIndex + 'vacancyId='.length) : null;
                }, vacancy);

                if (vacancyId && !processedVacanciesIds.has(vacancyId)) {
                    processedVacanciesIds.add(vacancyId);
                    await processVacancy(page, vacancy, counters);
                    console.log(`Обработка вакансии с ID ${vacancyId}`);
                } else if (vacancyId) {
                    console.log(`Вакансия с ID ${vacancyId} уже была обработана. Пропускаем.`);
                } else {
                    console.log(`Ошибка: не удалось получить ID вакансии.`);
                }
                vacancies = await getVacancies(page);
                console.log('Список вакансий обновлен');
            }

            // Переходим на следующую страницу, только если все вакансии обработаны
            const nextPageButtonHandle = await page.$('[data-qa="pager-next"]');
            if (nextPageButtonHandle) {
                console.log('Переход на следующую страницу.');
                await nextPageButtonHandle.click();
                await new Promise(r => setTimeout(r, 1000));
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

