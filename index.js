import puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';
dotenv.config();

// Конфигурация браузера
const browserConfig = {
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome Dev\\Application\\chrome.exe',
    args: ['--profile-directory=Profile 1', '--start-maximized']
};

// URL для поиска вакансий
const vacanciesUrl = 'https://hh.ru/search/vacancy?L_save_area=true&text=Middle+Frontend+Developer&excluded_text=&salary=&currency_code=RUR&experience=doesNotMatter&schedule=remote&order_by=relevance&search_period=7&items_on_page=100'

let successfullySubmittedFormsCount = 0;
let unsuccessfullySubmittedFormsCount = 0;
let currentPage = 0;
const totalPages = 7;
const processedVacanciesIds = new Set();
const coverLetter = `
Я обратил внимание на вашу вакансию и был бы рад присоединиться к вашей команде в качестве кандидата на эту должность. Я уверен, что мой опыт и навыки в сочетании с вашими ресурсами и профессионализмом могут принести взаимную выгоду.

Я заинтересован в данной должности, так как верю, что она позволит мне расти и развиваться в техническом плане, что является одним из моих главных приоритетов. Я уверен, что смогу внести свой вклад в проекты вашей компании, внедряя новые идеи и подходы к решению задач.

Если у вас возникнут вопросы или требуется дополнительная информация, я готов предоставить все необходимое. Буду благодарен за обратную связь, даже если моя кандидатура не соответствует вашим требованиям. Я всегда готов узнать о возможностях улучшения своих навыков и опыта.

Спасибо за рассмотрение моей заявки. Я надеюсь на скорый ответ и возможность обсудить мою кандидатуру на должность.

Мой гит: https://github.com/Jackman108

С уважением,
Евгений Коробов.
`;

// Функция для авторизации
async function authorize(page) {
    const email = process.env.MY_EMAIL;
    await page.click('[data-qa="login"]');
    await page.waitForSelector('[data-qa="account-signup-email"]', { visible: true });
    await page.type('[data-qa="account-signup-email"]', email);
    await page.click('[data-qa="account-signup-submit"]');
}

// Функция подтверждения кода
async function confirmCode(page) {
    try {
        console.log('Ожидание появления поля ввода OTP...');
        const codeInputSelector = 'input[data-qa="otp-code-input"]';
        await page.waitForSelector(codeInputSelector, { visible: true });

        const otpCodeInput = await page.$(codeInputSelector);
        await page.waitForFunction((input) => input.value.length === 4, {}, otpCodeInput);
        console.log('Поле ввода OTP заполнено.');

        const submitButtonSelector = '[data-qa="otp-code-submit"]';
        await page.waitForSelector(submitButtonSelector, { visible: true });
        await page.click(submitButtonSelector);
        console.log('Подтверждение OTP выполнено.');
    } catch (error) {
        console.error('Ошибка при подтверждении входа:', error);
        throw error;
    }
}

