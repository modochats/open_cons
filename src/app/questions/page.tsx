'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'

type Question = { id: string; title: string; content: string; category: string | null; status: string; user_id: string | null; created_at: string; updated_at: string }

export default function QuestionsPage() {
  const { t } = useI18n()
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    fetch('/api/questions')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setQuestions(Array.isArray(data) ? data : []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!title.trim() || !content.trim()) {
      setError('title and content required')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category: category.trim() || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Failed')
        return
      }
      setTitle('')
      setContent('')
      setCategory('')
      setShowForm(false)
      load()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">{t('questions.title')}</h1>
          {user && (
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="rounded-lg bg-neon-purple px-4 py-2 font-medium text-white hover:bg-neon-purple/90"
            >
              {showForm ? t('common.cancel') : t('questions.askQuestion')}
            </button>
          )}
        </div>

        {showForm && user && (
          <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-dark-700 bg-dark-800 p-4 space-y-4">
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div>
              <label className="block text-sm text-gray-400">{t('questions.questionTitle')}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded border border-dark-600 bg-dark-700 px-3 py-2 text-white focus:border-neon-purple focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400">{t('questions.questionDetails')}</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="mt-1 w-full rounded border border-dark-600 bg-dark-700 px-3 py-2 text-white focus:border-neon-purple focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400">{t('questions.category')}</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full max-w-xs rounded border border-dark-600 bg-dark-700 px-3 py-2 text-white focus:border-neon-purple focus:outline-none"
              />
            </div>
            <button type="submit" disabled={submitting} className="rounded-lg bg-neon-purple px-4 py-2 text-white hover:bg-neon-purple/90 disabled:opacity-50">
              {submitting ? t('common.loading') : t('questions.submit')}
            </button>
          </form>
        )}

        {loading ? (
          <div className="mt-8 flex justify-center">
            <div className="h-8 w-8 border-2 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin" />
          </div>
        ) : questions.length === 0 ? (
          <p className="mt-8 text-gray-400">{t('questions.noQuestions')}</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {questions.map((q) => (
              <li key={q.id} className="rounded-xl border border-dark-700 bg-dark-800 p-4">
                <Link href={`/questions/${q.id}`} className="block group">
                  <h2 className="font-medium text-white group-hover:text-neon-purple transition-colors">{q.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-400">{q.content}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    {q.category && <span>{q.category}</span>}
                    <span>{q.status}</span>
                    <span>{new Date(q.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  )
}
