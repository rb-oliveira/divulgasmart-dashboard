"use client"

import { useStores } from "@/hooks/useStores"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Edit, Trash, LayoutGrid, Tag, Link as LinkIcon, Copy, Check, MessageCircle, Send } from "lucide-react"
import { useGroups } from "@/hooks/useGroups"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { EditStoreDialog } from "@/components/stores/edit-store-dialog"
import { DeleteStoreDialog } from "@/components/stores/delete-store-dialog"
import { GroupList } from "@/components/groups/group-list"
import { CreateGroupDialog } from "@/components/groups/create-group-dialog"

export default function LojaDetalhesPage() {
  const { id } = useParams()
  const router = useRouter()
  const { stores, isLoading: isLoadingStore } = useStores()
  const { groups, isLoading: isLoadingGroups } = useGroups(id as string)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [copiedType, setCopiedType] = useState<string | null>(null)

  const store = stores.find((s) => s.id === id)

  const getPublicUrl = (type: string) => `http://localhost:3010/r/${store?.slug}/${type.toLowerCase()}`

  const copyToClipboard = (type: string) => {
    navigator.clipboard.writeText(getPublicUrl(type))
    setCopiedType(type)
    setTimeout(() => setCopiedType(null), 2000)
  }

  const hasWhatsAppGroups = groups.some(g => g.type === 'WHATSAPP' && g.isActive);
  const hasTelegramGroups = groups.some(g => g.type === 'TELEGRAM' && g.isActive);

  if (isLoadingStore || isLoadingGroups) {
    return <div className="p-8">Carregando detalhes...</div>
  }

  if (!store) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-4">Loja não encontrada.</p>
        <Button onClick={() => router.push("/lojas")}>Voltar para Lojas</Button>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/lojas">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">{store.name}</h2>
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
            <div className="text-2xl font-bold">{store.whatsappClicks ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Telegram Cliques</CardTitle>
            <Send className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{store.telegramClicks ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Link Único WhatsApp</CardTitle>
            <MessageCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className={`flex-1 p-2 rounded text-sm truncate ${hasWhatsAppGroups ? 'bg-muted' : 'bg-muted/50 text-muted-foreground line-through'}`}>
                {getPublicUrl('whatsapp')}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard('whatsapp')}
                disabled={!hasWhatsAppGroups}
              >
                {copiedType === 'whatsapp' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
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
              <code className={`flex-1 p-2 rounded text-sm truncate ${hasTelegramGroups ? 'bg-muted' : 'bg-muted/50 text-muted-foreground line-through'}`}>
                {getPublicUrl('telegram')}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard('telegram')}
                disabled={!hasTelegramGroups}
              >
                {copiedType === 'telegram' ? (
                  <Check className="h-4 w-4 text-blue-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
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
          <h3 className="text-xl font-semibold">Grupos desta Loja</h3>
          <CreateGroupDialog storeId={store.id} />
        </div>
        <GroupList storeId={store.id} />
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <div>
              <span className="font-semibold">Slug:</span>{" "}
              <code className="bg-muted px-1 rounded">{store.slug}</code>
            </div>
            <div>
              <span className="font-semibold">Total de Grupos:</span> {store._count?.groups ?? 0}
            </div>
            <div>
              <span className="font-semibold">Total de Ofertas:</span> {store._count?.offers ?? 0}
            </div>
            <div>
              <span className="font-semibold">Total de Cliques:</span> {store.clickCount ?? 0}
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold">Criada em:</span>{" "}
              {new Date(store.createdAt).toLocaleDateString("pt-BR")}
            </div>
          </CardContent>
        </Card>
      </div>

      <EditStoreDialog
        store={store}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
      <DeleteStoreDialog
        store={store}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </div>
  )
}
