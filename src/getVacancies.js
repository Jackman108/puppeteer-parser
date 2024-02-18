// Функция для получения списка вакансий на странице
export async function getVacancies(page) {
    await page.waitForSelector('[data-qa="vacancy-serp__vacancy_response"]', { timeout: 60000 });
    return await page.$$('[data-qa="vacancy-serp__vacancy_response"]');
}