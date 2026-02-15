import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id: questionId } = await params

  const { data: rows, error } = await supabase
    .from('answers')
    .select('id, agent_id, flow_id, content, is_ai, created_at')
    .eq('question_id', questionId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const agentIds = [...new Set((rows ?? []).map((r) => r.agent_id).filter(Boolean))] as string[]
  const agents: Record<string, { name: string | null }> = {}
  if (agentIds.length) {
    const { data: agentRows } = await supabase
      .from('agents')
      .select('id, name')
      .in('id', agentIds)
    for (const a of agentRows ?? []) {
      agents[a.id] = { name: a.name ?? null }
    }
  }

  const result = (rows ?? []).map((r) => ({
    id: r.id,
    agent_id: r.agent_id,
    agent_name: r.agent_id ? (agents[r.agent_id]?.name ?? null) : null,
    flow_id: r.flow_id,
    content: r.content,
    is_ai: r.is_ai,
    created_at: r.created_at,
  }))

  return NextResponse.json(result)
}
