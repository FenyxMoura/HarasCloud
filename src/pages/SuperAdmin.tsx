import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Activity,
  BarChart3,
  Building2,
  Crown,
  Database,
  DollarSign,
  Eye,
  FileText,
  Home,
  Layers,
  LogOut,
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Server,
  Smartphone,
  Tag,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react"
import { HorseIcon } from "@/components/icons/HorseIcon"
import { HarasLogo } from "@/components/icons/HarasLogo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import {
  PLANOS_DISPONIVEIS,
  type HarasTenant,
  type PlanoSaaS,
  type StatusAssinatura,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function SuperAdmin() {
  const {
    todosOsHaras,
    todosOsUsuarios,
    impersonateHaras,
    atualizarStatusAssinatura,
    criarNovoHarasAdmin,
    excluirHarasAdmin,
    logout,
  } = useAuth()
  const navigate = useNavigate()

  const [abaAtiva, setAbaAtiva] = useState<
    "tenants" | "graficos" | "financeiro" | "cupons" | "updates" | "broadcast" | "logs"
  >("tenants")
  const [busca, setBusca] = useState("")
  const [filtroPlano, setFiltroPlano] = useState<string>("todos")
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")

  // Sistema de Atualização Obrigatória do App
  const [versaoObrigatoria, setVersaoObrigatoria] = useState("2.1.0")
  const [bloquearAntigas, setBloquearAntigas] = useState(true)
  const [linkApkUpdate, setLinkApkUpdate] = useState("/app-release.apk")
  const [notasUpdate, setNotasUpdate] = useState(
    "Nova versão com Haras Vision IA, Manejo em lote e melhorias de performance."
  )

  function handlePublicarAtualizacao(e: React.FormEvent) {
    e.preventDefault()
    const novaConfig = {
      versaoAppInstalada: "2.1.0",
      versaoMinimaObrigatoria: versaoObrigatoria.trim(),
      bloquearVersaoAntiga: bloquearAntigas,
      linkDownloadApk: linkApkUpdate.trim() || "/app-release.apk",
      notasVersao: notasUpdate.trim(),
      dataPublicacao: new Date().toISOString().split("T")[0],
    }
    localStorage.setItem("haras_cloud_app_update_config_v1", JSON.stringify(novaConfig))
    window.dispatchEvent(new Event("storage"))
    toast.success("🚀 Atualização Obrigatória publicada para todos os aplicativos!")
  }

  // Modal para editar assinatura
  const [harasSelecionado, setHarasSelecionado] = useState<HarasTenant | null>(null)
  const [novoStatus, setNovoStatus] = useState<StatusAssinatura>("ativo")
  const [novoPlano, setNovoPlano] = useState<PlanoSaaS>("marchador")
  const [diasAdicionais, setDiasAdicionais] = useState(30)
  const [modalAssinaturaAberto, setModalAssinaturaAberto] = useState(false)

  // Modal para cadastrar novo Haras direto pelo Admin
  const [modalNovoHarasAberto, setModalNovoHarasAberto] = useState(false)
  const [novoNome, setNovoNome] = useState("")
  const [novoResp, setNovoResp] = useState("")
  const [novoEmail, setNovoEmail] = useState("")
  const [novoTel, setNovoTel] = useState("")
  const [novoCidade, setNovoCidade] = useState("")
  const [novoPlanoCad, setNovoPlanoCad] = useState<PlanoSaaS>("marchador")
  const [novoStatusCad, setNovoStatusCad] = useState<StatusAssinatura>("ativo")
  const [novoDiasCad, setNovoDiasCad] = useState(30)
  const [salvandoNovo, setSalvandoNovo] = useState(false)

  // Broadcast
  const [mensagemBroadcast, setMensagemBroadcast] = useState("")
  const [tipoBroadcast, setTipoBroadcast] = useState<"aviso" | "novidade" | "manutencao">("novidade")

  // Cupons
  const [cupons, setCupons] = useState([
    { codigo: "HARASVIP30", desconto: 30, validade: "2026-12-31", usos: 14, ativo: true },
    { codigo: "CRIADOR2026", desconto: 20, validade: "2026-10-15", usos: 8, ativo: true },
    { codigo: "POTRO100", desconto: 100, validade: "2026-09-01", usos: 3, ativo: false },
  ])
  const [novoCodigoCupom, setNovoCodigoCupom] = useState("")
  const [novoDescCupom, setNovoDescCupom] = useState(25)

  // Excluir Haras
  const [harasParaExcluir, setHarasParaExcluir] = useState<HarasTenant | null>(null)

  // Métricas do SaaS Master
  const totalHaras = todosOsHaras.length
  const totalAtivos = todosOsHaras.filter((h) => h.statusAssinatura === "ativo").length
  const totalTrials = todosOsHaras.filter((h) => h.statusAssinatura === "trial").length
  const totalUsuarios = todosOsUsuarios.length

  const mrrEstimado = todosOsHaras.reduce((acc, h) => {
    if (h.statusAssinatura === "ativo" || h.statusAssinatura === "trial") {
      return acc + (PLANOS_DISPONIVEIS[h.plano]?.precoMensal || 0)
    }
    return acc
  }, 0)

  const arrEstimado = mrrEstimado * 12

  // Distribuição de Planos
  const contagemPotro = todosOsHaras.filter((h) => h.plano === "potro").length
  const contagemMarchador = todosOsHaras.filter((h) => h.plano === "marchador").length
  const contagemImperial = todosOsHaras.filter((h) => h.plano === "imperial").length

  const harasFiltrados = todosOsHaras.filter((h) => {
    const matchBusca =
      h.nomeHaras.toLowerCase().includes(busca.toLowerCase()) ||
      h.responsavel.toLowerCase().includes(busca.toLowerCase()) ||
      h.email.toLowerCase().includes(busca.toLowerCase()) ||
      (h.cidadeUf && h.cidadeUf.toLowerCase().includes(busca.toLowerCase()))

    const matchPlano = filtroPlano === "todos" || h.plano === filtroPlano
    const matchStatus = filtroStatus === "todos" || h.statusAssinatura === filtroStatus

    return matchBusca && matchPlano && matchStatus
  })

  function abrirModalAssinatura(h: HarasTenant) {
    setHarasSelecionado(h)
    setNovoStatus(h.statusAssinatura)
    setNovoPlano(h.plano)
    setDiasAdicionais(30)
    setModalAssinaturaAberto(true)
  }

  function salvarAlteracaoAssinatura() {
    if (!harasSelecionado) return
    atualizarStatusAssinatura(harasSelecionado.id, novoStatus, novoPlano, diasAdicionais)
    toast.success(`Assinatura do ${harasSelecionado.nomeHaras} atualizada com sucesso!`)
    setModalAssinaturaAberto(false)
  }

  async function handleCriarNovoHaras(e: React.FormEvent) {
    e.preventDefault()
    if (!novoNome.trim() || !novoResp.trim() || !novoEmail.trim()) {
      toast.error("Preencha o nome do haras, responsável e e-mail.")
      return
    }

    setSalvandoNovo(true)
    const res = await criarNovoHarasAdmin({
      nomeHaras: novoNome,
      responsavel: novoResp,
      email: novoEmail,
      telefone: novoTel || undefined,
      cidadeUf: novoCidade || undefined,
      plano: novoPlanoCad,
      status: novoStatusCad,
      diasValidade: novoDiasCad,
    })
    setSalvandoNovo(false)

    if (res.success) {
      toast.success("Novo Haras cadastrado e ativado na plataforma!")
      setNovoNome("")
      setNovoResp("")
      setNovoEmail("")
      setNovoTel("")
      setNovoCidade("")
      setModalNovoHarasAberto(false)
    } else {
      toast.error(res.error || "Erro ao cadastrar novo haras.")
    }
  }

  function acessarComoSuporte(h: HarasTenant) {
    impersonateHaras(h.id)
    toast.info(`Acessando o painel de ${h.nomeHaras} no Modo Suporte...`)
    navigate("/app")
  }

  function handleEnviarBroadcast(e: React.FormEvent) {
    e.preventDefault()
    if (!mensagemBroadcast.trim()) {
      toast.error("Digite o texto do comunicado.")
      return
    }
    toast.success("📢 Comunicado Global transmitido com sucesso para todos os Haras!")
    setMensagemBroadcast("")
  }

  function handleCriarCupom(e: React.FormEvent) {
    e.preventDefault()
    if (!novoCodigoCupom.trim()) return
    const novo = {
      codigo: novoCodigoCupom.trim().toUpperCase(),
      desconto: novoDescCupom,
      validade: "2026-12-31",
      usos: 0,
      ativo: true,
    }
    setCupons([novo, ...cupons])
    setNovoCodigoCupom("")
    toast.success(`Cupom ${novo.codigo} criado com sucesso!`)
  }

  return (
    <div className="min-h-screen bg-[#07130f] text-[#f7f2e7] antialiased">
      {/* Header Superior SuperAdmin com Acessos Diretos */}
      <header className="sticky top-0 z-40 border-b border-amber-500/20 bg-[#0a1b15]/95 px-4 py-3 sm:px-8 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 text-amber-300 border border-amber-500/40 shadow-lg">
              <Crown className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold text-white tracking-tight">
                  HarasCloud Master
                </span>
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-300 uppercase tracking-widest border border-amber-500/30">
                  SuperAdmin SaaS
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Painel Executivo de Gestão Global da Plataforma
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/">
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl border-white/20 bg-white/5 text-xs font-bold text-white hover:bg-white/10"
              >
                <Home className="mr-1.5 size-3.5 text-stone-300" />
                Site Oficial (Início)
              </Button>
            </Link>

            <Link to="/app">
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl border-amber-500/40 bg-amber-500/10 text-xs font-bold text-amber-200 hover:bg-amber-500/20 shadow-sm"
              >
                <HorseIcon className="mr-1.5 size-4 text-[#d9b978]" />
                Meu Haras Cardoso
              </Button>
            </Link>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                logout()
                navigate("/login")
              }}
              className="rounded-xl text-xs font-bold text-stone-400 hover:text-white hover:bg-white/10"
            >
              <LogOut className="mr-1.5 size-3.5" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-8 space-y-8">
        {/* KPI CARDS SaaS EXECUTIVOS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-3xl border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-[#0c1f18] to-[#081510] backdrop-blur-xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">MRR Mensal</span>
              <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300">
                <DollarSign className="size-4" />
              </span>
            </div>
            <p className="font-display text-3xl font-black text-white mt-2">
              R$ {mrrEstimado.toLocaleString("pt-BR")}
            </p>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-400 font-semibold">
              <TrendingUp className="size-3.5" />
              +14.2% este mês
            </div>
          </Card>

          <Card className="rounded-3xl border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">ARR Anualizado</span>
              <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300">
                <TrendingUp className="size-4" />
              </span>
            </div>
            <p className="font-display text-3xl font-black text-white mt-2">
              R$ {arrEstimado.toLocaleString("pt-BR")}
            </p>
            <p className="text-[11px] text-stone-400 mt-1">Receita contratada anual</p>
          </Card>

          <Card className="rounded-3xl border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Haras Cadastrados</span>
              <span className="p-1.5 rounded-xl bg-sky-500/20 text-sky-300">
                <Building2 className="size-4" />
              </span>
            </div>
            <p className="font-display text-3xl font-black text-white mt-2">
              {totalHaras} <span className="text-sm font-normal text-stone-400">criatórios</span>
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px]">
              <span className="text-emerald-400 font-bold">{totalAtivos} Ativos</span>
              <span className="text-stone-500">·</span>
              <span className="text-amber-400 font-bold">{totalTrials} em Trial</span>
            </div>
          </Card>

          <Card className="rounded-3xl border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Usuários na Plataforma</span>
              <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300">
                <Users className="size-4" />
              </span>
            </div>
            <p className="font-display text-3xl font-black text-white mt-2">
              {totalUsuarios} <span className="text-sm font-normal text-stone-400">membros</span>
            </p>
            <p className="text-[11px] text-stone-400 mt-1">Donos, veterinários e tratadores</p>
          </Card>
        </div>

        {/* NAVEGAÇÃO POR ABAS SUPERADMIN - DESIGN CORRIGIDO DE ALTO CONTRASTE */}
        <Tabs value={abaAtiva} onValueChange={(v) => setAbaAtiva(v as any)} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <TabsList className="bg-[#0b1d16] border border-amber-500/40 p-1.5 rounded-2xl h-auto flex flex-wrap gap-1 shadow-inner">
              <TabsTrigger
                value="tenants"
                className="rounded-xl px-4 py-2 text-xs font-bold text-stone-300 hover:text-white data-[state=active]:bg-amber-500 data-[state=active]:text-stone-950 data-[state=active]:shadow-lg transition-all"
              >
                <Building2 className="size-3.5 mr-1.5" />
                Haras &amp; Assinaturas ({totalHaras})
              </TabsTrigger>
              <TabsTrigger
                value="graficos"
                className="rounded-xl px-4 py-2 text-xs font-bold text-stone-300 hover:text-white data-[state=active]:bg-amber-500 data-[state=active]:text-stone-950 data-[state=active]:shadow-lg transition-all"
              >
                <BarChart3 className="size-3.5 mr-1.5" />
                Gráficos &amp; Análise
              </TabsTrigger>
              <TabsTrigger
                value="financeiro"
                className="rounded-xl px-4 py-2 text-xs font-bold text-stone-300 hover:text-white data-[state=active]:bg-amber-500 data-[state=active]:text-stone-950 data-[state=active]:shadow-lg transition-all"
              >
                <Wallet className="size-3.5 mr-1.5" />
                Financeiro SaaS
              </TabsTrigger>
              <TabsTrigger
                value="cupons"
                className="rounded-xl px-4 py-2 text-xs font-bold text-stone-300 hover:text-white data-[state=active]:bg-amber-500 data-[state=active]:text-stone-950 data-[state=active]:shadow-lg transition-all"
              >
                <Tag className="size-3.5 mr-1.5" />
                Cupons &amp; Promoções
              </TabsTrigger>
              <TabsTrigger
                value="updates"
                className="rounded-xl px-4 py-2 text-xs font-bold text-stone-300 hover:text-white data-[state=active]:bg-amber-500 data-[state=active]:text-stone-950 data-[state=active]:shadow-lg transition-all"
              >
                <Smartphone className="size-3.5 mr-1.5" />
                Atualizações App
              </TabsTrigger>
              <TabsTrigger
                value="broadcast"
                className="rounded-xl px-4 py-2 text-xs font-bold text-stone-300 hover:text-white data-[state=active]:bg-amber-500 data-[state=active]:text-stone-950 data-[state=active]:shadow-lg transition-all"
              >
                <Megaphone className="size-3.5 mr-1.5" />
                Avisos Globais
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                className="rounded-xl px-4 py-2 text-xs font-bold text-stone-300 hover:text-white data-[state=active]:bg-amber-500 data-[state=active]:text-stone-950 data-[state=active]:shadow-lg transition-all"
              >
                <FileText className="size-3.5 mr-1.5" />
                Auditoria &amp; Logs
              </TabsTrigger>
            </TabsList>

            {abaAtiva === "tenants" && (
              <Button
                onClick={() => setModalNovoHarasAberto(true)}
                className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md active:scale-95 shrink-0"
              >
                <Plus className="size-4 mr-1.5" />
                Cadastrar Novo Haras
              </Button>
            )}
          </div>

          {/* 1. ABA: GESTÃO DE HARAS & ASSINATURAS */}
          <TabsContent value="tenants" className="space-y-4 m-0">
            {/* Filtros e Busca */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                <Input
                  placeholder="Buscar por nome do haras, responsável, e-mail ou cidade..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 h-11 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filtroPlano}
                  onChange={(e) => setFiltroPlano(e.target.value)}
                  className="h-11 rounded-2xl bg-[#0d1f19] border border-white/15 px-3 text-xs font-bold text-white"
                >
                  <option value="todos">Todos os Planos</option>
                  <option value="potro">Plano Potro</option>
                  <option value="marchador">Plano Marchador</option>
                  <option value="imperial">Plano Imperial</option>
                </select>

                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="h-11 rounded-2xl bg-[#0d1f19] border border-white/15 px-3 text-xs font-bold text-white"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="ativo">Assinatura Ativa</option>
                  <option value="trial">Em Período Trial</option>
                  <option value="pendente">Pagamento Pendente</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            {/* TABELA DE TENANTS */}
            <Card className="rounded-3xl border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03] text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-4 px-5">Haras / Criatório</th>
                      <th className="py-4 px-4">Responsável &amp; Contato</th>
                      <th className="py-4 px-4">Plano Contratado</th>
                      <th className="py-4 px-4">Status &amp; Validade</th>
                      <th className="py-4 px-4 text-right">Ações de Gestão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {harasFiltrados.map((h) => {
                      const plano = PLANOS_DISPONIVEIS[h.plano]
                      const totalMembros = todosOsUsuarios.filter((u) => u.harasId === h.id).length

                      return (
                        <tr key={h.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-xl bg-gradient-to-b from-[#1c4338] to-[#0a1914] border border-amber-500/30 p-1 flex items-center justify-center shrink-0">
                                {h.logoUrl ? (
                                  <img src={h.logoUrl} alt="Logo" className="size-full object-contain" />
                                ) : (
                                  <HarasLogo className="size-full" />
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-white text-sm block">{h.nomeHaras}</span>
                                <span className="text-[11px] text-stone-400">{h.cidadeUf || "Local não informado"}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-semibold text-white block">{h.responsavel}</span>
                            <span className="text-[11px] text-stone-400 font-mono">{h.email}</span>
                            <span className="text-[10px] text-stone-400 block">{totalMembros} membros na equipe</span>
                            {h.telefone && (
                              <span className="text-[10px] text-amber-400 block">{h.telefone}</span>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-bold text-amber-300 block">{plano?.nome}</span>
                            <span className="text-[11px] text-stone-400">
                              R$ {plano?.precoMensal}/mês · Max {h.limiteEquinos} eq.
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={cn(
                                "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border mb-1",
                                h.statusAssinatura === "ativo"
                                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                  : h.statusAssinatura === "trial"
                                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                  : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                              )}
                            >
                              {h.statusAssinatura}
                            </span>
                            <span className="text-[11px] text-stone-400 block font-mono">
                              Expira: {h.dataExpiracao}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => acessarComoSuporte(h)}
                                className="h-8 rounded-xl bg-white/5 border-white/15 hover:bg-white/10 text-xs font-bold text-amber-200"
                                title="Acessar painel do cliente como suporte"
                              >
                                <Eye className="size-3.5 mr-1" />
                                Entrar (Suporte)
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => abrirModalAssinatura(h)}
                                className="h-8 rounded-xl bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-xs font-bold text-amber-300"
                              >
                                Gerenciar
                              </Button>

                              {h.id !== "haras-cardoso-master" && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setHarasParaExcluir(h)}
                                  className="size-8 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                  title="Excluir Haras"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* 2. ABA: GRÁFICOS VISUAIS & ANÁLISE SAAS */}
          <TabsContent value="graficos" className="space-y-6 m-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico 1: Evolução da Receita MRR (Barras SVG Interativas) */}
              <Card className="rounded-3xl border-white/10 bg-white/[0.03] p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                      <TrendingUp className="size-4 text-emerald-400" />
                      Crescimento de Receita (Últimos 6 Meses)
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">Evolução de MRR em Reais (R$)</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    +48% no semestre
                  </span>
                </div>

                <div className="pt-4">
                  <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-white/10 pb-2">
                    {[
                      { mes: "Mar", val: 1200, pct: 30 },
                      { mes: "Abr", val: 1950, pct: 45 },
                      { mes: "Mai", val: 2800, pct: 60 },
                      { mes: "Jun", val: 3600, pct: 75 },
                      { mes: "Jul", val: 4900, pct: 88 },
                      { mes: "Ago", val: 5736, pct: 100 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-[10px] font-mono text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                          R$ {item.val}
                        </span>
                        <div
                          style={{ height: `${item.pct}%` }}
                          className="w-full max-w-[42px] rounded-t-xl bg-gradient-to-t from-amber-600 to-amber-400 group-hover:from-emerald-600 group-hover:to-emerald-400 transition-all shadow-lg"
                        />
                        <span className="text-[11px] font-bold text-stone-400">{item.mes}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Gráfico 2: Distribuição dos Planos */}
              <Card className="rounded-3xl border-white/10 bg-white/[0.03] p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                      <Layers className="size-4 text-amber-400" />
                      Distribuição de Planos Ativos
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">Proporção por tipo de criatório</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-white mb-1">
                      <span>Plano Imperial (Ilimitado - R$ 299/mês)</span>
                      <span className="text-amber-300">{contagemImperial} criatórios</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                      <div
                        style={{ width: `${totalHaras > 0 ? (contagemImperial / totalHaras) * 100 : 50}%` }}
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-white mb-1">
                      <span>Plano Marchador (Até 35 eq. - R$ 179/mês)</span>
                      <span className="text-emerald-300">{contagemMarchador} criatórios</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                      <div
                        style={{ width: `${totalHaras > 0 ? (contagemMarchador / totalHaras) * 100 : 35}%` }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-white mb-1">
                      <span>Plano Potro (Até 10 eq. - R$ 89/mês)</span>
                      <span className="text-sky-300">{contagemPotro} criatórios</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                      <div
                        style={{ width: `${totalHaras > 0 ? (contagemPotro / totalHaras) * 100 : 15}%` }}
                        className="h-full bg-gradient-to-r from-sky-500 to-sky-300 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Monitor de Saúde da Plataforma SaaS */}
            <Card className="rounded-3xl border-white/10 bg-white/[0.03] p-6 shadow-xl">
              <h3 className="font-display text-base font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="size-4 text-emerald-400" />
                Status Operacional da Infraestrutura SaaS
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                    <Server className="size-4" /> Uptime Servidores
                  </div>
                  <span className="text-xl font-bold text-white">99.98%</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">Operação ininterrupta</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
                    <Database className="size-4" /> Latência Média
                  </div>
                  <span className="text-xl font-bold text-white">38ms</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">Tempo de resposta local</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-purple-400 font-bold mb-1">
                    <Smartphone className="size-4" /> PWA &amp; Offline Sync
                  </div>
                  <span className="text-xl font-bold text-emerald-400">Ativo</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">ServiceWorker v1.3.0</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                    <Zap className="size-4" /> Haras Vision IA
                  </div>
                  <span className="text-xl font-bold text-white">Disponível</span>
                  <p className="text-[10px] text-stone-400 mt-0.5">Reconhecimento visual</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* 3. ABA: FINANCEIRO SAAS */}
          <TabsContent value="financeiro" className="space-y-6 m-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="rounded-3xl border-white/10 bg-white/[0.03] p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Assinaturas Pagas</span>
                <p className="font-display text-3xl font-black text-white mt-2">{totalAtivos}</p>
                <p className="text-xs text-stone-400 mt-1">Taxa de adimplência de 98.4%</p>
              </Card>

              <Card className="rounded-3xl border-white/10 bg-white/[0.03] p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Ticket Médio (ARPU)</span>
                <p className="font-display text-3xl font-black text-amber-400 mt-2">
                  R$ {totalAtivos > 0 ? Math.round(mrrEstimado / totalAtivos) : 0}
                </p>
                <p className="text-xs text-stone-400 mt-1">Por criatório ativo/mês</p>
              </Card>

              <Card className="rounded-3xl border-white/10 bg-white/[0.03] p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Gateways Integrados</span>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
                    PIX Instantâneo
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 font-bold text-xs">
                    Cartão de Crédito
                  </span>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* 4. ABA: CUPONS DE DESCONTO */}
          <TabsContent value="cupons" className="space-y-4 m-0">
            <Card className="rounded-3xl border-white/10 bg-white/[0.03] p-6 max-w-3xl">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Tag className="size-5 text-amber-400" />
                Criador de Cupons Promocionais SaaS
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Gere cupons de desconto para novos proprietários de haras usarem no cadastro.
              </p>

              <form onSubmit={handleCriarCupom} className="flex gap-3 mt-4">
                <Input
                  placeholder="CÓDIGO (ex: CAVALOS2026)"
                  value={novoCodigoCupom}
                  onChange={(e) => setNovoCodigoCupom(e.target.value)}
                  className="h-11 rounded-2xl bg-white/5 border-white/15 text-white font-mono uppercase text-xs flex-1"
                  required
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-300">Desconto:</span>
                  <Input
                    type="number"
                    value={novoDescCupom}
                    onChange={(e) => setNovoDescCupom(parseInt(e.target.value) || 0)}
                    className="h-11 w-20 rounded-2xl bg-white/5 border-white/15 text-white text-center font-bold text-xs"
                    min={5}
                    max={100}
                  />
                  <span className="text-xs font-bold text-amber-400">%</span>
                </div>
                <Button type="submit" className="h-11 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs">
                  Criar Cupom
                </Button>
              </form>

              <div className="mt-6 space-y-2">
                {cupons.map((c, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-amber-300 text-sm px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30">
                        {c.codigo}
                      </span>
                      <span className="font-bold text-white">{c.desconto}% de Desconto</span>
                      <span className="text-stone-400">· {c.usos} assinaturas utilizadas</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Ativo
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* 5. ABA: ATUALIZAÇÕES OBRIGATÓRIAS DO APP */}
          <TabsContent value="updates" className="space-y-4 m-0">
            <Card className="rounded-3xl border-white/10 bg-white/[0.03] p-6 max-w-3xl">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Smartphone className="size-5 text-amber-400" />
                Gerenciador de Atualizações Obrigatórias do App (APK)
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Ao publicar uma versão obrigatória, os aplicativos de clientes com versões antigas serão bloqueados até que baixem a nova atualização.
              </p>

              <form onSubmit={handlePublicarAtualizacao} className="space-y-4 mt-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold block mb-1 text-white">Versão Mínima Exigida</label>
                    <Input
                      placeholder="Ex: 2.1.0"
                      value={versaoObrigatoria}
                      onChange={(e) => setVersaoObrigatoria(e.target.value)}
                      className="h-11 rounded-2xl bg-white/5 border-white/15 text-white font-mono font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-white">Bloqueio Ativo?</label>
                    <select
                      value={bloquearAntigas ? "sim" : "nao"}
                      onChange={(e) => setBloquearAntigas(e.target.value === "sim")}
                      className="w-full h-11 rounded-2xl bg-[#0d1f19] border border-white/15 px-3 text-xs font-bold text-white"
                    >
                      <option value="sim">🔒 Sim — Bloquear uso de versões antigas</option>
                      <option value="nao">🔓 Não — Atualização opcional</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-white">Link de Download do APK / Atualização</label>
                  <Input
                    placeholder="/app-release.apk ou https://seu-site.com/app.apk"
                    value={linkApkUpdate}
                    onChange={(e) => setLinkApkUpdate(e.target.value)}
                    className="h-11 rounded-2xl bg-white/5 border-white/15 text-white font-mono text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-white">Notas de Atualização &amp; Changelog</label>
                  <Textarea
                    placeholder="Descreva o que mudou nesta nova versão..."
                    value={notasUpdate}
                    onChange={(e) => setNotasUpdate(e.target.value)}
                    rows={3}
                    className="rounded-2xl bg-white/5 border-white/15 text-white text-xs resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-lg active:scale-95"
                >
                  <RefreshCw className="size-4 mr-1.5" />
                  Publicar Atualização Obrigatória Agora
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* 6. ABA: BROADCAST & AVISOS */}
          <TabsContent value="broadcast" className="space-y-4 m-0">
            <Card className="rounded-3xl border-white/10 bg-white/[0.03] p-6 max-w-2xl">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Megaphone className="size-5 text-amber-400" />
                Transmitir Comunicado Global para Todos os Haras
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                A mensagem será exibida no topo do painel de todos os criatórios cadastrados.
              </p>

              <form onSubmit={handleEnviarBroadcast} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="font-semibold block mb-1 text-white">Tipo de Mensagem</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "novidade", label: "✨ Novidade / Update" },
                      { id: "aviso", label: "⚠️ Aviso Geral" },
                      { id: "manutencao", label: "🛠️ Manutenção" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTipoBroadcast(t.id as any)}
                        className={cn(
                          "p-2.5 rounded-xl border text-center font-bold transition-all text-xs",
                          tipoBroadcast === t.id
                            ? "bg-amber-500 text-stone-950 border-amber-500"
                            : "bg-white/5 border-white/10 text-stone-400 hover:text-white"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-white">Texto do Comunicado</label>
                  <Textarea
                    placeholder="Ex: Nova atualização lançada! Agora você pode usar IA para contagem de estoque e escore corporal..."
                    value={mensagemBroadcast}
                    onChange={(e) => setMensagemBroadcast(e.target.value)}
                    rows={4}
                    className="rounded-2xl bg-white/5 border-white/15 text-white text-xs resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs"
                >
                  <Send className="size-3.5 mr-1.5" />
                  Disparar Mensagem Agora
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* 6. ABA: LOGS & AUDITORIA */}
          <TabsContent value="logs" className="space-y-3 m-0">
            <Card className="rounded-3xl border-white/10 bg-white/[0.03] p-5">
              <h3 className="font-serif text-base font-bold text-white mb-3">Histórico de Eventos Recentes</h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-white">🚀 Novo cadastro de Haras realizado: <strong>Haras Vale da Primavera</strong></span>
                  <span className="text-stone-400 text-[11px] font-mono">Hoje às 10:14</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-white">💳 Assinatura renovada: <strong>Haras Cardoso (Plano Imperial)</strong></span>
                  <span className="text-stone-400 text-[11px] font-mono">Ontem às 18:30</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-white">🤖 Análise com Haras Vision IA executada com sucesso</span>
                  <span className="text-stone-400 text-[11px] font-mono">Ontem às 15:22</span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* MODAL EDITAR ASSINATURA */}
      <Dialog open={modalAssinaturaAberto} onOpenChange={setModalAssinaturaAberto}>
        <DialogContent className="sm:max-w-md bg-[#0d1f19] border border-amber-500/30 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Crown className="size-5 text-amber-400" />
              Gerenciar Assinatura: {harasSelecionado?.nomeHaras}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2 text-xs">
            <div>
              <label className="font-semibold block mb-1 text-white">Status da Assinatura</label>
              <select
                value={novoStatus}
                onChange={(e) => setNovoStatus(e.target.value as StatusAssinatura)}
                className="w-full h-11 rounded-xl bg-white/5 border border-white/15 px-3 text-xs font-bold text-white"
              >
                <option value="ativo">Ativo (Liberado)</option>
                <option value="trial">Trial (Período de Testes)</option>
                <option value="pendente">Pendente de Pagamento</option>
                <option value="cancelado">Cancelado / Bloqueado</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1 text-white">Plano SaaS</label>
              <select
                value={novoPlano}
                onChange={(e) => setNovoPlano(e.target.value as PlanoSaaS)}
                className="w-full h-11 rounded-xl bg-white/5 border border-white/15 px-3 text-xs font-bold text-white"
              >
                <option value="potro">Plano Potro (Até 10 eq.)</option>
                <option value="marchador">Plano Marchador (Até 35 eq.)</option>
                <option value="imperial">Plano Imperial (Ilimitado)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1 text-white">Adicionar Dias de Validade</label>
              <Input
                type="number"
                value={diasAdicionais}
                onChange={(e) => setDiasAdicionais(parseInt(e.target.value) || 0)}
                className="h-11 rounded-xl bg-white/5 border-white/15 text-white font-bold"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setModalAssinaturaAberto(false)} className="rounded-xl text-xs text-stone-300">
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={salvarAlteracaoAssinatura}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs"
              >
                Salvar Alterações
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL CADASTRAR NOVO HARAS */}
      <Dialog open={modalNovoHarasAberto} onOpenChange={setModalNovoHarasAberto}>
        <DialogContent className="sm:max-w-lg bg-[#0d1f19] border border-amber-500/30 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Plus className="size-5 text-amber-400" />
              Cadastrar Novo Haras (Admin)
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCriarNovoHaras} className="space-y-4 mt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1 text-white">Nome do Haras</label>
                <Input
                  placeholder="Ex: Haras Bela Vista"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="h-10 rounded-xl bg-white/5 border-white/15 text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-white">Nome do Responsável</label>
                <Input
                  placeholder="Ex: Roberto Almeida"
                  value={novoResp}
                  onChange={(e) => setNovoResp(e.target.value)}
                  className="h-10 rounded-xl bg-white/5 border-white/15 text-white text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1 text-white">E-mail Principal</label>
                <Input
                  type="email"
                  placeholder="roberto@haras.com"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  className="h-10 rounded-xl bg-white/5 border-white/15 text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-white">Telefone / WhatsApp</label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={novoTel}
                  onChange={(e) => setNovoTel(e.target.value)}
                  className="h-10 rounded-xl bg-white/5 border-white/15 text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold block mb-1 text-white">Plano</label>
                <select
                  value={novoPlanoCad}
                  onChange={(e) => setNovoPlanoCad(e.target.value as PlanoSaaS)}
                  className="w-full h-10 rounded-xl bg-white/5 border border-white/15 px-2 text-xs font-bold text-white"
                >
                  <option value="potro">Potro</option>
                  <option value="marchador">Marchador</option>
                  <option value="imperial">Imperial</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-white">Status</label>
                <select
                  value={novoStatusCad}
                  onChange={(e) => setNovoStatusCad(e.target.value as StatusAssinatura)}
                  className="w-full h-10 rounded-xl bg-white/5 border border-white/15 px-2 text-xs font-bold text-white"
                >
                  <option value="ativo">Ativo</option>
                  <option value="trial">Trial</option>
                  <option value="pendente">Pendente</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-white">Dias de Validade</label>
                <Input
                  type="number"
                  value={novoDiasCad}
                  onChange={(e) => setNovoDiasCad(parseInt(e.target.value) || 30)}
                  className="h-10 rounded-xl bg-white/5 border-white/15 text-white text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setModalNovoHarasAberto(false)} className="rounded-xl text-xs text-stone-300">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={salvandoNovo}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs"
              >
                {salvandoNovo ? "Salvando..." : "Criar Haras"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFIRMAR EXCLUSÃO DE HARAS */}
      {harasParaExcluir && (
        <Dialog open={Boolean(harasParaExcluir)} onOpenChange={(v) => !v && setHarasParaExcluir(null)}>
          <DialogContent className="sm:max-w-md bg-[#0d1f19] border border-rose-500/40 text-white rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="font-display text-lg font-bold text-rose-400 flex items-center gap-2">
                <Trash2 className="size-5 text-rose-500" />
                Excluir Haras Permanentemente?
              </DialogTitle>
            </DialogHeader>

            <p className="text-xs text-stone-300 leading-relaxed mt-2">
              Tem certeza de que deseja excluir <strong>{harasParaExcluir.nomeHaras}</strong> e todos os seus usuários associados? Esta ação não pode ser desfeita.
            </p>

            <DialogFooter className="gap-2 pt-3">
              <Button type="button" variant="ghost" onClick={() => setHarasParaExcluir(null)} className="rounded-xl text-xs text-stone-300">
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  excluirHarasAdmin(harasParaExcluir.id)
                  toast.success(`Haras ${harasParaExcluir.nomeHaras} excluído com sucesso.`)
                  setHarasParaExcluir(null)
                }}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Sim, Excluir Haras
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
