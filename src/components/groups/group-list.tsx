import { Group, useGroups } from "@/hooks/useGroups"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, ExternalLink, Check, Pencil, Trash2, MessageCircle, Send } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { EditGroupDialog } from "./edit-group-dialog"
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

interface GroupListProps {
  storeId: string
}

export function GroupList({ storeId }: GroupListProps) {
  const { groups, isLoading, updateMembers, deleteGroup } = useGroups(storeId)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editingMembersId, setEditingMembersId] = useState<string | null>(null)
  const [tempMembers, setTempMembers] = useState<string>("")

  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null)

  if (isLoading) {
    return <div className="p-4">Carregando grupos...</div>
  }

  if (groups.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/50">
        <p className="text-muted-foreground">Nenhum grupo cadastrado para esta loja.</p>
      </div>
    )
  }

  const handleCopy = (id: string, slug: string) => {
    const trackingUrl = `${window.location.origin}/api/redirect/${slug}`
    navigator.clipboard.writeText(trackingUrl)
    setCopiedId(id)
    toast.success("Link copiado!")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleUpdateMembers = async (id: string) => {
    const count = parseInt(tempMembers)
    if (isNaN(count)) return

    try {
      await updateMembers({ id, memberCount: count })
      setEditingMembersId(null)
      toast.success("Membros atualizados!")
    } catch (error) {
      toast.error("Erro ao atualizar membros")
    }
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

  return (
    <>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[200px]">Membros</TableHead>
              <TableHead>Cliques</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => {
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
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${group.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      group.status === 'FULL' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {group.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {editingMembersId === group.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-20 h-8"
                            value={tempMembers}
                            onChange={(e) => setTempMembers(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateMembers(group.id)}
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleUpdateMembers(group.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer hover:bg-muted p-1 rounded transition-colors text-sm"
                          onClick={() => {
                            setEditingMembersId(group.id)
                            setTempMembers(group.memberCount.toString())
                          }}
                        >
                          {group.memberCount} / {memberLimit}
                        </div>
                      )}
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
                      <a href={group.inviteLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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
