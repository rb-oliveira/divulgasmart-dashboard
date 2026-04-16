import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Zap } from 'lucide-react';

export function TriggerNode({ data, selected }: NodeProps) {
  return (
    <div className={`rounded-lg border-2 bg-background p-3 w-56 shadow-sm ${selected ? 'border-primary' : 'border-yellow-400'}`}>
      <div className="flex items-center gap-2 mb-1">
        <Zap className="h-4 w-4 text-yellow-500" />
        <span className="font-semibold text-sm">Gatilho</span>
      </div>
      <p className="text-xs text-muted-foreground truncate">
        {(data as any).postId || 'Post não configurado'}
      </p>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
