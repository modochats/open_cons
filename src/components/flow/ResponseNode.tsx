'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

function ResponseNodeComponent({ data }: NodeProps) {
  const label = (data?.label as string) ?? 'Response'
  return (
    <div className="rounded-lg border-2 border-neon-blue/70 bg-dark-800 px-4 py-3 shadow-lg min-w-[140px]">
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-neon-blue !border-2 !border-dark-800" />
      <div className="text-sm font-medium text-neon-blue">{label}</div>
    </div>
  )
}

export const ResponseNode = memo(ResponseNodeComponent)
