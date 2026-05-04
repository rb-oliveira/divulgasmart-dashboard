"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useGroups } from "@/hooks/useGroups"
import { useProfiles } from "@/hooks/useProfiles"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, MessageCircle, Send } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  inviteLink: z.string().url("Link inválido"),
  profileId: z.string().min(1, "Selecione um perfil"),
  type: z.enum(["WHATSAPP", "TELEGRAM"]),
})

interface CreateGroupDialogProps {
  profileId?: string
}

export function CreateGroupDialog({ profileId }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false)
  const { profiles } = useProfiles()
  const { createGroup, isCreating } = useGroups(profileId)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      inviteLink: "",
      profileId: profileId || "",
      type: "WHATSAPP",
    },
  })

  useEffect(() => {
    if (profileId) form.setValue("profileId", profileId)
  }, [profileId, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createGroup({
        name: values.name,
        inviteLink: values.inviteLink,
        profileId: values.profileId,
        type: values.type,
      })
      toast.success("Grupo criado com sucesso!")
      form.reset({ name: "", inviteLink: "", profileId: profileId || "", type: "WHATSAPP" })
      setOpen(false)
    } catch (error) {
      toast.error("Erro ao criar grupo")
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Grupo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Grupo</DialogTitle>
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
                    <Tabs onValueChange={field.onChange} defaultValue={field.value} className="w-full">
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
            {!profileId && (
              <FormField
                control={form.control}
                name="profileId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um perfil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {profiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Criando..." : "Criar Grupo"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
