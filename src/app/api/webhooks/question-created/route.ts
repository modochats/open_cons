import { NextResponse } from 'next/server'
import { runWorkflowsForQuestion } from '@/lib/workflow/run'

export async function POST(request: Request) {
  let questionId: string | null = null
  try {
    const body = await request.json()
    const record = body?.record ?? body?.payload?.record ?? body
    questionId = record?.id ?? body?.question_id ?? null
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!questionId) {
    return NextResponse.json({ error: 'question id required' }, { status: 400 })
  }

  runWorkflowsForQuestion(questionId).catch(() => {})
  return NextResponse.json({ ok: true, question_id: questionId })
}
