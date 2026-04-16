import { Handle, Position, type NodeProps } from '@xyflow/react';
import { LayoutList } from 'lucide-react';

export function SendDmButtonsNode({ data, selected }: NodeProps) {
  const buttons: { id: string; label: string }[] = (data as any).buttons ?? [];
  return (
    <div className={`rounded-lg border-2 bg-background p-3 w-64 shadow-sm ${selected ? 'border-primary' : 'border-purple-400'}`}>
      <div className="flex items-center gap-2 mb-1">
        <LayoutList className="h-4 w-4 text-purple-500" />
        <span className="font-semibold text-sm">DM com Botões</span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
        {(data as any).message || 'Mensagem'}
      </p>
      {buttons.map((b, i) => (
        <div key={b.id} className="relative mb-1">
          <div className="text-xs bg-muted rounded px-2 py-1 pr-8 truncate">{b.label || `Botão ${i + 1}`}</div>
          <Handle
            type="source"
            position={Position.Right}
            id={b.id}
            style={{ top: `${52 + i * 26}px`, right: -8 }}
          />
        </div>
      ))}
      <Handle type="target" position={Position.Top} />
    </div>
  );
}
