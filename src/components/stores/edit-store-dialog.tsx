"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Store, useStores } from "@/hooks/useStores"

const editStoreSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres").regex(/^[a-z0-9-]+$/, "Slug inválido"),
})

type EditStoreValues = z.infer<typeof editStoreSchema>

interface EditStoreDialogProps {
  store: Store
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditStoreDialog({ store, open, onOpenChange }: EditStoreDialogProps) {
  const { updateStore, isUpdating } = useStores()

  const form = useForm<EditStoreValues>({
    resolver: zodResolver(editStoreSchema),
    defaultValues: {
      name: store.name,
      slug: store.slug,
    },
  })

  async function onSubmit(values: EditStoreValues) {
    try {
      await updateStore({ id: store.id, data: values })
      toast.success("Loja atualizada com sucesso!")
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao atualizar loja")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Loja</DialogTitle>
          <DialogDescription>
            Altere as informações da sua loja abaixo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Loja</FormLabel>
                  <FormControl>
                    <Input placeholder="Minha Loja" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (URL personalizada)</FormLabel>
                  <FormControl>
                    <Input placeholder="minha-loja" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
