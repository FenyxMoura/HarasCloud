import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertTriangle, Award, CheckCircle2, Pencil, Plus, Syringe, Trash2, Worm } from "lucide-react"
import AnimatedContent from "@/components/bits/AnimatedContent/AnimatedContent"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { RecordDialog } from "@/components/saude/RecordDialog"
import {
  diasAte,
  excluirFerrageamento,
  excluirVacina,
  excluirVermifugo,
  formatarData,
  getFerrageamentos,
  getVacinas,
  getVermifugos,
  hojeIso,
  salvarFerrageamento,
  salvarTransacao,
  somarDias,
} from "@/lib/db"
import { useEquinosComFotos } from "@/lib/hooks"
import { calcularAlertas, situacaoSaude } from "@/lib/saude"
import {
  DIAS_PADRAO_RETORNO_CASCO,
  TIPO_SERVICO_CASCO_LABEL,
  type RegistroFerrageamento,
  type TipoServicoCasco,
  type Vacina,
  type Vermifugo,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function Saude() {
  const { equinos, loading } = useEquinosComFotos()
  const [vacinas, setVacinas] = useState<Vacina[]>([])
  const [vermifugos, setVermifugos] = useState<Vermifugo[]>([])
  const [ferrageamentos, setFerrageamentos] = useState<RegistroFerrageamento[]>([])
  const [aba, setAba] = useState<"vacinas" | "vermifugos" | "ferrageamentos">("vacinas")
  
  const [dialog, setDialog] = useState<{
    tipo: "vacina" | "vermifugo"
    registro: Vacina | Vermifugo | null
  } | null>(null)

  const [dialogFerrageamento, setDialogFerrageamento] = useState(false)
  const [novoFerrageamento, setNovoFerrageamento] = useState<{
    equinoId: string
    tipo: TipoServicoCasco
    dataServico: string
    dataProximo: string
    ferrador: string
    valor: string
    observacoes: string
    lancarFinanceiro: boolean
  }>({
    equinoId: "",
    tipo: "casqueamento",
    dataServico: hojeIso(),
    dataProximo: somarDias(hojeIso(), DIAS_PADRAO_RETORNO_CASCO),
    ferrador: "",
    valor: "",
    observacoes: "",
    lancarFinanceiro: true,
  })

  const [excluirRegistro, setExcluirRegistro] = useState<{
    tipo: "vacina" | "vermifugo" | "ferrageamento"
    id: string
  } | null>(null)

  const carregar = useCallback(async () => {
    setVacinas(await getVacinas())
    setVermifugos(await getVermifugos())
    setFerrageamentos(await getFerrageamentos())
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const alertas = useMemo(() => calcularAlertas(vacinas, vermifugos, equinos), [vacinas, vermifugos, equinos])
  
  // Alertas de Ferrageamento
  const alertasCasco = useMemo(() => {
    return ferrageamentos
      .filter((f) => f.dataProximo)
      .map((f) => ({
        id: f.id,
        equinoId: f.equinoId,
        titulo: TIPO_SERVICO_CASCO_LABEL[f.tipo],
        dataProximo: f.dataProximo!,
        dias: diasAte(f.dataProximo!),
      }))
      .filter((a) => a.dias <= 30)
      .sort((a, b) => a.dias - b.dias)
  }, [ferrageamentos])

  const vencidos = alertas.filter((a) => a.dias < 0)
  const proximos = alertas.filter((a) => a.dias >= 0)

  const nomeEquino = useMemo(() => {
    const mapa = new Map(equinos.map((e) => [e.id, e.nome]))
    return (id: string) => mapa.get(id) ?? "—"
  }, [equinos])

  async function confirmarExclusaoRegistro() {
    if (!excluirRegistro) return
    if (excluirRegistro.tipo === "vacina") await excluirVacina(excluirRegistro.id)
    else if (excluirRegistro.tipo === "vermifugo") await excluirVermifugo(excluirRegistro.id)
    else if (excluirRegistro.tipo === "ferrageamento") await excluirFerrageamento(excluirRegistro.id)
    toast.success("Registro excluído")
    setExcluirRegistro(null)
    carregar()
  }

  async function salvarFerrageamentoGeral() {
    if (!novoFerrageamento.equinoId) {
      toast.error("Selecione o equino")
      return
    }
    if (!novoFerrageamento.dataServico) {
      toast.error("Informe a data do serviço")
      return
    }

    const valorNum = novoFerrageamento.valor ? parseFloat(novoFerrageamento.valor.replace(",", ".")) : undefined
    const eqNome = nomeEquino(novoFerrageamento.equinoId)

    await salvarFerrageamento({
      id: crypto.randomUUID(),
      equinoId: novoFerrageamento.equinoId,
      tipo: novoFerrageamento.tipo,
      dataServico: novoFerrageamento.dataServico,
      dataProximo: novoFerrageamento.dataProximo || undefined,
      ferrador: novoFerrageamento.ferrador.trim() || undefined,
      valor: valorNum && !isNaN(valorNum) ? valorNum : undefined,
      observacoes: novoFerrageamento.observacoes.trim() || undefined,
      createdAt: new Date().toISOString(),
    })

    if (novoFerrageamento.lancarFinanceiro && valorNum && !isNaN(valorNum) && valorNum > 0) {
      await salvarTransacao({
        id: crypto.randomUUID(),
        tipo: "despesa",
        categoria: "Ferradura",
        descricao: `${TIPO_SERVICO_CASCO_LABEL[novoFerrageamento.tipo]} - ${eqNome}`,
        valor: valorNum,
        data: novoFerrageamento.dataServico,
        equinoId: novoFerrageamento.equinoId,
        observacoes: novoFerrageamento.ferrador ? `Profissional: ${novoFerrageamento.ferrador}` : undefined,
        createdAt: new Date().toISOString(),
      })
    }

    toast.success("Serviço podológico registrado!")
    setDialogFerrageamento(false)
    setNovoFerrageamento({
      equinoId: "",
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

  return (
    <div className="space-y-6">
      {/* Cabeçalho Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Saúde & Cascos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Controle de vacinas, vermífugos e podologia (casqueamento/ferrageamento).
          </p>
        </div>
        <Button
          size="lg"
          className="w-full sm:w-auto rounded-xl bg-[#143129] text-[#d9b978] hover:bg-[#143129]/90 shrink-0"
          onClick={() => {
            if (aba === "ferrageamentos") {
              setDialogFerrageamento(true)
            } else {
              setDialog({ tipo: aba === "vacinas" ? "vacina" : "vermifugo", registro: null })
            }
          }}
        >
          <Plus className="size-4" />
          {aba === "vacinas" ? "Nova vacina" : aba === "vermifugos" ? "Novo vermífugo" : "Novo casqueamento/ferradura"}
        </Button>
      </div>

      {/* Alertas */}
      <AnimatedContent distance={20} duration={0.5}>
        <Card className="rounded-2xl border-stone-200/80 dark:border-stone-800/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base sm:text-lg flex items-center gap-2">
              <AlertTriangle className="size-4.5 text-amber-500" />
              Alertas Sanitários e Retornos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertas.length === 0 && alertasCasco.length === 0 ? (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-900/20">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-200">
                  Tudo em dia! Nenhuma vacina, vermífugo ou casqueamento vencendo nos próximos 30 dias.
                </p>
              </div>
            ) : (
              <>
                {vencidos.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      Sanitário Atrasado ({vencidos.length})
                    </p>
                    {vencidos.map((a) => (
                      <AlertRow key={`${a.tipo}-${a.id}`} alerta={a} nomeEquino={nomeEquino} />
                    ))}
                  </div>
                )}
                {proximos.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="pt-1 text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Sanitário Próximo ({proximos.length})
                    </p>
                    {proximos.map((a) => (
                      <AlertRow key={`${a.tipo}-${a.id}`} alerta={a} nomeEquino={nomeEquino} />
                    ))}
                  </div>
                )}
                {alertasCasco.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-border">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8c6d3f] dark:text-[#d9b978]">
                      Retorno de Casqueamento / Ferradura ({alertasCasco.length})
                    </p>
                    {alertasCasco.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 rounded-xl border border-[#d9b978]/30 bg-[#d9b978]/10 p-3">
                        <Award className="size-4 text-[#8c6d3f] dark:text-[#d9b978] shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                            {c.titulo} <span className="text-muted-foreground font-normal">· {nomeEquino(c.equinoId)}</span>
                          </p>
                          <p className="text-[11px] text-stone-500">
                            Retorno previsto em {formatarData(c.dataProximo)}
                          </p>
                        </div>
                        <span className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold",
                          c.dias < 0 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {c.dias < 0 ? `Atrasado ${Math.abs(c.dias)}d` : c.dias === 0 ? "Hoje" : `Em ${c.dias}d`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </AnimatedContent>

      {/* Registros */}
      <Tabs value={aba} onValueChange={(v) => setAba(v as "vacinas" | "vermifugos" | "ferrageamentos")}>
        <TabsList className="grid grid-cols-3 w-full h-11 p-1 rounded-2xl bg-stone-200/60 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800">
          <TabsTrigger value="vacinas" className="h-full rounded-xl px-1 text-xs font-semibold flex items-center justify-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:shadow-xs">
            <Syringe className="size-3.5 shrink-0" />
            <span className="truncate">Vacinas ({vacinas.length})</span>
          </TabsTrigger>
          <TabsTrigger value="vermifugos" className="h-full rounded-xl px-1 text-xs font-semibold flex items-center justify-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:shadow-xs">
            <Worm className="size-3.5 shrink-0" />
            <span className="truncate">Vermífugos ({vermifugos.length})</span>
          </TabsTrigger>
          <TabsTrigger value="ferrageamentos" className="h-full rounded-xl px-1 text-xs font-semibold flex items-center justify-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:shadow-xs">
            <Award className="size-3.5 shrink-0" />
            <span className="truncate sm:hidden">Cascos ({ferrageamentos.length})</span>
            <span className="truncate hidden sm:inline">Casco & Ferradura ({ferrageamentos.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. Vacinas */}
        <TabsContent value="vacinas" className="mt-4">
          {loading ? (
            <Skeleton className="h-40 rounded-2xl" />
          ) : vacinas.length === 0 ? (
            <EmptyRegistros texto="Nenhuma vacina registrada." acao={() => setDialog({ tipo: "vacina", registro: null })} />
          ) : (
            <div className="space-y-3">
              {/* Visão Mobile em Cards */}
              <div className="grid gap-2.5 sm:hidden">
                {vacinas.map((v) => {
                  const diasRest = v.dataProxima ? diasAte(v.dataProxima) : null
                  const sit = diasRest != null ? situacaoSaude(diasRest) : null
                  return (
                    <div key={v.id} className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-3.5 space-y-2 shadow-xs">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-sm text-stone-900 dark:text-stone-100">{v.nome}</p>
                          <p className="text-xs text-stone-500 font-medium">Equino: {nomeEquino(v.equinoId)}</p>
                        </div>
                        {sit && <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold", sit.classe)}>{sit.label}</span>}
                      </div>
                      <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100 dark:border-stone-800">
                        <span>Dose: {formatarData(v.dataAplicacao)}</span>
                        <span>Próx: {v.dataProxima ? formatarData(v.dataProxima) : "—"}</span>
                      </div>
                      <div className="flex justify-end gap-1 pt-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setDialog({ tipo: "vacina", registro: v })}>
                          <Pencil className="size-3 mr-1" /> Editar
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-rose-600" onClick={() => setExcluirRegistro({ tipo: "vacina", id: v.id })}>
                          <Trash2 className="size-3 mr-1" /> Excluir
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Visão Desktop em Tabela */}
              <div className="hidden sm:block overflow-hidden rounded-2xl border border-border bg-white dark:bg-stone-900 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Equino</th>
                        <th className="px-4 py-3 font-medium">Vacina</th>
                        <th className="px-4 py-3 font-medium">Aplicação</th>
                        <th className="px-4 py-3 font-medium">Próxima dose</th>
                        <th className="px-4 py-3 font-medium">Situação</th>
                        <th className="px-4 py-3 text-right font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vacinas.map((v) => (
                        <LinhaRegistro
                          key={v.id}
                          equinoNome={nomeEquino(v.equinoId)}
                          titulo={v.nome}
                          data={v.dataAplicacao}
                          proxima={v.dataProxima}
                          aoEditar={() => setDialog({ tipo: "vacina", registro: v })}
                          aoExcluir={() => setExcluirRegistro({ tipo: "vacina", id: v.id })}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* 2. Vermífugos */}
        <TabsContent value="vermifugos" className="mt-4">
          {loading ? (
            <Skeleton className="h-40 rounded-2xl" />
          ) : vermifugos.length === 0 ? (
            <EmptyRegistros texto="Nenhuma vermifugação registrada." acao={() => setDialog({ tipo: "vermifugo", registro: null })} />
          ) : (
            <div className="space-y-3">
              {/* Visão Mobile */}
              <div className="grid gap-2.5 sm:hidden">
                {vermifugos.map((v) => {
                  const diasRest = v.dataProxima ? diasAte(v.dataProxima) : null
                  const sit = diasRest != null ? situacaoSaude(diasRest) : null
                  return (
                    <div key={v.id} className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-3.5 space-y-2 shadow-xs">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-sm text-stone-900 dark:text-stone-100">{v.produto}</p>
                          <p className="text-xs text-stone-500 font-medium">Equino: {nomeEquino(v.equinoId)}</p>
                        </div>
                        {sit && <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold", sit.classe)}>{sit.label}</span>}
                      </div>
                      <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100 dark:border-stone-800">
                        <span>Dose: {formatarData(v.dataAplicacao)}</span>
                        <span>Próx: {v.dataProxima ? formatarData(v.dataProxima) : "—"}</span>
                      </div>
                      <div className="flex justify-end gap-1 pt-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setDialog({ tipo: "vermifugo", registro: v })}>
                          <Pencil className="size-3 mr-1" /> Editar
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-rose-600" onClick={() => setExcluirRegistro({ tipo: "vermifugo", id: v.id })}>
                          <Trash2 className="size-3 mr-1" /> Excluir
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Visão Desktop */}
              <div className="hidden sm:block overflow-hidden rounded-2xl border border-border bg-white dark:bg-stone-900 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Equino</th>
                        <th className="px-4 py-3 font-medium">Produto</th>
                        <th className="px-4 py-3 font-medium">Aplicação</th>
                        <th className="px-4 py-3 font-medium">Próximo</th>
                        <th className="px-4 py-3 font-medium">Situação</th>
                        <th className="px-4 py-3 text-right font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vermifugos.map((v) => (
                        <LinhaRegistro
                          key={v.id}
                          equinoNome={nomeEquino(v.equinoId)}
                          titulo={v.produto}
                          data={v.dataAplicacao}
                          proxima={v.dataProxima}
                          aoEditar={() => setDialog({ tipo: "vermifugo", registro: v })}
                          aoExcluir={() => setExcluirRegistro({ tipo: "vermifugo", id: v.id })}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* 3. Casqueamento & Ferrageamento */}
        <TabsContent value="ferrageamentos" className="mt-4">
          {loading ? (
            <Skeleton className="h-40 rounded-2xl" />
          ) : ferrageamentos.length === 0 ? (
            <EmptyRegistros texto="Nenhum serviço de casco ou ferradura registrado." acao={() => setDialogFerrageamento(true)} />
          ) : (
            <div className="space-y-3">
              {/* Visão Mobile */}
              <div className="grid gap-2.5 sm:hidden">
                {ferrageamentos.map((f) => {
                  const diasRest = f.dataProximo ? diasAte(f.dataProximo) : null
                  return (
                    <div key={f.id} className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-3.5 space-y-2 shadow-xs">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-sm text-stone-900 dark:text-stone-100">{TIPO_SERVICO_CASCO_LABEL[f.tipo]}</p>
                          <p className="text-xs text-stone-500 font-medium">Equino: {nomeEquino(f.equinoId)}</p>
                        </div>
                        {diasRest != null && (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold",
                              diasRest < 0
                                ? "bg-rose-100 text-rose-700"
                                : diasRest <= 10
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700",
                            )}
                          >
                            {diasRest < 0 ? `Atrasado ${Math.abs(diasRest)}d` : `Em ${diasRest}d`}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-stone-500 pt-1 border-t border-stone-100 dark:border-stone-800">
                        <span>Serviço: {formatarData(f.dataServico)}</span>
                        <span>Retorno: {f.dataProximo ? formatarData(f.dataProximo) : "—"}</span>
                      </div>
                      {f.ferrador && <p className="text-[11px] text-stone-400">Profissional: {f.ferrador}</p>}
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-mono text-xs font-bold text-stone-700 dark:text-stone-300">
                          {f.valor ? f.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : ""}
                        </span>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-rose-600" onClick={() => setExcluirRegistro({ tipo: "ferrageamento", id: f.id })}>
                          <Trash2 className="size-3 mr-1" /> Excluir
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Visão Desktop */}
              <div className="hidden sm:block overflow-hidden rounded-2xl border border-border bg-white dark:bg-stone-900 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Equino</th>
                        <th className="px-4 py-3 font-medium">Serviço / Ferradura</th>
                        <th className="px-4 py-3 font-medium">Profissional</th>
                        <th className="px-4 py-3 font-medium">Data</th>
                        <th className="px-4 py-3 font-medium">Retorno (+45d)</th>
                        <th className="px-4 py-3 font-medium">Valor</th>
                        <th className="px-4 py-3 text-right font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ferrageamentos.map((f) => {
                        const diasRest = f.dataProximo ? diasAte(f.dataProximo) : null
                        return (
                          <tr key={f.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium">{nomeEquino(f.equinoId)}</td>
                            <td className="px-4 py-3 font-medium text-stone-800 dark:text-stone-200">
                              {TIPO_SERVICO_CASCO_LABEL[f.tipo]}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{f.ferrador || "—"}</td>
                            <td className="px-4 py-3 text-muted-foreground">{formatarData(f.dataServico)}</td>
                            <td className="px-4 py-3">
                              {f.dataProximo ? (
                                <div className="flex items-center gap-1.5">
                                  <span>{formatarData(f.dataProximo)}</span>
                                  {diasRest != null && (
                                    <span
                                      className={cn(
                                        "rounded-full px-2 py-0.2 text-[10px] font-semibold",
                                        diasRest < 0
                                          ? "bg-rose-100 text-rose-700"
                                          : diasRest <= 10
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-emerald-100 text-emerald-700",
                                      )}
                                    >
                                      {diasRest < 0 ? `-${Math.abs(diasRest)}d` : `${diasRest}d`}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs">
                              {f.valor != null && f.valor > 0
                                ? f.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                                : "—"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Excluir"
                                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => setExcluirRegistro({ tipo: "ferrageamento", id: f.id })}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Diálogo de Casqueamento / Ferrageamento Geral */}
      <Dialog open={dialogFerrageamento} onOpenChange={setDialogFerrageamento}>
        <DialogContent className="rounded-2xl sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Award className="size-5 text-[#8c6d3f]" />
              Registrar Casqueamento / Ferrageamento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ferro-geral-eq">Equino</Label>
              <Select
                value={novoFerrageamento.equinoId}
                onValueChange={(val) => setNovoFerrageamento({ ...novoFerrageamento, equinoId: val })}
              >
                <SelectTrigger id="ferro-geral-eq" className="mt-1.5">
                  <SelectValue placeholder="Selecione o animal" />
                </SelectTrigger>
                <SelectContent>
                  {equinos.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.nome} ({eq.raca} · {eq.pelagem})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ferro-geral-tipo">Tipo de Serviço</Label>
              <Select
                value={novoFerrageamento.tipo}
                onValueChange={(val: TipoServicoCasco) => setNovoFerrageamento({ ...novoFerrageamento, tipo: val })}
              >
                <SelectTrigger id="ferro-geral-tipo" className="mt-1.5">
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
                <Label htmlFor="ferro-geral-data">Data do Serviço</Label>
                <Input
                  id="ferro-geral-data"
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
                <Label htmlFor="ferro-geral-proximo">Retorno Previsto (+45d)</Label>
                <Input
                  id="ferro-geral-proximo"
                  type="date"
                  value={novoFerrageamento.dataProximo}
                  onChange={(e) => setNovoFerrageamento({ ...novoFerrageamento, dataProximo: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ferro-geral-ferrador">Profissional / Ferrador</Label>
                <Input
                  id="ferro-geral-ferrador"
                  placeholder="Ex.: Mestre Antônio"
                  value={novoFerrageamento.ferrador}
                  onChange={(e) => setNovoFerrageamento({ ...novoFerrageamento, ferrador: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="ferro-geral-valor">Custo do Serviço (R$)</Label>
                <Input
                  id="ferro-geral-valor"
                  type="number"
                  step="0.01"
                  placeholder="Ex.: 180,00"
                  value={novoFerrageamento.valor}
                  onChange={(e) => setNovoFerrageamento({ ...novoFerrageamento, valor: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="ferro-geral-fin"
                type="checkbox"
                checked={novoFerrageamento.lancarFinanceiro}
                onChange={(e) => setNovoFerrageamento({ ...novoFerrageamento, lancarFinanceiro: e.target.checked })}
                className="size-4 rounded border-stone-300 text-[#143129] focus:ring-[#143129]"
              />
              <Label htmlFor="ferro-geral-fin" className="text-xs cursor-pointer font-medium">
                Lançar despesa automaticamente no Financeiro
              </Label>
            </div>

            <div>
              <Label htmlFor="ferro-geral-obs">Observações</Label>
              <Textarea
                id="ferro-geral-obs"
                rows={2}
                placeholder="Ex.: Correção de aprumo, casco rachado, etc."
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
            <Button className="bg-[#143129] text-[#d9b978] hover:bg-[#143129]/90" onClick={salvarFerrageamentoGeral}>
              Salvar serviço
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Vacina / Vermífugo */}
      <RecordDialog
        open={dialog !== null}
        onOpenChange={(o) => !o && setDialog(null)}
        tipo={dialog?.tipo ?? "vacina"}
        equinos={equinos}
        registro={dialog?.registro ?? null}
        onSalvo={carregar}
      />

      <ConfirmDialog
        open={excluirRegistro !== null}
        onOpenChange={(o) => !o && setExcluirRegistro(null)}
        titulo="Excluir registro?"
        descricao="Este registro sanitário será removido definitivamente."
        confirmText="Excluir"
        onConfirm={confirmarExclusaoRegistro}
      />
    </div>
  )
}

function LinhaRegistro({
  equinoNome,
  titulo,
  data,
  proxima,
  aoEditar,
  aoExcluir,
}: {
  equinoNome: string
  titulo: string
  data: string
  proxima?: string
  aoEditar: () => void
  aoExcluir: () => void
}) {
  const sit = proxima ? situacaoSaude(diasAte(proxima)) : null
  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30">
      <td className="px-4 py-3 font-medium">{equinoNome}</td>
      <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">{titulo}</td>
      <td className="px-4 py-3 text-muted-foreground">{formatarData(data)}</td>
      <td className="px-4 py-3 text-muted-foreground">{proxima ? formatarData(proxima) : "—"}</td>
      <td className="px-4 py-3">{sit ? <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", sit.classe)}>{sit.label}</span> : "—"}</td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Editar" onClick={aoEditar}>
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Excluir"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={aoExcluir}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

function AlertRow({
  alerta,
  nomeEquino,
}: {
  alerta: { id: string; tipo: "vacina" | "vermifugo"; titulo: string; dataProxima: string; dias: number; equinoId: string }
  nomeEquino: (id: string) => string
}) {
  const sit = situacaoSaude(alerta.dias)
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-border p-2.5 bg-white dark:bg-stone-900 text-xs sm:text-sm shadow-xs">
      <div className="min-w-0">
        <p className="truncate font-bold text-stone-900 dark:text-stone-100">
          {alerta.titulo} <span className="text-muted-foreground font-normal">· {nomeEquino(alerta.equinoId)}</span>
        </p>
        <p className="text-[11px] text-muted-foreground">Vencimento em {formatarData(alerta.dataProxima)}</p>
      </div>
      <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-bold", sit.classe)}>{sit.label}</span>
    </div>
  )
}

function EmptyRegistros({ texto, acao }: { texto: string; acao: () => void }) {
  return (
    <Card className="rounded-2xl border-dashed">
      <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">{texto}</p>
        <Button size="sm" className="rounded-xl bg-[#143129] text-[#d9b978]" onClick={acao}>
          <Plus className="size-4" />
          Adicionar registro
        </Button>
      </CardContent>
    </Card>
  )
}
