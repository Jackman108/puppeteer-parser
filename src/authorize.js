// src/authorize.js
// Функция для авторизации
export async function authorize(page) {
    const email = process.env.MY_EMAIL;
    await page.click('[data-qa="login"]');
    await page.waitForSelector('[data-qa="account-signup-email"]', { visible: true });
    await page.type('[data-qa="account-signup-email"]', email);
    await page.click('[data-qa="account-signup-submit"]');
}