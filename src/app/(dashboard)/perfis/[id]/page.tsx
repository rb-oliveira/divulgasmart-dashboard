"use client"

import { useProfiles } from "@/hooks/useProfiles"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Edit, Trash, LayoutGrid, Copy, Check, MessageCircle, Send } from "lucide-react"
import { useGroups } from "@/hooks/useGroups"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { EditStoreDialog } from "@/components/stores/edit-store-dialog"
import { DeleteStoreDialog } from "@/components/stores/delete-store-dialog"
import { GroupList } from "@/components/groups/group-list"
import { CreateGroupDialog } from "@/components/groups/create-group-dialog"

export default function PerfilDetalhesPage() {
  const { id } = useParams()
  const router = useRouter()
  const { profiles, isLoading: isLoadingProfile } = useProfiles()
  const { groups, isLoading: isLoadingGroups } = useGroups(id as string)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [copiedType, setCopiedType] = useState<string | null>(null)

  const profile = profiles.find((p) => p.id === id)

  const getPublicUrl = (type: string) => `http://localhost:3010/r/${profile?.slug}/${type.toLowerCase()}`

  const copyToClipboard = (type: string) => {
    navigator.clipboard.writeText(getPublicUrl(type))
    setCopiedType(type)
    setTimeout(() => setCopiedType(null), 2000)
  }

  const hasWhatsAppGroups = groups.some((g) => g.type === "WHATSAPP" && g.isActive)
  const hasTelegramGroups = groups.some((g) => g.type === "TELEGRAM" && g.isActive)

  if (isLoadingProfile || isLoadingGroups) {
    return <div className="p-8">Carregando detalhes...</div>
  }

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-4">Perfil não encontrado.</p>
        <Button onClick={() => router.push("/perfis")}>Voltar para Perfis</Button>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/perfis">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">{profile.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setIsDeleteOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp Cliques</CardTitle>
            <MessageCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.whatsappClicks ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Telegram Cliques</CardTitle>
            <Send className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.telegramClicks ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Link Único WhatsApp</CardTitle>
            <MessageCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className={`flex-1 p-2 rounded text-sm truncate ${hasWhatsAppGroups ? "bg-muted" : "bg-muted/50 text-muted-foreground line-through"}`}>
                {getPublicUrl("whatsapp")}
              </code>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard("whatsapp")} disabled={!hasWhatsAppGroups}>
                {copiedType === "whatsapp" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {!hasWhatsAppGroups && (
              <p className="text-[10px] text-destructive mt-1 font-medium">Sem grupos de WhatsApp ativos</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Link Único Telegram</CardTitle>
            <Send className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className={`flex-1 p-2 rounded text-sm truncate ${hasTelegramGroups ? "bg-muted" : "bg-muted/50 text-muted-foreground line-through"}`}>
                {getPublicUrl("telegram")}
              </code>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard("telegram")} disabled={!hasTelegramGroups}>
                {copiedType === "telegram" ? <Check className="h-4 w-4 text-blue-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {!hasTelegramGroups && (
              <p className="text-[10px] text-destructive mt-1 font-medium">Sem grupos de Telegram ativos</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Grupos deste Perfil</h3>
          <CreateGroupDialog profileId={profile.id} />
        </div>
        <GroupList profileId={profile.id} />
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <div>
              <span className="font-semibold">Slug:</span>{" "}
              <code className="bg-muted px-1 rounded">{profile.slug}</code>
            </div>
            <div>
              <span className="font-semibold">Total de Grupos:</span> {profile._count?.groups ?? 0}
            </div>
            <div>
              <span className="font-semibold">Total de Ofertas:</span> {profile._count?.offers ?? 0}
            </div>
            <div>
              <span className="font-semibold">Total de Cliques:</span> {profile.clickCount ?? 0}
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold">Criado em:</span>{" "}
              {new Date(profile.createdAt).toLocaleDateString("pt-BR")}
            </div>
          </CardContent>
        </Card>
      </div>

      <EditStoreDialog store={profile} open={isEditOpen} onOpenChange={setIsEditOpen} />
      <DeleteStoreDialog store={profile} open={isDeleteOpen} onOpenChange={setIsDeleteOpen} />
    </div>
  )
}
