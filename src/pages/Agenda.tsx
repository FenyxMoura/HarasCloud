import { useCallback, useEffect, useMemo, useState } from "react"
import {
  BellRing,
  Calendar as CalendarIcon,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { excluirEvento, formatarData, getEventos, hojeIso, salvarEvento } from "@/lib/db"
import { useEquinosComFotos } from "@/lib/hooks"
import { useAuth } from "@/lib/auth-context"
import { permissaoNotificacoes, pedirPermissaoNotificacoes } from "@/lib/lembretes"
import { tocarSomNotificacao } from "@/lib/sound-alerts"
import { TIPO_EVENTO_ICONE, TIPO_EVENTO_LABEL, type Evento, type TipoEvento } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const TIPO_COR: Record<TipoEvento, string> = {
  veterinario: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-500/30",
  ferradura: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-500/30",
  competicao: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border-violet-500/30",
  leilao: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border-sky-500/30",
  visita: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-500/30",
  outro: "bg-stone-100 text-stone-600 dark:bg-stone-800/60 dark:text-stone-300 border-stone-500/30",
}

interface FormEvento {
  titulo: string
  tipo: TipoEvento
  data: string
  hora: string
  equinoId: string
  observacoes: string
}

const FORM_VAZIO: FormEvento = {
  titulo: "",
  tipo: "outro",
  data: hojeIso(),
  hora: "",
  equinoId: "",
  observacoes: "",
}

export function Agenda() {
  const { haras } = useAuth()
  const { equinos } = useEquinosComFotos()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [visao, setVisao] = useState<"lista" | "calendario">("calendario")
  const [filtroTipo, setFiltroTipo] = useState<"todos" | TipoEvento>("todos")
  
  // Navegação do Mês no Calendário
  const [mesAtual, setMesAtual] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const [dialogAberto, setDialogAberto] = useState(false)
  const [editando, setEditando] = useState<Evento | null>(null)
  const [form, setForm] = useState<FormEvento>(FORM_VAZIO)
  const [excluir, setExcluir] = useState<Evento | null>(null)
  const [permissao, setPermissao] = useState<boolean>(() => permissaoNotificacoes() === "granted")

  const carregar = useCallback(async () => {
    setEventos(await getEventos())
    setCarregando(false)
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const equinoMap = useMemo(
    () => new Map(equinos.map((e) => [e.id, e])),
    [equinos],
  )

  const eventosFiltrados = useMemo(() => {
    if (filtroTipo === "todos") return eventos
    return eventos.filter((ev) => ev.tipo === filtroTipo)
  }, [eventos, filtroTipo])

  // Agrupamento para visão em lista
  const eventosPorData = useMemo(() => {
    const hoje = hojeIso()
    const passados: Evento[] = []
    const hojeEv: Evento[] = []
    const futuros: Evento[] = []

    for (const ev of eventosFiltrados) {
      if (ev.data < hoje) passados.push(ev)
      else if (ev.data === hoje) hojeEv.push(ev)
      else futuros.push(ev)
    }

    futuros.sort((a, b) => a.data.localeCompare(b.data))
    passados.sort((a, b) => b.data.localeCompare(a.data))

    return { hojeEv, futuros, passados }
  }, [eventosFiltrados])

  // Geração de Dias para o Mês do Calendário
  const diasDoMes = useMemo(() => {
    const ano = mesAtual.getFullYear()
    const mes = mesAtual.getMonth()
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay()
    const totalDias = new Date(ano, mes + 1, 0).getDate()

    const dias: { dia: number; dataIso: string; outroMes: boolean }[] = []

    // Dias do mês anterior para completar o grid
    const totalDiasMesAnterior = new Date(ano, mes, 0).getDate()
    for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
      const d = totalDiasMesAnterior - i
      const mesAntIso = mes === 0 ? 12 : mes
      const anoAntIso = mes === 0 ? ano - 1 : ano
      dias.push({
        dia: d,
        dataIso: `${anoAntIso}-${String(mesAntIso).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        outroMes: true,
      })
    }

    // Dias do mês atual
    for (let d = 1; d <= totalDias; d++) {
      dias.push({
        dia: d,
        dataIso: `${ano}-${String(mes + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        outroMes: false,
      })
    }

    // Dias do próximo mês para fechar linhas de 7
    const resto = 42 - dias.length
    for (let d = 1; d <= resto; d++) {
      const mesProxIso = mes === 11 ? 1 : mes + 2
      const anoProxIso = mes === 11 ? ano + 1 : ano
      dias.push({
        dia: d,
        dataIso: `${anoProxIso}-${String(mesProxIso).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        outroMes: true,
      })
    }

    return dias
  }, [mesAtual])

  function navegarMes(direcao: -1 | 1) {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + direcao, 1))
  }

  function abrirNovo(dataInicial?: string) {
    setEditando(null)
    setForm({ ...FORM_VAZIO, data: dataInicial || hojeIso() })
    setDialogAberto(true)
  }

  function abrirEditar(evento: Evento) {
    setEditando(evento)
    setForm({
      titulo: evento.titulo,
      tipo: evento.tipo,
      data: evento.data,
      hora: evento.hora ?? "",
      equinoId: evento.equinoId ?? "",
      observacoes: evento.observacoes ?? "",
    })
    setDialogAberto(true)
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo.trim()) return

    const evento: Evento = {
      id: editando ? editando.id : crypto.randomUUID(),
      titulo: form.titulo.trim(),
      tipo: form.tipo,
      data: form.data,
      hora: form.hora || undefined,
      equinoId: form.equinoId || undefined,
      observacoes: form.observacoes.trim() || undefined,
      concluido: editando ? editando.concluido : false,
      createdAt: editando ? editando.createdAt : new Date().toISOString(),
    }

    await salvarEvento(evento)
    tocarSomNotificacao()
    toast.success(editando ? "Evento atualizado!" : "Evento agendado com sucesso!")
    setDialogAberto(false)
    carregar()
  }

  async function handleAlternarConcluido(evento: Evento) {
    const atualizado: Evento = { ...evento, concluido: !evento.concluido }
    await salvarEvento(atualizado)
    tocarSomNotificacao()
    carregar()
  }

  async function handleExcluir() {
    if (!excluir) return
    await excluirEvento(excluir.id)
    toast.success("Evento removido da agenda.")
    setExcluir(null)
    carregar()
  }

  // Exportador de Arquivo iCalendar (.ics)
  function exportarIcs() {
    if (eventos.length === 0) {
      toast.error("Nenhum evento na agenda para exportar.")
      return
    }

    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Haras Cloud//Agenda//PT-BR",
      `X-WR-CALNAME:Agenda - ${haras?.nomeHaras || "Haras Cloud"}`,
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ]

    for (const ev of eventos) {
      const dataClean = ev.data.replace(/-/g, "")
      const horaClean = ev.hora ? ev.hora.replace(":", "") + "00" : "080000"
      const dtStart = `${dataClean}T${horaClean}`
      const eq = ev.equinoId ? equinoMap.get(ev.equinoId) : null

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:${ev.id}@harascloud.com`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
        `DTSTART:${dtStart}`,
        `SUMMARY:${ev.titulo}${eq ? ` - ${eq.nome}` : ""}`,
        `DESCRIPTION:${ev.observacoes || `Tipo: ${TIPO_EVENTO_LABEL[ev.tipo]}`}`,
        `CATEGORIES:${TIPO_EVENTO_LABEL[ev.tipo]}`,
        "END:VEVENT"
      )
    }

    icsContent.push("END:VCALENDAR")

    const blob = new Blob([icsContent.join("\r\n")], { type: "text/calendar;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `agenda-${(haras?.nomeHaras || "haras").toLowerCase().replace(/\s+/g, "-")}.ics`
    a.click()
    URL.revokeObjectURL(url)

    toast.success("Agenda exportada em .ics! Importe no Google ou Apple Calendar.")
  }

  return (
    <div className="space-y-6">
      {/* Header com Ações & Exportação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CalendarDays className="size-7 text-[#d9b978]" />
            Agenda & Compromissos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Controle integrado de visitas veterinárias, casqueamentos, competições e leilões.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={exportarIcs}
            className="rounded-2xl border-stone-300 dark:border-stone-700 bg-card text-xs font-semibold hover:bg-muted"
            title="Exportar para Google Calendar ou Apple Calendar"
          >
            <Download className="mr-1.5 size-4 text-[#d9b978]" />
            Exportar (.ics)
          </Button>

          <Button
            onClick={() => abrirNovo()}
            className="rounded-2xl bg-[#143129] text-[#d9b978] font-bold text-xs sm:text-sm hover:bg-[#1c4338] shadow-md active:scale-95 transition-all"
          >
            <Plus className="mr-1.5 size-4" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Barra de Filtros e Modo de Visualização */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => setVisao("calendario")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                visao === "calendario"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="size-3.5" />
              <span>Calendário Mensal</span>
            </button>
            <button
              type="button"
              onClick={() => setVisao("lista")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                visao === "lista"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="size-3.5" />
              <span>Linha do Tempo</span>
            </button>
          </div>

          <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as "todos" | TipoEvento)}>
            <SelectTrigger className="w-44 h-9 rounded-xl text-xs">
              <SlidersHorizontal className="size-3.5 text-muted-foreground mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Eventos</SelectItem>
              <SelectItem value="veterinario">🩺 Veterinário / Vacina</SelectItem>
              <SelectItem value="ferradura">🔨 Ferrageamento</SelectItem>
              <SelectItem value="competicao">🏆 Competição / Prova</SelectItem>
              <SelectItem value="leilao">💰 Leilão / Venda</SelectItem>
              <SelectItem value="visita">👥 Visita de Cliente</SelectItem>
              <SelectItem value="outro">📌 Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notificações no Navegador */}
        {!permissao && (
          <button
            type="button"
            onClick={async () => {
              const res = await pedirPermissaoNotificacoes()
              setPermissao(res)
              if (res) toast.success("Notificações ativadas com sucesso!")
            }}
            className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline"
          >
            <BellRing className="size-3.5" /> Ativar alertas na tela
          </button>
        )}
      </div>

      {/* VISÃO 1: CALENDÁRIO MENSAL EM GRADE */}
      {visao === "calendario" && (
        <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 p-5 bg-card shadow-sm overflow-hidden">
          {/* Navegador do Mês */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-foreground capitalize">
              {mesAtual.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </h2>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMesAtual(new Date())}
                className="h-8 rounded-xl text-xs font-semibold"
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navegarMes(-1)}
                className="size-8 rounded-xl"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navegarMes(1)}
                className="size-8 rounded-xl"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          {/* Cabeçalho dos Dias da Semana */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-muted-foreground uppercase tracking-wider py-2 border-b border-border">
            <span>Dom</span>
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
          </div>

          {/* Grade de Dias */}
          <div className="grid grid-cols-7 gap-1 mt-1">
            {diasDoMes.map((item, idx) => {
              const eventosDoDia = eventosFiltrados.filter((ev) => ev.data === item.dataIso)
              const ehHoje = item.dataIso === hojeIso()

              return (
                <div
                  key={idx}
                  onClick={() => abrirNovo(item.dataIso)}
                  className={cn(
                    "min-h-[90px] sm:min-h-[110px] p-1.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group",
                    item.outroMes
                      ? "opacity-30 bg-muted/10 border-transparent hover:opacity-70"
                      : ehHoje
                      ? "bg-[#d9b978]/10 border-[#d9b978]/50 shadow-inner"
                      : "bg-muted/20 border-border/40 hover:border-[#d9b978]/40 hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "size-6 rounded-full flex items-center justify-center text-xs font-bold",
                        ehHoje ? "bg-[#143129] text-[#d9b978]" : "text-foreground"
                      )}
                    >
                      {item.dia}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        abrirNovo(item.dataIso)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>

                  {/* Lista de pílulas de eventos */}
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-[60px] no-scrollbar">
                    {eventosDoDia.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          abrirEditar(ev)
                        }}
                        className={cn(
                          "px-1.5 py-0.5 rounded-md text-[10px] font-bold truncate border flex items-center gap-1 cursor-pointer",
                          TIPO_COR[ev.tipo],
                          ev.concluido && "line-through opacity-50"
                        )}
                        title={`${ev.titulo} (${ev.hora || "Sem hora"})`}
                      >
                        <span className="shrink-0">{TIPO_EVENTO_ICONE[ev.tipo]}</span>
                        <span className="truncate">{ev.titulo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* VISÃO 2: LINHA DO TEMPO EM LISTA */}
      {visao === "lista" && (
        <div className="space-y-6">
          {carregando ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : eventosFiltrados.length === 0 ? (
            <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 p-12 text-center">
              <CalendarIcon className="size-12 mx-auto text-stone-400 opacity-60 mb-2" />
              <p className="font-bold text-foreground">Nenhum evento agendado</p>
              <p className="text-xs text-muted-foreground mt-1">
                Clique no botão "Novo Evento" para programar atividades do haras.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Eventos de Hoje */}
              {eventosPorData.hojeEv.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                    📍 Compromissos de Hoje
                  </h3>
                  <div className="space-y-2">
                    {eventosPorData.hojeEv.map((ev) => (
                      <CardEventoLinha
                        key={ev.id}
                        evento={ev}
                        equino={ev.equinoId ? equinoMap.get(ev.equinoId) : undefined}
                        onEditar={() => abrirEditar(ev)}
                        onExcluir={() => setExcluir(ev)}
                        onAlternarConcluido={() => handleAlternarConcluido(ev)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Próximos Eventos */}
              {eventosPorData.futuros.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    📅 Próximos Dias
                  </h3>
                  <div className="space-y-2">
                    {eventosPorData.futuros.map((ev) => (
                      <CardEventoLinha
                        key={ev.id}
                        evento={ev}
                        equino={ev.equinoId ? equinoMap.get(ev.equinoId) : undefined}
                        onEditar={() => abrirEditar(ev)}
                        onExcluir={() => setExcluir(ev)}
                        onAlternarConcluido={() => handleAlternarConcluido(ev)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Eventos Passados */}
              {eventosPorData.passados.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-2">
                    📁 Histórico Concluído
                  </h3>
                  <div className="space-y-2 opacity-75">
                    {eventosPorData.passados.map((ev) => (
                      <CardEventoLinha
                        key={ev.id}
                        evento={ev}
                        equino={ev.equinoId ? equinoMap.get(ev.equinoId) : undefined}
                        onEditar={() => abrirEditar(ev)}
                        onExcluir={() => setExcluir(ev)}
                        onAlternarConcluido={() => handleAlternarConcluido(ev)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal Criar/Editar Evento */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="sm:max-w-md bg-background border-stone-200 dark:border-stone-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <CalendarDays className="size-5 text-[#d9b978]" />
              {editando ? "Editar Compromisso" : "Agendar Novo Compromisso"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSalvar} className="space-y-4 mt-3">
            <div>
              <Label className="text-xs font-semibold">Título do Evento *</Label>
              <Input
                placeholder="Ex: Vacinação contra Raiva / Visita Dr. Marcelo"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                className="h-10 rounded-xl mt-1 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Tipo *</Label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoEvento })}
                  className="w-full h-10 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs mt-1 font-medium"
                >
                  <option value="veterinario">🩺 Veterinário</option>
                  <option value="ferradura">🔨 Ferrageamento</option>
                  <option value="competicao">🏆 Competição</option>
                  <option value="leilao">💰 Leilão</option>
                  <option value="visita">👥 Visita</option>
                  <option value="outro">📌 Outro</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Vincular a Equino</Label>
                <select
                  value={form.equinoId}
                  onChange={(e) => setForm({ ...form, equinoId: e.target.value })}
                  className="w-full h-10 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs mt-1 font-medium"
                >
                  <option value="">Nenhum (Geral do Haras)</option>
                  {equinos.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Data *</Label>
                <Input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  className="h-10 rounded-xl mt-1 text-xs"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Horário</Label>
                <Input
                  type="time"
                  value={form.hora}
                  onChange={(e) => setForm({ ...form, hora: e.target.value })}
                  className="h-10 rounded-xl mt-1 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Observações</Label>
              <Textarea
                placeholder="Instruções adicionais para a equipe..."
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                rows={2}
                className="rounded-xl resize-none text-xs mt-1"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogAberto(false)}
                className="rounded-xl text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs hover:bg-[#1c4338]"
              >
                {editando ? "Salvar Alterações" : "Salvar Evento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmar Exclusão */}
      <ConfirmDialog
        open={Boolean(excluir)}
        onOpenChange={(open) => !open && setExcluir(null)}
        titulo="Remover Compromisso"
        descricao={`Tem certeza que deseja excluir o evento "${excluir?.titulo}"?`}
        confirmText="Excluir"
        onConfirm={handleExcluir}
        destructive={true}
      />
    </div>
  )
}

function CardEventoLinha({
  evento,
  equino,
  onEditar,
  onExcluir,
  onAlternarConcluido,
}: {
  evento: Evento
  equino?: import("@/lib/types").Equino
  onEditar: () => void
  onExcluir: () => void
  onAlternarConcluido: () => void
}) {
  return (
    <Card className="rounded-2xl border-stone-200/80 dark:border-stone-800 p-4 bg-card hover:bg-muted/20 transition-all flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onAlternarConcluido}
          className={cn(
            "size-6 rounded-full border flex items-center justify-center transition-all shrink-0",
            evento.concluido
              ? "bg-emerald-600 border-emerald-600 text-white"
              : "border-stone-300 dark:border-stone-700 hover:border-[#d9b978]"
          )}
        >
          {evento.concluido && <span className="text-[10px] font-bold">✓</span>}
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-bold border",
                TIPO_COR[evento.tipo]
              )}
            >
              {TIPO_EVENTO_ICONE[evento.tipo]} {TIPO_EVENTO_LABEL[evento.tipo]}
            </span>
            <p
              className={cn(
                "font-bold text-sm text-foreground truncate",
                evento.concluido && "line-through text-muted-foreground"
              )}
            >
              {evento.titulo}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span>📅 {formatarData(evento.data)}</span>
            {evento.hora && <span>⏰ {evento.hora}</span>}
            {equino && (
              <span className="font-semibold text-[#d9b978]">
                🐴 {equino.nome}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" onClick={onEditar} className="size-8 rounded-lg">
          <Pencil className="size-3.5 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onExcluir} className="size-8 rounded-lg text-rose-500">
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </Card>
  )
}
