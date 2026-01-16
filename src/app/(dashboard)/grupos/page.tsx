"use client"

import { useAllGroups, Group, useGroups } from "@/hooks/useGroups"
import { useStores } from "@/hooks/useStores"
import { useState, useMemo, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CreateGroupDialog } from "@/components/groups/create-group-dialog"
import { EditGroupDialog } from "@/components/groups/edit-group-dialog"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Copy, ExternalLink, Check, Store as StoreIcon, Pencil, Trash2, MessageCircle, Send } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
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

export default function GroupsPage() {
  const { groups, isLoading } = useAllGroups()
  const { stores } = useStores()
  const { deleteGroup } = useGroups()
  const [selectedStoreId, setSelectedStoreId] = useState<string>("all")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null)

  const filteredGroups = useMemo(() => {
    if (selectedStoreId === "all") return groups
    return groups.filter((g) => g.storeId === selectedStoreId)
  }, [groups, selectedStoreId])

  const handleCopy = (id: string, slug: string) => {
    const trackingUrl = `${window.location.origin}/api/redirect/${slug}`
    navigator.clipboard.writeText(trackingUrl)
    setCopiedId(id)
    toast.success("Link copiado!")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async () => {
    if (!deletingGroupId) return
    try {
      await deleteGroup(deletingGroupId)
      toast.success("Grupo excluído com sucesso!")
      setDeletingGroupId(null)
    } catch (error) {
      toast.error("Erro ao excluir grupo")
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="rounded-md border p-12 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Meus Grupos</h2>
          <CreateGroupDialog />
        </div>

        <div className="flex items-center gap-4">
          <div className="w-[200px]">
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Loja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Lojas</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredGroups.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center bg-muted/50">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background mb-4">
              <StoreIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardHeader className="p-0">
              <CardTitle>Nenhum grupo encontrado</CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-2">
              <p className="text-muted-foreground">
                {selectedStoreId === "all"
                  ? "Você ainda não tem grupos cadastrados."
                  : "Não há grupos correspondentes a esta loja."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Loja</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[200px]">Membros</TableHead>
                  <TableHead>Cliques</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.map((group) => {
                  const memberLimit = group.type === "TELEGRAM" ? 200000 : 1024;
                  const percentage = Math.min((group.memberCount / memberLimit) * 100, 100);
                  const isWhatsApp = group.type === "WHATSAPP";

                  return (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 p-1.5 rounded-full ${isWhatsApp ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {isWhatsApp ? <MessageCircle className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                          </div>
                          <div className="flex flex-col">
                            <span>{group.name}</span>
                            {!group.isActive && (
                              <Badge variant="destructive" className="w-fit mt-1 h-5 text-[10px] uppercase">Inativo</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {group.store?.name || "Loja desconhecida"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${group.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : group.status === "FULL"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {group.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="text-sm">
                            {group.memberCount} / {memberLimit}
                          </div>
                          <Progress
                            value={percentage}
                            className="h-2"
                            indicatorClassName={isWhatsApp ? "bg-green-500" : "bg-blue-500"}
                          />
                        </div>
                      </TableCell>
                      <TableCell>{group.clickCount}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => handleCopy(group.id, group.slug)}
                        >
                          {copiedId === group.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4 mr-2" />
                          )}
                          {copiedId === group.id ? "Copiado" : "Link"}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingGroup(group)
                            setIsEditOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeletingGroupId(group.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a
                            href={group.inviteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <EditGroupDialog
        group={editingGroup}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <AlertDialog open={!!deletingGroupId} onOpenChange={(open) => !open && setDeletingGroupId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o grupo e todos os dados associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
