import puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';
dotenv.config();

(async () => {
    try {
        // Инициализация и настройка браузера
        const browser = await puppeteer.launch({
            headless: false,
            executablePath: 'C:\\Program Files\\Google\\Chrome Dev\\Application\\chrome.exe',
            args: ['--profile-directory=Profile 1', '--start-maximized']
        });

        const page = await browser.newPage();
        await page.setViewport({
            width: 1440,
            height: 800,
            deviceScaleFactor: 1,
        });

        // Переход на указанный URL
        const url = 'https://spb.hh.ru/search/vacancy?L_save_area=true&text=React+developer&search_field=name&excluded_text=&salary=&currency_code=RUR&experience=doesNotMatter&schedule=remote&order_by=salary_desc&search_period=30&items_on_page=100';
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });


        // Принятие cookies
        await page.waitForSelector('[data-qa="cookies-policy-informer-accept"]', { visible: true });
        await page.click('[data-qa="cookies-policy-informer-accept"]');

        // Авторизация на сайте
        const email = process.env.MY_EMAIL;
        await page.click('[data-qa="login"]');
        await page.waitForSelector('[data-qa="account-signup-email"]', { visible: true });
        await page.type('[data-qa="account-signup-email"]', email);
        await page.click('[data-qa="account-signup-submit"]');

        // Функция для подтверждения входа
        async function codeSubmit() {
            try {
                console.log('Ожидание появления поля ввода...');
                const codeInputSelector = 'input[data-qa="otp-code-input"]';
                await page.waitForSelector(codeInputSelector, { visible: true });
                const otpCodeInput = await page.$(codeInputSelector);

                // Ожидаем, пока в поле ввода не появятся 4 символа
                await page.waitForFunction((input) => input.value.length === 4, {}, otpCodeInput);

                console.log('Поле ввода кода заполнено.');
                const submitButtonSelector = '[data-qa="otp-code-submit"]';
                await page.waitForSelector(submitButtonSelector, { visible: true });
                const submitButton = await page.$(submitButtonSelector);
                console.log('Клик по кнопке подтверждения...');
                await submitButton.click();
            } catch (error) {
                console.error('Произошла ошибка во время ожидания навигации или выполнения функции:', error);
            }
        }
        await codeSubmit();



        const coverLetter = `
                Я обратил внимание на вашу вакансию и был бы рад присоединиться к вашей команде в качестве кандидата на эту должность. Я уверен, что мой опыт и навыки в сочетании с вашими ресурсами и профессионализмом могут принести взаимную выгоду.
                
                Я заинтересован в данной должности, так как верю, что она позволит мне расти и развиваться в техническом плане, что является одним из моих главных приоритетов. Я уверен, что смогу внести свой вклад в проекты вашей компании, внедряя новые идеи и подходы к решению задач.
                
                Если у вас возникнут вопросы или требуется дополнительная информация, я готов предоставить все необходимое. Буду благодарен за обратную связь, даже если моя кандидатура не соответствует вашим требованиям. Я всегда готов узнать о возможностях улучшения своих навыков и опыта.
                
                Спасибо за рассмотрение моей заявки. Я надеюсь на скорый ответ и возможность обсудить мою кандидатуру на должность.
                
                Мой гит: https://github.com/Jackman108
                
                С уважением,
                Евгений Коробов.
                `;

        let pages = 7;// Предполагаемое количество страниц для обработки
        let idx = 0;// Счётчик обработанных страниц
        let successfullySubmittedFormsCount = 0; // Счётчик успешно отправленных форм
        let unsuccessfullySubmittedFormsCount = 0; // Счётчик неуспешно отправленных форм
        let successfullySubmittedFormsIndexes = new Set(); // Хранилище индексов успешно отправленных форм

        // Цикл обработки страниц
        while (pages > idx) {
            try {
                // Задержка для стабилизации контента
                console.log(`Обрабатываем страницу ${idx + 1} из ${pages}`);
                await new Promise(r => setTimeout(r, 2000));

                let vacancyElementsSelector = await page.$$('[data-qa="vacancy-serp__vacancy_response"]');
                if (vacancyElementsSelector.length > 0) {

                    for (let vacancyIndex = 0; vacancyIndex < vacancyElementsSelector.length; vacancyIndex++) {
                        const vacancy = vacancyElementsSelector[vacancyIndex];
                        const button = await vacancy.$('span');
                        const text = await page.evaluate(btn => btn.textContent, button);
                        if (text.includes('Откликнуться') && !successfullySubmittedFormsIndexes.has(vacancyIndex)) {
                            await new Promise(r => setTimeout(r, 1000));
                            await vacancy.click();

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
                            console.log('Отправки формы на вакансию:', vacancyIndex + 1);

                            // Добавляем условие на основе наличия блока textarea_invalid
                            const isInvalidTextareaVisible = await page.evaluate(() => {
                                const textarea = document.querySelector('textarea');
                                return textarea && textarea.classList.contains('bloko-textarea_invalid');
                            });

                            // Добавляем условие на основе наличия блока radio_invalid
                            const isInvalidRadioVisible = await page.evaluate(() => {
                                const radioLabel = document.querySelector('label.bloko-radio');
                                return radioLabel && radioLabel.classList.contains('bloko-radio_invalid');
                            });

                            if (isInvalidTextareaVisible || isInvalidRadioVisible) {
                                console.log('Обнаружена ошибка в форме отклика');
                                unsuccessfullySubmittedFormsCount++;
                                await page.goBack({ waitUntil: 'domcontentloaded', timeout: 60000 });
                                vacancyElementsSelector = await page.$$('[data-qa="vacancy-serp__vacancy_response"]');
                                console.log('Предыдущая страница открыта');
                            } else {
                                successfullySubmittedFormsCount++;
                            }
                            successfullySubmittedFormsIndexes.add(vacancyIndex);
                            console.log('Отправленных откликов:', successfullySubmittedFormsCount);
                            console.log('Неудачных откликов:', unsuccessfullySubmittedFormsCount);
                            console.log('Осталось вакансий:', vacancyElementsSelector.length - successfullySubmittedFormsIndexes.add(vacancyIndex).length);
                        }
                    }
                }
            // Переходим на следующую страницу, только если все вакансии обработаны

                if (successfullySubmittedFormsCount + unsuccessfullySubmittedFormsCount === vacancyElementsSelector.length) {
                    const nextPageButtonHandle = await page.$('[data-qa="pager-next"]');
                    if (nextPageButtonHandle) {
                        console.log('Переход на следующую страницу.');
                        await nextPageButtonHandle.click();
                        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
                        vacancyElementsSelector = await page.$$('[data-qa="vacancy-serp__vacancy_response"]');
                        idx++;
                    } else {
                        console.log('Кнопка перехода на следующую страницу не найдена, возможно, это последняя страница.');
                        break;
                    }
                }
            } catch (err) {
                console.error('Ошибка во время обработки страницы:', err);
            }
        }
        console.log(`Общее количество успешно отправленных форм: ${successfullySubmittedFormsCount}`);
        // Закрытие браузера
        await browser.close();
    } catch (err) {
        console.error('Ошибка во время исполнения скрипта:', err);
    }
})();