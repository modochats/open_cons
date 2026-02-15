import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

type Node = { id: string; type?: string; data?: Record<string, unknown> }
type Edge = { id: string; source: string; target: string }

type LlmConfig = { api_base_url: string; api_key: string | null }

function getExecutionOrder(nodes: Node[], edges: Edge[]): string[] {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const outEdges = new Map<string, string[]>()
  const inEdges = new Map<string, string[]>()
  for (const e of edges) {
    if (!outEdges.has(e.source)) outEdges.set(e.source, [])
    outEdges.get(e.source)!.push(e.target)
    if (!inEdges.has(e.target)) inEdges.set(e.target, [])
    inEdges.get(e.target)!.push(e.source)
  }
  const triggerIds = nodes.filter((n) => n.type === 'trigger').map((n) => n.id)
  const order: string[] = []
  const visited = new Set<string>()
  const queue = [...triggerIds]
  while (queue.length) {
    const id = queue.shift()!
    if (visited.has(id)) continue
    visited.add(id)
    order.push(id)
    for (const target of outEdges.get(id) ?? []) {
      if (!visited.has(target)) queue.push(target)
    }
  }
  return order
}

function substitutePrompt(template: string, question: Record<string, unknown>, previousOutput: string): string {
  let s = template
  s = s.replace(/\{\{question\.id\}\}/g, String(question.id ?? ''))
  s = s.replace(/\{\{question\.title\}\}/g, String(question.title ?? ''))
  s = s.replace(/\{\{question\.content\}\}/g, String(question.content ?? ''))
  s = s.replace(/\{\{question\.category\}\}/g, String(question.category ?? ''))
  s = s.replace(/\{\{question\.status\}\}/g, String(question.status ?? ''))
  s = s.replace(/\{\{question\.created_at\}\}/g, String(question.created_at ?? ''))
  s = s.replace(/\{\{previous_output\}\}/g, previousOutput)
  return s
}

type CallResult = { success: true; content: string } | { success: false; error: string }

async function callAi(config: LlmConfig, model: string, systemPrompt: string, userContent: string): Promise<CallResult> {
  const apiKey = config.api_key
  if (!apiKey) return { success: false, error: 'LLM not configured: set API key in Dashboard → LLM connection' }
  const base = config.api_base_url.replace(/\/$/, '')
  const url = `${base}/chat/completions`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        max_tokens: 1024,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      return { success: false, error: `API error: ${res.status} ${err.slice(0, 500)}` }
    }
    const json = await res.json()
    const content = json.choices?.[0]?.message?.content
    const text = typeof content === 'string' ? content : '[no content]'
    return { success: true, content: text }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, error: msg }
  }
}

export async function runWorkflowsForQuestion(questionId: string): Promise<void> {
  console.log('[workflow] runWorkflowsForQuestion started', { questionId })
  const supabase = createServiceRoleClient()
  const { data: question, error: qErr } = await supabase
    .from('questions')
    .select('id, title, content, category, status, created_at')
    .eq('id', questionId)
    .single()
  if (qErr || !question) {
    console.warn('[workflow] question not found or error', { questionId, error: qErr?.message })
    return
  }
  console.log('[workflow] question loaded', { id: question.id, title: question.title?.slice(0, 50) })

  const { data: flows, error: fErr } = await supabase
    .from('flows')
    .select('id, agent_id, nodes, edges')
    .eq('trigger_type', 'question_created')
    .eq('is_active', true)
  if (fErr) {
    console.error('[workflow] flows fetch error', fErr)
    return
  }
  if (!flows?.length) {
    console.warn('[workflow] no active flows with trigger_type=question_created')
    return
  }
  console.log('[workflow] flows to run', flows.length, flows.map((f) => ({ flowId: f.id, agentId: f.agent_id })))

  const questionRecord = {
    id: question.id,
    title: question.title,
    content: question.content,
    category: question.category,
    status: question.status,
    created_at: question.created_at,
  }
  const userContent = `Question title: ${question.title}\n\nQuestion content:\n${question.content}`

  for (const flow of flows) {
    const { data: agent } = await supabase
      .from('agents')
      .select('user_id')
      .eq('id', flow.agent_id)
      .single()
    if (!agent?.user_id) continue

    const flowRunId = crypto.randomUUID()
    const nodes = (flow.nodes as Node[]) ?? []
    const edges = (flow.edges as Edge[]) ?? []
    const order = getExecutionOrder(nodes, edges)
    console.log('[workflow] flow started', { flowId: flow.id, agentId: flow.agent_id, flowRunId, order })
    if (order.length === 0) {
      console.warn('[workflow] flow has no runnable nodes', { flowId: flow.id, nodes: nodes.length, edges: edges.length })
      continue
    }
    let previousOutput = ''

    for (const nodeId of order) {
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) continue
      if (node.type === 'trigger') continue
      if (node.type === 'agent') {
        const llmConfigId = node.data?.llm_config_id as string | undefined
        let config: LlmConfig = { api_base_url: 'https://api.openai.com/v1', api_key: null }
        if (llmConfigId) {
          const { data: llmRow } = await supabase
            .from('llm_configs')
            .select('api_base_url, api_key')
            .eq('id', llmConfigId)
            .eq('user_id', agent.user_id)
            .single()
          if (llmRow) config = { api_base_url: llmRow.api_base_url ?? config.api_base_url, api_key: llmRow.api_key }
        } else {
          const { data: first } = await supabase
            .from('llm_configs')
            .select('api_base_url, api_key')
            .eq('user_id', agent.user_id)
            .limit(1)
            .single()
          if (first) config = { api_base_url: first.api_base_url ?? config.api_base_url, api_key: first.api_key }
        }
        const systemPrompt = substitutePrompt(
          String(node.data?.systemPrompt ?? 'You are a helpful assistant.'),
          questionRecord,
          previousOutput
        )
        const model = String(node.data?.model ?? 'gpt-4o-mini')
        console.log('[workflow] agent node calling LLM', { flowId: flow.id, nodeId, model })
        const result = await callAi(config, model, systemPrompt, userContent)
        if (result.success) {
          previousOutput = result.content
          console.log('[workflow] agent node success', { flowId: flow.id, nodeId, outputLength: result.content.length })
        } else {
          previousOutput = `[Error] ${result.error}`
          console.error('[workflow] agent node error', { flowId: flow.id, nodeId, error: result.error })
        }
        await supabase.from('agent_run_logs').insert({
          flow_run_id: flowRunId,
          question_id: questionId,
          flow_id: flow.id,
          agent_id: flow.agent_id,
          node_id: nodeId,
          status: result.success ? 'success' : 'error',
          model,
          system_prompt: systemPrompt,
          user_content: userContent,
          response_content: result.success ? result.content : null,
          error_message: result.success ? null : result.error,
        })
        continue
      }
      if (node.type === 'response') {
        if (previousOutput && flow.agent_id) {
          await supabase.from('answers').insert({
            question_id: questionId,
            agent_id: flow.agent_id,
            flow_id: flow.id,
            content: previousOutput,
            is_ai: true,
          })
          await supabase.from('questions').update({ status: 'answered', updated_at: new Date().toISOString() }).eq('id', questionId)
          console.log('[workflow] answer posted, question status=answered', { questionId, flowId: flow.id, agentId: flow.agent_id })
        } else {
          console.warn('[workflow] response node skipped (no output or no agent)', { flowId: flow.id, hasOutput: !!previousOutput })
        }
        break
      }
    }
  }
  console.log('[workflow] runWorkflowsForQuestion finished', { questionId })
}
