// src/confirmCode.js
import { SELECTORS } from '../constants.js';

// Функция подтверждения кода
export async function confirmCode(page) {
    try {
        console.log('Ожидание появления поля ввода OTP...');
        const codeInputSelector = SELECTORS.OTP_CODE_INPUT;
        await page.waitForSelector(codeInputSelector, { visible: true });

        const otpCodeInput = await page.$(codeInputSelector);
        await page.waitForFunction((input) => input.value.length === 4, {}, otpCodeInput);
        console.log('Поле ввода OTP заполнено.');

        const submitButtonSelector = SELECTORS.OTP_SUBMIT;
        await page.waitForSelector(submitButtonSelector, { visible: true });
        await page.click(submitButtonSelector);
        console.log('Подтверждение OTP выполнено.');
    } catch (error) {
        console.error('Ошибка при подтверждении входа:', error);
        throw error;
    }
}