// Функция для обработки вакансии
async function processVacancy(page, vacancy) {
    try {
        const button = await vacancy.$('span');
        const text = await page.evaluate(btn => btn.textContent, button);

        if (text.includes('Откликнуться')) {
            await new Promise(r => setTimeout(r, 1000));
            console.log('click');
            await vacancy.click();
            console.log('click2');
            // Селекторы для модального окна и кнопки "Все равно откликнуться"
            const relocationModalSelector = '.bloko-modal .bloko-modal-header [data-qa="relocation-warning-title"]';
            const confirmButtonSelector = '[data-qa="relocation-warning-confirm"]';

            // Ожидаем появление модального окна
            const relocationModalHandle = await page.waitForSelector(
                relocationModalSelector,
                { visible: true, timeout: 30000 }).catch(() => null);

            // Проверяем содержимое модального окна
            if (relocationModalHandle) {
                const modalContent = await page.evaluate(titleModal => titleModal.textContent, relocationModalHandle);
                if (modalContent.includes('Вы откликаетесь на вакансию в другой стране')) {
                    await new Promise(r => setTimeout(r, 1000));
                    await page.click(confirmButtonSelector);
                    console.log('Нажата кнопка "Все равно откликнуться"');
                }
            }

            // Ожидание другого модального окна "Отправить отклик на вакансию" или "Отклик на вакансию"
            const responseModalSelector = '.bloko-modal-title';
            const coverLetterToggleSelector = '[data-qa="vacancy-response-letter-toggle"]';
            const responseSubmitSelector = '[data-qa="vacancy-response-submit-popup"] span';
            const coverLetterInputSelector = '[data-qa="vacancy-response-popup-form-letter-input"]';

            // Проверяем наличие и видимость модального окна
            await page.waitForSelector(
                responseModalSelector,
                { visible: true, timeout: 30000 });
            await new Promise(r => setTimeout(r, 1000));

            // Нажимаем кнопку для открытия поля сопроводительного письма
            const coverLetterButtonHandle = await page.waitForSelector(
                coverLetterToggleSelector,
                { visible: true, timeout: 30000 }).catch(() => null);

            if (coverLetterButtonHandle) {
                await coverLetterButtonHandle.click()
                console.log('Нажата кнопка "Сопроводительное письмо"');
                await page.waitForSelector(coverLetterInputSelector, { visible: true });
            }

            // Вводим сопроводительное письмо
            await page.type(coverLetterInputSelector, coverLetter);
            console.log('Введено сопроводительное письмо');

            // Кликаем на кнопку "Откликнуться" для отправки формы
            await page.click(responseSubmitSelector)
            console.log('Отправки формы на вакансию:');

            // Добавляем условия для проверки наличия ошибок в форме отклика
            const isInvalidTextareaVisible = await page.evaluate(() => {
                const textarea = document.querySelector('textarea');
                return textarea && textarea.classList.contains('bloko-textarea_invalid');
            });

            const isInvalidRadioVisible = await page.evaluate(() => {
                const radioLabel = document.querySelector('label.bloko-radio');
                return radioLabel && radioLabel.classList.contains('bloko-radio_invalid');
            });

            // Проверяем наличие ошибок в форме отклика
            if (isInvalidTextareaVisible || isInvalidRadioVisible) {
                console.log('Обнаружена ошибка в форме отклика');
                unsuccessfullySubmittedFormsCount++;
                await page.goBack();
                console.log('Предыдущая страница открыта');
            } else {
                successfullySubmittedFormsCount++;
            }
        }
    } catch (error) {
        console.error('Ошибка во время обработки вакансии:', error);
    }
};

// Функция для навигации и обработки страниц с вакансиями
async function navigateAndProcessVacancies(page) {
    while (currentPage < totalPages) {
        try {
            // Задержка для стабилизации контента
            await new Promise(r => setTimeout(r, 2000));
            const vacancies = await page.$$('[data-qa="vacancy-serp__vacancy_response"]');
            if (vacancies.length === 0) {
                console.log('Вакансии на странице не найдены. Завершение обработки.');
                break; // Выход из цикла, если вакансий нет
            }
            console.log(`Обрабатываем страницу ${currentPage + 1} из ${totalPages}`);
            console.log('Всех вакансий:', vacancies.length);
            console.log('Отправленных откликов:', successfullySubmittedFormsCount);
            console.log('Неудачных откликов:', unsuccessfullySubmittedFormsCount);


            for (const vacancy of vacancies) {
                const vacancyId = await page.evaluate(el => {
                    const href = el.getAttribute('href');
                    const idIndex = href.indexOf('vacancyId=');
                    if (idIndex !== -1) {
                        return href.slice(idIndex + 'vacancyId='.length);
                    } else {
                        return null;
                    }
                }, vacancy);

                if (vacancyId && !processedVacanciesIds.has(vacancyId)) {
                    await processVacancy(page, vacancy);
                    processedVacanciesIds.add(vacancyId);
                    console.log(`Обработка вакансии с ID ${vacancyId}`);
                    vacancies = await page.$$('[data-qa="vacancy-serp__vacancy_response"]');
                } else if (vacancyId) {
                    console.log(`Вакансия с ID ${vacancyId} уже была обработана. Пропускаем.`);
                } else {
                    console.log(`Ошибка: не удалось получить ID вакансии.`);
                }
            }

            // Переходим на следующую страницу, только если все вакансии обработаны
            const nextPageButtonHandle = await page.$('[data-qa="pager-next"]');
            if (nextPageButtonHandle) {
                console.log('Переход на следующую страницу.');
                await nextPageButtonHandle.click();
                await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 });
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

(async () => {
    try {
        // Инициализация и настройка браузера
        const browser = await puppeteer.launch(browserConfig);
        const page = await browser.newPage();
        await page.setViewport({
            width: 1440,
            height: 1000,
            deviceScaleFactor: 1,
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.goto(vacanciesUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('[data-qa="cookies-policy-informer-accept"]', { visible: true });
        await page.click('[data-qa="cookies-policy-informer-accept"]');
        await authorize(page);
        await confirmCode(page);
        await navigateAndProcessVacancies(page);

        console.log(`Общее количество успешно отправленных форм: ${successfullySubmittedFormsCount}`);
        // Закрытие браузера
        await browser.close();
    } catch (err) {
        console.error('Ошибка во время исполнения скрипта:', err);
    }
})();