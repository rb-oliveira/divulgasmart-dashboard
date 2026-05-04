import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Image } from 'lucide-react';

export function SendDmImageNode({ data, selected }: NodeProps) {
  return (
    <div className={`rounded-lg border-2 bg-background p-3 w-56 shadow-sm ${selected ? 'border-primary' : 'border-cyan-400'}`}>
      <div className="flex items-center gap-2 mb-1">
        <Image className="h-4 w-4 text-cyan-500" />
        <span className="font-semibold text-sm">Imagem na DM</span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-1">
        {(data as any).imageUrl ? 'Imagem configurada' : 'URL não configurada'}
      </p>
      {(data as any).caption && (
        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
          {(data as any).caption}
        </p>
      )}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
