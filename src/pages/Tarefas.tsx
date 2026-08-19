import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileVideo,
  Image as ImageIcon,
  Pencil,
  Play,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ModalNovaTarefa } from "@/components/tarefas/ModalNovaTarefa"
import { ModalConcluirTarefa } from "@/components/tarefas/ModalConcluirTarefa"
import { ModalVisualizarComprovante } from "@/components/tarefas/ModalVisualizarComprovante"
import { HarasVisionModal } from "@/components/ia/HarasVisionModal"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import {
  anexarMidiaTarefa,
  getTarefas,
  hojeIso,
  iniciarTarefa,
  removerTarefa,
} from "@/lib/db"
import { useEquinosComFotos } from "@/lib/hooks"
import {
  tocarSomAlarmeTarefa,
  tocarSomInicioTarefa,
} from "@/lib/sound-alerts"
import {
  CATEGORIA_TAREFA_LABEL,
  PRIORIDADE_TAREFA_LABEL,
  TURNO_TAREFA_LABEL,
  type CategoriaTarefa,
  type TarefaHaras,
  type TurnoTarefa,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function Tarefas() {
  const { fotos } = useEquinosComFotos()

  const [tarefas, setTarefas] = useState<TarefaHaras[]>([])
  const [dataFiltro, setDataFiltro] = useState(hojeIso())
  const [categoriaAtiva, setCategoriaAtiva] = useState<"todas" | CategoriaTarefa>("todas")
  const [turnoAtivo, setTurnoAtivo] = useState<"todos" | TurnoTarefa>("todos")
  const [busca, setBusca] = useState("")

  // Modais
  const [modalNovoAberto, setModalNovoAberto] = useState(false)
  const [tarefaEdicao, setTarefaEdicao] = useState<TarefaHaras | null>(null)
  const [tarefaParaConcluir, setTarefaParaConcluir] = useState<TarefaHaras | null>(null)
  const [tarefaParaVisualizar, setTarefaParaVisualizar] = useState<TarefaHaras | null>(null)
  const [modalVisionAberto, setModalVisionAberto] = useState(false)
  const [excluirId, setExcluirId] = useState<string | null>(null)

  // Upload rápido de foto direta no card em andamento
  const [tarefaAtivaUploadId, setTarefaAtivaUploadId] = useState<string | null>(null)
  const fileInputRapidoRef = useRef<HTMLInputElement>(null)

  // Timer ao vivo para atualizar cronômetros a cada segundo
  const [tempoAtual, setTempoAtual] = useState(Date.now())

  const carregar = useCallback(async () => {
    const dados = await getTarefas()
    setTarefas(dados)
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  // Atualiza relógio a cada 1s para o cronômetro das tarefas em andamento
  useEffect(() => {
    const interval = setInterval(() => {
      setTempoAtual(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Verificador de Alarme Sonoro de Horário Próximo
  useEffect(() => {
    const checkAlarmes = () => {
      const agora = new Date()
      const horaAtual = agora.getHours().toString().padStart(2, "0")
      const minAtual = agora.getMinutes().toString().padStart(2, "0")
      const horarioStr = `${horaAtual}:${minAtual}`

      tarefas.forEach((t) => {
        if (t.status === "pendente" && t.horarioProgramado === horarioStr) {
          tocarSomAlarmeTarefa()
          toast.warning(`⏰ Hora da tarefa: ${t.titulo}`, {
            description: `Responsável: ${t.responsavelNome} · ${t.baiaNome || t.categoria}`,
          })
        }
      })
    }

    const timer = setInterval(checkAlarmes, 60000)
    return () => clearInterval(timer)
  }, [tarefas])

  // Iniciar Cronômetro
  async function handleIniciar(id: string) {
    tocarSomInicioTarefa()
    const atualizada = await iniciarTarefa(id)
    if (atualizada) {
      toast.success("Cronômetro iniciado!", {
        description: `Manejo iniciado por ${atualizada.responsavelNome}. Você pode ir tirando fotos das baías/bebedouros durante a ronda.`,
      })
      await carregar()
    }
  }

  // Upload de Foto Rápida no meio da ronda
  function dispararFotoRapida(tarefaId: string) {
    setTarefaAtivaUploadId(tarefaId)
    fileInputRapidoRef.current?.click()
  }

  async function handleFotoRapidaSelecionada(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !tarefaAtivaUploadId) return

    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      await anexarMidiaTarefa(tarefaAtivaUploadId, dataUrl, "foto")
      toast.success("📸 Foto anexada na tarefa em andamento!")
      setTarefaAtivaUploadId(null)
      await carregar()
    }
    reader.readAsDataURL(file)
  }

  // Métricas do Dia Filtrado
  const tarefasDoDia = useMemo(() => {
    return tarefas.filter((t) => !dataFiltro || t.dataProgramada === dataFiltro)
  }, [tarefas, dataFiltro])

  const totalTarefas = tarefasDoDia.length
  const concluidas = tarefasDoDia.filter((t) => t.status === "concluida").length
  const emAndamento = tarefasDoDia.filter((t) => t.status === "em_andamento").length
  const pendentes = tarefasDoDia.filter((t) => t.status === "pendente").length
  const porcentagemConcluida =
    totalTarefas > 0 ? Math.round((concluidas / totalTarefas) * 100) : 0

  const tarefasFiltradas = useMemo(() => {
    return tarefasDoDia.filter((t) => {
      const matchCat = categoriaAtiva === "todas" || t.categoria === categoriaAtiva
      const matchTurno = turnoAtivo === "todos" || t.turno === turnoAtivo
      const matchBusca =
        !busca.trim() ||
        t.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        t.responsavelNome.toLowerCase().includes(busca.toLowerCase()) ||
        (t.equinoNome && t.equinoNome.toLowerCase().includes(busca.toLowerCase())) ||
        (t.baiaNome && t.baiaNome.toLowerCase().includes(busca.toLowerCase()))

      return matchCat && matchTurno && matchBusca
    })
  }, [tarefasDoDia, categoriaAtiva, turnoAtivo, busca])

  function formatarTempoDecorrido(iniciadoEm?: string): string {
    if (!iniciadoEm) return "00:00"
    const inicio = new Date(iniciadoEm).getTime()
    const diffSegundos = Math.max(0, Math.floor((tempoAtual - inicio) / 1000))
    const minutos = Math.floor(diffSegundos / 60)
    const segundos = diffSegundos % 60
    return `${minutos.toString().padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CheckCircle2 className="size-7 text-[#d9b978]" />
            Manejo &amp; Rotina dos Funcionários
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Controle de ração, água dos bebedouros, limpeza de baías, animais e manutenção do sítio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setModalVisionAberto(true)}
            variant="outline"
            className="rounded-2xl border-[#d9b978]/40 hover:border-[#d9b978] text-foreground font-bold text-xs sm:text-sm shadow-sm active:scale-95"
          >
            <Camera className="mr-1.5 size-4 text-[#d9b978]" />
            Haras Vision IA
          </Button>

          <Button
            onClick={() => {
              setTarefaEdicao(null)
              setModalNovoAberto(true)
            }}
            className="rounded-2xl bg-[#143129] text-[#d9b978] font-bold text-xs sm:text-sm hover:bg-[#1c4338] shadow-md active:scale-95"
          >
            <Plus className="mr-1.5 size-4" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Seletor de Data & Histórico de Auditoria */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-muted/30 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-background border border-border flex items-center justify-center text-[#d9b978] shadow-xs">
            <Calendar className="size-4.5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Data de Auditoria / Histórico
            </span>
            <span className="font-serif text-sm font-bold text-foreground">
              {dataFiltro === hojeIso() ? "📅 Hoje (Manejo em Andamento)" : `Histórico de ${dataFiltro}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dataFiltro}
            onChange={(e) => setDataFiltro(e.target.value)}
            className="w-auto h-9 rounded-xl text-xs bg-background font-semibold"
          />
          {dataFiltro !== hojeIso() && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDataFiltro(hojeIso())}
              className="rounded-xl text-xs font-bold"
            >
              Voltar para Hoje
            </Button>
          )}
        </div>
      </div>

      {/* Radar de Produtividade do Haras */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-3xl p-4 sm:p-5 border-stone-200/80 dark:border-stone-800 bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Progresso</span>
            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {porcentagemConcluida}%
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-black text-foreground mt-2">
            {concluidas} / {totalTarefas}
          </p>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${porcentagemConcluida}%` }}
            />
          </div>
        </Card>

        <Card className="rounded-3xl p-4 sm:p-5 border-stone-200/80 dark:border-stone-800 bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Em Andamento</span>
            <span className="size-2.5 rounded-full bg-amber-500 animate-ping" />
          </div>
          <p className="text-2xl sm:text-3xl font-display font-black text-amber-600 dark:text-amber-400 mt-2">
            {emAndamento}
          </p>
          <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Com Cronômetro Ativo</p>
        </Card>

        <Card className="rounded-3xl p-4 sm:p-5 border-stone-200/80 dark:border-stone-800 bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pendentes</span>
            <Clock className="size-4 text-stone-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-display font-black text-foreground mt-2">{pendentes}</p>
          <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Aguardando Início</p>
        </Card>

        <Card className="rounded-3xl p-4 sm:p-5 border-stone-200/80 dark:border-stone-800 bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Média de Tempo</span>
            <TrendingUp className="size-4 text-[#d9b978]" />
          </div>
          <p className="text-2xl sm:text-3xl font-display font-black text-[#d9b978] mt-2">~22 min</p>
          <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Por Trato &amp; Bebedouros</p>
        </Card>
      </div>

      {/* Filtro por Categorias (Manejo Equino, Animais do Sítio, Manutenção) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setCategoriaAtiva("todas")}
            className={cn(
              "px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95",
              categoriaAtiva === "todas"
                ? "bg-[#143129] text-[#d9b978] shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            🌟 Todas as Tarefas ({tarefasDoDia.length})
          </button>

          {(["equino", "sitio_animais", "manutencao_infra"] as CategoriaTarefa[]).map((cat) => {
            const count = tarefasDoDia.filter((t) => t.categoria === cat).length
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaAtiva(cat)}
                className={cn(
                  "px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95",
                  categoriaAtiva === cat
                    ? "bg-[#143129] text-[#d9b978] shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {CATEGORIA_TAREFA_LABEL[cat]} ({count})
              </button>
            )
          })}
        </div>

        {/* Turnos */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(["todos", "manha", "tarde", "noite"] as const).map((tur) => (
            <button
              key={tur}
              type="button"
              onClick={() => setTurnoAtivo(tur)}
              className={cn(
                "px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all",
                turnoAtivo === tur
                  ? "bg-stone-200 dark:bg-stone-800 text-foreground font-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tur === "todos" ? "Todos Turnos" : TURNO_TAREFA_LABEL[tur]}
            </button>
          ))}
        </div>
      </div>

      {/* Barra de Busca Rápida */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por tarefa, funcionário, cavalo ou baía..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9 h-10 rounded-2xl text-xs"
        />
      </div>

      {/* Lista de Tarefas / Checklist Executivo */}
      {tarefasFiltradas.length === 0 ? (
        <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 p-12 text-center">
          <CheckCircle2 className="size-12 mx-auto text-[#d9b978] opacity-60 mb-2" />
          <h3 className="font-serif text-lg font-bold text-foreground">Nenhuma tarefa para esta data</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Não há tarefas agendadas para o dia selecionado ou você pode programar uma nova tarefa.
          </p>
          <Button
            onClick={() => {
              setTarefaEdicao(null)
              setModalNovoAberto(true)
            }}
            className="mt-4 rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs"
          >
            Agendar Nova Tarefa
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {tarefasFiltradas.map((t) => {
            const emExecucao = t.status === "em_andamento"
            const concluida = t.status === "concluida"
            const qtdFotos = (t.fotosComprovantes?.length || (t.fotoComprovanteUrl ? 1 : 0))
            const qtdVideos = t.videosComprovantes?.length || 0

            return (
              <Card
                key={t.id}
                className={cn(
                  "rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between shadow-xs",
                  emExecucao
                    ? "border-amber-500/80 bg-amber-500/5 ring-2 ring-amber-500/20"
                    : concluida
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-stone-200/80 dark:border-stone-800 bg-card hover:border-[#d9b978]/60"
                )}
              >
                <div>
                  {/* Topo do Card: Categoria, Prioridade e Horário */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-lg border border-border/60">
                      {CATEGORIA_TAREFA_LABEL[t.categoria]}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {t.horarioProgramado && (
                        <span className="font-mono text-xs font-bold text-foreground bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center gap-1">
                          <Clock className="size-3 text-stone-500" />
                          {t.horarioProgramado}
                        </span>
                      )}

                      <span
                        className={cn(
                          "text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border",
                          t.prioridade === "urgente_saude"
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse"
                            : t.prioridade === "alta"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                            : "bg-stone-500/10 text-muted-foreground border-stone-500/20"
                        )}
                      >
                        {PRIORIDADE_TAREFA_LABEL[t.prioridade]}
                      </span>
                    </div>
                  </div>

                  {/* Título & Descrição */}
                  <h3
                    className={cn(
                      "font-serif text-base sm:text-lg font-bold text-foreground mt-3 leading-snug",
                      concluida && "line-through text-muted-foreground"
                    )}
                  >
                    {t.titulo}
                  </h3>

                  {t.descricao && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {t.descricao}
                    </p>
                  )}

                  {/* Metadados: Baía, Cavalo e Funcionário */}
                  <div className="mt-3.5 space-y-1.5 text-xs">
                    {(t.equinoNome || t.baiaNome) && (
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/30 border border-border/50">
                        {t.equinoId && fotos[t.equinoId] ? (
                          <img
                            src={fotos[t.equinoId]}
                            alt={t.equinoNome || "Cavalo"}
                            className="size-7 rounded-lg object-cover"
                          />
                        ) : null}
                        <div className="min-w-0">
                          {t.equinoNome && (
                            <span className="font-bold text-foreground truncate block text-xs">
                              🐴 {t.equinoNome}
                            </span>
                          )}
                          {t.baiaNome && (
                            <span className="text-[10px] text-muted-foreground font-semibold">
                              📍 {t.baiaNome}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <User className="size-3 text-[#d9b978]" />
                        <strong>{t.responsavelNome}</strong>
                      </span>

                      {concluida && t.tempoGastoMinutos && (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          ✓ Feito em {t.tempoGastoMinutos} min
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Miniaturas de Mídias Já Anexadas */}
                  {(qtdFotos > 0 || qtdVideos > 0) && (
                    <div className="mt-3 flex items-center gap-2 p-2 rounded-xl bg-background/80 border border-border text-[11px]">
                      {qtdFotos > 0 && (
                        <span className="flex items-center gap-1 font-bold text-foreground">
                          <ImageIcon className="size-3.5 text-[#d9b978]" /> {qtdFotos} foto{qtdFotos > 1 ? "s" : ""}
                        </span>
                      )}
                      {qtdVideos > 0 && (
                        <span className="flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400">
                          <FileVideo className="size-3.5" /> {qtdVideos} vídeo{qtdVideos > 1 ? "s" : ""}
                        </span>
                      )}
                      {concluida && (
                        <button
                          type="button"
                          onClick={() => setTarefaParaVisualizar(t)}
                          className="ml-auto text-[#d9b978] hover:underline font-bold flex items-center gap-1"
                        >
                          <Eye className="size-3" /> Ver Comprovante
                        </button>
                      )}
                    </div>
                  )}

                  {/* Cronômetro Ativo se estiver Em Andamento */}
                  {emExecucao && (
                    <div className="mt-3.5 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 space-y-2 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-amber-500" />
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                            Cronômetro em Execução
                          </span>
                        </div>
                        <span className="font-mono text-base font-black text-amber-900 dark:text-amber-200">
                          ⏱️ {formatarTempoDecorrido(t.iniciadoEm)}
                        </span>
                      </div>

                      {/* Botão de bater foto no meio da ronda */}
                      <button
                        type="button"
                        onClick={() => dispararFotoRapida(t.id)}
                        className="w-full py-1.5 px-2.5 rounded-xl bg-background/90 hover:bg-background border border-amber-500/30 text-foreground font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Camera className="size-3.5 text-[#d9b978]" />
                        + Bater Foto do Manejo / Bebedouro
                      </button>
                    </div>
                  )}
                </div>

                {/* Rodapé: Botões de Ação do Tratador */}
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setTarefaEdicao(t)
                        setModalNovoAberto(true)
                      }}
                      className="size-8 rounded-xl"
                      title="Editar"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setExcluirId(t.id)}
                      className="size-8 rounded-xl text-rose-500 hover:text-rose-600"
                      title="Excluir"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>

                  {/* Botão de Status */}
                  {t.status === "pendente" ? (
                    <Button
                      onClick={() => handleIniciar(t.id)}
                      className="h-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-sm active:scale-95"
                    >
                      <Play className="size-3 mr-1 fill-stone-950" /> Iniciar
                    </Button>
                  ) : emExecucao ? (
                    <Button
                      onClick={() => setTarefaParaConcluir(t)}
                      className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-95"
                    >
                      <Check className="size-3.5 mr-1" /> Concluir Manejo
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTarefaParaVisualizar(t)}
                      className="h-8 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold text-xs border-emerald-500/30"
                    >
                      <Eye className="size-3.5 mr-1" /> Ver Comprovante
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modais */}
      <ModalNovaTarefa
        aberto={modalNovoAberto}
        onFechar={() => setModalNovoAberto(false)}
        onSalvo={carregar}
        tarefaEdicao={tarefaEdicao}
      />

      <ModalConcluirTarefa
        aberto={Boolean(tarefaParaConcluir)}
        tarefa={tarefaParaConcluir}
        onFechar={() => setTarefaParaConcluir(null)}
        onConcluido={carregar}
      />

      <ModalVisualizarComprovante
        aberto={Boolean(tarefaParaVisualizar)}
        tarefa={tarefaParaVisualizar}
        onFechar={() => setTarefaParaVisualizar(null)}
      />

      <HarasVisionModal
        aberto={modalVisionAberto}
        onFechar={() => setModalVisionAberto(false)}
      />

      <input
        ref={fileInputRapidoRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFotoRapidaSelecionada}
      />

      {excluirId && (
        <ConfirmDialog
          open={Boolean(excluirId)}
          onOpenChange={(v) => !v && setExcluirId(null)}
          titulo="Excluir Tarefa"
          descricao="Tem certeza de que deseja remover esta tarefa do checklist?"
          onConfirm={async () => {
            if (excluirId) {
              await removerTarefa(excluirId)
              setExcluirId(null)
              toast.success("Tarefa removida com sucesso!")
              await carregar()
            }
          }}
        />
      )}
    </div>
  )
}
