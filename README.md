# Puppeteer Parser

Проект Puppeteer Parser предназначен для автоматизации процесса отклика на вакансии на сайте [HeadHunter](https://hh.ru).

## Установка

Для начала убедитесь, что у вас установлены [Node.js](https://nodejs.org/) и [npm](https://www.npmjs.com/). Затем выполните следующие шаги:

1. Клонируйте репозиторий:

git clone https://github.com/Jackman108/puppeteer-parser.git

2. Перейдите в директорию проекта:
cd puppeteer-parser

3. Установите и обновите зависимости:
npm install

npm update

## Конфигурация

Создайте файл `.env` в корневой директории проекта со следующим содержимым:

MY_EMAIL=ваш_email@example.com

Создайте файл `secrets.js` в корневой директории проекта со следующим содержимым:

```bash

export const personalData = {
    vacanciesUrl: 'копируем url вакансий сайта с настроенными фильтрами',

    vacancySearch: 'искомая должность',

    coverLetter: 'сопроводительное письмо',

    totalPages: количество страниц которые обработать(цифрой),
};

```

## Запуск скрипта

Выполните скрипт командой:

npm start


## Описание работы скрипта

Скрипт выполняет следующие действия:

- Запускает браузер Puppeteer.
- Открывает сайт HeadHunter и автоматически проходит процесс авторизации.
- Перебирает вакансии и автоматически отправляет отклики на них.

## Важные замечания

- Убедитесь, что у вас настроен правильный путь к исполняемому файлу браузера в `index.js`.
- Проверьте актуальность селекторов на сайте, так как они могут меняться.

## Лицензия

[ISC](LICENSE)