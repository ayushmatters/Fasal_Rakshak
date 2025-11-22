import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import translations
import en from './locales/en/translation.json'
import hi from './locales/hi/translation.json'

const resources = {
  en: { translation: en },
  hi: { translation: hi }
}

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('language') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

export default i18n
