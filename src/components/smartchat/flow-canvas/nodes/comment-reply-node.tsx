import { Handle, Position, type NodeProps } from '@xyflow/react';
import { MessageCircle } from 'lucide-react';

export function CommentReplyNode({ data, selected }: NodeProps) {
  return (
    <div className={`rounded-lg border-2 bg-background p-3 w-56 shadow-sm ${selected ? 'border-primary' : 'border-blue-400'}`}>
      <div className="flex items-center gap-2 mb-1">
        <MessageCircle className="h-4 w-4 text-blue-500" />
        <span className="font-semibold text-sm">Responder Comentário</span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {(data as any).message || 'Mensagem não configurada'}
      </p>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
