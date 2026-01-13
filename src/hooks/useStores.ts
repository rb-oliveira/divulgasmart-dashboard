import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { AuthChangeEvent, Session } from "@supabase/supabase-js"

export interface Store {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
}

export interface CreateStoreData {
  name: string
  slug: string
}

export function useStores() {
  const queryClient = useQueryClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  // Fetch the current user on mount
  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession()
      setUserId(session?.user?.id ?? null)
      setIsAuthLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUserId(session?.user?.id ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Query to fetch stores for a specific user
  const storesQuery = useQuery({
    queryKey: ["stores", userId],
    queryFn: async () => {
      if (!userId) return []
      const response = await api.get<Store[]>(`/stores/user/${userId}`)
      return response.data
    },
    enabled: !!userId,
  })

  // Mutation to create a new store
  const createStoreMutation = useMutation({
    mutationFn: async (data: CreateStoreData) => {
      if (!userId) throw new Error("Usuário não autenticado")
      const response = await api.post<Store>("/stores", {
        ...data,
        userId, // Include the real userId
      })
      return response.data
    },
    onSuccess: () => {
      // Invalidate the stores query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["stores"] })
    },
  })

  return {
    stores: storesQuery.data ?? [],
    isLoading: storesQuery.isLoading || isAuthLoading,
    isError: storesQuery.isError,
    error: storesQuery.error,
    createStore: createStoreMutation.mutate,
    isCreating: createStoreMutation.isPending,
    createStoreError: createStoreMutation.error,
    createStoreSuccess: createStoreMutation.isSuccess,
  }
}

