'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAutomations } from '@/hooks/smartchat/useAutomations';
import { useProfiles } from '@/hooks/useProfiles';
import { AutomationList } from '@/components/smartchat/automation-list';
import { CreateAutomationDialog } from '@/components/smartchat/create-automation-dialog';
import { MetaConnectionPanel } from '@/components/smartchat/meta-connection-panel';
import { ObservabilityPanel } from '@/components/smartchat/observability-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function SmartChatPageContent() {
  const [selectedProfileId, setSelectedProfileId] = useState<string | undefined>();
  const params = useSearchParams();
  const { profiles, isLoading: isLoadingProfiles } = useProfiles();
  const { data: automations = [], isLoading: isLoadingAutomations } =
    useAutomations(selectedProfileId);
  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId),
    [profiles, selectedProfileId],
  );

  useEffect(() => {
    if (!selectedProfileId && profiles.length > 0) {
      setSelectedProfileId(profiles[0].id);
    }
  }, [profiles, selectedProfileId]);

  useEffect(() => {
    if (params.get('connected') === 'true') {
      toast.success('Pagina Facebook conectada com sucesso!');
    }
  }, [params]);

  const isLoading = isLoadingProfiles || isLoadingAutomations;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SmartChat</h1>
          <p className="text-sm text-muted-foreground">
            Automacoes de comentarios Instagram e Facebook
          </p>
        </div>
        {selectedProfileId && <CreateAutomationDialog profileId={selectedProfileId} />}
      </div>

      {isLoadingProfiles ? (
        <Skeleton className="h-10 w-72" />
      ) : profiles.length > 0 ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue placeholder="Selecionar perfil" />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedProfile && (
            <span className="text-sm text-muted-foreground">/{selectedProfile.slug}</span>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Crie um perfil antes de configurar automacoes SmartChat.
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : profiles.length === 0 || !selectedProfileId ? null : (
        <>
          <MetaConnectionPanel profileId={selectedProfileId} />
          <ObservabilityPanel profileId={selectedProfileId} />
          <AutomationList automations={automations} />
        </>
      )}
    </div>
  );
}

export default function SmartChatPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      }
    >
      <SmartChatPageContent />
    </Suspense>
  );
}
