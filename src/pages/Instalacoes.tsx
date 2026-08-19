import { useEffect, useMemo, useState } from "react"
import {
  CheckCircle2,
  Clock,
  DoorOpen,
  Fence,
  Home,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { getBaias, salvarBaia, removerBaia, getPiquetes, salvarPiquete, removerPiquete, gerarId } from "@/lib/db"
import { useEquinosComFotos } from "@/lib/hooks"
import { useAuth } from "@/lib/auth-context"
import { tocarSomSucesso } from "@/lib/sound-alerts"
import type { BaiaInstalacao, PiqueteInstalacao } from "@/lib/types"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function Instalacoes() {
  const { haras } = useAuth()
  const { equinos } = useEquinosComFotos()

  const [baias, setBaias] = useState<BaiaInstalacao[]>([])
  const [piquetes, setPiquetes] = useState<PiqueteInstalacao[]>([])
  const [abaAtiva, setAbaAtiva] = useState<"baias" | "piquetes">("baias")
  const [setorFiltro, setSetorFiltro] = useState<string>("todos")

  // Modais
  const [dialogBaiaAberto, setDialogBaiaAberto] = useState(false)
  const [baiaEditando, setBaiaEditando] = useState<BaiaInstalacao | null>(null)
  const [numeroBaia, setNumeroBaia] = useState("")
  const [setorBaia, setSetorBaia] = useState("Pavilhão Principal")
  const [equinoNomeBaia, setEquinoNomeBaia] = useState("")
  const [statusBaia, setStatusBaia] = useState<BaiaInstalacao["statusLimpeza"]>("limpa")

  const [dialogPiqueteAberto, setDialogPiqueteAberto] = useState(false)
  const [nomePiquete, setNomePiquete] = useState("")
  const [capimPiquete, setCapimPiquete] = useState("Tifton 85")
  const [statusPiquete, setStatusPiquete] = useState<PiqueteInstalacao["status"]>("em_uso")
  const [diasDescanso, setDiasDescanso] = useState("15")

  async function carregar() {
    const [b, p] = await Promise.all([getBaias(), getPiquetes()])
    setBaias(b)
    setPiquetes(p)
  }

  useEffect(() => {
    carregar()
  }, [])

  // Métricas
  const baiasOcupadas = useMemo(() => baias.filter((b) => b.statusLimpeza === "em_uso").length, [baias])
  const baiasLivres = useMemo(() => baias.filter((b) => b.statusLimpeza === "limpa").length, [baias])
  const taxaOcupacao = baias.length > 0 ? Math.round((baiasOcupadas / baias.length) * 100) : 0

  const setores = useMemo(() => {
    const set = new Set(baias.map((b) => b.setor))
    return Array.from(set)
  }, [baias])

  function abrirNovaBaia() {
    setBaiaEditando(null)
    setNumeroBaia(`Baia ${String(baias.length + 1).padStart(2, "0")}`)
    setSetorBaia("Pavilhão Principal")
    setEquinoNomeBaia("")
    setStatusBaia("limpa")
    setDialogBaiaAberto(true)
  }

  async function handleSalvarBaia() {
    if (!numeroBaia.trim()) {
      toast.error("Informe o número ou identificação da baia.")
      return
    }

    const item: BaiaInstalacao = {
      id: baiaEditando?.id || gerarId(),
      harasId: haras?.id || "haras-cardoso-master",
      numero: numeroBaia.trim(),
      setor: setorBaia,
      equinoNome: equinoNomeBaia.trim() || undefined,
      statusLimpeza: equinoNomeBaia.trim() ? "em_uso" : statusBaia,
    }

    await salvarBaia(item)
    tocarSomSucesso()
    toast.success("Baia atualizada!")
    setDialogBaiaAberto(false)
    carregar()
  }

  async function handleSalvarPiquete() {
    if (!nomePiquete.trim()) {
      toast.error("Informe o nome do piquete.")
      return
    }

    const item: PiqueteInstalacao = {
      id: gerarId(),
      harasId: haras?.id || "haras-cardoso-master",
      nome: nomePiquete.trim(),
      tipoCapim: capimPiquete,
      status: statusPiquete,
      diasDescansoRestantes: statusPiquete !== "em_uso" ? Number(diasDescanso || 15) : undefined,
    }

    await salvarPiquete(item)
    tocarSomSucesso()
    toast.success("Piquete registrado!")
    setDialogPiqueteAberto(false)
    carregar()
  }

  async function alternarLimpezaBaia(b: BaiaInstalacao) {
    const novoStatus: BaiaInstalacao["statusLimpeza"] =
      b.statusLimpeza === "em_uso"
        ? "em_uso"
        : b.statusLimpeza === "limpa"
        ? "manutencao"
        : "limpa"

    await salvarBaia({ ...b, statusLimpeza: novoStatus })
    tocarSomSucesso()
    carregar()
  }

  const baiasFiltradas = baias.filter((b) => {
    if (setorFiltro === "todos") return true
    return b.setor === setorFiltro
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Home className="size-7 text-[#d9b978]" />
            Instalações, Baias & Pastos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mapa visual de ocupação de cocheiras e rotação sustentável de piquetes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {abaAtiva === "baias" ? (
            <Button
              onClick={abrirNovaBaia}
              className="rounded-2xl bg-[#143129] text-[#d9b978] font-bold text-xs sm:text-sm hover:bg-[#1c4338] shadow-md"
            >
              <Plus className="mr-1.5 size-4" />
              Nova Baia
            </Button>
          ) : (
            <Button
              onClick={() => setDialogPiqueteAberto(true)}
              className="rounded-2xl bg-[#143129] text-[#d9b978] font-bold text-xs sm:text-sm hover:bg-[#1c4338] shadow-md"
            >
              <Plus className="mr-1.5 size-4" />
              Novo Piquete
            </Button>
          )}
        </div>
      </div>

      {/* KPIs de Ocupação */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 p-5 bg-card shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-2xl bg-amber-500/15 text-[#d9b978] flex items-center justify-center">
              <Home className="size-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Taxa de Ocupação de Baias
              </p>
              <p className="font-display text-2xl font-black text-foreground mt-0.5">
                {taxaOcupacao}% <span className="text-xs font-normal text-muted-foreground">({baiasOcupadas}/{baias.length})</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 p-5 bg-card shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Baias Prontas & Livres
              </p>
              <p className="font-display text-2xl font-black text-foreground mt-0.5">
                {baiasLivres} cocheiras limpas
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 p-5 bg-card shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Fence className="size-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Piquetes em Manejo
              </p>
              <p className="font-display text-2xl font-black text-foreground mt-0.5">
                {piquetes.length} áreas de pasto
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Abas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAbaAtiva("baias")}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all",
              abaAtiva === "baias"
                ? "bg-[#143129] text-[#d9b978] shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            🏠 Mapa de Cocheiras / Baias ({baias.length})
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva("piquetes")}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all",
              abaAtiva === "piquetes"
                ? "bg-[#143129] text-[#d9b978] shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            🌿 Piquetes & Rotação de Pasto ({piquetes.length})
          </button>
        </div>

        {abaAtiva === "baias" && setores.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Setor:</span>
            <select
              value={setorFiltro}
              onChange={(e) => setSetorFiltro(e.target.value)}
              className="h-9 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs"
            >
              <option value="todos">Todos os Setores</option>
              {setores.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* CONTEÚDO 1: BAIAS */}
      {abaAtiva === "baias" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {baiasFiltradas.map((b) => {
            const ocupada = b.statusLimpeza === "em_uso"
            const limpa = b.statusLimpeza === "limpa"

            return (
              <Card
                key={b.id}
                className={cn(
                  "rounded-3xl border-2 p-5 bg-card transition-all flex flex-col justify-between hover:shadow-md",
                  ocupada
                    ? "border-amber-500/40 bg-amber-500/5"
                    : limpa
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-stone-500/30 bg-stone-500/5"
                )}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display font-black text-base text-foreground">{b.numero}</h3>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">{b.setor}</p>
                    </div>

                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                        ocupada
                          ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30"
                          : limpa
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                          : "bg-stone-500/15 text-stone-600 border-stone-500/30"
                      )}
                    >
                      {ocupada ? "Ocupada" : limpa ? "Livre / Limpa" : "Manutenção"}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 min-h-[50px] flex items-center">
                    {ocupada && b.equinoNome ? (
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-xl bg-[#143129] text-[#d9b978] flex items-center justify-center font-bold text-xs">
                          🐴
                        </div>
                        <div>
                          <p className="font-bold text-xs text-foreground leading-tight">{b.equinoNome}</p>
                          <span className="text-[10px] text-muted-foreground">Animal Hospedado</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                        <DoorOpen className="size-4 opacity-50" /> Baia disponível para alocação
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => alternarLimpezaBaia(b)}
                    className="h-8 text-[10px] font-bold rounded-lg"
                  >
                    <RefreshCw className="size-3 mr-1" /> Alternar Status
                  </Button>

                  <div className="flex items-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setBaiaEditando(b)
                        setNumeroBaia(b.numero)
                        setSetorBaia(b.setor)
                        setEquinoNomeBaia(b.equinoNome || "")
                        setStatusBaia(b.statusLimpeza)
                        setDialogBaiaAberto(true)
                      }}
                      className="size-8 rounded-lg"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={async () => {
                        await removerBaia(b.id)
                        toast.success("Baia removida.")
                        carregar()
                      }}
                      className="size-8 rounded-lg text-rose-500"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* CONTEÚDO 2: PIQUETES */}
      {abaAtiva === "piquetes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {piquetes.map((p) => {
            const emUso = p.status === "em_uso"
            const descanso = p.status === "descanso"

            return (
              <Card
                key={p.id}
                className={cn(
                  "rounded-3xl border-2 p-5 bg-card transition-all flex flex-col justify-between",
                  emUso
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : descanso
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-sky-500/40 bg-sky-500/5"
                )}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display font-black text-base text-foreground">{p.nome}</h3>
                      <p className="text-xs text-muted-foreground font-semibold">
                        Capim: <strong className="text-foreground">{p.tipoCapim}</strong>
                      </p>
                    </div>

                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                        emUso
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                          : descanso
                          ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30"
                          : "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30"
                      )}
                    >
                      {emUso ? "Em Pastoreio" : descanso ? "Em Descanso" : "Recuperação / Adubação"}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 space-y-2 text-xs text-muted-foreground">
                    {p.areaHectares && (
                      <div className="flex justify-between">
                        <span>Área Total:</span>
                        <strong className="text-foreground">{p.areaHectares} hectares</strong>
                      </div>
                    )}

                    {descanso && p.diasDescansoRestantes && (
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                        <Clock className="size-4" />
                        Descanso: faltam ~{p.diasDescansoRestantes} dias para retorno do pastejo
                      </div>
                    )}

                    {p.animaisAlocados && p.animaisAlocados.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Lote Alocado:</span>
                        <div className="flex flex-wrap gap-1">
                          {p.animaisAlocados.map((a, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-lg bg-background border text-[11px] font-bold text-foreground">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-end">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={async () => {
                      await removerPiquete(p.id)
                      toast.success("Piquete removido.")
                      carregar()
                    }}
                    className="size-8 rounded-lg text-rose-500"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal Baia */}
      <Dialog open={dialogBaiaAberto} onOpenChange={setDialogBaiaAberto}>
        <DialogContent className="sm:max-w-md bg-background border-stone-200 dark:border-stone-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              {baiaEditando ? "Editar Baia / Cocheira" : "Nova Baia"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2 text-xs">
            <div>
              <label className="font-semibold block mb-1">Identificação / Número da Baia *</label>
              <Input
                value={numeroBaia}
                onChange={(e) => setNumeroBaia(e.target.value)}
                placeholder="Ex: Baia 09 ou Cocheira B-01"
                className="h-10 rounded-xl text-xs"
                required
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Setor / Pavilhão</label>
              <Input
                value={setorBaia}
                onChange={(e) => setSetorBaia(e.target.value)}
                placeholder="Ex: Pavilhão Principal, Maternidade, Garanhões"
                className="h-10 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Cavalo Alocado (Opcional)</label>
              <select
                value={equinoNomeBaia}
                onChange={(e) => setEquinoNomeBaia(e.target.value)}
                className="w-full h-10 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs"
              >
                <option value="">Baia Livre (Sem cavalo)</option>
                {equinos.map((e) => (
                  <option key={e.id} value={e.nome}>{e.nome} ({e.raca})</option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="ghost" onClick={() => setDialogBaiaAberto(false)} className="rounded-xl text-xs">
              Cancelar
            </Button>
            <Button onClick={handleSalvarBaia} className="rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs">
              Salvar Baia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Piquete */}
      <Dialog open={dialogPiqueteAberto} onOpenChange={setDialogPiqueteAberto}>
        <DialogContent className="sm:max-w-md bg-background border-stone-200 dark:border-stone-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
              <Fence className="size-5 text-[#d9b978]" />
              Novo Piquete de Pastagem
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2 text-xs">
            <div>
              <label className="font-semibold block mb-1">Nome do Piquete *</label>
              <Input
                value={nomePiquete}
                onChange={(e) => setNomePiquete(e.target.value)}
                placeholder="Ex: Piquete 05 - Estrela"
                className="h-10 rounded-xl text-xs"
                required
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Variedade de Capim / Forrageira</label>
              <Input
                value={capimPiquete}
                onChange={(e) => setCapimPiquete(e.target.value)}
                placeholder="Ex: Tifton 85, Coastcross, Mombaça"
                className="h-10 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Status de Manejo</label>
              <select
                value={statusPiquete}
                onChange={(e) => setStatusPiquete(e.target.value as any)}
                className="w-full h-10 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs"
              >
                <option value="em_uso">Em Pastoreio Ativo</option>
                <option value="descanso">Em Descanso / Diferimento</option>
                <option value="recuperacao">Adubação / Recuperação</option>
              </select>
            </div>

            {statusPiquete !== "em_uso" && (
              <div>
                <label className="font-semibold block mb-1">Dias de Descanso Recomendados</label>
                <Input
                  type="number"
                  value={diasDescanso}
                  onChange={(e) => setDiasDescanso(e.target.value)}
                  className="h-10 rounded-xl text-xs font-mono font-bold"
                />
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="ghost" onClick={() => setDialogPiqueteAberto(false)} className="rounded-xl text-xs">
              Cancelar
            </Button>
            <Button onClick={handleSalvarPiquete} className="rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs">
              Salvar Piquete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
