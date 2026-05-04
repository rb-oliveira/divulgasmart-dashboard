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
    <div className="absolute right-0 top-0 z-10 h-full w-80 overflow-y-auto border-l bg-background p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{node.type?.replace(/_/g, ' ')}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {(node.type === 'COMMENT_REPLY' || node.type === 'SEND_DM') && (
        <div>
          <Label>Mensagem</Label>
          <textarea
            className="mt-1 min-h-[80px] w-full resize-none rounded-md border bg-background p-2 text-sm"
            value={data.message ?? ''}
            onChange={(e) => update('message', e.target.value)}
            placeholder="Use {{nome}}, {{comentario}}, {{post_url}}"
          />
        </div>
      )}

      {node.type === 'SEND_DM_LINK_CARD' && (
        <div className="space-y-3">
          <div>
            <Label>Titulo</Label>
            <Input
              value={data.title ?? ''}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Ex: Oferta especial"
            />
          </div>
          <div>
            <Label>URL</Label>
            <Input
              value={data.url ?? ''}
              onChange={(e) => update('url', e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
      )}

      {node.type === 'SEND_DM_BUTTONS' && (
        <div className="space-y-3">
          <div>
            <Label>Mensagem</Label>
            <textarea
              className="mt-1 min-h-[60px] w-full resize-none rounded-md border bg-background p-2 text-sm"
              value={data.message ?? ''}
              onChange={(e) => update('message', e.target.value)}
              placeholder="Use {{nome}}, {{comentario}}"
            />
          </div>
          <div>
            <Label>Botoes</Label>
            {(data.buttons ?? []).map((button: { id: string; label: string }, index: number) => (
              <div key={button.id} className="mt-1 flex gap-2">
                <Input
                  value={button.label}
                  onChange={(e) => {
                    const next = [...(data.buttons ?? [])];
                    next[index] = { ...button, label: e.target.value };
                    update('buttons', next);
                  }}
                  placeholder={`Botao ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    update(
                      'buttons',
                      (data.buttons ?? []).filter((_: any, current: number) => current !== index),
                    )
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
              disabled={(data.buttons ?? []).length >= 3}
              onClick={() =>
                update('buttons', [
                  ...(data.buttons ?? []),
                  { id: crypto.randomUUID(), label: '' },
                ])
              }
            >
              <Plus className="mr-1 h-3 w-3" />
              Botao
            </Button>
            {(data.buttons ?? []).length >= 3 && (
              <p className="mt-1 text-xs text-muted-foreground">
                A Meta permite ate 3 botoes neste template.
              </p>
            )}
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
          <p className="mt-1 text-xs text-muted-foreground">Ex: 3600 = 1 hora</p>
        </div>
      )}

      {node.type === 'CONDITION' && (
        <div>
          <Label>ID do botao</Label>
          <Input
            value={data.buttonId ?? ''}
            onChange={(e) => update('buttonId', e.target.value)}
            placeholder="Preenchido ao conectar pelo handle do botao"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Ao conectar a partir de um botao, este campo e preenchido automaticamente.
          </p>
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
            <Label>Legenda</Label>
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
