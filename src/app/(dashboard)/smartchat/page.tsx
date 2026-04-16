'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAutomations } from '@/hooks/smartchat/useAutomations';
import { AutomationList } from '@/components/smartchat/automation-list';
import { CreateAutomationDialog } from '@/components/smartchat/create-automation-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function SmartChatPage() {
  const [profileId, setProfileId] = useState<string | undefined>();
  const params = useSearchParams();
  const { data: automations = [], isLoading } = useAutomations(profileId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setProfileId(user.id);
    });
  }, []);

  useEffect(() => {
    if (params.get('connected') === 'true') {
      toast.success('Página Facebook conectada com sucesso!');
    }
  }, [params]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SmartChat</h1>
          <p className="text-sm text-muted-foreground">
            Automações de comentários Instagram e Facebook
          </p>
        </div>
        {profileId && <CreateAutomationDialog profileId={profileId} />}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <AutomationList automations={automations} />
      )}
    </div>
  );
}
