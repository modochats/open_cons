'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/contexts/I18nContext'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'

export default function DashboardPage() {
  const { t } = useI18n()
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <>
        <Header />
        <main className="mx-auto flex max-w-6xl items-center justify-center px-4 py-24">
          <div className="h-10 w-10 border-2 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin" />
        </main>
      </>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-white">{t('dashboard.title')}</h1>
        <p className="mt-4 text-gray-400">{t('dashboard.noAgents')}</p>
      </main>
    </>
  )
}
