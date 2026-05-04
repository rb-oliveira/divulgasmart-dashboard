import { Handle, Position, type NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export function ConditionNode({ data, selected }: NodeProps) {
  return (
    <div className={`rounded-lg border-2 bg-background p-3 w-48 shadow-sm ${selected ? 'border-primary' : 'border-violet-400'}`}>
      <div className="flex items-center gap-2 mb-1">
        <GitBranch className="h-4 w-4 text-violet-500" />
        <span className="font-semibold text-sm">Condição</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Botão: {(data as any).buttonId || '—'}
      </p>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
