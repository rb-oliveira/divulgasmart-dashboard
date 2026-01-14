import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"

export interface Group {
  id: string
  name: string
  inviteLink: string
  slug: string
  memberCount: number
  clickCount: number
  status: "ACTIVE" | "FULL" | "DISABLED"
  storeId: string
  createdAt: string
}

export interface CreateGroupData {
  name: string
  inviteLink: string
  storeId: string
}

export function useGroups(storeId?: string) {
  const queryClient = useQueryClient()

  const groupsQuery = useQuery({
    queryKey: ["groups", storeId],
    queryFn: async () => {
      if (!storeId) return []
      const response = await api.get<Group[]>(`/groups/store/${storeId}`)
      return response.data
    },
    enabled: !!storeId,
  })

  const createGroupMutation = useMutation({
    mutationFn: async (data: CreateGroupData) => {
      const response = await api.post<Group>("/groups", data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", storeId] })
    },
  })

  const updateMembersMutation = useMutation({
    mutationFn: async ({ id, memberCount }: { id: string; memberCount: number }) => {
      const response = await api.patch<Group>(`/groups/${id}/members`, { memberCount })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", storeId] })
    },
  })

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/groups/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", storeId] })
    },
  })

  return {
    groups: groupsQuery.data ?? [],
    isLoading: groupsQuery.isLoading,
    isError: groupsQuery.isError,
    createGroup: createGroupMutation.mutateAsync,
    isCreating: createGroupMutation.isPending,
    updateMembers: updateMembersMutation.mutateAsync,
    isUpdatingMembers: updateMembersMutation.isPending,
    deleteGroup: deleteGroupMutation.mutateAsync,
    isDeleting: deleteGroupMutation.isPending,
  }
}
