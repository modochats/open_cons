'use client'

import { useI18n } from '@/contexts/I18nContext'

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()

  const switchLocale = () => {
    const newLocale = locale === 'fa' ? 'en' : 'fa'
    setLocale(newLocale)
  }

  return (
    <button
      onClick={switchLocale}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-neon-purple transition-colors"
      title={t('language.switch')}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
      <span>{locale === 'fa' ? t('language.english') : t('language.persian')}</span>
    </button>
  )
}
