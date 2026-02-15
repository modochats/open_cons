'use client'

import { Fragment, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/contexts/I18nContext'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'

type Agent = { id: string; name: string; description: string | null; avatar_url: string | null; is_active: boolean; created_at: string; updated_at: string }
type LlmConfigItem = { id: string; name: string; api_base_url: string }
type RunLog = {
  id: string
  flow_run_id: string
  question_id: string
  question_title: string | null
  agent_id: string | null
  agent_name: string | null
  node_id: string
  status: string
  model: string | null
  error_message: string | null
  response_content: string | null
  created_at: string
}

export default function DashboardPage() {
  const { t } = useI18n()
  const { user, loading } = useAuth()
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loadingAgents, setLoadingAgents] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [llmConfigs, setLlmConfigs] = useState<LlmConfigItem[]>([])
  const [llmFormOpen, setLlmFormOpen] = useState(false)
  const [editingLlmId, setEditingLlmId] = useState<string | null>(null)
  const [llmName, setLlmName] = useState('')
  const [llmBaseUrl, setLlmBaseUrl] = useState('')
  const [llmApiKey, setLlmApiKey] = useState('')
  const [savingLlm, setSavingLlm] = useState(false)
  const [deletingLlmId, setDeletingLlmId] = useState<string | null>(null)
  const [runLogs, setRunLogs] = useState<RunLog[]>([])
  const [runLogsLoading, setRunLogsLoading] = useState(false)
  const [runLogsAgentFilter, setRunLogsAgentFilter] = useState<string>('')
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)

  const loadRunLogs = useCallback(() => {
    setRunLogsLoading(true)
    const params = new URLSearchParams()
    if (runLogsAgentFilter) params.set('agent_id', runLogsAgentFilter)
    fetch(`/api/agent-runs?${params}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRunLogs(Array.isArray(data) ? data : []))
      .catch(() => setRunLogs([]))
      .finally(() => setRunLogsLoading(false))
  }, [runLogsAgentFilter])

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/login')
      return
    }
    fetch('/api/llm-config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setLlmConfigs(Array.isArray(data) ? data : []))
      .catch(() => setLlmConfigs([]))
    fetch('/api/agents')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setAgents(Array.isArray(data) ? data : []))
      .catch(() => setAgents([]))
      .finally(() => setLoadingAgents(false))
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    loadRunLogs()
  }, [user, runLogsAgentFilter, loadRunLogs])

  const startEdit = useCallback((agent: Agent) => {
    setEditingId(agent.id)
    setEditName(agent.name)
    setEditAvatarUrl(agent.avatar_url ?? '')
  }, [])

  const saveEdit = useCallback(async () => {
    if (!editingId) return
    setSavingEdit(true)
    try {
      const res = await fetch(`/api/agents/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), avatar_url: editAvatarUrl.trim() || null }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setAgents((prev) => prev.map((a) => (a.id === editingId ? { ...a, ...updated } : a)))
      setEditingId(null)
    } finally {
      setSavingEdit(false)
    }
  }, [editingId, editName, editAvatarUrl])

  const openLlmForm = useCallback((existing?: LlmConfigItem) => {
    if (existing) {
      setEditingLlmId(existing.id)
      setLlmName(existing.name)
      setLlmBaseUrl(existing.api_base_url)
    } else {
      setEditingLlmId(null)
      setLlmName('')
      setLlmBaseUrl('https://api.openai.com/v1')
    }
    setLlmApiKey('')
    setLlmFormOpen(true)
  }, [])

  const saveLlmConfig = useCallback(async () => {
    setSavingLlm(true)
    try {
      const body = {
        name: llmName.trim() || 'LLM',
        api_base_url: llmBaseUrl.trim() || 'https://api.openai.com/v1',
        ...(llmApiKey && { api_key: llmApiKey.trim() }),
      }
      if (editingLlmId) {
        const res = await fetch(`/api/llm-config/${editingLlmId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error()
        const updated = await res.json()
        setLlmConfigs((prev) => prev.map((c) => (c.id === editingLlmId ? updated : c)))
      } else {
        const res = await fetch('/api/llm-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error()
        const created = await res.json()
        setLlmConfigs((prev) => [...prev, created])
      }
      setLlmFormOpen(false)
      setEditingLlmId(null)
      setLlmApiKey('')
    } finally {
      setSavingLlm(false)
    }
  }, [editingLlmId, llmName, llmBaseUrl, llmApiKey])

  const deleteLlmConfig = useCallback(async (id: string) => {
    setDeletingLlmId(id)
    try {
      const res = await fetch(`/api/llm-config/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setLlmConfigs((prev) => prev.filter((c) => c.id !== id))
    } finally {
      setDeletingLlmId(null)
    }
  }, [])

  const createAgent = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: t('dashboard.myAgents'), description: '' }),
      })
      if (!res.ok) throw new Error()
      const agent = await res.json()
      const flowRes = await fetch(`/api/agents/${agent.id}/flows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Default Flow', nodes: [], edges: [] }),
      })
      router.push(`/dashboard/agents/builder/${agent.id}`)
    } catch {
      setCreating(false)
    }
  }

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

  if (!user) return null

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">{t('dashboard.title')}</h1>
          <button
            type="button"
            onClick={createAgent}
            disabled={creating}
            className="rounded-lg bg-neon-purple px-4 py-2 font-medium text-white hover:bg-neon-purple/90 transition-colors disabled:opacity-50"
          >
            {creating ? t('common.loading') : t('dashboard.createAgent')}
          </button>
        </div>
        <section className="mt-8 rounded-xl border border-dark-700 bg-dark-800 p-4">
          <h2 className="text-sm font-medium text-gray-300">{t('dashboard.llmConnection')}</h2>
          <p className="mt-1 text-xs text-gray-500">{t('dashboard.llmConnectionDesc')}</p>
          {llmFormOpen ? (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs text-gray-400">{t('dashboard.llmName')}</label>
                <input
                  type="text"
                  value={llmName}
                  onChange={(e) => setLlmName(e.target.value)}
                  placeholder={t('dashboard.llmNamePlaceholder')}
                  className="mt-1 w-full max-w-md rounded border border-dark-600 bg-dark-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400">{t('dashboard.apiBaseUrl')}</label>
                <input
                  type="url"
                  value={llmBaseUrl}
                  onChange={(e) => setLlmBaseUrl(e.target.value)}
                  placeholder={t('dashboard.apiBaseUrlPlaceholder')}
                  className="mt-1 w-full max-w-md rounded border border-dark-600 bg-dark-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400">{t('dashboard.apiKey')}</label>
                <input
                  type="password"
                  value={llmApiKey}
                  onChange={(e) => setLlmApiKey(e.target.value)}
                  placeholder={t('dashboard.apiKeyPlaceholder')}
                  autoComplete="off"
                  className="mt-1 w-full max-w-md rounded border border-dark-600 bg-dark-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveLlmConfig}
                  disabled={savingLlm}
                  className="rounded-lg bg-neon-purple px-4 py-2 text-sm text-white hover:bg-neon-purple/90 disabled:opacity-50"
                >
                  {savingLlm ? t('common.loading') : t('dashboard.saveLlmConfig')}
                </button>
                <button
                  type="button"
                  onClick={() => { setLlmFormOpen(false); setEditingLlmId(null) }}
                  className="rounded-lg border border-dark-600 px-4 py-2 text-sm text-gray-400 hover:bg-dark-700"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {llmConfigs.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded border border-dark-600 bg-dark-700/50 px-3 py-2">
                  <span className="font-medium text-white">{c.name}</span>
                  <span className="text-xs text-gray-500">{c.api_base_url}</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openLlmForm(c)} className="text-sm text-neon-purple hover:underline">{t('agent.edit')}</button>
                    <button type="button" onClick={() => deleteLlmConfig(c.id)} disabled={deletingLlmId === c.id} className="text-sm text-red-400 hover:underline disabled:opacity-50">{t('common.delete')}</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => openLlmForm()} className="rounded border border-neon-purple/50 px-3 py-1.5 text-sm text-neon-purple hover:bg-neon-purple/10">
                {t('dashboard.addLlm')}
              </button>
            </div>
          )}
        </section>
        {loadingAgents ? (
          <div className="mt-8 flex justify-center">
            <div className="h-8 w-8 border-2 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin" />
          </div>
        ) : agents.length === 0 ? (
          <p className="mt-8 text-gray-400">{t('dashboard.noAgents')}</p>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <li key={agent.id} className="rounded-xl border border-dark-700 bg-dark-800 p-4">
                {editingId === agent.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400">{t('agent.name')}</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="mt-1 w-full rounded border border-dark-600 bg-dark-700 px-3 py-2 text-sm text-white focus:border-neon-purple focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400">{t('agent.avatarUrl')}</label>
                      <input
                        type="url"
                        value={editAvatarUrl}
                        onChange={(e) => setEditAvatarUrl(e.target.value)}
                        placeholder="https://..."
                        className="mt-1 w-full rounded border border-dark-600 bg-dark-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveEdit}
                        disabled={savingEdit}
                        className="rounded-lg bg-neon-purple px-3 py-1.5 text-sm text-white hover:bg-neon-purple/90 disabled:opacity-50"
                      >
                        {savingEdit ? t('common.loading') : t('common.save')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-dark-600 px-3 py-1.5 text-sm text-gray-400 hover:bg-dark-700"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 gap-3">
                      {agent.avatar_url ? (
                        <img
                          src={agent.avatar_url}
                          alt={agent.name}
                          className="h-12 w-12 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neon-purple/30 text-lg font-medium text-neon-purple">
                          {(agent.name[0] ?? 'A').toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate font-medium text-white">{agent.name}</h2>
                        {agent.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-gray-400">{agent.description}</p>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                          {agent.is_active ? t('agent.active') : t('agent.inactive')}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(agent)}
                        className="rounded-lg border border-dark-600 px-3 py-1.5 text-sm text-gray-400 hover:bg-dark-700 hover:text-white"
                      >
                        {t('agent.edit')}
                      </button>
                      <Link
                        href={`/dashboard/agents/builder/${agent.id}`}
                        className="rounded-lg border border-neon-purple/50 px-3 py-1.5 text-sm text-neon-purple hover:bg-neon-purple/10 transition-colors"
                      >
                        {t('dashboard.flowBuilder')}
                      </Link>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <section className="mt-10 rounded-xl border border-dark-700 bg-dark-800 p-4">
          <h2 className="text-sm font-medium text-gray-300">{t('dashboard.runLogs')}</h2>
          <p className="mt-1 text-xs text-gray-500">{t('dashboard.runLogsDesc')}</p>
          <div className="mt-3 flex items-center gap-2">
            <label className="text-xs text-gray-400">{t('dashboard.filterByAgent')}</label>
            <select
              value={runLogsAgentFilter}
              onChange={(e) => setRunLogsAgentFilter(e.target.value)}
              onBlur={loadRunLogs}
              className="rounded border border-dark-600 bg-dark-700 px-2 py-1.5 text-sm text-white focus:border-neon-purple focus:outline-none"
            >
              <option value="">{t('dashboard.allAgents')}</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <button type="button" onClick={loadRunLogs} disabled={runLogsLoading} className="rounded border border-dark-600 px-2 py-1.5 text-xs text-gray-400 hover:bg-dark-700 disabled:opacity-50">{runLogsLoading ? t('common.loading') : t('common.refresh')}</button>
          </div>
          {runLogsLoading ? (
            <div className="mt-4 flex justify-center py-8">
              <div className="h-8 w-8 border-2 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin" />
            </div>
          ) : runLogs.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">{t('dashboard.noRunLogs')}</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-dark-600 text-gray-400">
                    <th className="pb-2 pr-2 font-medium">{t('dashboard.runTime')}</th>
                    <th className="pb-2 pr-2 font-medium">{t('dashboard.question')}</th>
                    <th className="pb-2 pr-2 font-medium">{t('agent.name')}</th>
                    <th className="pb-2 pr-2 font-medium">{t('dashboard.node')}</th>
                    <th className="pb-2 pr-2 font-medium">{t('dashboard.runStatus')}</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {runLogs.map((log) => (
                    <Fragment key={log.id}>
                      <tr className="border-b border-dark-700">
                        <td className="py-2 pr-2 text-gray-300 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="py-2 pr-2">
                          <Link href={`/questions/${log.question_id}`} className="text-neon-purple hover:underline truncate max-w-[160px] inline-block" title={log.question_title ?? undefined}>
                            {log.question_title ?? log.question_id.slice(0, 8)}
                          </Link>
                        </td>
                        <td className="py-2 pr-2 text-gray-300">{log.agent_name ?? '—'}</td>
                        <td className="py-2 pr-2 text-gray-400 font-mono">{log.node_id}</td>
                        <td className="py-2 pr-2">
                          <span className={log.status === 'error' ? 'text-red-400' : 'text-green-400'}>
                            {log.status === 'error' ? t('dashboard.runStatusError') : t('dashboard.runStatusSuccess')}
                          </span>
                        </td>
                        <td className="py-2">
                          {(log.error_message || log.response_content) && (
                            <button
                              type="button"
                              onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                              className="text-xs text-neon-purple hover:underline"
                            >
                              {expandedLogId === log.id ? t('common.close') : (log.error_message ? t('dashboard.runError') : t('dashboard.runResponse'))}
                            </button>
                          )}
                        </td>
                      </tr>
                      {expandedLogId === log.id && (log.error_message || log.response_content) && (
                        <tr>
                          <td colSpan={6} className="pb-2 pr-2">
                            <pre className="mt-1 max-h-40 overflow-auto rounded border border-dark-600 bg-dark-700 p-2 text-xs text-gray-300 whitespace-pre-wrap">
                              {log.error_message ?? log.response_content ?? ''}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
