'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'

function getDisplayName(user: { user_metadata?: { username?: string }; email?: string | null }): string {
  const username = user?.user_metadata?.username
  if (username && typeof username === 'string') return username
  return user?.email?.split('@')[0] ?? 'User'
}

function getInitials(user: { user_metadata?: { username?: string }; email?: string | null }): string {
  const name = getDisplayName(user)
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return (name[0] ?? 'U').toUpperCase()
}

export function AuthButton() {
  const { user, loading } = useAuth()
  const { t } = useI18n()
  const [loggingOut, setLoggingOut] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    setLoggingOut(true)
    setMenuOpen(false)
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="w-8 h-8 border-2 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin" />
    )
  }

  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url
    const displayName = getDisplayName(user)
    const initials = getInitials(user)

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-gray-300 hover:bg-dark-700 hover:text-white transition-colors"
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neon-purple/30 text-sm font-medium text-neon-purple">
              {initials}
            </span>
          )}
          <span className="max-w-[120px] truncate text-sm font-medium">{displayName}</span>
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" aria-hidden onClick={() => setMenuOpen(false)} />
            <div className="absolute end-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-dark-700 bg-dark-800 py-1 shadow-lg">
              <div className="border-b border-dark-700 px-3 py-2">
                <p className="truncate text-sm font-medium text-white">{displayName}</p>
                <p className="truncate text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                {loggingOut ? t('common.loading') : t('auth.logout')}
              </button>
            </div>
          </>
        )}
      </div>
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
