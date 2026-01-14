"use client"

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
import { Copy, ExternalLink, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface GroupListProps {
  storeId: string
}

export function GroupList({ storeId }: GroupListProps) {
  const { groups, isLoading, updateMembers } = useGroups(storeId)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tempMembers, setTempMembers] = useState<string>("")

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
    // Generate the tracking URL based on current host
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
      setEditingId(null)
      toast.success("Membros atualizados!")
    } catch (error) {
      toast.error("Erro ao atualizar membros")
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Membros</TableHead>
            <TableHead>Cliques</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <TableRow key={group.id}>
              <TableCell className="font-medium">{group.name}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${group.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    group.status === 'FULL' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                  }`}>
                  {group.status}
                </span>
              </TableCell>
              <TableCell>
                {editingId === group.id ? (
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
                    className="cursor-pointer hover:bg-muted p-1 rounded transition-colors"
                    onClick={() => {
                      setEditingId(group.id)
                      setTempMembers(group.memberCount.toString())
                    }}
                  >
                    {group.memberCount} membros
                  </div>
                )}
              </TableCell>
              <TableCell>{group.clickCount}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(group.id, group.slug)}
                >
                  {copiedId === group.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copiedId === group.id ? "Copiado" : "Copiar Link"}
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href={group.inviteLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
