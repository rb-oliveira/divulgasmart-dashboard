'use client';

import type { Node } from '@xyflow/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface Props {
  node: Node | null;
  onChange: (nodeId: string, data: Record<string, any>) => void;
  onClose: () => void;
}

export function NodeConfigPanel({ node, onChange, onClose }: Props) {
  if (!node) return null;
  const data = node.data as Record<string, any>;
  const update = (field: string, value: any) =>
    onChange(node.id, { ...data, [field]: value });

  return (
    <div className="absolute right-0 top-0 h-full w-80 border-l bg-background p-4 z-10 overflow-y-auto shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">
          {node.type?.replace(/_/g, ' ')}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {(node.type === 'COMMENT_REPLY' || node.type === 'SEND_DM' || node.type === 'SEND_DM_LINK_CARD') && (
        <div>
          <Label>Mensagem</Label>
          <textarea
            className="w-full mt-1 p-2 text-sm border rounded-md bg-background resize-none min-h-[80px]"
            value={data.message ?? ''}
            onChange={(e) => update('message', e.target.value)}
            placeholder="Use {{nome}}, {{comentario}}, {{post_url}}"
          />
        </div>
      )}

      {node.type === 'SEND_DM_BUTTONS' && (
        <div className="space-y-3">
          <div>
            <Label>Mensagem</Label>
            <textarea
              className="w-full mt-1 p-2 text-sm border rounded-md bg-background resize-none min-h-[60px]"
              value={data.message ?? ''}
              onChange={(e) => update('message', e.target.value)}
              placeholder="Use {{nome}}, {{comentario}}"
            />
          </div>
          <div>
            <Label>Botões</Label>
            {(data.buttons ?? []).map((b: { id: string; label: string }, i: number) => (
              <div key={b.id} className="flex gap-2 mt-1">
                <Input
                  value={b.label}
                  onChange={(e) => {
                    const next = [...(data.buttons ?? [])];
                    next[i] = { ...b, label: e.target.value };
                    update('buttons', next);
                  }}
                  placeholder={`Botão ${i + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    update('buttons', (data.buttons ?? []).filter((_: any, j: number) => j !== i))
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() =>
                update('buttons', [
                  ...(data.buttons ?? []),
                  { id: crypto.randomUUID(), label: '' },
                ])
              }
            >
              <Plus className="h-3 w-3 mr-1" />Botão
            </Button>
          </div>
        </div>
      )}

      {node.type === 'DELAY' && (
        <div>
          <Label>Delay em segundos</Label>
          <Input
            type="number"
            min={1}
            value={data.delaySeconds ?? 60}
            onChange={(e) => update('delaySeconds', Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground mt-1">Ex: 3600 = 1 hora</p>
        </div>
      )}

      {node.type === 'TRIGGER' && (
        <div className="space-y-3">
          <div>
            <Label>ID do Post</Label>
            <Input
              value={data.postId ?? ''}
              onChange={(e) => update('postId', e.target.value)}
              placeholder="123456789_987654321"
            />
          </div>
          <div>
            <Label>URL do Post</Label>
            <Input
              value={data.postUrl ?? ''}
              onChange={(e) => update('postUrl', e.target.value)}
              placeholder="https://www.instagram.com/p/..."
            />
          </div>
        </div>
      )}

      {node.type === 'SEND_DM_IMAGE' && (
        <div className="space-y-3">
          <div>
            <Label>URL da Imagem</Label>
            <Input
              value={data.imageUrl ?? ''}
              onChange={(e) => update('imageUrl', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label>Legenda (opcional)</Label>
            <Input
              value={data.caption ?? ''}
              onChange={(e) => update('caption', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
