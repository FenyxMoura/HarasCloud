import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { hojeIso, salvarVacina, salvarVermifugo } from "@/lib/db"
import type { Equino, Vacina, Vermifugo } from "@/lib/types"
import { toast } from "sonner"

interface RecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipo: "vacina" | "vermifugo"
  equinos: Equino[]
  equinoInicialId?: string
  registro?: Vacina | Vermifugo | null
  onSalvo: () => void
}

export function RecordDialog({
  open,
  onOpenChange,
  tipo,
  equinos,
  equinoInicialId,
  registro,
  onSalvo,
}: RecordDialogProps) {
  const [equinoId, setEquinoId] = useState("")
  const [titulo, setTitulo] = useState("")
  const [dataAplicacao, setDataAplicacao] = useState(hojeIso())
  const [dataProxima, setDataProxima] = useState("")
  const [veterinario, setVeterinario] = useState("")
  const [observacoes, setObservacoes] = useState("")

  useEffect(() => {
    if (!open) return
    const reg = registro as Vacina | Vermifugo | undefined
    setEquinoId(reg?.equinoId ?? equinoInicialId ?? "")
    setTitulo(reg ? (tipo === "vacina" ? (reg as Vacina).nome : (reg as Vermifugo).produto) : "")
    setDataAplicacao(reg?.dataAplicacao ?? hojeIso())
    setDataProxima(reg?.dataProxima ?? "")
    setVeterinario(tipo === "vacina" ? ((reg as Vacina | undefined)?.veterinario ?? "") : "")
    setObservacoes(reg?.observacoes ?? "")
  }, [open, registro, equinoInicialId, tipo])

  async function salvar() {
    if (!equinoId) {
      toast.error("Selecione o equino")
      return
    }
    if (!titulo.trim()) {
      toast.error(tipo === "vacina" ? "Informe o nome da vacina" : "Informe o produto")
      return
    }
    if (!dataAplicacao) {
      toast.error("Informe a data de aplicação")
      return
    }
    const agora = new Date().toISOString()

    if (tipo === "vacina") {
      const atual = registro as Vacina | undefined
      await salvarVacina({
        id: atual?.id ?? crypto.randomUUID(),
        equinoId,
        nome: titulo.trim(),
        dataAplicacao,
        dataProxima: dataProxima || undefined,
        veterinario: veterinario.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
        createdAt: atual?.createdAt ?? agora,
      })
    } else {
      const atual = registro as Vermifugo | undefined
      await salvarVermifugo({
        id: atual?.id ?? crypto.randomUUID(),
        equinoId,
        produto: titulo.trim(),
        dataAplicacao,
        dataProxima: dataProxima || undefined,
        observacoes: observacoes.trim() || undefined,
        createdAt: atual?.createdAt ?? agora,
      })
    }

    toast.success(registro ? "Registro atualizado" : "Registro adicionado")
    onSalvo()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {registro
              ? tipo === "vacina"
                ? "Editar vacina"
                : "Editar vermífugo"
              : tipo === "vacina"
                ? "Registrar vacina"
                : "Registrar vermífugo"}
          </DialogTitle>
          <DialogDescription>
            {tipo === "vacina"
              ? "Registre a aplicação e o vencimento da próxima dose."
              : "Registre a vermifugação e o próximo vencimento."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Equino *</Label>
            <Select value={equinoId} onValueChange={setEquinoId}>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Selecione o equino" />
              </SelectTrigger>
              <SelectContent>
                {equinos.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {tipo === "vacina" ? "Vacina *" : "Produto / Vermífugo *"}
            </Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder={tipo === "vacina" ? "Ex.: Influenza Equina, Tétano…" : "Ex.: Ivermectina"}
              className="rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Data da aplicação *</Label>
              <Input type="date" value={dataAplicacao} onChange={(e) => setDataAplicacao(e.target.value)} className="rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Próxima dose</Label>
              <Input type="date" value={dataProxima} onChange={(e) => setDataProxima(e.target.value)} className="rounded-lg" />
            </div>
          </div>

          {tipo === "vacina" && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Veterinário(a)</Label>
              <Input value={veterinario} onChange={(e) => setVeterinario(e.target.value)} placeholder="Nome do profissional" className="rounded-lg" />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Observações</Label>
            <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={2} className="rounded-lg" placeholder="Lote, reação, anotações…" />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={salvar} className="rounded-lg">
            {registro ? "Salvar" : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
