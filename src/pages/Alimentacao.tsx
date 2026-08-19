import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  AlertTriangle,
  Calculator,
  Camera,
  ClipboardList,
  Copy,
  Package,
  Pencil,
  Plus,
  Printer,
  Trash2,
  UtensilsCrossed,
  Wheat,
} from "lucide-react"
import { HarasVisionModal } from "@/components/ia/HarasVisionModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import {
  calcularAutonomiaEstoque,
  excluirDieta,
  excluirItemEstoque,
  formatarData,
  getDietas,
  getEstoque,
  salvarDieta,
  salvarItemEstoque,
} from "@/lib/db"
import { useEquinosComFotos } from "@/lib/hooks"
import { temaPelagem } from "@/lib/pelagens"
import {
  PERIODOS,
  TIPO_ITEM_LABEL,
  UNIDADE_LABEL,
  type DietaEquino,
  type ItemEstoque,
  type TipoItemEstoque,
  type UnidadeEstoque,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const TIPO_COR: Record<TipoItemEstoque, string> = {
  racao: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  feno: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  suplemento: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  outro: "bg-stone-100 text-stone-600 dark:bg-stone-800/60 dark:text-stone-300",
}

interface FormItem {
  nome: string
  tipo: TipoItemEstoque
  quantidade: string
  unidade: UnidadeEstoque
  estoqueMinimo: string
  custoUnitario: string
  observacoes: string
}

const ITEM_VAZIO: FormItem = {
  nome: "",
  tipo: "racao",
  quantidade: "",
  unidade: "kg",
  estoqueMinimo: "",
  custoUnitario: "",
  observacoes: "",
}

interface FormDieta {
  equinoId: string
  itemNome: string
  quantidade: string
  unidade: UnidadeEstoque
  periodo: string
}

const DIETA_VAZIA: FormDieta = {
  equinoId: "",
  itemNome: "",
  quantidade: "",
  unidade: "kg",
  periodo: "Manhã",
}

export function Alimentacao() {
  const { equinos, fotos, loading } = useEquinosComFotos()
  const [estoque, setEstoque] = useState<ItemEstoque[]>([])
  const [dietas, setDietas] = useState<DietaEquino[]>([])
  const [carregando, setCarregando] = useState(true)
  const [aba, setAba] = useState<"dietas" | "estoque" | "previsao" | "manejo">("dietas")
  
  // Consumo médio padrão quando não há dietas individuais especificadas (kg/dia por cavalo)
  const [consumoPadraoKg, setConsumoPadraoKg] = useState(3.5)

  const [dialogItem, setDialogItem] = useState(false)
  const [editandoItem, setEditandoItem] = useState<ItemEstoque | null>(null)
  const [formItem, setFormItem] = useState<FormItem>(ITEM_VAZIO)
  const [excluirItem, setExcluirItem] = useState<ItemEstoque | null>(null)
  const [modalVisionAberto, setModalVisionAberto] = useState(false)

  const [dialogDieta, setDialogDieta] = useState(false)
  const [editandoDieta, setEditandoDieta] = useState<DietaEquino | null>(null)
  const [formDieta, setFormDieta] = useState<FormDieta>(DIETA_VAZIA)
  const [excluirDietaState, setExcluirDietaState] = useState<DietaEquino | null>(null)

  const carregar = useCallback(async () => {
    setEstoque(await getEstoque())
    setDietas(await getDietas())
    setCarregando(false)
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const equinosAtivos = useMemo(() => equinos.filter((e) => e.status === "ativo"), [equinos])

  // Previsão Inteligente de Estoque
  const previsoesEstoque = useMemo(() => {
    return calcularAutonomiaEstoque(estoque, dietas, equinosAtivos.length, consumoPadraoKg)
  }, [estoque, dietas, equinosAtivos.length, consumoPadraoKg])

  const itensBaixos = estoque.filter((i) => i.estoqueMinimo != null && i.quantidade <= i.estoqueMinimo)

  const dietasPorEquino = useMemo(() => {
    const mapa = new Map<string, DietaEquino[]>()
    for (const d of dietas) {
      const lista = mapa.get(d.equinoId) ?? []
      lista.push(d)
      mapa.set(d.equinoId, lista)
    }
    return equinos
      .map((e) => ({ equino: e, itens: mapa.get(e.id) ?? [] }))
      .filter((x) => x.itens.length > 0)
  }, [dietas, equinos])

  // Organização do Manejo Diário por Período
  const manejoPorPeriodo = useMemo(() => {
    const periodos = ["Manhã", "Tarde", "Noite", "Dia inteiro"] as const
    return periodos.map((p) => {
      const itensDoPeriodo = dietas
        .filter((d) => d.periodo === p)
        .map((d) => {
          const eq = equinos.find((e) => e.id === d.equinoId)
          return { dieta: d, equino: eq }
        })
        .filter((x) => x.equino != null)
      return { periodo: p, itens: itensDoPeriodo }
    })
  }, [dietas, equinos])

  function copiarManejoWhatsApp() {
    let txt = `📋 *MANEJO DIÁRIO DE ALIMENTAÇÃO - HARAS*\nData: ${new Date().toLocaleDateString("pt-BR")}\n\n`
    for (const p of manejoPorPeriodo) {
      if (p.itens.length === 0) continue
      txt += `⏰ *PERÍODO: ${p.periodo.toUpperCase()}*\n`
      for (const item of p.itens) {
        txt += `• *${item.equino?.nome}:* ${item.dieta.quantidade} ${item.dieta.unidade} de ${item.dieta.itemNome}\n`
      }
      txt += `\n`
    }
    navigator.clipboard.writeText(txt)
    toast.success("Ficha de manejo copiada para o WhatsApp!")
  }


  function abrirNovoItem() {
    setEditandoItem(null)
    setFormItem(ITEM_VAZIO)
    setDialogItem(true)
  }

  function abrirEdicaoItem(i: ItemEstoque) {
    setEditandoItem(i)
    setFormItem({
      nome: i.nome,
      tipo: i.tipo,
      quantidade: String(i.quantidade),
      unidade: i.unidade,
      estoqueMinimo: i.estoqueMinimo != null ? String(i.estoqueMinimo) : "",
      custoUnitario: i.custoUnitario != null ? String(i.custoUnitario) : "",
      observacoes: i.observacoes ?? "",
    })
    setDialogItem(true)
  }

  async function salvarItem() {
    if (!formItem.nome.trim() || formItem.quantidade === "") {
      toast.error("Informe o nome e a quantidade do item")
      return
    }
    await salvarItemEstoque({
      id: editandoItem?.id ?? crypto.randomUUID(),
      nome: formItem.nome.trim(),
      tipo: formItem.tipo,
      quantidade: parseFloat(formItem.quantidade.replace(",", ".")),
      unidade: formItem.unidade,
      estoqueMinimo: formItem.estoqueMinimo ? parseFloat(formItem.estoqueMinimo.replace(",", ".")) : undefined,
      custoUnitario: formItem.custoUnitario ? parseFloat(formItem.custoUnitario.replace(",", ".")) : undefined,
      observacoes: formItem.observacoes.trim() || undefined,
    })
    toast.success(editandoItem ? "Item atualizado" : "Item adicionado ao estoque")
    setDialogItem(false)
    carregar()
  }

  function abrirNovaDieta() {
    setEditandoDieta(null)
    setFormDieta({ ...DIETA_VAZIA, equinoId: equinos[0]?.id ?? "" })
    setDialogDieta(true)
  }

  function abrirEdicaoDieta(d: DietaEquino) {
    setEditandoDieta(d)
    setFormDieta({
      equinoId: d.equinoId,
      itemNome: d.itemNome,
      quantidade: String(d.quantidade),
      unidade: d.unidade,
      periodo: d.periodo,
    })
    setDialogDieta(true)
  }

  async function salvarDietaAtual() {
    if (!formDieta.equinoId || !formDieta.itemNome.trim() || formDieta.quantidade === "") {
      toast.error("Preencha o equino, o item e a quantidade")
      return
    }
    await salvarDieta({
      id: editandoDieta?.id ?? crypto.randomUUID(),
      equinoId: formDieta.equinoId,
      itemNome: formDieta.itemNome.trim(),
      quantidade: parseFloat(formDieta.quantidade.replace(",", ".")),
      unidade: formDieta.unidade,
      periodo: formDieta.periodo,
      itemEstoqueId: editandoDieta?.itemEstoqueId,
      observacoes: editandoDieta?.observacoes,
    })
    toast.success(editandoDieta ? "Dieta atualizada" : "Item adicionado à dieta")
    setDialogDieta(false)
    carregar()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Alimentação</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {carregando || loading ? "Carregando…" : `Dietas de ${dietasPorEquino.length} equino${dietasPorEquino.length === 1 ? "" : "s"} · ${estoque.length} itens em estoque`}
        </p>
      </div>

      {itensBaixos.length > 0 && (
        <Card className="rounded-2xl border-amber-300/70 bg-amber-50/60 dark:border-amber-700/50 dark:bg-amber-900/20">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <span className="font-semibold">Estoque baixo:</span>{" "}
              {itensBaixos.map((i) => `${i.nome} (${i.quantidade} ${UNIDADE_LABEL[i.unidade]})`).join(", ")}
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs value={aba} onValueChange={(v) => setAba(v as "dietas" | "estoque" | "previsao" | "manejo")}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto sm:h-11 p-1 gap-1 rounded-2xl bg-stone-200/60 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800">
          <TabsTrigger value="dietas" className="h-9 sm:h-full rounded-xl px-2 text-xs font-semibold flex items-center justify-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:shadow-xs">
            <UtensilsCrossed className="size-3.5 shrink-0" />
            <span className="truncate">Dietas ({dietasPorEquino.length})</span>
          </TabsTrigger>
          <TabsTrigger value="estoque" className="h-9 sm:h-full rounded-xl px-2 text-xs font-semibold flex items-center justify-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:shadow-xs">
            <Package className="size-3.5 shrink-0" />
            <span className="truncate">Estoque ({estoque.length})</span>
            {itensBaixos.length > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shrink-0">
                {itensBaixos.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="previsao" className="h-9 sm:h-full rounded-xl px-2 text-xs font-semibold flex items-center justify-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:shadow-xs">
            <Calculator className="size-3.5 shrink-0" />
            <span className="truncate">Autonomia</span>
          </TabsTrigger>
          <TabsTrigger value="manejo" className="h-9 sm:h-full rounded-xl px-2 text-xs font-semibold flex items-center justify-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:shadow-xs">
            <ClipboardList className="size-3.5 shrink-0" />
            <span className="truncate">Manejo</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. Dietas */}
        <TabsContent value="dietas" className="mt-5">
          {carregando || loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          ) : dietasPorEquino.length === 0 ? (
            <Card className="rounded-2xl">
              <CardContent className="flex flex-col items-center gap-4 px-6 py-14 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Wheat className="size-7" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Nenhuma dieta definida</h2>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                    Monte a dieta de cada cavalo com ração, feno e suplementos, por período do dia.
                  </p>
                </div>
                <Button onClick={abrirNovaDieta}>
                  <Plus className="size-4" />
                  Adicionar à dieta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {dietasPorEquino.map(({ equino, itens }) => (
                <Card key={equino.id} className="overflow-hidden rounded-2xl">
                  <div className="flex items-center gap-3 border-b border-border/70 bg-muted/30 p-4">
                    <Link to={`/equinos/${equino.id}`}>
                      <HorseAvatar
                        nome={equino.nome}
                        fotoUrl={fotos[equino.id]}
                        tema={temaPelagem(equino.pelagem)}
                        className="size-11 shrink-0 rounded-xl"
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link to={`/equinos/${equino.id}`} className="truncate text-sm font-semibold hover:text-primary">
                        {equino.nome}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {equino.raca} · {equino.pelagem}
                      </p>
                    </div>
                  </div>
                  <CardContent className="space-y-2 p-4">
                    {itens.map((d) => (
                      <div key={d.id} className="flex items-center justify-between gap-2 rounded-xl border border-border p-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{d.itemNome}</p>
                          <p className="text-xs text-muted-foreground">
                            {d.periodo} · {d.quantidade.toLocaleString("pt-BR")} {UNIDADE_LABEL[d.unidade]}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-0.5">
                          <Button variant="ghost" size="icon-sm" aria-label="Editar item da dieta" onClick={() => abrirEdicaoDieta(d)}>
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Excluir item da dieta"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setExcluirDietaState(d)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="mt-1 w-full rounded-lg" onClick={abrirNovaDieta}>
                      <Plus className="size-3.5" />
                      Adicionar item
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 2. Estoque */}
        <TabsContent value="estoque" className="mt-5">
          <div className="mb-4 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              className="rounded-xl border-[#d9b978]/40 hover:border-[#d9b978] text-foreground font-bold text-xs"
              onClick={() => setModalVisionAberto(true)}
            >
              <Camera className="mr-1.5 size-3.5 text-[#d9b978]" />
              Contar com IA Vision
            </Button>

            <Button className="rounded-xl bg-[#143129] text-[#d9b978] hover:bg-[#143129]/90 font-bold text-xs" onClick={abrirNovoItem}>
              <Plus className="size-4 mr-1" />
              Novo item no estoque
            </Button>
          </div>
          {carregando ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          ) : estoque.length === 0 ? (
            <Card className="rounded-2xl">
              <CardContent className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Package className="size-7" />
                </div>
                <h2 className="font-display text-xl font-semibold">Estoque vazio</h2>
                <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                  Cadastre ração, feno e suplementos com quantidade mínima para receber alertas de reposição.
                </p>
                <Button onClick={abrirNovoItem}>
                  <Plus className="size-4" />
                  Adicionar item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {estoque.map((i) => {
                const baixo = i.estoqueMinimo != null && i.quantidade <= i.estoqueMinimo
                return (
                  <Card key={i.id} className={cn("rounded-2xl", baixo && "border-amber-400/70")}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg text-sm", TIPO_COR[i.tipo])}>
                            <Wheat className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{i.nome}</p>
                            <p className="text-xs text-muted-foreground">{TIPO_ITEM_LABEL[i.tipo]}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-0.5">
                          <Button variant="ghost" size="icon-sm" aria-label="Editar item" onClick={() => abrirEdicaoItem(i)}>
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Excluir item"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setExcluirItem(i)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 flex items-end justify-between">
                        <p className="font-display text-2xl font-semibold">
                          {i.quantidade.toLocaleString("pt-BR")}{" "}
                          <span className="text-sm font-medium text-muted-foreground">{UNIDADE_LABEL[i.unidade]}</span>
                        </p>
                        {baixo ? (
                          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                            <AlertTriangle className="size-3" />
                            Repor
                          </span>
                        ) : (
                          i.estoqueMinimo != null && (
                            <span className="text-[11px] text-muted-foreground">mín. {i.estoqueMinimo}</span>
                          )
                        )}
                      </div>
                      {i.custoUnitario != null && (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          R$ {i.custoUnitario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          {UNIDADE_LABEL[i.unidade] === "kg" ? "/kg" : `/${UNIDADE_LABEL[i.unidade]}`}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* 3. Previsão Inteligente & Autonomia */}
        <TabsContent value="previsao" className="mt-5 space-y-4">
          <Card className="rounded-2xl border border-[#d9b978]/40 bg-[#d9b978]/10 dark:bg-[#d9b978]/5">
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#143129] text-[#d9b978]">
                  <Calculator className="size-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                    Cálculo Inteligente de Consumo do Rebanho
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Considerando {equinosAtivos.length} cavalos ativos no haras.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="cons-padrao" className="text-xs text-stone-700 dark:text-stone-300 whitespace-nowrap">
                  Média por cavalo:
                </Label>
                <div className="flex items-center gap-1">
                  <Input
                    id="cons-padrao"
                    type="number"
                    step="0.5"
                    value={consumoPadraoKg}
                    onChange={(e) => setConsumoPadraoKg(Math.max(0.5, parseFloat(e.target.value) || 3.5))}
                    className="w-20 h-8 text-xs font-bold"
                  />
                  <span className="text-xs text-stone-500 font-semibold">kg/dia</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {previsoesEstoque.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground p-8">
              Cadastre itens no estoque para ver a previsão de dias restantes.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {previsoesEstoque.map((p) => {
                const isCritico = p.status === "critico"
                const isAlerta = p.status === "alerta"
                return (
                  <Card
                    key={p.itemId}
                    className={cn(
                      "rounded-2xl border transition-all",
                      isCritico
                        ? "border-rose-400 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/20"
                        : isAlerta
                        ? "border-amber-400 bg-amber-50/40 dark:border-amber-900/60 dark:bg-amber-950/20"
                        : "border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900",
                    )}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                            {p.itemNome}
                          </p>
                          <p className="text-xs text-stone-500">
                            Estoque atual: {p.quantidadeAtual} {p.unidade}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold uppercase",
                            isCritico
                              ? "border-rose-300 text-rose-700 bg-rose-100 dark:bg-rose-900/60 dark:text-rose-200"
                              : isAlerta
                              ? "border-amber-300 text-amber-700 bg-amber-100 dark:bg-amber-900/60 dark:text-amber-200"
                              : "border-emerald-300 text-emerald-700 bg-emerald-100 dark:bg-emerald-900/60 dark:text-emerald-200",
                          )}
                        >
                          {isCritico ? "Urgente: Comprar" : isAlerta ? "Atenção: Repor" : "Autonomia OK"}
                        </Badge>
                      </div>

                      <div className="bg-stone-100/80 dark:bg-stone-800/80 p-3 rounded-xl">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-stone-600 dark:text-stone-400">Autonomia estimada:</span>
                          <span className="font-mono text-xl font-black text-stone-900 dark:text-stone-100">
                            {p.diasRestantes >= 999 ? "∞" : `${p.diasRestantes} dias`}
                          </span>
                        </div>
                        {p.diasRestantes < 999 && (
                          <p className="text-[11px] text-stone-500 mt-0.5 text-right">
                            Término previsto em: <strong className="text-stone-700 dark:text-stone-300">{formatarData(p.dataEsgotamento)}</strong>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                        <span>Consumo diário total:</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          {p.consumoDiarioEstimado} kg/dia
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* 4. Ficha de Manejo do Tratador */}
        <TabsContent value="manejo" className="mt-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                Ficha de Manejo Diário para o Tratador
              </h3>
              <p className="text-xs text-stone-500">
                Distribuição de ração, feno e suplementos por período e animal.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="flex-1 sm:flex-initial gap-1.5 rounded-xl border-emerald-500/30 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                onClick={copiarManejoWhatsApp}
              >
                <Copy className="size-4" />
                Copiar p/ WhatsApp
              </Button>
              <Button
                className="flex-1 sm:flex-initial gap-1.5 rounded-xl bg-[#143129] text-[#d9b978] hover:bg-[#143129]/90"
                onClick={() => window.print()}
              >
                <Printer className="size-4" />
                Imprimir Folha
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {manejoPorPeriodo.map((bloco) => (
              <Card key={bloco.periodo} className="rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-[#143129] text-white p-3.5 flex items-center justify-between">
                  <span className="font-serif font-bold text-sm tracking-wide flex items-center gap-1.5">
                    <UtensilsCrossed className="size-4 text-[#d9b978]" />
                    Período: {bloco.periodo}
                  </span>
                  <Badge variant="outline" className="text-white border-white/30 text-[10px]">
                    {bloco.itens.length} {bloco.itens.length === 1 ? "animal" : "animais"}
                  </Badge>
                </div>
                <CardContent className="p-4 space-y-2">
                  {bloco.itens.length === 0 ? (
                    <p className="text-xs text-stone-400 italic text-center py-4">
                      Nenhum trato registrado para este período.
                    </p>
                  ) : (
                    bloco.itens.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/50"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <HorseAvatar nome={item.equino!.nome} className="size-8 rounded-lg shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                              {item.equino!.nome}
                            </p>
                            <p className="text-[11px] text-stone-500 truncate">
                              {item.dieta.itemNome}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-xs bg-white dark:bg-stone-800 px-2 py-1 rounded-md border border-stone-200 dark:border-stone-700 text-[#143129] dark:text-[#d9b978] shrink-0">
                          {item.dieta.quantidade} {UNIDADE_LABEL[item.dieta.unidade]}
                        </span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>


      {/* Diálogo de item de estoque */}
      <Dialog open={dialogItem} onOpenChange={setDialogItem}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">{editandoItem ? "Editar item" : "Novo item de estoque"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="item-nome">Nome</Label>
              <Input
                id="item-nome"
                value={formItem.nome}
                onChange={(e) => setFormItem({ ...formItem, nome: e.target.value })}
                placeholder="Ex.: Ração Pellet 3mm"
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="item-tipo">Tipo</Label>
                <Select value={formItem.tipo} onValueChange={(v) => setFormItem({ ...formItem, tipo: v as TipoItemEstoque })}>
                  <SelectTrigger id="item-tipo" className="mt-1.5 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TIPO_ITEM_LABEL) as TipoItemEstoque[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {TIPO_ITEM_LABEL[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="item-unidade">Unidade</Label>
                <Select value={formItem.unidade} onValueChange={(v) => setFormItem({ ...formItem, unidade: v as UnidadeEstoque })}>
                  <SelectTrigger id="item-unidade" className="mt-1.5 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(UNIDADE_LABEL) as UnidadeEstoque[]).map((u) => (
                      <SelectItem key={u} value={u}>
                        {UNIDADE_LABEL[u]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="item-qtd">Quantidade</Label>
                <Input
                  id="item-qtd"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={formItem.quantidade}
                  onChange={(e) => setFormItem({ ...formItem, quantidade: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="item-min">Estoque mínimo</Label>
                <Input
                  id="item-min"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={formItem.estoqueMinimo}
                  onChange={(e) => setFormItem({ ...formItem, estoqueMinimo: e.target.value })}
                  placeholder="Ex.: 80"
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="item-custo">Custo unitário (R$)</Label>
              <Input
                id="item-custo"
                type="number"
                inputMode="decimal"
                step="0.01"
                value={formItem.custoUnitario}
                onChange={(e) => setFormItem({ ...formItem, custoUnitario: e.target.value })}
                placeholder="Ex.: 4,50"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="item-obs">Observações</Label>
              <Textarea
                id="item-obs"
                rows={2}
                value={formItem.observacoes}
                onChange={(e) => setFormItem({ ...formItem, observacoes: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogItem(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarItem}>Salvar item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de dieta */}
      <Dialog open={dialogDieta} onOpenChange={setDialogDieta}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">{editandoDieta ? "Editar item da dieta" : "Adicionar à dieta"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dieta-equino">Equino</Label>
              <Select value={formDieta.equinoId} onValueChange={(v) => setFormDieta({ ...formDieta, equinoId: v })}>
                <SelectTrigger id="dieta-equino" className="mt-1.5 rounded-lg">
                  <SelectValue placeholder="Selecionar" />
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
            <div>
              <Label htmlFor="dieta-item">Item (ração, feno, suplemento…)</Label>
              <Input
                id="dieta-item"
                value={formDieta.itemNome}
                onChange={(e) => setFormDieta({ ...formDieta, itemNome: e.target.value })}
                placeholder="Ex.: Feno Tifton"
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="dieta-qtd">Quantidade</Label>
                <Input
                  id="dieta-qtd"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={formDieta.quantidade}
                  onChange={(e) => setFormDieta({ ...formDieta, quantidade: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="dieta-un">Unidade</Label>
                <Select value={formDieta.unidade} onValueChange={(v) => setFormDieta({ ...formDieta, unidade: v as UnidadeEstoque })}>
                  <SelectTrigger id="dieta-un" className="mt-1.5 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(UNIDADE_LABEL) as UnidadeEstoque[]).map((u) => (
                      <SelectItem key={u} value={u}>
                        {UNIDADE_LABEL[u]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dieta-periodo">Período</Label>
                <Select value={formDieta.periodo} onValueChange={(v) => setFormDieta({ ...formDieta, periodo: v })}>
                  <SelectTrigger id="dieta-periodo" className="mt-1.5 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIODOS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogDieta(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarDietaAtual}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={excluirItem !== null}
        onOpenChange={(o) => !o && setExcluirItem(null)}
        titulo="Excluir item do estoque?"
        descricao="Este item será removido do estoque."
        confirmText="Excluir"
        onConfirm={async () => {
          if (!excluirItem) return
          await excluirItemEstoque(excluirItem.id)
          toast.success("Item excluído")
          setExcluirItem(null)
          carregar()
        }}
      />
      <ConfirmDialog
        open={excluirDietaState !== null}
        onOpenChange={(o) => !o && setExcluirDietaState(null)}
        titulo="Excluir item da dieta?"
        descricao="Este item será removido da dieta do equino."
        confirmText="Excluir"
        onConfirm={async () => {
          if (!excluirDietaState) return
          await excluirDieta(excluirDietaState.id)
          toast.success("Item excluído")
          setExcluirDietaState(null)
          carregar()
        }}
      />

      <HarasVisionModal
        aberto={modalVisionAberto}
        modoInicial="estoque"
        onFechar={() => setModalVisionAberto(false)}
        onAtualizarEstoque={async (total, tipo) => {
          const itemExistente = estoque.find((e) => e.tipo === tipo || e.nome.toLowerCase().includes(tipo))
          if (itemExistente) {
            await salvarItemEstoque({
              ...itemExistente,
              quantidade: total,
            })
            await carregar()
          }
        }}
      />
    </div>
  )
}
