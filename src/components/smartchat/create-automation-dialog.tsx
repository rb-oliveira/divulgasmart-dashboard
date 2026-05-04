'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
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

const schema = z.object({
  name: z.string().trim().min(1, 'Nome obrigatorio'),
  postId: z.string().trim().min(1, 'ID do post obrigatorio'),
  postUrl: z.string().trim().url('URL invalida').optional().or(z.literal('')),
  platform: z.enum(['INSTAGRAM', 'FACEBOOK']),
  connectionId: z.string().trim().min(1, 'Selecione uma conexao'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  profileId: string;
}

export function CreateAutomationDialog({ profileId }: Props) {
  const [open, setOpen] = useState(false);
  const [keywords, setKeywords] = useState<string[]>(['']);
  const { data: connections = [], isLoading: isLoadingConnections } =
    useMetaConnections(profileId);
  const createMutation = useCreateAutomation();
  const hasConnections = connections.length > 0;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      postId: '',
      postUrl: '',
      platform: 'INSTAGRAM',
      connectionId: '',
    },
  });

  useEffect(() => {
    if (connections.length === 1) {
      setValue('connectionId', connections[0].id, { shouldValidate: true });
    }
  }, [connections, setValue]);

  const onSubmit = async (values: FormValues) => {
    const normalizedKeywords = [...new Set(keywords.map((k) => k.trim()).filter(Boolean))];
    if (!normalizedKeywords.length) {
      toast.error('Adicione pelo menos uma keyword');
      return;
    }

    try {
      await createMutation.mutateAsync({
        ...values,
        postUrl: values.postUrl || undefined,
        profileId,
        keywords: normalizedKeywords,
      });
      toast.success('Automacao criada!');
      setOpen(false);
      setKeywords(['']);
      reset();
    } catch {
      toast.error('Erro ao criar automacao');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={isLoadingConnections || !hasConnections}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Automacao
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Automacao</DialogTitle>
        </DialogHeader>
        {!hasConnections ? (
          <div className="text-sm text-muted-foreground">
            Conecte uma pagina Meta antes de criar automacoes.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input {...register('name')} placeholder="Ex: Promocao Maternidade" />
              {errors.name && (
                <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label>Plataforma</Label>
              <Select
                defaultValue="INSTAGRAM"
                onValueChange={(v) =>
                  setValue('platform', v as 'INSTAGRAM' | 'FACEBOOK', {
                    shouldValidate: true,
                  })
                }
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
                <p className="mt-1 text-xs text-destructive">Selecione a plataforma</p>
              )}
            </div>

            <div>
              <Label>Conexao Meta</Label>
              <Select
                onValueChange={(v) =>
                  setValue('connectionId', v, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar pagina" />
                </SelectTrigger>
                <SelectContent>
                  {connections.map((connection) => (
                    <SelectItem key={connection.id} value={connection.id}>
                      {connection.pageName}
                      {connection.instagramName ? ` / ${connection.instagramName}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.connectionId && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.connectionId.message}
                </p>
              )}
            </div>

            <div>
              <Label>ID do Post monitorado</Label>
              <Input {...register('postId')} placeholder="123456789_987654321" />
              {errors.postId && (
                <p className="mt-1 text-xs text-destructive">{errors.postId.message}</p>
              )}
            </div>

            <div>
              <Label>URL do Post</Label>
              <Input
                {...register('postUrl')}
                placeholder="https://www.instagram.com/p/..."
              />
              {errors.postUrl && (
                <p className="mt-1 text-xs text-destructive">{errors.postUrl.message}</p>
              )}
            </div>

            <div>
              <Label>Keywords</Label>
              <div className="mt-1 space-y-2">
                {keywords.map((keyword, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={keyword}
                      onChange={(event) => {
                        const next = [...keywords];
                        next[index] = event.target.value;
                        setKeywords(next);
                      }}
                      placeholder="Ex: quero, link, produto"
                    />
                    {keywords.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setKeywords(keywords.filter((_, current) => current !== index))
                        }
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
              {createMutation.isPending ? 'Criando...' : 'Criar Automacao'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
