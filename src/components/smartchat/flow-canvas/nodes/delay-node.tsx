import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';

export function DelayNode({ data, selected }: NodeProps) {
  const secs: number = (data as any).delaySeconds ?? 0;
  const label = secs >= 3600 ? `${secs / 3600}h` : secs >= 60 ? `${Math.round(secs / 60)}min` : `${secs}s`;
  return (
    <div className={`rounded-lg border-2 bg-background p-3 w-44 shadow-sm ${selected ? 'border-primary' : 'border-orange-400'}`}>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-orange-500" />
        <span className="font-semibold text-sm">Delay {label}</span>
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
