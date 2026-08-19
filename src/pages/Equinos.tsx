import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  ChevronRight,
  Heart,
  HeartCrack,
  LayoutGrid,
  List,
  LogOut,
  Plus,
  Search,
  TrendingUp,
  Video,
  X,
} from "lucide-react"
import { HorseIcon } from "@/components/icons/HorseIcon"
import { HorseAvatar } from "@/components/horse/HorseAvatar"
import { ModalRegistrarSaida } from "@/components/horse/ModalRegistrarSaida"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { carregarDadosExemplo } from "@/lib/dados-exemplo"
import { getSaidas, removerSaida, formatarData } from "@/lib/db"
import { useEquinosComFotos } from "@/lib/hooks"
import { temaPelagem } from "@/lib/pelagens"
import { SEXO_LABEL, type Equino, type RegistroSaida, type Sexo } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function Equinos() {
  const { equinos, fotos, videos, loading, reload } = useEquinosComFotos()

  const [abaAtiva, setAbaAtiva] = useState<"plantel" | "vendidos" | "memorial">("plantel")
  const [saidas, setSaidas] = useState<RegistroSaida[]>([])
  const [modalSaidaAberto, setModalSaidaAberto] = useState(false)
  const [equinoParaSaida, setEquinoParaSaida] = useState<Equino | null>(null)

  // Filtros
  const [busca, setBusca] = useState("")
  const [sexoFiltro, setSexoFiltro] = useState<"todos" | Sexo>("todos")
  const [racaFiltro, setRacaFiltro] = useState<string>("todas")
  const [visao, setVisao] = useState<"cards" | "tabela">("cards")
  const [ordenacao, setOrdenacao] = useState<"nome" | "recente" | "idade">("nome")

  async function carregarSaidas() {
    try {
      const dados = await getSaidas()
      setSaidas(dados)
    } catch (err) {
      console.error("Erro ao carregar saídas:", err)
    }
  }

  useEffect(() => {
    carregarSaidas()
  }, [])

  // Cavalos ativos no haras
  const equinosAtivos = useMemo(() => {
    return equinos.filter((e) => e.status === "ativo")
  }, [equinos])

  // Contagens de categorias
  const garanhoes = useMemo(() => equinosAtivos.filter((e) => e.sexo === "macho"), [equinosAtivos])
  const matrizes = useMemo(() => equinosAtivos.filter((e) => e.sexo === "femea"), [equinosAtivos])

  // Lista de raças únicas para filtro
  const racasDisponiveis = useMemo(() => {
    const set = new Set(equinosAtivos.map((e) => e.raca).filter(Boolean))
    return Array.from(set)
  }, [equinosAtivos])

  // Filtragem e Ordenação do Plantel Ativo
  const filtradosAtivos = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const list = equinosAtivos.filter((e) => {
      if (sexoFiltro !== "todos" && e.sexo !== sexoFiltro) return false
      if (racaFiltro !== "todas" && e.raca !== racaFiltro) return false
      if (!termo) return true
      return (
        e.nome.toLowerCase().includes(termo) ||
        e.raca.toLowerCase().includes(termo) ||
        e.pelagem.toLowerCase().includes(termo) ||
        (e.registro ?? "").toLowerCase().includes(termo) ||
        (e.microchip ?? "").toLowerCase().includes(termo)
      )
    })

    return list.sort((a, b) => {
      if (ordenacao === "nome") return a.nome.localeCompare(b.nome, "pt-BR")
      if (ordenacao === "recente") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      if (ordenacao === "idade") {
        const dA = a.nascimento ? new Date(a.nascimento).getTime() : 0
        const dB = b.nascimento ? new Date(b.nascimento).getTime() : 0
        return dA - dB
      }
      return 0
    })
  }, [equinosAtivos, busca, sexoFiltro, racaFiltro, ordenacao])

  // Vendidos
  const saidasVendas = useMemo(() => {
    return saidas.filter((s) => s.motivo === "venda" || s.motivo === "cedido")
  }, [saidas])

  const totalArrecadadoVendas = useMemo(() => {
    return saidasVendas.reduce((acc, s) => acc + (s.valorVenda || 0), 0)
  }, [saidasVendas])

  // Óbitos
  const saidasObitos = useMemo(() => {
    return saidas.filter((s) => s.motivo === "obito")
  }, [saidas])

  function abrirModalParaEquino(eq: Equino) {
    setEquinoParaSaida(eq)
    setModalSaidaAberto(true)
  }

  function handleSaidaSalva() {
    carregarSaidas()
    reload()
  }

  function calcularIdadeTexto(dataNasc?: string) {
    if (!dataNasc) return "Idade não informada"
    const hoje = new Date()
    const nasc = new Date(dataNasc)
    let anos = hoje.getFullYear() - nasc.getFullYear()
    let meses = hoje.getMonth() - nasc.getMonth()
    if (meses < 0 || (meses === 0 && hoje.getDate() < nasc.getDate())) {
      anos--
      meses += 12
    }
    if (anos === 0) return `${meses} meses`
    if (anos === 1) return `1 ano e ${meses} m`
    return `${anos} anos`
  }

  const temFiltroAtivo = busca !== "" || sexoFiltro !== "todos" || racaFiltro !== "todas"

  function limparFiltros() {
    setBusca("")
    setSexoFiltro("todos")
    setRacaFiltro("todas")
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header com Ações Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-9 sm:size-10 rounded-2xl bg-[#143129] text-[#d9b978] flex items-center justify-center shadow-sm">
              <HorseIcon className="size-5 sm:size-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Plantel de Equinos
              </h1>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Gestão genética, controle morfológico e registros do rebanho.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <Button
            variant="outline"
            onClick={() => {
              setEquinoParaSaida(null)
              setModalSaidaAberto(true)
            }}
            className="flex-1 sm:flex-initial h-10 rounded-2xl border-stone-300 dark:border-stone-700 bg-card text-xs font-semibold hover:bg-muted"
          >
            <LogOut className="mr-1.5 size-3.5 text-amber-500" />
            <span className="hidden xs:inline">Registrar Saída</span>
            <span className="xs:hidden">Saída</span>
          </Button>

          <Link to="/equinos/novo" className="flex-1 sm:flex-initial">
            <Button className="w-full h-10 rounded-2xl bg-[#143129] text-[#d9b978] font-bold text-xs hover:bg-[#1c4338] shadow-md active:scale-95 transition-all">
              <Plus className="mr-1.5 size-4" />
              Novo Equino
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards de Métricas do Plantel (Compactos e Responsivos) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Total */}
        <Card className="rounded-2xl sm:rounded-3xl border-stone-200/80 dark:border-stone-800 p-3 sm:p-4 bg-card shadow-xs">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="size-8 sm:size-10 rounded-xl sm:rounded-2xl bg-[#143129] text-[#d9b978] flex items-center justify-center shrink-0">
              <HorseIcon className="size-4 sm:size-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate block">
                Total Haras
              </span>
              <p className="font-display text-lg sm:text-2xl font-black text-foreground leading-tight">
                {equinosAtivos.length} <span className="text-[10px] sm:text-xs font-normal text-muted-foreground">cavalos</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Garanhões */}
        <Card className="rounded-2xl sm:rounded-3xl border-stone-200/80 dark:border-stone-800 p-3 sm:p-4 bg-card shadow-xs">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="size-8 sm:size-10 rounded-xl sm:rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm sm:text-base shrink-0">
              👑
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate block">
                Garanhões
              </span>
              <p className="font-display text-lg sm:text-2xl font-black text-foreground leading-tight">
                {garanhoes.length} <span className="text-[10px] sm:text-xs font-normal text-muted-foreground">machos</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Matrizes */}
        <Card className="rounded-2xl sm:rounded-3xl border-stone-200/80 dark:border-stone-800 p-3 sm:p-4 bg-card shadow-xs">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="size-8 sm:size-10 rounded-xl sm:rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
              <Heart className="size-4 sm:size-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate block">
                Matrizes
              </span>
              <p className="font-display text-lg sm:text-2xl font-black text-foreground leading-tight">
                {matrizes.length} <span className="text-[10px] sm:text-xs font-normal text-muted-foreground">éguas</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Vendidos */}
        <Card className="rounded-2xl sm:rounded-3xl border-stone-200/80 dark:border-stone-800 p-3 sm:p-4 bg-card shadow-xs">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="size-8 sm:size-10 rounded-xl sm:rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="size-4 sm:size-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate block">
                Vendidos
              </span>
              <p className="font-display text-lg sm:text-2xl font-black text-foreground leading-tight">
                {saidasVendas.length} <span className="text-[10px] sm:text-xs font-normal text-muted-foreground">histórico</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Abas Superiores em Estilo Pills */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setAbaAtiva("plantel")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold whitespace-nowrap transition-all",
            abaAtiva === "plantel"
              ? "bg-[#143129] text-[#d9b978] shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          <HorseIcon className="size-3.5 sm:size-4" />
          <span>Plantel Ativo ({equinosAtivos.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva("vendidos")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold whitespace-nowrap transition-all",
            abaAtiva === "vendidos"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          <TrendingUp className="size-3.5 sm:size-4" />
          <span>Vendidos ({saidasVendas.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva("memorial")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold whitespace-nowrap transition-all",
            abaAtiva === "memorial"
              ? "bg-stone-800 text-stone-200 dark:bg-stone-700 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          <HeartCrack className="size-3.5 sm:size-4" />
          <span>Memorial ({saidasObitos.length})</span>
        </button>
      </div>

      {/* ABA 1: PLANTEL ATIVO */}
      {abaAtiva === "plantel" && (
        <div className="space-y-3.5 sm:space-y-4">
          {/* Barra de Filtros e Busca Inteligente */}
          <div className="bg-card p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-2.5">
            {/* Linha de Busca Principal e Alternador de Visão */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar nome, raça, pelagem, registro..."
                  className="pl-9 pr-8 h-9 sm:h-10 rounded-xl sm:rounded-2xl text-xs bg-background border-stone-200 dark:border-stone-800"
                />
                {busca && (
                  <button
                    type="button"
                    onClick={() => setBusca("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Botões Grid / Lista */}
              <div className="flex rounded-xl sm:rounded-2xl border border-border bg-muted/50 p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setVisao("cards")}
                  className={cn(
                    "flex size-8 sm:size-9 items-center justify-center rounded-lg sm:rounded-xl transition-all",
                    visao === "cards" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Cards"
                >
                  <LayoutGrid className="size-3.5 sm:size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setVisao("tabela")}
                  className={cn(
                    "flex size-8 sm:size-9 items-center justify-center rounded-lg sm:rounded-xl transition-all",
                    visao === "tabela" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Lista"
                >
                  <List className="size-3.5 sm:size-4" />
                </button>
              </div>
            </div>

            {/* Chips Rápidos de Filtro por Categoria */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-xs">
              <button
                type="button"
                onClick={() => setSexoFiltro("todos")}
                className={cn(
                  "px-3 py-1 rounded-xl font-semibold whitespace-nowrap transition-all text-[11px]",
                  sexoFiltro === "todos"
                    ? "bg-[#143129] text-[#d9b978] font-bold"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted"
                )}
              >
                Todos ({equinosAtivos.length})
              </button>
              <button
                type="button"
                onClick={() => setSexoFiltro("macho")}
                className={cn(
                  "px-3 py-1 rounded-xl font-semibold whitespace-nowrap transition-all text-[11px] flex items-center gap-1",
                  sexoFiltro === "macho"
                    ? "bg-amber-600 text-white font-bold"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted"
                )}
              >
                👑 Garanhões ({garanhoes.length})
              </button>
              <button
                type="button"
                onClick={() => setSexoFiltro("femea")}
                className={cn(
                  "px-3 py-1 rounded-xl font-semibold whitespace-nowrap transition-all text-[11px] flex items-center gap-1",
                  sexoFiltro === "femea"
                    ? "bg-rose-600 text-white font-bold"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted"
                )}
              >
                💖 Matrizes ({matrizes.length})
              </button>
              <button
                type="button"
                onClick={() => setSexoFiltro("castrado")}
                className={cn(
                  "px-3 py-1 rounded-xl font-semibold whitespace-nowrap transition-all text-[11px]",
                  sexoFiltro === "castrado"
                    ? "bg-stone-700 text-white font-bold"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted"
                )}
              >
                Castrados
              </button>

              {/* Seletor Raça */}
              {racasDisponiveis.length > 0 && (
                <select
                  value={racaFiltro}
                  onChange={(e) => setRacaFiltro(e.target.value)}
                  className="h-7 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-2 text-[11px] font-semibold text-muted-foreground shrink-0"
                >
                  <option value="todas">Todas as Raças</option>
                  {racasDisponiveis.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              )}

              {/* Seletor Ordenação */}
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value as any)}
                className="h-7 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-2 text-[11px] font-semibold text-muted-foreground shrink-0 ml-auto"
              >
                <option value="nome">Nome A-Z</option>
                <option value="recente">Mais Recentes</option>
                <option value="idade">Idade</option>
              </select>

              {temFiltroAtivo && (
                <button
                  type="button"
                  onClick={limparFiltros}
                  className="text-[10px] text-rose-500 font-bold hover:underline px-1.5 whitespace-nowrap shrink-0"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Renderização dos Animais */}
          {loading ? (
            <div className="grid gap-3 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-3xl" />
              ))}
            </div>
          ) : filtradosAtivos.length === 0 ? (
            <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 p-8 sm:p-12 text-center bg-card">
              <div className="size-14 rounded-2xl bg-[#143129] text-[#d9b978] flex items-center justify-center mx-auto mb-3">
                <HorseIcon className="size-7" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">Nenhum equino encontrado</h2>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Não foram encontrados animais com os filtros atuais.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Link to="/equinos/novo">
                  <Button className="h-9 rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs">
                    Cadastrar Equino
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="h-9 rounded-xl text-xs"
                  onClick={async () => {
                    await carregarDadosExemplo(true)
                    toast.success("Dados de exemplo carregados!")
                    reload()
                  }}
                >
                  Carregar Exemplos
                </Button>
              </div>
            </Card>
          ) : visao === "cards" ? (
            /* VISÃO GRID DE CARDS LUXURY HARAS EDITION */
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filtradosAtivos.map((equino) => {
                const foto = fotos[equino.id]
                const temVid = Boolean(videos[equino.id])

                return (
                  <Card
                    key={equino.id}
                    className="group overflow-hidden rounded-3xl border border-stone-200/90 dark:border-stone-800/90 bg-card hover:border-[#d9b978]/80 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-[#d9b978]/5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Imagem de Capa do Animal */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-stone-950">
                        <HorseAvatar
                          nome={equino.nome}
                          fotoUrl={foto}
                          tema={temaPelagem(equino.pelagem)}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Badges Flutuantes Superiores em Vidro Fosco */}
                        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-20">
                          <span
                            className={cn(
                              "backdrop-blur-md text-[10px] font-extrabold px-2.5 py-1 rounded-xl border shadow-sm flex items-center gap-1",
                              equino.sexo === "macho"
                                ? "bg-amber-950/80 text-amber-300 border-amber-500/40"
                                : equino.sexo === "femea"
                                ? "bg-rose-950/80 text-rose-300 border-rose-500/40"
                                : "bg-stone-900/80 text-stone-300 border-stone-600/40"
                            )}
                          >
                            {equino.sexo === "macho" && "👑 "}
                            {equino.sexo === "femea" && "🌸 "}
                            {SEXO_LABEL[equino.sexo]}
                          </span>

                          <span className="bg-[#143129]/90 backdrop-blur-md text-[#d9b978] text-[10px] font-extrabold px-2.5 py-1 rounded-xl border border-[#d9b978]/40 shadow-sm">
                            {equino.pelagem}
                          </span>
                        </div>

                        {temVid && (
                          <div className="absolute top-3 right-3 bg-amber-500 text-stone-950 px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 shadow-md z-20">
                            <Video className="size-3" /> VÍDEO HD
                          </div>
                        )}
                      </div>

                      {/* Informações do Animal */}
                      <div className="p-4 sm:p-5 space-y-3">
                        <div>
                          <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground leading-snug group-hover:text-[#d9b978] transition-colors">
                            {equino.nome}
                          </h3>
                          <p className="text-xs text-muted-foreground font-medium mt-0.5 flex items-center gap-1.5">
                            <span className="font-semibold text-stone-700 dark:text-stone-300">{equino.raca}</span>
                            <span>•</span>
                            <span>{calcularIdadeTexto(equino.nascimento)}</span>
                          </p>
                        </div>

                        {/* Badges de Registro e Status Haras */}
                        <div className="pt-2.5 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
                          {equino.registro ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground">RG:</span>
                              <span className="font-mono text-[11px] font-bold bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-700 text-foreground">
                                {equino.registro}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground">Genealogia:</span>
                              <span className="text-[11px] text-stone-500 font-medium">Registrado no Haras</span>
                            </div>
                          )}

                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Ativo
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação na Base */}
                    <div className="p-4 sm:p-5 pt-0 border-t border-border/40 flex items-center justify-between gap-2 mt-1">
                      <Link to={`/equinos/${equino.id}`} className="flex-1">
                        <Button className="w-full h-10 rounded-2xl bg-[#143129] text-[#d9b978] font-bold text-xs hover:bg-[#1c4338] shadow-sm hover:shadow-md active:scale-95 transition-all">
                          Ver Ficha Completa
                          <ArrowRight className="ml-1.5 size-3.5" />
                        </Button>
                      </Link>

                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => abrirModalParaEquino(equino)}
                        className="size-10 rounded-2xl text-amber-600 dark:text-amber-400 border-stone-200 dark:border-stone-800 shrink-0 hover:bg-amber-500/15"
                        title="Registrar Saída / Venda"
                      >
                        <LogOut className="size-4" />
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            /* VISÃO LISTA DETALHADA E RESPONSIVA */
            <Card className="rounded-2xl sm:rounded-3xl border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs">
              {/* No Mobile: Lista em Cards Compactos */}
              <div className="block sm:hidden divide-y divide-border">
                {filtradosAtivos.map((equino) => (
                  <Link
                    key={equino.id}
                    to={`/equinos/${equino.id}`}
                    className="p-3 flex items-center gap-3 hover:bg-muted/40 transition-colors"
                  >
                    <HorseAvatar
                      fotoUrl={fotos[equino.id]}
                      nome={equino.nome}
                      tema={temaPelagem(equino.pelagem)}
                      className="size-12 rounded-xl shrink-0"
                      tamanhoIniciais="text-sm"
                      mostrarIcone={false}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-display font-bold text-sm text-foreground truncate">{equino.nome}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted border shrink-0">
                          {SEXO_LABEL[equino.sexo]}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {equino.raca} · {equino.pelagem}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {equino.registro ? `RG: ${equino.registro}` : calcularIdadeTexto(equino.nascimento)}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>

              {/* No Desktop: Tabela Completa */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 font-bold uppercase text-[10px] text-muted-foreground">
                      <th className="py-3 px-4">Animal</th>
                      <th className="py-3 px-4">Raça</th>
                      <th className="py-3 px-4">Pelagem</th>
                      <th className="py-3 px-4">Categoria / Sexo</th>
                      <th className="py-3 px-4">Idade</th>
                      <th className="py-3 px-4">Registro</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtradosAtivos.map((equino) => (
                      <tr key={equino.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-foreground">
                          <Link to={`/equinos/${equino.id}`} className="flex items-center gap-2.5 hover:text-[#d9b978]">
                            <HorseAvatar
                              fotoUrl={fotos[equino.id]}
                              nome={equino.nome}
                              tema={temaPelagem(equino.pelagem)}
                              className="size-8 rounded-lg"
                              tamanhoIniciais="text-xs"
                              mostrarIcone={false}
                            />
                            <span>{equino.nome}</span>
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{equino.raca}</td>
                        <td className="py-3 px-4 font-medium">{equino.pelagem}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted border">
                            {SEXO_LABEL[equino.sexo]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{calcularIdadeTexto(equino.nascimento)}</td>
                        <td className="py-3 px-4 font-mono">{equino.registro || "—"}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link to={`/equinos/${equino.id}`}>
                              <Button size="sm" variant="outline" className="h-7 rounded-xl text-[11px] font-semibold">
                                Detalhes
                              </Button>
                            </Link>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => abrirModalParaEquino(equino)}
                              className="size-7 rounded-lg text-amber-500 hover:bg-amber-500/10"
                              title="Registrar Saída"
                            >
                              <LogOut className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ABA 2: HISTÓRICO DE VENDIDOS */}
      {abaAtiva === "vendidos" && (
        <div className="space-y-4">
          <Card className="rounded-2xl sm:rounded-3xl border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
              <div>
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Total Arrecadado em Vendas
                </span>
                <p className="font-display text-2xl sm:text-3xl font-black text-foreground mt-0.5">
                  R$ {totalArrecadadoVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {saidasVendas.length} animais transferidos
              </span>
            </div>
          </Card>

          {saidasVendas.length === 0 ? (
            <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 p-12 text-center">
              <TrendingUp className="size-12 mx-auto text-stone-400 opacity-60 mb-2" />
              <p className="font-bold text-foreground">Nenhuma venda registrada ainda</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ao vender um animal do haras, utilize o botão "Registrar Saída" para manter o histórico de faturamento.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {saidasVendas.map((s) => (
                <Card key={s.id} className="rounded-2xl sm:rounded-3xl border-stone-200/80 dark:border-stone-800 p-4 sm:p-5 bg-card flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase bg-emerald-500/15 text-emerald-600 px-2.5 py-0.5 rounded-full">
                        {s.motivo === "venda" ? "Vendido" : "Cedido / Transferido"}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatarData(s.data)}</span>
                    </div>

                    <div className="mt-3 space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">Animal:</span>
                        <strong className="text-foreground text-sm sm:text-base">{s.equinoNome}</strong>
                      </div>

                      {s.compradorNome && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Comprador / Destino:</span>
                          <span className="text-foreground font-semibold">{s.compradorNome}</span>
                        </div>
                      )}

                      {s.valorVenda && s.valorVenda > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Valor da Venda:</span>
                          <span className="font-mono text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                            R$ {s.valorVenda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-end">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={async () => {
                        await removerSaida(s.id)
                        toast.success("Registro de venda removido.")
                        carregarSaidas()
                      }}
                      className="size-8 rounded-lg text-rose-500 hover:bg-rose-500/10"
                    >
                      <LogOut className="size-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 3: MEMORIAL DE ÓBITOS */}
      {abaAtiva === "memorial" && (
        <div className="space-y-4">
          {saidasObitos.length === 0 ? (
            <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 p-12 text-center">
              <HeartCrack className="size-12 mx-auto text-stone-400 opacity-60 mb-2" />
              <p className="font-bold text-foreground">Nenhum registro de óbito</p>
              <p className="text-xs text-muted-foreground mt-1">
                Registros de animais falecidos e laudos de necropsia são preservados no memorial histórico do Haras.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {saidasObitos.map((s) => (
                <Card key={s.id} className="rounded-2xl sm:rounded-3xl border-stone-800/80 bg-stone-900/40 p-4 sm:p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase bg-stone-700 text-stone-300 px-2.5 py-0.5 rounded-full">
                        Memorial
                      </span>
                      <span className="text-xs text-stone-400">{formatarData(s.data)}</span>
                    </div>

                    <div className="mt-3 space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Animal:</span>
                        <strong className="text-white text-sm sm:text-base">{s.equinoNome}</strong>
                      </div>

                      {s.causaMortis && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-400 block">Causa Mortis / Diagnóstico:</span>
                          <span className="text-rose-300 font-semibold">{s.causaMortis}</span>
                        </div>
                      )}

                      {s.observacoes && (
                        <p className="text-stone-300 text-xs italic mt-2">
                          "{s.observacoes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-800 flex items-center justify-end">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={async () => {
                        await removerSaida(s.id)
                        toast.success("Registro de memorial removido.")
                        carregarSaidas()
                      }}
                      className="size-8 rounded-lg text-rose-500 hover:bg-rose-500/10"
                    >
                      <LogOut className="size-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Registrar Saída / Venda */}
      <ModalRegistrarSaida
        open={modalSaidaAberto}
        onOpenChange={setModalSaidaAberto}
        equinos={equinosAtivos}
        equinoPreselecionado={equinoParaSaida}
        onSalvo={handleSaidaSalva}
      />
    </div>
  )
}
