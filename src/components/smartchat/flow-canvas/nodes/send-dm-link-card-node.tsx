import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Link } from 'lucide-react';

export function SendDmLinkCardNode({ data, selected }: NodeProps) {
  return (
    <div className={`rounded-lg border-2 bg-background p-3 w-56 shadow-sm ${selected ? 'border-primary' : 'border-orange-400'}`}>
      <div className="flex items-center gap-2 mb-1">
        <Link className="h-4 w-4 text-orange-500" />
        <span className="font-semibold text-sm">Link Card</span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {(data as any).title || 'Titulo nao configurado'}
      </p>
      {(data as any).url && (
        <p className="text-xs text-blue-500 line-clamp-1 mt-1 truncate">
          {(data as any).url}
        </p>
      )}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
