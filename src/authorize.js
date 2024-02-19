// src/authorize.js
import { SELECTORS } from '../constants.js';

// Функция для авторизации
export async function authorize(page) {
    const email = process.env.MY_EMAIL;
    await page.click(SELECTORS.LOGIN);
    await page.waitForSelector(SELECTORS.EMAIL_INPUT, { visible: true });
    await page.type(SELECTORS.EMAIL_INPUT, email);
    await page.click(SELECTORS.EMAIL_SUBMIT);
}