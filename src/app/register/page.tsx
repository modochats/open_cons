'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/contexts/I18nContext'
import { Header } from '@/components/Header'

export default function RegisterPage() {
  const { t } = useI18n()
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'))
      return
    }
    if (password.length < 6) {
      setError(t('auth.passwordTooShort'))
      return
    }
    setLoading(true)
    const { error: err } = await supabase.auth.signUp({ email, password, options: { data: { username } } })
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
        <h1 className="text-2xl font-bold text-white">{t('auth.welcome')}</h1>
        <p className="mt-2 text-gray-400">{t('auth.registerDescription')}</p>
        <form onSubmit={handleSubmit} className="mt-8 w-full space-y-4">
          {error && (
            <p className="rounded-lg bg-red-500/10 border border-red-500/50 px-4 py-2 text-sm text-red-400">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="username" className="block text-sm text-gray-400">
              {t('auth.username')}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-dark-700 bg-dark-800 px-4 py-2 text-white focus:border-neon-purple focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm text-gray-400">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-dark-700 bg-dark-800 px-4 py-2 text-white focus:border-neon-purple focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-gray-400">
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full rounded-lg border border-dark-700 bg-dark-800 px-4 py-2 text-white focus:border-neon-purple focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm text-gray-400">
              {t('auth.confirmPassword')}
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full rounded-lg border border-dark-700 bg-dark-800 px-4 py-2 text-white focus:border-neon-purple focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-neon-purple py-2 font-medium text-white hover:bg-neon-purple/90 transition-colors disabled:opacity-50"
          >
            {loading ? t('auth.registering') : t('auth.registerButton')}
          </button>
        </form>
        <p className="mt-6 text-gray-400">
          {t('auth.hasAccount')}{' '}
          <Link href="/login" className="text-neon-purple hover:underline">
            {t('auth.signIn')}
          </Link>
        </p>
      </main>
    </>
  )
}
