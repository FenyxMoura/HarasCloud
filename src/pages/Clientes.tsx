import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  FileCheck,
  FileText,
  GraduationCap,
  Home,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  User,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ModalReciboOficial } from "@/components/financeiro/ModalReciboOficial"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { getClientes, salvarCliente, removerCliente, gerarId } from "@/lib/db"
import { useAuth } from "@/lib/auth-context"
import { tocarSomSucesso } from "@/lib/sound-alerts"
import type { ClienteHaras, TipoCliente } from "@/lib/types"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function Clientes() {
  const navigate = useNavigate()
  const { haras } = useAuth()

  const [clientes, setClientes] = useState<ClienteHaras[]>([])
  const [abaAtiva, setAbaAtiva] = useState<"todos" | "pensionista" | "aluno">("todos")
  const [busca, setBusca] = useState("")

  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<ClienteHaras | null>(null)
  const [excluirId, setExcluirId] = useState<string | null>(null)

  // Recibo rápido
  const [modalReciboAberto, setModalReciboAberto] = useState(false)
  const [dadosRecibo, setDadosRecibo] = useState<{
    pagador?: string
    documento?: string
    valor?: number
    referente?: string
  } | undefined>(undefined)

  // Form
  const [nome, setNome] = useState("")
  const [documento, setDocumento] = useState("")
  const [telefone, setTelefone] = useState("")
  const [email, setEmail] = useState("")
  const [tipo, setTipo] = useState<TipoCliente>("pensionista")
  const [numeroBaias, setNumeroBaias] = useState("1")
  const [cavalosHospedados, setCavalosHospedados] = useState<string[]>([])
  const [valorMensalidade, setValorMensalidade] = useState("1500")
  const [diaVencimento, setDiaVencimento] = useState("10")
  const [status, setStatus] = useState<"ativo" | "inadimplente" | "inativo">("ativo")
  const [modalidade, setModalidade] = useState("Marcha & Adestramento")
  const [instrutor, setInstrutor] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    const dados = await getClientes()
    setClientes(dados)
  }

  useEffect(() => {
    carregar()
  }, [])

  // Métricas
  const pensionistas = useMemo(() => clientes.filter((c) => c.tipo === "pensionista"), [clientes])
  const alunos = useMemo(() => clientes.filter((c) => c.tipo === "aluno"), [clientes])
  const receitaMensalEsperada = useMemo(
    () => clientes.filter((c) => c.status === "ativo").reduce((acc, c) => acc + (c.valorMensalidade || 0), 0),
    [clientes]
  )

  function abrirNovo(tipoPredefinido?: TipoCliente) {
    setEditando(null)
    setNome("")
    setDocumento("")
    setTelefone("")
    setEmail("")
    setTipo(tipoPredefinido || (abaAtiva === "aluno" ? "aluno" : "pensionista"))
    setNumeroBaias("1")
    setCavalosHospedados([])
    setValorMensalidade(tipoPredefinido === "aluno" ? "650" : "1800")
    setDiaVencimento("10")
    setStatus("ativo")
    setModalidade("Marcha & Adestramento")
    setInstrutor("")
    setObservacoes("")
    setModalAberto(true)
  }

  function abrirEdicao(c: ClienteHaras) {
    setEditando(c)
    setNome(c.nome)
    setDocumento(c.documento || "")
    setTelefone(c.telefone)
    setEmail(c.email || "")
    setTipo(c.tipo)
    setNumeroBaias(c.numeroBaias?.toString() || "1")
    setCavalosHospedados(c.cavalosHospedados || [])
    setValorMensalidade(c.valorMensalidade?.toString() || "0")
    setDiaVencimento(c.diaVencimento?.toString() || "10")
    setStatus(c.status)
    setModalidade(c.modalidade || "Marcha & Adestramento")
    setInstrutor(c.instrutor || "")
    setObservacoes(c.observacoes || "")
    setModalAberto(true)
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) {
      toast.error("Informe o nome do cliente ou aluno.")
      return
    }

    setSalvando(true)
    try {
      const cliente: ClienteHaras = {
        id: editando ? editando.id : gerarId(),
        harasId: haras?.id || "haras-cardoso-master",
        nome: nome.trim(),
        documento: documento.trim() || undefined,
        telefone: telefone.trim(),
        email: email.trim() || undefined,
        tipo,
        numeroBaias: tipo === "pensionista" ? Number(numeroBaias || 1) : undefined,
        cavalosHospedados: tipo === "pensionista" ? cavalosHospedados : undefined,
        valorMensalidade: valorMensalidade ? Number(valorMensalidade) : 0,
        diaVencimento: diaVencimento ? Number(diaVencimento) : 10,
        status,
        modalidade: tipo === "aluno" ? modalidade : undefined,
        instrutor: tipo === "aluno" ? instrutor : undefined,
        observacoes: observacoes.trim() || undefined,
        createdAt: editando ? editando.createdAt : new Date().toISOString(),
      }

      await salvarCliente(cliente)
      tocarSomSucesso()
      toast.success(editando ? "Cadastro atualizado com sucesso!" : "Cliente cadastrado no Haras!")
      setModalAberto(false)
      carregar()
    } catch {
      toast.error("Erro ao salvar cadastro.")
    } finally {
      setSalvando(false)
    }
  }

  async function handleExcluir() {
    if (!excluirId) return
    await removerCliente(excluirId)
    toast.success("Cadastro removido.")
    setExcluirId(null)
    carregar()
  }

  function emitirReciboCliente(c: ClienteHaras) {
    setDadosRecibo({
      pagador: c.nome,
      documento: c.documento,
      valor: c.valorMensalidade || 0,
      referente:
        c.tipo === "pensionista"
          ? `Hospedagem e Pensão de Baia (${c.numeroBaias || 1} baia(s)) - Mês Atual`
          : `Mensalidade da Escola de Equitação / Hipismo (${c.modalidade || "Aulas"})`,
    })
    setModalReciboAberto(true)
  }

  const clientesFiltrados = clientes.filter((c) => {
    if (abaAtiva !== "todos" && c.tipo !== abaAtiva) return false
    if (!busca) return true
    const termo = busca.toLowerCase()
    return (
      c.nome.toLowerCase().includes(termo) ||
      (c.documento || "").toLowerCase().includes(termo) ||
      c.telefone.toLowerCase().includes(termo)
    )
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="size-7 text-[#d9b978]" />
            Clientes & Alunos de Equitação
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Controle completo de proprietários de cavalos hospedados (pensão de baia) e alunos da escola.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => abrirNovo()}
            className="rounded-2xl bg-[#143129] text-[#d9b978] font-bold text-xs sm:text-sm hover:bg-[#1c4338] shadow-md active:scale-95 transition-all"
          >
            <Plus className="mr-1.5 size-4" />
            Novo Cadastro
          </Button>
        </div>
      </div>

      {/* KPIs Financeiros de Clientes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 p-5 bg-card shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="size-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Receita Mensal Recorrente (MRR)
              </p>
              <p className="font-display text-2xl font-black text-foreground mt-0.5">
                R$ {receitaMensalEsperada.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 p-5 bg-card shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-2xl bg-amber-500/15 text-[#d9b978] flex items-center justify-center">
              <Home className="size-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pensionistas de Baia
              </p>
              <p className="font-display text-2xl font-black text-foreground mt-0.5">
                {pensionistas.length} proprietários
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 p-5 bg-card shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Alunos de Equitação
              </p>
              <p className="font-display text-2xl font-black text-foreground mt-0.5">
                {alunos.length} matriculados
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Abas e Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setAbaAtiva("todos")}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all",
              abaAtiva === "todos"
                ? "bg-[#143129] text-[#d9b978] shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Todos ({clientes.length})
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva("pensionista")}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all",
              abaAtiva === "pensionista"
                ? "bg-[#143129] text-[#d9b978] shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            🏠 Pensionistas de Baia ({pensionistas.length})
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva("aluno")}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all",
              abaAtiva === "aluno"
                ? "bg-[#143129] text-[#d9b978] shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            🏇 Alunos da Escola ({alunos.length})
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 h-10 rounded-2xl text-xs"
          />
        </div>
      </div>

      {/* Grid de Clientes */}
      {clientesFiltrados.length === 0 ? (
        <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 p-12 text-center">
          <Users className="size-12 mx-auto text-stone-400 opacity-60 mb-2" />
          <p className="font-bold text-foreground">Nenhum cadastro encontrado</p>
          <p className="text-xs text-muted-foreground mt-1">
            Cadastre os proprietários de cavalos hospedados e alunos para gerenciar contratos e mensalidades.
          </p>
          <Button
            onClick={() => abrirNovo()}
            className="mt-4 rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs"
          >
            Cadastrar Primeiro Cliente
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientesFiltrados.map((c) => (
            <Card
              key={c.id}
              className="rounded-3xl border-stone-200/80 dark:border-stone-800 p-5 bg-card flex flex-col justify-between hover:shadow-lg transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-10 rounded-2xl bg-[#143129] text-[#d9b978] flex items-center justify-center font-bold text-sm">
                      {c.tipo === "pensionista" ? <Home className="size-5" /> : <GraduationCap className="size-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground leading-tight">{c.nome}</h3>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {c.documento || "Documento não inf."}
                      </span>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border",
                      c.status === "ativo"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : c.status === "inadimplente"
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                        : "bg-stone-500/15 text-stone-500 border-stone-500/30"
                    )}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Mensalidade:</span>
                    <strong className="text-foreground font-mono font-bold text-sm">
                      R$ {c.valorMensalidade?.toLocaleString("pt-BR")} /mês
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Dia do Vencimento:</span>
                    <span className="text-foreground font-semibold">Dia {c.diaVencimento || 10}</span>
                  </div>

                  {c.tipo === "pensionista" && (
                    <div className="flex items-center justify-between">
                      <span>Baias Ocupadas:</span>
                      <span className="text-amber-700 dark:text-amber-300 font-bold">
                        {c.numeroBaias || 1} baia(s)
                      </span>
                    </div>
                  )}

                  {c.tipo === "aluno" && c.modalidade && (
                    <div className="flex items-center justify-between">
                      <span>Modalidade:</span>
                      <span className="text-sky-600 dark:text-sky-400 font-bold">{c.modalidade}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1 text-stone-600 dark:text-stone-400">
                    <Phone className="size-3.5 text-[#d9b978]" />
                    <span>{c.telefone || "Sem telefone"}</span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => emitirReciboCliente(c)}
                  className="rounded-xl h-8 text-[11px] font-bold border-stone-300 dark:border-stone-700"
                  title="Emitir Recibo A4"
                >
                  <FileCheck className="size-3.5 mr-1 text-[#d9b978]" /> Recibo
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/contratos?clienteNome=${encodeURIComponent(c.nome)}&tipo=${c.tipo === "aluno" ? "aulas" : "hospedagem"}&valor=${c.valorMensalidade || 0}`)}
                  className="rounded-xl h-8 text-[11px] font-bold border-stone-300 dark:border-stone-700"
                  title="Gerar Contrato"
                >
                  <FileText className="size-3.5 mr-1 text-emerald-500" /> Contrato
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => abrirEdicao(c)}
                    className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setExcluirId(c.id)}
                    className="size-8 rounded-lg text-rose-500"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Criar / Editar Cliente */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-background border-stone-200 dark:border-stone-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <User className="size-5 text-[#d9b978]" />
              {editando ? "Editar Cadastro de Cliente / Aluno" : "Novo Cliente ou Aluno"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSalvar} className="space-y-4 mt-3">
            {/* Tipo de Cadastro */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Tipo de Cadastro *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTipo("pensionista")}
                  className={cn(
                    "p-3 rounded-2xl border text-left transition-all",
                    tipo === "pensionista"
                      ? "bg-[#143129] border-[#d9b978] text-[#d9b978] font-bold shadow-sm"
                      : "bg-muted border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <Home className="size-4" /> Pensionista de Baia
                  </p>
                  <p className="text-[10px] mt-0.5 opacity-70">Dono de cavalo hospedado</p>
                </button>

                <button
                  type="button"
                  onClick={() => setTipo("aluno")}
                  className={cn(
                    "p-3 rounded-2xl border text-left transition-all",
                    tipo === "aluno"
                      ? "bg-[#143129] border-[#d9b978] text-[#d9b978] font-bold shadow-sm"
                      : "bg-muted border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <GraduationCap className="size-4" /> Aluno de Equitação
                  </p>
                  <p className="text-[10px] mt-0.5 opacity-70">Escola e aulas de marcha/salto</p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Nome Completo *</label>
                <Input
                  placeholder="Ex: Carlos Eduardo de Souza"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">CPF ou CNPJ</label>
                <Input
                  placeholder="000.000.000-00"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">WhatsApp / Telefone *</label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">E-mail</label>
                <Input
                  type="email"
                  placeholder="cliente@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Campos Específicos se Pensionista */}
            {tipo === "pensionista" && (
              <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Home className="size-3.5" /> Detalhes da Hospedagem & Baias
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-foreground block mb-1">Número de Baias</label>
                    <Input
                      type="number"
                      value={numeroBaias}
                      onChange={(e) => setNumeroBaias(e.target.value)}
                      className="h-9 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-foreground block mb-1">Status da Hospedagem</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as "ativo" | "inadimplente" | "inativo")}
                      className="w-full h-9 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs"
                    >
                      <option value="ativo">🟢 Ativo e em dia</option>
                      <option value="inadimplente">🔴 Inadimplente</option>
                      <option value="inativo">⚪ Inativo / Saiu</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Campos Específicos se Aluno */}
            {tipo === "aluno" && (
              <div className="p-3.5 rounded-2xl bg-sky-500/5 border border-sky-500/20 space-y-3">
                <p className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="size-3.5" /> Detalhes do Aluno & Aulas
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-foreground block mb-1">Modalidade</label>
                    <Input
                      placeholder="Ex: Marcha Picada / Hipismo"
                      value={modalidade}
                      onChange={(e) => setModalidade(e.target.value)}
                      className="h-9 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-foreground block mb-1">Instrutor / Professor</label>
                    <Input
                      placeholder="Ex: Prof. Roberto"
                      value={instrutor}
                      onChange={(e) => setInstrutor(e.target.value)}
                      className="h-9 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Financeiro Recorrente */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Valor da Mensalidade (R$)</label>
                <Input
                  type="number"
                  placeholder="Ex: 1800"
                  value={valorMensalidade}
                  onChange={(e) => setValorMensalidade(e.target.value)}
                  className="h-10 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Dia do Vencimento</label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ex: 10"
                  value={diaVencimento}
                  onChange={(e) => setDiaVencimento(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Observações Internas</label>
              <Textarea
                placeholder="Preferências de alimentação do cavalo, restrições médicas do aluno, etc."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={2}
                className="rounded-xl resize-none text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setModalAberto(false)} className="rounded-xl text-xs">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={salvando}
                className="rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs hover:bg-[#1c4338]"
              >
                {salvando ? "Salvando..." : "Salvar Cadastro"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmar Exclusão */}
      <ConfirmDialog
        open={Boolean(excluirId)}
        onOpenChange={(open) => !open && setExcluirId(null)}
        titulo="Remover Cadastro"
        descricao="Tem certeza que deseja excluir este cliente/aluno do sistema?"
        confirmText="Excluir"
        onConfirm={handleExcluir}
        destructive={true}
      />

      {/* Modal de Recibo Rápido */}
      <ModalReciboOficial
        open={modalReciboAberto}
        onOpenChange={setModalReciboAberto}
        dadosIniciais={dadosRecibo}
      />
    </div>
  )
}
