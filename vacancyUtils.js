export async function extractVacancyData(page, { vacancyTitle, vacancyLink, companyTitle, companyLink }) {
    // Извлекаем ID вакансии из URL
    const id = vacancyLink.match(/\/(\d+)\?/)?.[1] || '';
    
    // Устанавливаем значения по умолчанию, если данные не переданы
    const vacancyTitleText = vacancyTitle || 'Заголовок не найден';
    const vacancyLinkText = vacancyLink || 'Ссылка не найдена';
    const companyTitleText = companyTitle || 'Название компании не найдено';
    const companyLinkText = companyLink || 'Ссылка на компанию не найдена';

    // Устанавливаем статус вакансии и дату ответа
    const vacancyStatus = false;
    const responseDate = new Date().toISOString();

    // Возвращаем все извлеченные данные
    return { id, vacancyTitleText, vacancyLinkText, companyTitleText, companyLinkText, vacancyStatus, responseDate };
}
