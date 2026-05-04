'use client';

import { ExternalLink, Facebook, Instagram } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useConnectMeta,
  useMetaConnections,
} from '@/hooks/smartchat/useMetaConnection';

interface Props {
  profileId: string;
}

export function MetaConnectionPanel({ profileId }: Props) {
  const { data: connections = [], isLoading } = useMetaConnections(profileId);
  const connectMeta = useConnectMeta();

  const handleConnect = async () => {
    try {
      const url = await connectMeta.mutateAsync(profileId);
      window.location.href = url;
    } catch {
      toast.error('Nao foi possivel iniciar a conexao Meta');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Conexoes Meta</CardTitle>
        <Button size="sm" onClick={handleConnect} disabled={connectMeta.isPending}>
          <ExternalLink className="mr-2 h-4 w-4" />
          {connectMeta.isPending ? 'Conectando...' : 'Conectar Meta'}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Carregando conexoes...</div>
        ) : connections.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Nenhuma pagina conectada para este perfil.
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    <span className="font-medium truncate">{connection.pageName}</span>
                    <Badge variant={connection.isActive ? 'default' : 'secondary'}>
                      {connection.isActive ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                  {connection.instagramName && (
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Instagram className="h-4 w-4" />
                      <span className="truncate">{connection.instagramName}</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(connection.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
