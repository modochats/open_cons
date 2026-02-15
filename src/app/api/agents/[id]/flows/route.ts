import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: agentId } = await params
  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('id', agentId)
    .eq('user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('flows')
    .select('id, name, trigger_type, nodes, edges, is_active, created_at, updated_at')
    .eq('agent_id', agentId)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: agentId } = await params
  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('id', agentId)
    .eq('user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const name = body?.name ?? 'New Flow'
  let nodes = Array.isArray(body?.nodes) ? body.nodes : []
  let edges = Array.isArray(body?.edges) ? body.edges : []
  if (nodes.length === 0 && edges.length === 0) {
    nodes = [
      { id: 'trigger-1', type: 'trigger', position: { x: 250, y: 0 }, data: { label: 'Question Created', sends: ['question'] } },
      { id: 'agent-1', type: 'agent', position: { x: 250, y: 120 }, data: { label: 'AI Agent' } },
      { id: 'response-1', type: 'response', position: { x: 250, y: 240 }, data: { label: 'Post Answer' } },
    ]
    edges = [
      { id: 'e-trigger-agent', source: 'trigger-1', target: 'agent-1' },
      { id: 'e-agent-response', source: 'agent-1', target: 'response-1' },
    ]
  }

  const { data, error } = await supabase
    .from('flows')
    .insert({ agent_id: agentId, name, nodes, edges })
    .select('id, name, trigger_type, nodes, edges, is_active, created_at, updated_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
