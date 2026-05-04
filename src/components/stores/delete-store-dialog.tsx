"use client"

import React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Profile, useProfiles } from "@/hooks/useProfiles"
import { useRouter } from "next/navigation"

interface DeleteProfileDialogProps {
  store: Profile
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteStoreDialog({ store, open, onOpenChange }: DeleteProfileDialogProps) {
  const { deleteProfile, isDeleting } = useProfiles()
  const router = useRouter()

  async function onDelete() {
    try {
      await deleteProfile(store.id)
      toast.success("Perfil excluído com sucesso!")
      router.push("/perfis")
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro ao excluir perfil"
      toast.error(message, { duration: 5000 })
    } finally {
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o perfil{" "}
            <strong>{store.name}</strong> e removerá seus dados de nossos servidores.
            <br />
            <br />
            <strong>Atenção:</strong> Perfis com grupos ativos não podem ser excluídos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: React.MouseEvent) => { e.preventDefault(); onDelete() }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Excluindo..." : "Excluir Perfil"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
