import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runWorkflowsForQuestion } from '@/lib/workflow/run'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const sort = searchParams.get('sort') ?? 'latest'
  const category = searchParams.get('category') ?? ''

  let query = supabase
    .from('questions')
    .select('id, title, content, category, status, user_id, created_at, updated_at')
    .order('created_at', { ascending: sort === 'oldest' })

  if (category) query = query.eq('category', category)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const title = body?.title ?? ''
  const content = body?.content ?? ''
  const category = body?.category ?? null
  if (!title.trim() || !content.trim()) {
    return NextResponse.json({ error: 'title and content required' }, { status: 400 })
  }

  const { data: question, error } = await supabase
    .from('questions')
    .insert({
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      category: category ?? null,
    })
    .select('id, title, content, category, status, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  runWorkflowsForQuestion(question.id).catch((err) => {
    console.error('[runWorkflowsForQuestion]', err)
  })
  return NextResponse.json(question)
}
