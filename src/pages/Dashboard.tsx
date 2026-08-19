import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Heart,
  Plus,
  Sparkles,
  Syringe,
  TrendingUp,
  Wallet,
  Worm,
  type LucideIcon,
} from "lucide-react"
import AnimatedContent from "@/components/bits/AnimatedContent/AnimatedContent"
import { LiquidGlass } from "@/components/bits/LiquidGlass"

import { HorseIcon } from "@/components/icons/HorseIcon"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HorseCard } from "@/components/horse/HorseCard"
import { carregarDadosExemplo, carregarDadosModulos } from "@/lib/dados-exemplo"
import {
  diasAte,
  formatarData,
  getCoberturas,
  getEventos,
  getTransacoes,
  getVacinas,
  getVermifugos,
  hojeIso,
} from "@/lib/db"
import { useEquinosComFotos } from "@/lib/hooks"
import { calcularAlertas } from "@/lib/saude"
import {
  TIPO_EVENTO_ICONE,
  TIPO_EVENTO_LABEL,
  type Cobertura,
  type Evento,
  type Transacao,
} from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

function formatarMoeda(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

/* Cor do líquido do hero — constante fora do componente para manter identidade estável
   (evita que o canvas WebGL seja recriado a cada re-render e pisque). */
const HERO_BASE_COLOR: [number, number, number] = [0.06, 0.14, 0.1]

/* Relógio ao vivo — estado isolado para não re-renderizar o hero a cada segundo */
function RelogioVivo() {
  const [agora, setAgora] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setAgora(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d9b978]/30 bg-[#d9b978]/10 px-2.5 py-1 font-mono normal-case tracking-widest text-[#e8c37f]">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d9b978] opacity-60" />
        <span className="relative inline-flex size-1.5 rounded-full bg-[#d9b978]" />
      </span>
      {agora.toLocaleTimeString("pt-BR")}
    </span>
  )
}

/* Contagem animada dos números quando entram na tela */
function CountUp({
  valor,
  formato,
  className,
}: {
  valor: number
  formato?: (v: number) => string
  className?: string
}) {
  const [exibido, setExibido] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const rodou = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Reinicia a flag: se o valor mudou (ex.: dados carregados depois), anima de novo
    rodou.current = false
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || rodou.current) return
        rodou.current = true
        const t0 = performance.now()
        const dur = 1100
        const passo = (t: number) => {
          const p = Math.min((t - t0) / dur, 1)
          setExibido(valor * (1 - Math.pow(1 - p, 3)))
          if (p < 1) requestAnimationFrame(passo)
        }
        requestAnimationFrame(passo)
      },
      { threshold: 0.3 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [valor])

  return (
    <span ref={ref} className={className}>
      {formato ? formato(exibido) : Math.round(exibido)}
    </span>
  )
}

type DadoMes = { data: Date; receitas: number; despesas: number; saldo: number }

/* Evolução financeira no estilo "breakdown": métricas em colunas, valor em destaque
   com badge de porcentagem e barra segmentada da composição da receita. */
