import { useState } from "react"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  CATEGORIA_TAREFA_LABEL,
  PRIORIDADE_TAREFA_LABEL,
  TURNO_TAREFA_LABEL,
  type CategoriaTarefa,
  type PrioridadeTarefa,
  type TarefaHaras,
  type TurnoTarefa,
} from "@/lib/types"
import { useEquinosComFotos } from "@/lib/hooks"
import { useAuth } from "@/lib/auth-context"
import { gerarId, hojeIso, salvarTarefa } from "@/lib/db"
import { tocarSomSucesso } from "@/lib/sound-alerts"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ModalNovaTarefaProps {
  aberto: boolean
  onFechar: () => void
  onSalvo: () => void
  tarefaEdicao?: TarefaHaras | null
}

export function ModalNovaTarefa({
  aberto,
  onFechar,
  onSalvo,
  tarefaEdicao,
}: ModalNovaTarefaProps) {
  const { haras } = useAuth()
  const { equinos } = useEquinosComFotos()

  const [titulo, setTitulo] = useState(tarefaEdicao?.titulo ?? "")
  const [descricao, setDescricao] = useState(tarefaEdicao?.descricao ?? "")
  const [categoria, setCategoria] = useState<CategoriaTarefa>(tarefaEdicao?.categoria ?? "equino")
  const [turno, setTurno] = useState<TurnoTarefa>(tarefaEdicao?.turno ?? "manha")
  const [prioridade, setPrioridade] = useState<PrioridadeTarefa>(tarefaEdicao?.prioridade ?? "rotina")
  const [horario, setHorario] = useState(tarefaEdicao?.horarioProgramado ?? "08:00")
  const [data, setData] = useState(tarefaEdicao?.dataProgramada ?? hojeIso())
  const [equinoId, setEquinoId] = useState(tarefaEdicao?.equinoId ?? "")
  const [baiaNome, setBaiaNome] = useState(tarefaEdicao?.baiaNome ?? "")
  const [responsavel, setResponsavel] = useState(tarefaEdicao?.responsavelNome ?? "Carlos Tratador")
  const [salvando, setSalvando] = useState(false)

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) {
      toast.error("Informe o título da tarefa.")
      return
    }

    setSalvando(true)
    try {
      const eq = equinos.find((x) => x.id === equinoId)
      const nova: TarefaHaras = {
        id: tarefaEdicao?.id ?? gerarId(),
        harasId: haras?.id || "haras-cardoso-master",
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        categoria,
        turno,
        prioridade,
        status: tarefaEdicao?.status ?? "pendente",
        horarioProgramado: horario || undefined,
        dataProgramada: data,
        equinoId: equinoId || undefined,
        equinoNome: eq?.nome || undefined,
        baiaNome: baiaNome.trim() || undefined,
        responsavelNome: responsavel.trim() || "Equipe do Haras",
        iniciadoEm: tarefaEdicao?.iniciadoEm,
        concluidoEm: tarefaEdicao?.concluidoEm,
        tempoGastoMinutos: tarefaEdicao?.tempoGastoMinutos,
        fotoComprovanteUrl: tarefaEdicao?.fotoComprovanteUrl,
        lembreteMinutosAntes: 15,
        createdAt: tarefaEdicao?.createdAt ?? new Date().toISOString(),
      }

      await salvarTarefa(nova)
      tocarSomSucesso()
      toast.success(tarefaEdicao ? "Tarefa atualizada!" : "Nova tarefa agendada com sucesso!")
      onSalvo()
      onFechar()
    } catch {
      toast.error("Erro ao salvar tarefa.")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="sm:max-w-lg bg-background border-stone-200 dark:border-stone-800 rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Plus className="size-5 text-[#d9b978]" />
            {tarefaEdicao ? "Editar Tarefa" : "Agendar Nova Tarefa"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSalvar} className="space-y-4 mt-2 text-xs">
          {/* Categoria das Tarefas (Haras, Animais, Manutenção) */}
          <div>
            <label className="font-semibold block mb-1.5 text-foreground">Categoria da Tarefa</label>
            <div className="grid grid-cols-3 gap-2">
              {(["equino", "sitio_animais", "manutencao_infra"] as CategoriaTarefa[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoria(cat)}
                  className={cn(
                    "p-2.5 rounded-2xl border text-center font-bold transition-all active:scale-95 text-[11px] leading-tight",
                    categoria === cat
                      ? "bg-[#143129] text-[#d9b978] border-[#d9b978]/60 shadow-xs"
                      : "bg-muted/30 border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {CATEGORIA_TAREFA_LABEL[cat]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1 text-foreground">Título do Serviço</label>
            <Input
              placeholder="Ex.: Limpeza de baía, Alimentar galinhas, Curativo..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="rounded-xl text-xs h-10"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1 text-foreground">Turno</label>
              <select
                value={turno}
                onChange={(e) => setTurno(e.target.value as TurnoTarefa)}
                className="w-full h-10 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs font-semibold"
              >
                {Object.entries(TURNO_TAREFA_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1 text-foreground">Prioridade</label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as PrioridadeTarefa)}
                className={cn(
                  "w-full h-10 rounded-xl bg-background border px-3 text-xs font-bold",
                  prioridade === "urgente_saude"
                    ? "border-rose-500 text-rose-600 dark:text-rose-400"
                    : prioridade === "alta"
                    ? "border-amber-500 text-amber-600 dark:text-amber-400"
                    : "border-border text-foreground"
                )}
              >
                {Object.entries(PRIORIDADE_TAREFA_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1 text-foreground">Data Programada</label>
              <Input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="rounded-xl text-xs h-10"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1 text-foreground">Horário Previsto</label>
              <Input
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                className="rounded-xl text-xs h-10 font-mono font-bold"
              />
            </div>
          </div>

          {/* Vínculo de Cavalo ou Baía (se for Manejo Equino) */}
          {categoria === "equino" && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-muted/30 border border-border">
              <div>
                <label className="font-semibold block mb-1 text-foreground">Vincular a Cavalo</label>
                <select
                  value={equinoId}
                  onChange={(e) => setEquinoId(e.target.value)}
                  className="w-full h-9 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-2 text-xs"
                >
                  <option value="">Nenhum (Geral)</option>
                  {equinos.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-foreground">Baía / Cocheira</label>
                <Input
                  placeholder="Ex.: Baía 01, Piquete 3"
                  value={baiaNome}
                  onChange={(e) => setBaiaNome(e.target.value)}
                  className="rounded-xl text-xs h-9"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-semibold block mb-1 text-foreground">Funcionário / Responsável</label>
            <Input
              placeholder="Ex.: Carlos Tratador, Marcos Caseiro, Dr. Vet"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              className="rounded-xl text-xs h-10"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1 text-foreground">Instruções / Detalhes</label>
            <Textarea
              placeholder="Instruções específicas para o tratador realizar a tarefa com perfeição..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
              className="rounded-xl text-xs resize-none"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onFechar}
              className="rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={salvando}
              className="rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs hover:bg-[#1c4338] shadow-md"
            >
              {salvando ? "Salvando..." : tarefaEdicao ? "Atualizar Tarefa" : "Agendar Tarefa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
