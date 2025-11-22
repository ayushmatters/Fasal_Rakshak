import React from 'react'
import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' }
]

const LanguageSelector = () => {
  const { i18n } = useTranslation()

  const handleChange = (e) => {
    const lng = e.target.value
    i18n.changeLanguage(lng)
    try { localStorage.setItem('language', lng) } catch (e) {}
  }

  const current = i18n.language || localStorage.getItem('language') || 'en'

  return (
    <select aria-label="Select language" value={current} onChange={handleChange} className="border-2 border-emerald-600 rounded-lg px-4 py-2 text-sm font-semibold text-emerald-700 bg-white hover:bg-emerald-50 transition-colors cursor-pointer">
      {languages.map(l => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  )
}

export default LanguageSelector
