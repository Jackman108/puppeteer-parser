export const TIMEOUTS = {
    SHORT: 1000,
    LONG: 60000,
    MODAL: 20000,
    SEARCH: 10000
};

export const SELECTORS = {
    COOKIE_ACCEPT: '[data-qa="cookies-policy-informer-accept"]',
    LOGIN: '[data-qa="login"]',
    EMAIL_INPUT: '[data-qa="account-signup-email"]',
    EMAIL_SUBMIT: '[data-qa="account-signup-submit"]',
    OTP_CODE_INPUT: 'input[data-qa="otp-code-input"]',
    OTP_SUBMIT: '[data-qa="otp-code-submit"]',
    VACANCY_RESPONSE: '[data-qa="vacancy-serp__vacancy_response"]',
    VACANCY_INPUT: '#a11y-search-input',
    RESPONSE_BUTTON_SPAN: '[data-qa="vacancy-serp__vacancy_response"] span',
    PAGER_NEXT: '[data-qa="pager-next"]',
    RELOCATION_MODAL_TITLE: '.bloko-modal .bloko-modal-header [data-qa="relocation-warning-title"]',
    RELOCATION_CONFIRM: '[data-qa="relocation-warning-confirm"]',
    COVER_LETTER_TOGGLE: '[data-qa="vacancy-response-letter-toggle"]',
    RESPONSE_SUBMIT: '[data-qa="vacancy-response-submit-popup"] span',
    COVER_LETTER_INPUT: '[data-qa="vacancy-response-popup-form-letter-input"]',
    BLOK_TEXTAREA: 'textarea',
    TEXTAREA_INVALID: 'bloko-textarea_invalid',
    BLOK_RADIO: 'label.bloko-radio',
    RADIO_INVALID: 'bloko-radio_invalid',
};