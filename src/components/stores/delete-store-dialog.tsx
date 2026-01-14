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
import { Store, useStores } from "@/hooks/useStores"
import { useRouter } from "next/navigation"

interface DeleteStoreDialogProps {
  store: Store
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteStoreDialog({ store, open, onOpenChange }: DeleteStoreDialogProps) {
  const { deleteStore, isDeleting } = useStores()
  const router = useRouter()

  async function onDelete() {
    try {
      await deleteStore(store.id)
      toast.success("Loja excluída com sucesso!")
      router.push("/lojas")
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro ao excluir loja"
      toast.error(message, {
        duration: 5000,
      })
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
            Esta ação não pode ser desfeita. Isso excluirá permanentemente a loja{" "}
            <strong>{store.name}</strong> e removerá seus dados de nossos servidores.
            <br />
            <br />
            <strong>Atenção:</strong> Lojas com grupos ativos não podem ser excluídas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: React.MouseEvent) => {
              e.preventDefault()
              onDelete()
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Excluindo..." : "Excluir Loja"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
