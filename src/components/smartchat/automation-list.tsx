'use client';

import { useRouter } from 'next/navigation';
import {
  type Automation,
  useToggleAutomation,
  useDeleteAutomation,
} from '@/hooks/smartchat/useAutomations';
import { AutomationStatusBadge } from './automation-status-badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Workflow } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  automations: Automation[];
}

export function AutomationList({ automations }: Props) {
  const router = useRouter();
  const toggle = useToggleAutomation();
  const del = useDeleteAutomation();

  if (!automations.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhuma automação ainda. Crie a primeira!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {automations.map((a) => (
        <Card key={a.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-medium truncate">{a.name}</span>
                <AutomationStatusBadge isActive={a.isActive} />
                <span className="text-xs text-muted-foreground">{a.platform}</span>
                {a.connection && (
                  <span className="text-xs text-muted-foreground">
                    · {a.connection.pageName}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {a._count?.executions ?? 0} execuções ·{' '}
                {a.keywords.map((k) => k.phrase).join(', ')}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4 shrink-0">
              <Switch
                checked={a.isActive}
                onCheckedChange={(v) => {
                  toggle.mutate({ id: a.id, isActive: v });
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                title="Editar fluxo"
                onClick={() => router.push(`/smartchat/${a.id}/flow`)}
              >
                <Workflow className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                title="Remover"
                onClick={async () => {
                  if (!confirm('Remover esta automação?')) return;
                  await del.mutateAsync(a.id);
                  toast.success('Automação removida');
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
