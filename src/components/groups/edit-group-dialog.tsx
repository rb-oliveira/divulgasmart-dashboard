"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useGroups, Group } from "@/hooks/useGroups"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { MessageCircle, Send } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  inviteLink: z.string().url("Link inválido"),
  isActive: z.boolean(),
  type: z.enum(["WHATSAPP", "TELEGRAM"]),
})

interface EditGroupDialogProps {
  group: Group | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditGroupDialog({ group, open, onOpenChange }: EditGroupDialogProps) {
  const { updateGroup, isUpdating } = useGroups()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      inviteLink: "",
      isActive: true,
      type: "WHATSAPP",
    },
  })

  useEffect(() => {
    if (group) {
      form.reset({
        name: group.name,
        inviteLink: group.inviteLink,
        isActive: group.isActive,
        type: group.type,
      })
    }
  }, [group, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!group) return

    try {
      await updateGroup({
        id: group.id,
        data: values,
      })
      toast.success("Grupo atualizado com sucesso!")
      onOpenChange(false)
    } catch (error) {
      toast.error("Erro ao atualizar grupo")
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Grupo</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Plataforma</FormLabel>
                  <FormControl>
                    <Tabs
                      onValueChange={field.onChange}
                      value={field.value}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="WHATSAPP" className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" /> WhatsApp
                        </TabsTrigger>
                        <TabsTrigger value="TELEGRAM" className="flex items-center gap-2">
                          <Send className="h-4 w-4" /> Telegram
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Grupo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Grupo VIP de Ofertas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="inviteLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link de Convite</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Ativo</FormLabel>
                    <FormDescription>
                      Grupos inativos não recebem novos membros através do link único.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
