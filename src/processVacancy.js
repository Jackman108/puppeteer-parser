// src/processVacancy.js
import { personalData } from "../secrets.js";

// Функция для обработки вакансии
export async function processVacancy(page, vacancy, counters) {
    try {
        const { coverLetter } = personalData;

        await new Promise(r => setTimeout(r, 1000));
        await vacancy.click();

        // Селекторы для модального окна и кнопки "Все равно откликнуться"
        const relocationModalSelector = '.bloko-modal .bloko-modal-header [data-qa="relocation-warning-title"]';
        const confirmButtonSelector = '[data-qa="relocation-warning-confirm"]';

        // Ожидаем появление модального окна
        const relocationModalHandle = await page.waitForSelector(
            relocationModalSelector,
            { visible: true, timeout: 20000 }).catch(() => null);

        // Проверяем содержимое модального окна
        if (relocationModalHandle) {
            const modalContent = await page.evaluate(titleModal => titleModal.textContent, relocationModalHandle);
            if (modalContent.includes('Вы откликаетесь на вакансию в другой стране')) {
                await page.click(confirmButtonSelector);
                console.log('Нажата кнопка "Всё равно откликнуться"');
            }
        }

        // Ожидание другого модального окна "Отправить отклик на вакансию" или "Отклик на вакансию"
        const coverLetterToggleSelector = '[data-qa="vacancy-response-letter-toggle"]';
        const responseSubmitSelector = '[data-qa="vacancy-response-submit-popup"] span';
        const coverLetterInputSelector = '[data-qa="vacancy-response-popup-form-letter-input"]';

        // Нажимаем кнопку для открытия поля сопроводительного письма
        const coverLetterButtonHandle = await page.waitForSelector(
            coverLetterToggleSelector,
            { visible: true, timeout: 10000 }).catch(() => null);

        if (coverLetterButtonHandle) {
            await coverLetterButtonHandle.click()
            console.log('Нажата кнопка "Сопроводительное письмо"');
        }

        // Вводим сопроводительное письмо
        const coverLetterInputHandle = await page.waitForSelector(
            coverLetterInputSelector,
            { visible: true, timeout: 10000 }).catch(() => null);

        if (coverLetterInputHandle) {
            await page.type(coverLetterInputSelector, coverLetter);
            console.log('Введено сопроводительное письмо');;
        } else {
            console.log('Обнаружена ошибка в сопроводительном письме');
            counters.unsuccessfullySubmittedCount++;
            await page.goBack({ waitUntil: 'domcontentloaded', timeout: 60000 });
            console.log('Предыдущая страница открыта');
        }

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
            counters.unsuccessfullySubmittedCount++;
            await page.goBack({ waitUntil: 'domcontentloaded', timeout: 60000 });
            console.log('Предыдущая страница открыта');
        } else {
            counters.successfullySubmittedCount++;
        }
    } catch (error) {
        console.error('Ошибка во время обработки вакансии:', error);
    }
};