function GraficoFinanceiro({ dados }: { dados: DadoMes[] }) {
  const todasZero = dados.every((d) => d.receitas === 0 && d.despesas === 0)
  const totalReceitas = dados.reduce((s, d) => s + d.receitas, 0)
  const totalDespesas = dados.reduce((s, d) => s + d.despesas, 0)
  const saldoPeriodo = totalReceitas - totalDespesas
  const pctDespesas = totalReceitas > 0 ? Math.round((totalDespesas / totalReceitas) * 100) : 0
  const pctSaldo = Math.max(0, 100 - pctDespesas)
  const melhorMes = [...dados].sort((a, b) => b.receitas - a.receitas)[0]

  const Metrica = ({
    dot,
    rotulo,
    valor,
    valorClass,
    sub,
  }: {
    dot: string
    rotulo: string
    valor: string
    valorClass?: string
    sub?: string
  }) => (
    <div>
      <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className={cn("size-2 rounded-full", dot)} />
        {rotulo}
      </p>
      <p className={cn("mt-1 font-display text-xl font-semibold tabular-nums", valorClass)}>{valor}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  )

  if (todasZero) {
    return (
      <div className="flex h-[240px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-center">
        <TrendingUp className="size-5 text-muted-foreground/50" />
        <p className="max-w-[16rem] px-3 text-xs text-muted-foreground">
          Registre transações no Financeiro para ver a evolução mensal aqui.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Colunas de métricas + destaque do saldo */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-[1fr_1fr_1.2fr]">
        <div className="space-y-5">
          <Metrica
            dot="bg-emerald-500"
            rotulo="Receitas"
            valor={formatarMoeda(totalReceitas)}
            valorClass="text-emerald-600 dark:text-emerald-400"
            sub="últimos 6 meses"
          />
          <Metrica
            dot="bg-red-400"
            rotulo="Despesas"
            valor={formatarMoeda(totalDespesas)}
            valorClass="text-red-500 dark:text-red-400"
            sub="últimos 6 meses"
          />
        </div>

        <div className="space-y-5 lg:border-l lg:border-border/70 lg:pl-6">
          <Metrica
            dot="bg-[#c9a45c]"
            rotulo="Saldo"
            valor={formatarMoeda(saldoPeriodo)}
            valorClass="text-primary"
            sub="últimos 6 meses"
          />
          <Metrica
            dot="bg-[#c9a45c]/50"
            rotulo="Melhor mês"
            valor={
              melhorMes && melhorMes.receitas > 0
                ? melhorMes.data instanceof Date
                  ? melhorMes.data.toLocaleDateString("pt-BR", { month: "long" })
                  : "—"
                : "—"
            }
            valorClass="capitalize"
            sub={melhorMes && melhorMes.receitas > 0 ? `${formatarMoeda(melhorMes.receitas)} em receitas` : undefined}
          />
        </div>

        {/* Destaque: saldo do período + badge da margem */}
        <div className="col-span-2 flex items-end justify-between gap-4 border-t border-border/70 pt-4 lg:col-span-1 lg:flex-col lg:items-end lg:justify-between lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-wider text-muted-foreground">Saldo do período</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums sm:text-3xl">{formatarMoeda(saldoPeriodo)}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="rounded-full bg-[#c9a45c]/15 px-2.5 py-1 text-xs font-semibold text-[#8a6528] dark:bg-[#c9a45c]/10 dark:text-[#e8c37f]">
              {pctSaldo}% da receita
            </span>
            <span aria-hidden className="mt-1 h-4 w-px bg-[#c9a45c]/50" />
          </div>
        </div>
      </div>

      {/* Barra segmentada: composição de cada R$ de receita */}
      <div className="mt-4">
        <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-muted">
          {totalDespesas > 0 && (
            <div
              className="h-full rounded-l-full bg-red-400 transition-all duration-700"
              style={{ width: `${pctDespesas}%` }}
            />
          )}
          {saldoPeriodo > 0 && (
            <div
              className="h-full rounded-r-full bg-gradient-to-r from-[#c9a45c] to-[#e0b96e] transition-all duration-700"
              style={{ width: `${pctSaldo}%` }}
            />
          )}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
          <span>
            Despesas · {pctDespesas}%{" "}
            <span className="hidden sm:inline">({formatarMoeda(totalDespesas)})</span>
          </span>
          <span>
            Saldo · {pctSaldo}%{" "}
            <span className="hidden sm:inline">({formatarMoeda(saldoPeriodo)})</span>
          </span>
        </div>
      </div>
    </div>
  )
}

type Atividade = {
  id: string
  data: string
  tipo: "vacina" | "vermifugo" | "cobertura" | "evento" | "receita" | "despesa"
  titulo: string
  subtitulo?: string
  valor?: number
}

const ATIV_ICONE: Record<Atividade["tipo"], LucideIcon> = {
  vacina: Syringe,
  vermifugo: Worm,
  cobertura: Heart,
  evento: CalendarDays,
  receita: Wallet,
  despesa: Wallet,
}

const ATIV_COR: Record<Atividade["tipo"], string> = {
  vacina: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
  vermifugo: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  cobertura: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400",
  evento: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
  receita: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
  despesa: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
}

function quando(data: string): string {
  const d = new Date(data + "T00:00:00")
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const diff = Math.round((hoje.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return "Hoje"
  if (diff === 1) return "Ontem"
  return formatarData(data)
}

export function Dashboard() {
  const { haras } = useAuth()
  const { equinos, fotos, videos, loading, reload } = useEquinosComFotos()
  const [vacinas, setVacinas] = useState<Awaited<ReturnType<typeof getVacinas>>>([])
  const [vermifugos, setVermifugos] = useState<Awaited<ReturnType<typeof getVermifugos>>>([])
  const [coberturas, setCoberturas] = useState<Cobertura[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  useEffect(() => {
    getVacinas().then(setVacinas)
    getVermifugos().then(setVermifugos)
    getCoberturas().then(setCoberturas)
    getEventos().then(setEventos)
    getTransacoes().then(setTransacoes)
  }, [equinos.length])

  const alertas = useMemo(() => calcularAlertas(vacinas, vermifugos, equinos), [vacinas, vermifugos, equinos])

  const recentes = useMemo(
    () => [...equinos].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3),
    [equinos],
  )

  const gestacoes = coberturas.filter((c) => c.status === "confirmada" || c.status === "coberta")
  const proximosEventos = useMemo(
    () => eventos.filter((e) => diasAte(e.data) >= 0).sort((a, b) => a.data.localeCompare(b.data)).slice(0, 4),
    [eventos],
  )

  /* Primeiro equino que tiver foto vira o destaque do hero */
  const destaque = useMemo(() => equinos.find((e) => fotos[e.id]) ?? null, [equinos, fotos])

  const nomeEquino = (id?: string) => (id ? (equinos.find((e) => e.id === id)?.nome ?? "—") : undefined)

  const mesAtual = hojeIso().slice(0, 7)
  const doMes = transacoes.filter((t) => t.data.slice(0, 7) === mesAtual)
  const receitasMes = doMes.filter((t) => t.tipo === "receita").reduce((s, t) => s + t.valor, 0)
  const despesasMes = doMes.filter((t) => t.tipo === "despesa").reduce((s, t) => s + t.valor, 0)
  const saldoMes = receitasMes - despesasMes

  const graficoMeses = useMemo<DadoMes[]>(() => {
    const hoje = new Date()
    const res: DadoMes[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const doMes = transacoes.filter((t) => t.data.slice(0, 7) === chave)
      const receitas = doMes.filter((t) => t.tipo === "receita").reduce((s, t) => s + t.valor, 0)
      const despesas = doMes.filter((t) => t.tipo === "despesa").reduce((s, t) => s + t.valor, 0)
      res.push({ data: d, receitas, despesas, saldo: receitas - despesas })
    }
    return res
  }, [transacoes])

  /* Feed: últimas ações registradas no haras */
  const atividades = useMemo<Atividade[]>(() => {
    const itens: Atividade[] = []
    for (const v of vacinas) {
      itens.push({
        id: `vac-${v.id}`,
        data: v.dataAplicacao,
        tipo: "vacina",
        titulo: `Vacina ${v.nome}`,
        subtitulo: nomeEquino(v.equinoId),
      })
    }
    for (const v of vermifugos) {
      itens.push({
        id: `verm-${v.id}`,
        data: v.dataAplicacao,
        tipo: "vermifugo",
        titulo: `Vermífugo ${v.produto}`,
        subtitulo: nomeEquino(v.equinoId),
      })
    }
    for (const c of coberturas) {
      itens.push({
        id: `cob-${c.id}`,
        data: c.dataCobertura,
        tipo: "cobertura",
        titulo: "Cobertura registrada",
        subtitulo: nomeEquino(c.femeaId),
      })
    }
    for (const ev of eventos) {
      const nome = nomeEquino(ev.equinoId)
      itens.push({
        id: `ev-${ev.id}`,
        data: ev.data,
        tipo: "evento",
        titulo: ev.titulo,
        subtitulo: nome ? `${TIPO_EVENTO_LABEL[ev.tipo]} · ${nome}` : TIPO_EVENTO_LABEL[ev.tipo],
      })
    }
    for (const t of transacoes) {
      itens.push({
        id: `tr-${t.id}`,
        data: t.data,
        tipo: t.tipo,
        titulo: t.descricao || t.categoria,
        subtitulo: t.categoria,
        valor: t.valor,
      })
    }
    return itens.sort((a, b) => b.data.localeCompare(a.data)).slice(0, 8)
  }, [vacinas, vermifugos, coberturas, eventos, transacoes, equinos])

  const ativos = equinos.filter((e) => e.status === "ativo").length

  const agora = new Date()
  const hora = agora.getHours()
  const saudacao = hora >= 5 && hora < 12 ? "Bom dia" : hora >= 12 && hora < 18 ? "Boa tarde" : "Boa noite"
  const dataHoje = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(agora)
  const dataHojeCap = dataHoje.charAt(0).toUpperCase() + dataHoje.slice(1)

  const kpis = [
    {
      label: "Equinos",
      valor: equinos.length,
      nota: `${ativos} ativos`,
      icon: HorseIcon,
      cor: "bg-emerald-400/20 text-emerald-300",
      destaque: false,
      moeda: false,
    },
    {
      label: "Gestações",
      valor: gestacoes.length,
      nota: "em andamento",
      icon: Heart,
      cor: "bg-rose-400/20 text-rose-300",
      destaque: false,
      moeda: false,
    },
    {
      label: "Alertas de saúde",
      valor: alertas.length,
      nota: alertas.length > 0 ? "precisam de atenção" : "tudo em dia",
      icon: Syringe,
      cor: alertas.length > 0 ? "bg-amber-400/20 text-amber-300" : "bg-emerald-400/20 text-emerald-300",
      destaque: alertas.length > 0,
      moeda: false,
    },
    {
      label: "Saldo do mês",
      valor: saldoMes,
      nota: `${formatarMoeda(receitasMes)} receitas`,
      icon: Wallet,
      cor: "bg-emerald-400/20 text-emerald-300",
      destaque: false,
      moeda: true,
    },
  ]

  const acoes = [
    {
      to: "/equinos/novo",
      label: "Novo equino",
      sub: "Cadastrar animal",
      icon: Plus,
      cor: "text-emerald-600 dark:text-emerald-400",
      fundo: "bg-emerald-100 dark:bg-emerald-900/40",
    },
    {
      to: "/reproducao",
      label: "Nova cobertura",
      sub: "Registrar monta",
      icon: Heart,
      cor: "text-rose-600 dark:text-rose-400",
      fundo: "bg-rose-100 dark:bg-rose-900/40",
    },
    {
      to: "/financeiro",
      label: "Nova transação",
      sub: "Receita ou despesa",
      icon: Wallet,
      cor: "text-amber-600 dark:text-amber-400",
      fundo: "bg-amber-100 dark:bg-amber-900/40",
    },
    {
      to: "/agenda",
      label: "Novo evento",
      sub: "Agendar compromisso",
      icon: CalendarPlus,
      cor: "text-violet-600 dark:text-violet-400",
      fundo: "bg-violet-100 dark:bg-violet-900/40",
    },
  ]

  const glass = "rounded-2xl border border-border/70 bg-background/70 shadow-sm backdrop-blur-xl"

  return (
    <div className="space-y-6 overflow-hidden">
      {/* Bolhas de luz no fundo — dão profundidade ao vidro dos cards */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 size-96 rounded-full bg-emerald-500/15 blur-3xl animate-[drift_22s_ease-in-out_infinite] dark:bg-emerald-400/10" />
        <div className="absolute -right-28 top-1/4 size-[26rem] rounded-full bg-[#d9b978]/20 blur-3xl animate-[drift_28s_ease-in-out_infinite_reverse] dark:bg-[#d9b978]/10" />
        <div className="absolute bottom-0 left-1/3 size-80 rounded-full bg-teal-400/10 blur-3xl animate-[drift_25s_ease-in-out_infinite] dark:bg-teal-300/5" />
      </div>

      {/* Hero — vidro líquido com relógio, destaque e KPIs */}
      <section className="relative overflow-hidden rounded-3xl border border-white/15 shadow-xl shadow-primary/10">
        <LiquidGlass className="min-h-[22rem]" baseColor={HERO_BASE_COLOR} amplitude={0.35} speed={0.15}>
          <div className="pointer-events-none absolute -right-28 -top-32 size-96 rounded-full bg-[#d9b978]/10 blur-3xl" />

          <div className="relative p-6 sm:p-9">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#d9b978]/90">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-[#d9b978]" />
                    {saudacao}
                  </span>
                  <span aria-hidden className="text-[#d9b978]/40">·</span>
                  <span>{dataHojeCap}</span>
                  <span aria-hidden className="text-[#d9b978]/40">·</span>
                  <RelogioVivo />
                </p>
                <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.08] tracking-tight text-[#f7f2e7] sm:text-[2.6rem]">
                  {haras?.nomeHaras || "Haras Cardoso"},{" "}
                  <span className="bg-gradient-to-r from-[#f2dcab] via-[#d9b978] to-[#b98d4e] bg-[length:200%_auto] bg-clip-text text-transparent animate-[shine_6s_ease-in-out_infinite]">
                    sob controle.
                  </span>
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/65">
                  Acompanhe seus equinos, a saúde em dia e tudo o que acontece no haras — do celular ou do computador.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to="/equinos/novo">
                    <Button size="lg" className="rounded-xl bg-[#f5efe2] text-[#143127] shadow-lg shadow-black/20 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#ece3cd]">
                      <Plus className="size-4" />
                      Cadastrar equino
                    </Button>
                  </Link>
                  <Link to="/saude">
                    <Button size="lg" className="rounded-xl border border-white/15 bg-white/5 text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10">
                      <Syringe className="size-4" />
                      Registrar vacina
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Cavalo em destaque — a foto real aparece quando existir */}
              <div className="relative hidden shrink-0 lg:block">
                <div className="absolute -bottom-3 -right-3 h-full w-full rounded-2xl border border-[#d9b978]/40" />
                <div className="relative flex h-60 w-72 flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] shadow-2xl shadow-black/30 backdrop-blur-sm">
                  {destaque ? (
                    <>
                      <img src={fotos[destaque.id]} alt={destaque.nome} className="h-full w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 pt-10">
                        <p className="font-display text-lg font-semibold text-white">{destaque.nome}</p>
                        <p className="text-xs text-white/70">{destaque.raca}</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2.5 p-6 text-center">
                      <HorseIcon className="size-14 text-[#d9b978]/50" />
                      <p className="font-display text-lg font-semibold text-white/90">
                        {equinos.length} {equinos.length === 1 ? "equino" : "equinos"} no plantel
                      </p>
                      <p className="text-xs leading-relaxed text-white/50">
                        Adicione uma foto ao equino e ele aparece aqui em destaque.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* KPIs com contagem animada */}
            <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 lg:grid-cols-4">
              {kpis.map((k) => (
                <div
                  key={k.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d9b978]/30 hover:bg-white/[0.08]"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", k.cor)}>
                      <k.icon className="size-3.5" />
                    </span>
                    <p className="truncate text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/50">{k.label}</p>
                  </div>
                  <p className={cn("mt-2 truncate font-display font-semibold", k.destaque ? "text-2xl text-[#e8c37f]" : "text-2xl text-white")}>
                    {k.moeda ? <CountUp valor={k.valor} formato={formatarMoeda} /> : <CountUp valor={k.valor} />}
                  </p>
                  <p className="truncate text-[11px] text-white/45">{k.nota}</p>
                </div>
              ))}
            </div>
          </div>
        </LiquidGlass>
      </section>

      {equinos.length === 0 && !loading ? (
        <section>
          <Card className="rounded-2xl">
            <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-700 text-white shadow-md">
                <HorseIcon className="size-8" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold">Comece cadastrando seu primeiro equino</h2>
                <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                  Cadastre nome, raça, pelagem, fotos, vídeos, pais e muito mais. Depois é só acompanhar a saúde e a rotina do haras.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/equinos/novo">
                  <Button size="lg" className="rounded-xl">
                    <Plus className="size-4" />
                    Cadastrar equino
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl"
                  onClick={async () => {
                    try {
                      toast.loading("Carregando demonstração completa...")
                      await carregarDadosExemplo(true)
                      await carregarDadosModulos(true)
                      toast.dismiss()
                      toast.success("Dados de exemplo carregados com sucesso!")
                      reload()
                    } catch (e) {
                      toast.dismiss()
                      toast.error("Erro: " + (e instanceof Error ? e.message : String(e)))
                    }
                  }}
                >
                  Carregar dados de exemplo
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : (
        <>
          {/* Ações rápidas */}
          <section>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {acoes.map((a, i) => (
                <AnimatedContent key={a.label} distance={18} duration={0.45} delay={i * 0.07} className="h-full">
                  <Link
                    to={a.to}
                    className="group flex h-full items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d9b978]/50 hover:shadow-lg hover:shadow-[#d9b978]/10"
                  >
                    <span
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                        a.fundo,
                        a.cor,
                      )}
                    >
                      <a.icon className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{a.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{a.sub}</span>
                    </span>
                  </Link>
                </AnimatedContent>
              ))}
            </div>
          </section>

          {/* Evolução financeira + Próximos eventos */}
          <section className="grid gap-5 lg:grid-cols-3">
            <Card className={cn(glass, "lg:col-span-2")}>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 font-display text-lg">
                  <TrendingUp className="size-4.5 text-primary" />
                  Evolução financeira
                </CardTitle>
                <Link to="/financeiro" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Ver tudo <ArrowRight className="size-3.5" />
                </Link>
              </CardHeader>
              <CardContent>
                <GraficoFinanceiro dados={graficoMeses} />
              </CardContent>
            </Card>

            <Card className={glass}>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 font-display text-lg">
                  <CalendarDays className="size-4.5 text-primary" />
                  Próximos eventos
                </CardTitle>
                <Link to="/agenda" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Ver tudo <ArrowRight className="size-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="space-y-2">
                {proximosEventos.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    Nada agendado nos próximos dias.
                  </p>
                ) : (
                  proximosEventos.map((ev) => {
                    const d = diasAte(ev.data)
                    return (
                      <div key={ev.id} className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/50 p-2.5 backdrop-blur-sm transition-colors hover:bg-background/80">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-base dark:bg-violet-900/40">
                          {TIPO_EVENTO_ICONE[ev.tipo]}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{ev.titulo}</p>
                          <p className="text-xs text-muted-foreground">{formatarData(ev.data)}</p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                            d === 0
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                              : "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
                          )}
                        >
                          {d === 0 ? "Hoje" : d === 1 ? "Amanhã" : `Em ${d}d`}
                        </span>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </section>

          {/* Atividades recentes */}
          <section>
            <Card className={glass}>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 font-display text-lg">
                  <Sparkles className="size-4.5 text-primary" />
                  Atividades recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {atividades.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    Nenhuma atividade registrada ainda — as últimas ações do haras aparecem aqui.
                  </p>
                ) : (
                  <div className="space-y-0.5">
                    {atividades.map((a) => {
                      const Icone = ATIV_ICONE[a.tipo]
                      return (
                        <div
                          key={a.id}
                          className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/60"
                        >
                          <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", ATIV_COR[a.tipo])}>
                            <Icone className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{a.titulo}</p>
                            {a.subtitulo && <p className="truncate text-xs text-muted-foreground">{a.subtitulo}</p>}
                          </div>
                          {a.valor != null && (
                            <span
                              className={cn(
                                "shrink-0 text-sm font-semibold tabular-nums",
                                a.tipo === "receita" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400",
                              )}
                            >
                              {a.tipo === "receita" ? "+" : "−"}
                              {formatarMoeda(a.valor)}
                            </span>
                          )}
                          <span className="w-14 shrink-0 text-right text-xs text-muted-foreground">{quando(a.data)}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Atenção à saúde */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Atenção à saúde</h2>
              <Link to="/saude" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Ver tudo <ArrowRight className="size-3.5" />
              </Link>
            </div>
            {alertas.length === 0 ? (
              <Card className="rounded-2xl border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-900/20">
                <CardContent className="flex items-center gap-3 p-4">
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm text-emerald-800 dark:text-emerald-200">
                    Nenhum alerta: vacinas e vermífugos estão em dia.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {alertas.slice(0, 4).map((a) => {
                  const vencido = a.dias < 0
                  const Icone = a.tipo === "vacina" ? Syringe : Worm
                  return (
                    <Card key={`${a.tipo}-${a.id}`} className={cn(glass, "transition-all duration-200 hover:-translate-y-0.5")}>
                      <CardContent className="flex items-center gap-3 p-4">
                        <div
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-xl",
                            vencido
                              ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
                          )}
                        >
                          <Icone className="size-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {a.titulo} <span className="text-muted-foreground">· {a.equinoNome}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {a.tipo === "vacina" ? "Vacina" : "Vermífugo"} — próxima dose {formatarData(a.dataProxima)}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                            vencido
                              ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
                          )}
                        >
                          {vencido ? `Atrasada ${Math.abs(a.dias)}d` : `Em ${a.dias}d`}
                        </span>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>

          {/* Equinos recentes */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Equinos recentes</h2>
              <Link to="/equinos" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Ver todos <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recentes.map((e, i) => (
                <AnimatedContent key={e.id} distance={24} duration={0.5} delay={i * 0.05} className="h-full">
                  <HorseCard equino={e} fotoUrl={fotos[e.id]} temVideo={videos[e.id]} />
                </AnimatedContent>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
