import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  const { data, error } = await supabase
    .from('questions')
    .select('id, title, content, category, status, user_id, created_at, updated_at')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body?.title === 'string') updates.title = body.title.trim()
  if (typeof body?.content === 'string') updates.content = body.content.trim()
  if (body?.category !== undefined) updates.category = body.category ? String(body.category).trim() : null
  if (body?.status !== undefined && ['pending', 'answered', 'closed'].includes(body.status)) updates.status = body.status

  const { data, error } = await supabase
    .from('questions')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, title, content, category, status, created_at, updated_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
