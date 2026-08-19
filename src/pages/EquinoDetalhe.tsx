import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Award,
  CalendarDays,
  Camera,
  Clapperboard,
  HeartPulse,
  Maximize2,
  Pencil,
  Plus,
  Printer,
  Scale,
  Syringe,
  Trash2,
  TrendingUp,
  Worm,
} from "lucide-react"
import AnimatedContent from "@/components/bits/AnimatedContent/AnimatedContent"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { HorseAvatar } from "@/components/horse/HorseAvatar"
import { PhotoLightbox } from "@/components/horse/PhotoLightbox"
import { PedigreeTree } from "@/components/horse/PedigreeTree"
import { HorsePrintSheet } from "@/components/horse/HorsePrintSheet"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { RecordDialog } from "@/components/saude/RecordDialog"
import {
  calcularIdade,
  diasAte,
  excluirEquino,
  excluirFerrageamento,
  excluirMedida,
  excluirVacina,
  excluirVermifugo,
  formatarData,
  getAllEquinos,
  getCoberturasFemea,
  getEquino,
  getEventos,
  getFerrageamentosEquino,
  getFotosEquino,
  getMedidasEquino,
  getVacinasEquino,
  getVermifugosEquino,
  getVideosEquino,
  hojeIso,
  obterGenealogia3Geracoes,
  salvarFerrageamento,
  salvarMedida,
  salvarTransacao,
  somarDias,
} from "@/lib/db"
import { useFotoUrls, useVideoUrls } from "@/lib/hooks"
import { corPelagem, temaPelagem } from "@/lib/pelagens"
import { situacaoSaude } from "@/lib/saude"
import {
  DIAS_PADRAO_RETORNO_CASCO,
  SEXO_LABEL,
  STATUS_COBERTURA_LABEL,
  STATUS_LABEL,
  TIPO_EVENTO_LABEL,
  TIPO_SERVICO_CASCO_LABEL,
  type Cobertura,
  type Equino,
  type Evento,
  type FotoEquino,
  type MedidaCrescimento,
  type RegistroFerrageamento,
  type TipoServicoCasco,
  type Vacina,
  type Vermifugo,
  type VideoEquino,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ItemFicha {
  rotulo: string
  valor: string
}

export function EquinoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [equino, setEquino] = useState<Equino | undefined>()
  const [equinos, setEquinos] = useState<Equino[]>([])
  const [fotos, setFotos] = useState<FotoEquino[]>([])
  const [videos, setVideos] = useState<VideoEquino[]>([])
  const [vacinas, setVacinas] = useState<Vacina[]>([])
  const [vermifugos, setVermifugos] = useState<Vermifugo[]>([])
  const [ferrageamentos, setFerrageamentos] = useState<RegistroFerrageamento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [naoEncontrado, setNaoEncontrado] = useState(false)
  const [fotoAtiva, setFotoAtiva] = useState(0)
  const [medidas, setMedidas] = useState<MedidaCrescimento[]>([])
  const [coberturas, setCoberturas] = useState<Cobertura[]>([])
  const [eventosEquino, setEventosEquino] = useState<Evento[]>([])
  const [filtroLinha, setFiltroLinha] = useState<"todos" | "vacina" | "vermifugo" | "ferrageamento" | "medida" | "cobertura" | "evento">("todos")
  const [dialogMedida, setDialogMedida] = useState(false)
  const [novaMedida, setNovaMedida] = useState({ data: hojeIso(), pesoKg: "", alturaCernelha: "", observacoes: "" })
  
  // Dialog de Ferrageamento
  const [dialogFerrageamento, setDialogFerrageamento] = useState(false)
  const [novoFerrageamento, setNovoFerrageamento] = useState<{
    tipo: TipoServicoCasco
    dataServico: string
    dataProximo: string
    ferrador: string
    valor: string
    observacoes: string
    lancarFinanceiro: boolean
  }>({
    tipo: "casqueamento",
    dataServico: hojeIso(),
    dataProximo: somarDias(hojeIso(), DIAS_PADRAO_RETORNO_CASCO),
    ferrador: "",
    valor: "",
    observacoes: "",
    lancarFinanceiro: true,
  })

  const [dialog, setDialog] = useState<{
    tipo: "vacina" | "vermifugo"
    registro: Vacina | Vermifugo | null
  } | null>(null)
  const [excluirRegistro, setExcluirRegistro] = useState<{
    tipo: "vacina" | "vermifugo" | "ferrageamento"
    id: string
  } | null>(null)
  const [confirmarExclusao, setConfirmarExclusao] = useState(false)
  const [lightboxAberto, setLightboxAberto] = useState(false)
  const [fotoLightbox, setFotoLightbox] = useState(0)

  const urls = useFotoUrls(fotos)
  const urlsVideos = useVideoUrls(videos)

  const carregar = useCallback(async () => {
    if (!id) return
    const e = await getEquino(id)
    if (!e) {
      setNaoEncontrado(true)
      setCarregando(false)
      return
    }
    setEquino(e)
    setFotos(await getFotosEquino(id))
    setVideos(await getVideosEquino(id))
    setVacinas(await getVacinasEquino(id))
    setVermifugos(await getVermifugosEquino(id))
    setFerrageamentos(await getFerrageamentosEquino(id))
    setMedidas(await getMedidasEquino(id))
    setCoberturas(await getCoberturasFemea(id))
    setEventosEquino((await getEventos()).filter((ev) => ev.equinoId === id))
    setEquinos(await getAllEquinos())
    setCarregando(false)
  }, [id])


  useEffect(() => {
    setCarregando(true)
    carregar()
  }, [carregar])

  const genealogia = useMemo(() => {
    if (!equino) return null
    return obterGenealogia3Geracoes(equino, equinos)
  }, [equino, equinos])

  const linhaTempo = useMemo(() => {
    const itens: ItemLinha[] = [
      ...vacinas.map((v) => ({
        id: v.id,
        data: v.dataAplicacao,
        tipo: "vacina" as const,
        titulo: v.nome,
        detalhe: v.dataProxima ? `próxima dose ${formatarData(v.dataProxima)}` : v.veterinario,
      })),
      ...vermifugos.map((v) => ({
        id: v.id,
        data: v.dataAplicacao,
        tipo: "vermifugo" as const,
        titulo: v.produto,
        detalhe: v.dataProxima ? `próxima dose ${formatarData(v.dataProxima)}` : undefined,
      })),
      ...ferrageamentos.map((f) => ({
        id: f.id,
        data: f.dataServico,
        tipo: "ferrageamento" as const,
        titulo: TIPO_SERVICO_CASCO_LABEL[f.tipo],
        detalhe: [
          f.ferrador ? `Ferrador: ${f.ferrador}` : null,
          f.dataProximo ? `Retorno previsto ${formatarData(f.dataProximo)}` : null,
        ]
          .filter(Boolean)
          .join(" · ") || undefined,
      })),
      ...medidas.map((m) => ({
        id: m.id,
        data: m.data,
        tipo: "medida" as const,
        titulo: "Medição",
        detalhe: [m.pesoKg != null ? `${m.pesoKg} kg` : null, m.alturaCernelha != null ? `${m.alturaCernelha.toLocaleString("pt-BR")} m` : null]
          .filter(Boolean)
          .join(" · ") || undefined,
      })),
      ...coberturas.map((c) => ({
        id: c.id,
        data: c.dataCobertura,
        tipo: "cobertura" as const,
        titulo: `Cobertura com ${equinos.find((e) => e.id === c.machoId)?.nome ?? "—"}`,
        detalhe: STATUS_COBERTURA_LABEL[c.status],
      })),
      ...eventosEquino.map((ev) => ({
        id: ev.id,
        data: ev.data,
        tipo: "evento" as const,
        titulo: ev.titulo,
        detalhe: TIPO_EVENTO_LABEL[ev.tipo],
      })),
    ]
    return itens.sort((a, b) => b.data.localeCompare(a.data))
  }, [vacinas, vermifugos, ferrageamentos, medidas, coberturas, eventosEquino, equinos])

  const linhaFiltrada = filtroLinha === "todos" ? linhaTempo : linhaTempo.filter((i) => i.tipo === filtroLinha)

  if (naoEncontrado) {
    return (
      <div className="py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">Equino não encontrado</h1>
        <Link to="/equinos" className="mt-2 inline-block text-sm text-primary hover:underline">
          Voltar aos equinos
        </Link>
      </div>
    )
  }

  if (carregando || !equino || !genealogia) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    )
  }

  const pai = equinos.find((e) => e.id === equino.paiId)
  const mae = equinos.find((e) => e.id === equino.maeId)
  const filhos = equinos.filter((e) => e.paiId === id || e.maeId === id)

  async function salvarMedidaAtual() {
    if (!equino) return
    const peso = parseFloat(novaMedida.pesoKg.replace(",", "."))
    const altura = parseFloat(novaMedida.alturaCernelha.replace(",", "."))
    if (!novaMedida.data || (isNaN(peso) && isNaN(altura))) {
      toast.error("Informe a data e ao menos um valor (peso ou altura)")
      return
    }
    await salvarMedida({
      id: crypto.randomUUID(),
      equinoId: equino.id,
      data: novaMedida.data,
      pesoKg: isNaN(peso) ? undefined : peso,
      alturaCernelha: isNaN(altura) ? undefined : altura,
      observacoes: novaMedida.observacoes.trim() || undefined,
      createdAt: new Date().toISOString(),
    })
    toast.success("Medição registrada")
    setDialogMedida(false)
    setNovaMedida({ data: hojeIso(), pesoKg: "", alturaCernelha: "", observacoes: "" })
    carregar()
  }

  async function salvarFerrageamentoAtual() {
    if (!equino) return
    if (!novoFerrageamento.dataServico) {
      toast.error("Informe a data do serviço")
      return
    }

    const valorNum = novoFerrageamento.valor ? parseFloat(novoFerrageamento.valor.replace(",", ".")) : undefined

    await salvarFerrageamento({
      id: crypto.randomUUID(),
      equinoId: equino.id,
      tipo: novoFerrageamento.tipo,
      dataServico: novoFerrageamento.dataServico,
      dataProximo: novoFerrageamento.dataProximo || undefined,
      ferrador: novoFerrageamento.ferrador.trim() || undefined,
      valor: valorNum && !isNaN(valorNum) ? valorNum : undefined,
      observacoes: novoFerrageamento.observacoes.trim() || undefined,
      createdAt: new Date().toISOString(),
    })

    // Lançamento automático no Financeiro se configurado
    if (novoFerrageamento.lancarFinanceiro && valorNum && !isNaN(valorNum) && valorNum > 0) {
      await salvarTransacao({
        id: crypto.randomUUID(),
        tipo: "despesa",
        categoria: "Ferradura",
        descricao: `${TIPO_SERVICO_CASCO_LABEL[novoFerrageamento.tipo]} - ${equino.nome}`,
        valor: valorNum,
        data: novoFerrageamento.dataServico,
        equinoId: equino.id,
        observacoes: novoFerrageamento.ferrador ? `Profissional/Ferrador: ${novoFerrageamento.ferrador}` : undefined,
        createdAt: new Date().toISOString(),
      })
    }

    toast.success("Serviço podológico registrado com sucesso!")
    setDialogFerrageamento(false)
    setNovoFerrageamento({
      tipo: "casqueamento",
      dataServico: hojeIso(),
      dataProximo: somarDias(hojeIso(), DIAS_PADRAO_RETORNO_CASCO),
      ferrador: "",
      valor: "",
      observacoes: "",
      lancarFinanceiro: true,
    })
    carregar()
  }

  const itensFicha: ItemFicha[] = [
    { rotulo: "Nome", valor: equino.nome },
    { rotulo: "Apelido", valor: equino.apelido ?? "—" },
    { rotulo: "Sexo", valor: SEXO_LABEL[equino.sexo] },
    { rotulo: "Nascimento", valor: formatarData(equino.nascimento) },
    { rotulo: "Raça", valor: equino.raca },
    { rotulo: "Pelagem", valor: equino.pelagem },
    { rotulo: "Registro", valor: equino.registro ?? "—" },
    { rotulo: "Microchip", valor: equino.microchip ?? "—" },
    { rotulo: "Origem", valor: equino.origem ?? "—" },
    { rotulo: "Altura", valor: equino.altura ?? "—" },
    { rotulo: "Temperamento", valor: equino.temperamento ?? "—" },
    { rotulo: "Status", valor: STATUS_LABEL[equino.status] },
  ]

  async function confirmarExclusaoRegistro() {
    if (!excluirRegistro) return
    if (excluirRegistro.tipo === "vacina") await excluirVacina(excluirRegistro.id)
    else if (excluirRegistro.tipo === "vermifugo") await excluirVermifugo(excluirRegistro.id)
    else if (excluirRegistro.tipo === "ferrageamento") await excluirFerrageamento(excluirRegistro.id)
    toast.success("Registro excluído")
    setExcluirRegistro(null)
    carregar()
  }

  async function excluirEquinoAtual() {
    if (!id) return
    await excluirEquino(id)
    toast.success("Equino excluído")
    navigate("/equinos")
  }

  return (
    <div className="space-y-8">
      <Link
        to="/equinos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground print:hidden"
      >
        <ArrowLeft className="size-3.5" />
        Voltar aos equinos
      </Link>

      {/* Capa */}
      <div className="relative overflow-hidden rounded-3xl border border-border">
        {urls.length > 0 ? (
          <>
            <img
              src={urls[fotoAtiva]}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full scale-125 object-cover blur-lg"
            />
            <div className="absolute inset-0 bg-black/60" />
          </>
        ) : (
          <div className={cn("absolute inset-0 bg-gradient-to-br", temaPelagem(equino.pelagem))} />
        )}
        <div className="relative flex flex-wrap items-end justify-between gap-4 p-6 sm:p-8">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/70">
              {equino.raca} · {equino.pelagem}
              {equino.registro && ` · ${equino.registro}`}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {equino.nome}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-white/15 text-white backdrop-blur-sm">{SEXO_LABEL[equino.sexo]}</Badge>
              <Badge className="rounded-full bg-white/15 text-white backdrop-blur-sm">{STATUS_LABEL[equino.status]}</Badge>
              {equino.nascimento && (
                <Badge className="rounded-full bg-amber-400/25 text-amber-100 backdrop-blur-sm">
                  {calcularIdade(equino.nascimento)}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5 print:hidden">
            <Button
              variant="secondary"
              className="rounded-xl bg-white/90 text-stone-900 hover:bg-white"
              onClick={() => window.print()}
            >
              <Printer className="size-4" />
              Imprimir ficha
            </Button>
            <Link to={`/equinos/${equino.id}/editar`}>
              <Button className="rounded-xl bg-black/25 text-white backdrop-blur-sm hover:bg-black/40">
                <Pencil className="size-4" />
                Editar ficha
              </Button>
            </Link>
            <Button
              variant="outline"
              className="rounded-xl border-white/25 bg-black/25 text-white backdrop-blur-sm hover:bg-black/40 hover:text-white"
              onClick={() => setConfirmarExclusao(true)}
            >
              <Trash2 className="size-4" />
              Excluir
            </Button>
          </div>
        </div>
      </div>

      <AnimatedContent distance={20} duration={0.5}>
        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          {/* Mídia */}
          <div className="space-y-4">
            <button
              type="button"
              className="group relative block w-full overflow-hidden rounded-2xl border border-border focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
              onClick={() => {
                setFotoLightbox(fotoAtiva)
                setLightboxAberto(true)
              }}
              aria-label="Ampliar foto"
            >
              <HorseAvatar nome={equino.nome} fotoUrl={urls[fotoAtiva]} className="aspect-[16/10]" />
              <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <span className="flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                  <Maximize2 className="size-3.5" />
                  Ampliar
                </span>
              </div>
              {urls.length > 1 && (
                <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  <Camera className="size-3.5" />
                  {fotoAtiva + 1} / {urls.length}
                </span>
              )}
            </button>
            {fotos[fotoAtiva]?.legenda && (
              <p className="-mt-1 px-1 text-center text-xs text-muted-foreground">
                {fotos[fotoAtiva].legenda}
              </p>
            )}
            {urls.length > 1 && (
              <div className="grid grid-cols-6 gap-2">
                {urls.map((u, i) => (
                  <button
                    key={i}
                    onClick={() => setFotoAtiva(i)}
                    className={cn(
                      "overflow-hidden rounded-lg border-2 transition-all",
                      i === fotoAtiva
                        ? "border-primary ring-2 ring-primary/25"
                        : "border-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    <img src={u} alt={`Foto ${i + 1}`} className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {videos.length > 0 && (
              <Card className="overflow-hidden rounded-2xl">
                <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Clapperboard className="size-4" />
                  </div>
                  <CardTitle className="font-display text-lg">
                    Vídeo{urlsVideos.length > 1 ? "s" : ""} do {equino.nome.split(" ")[0]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {urlsVideos.map((v, i) => (
                    <video key={i} src={v} controls playsInline className="aspect-video w-full rounded-xl bg-black" />
                  ))}
                  <p className="text-xs text-muted-foreground">
                    Veja como {equino.nome.split(" ")[0]} se movimenta e se comporta.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Ficha */}
          <div className="space-y-4">
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg">Ficha completa</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
                {itensFicha.map((item) => (
                  <div key={item.rotulo} className="border-b border-border/50 pb-2 last:border-0">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{item.rotulo}</p>
                    <p className="mt-0.5 text-sm font-semibold">{item.valor}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {equino.observacoes && (
              <Card className="rounded-2xl border-amber-200/70 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-900/10">
                <CardContent className="p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400">Observações</p>
                  <p className="mt-1 text-sm">{equino.observacoes}</p>
                </CardContent>
              </Card>
            )}

            {/* Genealogia / Pedigree Resumido */}
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg">Genealogia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { rotulo: "Pai", equino: pai, icone: "♂" },
                  { rotulo: "Mãe", equino: mae, icone: "♀" },
                ].map((item) => (
                  <div key={item.rotulo} className="flex items-center gap-3">
                    <span className="w-14 shrink-0 text-sm font-medium text-muted-foreground">{item.rotulo}</span>
                    {item.equino ? (
                      <Link
                        to={`/equinos/${item.equino.id}`}
                        className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-border p-2 transition-all hover:border-primary/50 hover:bg-muted/40"
                      >
                        <HorseAvatar nome={item.equino.nome} className="size-10 shrink-0 rounded-lg" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold group-hover:text-primary">{item.equino.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.equino.raca} · {item.equino.pelagem}
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <span className="flex flex-1 items-center gap-2 rounded-xl border border-dashed border-border p-2.5 text-sm text-muted-foreground">
                        Não informado
                      </span>
                    )}
                  </div>
                ))}
                {filhos.length > 0 && (
                  <div className="border-t border-border pt-3">
                    <p className="mb-2 text-sm font-medium text-muted-foreground">Filhos ({filhos.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {filhos.map((f) => (
                        <Link
                          key={f.id}
                          to={`/equinos/${f.id}`}
                          className="flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-3 text-sm font-medium transition-colors hover:border-primary/50 hover:text-primary"
                        >
                          <HorseAvatar nome={f.nome} className="size-6 rounded-full" />
                          {f.nome}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AnimatedContent>

      {/* Árvore Genealógica Completa (Pedigree 3 Gerações) */}
      <Card className="rounded-2xl overflow-hidden print:hidden">
        <CardContent className="p-6">
          <PedigreeTree genealogia={genealogia} />
        </CardContent>
      </Card>

      {/* Casqueamento e Ferrageamento (Podologia) */}
      <Card className="rounded-2xl">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Award className="size-4.5 text-[#8c6d3f]" />
              Controle Podológico (Cascos & Ferraduras)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Histórico de casqueamento, ferraduras, ferradores e retornos previstos a cada 45 dias.
            </p>
          </div>
          <Button
            size="sm"
            className="rounded-lg bg-[#143129] text-[#d9b978] hover:bg-[#143129]/90"
            onClick={() => setDialogFerrageamento(true)}
          >
            <Plus className="size-3.5" />
            Novo serviço de casco
          </Button>
        </CardHeader>
        <CardContent>
          {ferrageamentos.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nenhum registro de casqueamento ou ferrageamento registrado ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {ferrageamentos.map((f) => {
                const diasRest = f.dataProximo ? diasAte(f.dataProximo) : null
                return (
                  <div
                    key={f.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3.5 transition-colors hover:bg-muted/30"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {TIPO_SERVICO_CASCO_LABEL[f.tipo]}
                        </span>
                        {f.valor != null && f.valor > 0 && (
                          <Badge variant="secondary" className="text-xs font-mono">
                            {f.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Realizado em {formatarData(f.dataServico)}
                        {f.ferrador && ` · Ferrador: ${f.ferrador}`}
                        {f.dataProximo && ` · Retorno previsto: ${formatarData(f.dataProximo)}`}
                      </p>
                      {f.observacoes && (
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 italic">
                          "{f.observacoes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {diasRest != null && (
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-medium",
                            diasRest < 0
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                              : diasRest <= 10
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
                          )}
                        >
                          {diasRest < 0
                            ? `Atrasado ${Math.abs(diasRest)}d`
                            : diasRest === 0
                            ? "Vence hoje"
                            : `Retorno em ${diasRest}d`}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Excluir serviço podológico"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setExcluirRegistro({ tipo: "ferrageamento", id: f.id })}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saúde */}
      <Card className="rounded-2xl">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <HeartPulse className="size-4.5 text-primary" />
            Saúde
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" className="rounded-lg" onClick={() => setDialog({ tipo: "vacina", registro: null })}>
              <Syringe className="size-3.5" />
              Vacina
            </Button>
            <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setDialog({ tipo: "vermifugo", registro: null })}>
              <Plus className="size-3.5" />
              Vermífugo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vacinas">
            <TabsList className="rounded-lg">
              <TabsTrigger value="vacinas">Vacinas ({vacinas.length})</TabsTrigger>
              <TabsTrigger value="vermifugos">Vermífugos ({vermifugos.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="vacinas" className="mt-4 space-y-2">
              {vacinas.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Nenhuma vacina registrada ainda.
                </p>
              ) : (
                vacinas.map((v) => (
                  <RegistroRow
                    key={v.id}
                    titulo={v.nome}
                    data={v.dataAplicacao}
                    proxima={v.dataProxima}
                    extra={v.veterinario}
                    aoEditar={() => setDialog({ tipo: "vacina", registro: v })}
                    aoExcluir={() => setExcluirRegistro({ tipo: "vacina", id: v.id })}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="vermifugos" className="mt-4 space-y-2">
              {vermifugos.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Nenhuma vermifugação registrada ainda.
                </p>
              ) : (
                vermifugos.map((v) => (
                  <RegistroRow
                    key={v.id}
                    titulo={v.produto}
                    data={v.dataAplicacao}
                    proxima={v.dataProxima}
                    aoEditar={() => setDialog({ tipo: "vermifugo", registro: v })}
                    aoExcluir={() => setExcluirRegistro({ tipo: "vermifugo", id: v.id })}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Crescimento */}
      <Card className="rounded-2xl print:break-inside-avoid">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <TrendingUp className="size-4.5 text-primary" />
            Crescimento
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="rounded-lg print:hidden"
            onClick={() => setDialogMedida(true)}
          >
            <Plus className="size-3.5" />
            Registrar medição
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          {medidas.length >= 2 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <GraficoCrescimento
                medidas={medidas}
                campo="pesoKg"
                rotulo="Peso (kg)"
                cor={corPelagem(equino.pelagem)}
              />
              <GraficoCrescimento
                medidas={medidas}
                campo="alturaCernelha"
                rotulo="Altura na cernelha (m)"
                cor="#c9a45c"
              />
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border text-center">
              <p className="max-w-xs px-4 text-xs text-muted-foreground">
                Registre o peso e a altura ao longo do tempo para acompanhar a evolução do {equino.nome.split(" ")[0]} em gráficos.
              </p>
            </div>
          )}
          {medidas.length > 0 && (
            <div className="space-y-2">
              {[...medidas].reverse().map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Scale className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{formatarData(m.data)}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.pesoKg != null && `${m.pesoKg} kg`}
                      {m.pesoKg != null && m.alturaCernelha != null && " · "}
                      {m.alturaCernelha != null && `${m.alturaCernelha.toLocaleString("pt-BR")} m`}
                      {m.observacoes && ` · ${m.observacoes}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Excluir medição"
                    className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive print:hidden"
                    onClick={async () => {
                      await excluirMedida(m.id)
                      toast.success("Medição excluída")
                      carregar()
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Linha do tempo */}
      <Card className="rounded-2xl print:break-inside-avoid">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <CalendarDays className="size-4.5 text-primary" />
            Linha do tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-wrap gap-1.5 print:hidden">
            {(
              [
                ["todos", "Tudo"],
                ["vacina", "Vacinas"],
                ["vermifugo", "Vermífugos"],
                ["ferrageamento", "Cascos / Ferraduras"],
                ["medida", "Medições"],
                ["cobertura", "Reprodução"],
                ["evento", "Eventos"],
              ] as const
            ).map(([valor, rotulo]) => (
              <button
                key={valor}
                type="button"
                onClick={() => setFiltroLinha(valor)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  filtroLinha === valor
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {rotulo}
              </button>
            ))}
          </div>
          {linhaFiltrada.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nada por aqui ainda — registros de saúde, ferrageamento, medições, coberturas e eventos aparecem nesta linha do tempo.
            </p>
          ) : (
            <div className="relative pl-5">
              <div aria-hidden className="absolute bottom-2 left-[9px] top-2 w-px bg-border" />
              <div className="space-y-0">
                {linhaFiltrada.map((item) => (
                  <ItemLinha key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ficha Oficial para Impressão / PDF */}
      <HorsePrintSheet
        equino={equino}
        fotoPrincipalUrl={urls[fotoAtiva]}
        genealogia={genealogia}
        vacinas={vacinas}
        vermifugos={vermifugos}
        ferrageamentos={ferrageamentos}
        medidas={medidas}
        idadeTexto={equino.nascimento ? calcularIdade(equino.nascimento) : "—"}
      />

      <PhotoLightbox
        aberto={lightboxAberto}
        fotos={fotos}
        urls={urls}
        indice={fotoLightbox}
        onFechar={() => setLightboxAberto(false)}
        onMudarIndice={setFotoLightbox}
        onRecarregar={carregar}
      />

      <RecordDialog
        open={dialog !== null}
        onOpenChange={(o) => !o && setDialog(null)}
        tipo={dialog?.tipo ?? "vacina"}
        equinos={equinos}
        equinoInicialId={equino.id}
        registro={dialog?.registro ?? null}
        onSalvo={carregar}
      />

      <ConfirmDialog
        open={excluirRegistro !== null}
        onOpenChange={(o) => !o && setExcluirRegistro(null)}
        titulo="Excluir registro?"
        descricao="Este registro será removido definitivamente."
        confirmText="Excluir"
        onConfirm={confirmarExclusaoRegistro}
      />

      <ConfirmDialog
        open={confirmarExclusao}
        onOpenChange={setConfirmarExclusao}
        titulo="Excluir equino?"
        descricao="Esta ação remove o equino, as fotos, os vídeos e todos os registros associados. Não pode ser desfeita."
        confirmText="Excluir"
        onConfirm={excluirEquinoAtual}
      />

      {/* Diálogo de Medição */}
      <Dialog open={dialogMedida} onOpenChange={setDialogMedida}>
        <DialogContent className="rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Registrar medição</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="medida-data">Data</Label>
              <Input
                id="medida-data"
                type="date"
                value={novaMedida.data}
                onChange={(e) => setNovaMedida({ ...novaMedida, data: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="medida-peso">Peso (kg)</Label>
                <Input
                  id="medida-peso"
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  placeholder="Ex.: 420"
                  value={novaMedida.pesoKg}
                  onChange={(e) => setNovaMedida({ ...novaMedida, pesoKg: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="medida-altura">Altura na cernelha (m)</Label>
                <Input
                  id="medida-altura"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="Ex.: 1,55"
                  value={novaMedida.alturaCernelha}
                  onChange={(e) => setNovaMedida({ ...novaMedida, alturaCernelha: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="medida-obs">Observações</Label>
              <Textarea
                id="medida-obs"
                rows={2}
                value={novaMedida.observacoes}
                onChange={(e) => setNovaMedida({ ...novaMedida, observacoes: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogMedida(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarMedidaAtual}>Salvar medição</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Casqueamento / Ferrageamento */}
      <Dialog open={dialogFerrageamento} onOpenChange={setDialogFerrageamento}>
        <DialogContent className="rounded-2xl sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Award className="size-5 text-[#8c6d3f]" />
              Registrar Serviço de Casco / Ferrageamento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ferro-tipo">Tipo de Serviço</Label>
              <Select
                value={novoFerrageamento.tipo}
                onValueChange={(val: TipoServicoCasco) => setNovoFerrageamento({ ...novoFerrageamento, tipo: val })}
              >
                <SelectTrigger id="ferro-tipo" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casqueamento">Apenas Casqueamento</SelectItem>
                  <SelectItem value="ferradura_ferro">Ferradura de Ferro</SelectItem>
                  <SelectItem value="ferradura_aluminio">Ferradura de Alumínio</SelectItem>
                  <SelectItem value="ortopedica">Ferradura Ortopédica / Terapêutica</SelectItem>
                  <SelectItem value="outro">Outro serviço podológico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ferro-data">Data do Serviço</Label>
                <Input
                  id="ferro-data"
                  type="date"
                  value={novoFerrageamento.dataServico}
                  onChange={(e) => {
                    const dt = e.target.value
                    setNovoFerrageamento({
                      ...novoFerrageamento,
                      dataServico: dt,
                      dataProximo: dt ? somarDias(dt, DIAS_PADRAO_RETORNO_CASCO) : novoFerrageamento.dataProximo,
                    })
                  }}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="ferro-proximo">Retorno Previsto (+45d)</Label>
                <Input
                  id="ferro-proximo"
                  type="date"
                  value={novoFerrageamento.dataProximo}
                  onChange={(e) => setNovoFerrageamento({ ...novoFerrageamento, dataProximo: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ferro-prof">Ferrador / Profissional</Label>
                <Input
                  id="ferro-prof"
                  placeholder="Ex.: Mestre Antônio"
                  value={novoFerrageamento.ferrador}
                  onChange={(e) => setNovoFerrageamento({ ...novoFerrageamento, ferrador: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="ferro-valor">Custo do Serviço (R$)</Label>
                <Input
                  id="ferro-valor"
                  type="number"
                  step="0.01"
                  placeholder="Ex.: 150,00"
                  value={novoFerrageamento.valor}
                  onChange={(e) => setNovoFerrageamento({ ...novoFerrageamento, valor: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800/60 text-xs">
              <input
                type="checkbox"
                id="ferro-lancar-fin"
                checked={novoFerrageamento.lancarFinanceiro}
                onChange={(e) => setNovoFerrageamento({ ...novoFerrageamento, lancarFinanceiro: e.target.checked })}
                className="rounded border-stone-300 text-[#143129] focus:ring-[#143129]"
              />
              <Label htmlFor="ferro-lancar-fin" className="cursor-pointer text-stone-700 dark:text-stone-300">
                Lançar despesa automaticamente no Financeiro vinculada a este animal
              </Label>
            </div>

            <div>
              <Label htmlFor="ferro-obs">Observações do Casco</Label>
              <Textarea
                id="ferro-obs"
                rows={2}
                placeholder="Ex.: Casco dianteiro esquerdo corrigido, colocado ferradura com palmilha..."
                value={novoFerrageamento.observacoes}
                onChange={(e) => setNovoFerrageamento({ ...novoFerrageamento, observacoes: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogFerrageamento(false)}>
              Cancelar
            </Button>
            <Button className="bg-[#143129] text-[#d9b978] hover:bg-[#143129]/90" onClick={salvarFerrageamentoAtual}>
              Salvar Registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ItemLinha {
  id: string
  data: string
  tipo: "vacina" | "vermifugo" | "ferrageamento" | "medida" | "cobertura" | "evento"
  titulo: string
  detalhe?: string
}

function ItemLinha({ item }: { item: ItemLinha }) {
  const config: Record<ItemLinha["tipo"], { rotulo: string; cor: string; icone: ReactNode }> = {
    vacina: { rotulo: "Vacina", cor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", icone: <Syringe className="size-3.5" /> },
    vermifugo: { rotulo: "Vermífugo", cor: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", icone: <Worm className="size-3.5" /> },
    ferrageamento: { rotulo: "Casco / Ferradura", cor: "bg-[#d9b978]/20 text-[#8c6d3f] dark:bg-[#d9b978]/10 dark:text-[#d9b978]", icone: <Award className="size-3.5" /> },
    medida: { rotulo: "Medição", cor: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300", icone: <Scale className="size-3.5" /> },
    cobertura: { rotulo: "Reprodução", cor: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300", icone: <HeartPulse className="size-3.5" /> },
    evento: { rotulo: "Evento", cor: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300", icone: <CalendarDays className="size-3.5" /> },
  }
  const c = config[item.tipo]
  return (
    <div className="relative pb-5 pl-7 last:pb-0">
      <span className={cn("absolute left-0 top-0.5 flex size-[18px] items-center justify-center rounded-full ring-4 ring-background", c.cor)}>
        {c.icone}
      </span>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {formatarData(item.data)} · {c.rotulo}
      </p>
      <p className="mt-0.5 text-sm font-semibold">{item.titulo}</p>
      {item.detalhe && <p className="text-xs text-muted-foreground">{item.detalhe}</p>}
    </div>
  )
}

function GraficoCrescimento({
  medidas,
  campo,
  rotulo,
  cor,
}: {
  medidas: MedidaCrescimento[]
  campo: "pesoKg" | "alturaCernelha"
  rotulo: string
  cor: string
}) {
  const pontos = medidas
    .map((m) => ({ data: m.data, valor: m[campo] }))
    .filter((p): p is { data: string; valor: number } => p.valor != null && p.valor > 0)

  if (pontos.length < 2) {
    return (
      <div className="flex h-36 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-center">
        <TrendingUp className="size-5 text-muted-foreground/50" />
        <p className="max-w-[16rem] px-3 text-xs text-muted-foreground">
          {rotulo} — registre 2 ou mais medições para ver o gráfico.
        </p>
      </div>
    )
  }

  const W = 320
  const H = 140
  const PAD = 16
  const valores = pontos.map((p) => p.valor)
  const min = Math.min(...valores)
  const max = Math.max(...valores)
  const range = max - min || 1
  const x = (i: number) => PAD + (i * (W - PAD * 2)) / (pontos.length - 1)
  const y = (v: number) => H - PAD - ((v - min) / range) * (H - PAD * 2)
  const pts = pontos.map((p, i) => `${x(i).toFixed(1)},${y(p.valor).toFixed(1)}`).join(" ")
  const primeiro = pontos[0]
  const ultimo = pontos[pontos.length - 1]

  return (
    <div className="rounded-xl border border-border p-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{rotulo}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Gráfico de ${rotulo}`}>
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" strokeWidth={1} />
        <polyline points={pts} fill="none" stroke={cor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {pontos.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.valor)} r={3.5} fill={cor} stroke="var(--background)" strokeWidth={1.5} />
        ))}
        <text x={PAD} y={H - PAD - 6} fontSize="10" fill="var(--muted-foreground)">
          {formatarData(primeiro.data)}
        </text>
        <text x={W - PAD} y={H - PAD - 6} textAnchor="end" fontSize="10" fill="var(--muted-foreground)">
          {ultimo.valor.toLocaleString("pt-BR")}
        </text>
        <text x={W - PAD} y={H - PAD + 14} textAnchor="end" fontSize="10" fill="var(--muted-foreground)">
          {formatarData(ultimo.data)}
        </text>
      </svg>
    </div>
  )
}

function RegistroRow({
  titulo,
  data,
  proxima,
  extra,
  aoEditar,
  aoExcluir,
}: {
  titulo: string
  data: string
  proxima?: string
  extra?: string
  aoEditar: () => void
  aoExcluir: () => void
}) {
  const sit = proxima ? situacaoSaude(diasAte(proxima)) : null
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/30">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{titulo}</p>
        <p className="text-xs text-muted-foreground">
          {formatarData(data)}
          {proxima && ` · próxima ${formatarData(proxima)}`}
          {extra && ` · ${extra}`}
        </p>
      </div>
      {sit && <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-medium", sit.classe)}>{sit.label}</span>}
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="icon-sm" aria-label="Editar registro" onClick={aoEditar}>
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Excluir registro"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={aoExcluir}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
