'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'

export function AuthButton() {
  const { user, loading } = useAuth()
  const { t } = useI18n()
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="w-8 h-8 border-2 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin" />
    )
  }

  if (user) {
    return (
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300 disabled:opacity-50"
      >
        {loggingOut ? t('common.loading') : t('auth.logout')}
      </button>
    )
  }

  return (
    <div className="flex gap-3">
      <Link
        href="/login"
        className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
      >
        {t('auth.login')}
      </Link>
      <Link
        href="/register"
        className="px-4 py-2 bg-neon-purple/20 border border-neon-purple text-neon-purple rounded-lg hover:bg-neon-purple hover:text-white transition-all duration-300"
      >
        {t('auth.register')}
      </Link>
    </div>
  )
}
