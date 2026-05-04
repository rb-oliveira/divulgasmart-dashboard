"use client"

import { useState } from "react"
import { Plus, LayoutGrid, ExternalLink } from "lucide-react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useProfiles } from "@/hooks/useProfiles"

const profileSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "O slug deve ter pelo menos 3 caracteres").regex(/^[a-z0-9-]+$/, "Slug inválido (apenas letras minúsculas, números e hifens)"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function PerfisPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { profiles, isLoading, isError, createProfile, isCreating } = useProfiles()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", slug: "" },
  })

  const { watch, setValue } = form
  const nameValue = watch("name")

  useEffect(() => {
    const slug = nameValue
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
    setValue("slug", slug, { shouldValidate: true })
  }, [nameValue, setValue])

  function onSubmit(values: ProfileFormValues) {
    createProfile(values, {
      onSuccess: () => {
        setIsDialogOpen(false)
        form.reset()
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Perfis</h1>
          <p className="text-muted-foreground">Gerencie seus perfis de nicho.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Perfil
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Perfil</DialogTitle>
              <DialogDescription>Informe o nome e o slug do seu novo perfil. O slug será usado na URL.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Perfil</FormLabel>
                      <FormControl>
                        <Input placeholder="Nicho Maternidade" {...field} />
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
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="nicho-maternidade" {...field} />
                      </FormControl>
                      <FormDescription>Identificador único amigável para URLs.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Criando..." : "Criar Perfil"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="gap-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Erro ao carregar perfis</CardTitle>
            <CardDescription>Não foi possível conectar ao servidor.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.length === 0 && (
            <div className="col-span-full py-10 text-center text-muted-foreground">
              Nenhum perfil cadastrado ainda.
            </div>
          )}
          {profiles.map((profile) => (
            <Card key={profile.id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-primary/10 text-primary">
                    <LayoutGrid className="h-5 w-5" />
                  </div>
                  <div>
                    <Link href={`/perfis/${profile.id}`} className="hover:underline">
                      <CardTitle>{profile.name}</CardTitle>
                    </Link>
                    <CardDescription>/{profile.slug}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Perfil ativo e pronto para gerenciar ofertas e grupos.
                </p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
                  <Link href={`/perfis/${profile.id}`}>
                    <LayoutGrid className="h-4 w-4" />
                    Gerenciar
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2" asChild>
                  <a href={`https://${profile.slug}.divulgasmart.com`} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Ver
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
