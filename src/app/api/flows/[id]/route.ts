import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getFlowForUser(supabase: Awaited<ReturnType<typeof createClient>>, flowId: string, userId: string) {
  const { data, error } = await supabase
    .from('flows')
    .select('id, agent_id, name, trigger_type, trigger_config, nodes, edges, is_active, created_at, updated_at')
    .eq('id', flowId)
    .single()
  if (error || !data) return { flow: null }

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('id', data.agent_id)
    .eq('user_id', userId)
    .single()

  if (!agent) return { flow: null }
  return { flow: data }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { flow } = await getFlowForUser(supabase, id, user.id)
  if (!flow) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(flow)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { flow } = await getFlowForUser(supabase, id, user.id)
  if (!flow) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const updates: Record<string, unknown> = {}
  if (body.name != null) updates.name = body.name
  if (body.trigger_type != null) updates.trigger_type = body.trigger_type
  if (body.trigger_config != null) updates.trigger_config = body.trigger_config
  if (Array.isArray(body.nodes)) updates.nodes = body.nodes
  if (Array.isArray(body.edges)) updates.edges = body.edges
  if (body.is_active != null) updates.is_active = body.is_active

  const { data, error } = await supabase
    .from('flows')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { flow } = await getFlowForUser(supabase, id, user.id)
  if (!flow) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabase.from('flows').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
