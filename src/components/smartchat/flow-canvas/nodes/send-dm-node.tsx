import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Send } from 'lucide-react';

export function SendDmNode({ data, selected }: NodeProps) {
  return (
    <div className={`rounded-lg border-2 bg-background p-3 w-56 shadow-sm ${selected ? 'border-primary' : 'border-green-400'}`}>
      <div className="flex items-center gap-2 mb-1">
        <Send className="h-4 w-4 text-green-500" />
        <span className="font-semibold text-sm">Enviar DM</span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {(data as any).message || 'Mensagem não configurada'}
      </p>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
