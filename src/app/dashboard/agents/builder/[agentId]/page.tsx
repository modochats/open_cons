'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  BackgroundVariant,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'
import { Header } from '@/components/Header'
import { nodeTypes } from '@/components/flow/nodeTypes'

const defaultNodes: Node[] = [
  { id: 'trigger-1', type: 'trigger', position: { x: 250, y: 0 }, data: { label: 'Question Created', sends: ['question'] } },
  { id: 'agent-1', type: 'agent', position: { x: 250, y: 120 }, data: { label: 'AI Agent' } },
  { id: 'response-1', type: 'response', position: { x: 250, y: 240 }, data: { label: 'Post Answer' } },
]
const defaultEdges: Edge[] = [
  { id: 'e-trigger-agent', source: 'trigger-1', target: 'agent-1' },
  { id: 'e-agent-response', source: 'agent-1', target: 'response-1' },
]

function makeId(type: string) {
  return `${type}-${Date.now()}`
}

const QUESTION_FIELDS = [
  { key: 'id', placeholder: '{{question.id}}' },
  { key: 'title', placeholder: '{{question.title}}' },
  { key: 'content', placeholder: '{{question.content}}' },
  { key: 'category', placeholder: '{{question.category}}' },
  { key: 'status', placeholder: '{{question.status}}' },
  { key: 'created_at', placeholder: '{{question.created_at}}' },
] as const

const PREVIOUS_OUTPUT_PLACEHOLDER = '{{previous_output}}'

const DROPPABLE_PLACEHOLDERS = new Set([
  ...QUESTION_FIELDS.map((f) => f.placeholder),
  PREVIOUS_OUTPUT_PLACEHOLDER,
])

