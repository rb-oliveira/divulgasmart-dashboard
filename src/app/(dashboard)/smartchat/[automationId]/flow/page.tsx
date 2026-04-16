'use client';

import { use } from 'react';
import { useFlow } from '@/hooks/smartchat/useFlow';
import { FlowCanvas } from '@/components/smartchat/flow-canvas/flow-canvas';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  params: Promise<{ automationId: string }>;
}

export default function FlowEditorPage({ params }: Props) {
  const { automationId } = use(params);
  const { data: flow, isLoading } = useFlow(automationId);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)]">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <FlowCanvas
        automationId={automationId}
        initialNodes={flow?.nodes ?? []}
      />
    </div>
  );
}
