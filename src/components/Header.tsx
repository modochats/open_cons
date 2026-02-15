'use client'

import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'
import { useAuth } from '@/contexts/AuthContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { AuthButton } from '@/components/auth/AuthButton'

export function Header() {
  const { t } = useI18n()
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-dark-700 bg-dark-900/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-medium text-white hover:text-neon-purple transition-colors">
          Open Cons
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-300 hover:text-white transition-colors">
            {t('navigation.home')}
          </Link>
          <Link href="/questions" className="text-gray-300 hover:text-white transition-colors">
            {t('navigation.questions')}
          </Link>
          {user && (
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
              {t('navigation.dashboard')}
            </Link>
          )}
          <LanguageSwitcher />
          <AuthButton />
        </div>
      </nav>
    </header>
  )
}
