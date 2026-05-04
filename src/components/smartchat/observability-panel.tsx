'use client';

import { AlertCircle, CheckCircle2, Clock, PauseCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useAutomationExecutions,
  useConversationStates,
  useSmartChatSummary,
} from '@/hooks/smartchat/useObservability';

interface Props {
  profileId: string;
}

const statusVariant = {
  RUNNING: 'secondary',
  SUCCESS: 'default',
  FAILED: 'destructive',
  PARTIAL: 'outline',
} as const;

export function ObservabilityPanel({ profileId }: Props) {
  const { data: summary } = useSmartChatSummary(profileId);
  const { data: executions = [], isLoading: isLoadingExecutions } =
    useAutomationExecutions(profileId);
  const { data: states = [] } = useConversationStates(profileId);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <MetricCard
          title="Sucesso"
          value={summary?.success ?? 0}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
        />
        <MetricCard
          title="Falhas"
          value={summary?.failed ?? 0}
          icon={<AlertCircle className="h-4 w-4 text-destructive" />}
        />
        <MetricCard
          title="Rodando"
          value={summary?.running ?? 0}
          icon={<Clock className="h-4 w-4 text-amber-600" />}
        />
        <MetricCard
          title="Pausadas"
          value={summary?.pendingStates ?? states.length}
          icon={<PauseCircle className="h-4 w-4 text-blue-600" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Execucoes recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingExecutions ? (
            <div className="text-sm text-muted-foreground">Carregando execucoes...</div>
          ) : executions.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Nenhuma execucao registrada para este perfil.
            </div>
          ) : (
            <div className="space-y-3">
              {executions.map((execution) => (
                <div key={execution.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">
                          {execution.automation.name}
                        </span>
                        <Badge variant={statusVariant[execution.status]}>
                          {execution.status}
                        </Badge>
                      </div>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {execution.commenterName || execution.commenterIgId}: {execution.commentText}
                      </p>
                    </div>
                    <div className="shrink-0 text-xs text-muted-foreground">
                      {new Date(execution.startedAt).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  {execution.errorMessage && (
                    <p className="mt-2 rounded bg-destructive/10 p-2 text-xs text-destructive">
                      {execution.errorMessage}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        {icon}
      </CardContent>
    </Card>
  );
}
