//index.js
import puppeteer from 'puppeteer';
import { browserConfig } from './config.js';
import { personalData } from './secrets.js';
import { confirmCode } from './src/confirmCode.js';
import { searchForVacancy } from './src/searchForVacancy.js';
import { navigateAndProcessVacancies } from './src/navigateAndProcessVacancies.js';
import { authorize } from './src/authorize.js';
import * as dotenv from 'dotenv';
dotenv.config();

const { vacanciesUrl } = personalData;
let counters = {
    successfullySubmittedCount: 0,
    unsuccessfullySubmittedCount: 0
};
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
        await searchForVacancy(page);
        await navigateAndProcessVacancies(page, counters);

        console.log(`Общее количество успешно отправленных форм: ${counters.successfullySubmittedCount}`);
        // Закрытие браузера
        await browser.close();
    } catch (err) {
        console.error('Ошибка во время исполнения скрипта:', err);
    }
})();