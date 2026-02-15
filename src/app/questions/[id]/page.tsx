'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'

type Question = { id: string; title: string; content: string; category: string | null; status: string; user_id: string | null; created_at: string; updated_at: string }
type Answer = { id: string; agent_id: string | null; agent_name: string | null; flow_id: string | null; content: string; is_ai: boolean; created_at: string }

export default function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useI18n()
  const { user } = useAuth()
  const [id, setId] = useState<string | null>(null)
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])

  useEffect(() => {
    params.then((p) => setId(p.id))
  }, [params])

  const isOwner = user && question && question.user_id === user.id

  const load = useCallback(() => {
    if (!id) return
    Promise.all([
      fetch(`/api/questions/${id}`).then((res) => (res.ok ? res.json() : null)),
      fetch(`/api/questions/${id}/answers`).then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([data, answersData]) => {
        setQuestion(data)
        setAnswers(Array.isArray(answersData) ? answersData : [])
        if (data) {
          setTitle(data.title)
          setContent(data.content)
          setCategory(data.category ?? '')
        }
      })
      .catch(() => setQuestion(null))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const startEdit = useCallback(() => {
    if (question) {
      setTitle(question.title)
      setContent(question.content)
      setCategory(question.category ?? '')
      setEditing(true)
    }
  }, [question])

  const saveEdit = useCallback(async () => {
    if (!id) return
    setError(null)
    setSaving(true)
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'PATCH',
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
      const updated = await res.json()
      setQuestion(updated)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }, [id, title, content, category])

  if (!id || loading) {
    return (
      <>
        <Header />
        <main className="mx-auto flex max-w-6xl justify-center px-4 py-24">
          <div className="h-10 w-10 border-2 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin" />
        </main>
      </>
    )
  }

  if (!question) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <p className="text-gray-400">{t('common.error')}</p>
          <Link href="/questions" className="mt-4 inline-block text-neon-purple hover:underline">{t('questions.backToList')}</Link>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Link href="/questions" className="text-sm text-gray-400 hover:text-white">{t('questions.backToList')}</Link>

        {editing && isOwner ? (
          <div className="mt-6 rounded-xl border border-dark-700 bg-dark-800 p-4 space-y-4">
            <h2 className="text-lg font-medium text-white">{t('questions.editQuestion')}</h2>
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
                rows={6}
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
            <div className="flex gap-2">
              <button type="button" onClick={saveEdit} disabled={saving} className="rounded-lg bg-neon-purple px-4 py-2 text-white hover:bg-neon-purple/90 disabled:opacity-50">
                {saving ? t('common.loading') : t('questions.saveChanges')}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-dark-600 px-4 py-2 text-gray-400 hover:bg-dark-700">
                {t('common.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <article className="mt-6 rounded-xl border border-dark-700 bg-dark-800 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-white">{question.title}</h1>
                <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                  {question.category && <span>{question.category}</span>}
                  <span>{question.status}</span>
                  <span>{new Date(question.created_at).toLocaleString()}</span>
                </div>
                <div className="mt-4 text-gray-300 whitespace-pre-wrap">{question.content}</div>
              </div>
              {isOwner && (
                <button type="button" onClick={startEdit} className="shrink-0 rounded-lg border border-neon-purple/50 px-3 py-1.5 text-sm text-neon-purple hover:bg-neon-purple/10">
                  {t('questions.editQuestion')}
                </button>
              )}
            </div>
          </article>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-white">{t('questions.answers')}</h2>
          {answers.length === 0 ? (
            <p className="mt-2 text-gray-400">{t('questions.noAnswers')}</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {answers.map((a) => (
                <li key={a.id} className="rounded-xl border border-dark-700 bg-dark-800 p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    {a.agent_name ? (
                      <span>{t('questions.answeredBy')}: <strong className="text-neon-purple">{a.agent_name}</strong></span>
                    ) : (
                      <span>{t('questions.answeredBy')}: —</span>
                    )}
                    <span>{new Date(a.created_at).toLocaleString()}</span>
                    {a.is_ai && <span className="rounded bg-neon-purple/20 px-1.5 py-0.5 text-xs text-neon-purple">AI</span>}
                  </div>
                  <div className="mt-3 text-gray-300 whitespace-pre-wrap">{a.content}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  )
}

