'use client'

import { useI18n } from '@/contexts/I18nContext'
import { Header } from '@/components/Header'

export default function QuestionsPage() {
  const { t } = useI18n()

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-white">{t('questions.title')}</h1>
        <p className="mt-4 text-gray-400">{t('questions.noQuestions')}</p>
      </main>
    </>
  )
}
