import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface MetaConnection {
  id: string;
  pageId: string;
  pageName: string;
  instagramId?: string;
  instagramName?: string;
  isActive: boolean;
  createdAt: string;
}

export function useMetaConnections(profileId: string | undefined) {
  return useQuery<MetaConnection[]>({
    queryKey: ['meta-connections', profileId],
    queryFn: () =>
      api.get('/smartchat/oauth/connections', { params: { profileId } }).then((r) => r.data),
    enabled: !!profileId,
  });
}

export function useConnectMeta() {
  return useMutation({
    mutationFn: async (profileId: string) => {
      const { data } = await api.get<{ url: string }>('/smartchat/oauth/url', {
        params: { profileId },
      });
      return data.url;
    },
  });
}
