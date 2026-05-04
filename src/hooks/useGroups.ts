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
  isActive: boolean
  type: "WHATSAPP" | "TELEGRAM"
  profileId: string
  profile?: {
    name: string
    slug: string
  }
  createdAt: string
}

export interface CreateGroupData {
  name: string
  inviteLink: string
  profileId: string
  type: "WHATSAPP" | "TELEGRAM"
}

export function useGroups(profileId?: string) {
  const queryClient = useQueryClient()

  const groupsQuery = useQuery({
    queryKey: ["groups", profileId],
    queryFn: async () => {
      if (!profileId) return []
      const response = await api.get<Group[]>(`/groups/profile/${profileId}`)
      return response.data
    },
    enabled: !!profileId,
  })

  const createGroupMutation = useMutation({
    mutationFn: async (data: CreateGroupData) => {
      const response = await api.post<Group>("/groups", data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      queryClient.invalidateQueries({ queryKey: ["all-groups"] })
    },
  })

  const updateMembersMutation = useMutation({
    mutationFn: async ({ id, memberCount }: { id: string; memberCount: number }) => {
      const response = await api.patch<Group>(`/groups/${id}/members`, { memberCount })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      queryClient.invalidateQueries({ queryKey: ["all-groups"] })
    },
  })

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/groups/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      queryClient.invalidateQueries({ queryKey: ["all-groups"] })
    },
  })

  const updateGroupMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Group> }) => {
      const response = await api.patch<Group>(`/groups/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      queryClient.invalidateQueries({ queryKey: ["all-groups"] })
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
    updateGroup: updateGroupMutation.mutateAsync,
    isUpdating: updateGroupMutation.isPending,
  }
}

export function useAllGroups() {
  const groupsQuery = useQuery({
    queryKey: ["all-groups"],
    queryFn: async () => {
      const response = await api.get<Group[]>("/groups/mine")
      return response.data
    },
  })

  return {
    groups: groupsQuery.data ?? [],
    isLoading: groupsQuery.isLoading,
    isError: groupsQuery.isError,
  }
}
