import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Baby,
  Calendar,
  CheckCircle2,
  Dna,
  Heart,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { HorseAvatar } from "@/components/horse/HorseAvatar"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import {
  diasAte,
  excluirCobertura,
  formatarData,
  getCoberturas,
  hojeIso,
  salvarCobertura,
  somarDias,
  getEmbrioesTE,
  salvarEmbriaoTE,
  removerEmbriaoTE,
  getPotrosNeonatologia,
  salvarPotroNeonatologia,
  removerPotroNeonatologia,
  gerarId,
} from "@/lib/db"
import { useEquinosComFotos } from "@/lib/hooks"
import { useAuth } from "@/lib/auth-context"
import { tocarSomSucesso } from "@/lib/sound-alerts"
import { temaPelagem } from "@/lib/pelagens"
import {
  DIAS_GESTACAO,
  METODO_COBERTURA_LABEL,
  STATUS_COBERTURA_LABEL,
  type Cobertura,
  type MetodoCobertura,
  type StatusCobertura,
  type EmbriaoTE,
  type PotroNeonatologia,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface FormCobertura {
  femeaId: string
  machoId: string
  dataCobertura: string
  metodo: MetodoCobertura
  status: StatusCobertura
  dataPartoPrevista: string
  dataParto: string
  observacoes: string
}

const FORM_VAZIO: FormCobertura = {
  femeaId: "",
  machoId: "",
  dataCobertura: hojeIso(),
  metodo: "monta-natural",
  status: "coberta",
  dataPartoPrevista: "",
  dataParto: "",
  observacoes: "",
}

const STATUS_COR: Record<StatusCobertura, string> = {
  coberta: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30",
  confirmada: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-black",
  "nao-prenhe": "bg-stone-500/15 text-stone-700 dark:text-stone-300 border border-stone-500/30",
  parto: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30",
}

export function Reproducao() {
  const { haras } = useAuth()
  const { equinos, fotos } = useEquinosComFotos()
  const [abaPrincipal, setAbaPrincipal] = useState<"coberturas" | "embrioes" | "neonatologia">("coberturas")

  // Coberturas
  const [coberturas, setCoberturas] = useState<Cobertura[]>([])
  const [dialogAberto, setDialogAberto] = useState(false)
  const [editando, setEditando] = useState<Cobertura | null>(null)
  const [form, setForm] = useState<FormCobertura>(FORM_VAZIO)
  const [excluir, setExcluir] = useState<Cobertura | null>(null)

  // TE (Embriões)
  const [embrioes, setEmbrioes] = useState<EmbriaoTE[]>([])
  const [dialogTEAberto, setDialogTEAberto] = useState(false)
  const [doadoraIdTE, setDoadoraIdTE] = useState("")
  const [garanhaoIdTE, setGaranhaoIdTE] = useState("")
  const [receptoraNomeTE, setReceptoraNomeTE] = useState("")
  const [dataColetaTE, setDataColetaTE] = useState(hojeIso())
  const [qualidadeTE, setQualidadeTE] = useState<EmbriaoTE["qualidadeEmbriao"]>("Grau 1 (Excelente)")
  const [statusTE, setStatusTE] = useState<EmbriaoTE["status"]>("coletado")
  const [vetTE, setVetTE] = useState("Dr. Veterinário TE")

  // Neonatologia (Potros)
  const [potros, setPotros] = useState<PotroNeonatologia[]>([])
  const [dialogPotroAberto, setDialogPotroAberto] = useState(false)
  const [potroNome, setPotroNome] = useState("")
  const [potroMae, setPotroMae] = useState("")
  const [potroPai, setPotroPai] = useState("")
  const [potroSexo, setPotroSexo] = useState<"femea" | "macho">("femea")
  const [potroPelagem, setPotroPelagem] = useState("Castanha")
  const [potroPeso, setPotroPeso] = useState("45")
  const [potroApgar, setPotroApgar] = useState("9")
  const [colostroOk, setColostroOk] = useState(true)
  const [umbigoOk, setUmbigoOk] = useState(true)

  const femeas = useMemo(() => equinos.filter((e) => e.sexo === "femea"), [equinos])
  const machos = useMemo(() => equinos.filter((e) => e.sexo === "macho"), [equinos])
  const equinosMap = useMemo(() => new Map(equinos.map((e) => [e.id, e])), [equinos])

  const carregar = useCallback(async () => {
    const [c, e, p] = await Promise.all([getCoberturas(), getEmbrioesTE(), getPotrosNeonatologia()])
    setCoberturas(c)
    setEmbrioes(e)
    setPotros(p)
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  // Métricas do Centro de Reprodução
  const totalConfirmadas = useMemo(
    () => coberturas.filter((c) => c.status === "confirmada").length,
    [coberturas]
  )
  const partosProximos = useMemo(
    () =>
      coberturas.filter((c) => {
        if (c.status !== "confirmada" || !c.dataPartoPrevista) return false
        const d = diasAte(c.dataPartoPrevista)
        return d >= 0 && d <= 60
      }).length,
    [coberturas]
  )

  function abrirNovoCobertura() {
    setEditando(null)
    setForm(FORM_VAZIO)
    setDialogAberto(true)
  }

  function abrirEdicaoCobertura(c: Cobertura) {
    setEditando(c)
    setForm({
      femeaId: c.femeaId,
      machoId: c.machoId,
      dataCobertura: c.dataCobertura,
      metodo: c.metodo,
      status: c.status,
      dataPartoPrevista: c.dataPartoPrevista ?? "",
      dataParto: c.dataParto ?? "",
      observacoes: c.observacoes ?? "",
    })
    setDialogAberto(true)
  }

  async function salvarFormCobertura() {
    if (!form.femeaId || !form.machoId || !form.dataCobertura) {
      toast.error("Preencha a matriz, o reprodutor e a data.")
      return
    }

    const prevista =
      form.status === "confirmada" || form.status === "coberta"
        ? form.dataPartoPrevista || somarDias(form.dataCobertura, DIAS_GESTACAO)
        : undefined

    const cobertura: Cobertura = {
      id: editando?.id ?? gerarId(),
      femeaId: form.femeaId,
      machoId: form.machoId,
      dataCobertura: form.dataCobertura,
      metodo: form.metodo,
      status: form.status,
      dataPartoPrevista: prevista,
      dataParto: form.dataParto || undefined,
      observacoes: form.observacoes || undefined,
      createdAt: editando?.createdAt ?? new Date().toISOString(),
    }

    await salvarCobertura(cobertura)
    tocarSomSucesso()
    toast.success(editando ? "Registro atualizado!" : "Cobertura registrada com sucesso!")
    setDialogAberto(false)
    await carregar()
  }

  async function salvarFormTE() {
    const doadora = equinosMap.get(doadoraIdTE)
    const garanhao = equinosMap.get(garanhaoIdTE)

    if (!doadora || !garanhao) {
      toast.error("Selecione a égua doadora e o garanhão reprodutor.")
      return
    }

    const item: EmbriaoTE = {
      id: gerarId(),
      harasId: haras?.id || "haras-cardoso-master",
      doadoraId: doadora.id,
      doadoraNome: doadora.nome,
      garanhaoId: garanhao.id,
      garanhaoNome: garanhao.nome,
      receptoraNome: receptoraNomeTE.trim() || undefined,
      dataColeta: dataColetaTE,
      qualidadeEmbriao: qualidadeTE,
      status: statusTE,
      veterinarioResponsavel: vetTE,
      createdAt: new Date().toISOString(),
    }

    await salvarEmbriaoTE(item)
    tocarSomSucesso()
    toast.success("Embrião TE registrado no laboratório!")
    setDialogTEAberto(false)
    await carregar()
  }

  async function salvarFormPotro() {
    if (!potroNome.trim()) {
      toast.error("Informe o nome do potro nascido.")
      return
    }

    const item: PotroNeonatologia = {
      id: gerarId(),
      harasId: haras?.id || "haras-cardoso-master",
      nome: potroNome.trim(),
      dataNascimento: hojeIso(),
      maeNome: potroMae || "Matriz do Haras",
      paiNome: potroPai || "Garanhão do Haras",
      sexo: potroSexo,
      pelagem: potroPelagem,
      pesoNascimentoKg: Number(potroPeso || 45),
      escoreApgar: Number(potroApgar || 9),
      ingestaoColostroAdequada: colostroOk,
      curaUmbigoRealizada: umbigoOk,
      createdAt: new Date().toISOString(),
    }

    await salvarPotroNeonatologia(item)
    tocarSomSucesso()
    toast.success("Nascimento e protocolo neonatal registrados!")
    setDialogPotroAberto(false)
    await carregar()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Heart className="size-7 text-rose-500 fill-rose-500/20" />
            Centro de Reprodução & Biotecnologia
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Controle de coberturas, inseminação, transferência de embriões (TE) e neonatologia de potros.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {abaPrincipal === "coberturas" && (
            <Button
              onClick={abrirNovoCobertura}
              className="rounded-2xl bg-[#143129] text-[#d9b978] font-bold text-xs sm:text-sm hover:bg-[#1c4338] shadow-md active:scale-95"
            >
              <Plus className="mr-1.5 size-4" />
              Nova Cobertura
            </Button>
          )}

          {abaPrincipal === "embrioes" && (
            <Button
              onClick={() => setDialogTEAberto(true)}
              className="rounded-2xl bg-[#143129] text-[#d9b978] font-bold text-xs sm:text-sm hover:bg-[#1c4338] shadow-md active:scale-95"
            >
              <Plus className="mr-1.5 size-4" />
              Registrar Embrião TE
            </Button>
          )}

          {abaPrincipal === "neonatologia" && (
            <Button
              onClick={() => setDialogPotroAberto(true)}
              className="rounded-2xl bg-[#143129] text-[#d9b978] font-bold text-xs sm:text-sm hover:bg-[#1c4338] shadow-md active:scale-95"
            >
              <Plus className="mr-1.5 size-4" />
              Registrar Nascimento
            </Button>
          )}
        </div>
      </div>

      {/* Cards de Métricas e KPIs do Haras */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-3xl p-4 sm:p-5 border-stone-200/80 dark:border-stone-800 bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Gestações</span>
            <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-black text-foreground mt-2">{totalConfirmadas}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Prenhezes Confirmadas</p>
        </Card>

        <Card className="rounded-3xl p-4 sm:p-5 border-stone-200/80 dark:border-stone-800 bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Partos &lt; 60d</span>
            <span className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Calendar className="size-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-black text-foreground mt-2">{partosProximos}</p>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5">Previsão Iminente</p>
        </Card>

        <Card className="rounded-3xl p-4 sm:p-5 border-stone-200/80 dark:border-stone-800 bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Embriões TE</span>
            <span className="p-1.5 rounded-xl bg-amber-500/10 text-[#d9b978]">
              <Dna className="size-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-black text-foreground mt-2">{embrioes.length}</p>
          <p className="text-[11px] text-[#d9b978] font-semibold mt-0.5">No Laboratório TE</p>
        </Card>

        <Card className="rounded-3xl p-4 sm:p-5 border-stone-200/80 dark:border-stone-800 bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Potros</span>
            <span className="p-1.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Baby className="size-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-black text-foreground mt-2">{potros.length}</p>
          <p className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold mt-0.5">Nascidos na Temporada</p>
        </Card>
      </div>

      {/* Navegação de Abas */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setAbaPrincipal("coberturas")}
          className={cn(
            "px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all active:scale-95",
            abaPrincipal === "coberturas"
              ? "bg-[#143129] text-[#d9b978] shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          ❤️ Coberturas & Gestações ({coberturas.length})
        </button>

        <button
          type="button"
          onClick={() => setAbaPrincipal("embrioes")}
          className={cn(
            "px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all active:scale-95",
            abaPrincipal === "embrioes"
              ? "bg-[#143129] text-[#d9b978] shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          🧬 Transferência de Embriões TE ({embrioes.length})
        </button>

        <button
          type="button"
          onClick={() => setAbaPrincipal("neonatologia")}
          className={cn(
            "px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all active:scale-95",
            abaPrincipal === "neonatologia"
              ? "bg-[#143129] text-[#d9b978] shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          🍼 Neonatologia & Potros ({potros.length})
        </button>
      </div>

      {/* CONTEÚDO 1: COBERTURAS & GESTAÇÕES */}
      {abaPrincipal === "coberturas" && (
        <div className="space-y-4">
          {coberturas.length === 0 ? (
            <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 p-12 text-center">
              <Heart className="size-12 mx-auto text-rose-400 opacity-60 mb-2" />
              <p className="font-bold text-foreground">Nenhuma cobertura cadastrada</p>
              <p className="text-xs text-muted-foreground mt-1">
                Registre saltos e inseminações para acompanhar o cálculo de parto previsto de ~340 dias.
              </p>
              <Button onClick={abrirNovoCobertura} className="mt-4 rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs">
                Registrar Primeira Cobertura
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {coberturas.map((c) => {
                const femea = equinosMap.get(c.femeaId)
                const macho = equinosMap.get(c.machoId)
                const diasRestantes = c.dataPartoPrevista ? diasAte(c.dataPartoPrevista) : null

                // Cálculo do Progresso Gestacional (340 dias)
                const diasDecorridos = c.dataPartoPrevista ? Math.max(0, 340 - (diasRestantes ?? 340)) : 0
                const porcentagem = Math.min(Math.round((diasDecorridos / 340) * 100), 100)

                return (
                  <Card key={c.id} className="rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 bg-card hover:border-[#d9b978]/60 transition-all shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", STATUS_COR[c.status])}>
                          {STATUS_COBERTURA_LABEL[c.status]}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-semibold">
                          {METODO_COBERTURA_LABEL[c.metodo]}
                        </span>
                      </div>

                      {/* Égua e Garanhão */}
                      <div className="mt-4 space-y-3 bg-muted/20 p-3 rounded-2xl border border-border/50">
                        <div className="flex items-center gap-3">
                          <HorseAvatar
                            nome={femea?.nome ?? "Égua"}
                            fotoUrl={fotos[c.femeaId]}
                            tema={femea?.pelagem ? temaPelagem(femea.pelagem) : undefined}
                            className="size-11 rounded-xl shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-black tracking-wider block">Matriz Doadora</span>
                            <p className="font-serif font-bold text-sm sm:text-base text-foreground truncate">{femea?.nome ?? "Égua não encontrada"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                          <HorseAvatar
                            nome={macho?.nome ?? "Reprodutor"}
                            fotoUrl={fotos[c.machoId]}
                            tema={macho?.pelagem ? temaPelagem(macho.pelagem) : undefined}
                            className="size-11 rounded-xl shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-black tracking-wider block">Garanhão Reprodutor</span>
                            <p className="font-serif font-bold text-sm sm:text-base text-foreground truncate">{macho?.nome ?? "Garanhão não encontrado"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Barra de Progresso Gestacional */}
                      {c.status === "confirmada" && c.dataPartoPrevista && (
                        <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-rose-700 dark:text-rose-300 flex items-center gap-1">
                              <Sparkles className="size-3.5" />
                              Parto: {formatarData(c.dataPartoPrevista)}
                            </span>
                            <span className="font-mono text-rose-600 dark:text-rose-400">{porcentagem}%</span>
                          </div>

                          <div className="w-full h-2 rounded-full bg-rose-200 dark:bg-rose-950/60 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all duration-500"
                              style={{ width: `${porcentagem}%` }}
                            />
                          </div>

                          <p className="text-[10px] text-muted-foreground font-medium">
                            {diasRestantes !== null && diasRestantes > 0
                              ? `Faltam ~${diasRestantes} dias (~${Math.ceil(diasRestantes / 30)} meses) para o nascimento`
                              : "⚠️ Data prevista atingida! Pronto para parto."}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Data: {formatarData(c.dataCobertura)}</span>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => abrirEdicaoCobertura(c)} className="size-8 rounded-xl">
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setExcluir(c)} className="size-8 rounded-xl text-rose-500 hover:text-rose-600">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO 2: TRANSFERÊNCIA DE EMBRIÕES (TE) */}
      {abaPrincipal === "embrioes" && (
        <div className="space-y-4">
          {embrioes.length === 0 ? (
            <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 p-12 text-center">
              <Dna className="size-12 mx-auto text-amber-500 opacity-60 mb-2" />
              <p className="font-bold text-foreground">Nenhum embrião TE registrado</p>
              <p className="text-xs text-muted-foreground mt-1">
                Cadastre o flushing e inovulação de embriões das matrizes doadoras em receptoras.
              </p>
              <Button onClick={() => setDialogTEAberto(true)} className="mt-4 rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs">
                Registrar Primeiro Embrião
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {embrioes.map((e) => (
                <Card key={e.id} className="rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 bg-card hover:border-[#d9b978]/60 transition-all shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-[#d9b978] border border-amber-500/30">
                        {e.qualidadeEmbriao}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {e.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2.5 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">Matriz Doadora:</span>
                        <strong className="text-foreground text-sm font-serif">{e.doadoraNome}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">Garanhão Reprodutor:</span>
                        <strong className="text-foreground text-sm font-serif">{e.garanhaoNome}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-sky-500/5 border border-sky-500/20">
                        <span className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-300 block">Égua Receptora:</span>
                        <span className="text-foreground font-bold text-xs">{e.receptoraNome || "Em espera / Congelado no botijão"}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground pt-1 flex items-center justify-between">
                        <span>Coleta: <strong>{formatarData(e.dataColeta)}</strong></span>
                        <span>{e.veterinarioResponsavel || "Dr. Veterinário"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-end">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={async () => {
                        await removerEmbriaoTE(e.id)
                        toast.success("Embrião removido.")
                        await carregar()
                      }}
                      className="size-8 rounded-xl text-rose-500 hover:text-rose-600"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO 3: NEONATOLOGIA & POTROS */}
      {abaPrincipal === "neonatologia" && (
        <div className="space-y-4">
          {potros.length === 0 ? (
            <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 p-12 text-center">
              <Baby className="size-12 mx-auto text-sky-400 opacity-60 mb-2" />
              <p className="font-bold text-foreground">Nenhum nascimento neonatal registrado</p>
              <p className="text-xs text-muted-foreground mt-1">
                Cadastre os nascimentos com escore APGAR, peso ao nascer e ingestão de colostro.
              </p>
              <Button onClick={() => setDialogPotroAberto(true)} className="mt-4 rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs">
                Registrar Primeiro Potro
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {potros.map((p) => (
                <Card key={p.id} className="rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 bg-card hover:border-[#d9b978]/60 transition-all shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30">
                        {p.sexo === "macho" ? "♂ Potro Macho" : "♀ Potra Fêmea"}
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        APGAR: {p.escoreApgar}/10
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-foreground mt-3">{p.nome}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.maeNome} × {p.paiNome} · Pelagem: {p.pelagem}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                      <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Peso</span>
                        <strong className="text-foreground text-sm">{p.pesoNascimentoKg} kg</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Colostro</span>
                        <strong className={cn("text-xs font-bold", p.ingestaoColostroAdequada ? "text-emerald-600" : "text-rose-500")}>
                          {p.ingestaoColostroAdequada ? "✓ Ingerido" : "✗ Pendente"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Nascido em: {formatarData(p.dataNascimento)}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={async () => {
                        await removerPotroNeonatologia(p.id)
                        toast.success("Registro removido.")
                        await carregar()
                      }}
                      className="size-8 rounded-xl text-rose-500 hover:text-rose-600"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DIALOG DE COBERTURA */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="sm:max-w-md bg-background border-stone-200 dark:border-stone-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-foreground">
              {editando ? "Editar Cobertura" : "Registrar Cobertura / Salto"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3.5 text-xs mt-2">
            <div>
              <label className="font-semibold block mb-1">Matriz (Fêmea)</label>
              <select
                value={form.femeaId}
                onChange={(e) => setForm({ ...form, femeaId: e.target.value })}
                className="w-full h-10 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs"
              >
                <option value="">Selecione a égua...</option>
                {femeas.map((f) => (
                  <option key={f.id} value={f.id}>{f.nome} ({f.raca})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Reprodutor (Garanhão)</label>
              <select
                value={form.machoId}
                onChange={(e) => setForm({ ...form, machoId: e.target.value })}
                className="w-full h-10 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs"
              >
                <option value="">Selecione o garanhão...</option>
                {machos.map((m) => (
                  <option key={m.id} value={m.id}>{m.nome} ({m.raca})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Data da Cobertura</label>
                <Input
                  type="date"
                  value={form.dataCobertura}
                  onChange={(e) => setForm({ ...form, dataCobertura: e.target.value })}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Método</label>
                <select
                  value={form.metodo}
                  onChange={(e) => setForm({ ...form, metodo: e.target.value as MetodoCobertura })}
                  className="w-full h-10 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs"
                >
                  {Object.entries(METODO_COBERTURA_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Status da Cobertura</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as StatusCobertura })}
                className="w-full h-10 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs font-bold"
              >
                {Object.entries(STATUS_COBERTURA_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="ghost" onClick={() => setDialogAberto(false)} className="rounded-xl text-xs">
              Cancelar
            </Button>
            <Button onClick={salvarFormCobertura} className="rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs hover:bg-[#1c4338]">
              Salvar Cobertura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG DE EMBRIÃO TE */}
      <Dialog open={dialogTEAberto} onOpenChange={setDialogTEAberto}>
        <DialogContent className="sm:max-w-md bg-background border-stone-200 dark:border-stone-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-foreground">
              Registrar Embrião TE (Transferência)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3.5 text-xs mt-2">
            <div>
              <label className="font-semibold block mb-1">Matriz Doadora</label>
              <select
                value={doadoraIdTE}
                onChange={(e) => setDoadoraIdTE(e.target.value)}
                className="w-full h-10 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs"
              >
                <option value="">Selecione a matriz doadora...</option>
                {femeas.map((f) => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Garanhão Reprodutor</label>
              <select
                value={garanhaoIdTE}
                onChange={(e) => setGaranhaoIdTE(e.target.value)}
                className="w-full h-10 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs"
              >
                <option value="">Selecione o garanhão...</option>
                {machos.map((m) => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Égua Receptora (Opcional)</label>
              <Input
                placeholder="Ex.: Receptora 04 - Alazã"
                value={receptoraNomeTE}
                onChange={(e) => setReceptoraNomeTE(e.target.value)}
                className="rounded-xl h-10 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Status do Embrião</label>
                <select
                  value={statusTE}
                  onChange={(e) => setStatusTE(e.target.value as EmbriaoTE["status"])}
                  className="w-full h-10 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs"
                >
                  <option value="coletado">Coletado</option>
                  <option value="transferido">Transferido</option>
                  <option value="congelado">Congelado</option>
                  <option value="descartado">Descartado</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Veterinário Responsável</label>
                <Input
                  placeholder="Nome do Vet"
                  value={vetTE}
                  onChange={(e) => setVetTE(e.target.value)}
                  className="rounded-xl h-10 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Data da Coleta</label>
                <Input
                  type="date"
                  value={dataColetaTE}
                  onChange={(e) => setDataColetaTE(e.target.value)}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Qualidade do Embrião</label>
                <select
                  value={qualidadeTE}
                  onChange={(e) => setQualidadeTE(e.target.value as EmbriaoTE["qualidadeEmbriao"])}
                  className="w-full h-10 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs"
                >
                  <option value="Grau 1 (Excelente)">Grau 1 (Excelente)</option>
                  <option value="Grau 2 (Bom)">Grau 2 (Bom)</option>
                  <option value="Grau 3 (Regular)">Grau 3 (Regular)</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="ghost" onClick={() => setDialogTEAberto(false)} className="rounded-xl text-xs">
              Cancelar
            </Button>
            <Button onClick={salvarFormTE} className="rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs hover:bg-[#1c4338]">
              Registrar Embrião
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG DE POTRO NEONATAL */}
      <Dialog open={dialogPotroAberto} onOpenChange={setDialogPotroAberto}>
        <DialogContent className="sm:max-w-md bg-background border-stone-200 dark:border-stone-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-foreground">
              Registrar Nascimento Neonatal
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3.5 text-xs mt-2">
            <div>
              <label className="font-semibold block mb-1">Nome do Potro</label>
              <Input
                placeholder="Ex.: Trovão do Haras"
                value={potroNome}
                onChange={(e) => setPotroNome(e.target.value)}
                className="rounded-xl h-10 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Mãe / Matriz</label>
                <Input
                  placeholder="Nome da mãe"
                  value={potroMae}
                  onChange={(e) => setPotroMae(e.target.value)}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Pai / Garanhão</label>
                <Input
                  placeholder="Nome do pai"
                  value={potroPai}
                  onChange={(e) => setPotroPai(e.target.value)}
                  className="rounded-xl h-10 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold block mb-1">Sexo</label>
                <select
                  value={potroSexo}
                  onChange={(e) => setPotroSexo(e.target.value as "femea" | "macho")}
                  className="w-full h-10 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-2 text-xs"
                >
                  <option value="macho">Macho</option>
                  <option value="femea">Fêmea</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Pelagem</label>
                <Input
                  placeholder="Castanha..."
                  value={potroPelagem}
                  onChange={(e) => setPotroPelagem(e.target.value)}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Peso (kg)</label>
                <Input
                  type="number"
                  value={potroPeso}
                  onChange={(e) => setPotroPeso(e.target.value)}
                  className="rounded-xl h-10 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Escore APGAR (0 a 10)</label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={potroApgar}
                  onChange={(e) => setPotroApgar(e.target.value)}
                  className="rounded-xl h-10 text-xs font-bold"
                />
              </div>

              <div className="flex flex-col justify-center space-y-1.5 pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={colostroOk}
                    onChange={(e) => setColostroOk(e.target.checked)}
                    className="rounded text-[#143129]"
                  />
                  <span className="font-semibold text-xs">Colostro Ingerido</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={umbigoOk}
                    onChange={(e) => setUmbigoOk(e.target.checked)}
                    className="rounded text-[#143129]"
                  />
                  <span className="font-semibold text-xs">Cura de Umbigo OK</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="ghost" onClick={() => setDialogPotroAberto(false)} className="rounded-xl text-xs">
              Cancelar
            </Button>
            <Button onClick={salvarFormPotro} className="rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs hover:bg-[#1c4338]">
              Salvar Nascimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
      {excluir && (
        <ConfirmDialog
          open={Boolean(excluir)}
          onOpenChange={(v) => !v && setExcluir(null)}
          titulo="Excluir Cobertura"
          descricao="Tem certeza de que deseja remover este registro de cobertura?"
          onConfirm={async () => {
            if (excluir) {
              await excluirCobertura(excluir.id)
              setExcluir(null)
              toast.success("Cobertura removida com sucesso!")
              await carregar()
            }
          }}
        />
      )}
    </div>
  )
}