function FlowBuilderInner({ flowId }: { agentId: string; flowId: string }) {
  const { t } = useI18n()
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges)
  const [saving, setSaving] = useState(false)
  const [flowName, setFlowName] = useState('')

  const onConnect = useCallback((connection: Connection) => setEdges((eds) => addEdge(connection, eds)), [setEdges])

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [llmConfigs, setLlmConfigs] = useState<{ id: string; name: string; api_base_url: string }[]>([])
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null)

  const addNode = useCallback(
    (type: 'trigger' | 'agent' | 'response') => {
      const id = makeId(type)
      const label = t(`dashboard.nodes.${type}`)
      const y = Math.max(0, ...nodes.map((n) => (n.position?.y ?? 0) + 80))
      const data: Record<string, unknown> = { label }
      if (type === 'trigger') data.sends = ['question']
      setNodes((nds) => [...nds, { id, type, position: { x: 250, y }, data }])
    },
    [nodes, setNodes, t]
  )

  const onNodeClick = useCallback((_e: React.MouseEvent, node: Node) => {
    setSelectedAgentId(node.type === 'agent' ? node.id : null)
  }, [])

  const selectedAgent = selectedAgentId ? nodes.find((n) => n.id === selectedAgentId) : null
  const incomingToSelected = selectedAgentId ? edges.filter((e) => e.target === selectedAgentId) : []
  const sourceNodesOfSelected = selectedAgentId
    ? nodes.filter((n) => incomingToSelected.some((e) => e.source === n.id))
    : []
  const hasInputFromAgent = sourceNodesOfSelected.some((n) => n.type === 'agent')

  useEffect(() => {
    fetch('/api/llm-config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setLlmConfigs(Array.isArray(data) ? data : []))
      .catch(() => setLlmConfigs([]))
  }, [])

  useEffect(() => {
    fetch(`/api/flows/${flowId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(async (flow) => {
        if (!flow) return
        if (flow?.name) setFlowName(flow.name)
        if (flow?.nodes?.length && flow?.edges?.length) {
          setNodes(flow.nodes)
          setEdges(flow.edges)
          return
        }
        const payload = { nodes: defaultNodes, edges: defaultEdges }
        const res = await fetch(`/api/flows/${flowId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          setNodes(defaultNodes)
          setEdges(defaultEdges)
        }
      })
      .catch(() => {})
  }, [flowId, setNodes, setEdges])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/flows/${flowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: nodes.map((n) => ({
            id: n.id,
            type: n.type,
            position: n.position,
            data: n.data,
          })),
          edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
          ...(flowName && { name: flowName }),
        }),
      })
      if (!res.ok) throw new Error()
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  const updateAgentData = useCallback(
    (updates: Record<string, unknown>) => {
      if (!selectedAgentId) return
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedAgentId ? { ...n, data: { ...n.data, ...updates } } : n
        )
      )
    },
    [selectedAgentId, setNodes]
  )

  const insertPromptPlaceholder = useCallback(
    (placeholder: string) => {
      const el = promptTextareaRef.current
      const current = (selectedAgent?.data?.systemPrompt as string) ?? ''
      if (el) {
        const start = el.selectionStart ?? current.length
        const end = el.selectionEnd ?? current.length
        const next = current.slice(0, start) + placeholder + current.slice(end)
        updateAgentData({ systemPrompt: next })
        requestAnimationFrame(() => {
          el.focus()
          const pos = start + placeholder.length
          el.setSelectionRange(pos, pos)
        })
      } else {
        updateAgentData({ systemPrompt: current + placeholder })
      }
    },
    [selectedAgent?.data?.systemPrompt, updateAgentData]
  )

  const onPromptDrop = useCallback(
    (e: React.DragEvent<HTMLTextAreaElement>) => {
      e.preventDefault()
      const placeholder = e.dataTransfer.getData('text/plain')
      if (placeholder && DROPPABLE_PLACEHOLDERS.has(placeholder)) {
        insertPromptPlaceholder(placeholder)
      }
    },
    [insertPromptPlaceholder]
  )

  const onPromptDragOver = useCallback((e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center gap-4 border-b border-dark-700 bg-dark-800 px-4 py-2">
        <Link
          href="/dashboard"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← {t('dashboard.backToDashboard')}
        </Link>
        <input
          type="text"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          placeholder={t('dashboard.flowName')}
          className="flex-1 rounded border border-dark-600 bg-dark-700 px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none"
        />
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-neon-purple px-4 py-1.5 text-sm font-medium text-white hover:bg-neon-purple/90 disabled:opacity-50"
        >
          {saving ? t('common.loading') : t('dashboard.saveFlow')}
        </button>
      </div>
      <div className="relative flex-1 bg-dark-900">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={() => setSelectedAgentId(null)}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          colorMode="dark"
          proOptions={{ hideAttribution: true }}
          deleteKeyCode={['Backspace', 'Delete']}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} className="!bg-dark-900" />
          <Panel position="top-left" className="flex gap-2 rounded-lg border border-dark-600 bg-dark-800 p-2">
            <button
              type="button"
              onClick={() => addNode('trigger')}
              className="rounded border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 text-sm text-amber-400 hover:bg-amber-500/20"
            >
              + {t('dashboard.nodes.trigger')}
            </button>
            <button
              type="button"
              onClick={() => addNode('agent')}
              className="rounded border border-neon-purple/50 bg-neon-purple/10 px-3 py-1.5 text-sm text-neon-purple hover:bg-neon-purple/20"
            >
              + {t('dashboard.nodes.agent')}
            </button>
            <button
              type="button"
              onClick={() => addNode('response')}
              className="rounded border border-neon-blue/50 bg-neon-blue/10 px-3 py-1.5 text-sm text-neon-blue hover:bg-neon-blue/20"
            >
              + {t('dashboard.nodes.response')}
            </button>
          </Panel>
          <Controls className="!bg-dark-800 !border-dark-600 !rounded-lg [&>button]:!bg-dark-700 [&>button]:!text-white [&>button]:!border-0 [&>button:hover]:!bg-dark-600" />
        </ReactFlow>
        {selectedAgent && (
          <div className="absolute right-0 top-0 z-10 flex h-full w-[320px] flex-col border-l border-dark-600 bg-dark-800 shadow-xl">
            <div className="flex items-center justify-between border-b border-dark-600 px-4 py-3">
              <span className="font-medium text-white">{t('dashboard.agentConfig')}</span>
              <button
                type="button"
                onClick={() => setSelectedAgentId(null)}
                className="rounded p-1 text-gray-400 hover:bg-dark-700 hover:text-white"
                aria-label={t('dashboard.closeConfig')}
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">{t('dashboard.selectLlmForAgent')}</label>
                <select
                  value={(selectedAgent.data?.llm_config_id as string) ?? ''}
                  onChange={(e) => updateAgentData({ llm_config_id: e.target.value || undefined })}
                  className="mt-1 w-full rounded border border-dark-600 bg-dark-700 px-3 py-2 text-sm text-white focus:border-neon-purple focus:outline-none"
                >
                  <option value="">{t('dashboard.selectLlm')}</option>
                  {llmConfigs.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">{t('dashboard.model')}</label>
                <input
                  type="text"
                  value={(selectedAgent.data?.model as string) ?? ''}
                  onChange={(e) => updateAgentData({ model: e.target.value })}
                  placeholder={t('dashboard.modelPlaceholder')}
                  className="mt-1 w-full rounded border border-dark-600 bg-dark-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">{t('dashboard.systemPrompt')}</label>
                <textarea
                  ref={promptTextareaRef}
                  value={(selectedAgent.data?.systemPrompt as string) ?? ''}
                  onChange={(e) => updateAgentData({ systemPrompt: e.target.value })}
                  onDrop={onPromptDrop}
                  onDragOver={onPromptDragOver}
                  placeholder={t('dashboard.systemPromptPlaceholder')}
                  rows={6}
                  className="mt-1 w-full resize-y rounded border border-dark-600 bg-dark-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">{t('dashboard.inputsFromTrigger')}</label>
                <p className="mt-1 mb-2 text-xs text-gray-500">{t('dashboard.dragIntoPrompt')}</p>
                <div className="flex flex-wrap gap-2">
                  {QUESTION_FIELDS.map(({ key, placeholder }) => (
                    <span
                      key={key}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', placeholder)
                        e.dataTransfer.effectAllowed = 'copy'
                      }}
                      className="cursor-grab rounded border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-xs text-amber-300 active:cursor-grabbing"
                    >
                      {t(`dashboard.questionFields.${key}`)} <code className="text-amber-400/90">{placeholder}</code>
                    </span>
                  ))}
                </div>
              </div>
              {hasInputFromAgent && (
                <div>
                  <label className="block text-sm font-medium text-gray-300">{t('dashboard.previousOutput')}</label>
                  <p className="mt-1 mb-2 text-xs text-gray-500">{t('dashboard.dragIntoPrompt')}</p>
                  <span
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', PREVIOUS_OUTPUT_PLACEHOLDER)
                      e.dataTransfer.effectAllowed = 'copy'
                    }}
                    className="inline-flex cursor-grab rounded border border-neon-purple/50 bg-neon-purple/10 px-2 py-1 text-xs text-neon-purple active:cursor-grabbing"
                  >
                    {t('dashboard.previousOutput')} <code className="text-neon-purple/90">{PREVIOUS_OUTPUT_PLACEHOLDER}</code>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BuilderPage({
  params,
}: {
  params: Promise<{ agentId: string }>
}) {
  const [resolved, setResolved] = useState<{ agentId: string; flowId: string } | null>(null)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/login')
      return
    }
    params.then(async (p) => {
      const agentId = p.agentId
      let flowId = agentId
      const flowsRes = await fetch(`/api/agents/${agentId}/flows`)
      if (flowsRes.ok) {
        const flows = await flowsRes.json()
        if (Array.isArray(flows) && flows.length > 0) {
          flowId = flows[0].id
        } else {
          const createRes = await fetch(`/api/agents/${agentId}/flows`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Default Flow', nodes: defaultNodes, edges: defaultEdges }),
          })
          if (createRes.ok) {
            const flow = await createRes.json()
            flowId = flow.id
          }
        }
      }
      setResolved({ agentId, flowId })
    })
  }, [user, loading, router, params])

  if (loading || !user) {
    return (
      <>
        <Header />
        <main className="flex items-center justify-center py-24">
          <div className="h-10 w-10 border-2 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin" />
        </main>
      </>
    )
  }

  if (!user) return null

  if (!resolved) {
    return (
      <>
        <Header />
        <main className="flex items-center justify-center py-24">
          <div className="h-10 w-10 border-2 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin" />
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <ReactFlowProvider>
        <FlowBuilderInner flowId={resolved.flowId} agentId={resolved.agentId} />
      </ReactFlowProvider>
    </>
  )
}
