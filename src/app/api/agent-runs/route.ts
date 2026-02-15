import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const questionId = searchParams.get('question_id') ?? ''
  const agentId = searchParams.get('agent_id') ?? ''
  const limit = Math.min(Number(searchParams.get('limit')) || 100, 200)

  let query = supabase
    .from('agent_run_logs')
    .select('id, flow_run_id, question_id, flow_id, agent_id, node_id, status, model, system_prompt, user_content, response_content, error_message, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (questionId) query = query.eq('question_id', questionId)
  if (agentId) query = query.eq('agent_id', agentId)

  const { data: rows, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const questionIds = [...new Set((rows ?? []).map((r) => r.question_id))]
  const agentIds = [...new Set((rows ?? []).map((r) => r.agent_id).filter(Boolean))] as string[]

  const [questionsRes, agentsRes] = await Promise.all([
    questionIds.length ? supabase.from('questions').select('id, title').in('id', questionIds) : { data: [] },
    agentIds.length ? supabase.from('agents').select('id, name').in('id', agentIds) : { data: [] },
  ])

  const questions: Record<string, { title: string }> = {}
  for (const q of questionsRes.data ?? []) questions[q.id] = { title: q.title }
  const agents: Record<string, { name: string }> = {}
  for (const a of agentsRes.data ?? []) agents[a.id] = { name: a.name }

  const result = (rows ?? []).map((r) => ({
    id: r.id,
    flow_run_id: r.flow_run_id,
    question_id: r.question_id,
    question_title: questions[r.question_id]?.title ?? null,
    flow_id: r.flow_id,
    agent_id: r.agent_id,
    agent_name: r.agent_id ? agents[r.agent_id]?.name ?? null : null,
    node_id: r.node_id,
    status: r.status,
    model: r.model,
    system_prompt: r.system_prompt,
    user_content: r.user_content,
    response_content: r.response_content,
    error_message: r.error_message,
    created_at: r.created_at,
  }))

  return NextResponse.json(result)
}
