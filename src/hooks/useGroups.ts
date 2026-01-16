import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { AuthChangeEvent, Session } from "@supabase/supabase-js"

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
  storeId: string
  store?: {
    name: string
    slug: string
  }
  createdAt: string
}

export interface CreateGroupData {
  name: string
  inviteLink: string
  storeId: string
  type: "WHATSAPP" | "TELEGRAM"
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
  const [userId, setUserId] = useState<string | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession()
      setUserId(session?.user?.id ?? null)
      setIsAuthLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const groupsQuery = useQuery({
    queryKey: ["all-groups", userId],
    queryFn: async () => {
      if (!userId) return []
      const response = await api.get<Group[]>(`/groups/user/${userId}`)
      return response.data
    },
    enabled: !!userId,
  })

  return {
    groups: groupsQuery.data ?? [],
    isLoading: groupsQuery.isLoading || isAuthLoading,
    isError: groupsQuery.isError,
  }
}
