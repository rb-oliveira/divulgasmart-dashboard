'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

const NODE_PALETTE = [
  { type: 'COMMENT_REPLY', label: 'Resp. Comentário' },
  { type: 'SEND_DM', label: 'Enviar DM' },
  { type: 'SEND_DM_BUTTONS', label: 'DM c/ Botões' },
  { type: 'SEND_DM_IMAGE', label: 'DM Imagem' },
  { type: 'SEND_DM_LINK_CARD', label: 'Link Card' },
  { type: 'CONDITION', label: 'Condicao' },
  { type: 'DELAY', label: 'Delay' },
];

interface Props {
  onSave: () => void;
  onAddNode: (type: string) => void;
  isSaving: boolean;
}

export function FlowToolbar({ onSave, onAddNode, isSaving }: Props) {
  const router = useRouter();
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-wrap items-center gap-1 bg-background border rounded-lg shadow-md p-2 max-w-[90vw]">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-1" />Voltar
      </Button>
      <div className="h-4 w-px bg-border mx-1" />
      {NODE_PALETTE.map((n) => (
        <Button key={n.type} variant="outline" size="sm" onClick={() => onAddNode(n.type)}>
          {n.label}
        </Button>
      ))}
      <div className="h-4 w-px bg-border mx-1" />
      <Button size="sm" onClick={onSave} disabled={isSaving}>
        <Save className="h-4 w-4 mr-1" />{isSaving ? 'Salvando...' : 'Salvar'}
      </Button>
    </div>
  );
}
