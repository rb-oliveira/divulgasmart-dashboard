import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useFlow(automationId: string | undefined) {
  return useQuery({
    queryKey: ['flow', automationId],
    queryFn: () =>
      api.get(`/smartchat/automations/${automationId}/flow`).then((r) => r.data),
    enabled: !!automationId,
  });
}

export function useSaveFlow(automationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nodes: Record<string, unknown>[]) =>
      api.put(`/smartchat/automations/${automationId}/flow`, { nodes }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flow', automationId] }),
  });
}
