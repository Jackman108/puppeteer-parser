// src/processVacancy.js
import { personalData } from "../secrets.js";
import { SELECTORS, TIMEOUTS } from '../constants.js';
import { saveVacancy } from '../db.js';

// Функция для обработки вакансии
export async function processVacancy(page, vacancyResponse, data, counters) {
    try {
        const { coverLetter } = personalData;

        await new Promise(r => setTimeout(r, TIMEOUTS.SHORT));
        await vacancyResponse.click();

        // Селекторы для модального окна и кнопки "Все равно откликнуться"
        const relocationModalSelector = SELECTORS.RELOCATION_MODAL_TITLE;
        const confirmButtonSelector = SELECTORS.RELOCATION_CONFIRM;

        // Ожидаем появление модального окна
        const relocationModalHandle = await page.waitForSelector(
            relocationModalSelector,
            { visible: true, timeout: TIMEOUTS.MODAL }).catch(() => null);

        // Проверяем содержимое модального окна
        if (relocationModalHandle) {
            const modalContent = await page.evaluate(titleModal => titleModal.textContent, relocationModalHandle);
            if (modalContent.includes('Вы откликаетесь на вакансию в другой стране')) {
                await page.click(confirmButtonSelector);
                console.log('Нажата кнопка "Всё равно откликнуться"');
            }
        }

        // Ожидание другого модального окна "Отправить отклик на вакансию" или "Отклик на вакансию"
        const coverLetterToggleSelector = SELECTORS.COVER_LETTER_TOGGLE;
        const responseSubmitSelector = SELECTORS.RESPONSE_SUBMIT;
        const coverLetterInputSelector = SELECTORS.COVER_LETTER_INPUT;

        // Нажимаем кнопку для открытия поля сопроводительного письма
        const coverLetterButtonHandle = await page.waitForSelector(
            coverLetterToggleSelector,
            { visible: true, timeout: TIMEOUTS.SEARCH }).catch(() => null);

        if (coverLetterButtonHandle) {
            await coverLetterButtonHandle.click()
            console.log('Нажата кнопка "Сопроводительное письмо"');
        }

        // Вводим сопроводительное письмо
        const coverLetterInputHandle = await page.waitForSelector(
            coverLetterInputSelector,
            { visible: true, timeout: TIMEOUTS.SEARCH }).catch(() => null);

        if (coverLetterInputHandle) {
            await page.type(coverLetterInputSelector, coverLetter);
            console.log('Введено сопроводительное письмо');;
        } else {
            console.log('Обнаружена ошибка в сопроводительном письме');
            counters.unsuccessfullySubmittedCount++;
            await page.goBack({ waitUntil: 'domcontentloaded', timeout: TIMEOUTS.LONG });
            console.log('Предыдущая страница открыта');
        }

        // Кликаем на кнопку "Откликнуться" для отправки формы
        await page.click(responseSubmitSelector)
        console.log('Отправки формы на вакансию:');
        await new Promise(resolve => setTimeout(resolve, TIMEOUTS.SHORT));

        // Добавляем условия для проверки наличия ошибок в форме отклика
        const isInvalidTextareaVisible = await page.evaluate((SELECTORS) => {
            const textarea = document.querySelector(SELECTORS.BLOK_TEXTAREA);
            return textarea && textarea.classList.contains(SELECTORS.TEXTAREA_INVALID);
        }, SELECTORS);

        const isInvalidRadioVisible = await page.evaluate((SELECTORS) => {
            const radioLabel = document.querySelector(SELECTORS.BLOK_RADIO);
            return radioLabel && radioLabel.classList.contains(SELECTORS.RADIO_INVALID);
        }, SELECTORS);
        
        const isInvalidCheckboxVisible = await page.evaluate((SELECTORS) => {
            const radioLabel = document.querySelector(SELECTORS.BLOCK_CHECKBOX);
            return radioLabel && radioLabel.classList.contains(SELECTORS.BLOCK_CHECKBOX_INVALID);
        }, SELECTORS);

        // Проверяем наличие ошибок в форме отклика
        if (isInvalidTextareaVisible || isInvalidRadioVisible || isInvalidCheckboxVisible) {
            console.log('Обнаружена ошибка в форме отклика');
            counters.unsuccessfullySubmittedCount++;
            await page.goBack({ waitUntil: 'domcontentloaded', timeout: TIMEOUTS.LONG });
            console.log('Предыдущая страница открыта');

             // Сохраняем вакансию с флагом N
             await saveVacancy(data);
             console.log(`Вакансия с ID ${data.id} сохранена с флагом N`);
        } else {
            counters.successfullySubmittedCount++;
            data.vacancyStatus = true;
            await saveVacancy(data);
            console.log(`Вакансия с ID ${data.id} сохранена с флагом Y`);
        }
    } catch (error) {
        console.error('Ошибка во время обработки вакансии:', error);
    }
};