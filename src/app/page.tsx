'use client'

import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'
import { Header } from '@/components/Header'

export default function HomePage() {
  const { t } = useI18n()

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <section className="text-center">
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            {t('home.title')}
          </h1>
          <p className="mt-4 text-xl text-gray-400">
            {t('home.subtitle')}
          </p>
          <p className="mt-2 text-gray-500">
            {t('home.description')}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/questions"
              className="rounded-lg bg-neon-purple px-6 py-3 font-medium text-white hover:bg-neon-purple/90 transition-colors"
            >
              {t('home.launchApp')}
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-neon-purple px-6 py-3 font-medium text-neon-purple hover:bg-neon-purple/10 transition-colors"
            >
              {t('navigation.dashboard')}
            </Link>
          </div>
        </section>
        <section className="mt-24 grid gap-8 md:grid-cols-3">
          <div className="rounded-xl border border-dark-700 bg-dark-800 p-6">
            <h3 className="text-lg font-medium text-neon-purple">{t('home.features.fast.title')}</h3>
            <p className="mt-2 text-gray-400">{t('home.features.fast.desc')}</p>
          </div>
          <div className="rounded-xl border border-dark-700 bg-dark-800 p-6">
            <h3 className="text-lg font-medium text-neon-purple">{t('home.features.modern.title')}</h3>
            <p className="mt-2 text-gray-400">{t('home.features.modern.desc')}</p>
          </div>
          <div className="rounded-xl border border-dark-700 bg-dark-800 p-6">
            <h3 className="text-lg font-medium text-neon-purple">{t('home.features.beautiful.title')}</h3>
            <p className="mt-2 text-gray-400">{t('home.features.beautiful.desc')}</p>
          </div>
        </section>
      </main>
    </>
  )
}
