'use client'

import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'
import { Header } from '@/components/Header'

export default function NotFound() {
  const { t } = useI18n()

  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-24">
        <h1 className="text-6xl font-bold text-gray-500">404</h1>
        <p className="mt-4 text-xl text-gray-400">{t('common.error')}</p>
        <p className="mt-2 text-gray-500">Page not found</p>
        <Link
          href="/"
          className="mt-8 rounded-lg bg-neon-purple px-6 py-3 font-medium text-white hover:bg-neon-purple/90 transition-colors"
        >
          {t('navigation.home')}
        </Link>
      </main>
    </>
  )
}
