import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Coins,
  FileCheck,
  FileSpreadsheet,
  Filter,
  Pencil,
  PieChart,
  Plus,
  Printer,
  Sparkles,
  Trash2,
  Users,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { HorseAvatar } from "@/components/horse/HorseAvatar"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { FinanceiroPrintSheet } from "@/components/financeiro/FinanceiroPrintSheet"
import { ModalReciboOficial } from "@/components/financeiro/ModalReciboOficial"
import { ModalEspelhoNotaFiscal } from "@/components/financeiro/ModalEspelhoNotaFiscal"
import {
  calcularMetricasFinanceirasEquinos,
  excluirTransacao,
  formatarData,
  getTransacoes,
  hojeIso,
  salvarTransacao,
} from "@/lib/db"
import { useEquinosComFotos } from "@/lib/hooks"
import { temaPelagem } from "@/lib/pelagens"
import {
  categoriasPara,
  type TipoTransacao,
  type Transacao,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

function formatarMoeda(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

interface FormTransacao {
  tipo: TipoTransacao
  categoria: string
  descricao: string
  valor: string
  data: string
  equinoId: string
  observacoes: string
}

const FORM_VAZIO: FormTransacao = {
  tipo: "despesa",
  categoria: "Ração",
  descricao: "",
  valor: "",
  data: hojeIso(),
  equinoId: "",
  observacoes: "",
}

export function Financeiro() {
  const { equinos, fotos } = useEquinosComFotos()
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mes, setMes] = useState(() => hojeIso().slice(0, 7))
  const [filtroTipo, setFiltroTipo] = useState<"todas" | TipoTransacao>("todas")
  const [filtroEquinoId, setFiltroEquinoId] = useState<string>("todos")
  const [abaPrincipal, setAbaPrincipal] = useState<"extrato" | "por-animal" | "categorias">("extrato")

  const [dialogAberto, setDialogAberto] = useState(false)
  const [editando, setEditando] = useState<Transacao | null>(null)
  const [form, setForm] = useState<FormTransacao>(FORM_VAZIO)
  const [excluir, setExcluir] = useState<Transacao | null>(null)

  const [modalReciboAberto, setModalReciboAberto] = useState(false)
  const [modalEspelhoAberto, setModalEspelhoAberto] = useState(false)
  const [dadosRecibo, setDadosRecibo] = useState<{
    pagador?: string
    documento?: string
    valor?: number
    referente?: string
    data?: string
  } | undefined>(undefined)

  const carregar = useCallback(async () => {
    setTransacoes(await getTransacoes())
    setCarregando(false)
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const mesesDisponiveis = useMemo(() => {
    const set = new Set(transacoes.map((t) => t.data.slice(0, 7)))
    set.add(hojeIso().slice(0, 7))
    return [...set].sort((a, b) => b.localeCompare(a))
  }, [transacoes])

  // Transações filtradas para o extrato
  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter((t) => {
      const bateMes = mes === "todos" || t.data.slice(0, 7) === mes
      const bateTipo = filtroTipo === "todas" || t.tipo === filtroTipo
      const bateEquino = filtroEquinoId === "todos" || t.equinoId === filtroEquinoId
      return bateMes && bateTipo && bateEquino
    })
  }, [transacoes, mes, filtroTipo, filtroEquinoId])

  // Resumo do mês selecionado
  const resumo = useMemo(() => {
    const doPeriodo = mes === "todos" ? transacoes : transacoes.filter((t) => t.data.slice(0, 7) === mes)
    const receitas = doPeriodo.filter((t) => t.tipo === "receita").reduce((s, t) => s + t.valor, 0)
    const despesas = doPeriodo.filter((t) => t.tipo === "despesa").reduce((s, t) => s + t.valor, 0)
    return { receitas, despesas, saldo: receitas - despesas }
  }, [transacoes, mes])

  const totalGeral = useMemo(
    () => transacoes.reduce((s, t) => s + (t.tipo === "receita" ? t.valor : -t.valor), 0),
    [transacoes],
  )

  // Métricas financeiras por equino (Custo por cabeça / Rentabilidade)
  const metricasPorEquino = useMemo(() => {
    const mapa = calcularMetricasFinanceirasEquinos(transacoes, equinos)
    const lista = equinos.map((eq) => {
      const m = mapa.get(eq.id) ?? {
        equinoId: eq.id,
        totalDespesas: 0,
        totalReceitas: 0,
        saldo: 0,
        despesasPorCategoria: {},
      }
      return { equino: eq, metricas: m }
    })
    return lista.sort((a, b) => b.metricas.totalDespesas - a.metricas.totalDespesas)
  }, [transacoes, equinos])

  // Despesas agrupadas por categoria
  const categoriasDespesa = useMemo(() => {
    const doPeriodo = mes === "todos" ? transacoes : transacoes.filter((t) => t.data.slice(0, 7) === mes)
    const despesas = doPeriodo.filter((t) => t.tipo === "despesa")
    const total = despesas.reduce((s, t) => s + t.valor, 0)
    const mapa = new Map<string, number>()
    for (const d of despesas) {
      mapa.set(d.categoria, (mapa.get(d.categoria) ?? 0) + d.valor)
    }
    return [...mapa.entries()]
      .map(([cat, val]) => ({
        categoria: cat,
        valor: val,
        percentual: total > 0 ? (val / total) * 100 : 0,
      }))
      .sort((a, b) => b.valor - a.valor)
  }, [transacoes, mes])

  const nomeMes = useMemo(() => {
    if (mes === "todos") return "Todos os períodos"
    const [ano, m] = mes.split("-")
    const d = new Date(Number(ano), Number(m) - 1, 1)
    const nome = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    return nome.charAt(0).toUpperCase() + nome.slice(1)
  }, [mes])

  function abrirNovo() {
    setEditando(null)
    setForm({ ...FORM_VAZIO, categoria: categoriasPara("despesa")[0] })
    setDialogAberto(true)
  }

  function abrirEdicao(t: Transacao) {
    setEditando(t)
    setForm({
      tipo: t.tipo,
      categoria: t.categoria,
      descricao: t.descricao,
      valor: String(t.valor).replace(".", ","),
      data: t.data,
      equinoId: t.equinoId ?? "",
      observacoes: t.observacoes ?? "",
    })
    setDialogAberto(true)
  }

  async function salvar() {
    const valor = parseFloat(form.valor.replace(",", "."))
    if (!form.descricao.trim() || isNaN(valor) || valor <= 0 || !form.data) {
      toast.error("Preencha a descrição, um valor válido e a data")
      return
    }
    await salvarTransacao({
      id: editando?.id ?? crypto.randomUUID(),
      tipo: form.tipo,
      categoria: form.categoria,
      descricao: form.descricao.trim(),
      valor,
      data: form.data,
      equinoId: form.equinoId || undefined,
      observacoes: form.observacoes.trim() || undefined,
      createdAt: editando?.createdAt ?? new Date().toISOString(),
    })
    toast.success(editando ? "Transação atualizada" : "Transação registrada")
    setDialogAberto(false)
    carregar()
  }

  async function confirmarExclusao() {
    if (!excluir) return
    await excluirTransacao(excluir.id)
    toast.success("Transação excluída")
    setExcluir(null)
    carregar()
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Gestão Financeira</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {carregando ? "Carregando…" : `Balanço Geral Acumulado: `}
            <strong className={cn("font-semibold", totalGeral >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
              {formatarMoeda(totalGeral)}
            </strong>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl gap-1.5 print:hidden border-stone-300 dark:border-stone-700 bg-card text-xs font-semibold"
            onClick={() => {
              setDadosRecibo(undefined)
              setModalReciboAberto(true)
            }}
          >
            <FileCheck className="size-4 text-[#d9b978]" />
            Emitir Recibo A4
          </Button>

          <Button
            variant="outline"
            className="rounded-xl gap-1.5 print:hidden border-stone-300 dark:border-stone-700 bg-card text-xs font-semibold"
            onClick={() => setModalEspelhoAberto(true)}
          >
            <FileSpreadsheet className="size-4 text-emerald-500" />
            Espelho de NF
          </Button>

          <Button
            variant="outline"
            className="rounded-xl gap-1.5 print:hidden border-stone-300 dark:border-stone-700 bg-card text-xs font-semibold"
            onClick={() => window.print()}
          >
            <Printer className="size-4" />
            Imprimir Relatório
          </Button>

          <Button
            size="lg"
            className="rounded-xl bg-[#143129] text-[#d9b978] hover:bg-[#143129]/90 text-xs font-bold"
            onClick={abrirNovo}
          >
            <Plus className="size-4" />
            Nova transação
          </Button>
        </div>
      </div>

      {/* Resumo Financeiro (KPIs) */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-stone-200/80 dark:border-stone-800/80 shadow-sm">
          <CardContent className="flex items-center gap-3.5 p-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <ArrowUpCircle className="size-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Receitas ({nomeMes})</p>
              <p className="truncate font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatarMoeda(resumo.receitas)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-stone-200/80 dark:border-stone-800/80 shadow-sm">
          <CardContent className="flex items-center gap-3.5 p-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              <ArrowDownCircle className="size-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Despesas ({nomeMes})</p>
              <p className="truncate font-display text-2xl font-bold text-rose-600 dark:text-rose-400">
                {formatarMoeda(resumo.despesas)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={cn("rounded-2xl shadow-sm", resumo.saldo >= 0 ? "border-emerald-300 bg-emerald-50/20 dark:border-emerald-900/60" : "border-rose-300 bg-rose-50/20 dark:border-rose-900/60")}>
          <CardContent className="flex items-center gap-3.5 p-5">
            <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-2xl text-white", resumo.saldo >= 0 ? "bg-[#143129] text-[#d9b978]" : "bg-rose-600")}>
              <Wallet className="size-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resultado Líquido</p>
              <p className={cn("truncate font-display text-2xl font-black", resumo.saldo >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300")}>
                {formatarMoeda(resumo.saldo)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Principais */}
      <Tabs value={abaPrincipal} onValueChange={(v) => setAbaPrincipal(v as "extrato" | "por-animal" | "categorias")}>
        <TabsList className="grid grid-cols-3 w-full h-11 p-1 rounded-2xl bg-stone-200/60 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800">
          <TabsTrigger value="extrato" className="h-full rounded-xl px-1 text-xs font-semibold flex items-center justify-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:shadow-xs">
            <Coins className="size-3.5 shrink-0" />
            <span className="truncate sm:hidden">Extrato ({transacoesFiltradas.length})</span>
            <span className="truncate hidden sm:inline">Extrato ({transacoesFiltradas.length})</span>
          </TabsTrigger>
          <TabsTrigger value="por-animal" className="h-full rounded-xl px-1 text-xs font-semibold flex items-center justify-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:shadow-xs">
            <Users className="size-3.5 shrink-0" />
            <span className="truncate sm:hidden">Por Animal ({equinos.length})</span>
            <span className="truncate hidden sm:inline">Custo por Animal ({equinos.length})</span>
          </TabsTrigger>
          <TabsTrigger value="categorias" className="h-full rounded-xl px-1 text-xs font-semibold flex items-center justify-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:shadow-xs">
            <PieChart className="size-3.5 shrink-0" />
            <span className="truncate sm:hidden">Categorias</span>
            <span className="truncate hidden sm:inline">Despesas por Categoria</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. Aba Extrato */}
        <TabsContent value="extrato" className="mt-5 space-y-4">
          {/* Filtros rápidos */}
          <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-800/80">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold">
              <Filter className="size-3.5" />
              <span>Filtrar por:</span>
            </div>

            <Input
              type="month"
              value={mes === "todos" ? "" : mes}
              onChange={(e) => setMes(e.target.value || "todos")}
              className="w-full sm:w-36 h-9 rounded-lg text-xs"
            />

            <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as "todas" | TipoTransacao)}>
              <SelectTrigger className="w-full sm:w-36 h-9 rounded-lg text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as transações</SelectItem>
                <SelectItem value="receita">Apenas Receitas (+)</SelectItem>
                <SelectItem value="despesa">Apenas Despesas (−)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroEquinoId} onValueChange={setFiltroEquinoId}>
              <SelectTrigger className="w-full sm:w-44 h-9 rounded-lg text-xs">
                <SelectValue placeholder="Filtrar por cavalo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os animais (Geral)</SelectItem>
                {equinos.map((eq) => (
                  <SelectItem key={eq.id} value={eq.id}>
                    {eq.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1.5 flex-wrap">
              {mesesDisponiveis.slice(0, 4).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMes(m)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
                    mes === m
                      ? "border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900"
                      : "border-stone-200 text-stone-600 hover:border-stone-400 dark:border-stone-700 dark:text-stone-400",
                  )}
                >
                  {new Date(`${m}-01T00:00:00`).toLocaleDateString("pt-BR", { month: "short" })}
                </button>
              ))}
              {mes !== "todos" && (
                <Button variant="ghost" size="sm" onClick={() => setMes("todos")} className="text-xs text-stone-500 h-7 px-2">
                  Ver todos
                </Button>
              )}
            </div>
          </div>

          {carregando ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : transacoesFiltradas.length === 0 ? (
            <Card className="rounded-2xl">
              <CardContent className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Wallet className="size-7" />
                </div>
                <h2 className="font-display text-xl font-semibold">Nenhuma transação encontrada</h2>
                <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                  Altere os filtros acima ou cadastre uma nova despesa/receita.
                </p>
                <Button onClick={abrirNovo} className="rounded-xl">
                  <Plus className="size-4" />
                  Nova transação
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                Exibindo {transacoesFiltradas.length} lançamentos ({nomeMes})
              </p>
              {transacoesFiltradas.map((t) => {
                const equino = equinos.find((e) => e.id === t.equinoId)
                return (
                  <div
                    key={t.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-stone-900 p-3.5 transition-all hover:border-[#143129]/40 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-xl",
                          t.tipo === "receita"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
                        )}
                      >
                        {t.tipo === "receita" ? <ArrowUpCircle className="size-5" /> : <ArrowDownCircle className="size-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-stone-900 dark:text-stone-100">
                          {t.descricao}
                        </p>
                        <p className="truncate text-xs text-stone-500">
                          <span className="font-semibold text-stone-700 dark:text-stone-300">{t.categoria}</span> · {formatarData(t.data)}
                          {equino && (
                            <>
                              {" · Animal: "}
                              <Link to={`/equinos/${equino.id}`} className="font-semibold text-[#8c6d3f] hover:underline dark:text-[#d9b978]">
                                {equino.nome}
                              </Link>
                            </>
                          )}
                          {t.observacoes && ` · "${t.observacoes}"`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <p
                        className={cn(
                          "font-mono text-base font-black",
                          t.tipo === "receita" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
                        )}
                      >
                        {t.tipo === "receita" ? "+" : "−"} {formatarMoeda(t.valor)}
                      </p>
                      <div className="flex shrink-0 gap-0.5">
                        <Button variant="ghost" size="icon-sm" aria-label="Editar" onClick={() => abrirEdicao(t)}>
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Excluir"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setExcluir(t)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* 2. Aba Custo por Animal */}
        <TabsContent value="por-animal" className="mt-5 space-y-4">
          <Card className="rounded-2xl border border-stone-200/80 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-sm">
                <Sparkles className="size-4 text-[#8c6d3f]" />
                <span>Análise de Lucratividade & Custo Médio por Cabeça</span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Veja quanto cada cavalo consumiu em ração, ferrageamento, veterinário e exames versus quanto faturou em vendas, prêmios ou pensões.
              </p>
            </CardContent>
          </Card>

          {metricasPorEquino.length === 0 ? (
            <p className="text-center text-sm text-stone-500 py-8">Nenhum equino cadastrado.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {metricasPorEquino.map(({ equino, metricas }) => {
                const isLucro = metricas.saldo >= 0
                return (
                  <Card key={equino.id} className="rounded-2xl overflow-hidden shadow-sm border border-stone-200/80 dark:border-stone-800/80">
                    <div className="flex items-center gap-3 p-4 bg-stone-100/60 dark:bg-stone-800/50 border-b border-stone-200/60 dark:border-stone-800/60">
                      <Link to={`/equinos/${equino.id}`}>
                        <HorseAvatar
                          nome={equino.nome}
                          fotoUrl={fotos[equino.id]}
                          tema={temaPelagem(equino.pelagem)}
                          className="size-11 rounded-xl shrink-0"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link to={`/equinos/${equino.id}`} className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate hover:text-[#8c6d3f] block">
                          {equino.nome}
                        </Link>
                        <p className="text-xs text-stone-500 truncate">
                          {equino.raca} · {equino.pelagem}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-bold",
                          isLucro ? "border-emerald-300 text-emerald-700 bg-emerald-50" : "border-rose-300 text-rose-700 bg-rose-50",
                        )}
                      >
                        {isLucro ? "Superávit" : "Investimento"}
                      </Badge>
                    </div>

                    <CardContent className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-rose-50/50 dark:bg-rose-950/20 p-2 rounded-xl border border-rose-200/40">
                          <span className="text-[10px] text-rose-600 uppercase font-bold block">Despesas Totais</span>
                          <span className="font-mono font-bold text-rose-700 dark:text-rose-300 text-sm">
                            {formatarMoeda(metricas.totalDespesas)}
                          </span>
                        </div>
                        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-xl border border-emerald-200/40">
                          <span className="text-[10px] text-emerald-600 uppercase font-bold block">Receitas Geradas</span>
                          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                            {formatarMoeda(metricas.totalReceitas)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800 text-xs">
                        <span className="text-stone-500 font-medium">Balanço do Animal:</span>
                        <span className={cn("font-mono font-black text-sm", isLucro ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                          {formatarMoeda(metricas.saldo)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* 3. Aba Categorias */}
        <TabsContent value="categorias" className="mt-5 space-y-4">
          <Card className="rounded-2xl border-stone-200/80 dark:border-stone-800/80">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <PieChart className="size-5 text-[#8c6d3f]" />
                Distribuição de Custos por Categoria ({nomeMes})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoriasDespesa.length === 0 ? (
                <p className="text-center text-sm text-stone-500 py-8">Nenhuma despesa registrada no período.</p>
              ) : (
                <div className="space-y-4">
                  {categoriasDespesa.map((c) => (
                    <div key={c.categoria} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-800 dark:text-stone-200">{c.categoria}</span>
                        <span className="font-mono text-stone-600 dark:text-stone-400">
                          {formatarMoeda(c.valor)} <span className="font-bold text-stone-800 dark:text-stone-200">({c.percentual.toFixed(1)}%)</span>
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#143129] dark:bg-[#d9b978]"
                          style={{ width: `${c.percentual}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de Transação */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="rounded-2xl sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editando ? "Editar transação" : "Nova transação"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="trans-tipo">Tipo</Label>
              <Select
                value={form.tipo}
                onValueChange={(v: TipoTransacao) => {
                  setForm({ ...form, tipo: v, categoria: categoriasPara(v)[0] })
                }}
              >
                <SelectTrigger id="trans-tipo" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="despesa">Despesa (Saída)</SelectItem>
                  <SelectItem value="receita">Receita (Entrada)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="trans-cat">Categoria</Label>
                <Select
                  value={form.categoria}
                  onValueChange={(v) => setForm({ ...form, categoria: v })}
                >
                  <SelectTrigger id="trans-cat" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasPara(form.tipo).map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="trans-valor">Valor (R$)</Label>
                <Input
                  id="trans-valor"
                  type="number"
                  step="0.01"
                  placeholder="Ex.: 350,00"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="trans-desc">Descrição</Label>
              <Input
                id="trans-desc"
                placeholder="Ex.: 10 sacos de ração 40kg"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="trans-data">Data</Label>
                <Input
                  id="trans-data"
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="trans-eq">Equino (Opcional)</Label>
                <Select
                  value={form.equinoId}
                  onValueChange={(v) => setForm({ ...form, equinoId: v === "nenhum" ? "" : v })}
                >
                  <SelectTrigger id="trans-eq" className="mt-1.5">
                    <SelectValue placeholder="Geral do Haras" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Geral (Sem vínculo)</SelectItem>
                    {equinos.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="trans-obs">Observações</Label>
              <Textarea
                id="trans-obs"
                rows={2}
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogAberto(false)}>
              Cancelar
            </Button>
            <Button className="bg-[#143129] text-[#d9b978] hover:bg-[#143129]/90" onClick={salvar}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={excluir !== null}
        onOpenChange={(o) => !o && setExcluir(null)}
        titulo="Excluir transação?"
        descricao="Esta transação será removida definitivamente do livro caixa."
        confirmText="Excluir"
        onConfirm={confirmarExclusao}
      />

      {/* Relatório Financeiro Oficial para Impressão / PDF */}
      <FinanceiroPrintSheet
        transacoes={transacoesFiltradas}
        equinos={equinos}
        mesFiltro={mes}
        resumo={resumo}
        metricasPorEquino={metricasPorEquino}
        categoriasDespesa={categoriasDespesa}
      />

      {/* Modal de Recibo Oficial A4 */}
      <ModalReciboOficial
        open={modalReciboAberto}
        onOpenChange={setModalReciboAberto}
        dadosIniciais={dadosRecibo}
      />

      {/* Modal de Espelho de Nota Fiscal */}
      <ModalEspelhoNotaFiscal
        open={modalEspelhoAberto}
        onOpenChange={setModalEspelhoAberto}
      />
    </div>
  )
}
