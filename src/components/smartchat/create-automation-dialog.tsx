'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateAutomation } from '@/hooks/smartchat/useAutomations';
import { useMetaConnections } from '@/hooks/smartchat/useMetaConnection';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  postId: z.string().min(1, 'ID do post obrigatório'),
  postUrl: z.string().url().optional().or(z.literal('')),
  platform: z.enum(['INSTAGRAM', 'FACEBOOK']),
  connectionId: z.string().min(1, 'Selecione uma conexão'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  profileId: string;
}

export function CreateAutomationDialog({ profileId }: Props) {
  const [open, setOpen] = useState(false);
  const [keywords, setKeywords] = useState<string[]>(['']);
  const { data: connections = [] } = useMetaConnections(profileId);
  const createMutation = useCreateAutomation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    const kws = keywords.filter((k) => k.trim());
    if (!kws.length) {
      toast.error('Adicione pelo menos uma keyword');
      return;
    }
    try {
      await createMutation.mutateAsync({ ...values, profileId, keywords: kws });
      toast.success('Automação criada!');
      setOpen(false);
      setKeywords(['']);
      reset();
    } catch {
      toast.error('Erro ao criar automação');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Automação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Automação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input {...register('name')} placeholder="Ex: Promoção Maternidade" />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label>Plataforma</Label>
            <Select
              onValueChange={(v) => setValue('platform', v as 'INSTAGRAM' | 'FACEBOOK')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                <SelectItem value="FACEBOOK">Facebook</SelectItem>
              </SelectContent>
            </Select>
            {errors.platform && (
              <p className="text-xs text-destructive mt-1">Selecione a plataforma</p>
            )}
          </div>

          <div>
            <Label>Conexão Meta</Label>
            <Select onValueChange={(v) => setValue('connectionId', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar página" />
              </SelectTrigger>
              <SelectContent>
                {connections.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.pageName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {connections.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Conecte uma página primeiro nas configurações do perfil.
              </p>
            )}
            {errors.connectionId && (
              <p className="text-xs text-destructive mt-1">Selecione uma conexão</p>
            )}
          </div>

          <div>
            <Label>ID do Post monitorado</Label>
            <Input {...register('postId')} placeholder="123456789_987654321" />
            {errors.postId && (
              <p className="text-xs text-destructive mt-1">{errors.postId.message}</p>
            )}
          </div>

          <div>
            <Label>URL do Post (opcional)</Label>
            <Input
              {...register('postUrl')}
              placeholder="https://www.instagram.com/p/..."
            />
          </div>

          <div>
            <Label>Keywords (palavras que disparam a automação)</Label>
            <div className="space-y-2 mt-1">
              {keywords.map((kw, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={kw}
                    onChange={(e) => {
                      const next = [...keywords];
                      next[i] = e.target.value;
                      setKeywords(next);
                    }}
                    placeholder="Ex: quero, link, produto"
                  />
                  {keywords.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setKeywords(keywords.filter((_, j) => j !== i))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setKeywords([...keywords, ''])}
              >
                + Keyword
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Criando...' : 'Criar Automação'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
