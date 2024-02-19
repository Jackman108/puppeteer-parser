    // src/getVacancies.js

    // Функция для получения списка вакансий на странице
    export async function getVacancies(page) {
        await page.waitForSelector('[data-qa="vacancy-serp__vacancy_response"]', { timeout: 60000 });
        // Отфильтруем вакансии, содержащие кнопку 'Откликнуться'
        const vacancies = await page.$$('[data-qa="vacancy-serp__vacancy_response"]');
        const vacanciesWithResponse = [];

        for (const vacancy of vacancies) {
            const responseButton = await vacancy.$(
                '[data-qa="vacancy-serp__vacancy_response"] span'
            );
            const text = responseButton ? await page.evaluate(el => el.textContent, responseButton) : "";
            if (text.includes('Откликнуться')) {
                vacanciesWithResponse.push(vacancy);
            }
        }
        console.log('Найдено вакансий:', vacanciesWithResponse.length);
        return vacanciesWithResponse;
    }