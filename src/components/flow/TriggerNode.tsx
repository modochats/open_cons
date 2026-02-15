'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useI18n } from '@/contexts/I18nContext'

const TRIGGER_OUTPUT = 'question'

function TriggerNodeComponent({ data }: NodeProps) {
  const { t } = useI18n()
  const label = (data?.label as string) ?? 'Trigger'
  const sends = (data?.sends as string[] | undefined) ?? [TRIGGER_OUTPUT]
  return (
    <div className="rounded-lg border-2 border-amber-500/70 bg-dark-800 px-4 py-3 shadow-lg min-w-[160px]">
      <div className="text-sm font-medium text-amber-400">{label}</div>
      <div className="mt-1 text-xs text-amber-400/80">
        {sends.includes(TRIGGER_OUTPUT) ? `→ ${t('dashboard.wholeQuestion')}` : sends.join(', ')}
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-dark-800" id="question" />
    </div>
  )
}

export const TriggerNode = memo(TriggerNodeComponent)
export const TRIGGER_OUTPUT_QUESTION = TRIGGER_OUTPUT
