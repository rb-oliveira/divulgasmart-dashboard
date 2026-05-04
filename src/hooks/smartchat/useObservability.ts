import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface SmartChatSummary {
  running: number;
  success: number;
  failed: number;
  partial: number;
  pendingStates: number;
}

export interface AutomationExecution {
  id: string;
  automationId: string;
  commentId: string;
  commentText: string;
  commenterIgId: string;
  commenterName?: string;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL';
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
  automation: {
    id: string;
    name: string;
    platform: 'INSTAGRAM' | 'FACEBOOK';
  };
}

export interface ConversationState {
  id: string;
  commenterIgId: string;
  automationId: string;
  pendingNodeId: string;
  expiresAt: string;
  createdAt: string;
}

export function useSmartChatSummary(profileId: string | undefined) {
  return useQuery<SmartChatSummary>({
    queryKey: ['smartchat-summary', profileId],
    queryFn: () =>
      api
        .get('/smartchat/observability/summary', { params: { profileId } })
        .then((r) => r.data),
    enabled: !!profileId,
  });
}

export function useAutomationExecutions(profileId: string | undefined) {
  return useQuery<AutomationExecution[]>({
    queryKey: ['smartchat-executions', profileId],
    queryFn: () =>
      api
        .get('/smartchat/observability/executions', {
          params: { profileId, limit: 20 },
        })
        .then((r) => r.data),
    enabled: !!profileId,
  });
}

export function useConversationStates(profileId: string | undefined) {
  return useQuery<ConversationState[]>({
    queryKey: ['smartchat-conversation-states', profileId],
    queryFn: () =>
      api
        .get('/smartchat/observability/conversation-states', { params: { profileId } })
        .then((r) => r.data),
    enabled: !!profileId,
  });
}
