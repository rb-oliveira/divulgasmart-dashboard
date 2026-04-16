import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Automation {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  postId: string;
  postUrl?: string;
  platform: 'INSTAGRAM' | 'FACEBOOK';
  fuzzyThreshold: number;
  connectionId: string;
  profileId: string;
  keywords: { id: string; phrase: string }[];
  connection?: { pageName: string; instagramName?: string };
  _count?: { executions: number };
  createdAt: string;
}

export function useAutomations(profileId: string | undefined) {
  return useQuery<Automation[]>({
    queryKey: ['automations', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      const { data } = await api.get('/smartchat/automations', { params: { profileId } });
      return data;
    },
    enabled: !!profileId,
  });
}

export function useCreateAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Record<string, unknown>) =>
      api.post('/smartchat/automations', dto).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automations'] }),
  });
}

export function useToggleAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/smartchat/automations/${id}/toggle`, { isActive }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automations'] }),
  });
}

export function useDeleteAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/smartchat/automations/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automations'] }),
  });
}
