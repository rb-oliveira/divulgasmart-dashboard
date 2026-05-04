import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"

export interface Profile {
  id: string
  name: string
  slug: string
  clickCount: number
  whatsappClicks: number
  telegramClicks: number
  userId: string
  createdAt: string
  updatedAt: string
  _count?: {
    groups: number
    offers: number
  }
}

export interface CreateProfileData {
  name: string
  slug: string
}

export function useProfiles() {
  const queryClient = useQueryClient()

  const profilesQuery = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const response = await api.get<Profile[]>("/profiles")
      return response.data
    },
  })

  const createProfileMutation = useMutation({
    mutationFn: async (data: CreateProfileData) => {
      const response = await api.post<Profile>("/profiles", data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] })
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateProfileData> }) => {
      const response = await api.patch<Profile>(`/profiles/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] })
    },
  })

  const deleteProfileMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/profiles/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] })
    },
  })

  return {
    profiles: profilesQuery.data ?? [],
    isLoading: profilesQuery.isLoading,
    isError: profilesQuery.isError,
    error: profilesQuery.error,
    createProfile: createProfileMutation.mutate,
    isCreating: createProfileMutation.isPending,
    createProfileError: createProfileMutation.error,
    createProfileSuccess: createProfileMutation.isSuccess,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    deleteProfile: deleteProfileMutation.mutateAsync,
    isDeleting: deleteProfileMutation.isPending,
  }
}
