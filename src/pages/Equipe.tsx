import { useState } from "react"
import {
  Check,
  Mail,
  Phone,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { PLANOS_DISPONIVEIS, type CargoMembro, type PermissaoModulo } from "@/lib/types"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const MODULOS_DISPONIVEIS: { id: PermissaoModulo; label: string; descricao: string }[] = [
  { id: "equinos", label: "Plantel & Cavalos", descricao: "Ver e cadastrar equinos, fotos e pedigree" },
  { id: "saude", label: "Saúde & Prontuários", descricao: "Vacinas, vermífugos e casqueamentos" },
  { id: "reproducao", label: "Reprodução & TE", descricao: "Coberturas, gestações e embriões" },
  { id: "alimentacao", label: "Manejo & Estoque", descricao: "Dietas, ração, feno e fichas diárias" },
  { id: "financeiro", label: "Financeiro & Caixa", descricao: "Contas, DRE, recibos e custos (confidencial)" },
  { id: "agenda", label: "Agenda & Eventos", descricao: "Compromissos, visitas e provas" },
  { id: "plantas", label: "Scanner IA de Plantas", descricao: "Identificar plantas tóxicas no pasto" },
  { id: "configuracoes", label: "Configurações do Haras", descricao: "Editar dados do haras e backups" },
]

export function Equipe() {
  const { haras, todosOsUsuarios, criarMembroEquipe, removerMembroEquipe, isOwner } = useAuth()

  const [modalAberto, setModalAberto] = useState(false)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [telefone, setTelefone] = useState("")
  const [cargo, setCargo] = useState<CargoMembro>("tratador")
  const [permissoes, setPermissoes] = useState<PermissaoModulo[]>(["alimentacao", "agenda"])
  const [carregando, setCarregando] = useState(false)

  // Filtra membros deste haras
  const membrosDoHaras = todosOsUsuarios.filter((u) => u.harasId === haras?.id)
  const planoInfo = haras ? PLANOS_DISPONIVEIS[haras.plano] : null
  const limiteMax = haras?.limiteUsuarios || 2
  const podeAdicionar = membrosDoHaras.length < limiteMax

  function togglePermissao(mod: PermissaoModulo) {
    if (permissoes.includes(mod)) {
      setPermissoes(permissoes.filter((p) => p !== mod))
    } else {
      setPermissoes([...permissoes, mod])
    }
  }

  // Predefinição inteligente de permissões baseada no cargo
  function mudarCargo(novoCargo: CargoMembro) {
    setCargo(novoCargo)
    if (novoCargo === "veterinario") {
      setPermissoes(["equinos", "saude", "reproducao", "agenda", "plantas"])
    } else if (novoCargo === "tratador") {
      setPermissoes(["alimentacao", "agenda", "plantas"])
    } else if (novoCargo === "gerente") {
      setPermissoes(["equinos", "saude", "reproducao", "alimentacao", "financeiro", "agenda", "plantas"])
    } else if (novoCargo === "treinador") {
      setPermissoes(["equinos", "agenda"])
    }
  }

  async function handleSalvarMembro(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !email.trim() || !senha) {
      toast.error("Preencha o nome, e-mail e senha inicial do membro.")
      return
    }

    setCarregando(true)
    const res = await criarMembroEquipe({
      nome,
      email,
      senha,
      cargo,
      permissoes,
      telefone,
    })
    setCarregando(false)

    if (res.success) {
      toast.success(`Acesso criado para ${nome}! Ele já pode entrar no sistema.`)
      setModalAberto(false)
      setNome("")
      setEmail("")
      setSenha("")
      setTelefone("")
    } else {
      toast.error(res.error || "Erro ao adicionar membro.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="size-7 text-[#d9b978]" />
            Minha Equipe & Colaboradores
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crie acessos seguros para seus veterinários, tratadores e gerentes com permissões personalizadas.
          </p>
        </div>

        <Button
          onClick={() => setModalAberto(true)}
          disabled={!podeAdicionar}
          className="rounded-2xl bg-[#143129] text-[#d9b978] font-bold text-xs sm:text-sm hover:bg-[#1c4338] shadow-md active:scale-95 transition-all"
        >
          <UserPlus className="mr-2 size-4" />
          Adicionar Colaborador ({membrosDoHaras.length}/{limiteMax})
        </Button>
      </div>

      {/* Card Informativo do Plano */}
      <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-[#143129] text-[#d9b978] flex items-center justify-center border border-[#d9b978]/30">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Seu Haras está no <span className="text-[#d9b978]">{planoInfo?.nome}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Limite de até {limiteMax} membros na equipe simultâneos com isolamento total dos seus dados.
              </p>
            </div>
          </div>
          {!podeAdicionar && (
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
              Limite do plano atingido
            </span>
          )}
        </div>
      </Card>

      {/* Grid de Membros da Equipe */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {membrosDoHaras.map((m) => {
          const isDono = m.role === "tenant_owner" || m.role === "superadmin"
          return (
            <Card
              key={m.id}
              className={cn(
                "rounded-3xl p-6 border backdrop-blur-xl transition-all relative",
                isDono
                  ? "border-[#d9b978]/50 bg-[#143129]/5 dark:bg-[#143129]/20 shadow-md"
                  : "border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "size-12 rounded-2xl flex items-center justify-center font-bold text-lg border",
                      isDono
                        ? "bg-[#143129] text-[#d9b978] border-[#d9b978]/40"
                        : m.cargo === "veterinario"
                        ? "bg-rose-500/15 text-rose-500 border-rose-500/30"
                        : "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                    )}
                  >
                    {m.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-base text-foreground flex items-center gap-1.5">
                      {m.nome}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider inline-block mt-0.5",
                        isDono
                          ? "bg-[#d9b978] text-[#143129]"
                          : m.cargo === "veterinario"
                          ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                          : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {isDono ? "Proprietário (Dono)" : m.cargo?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {!isDono && isOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Deseja remover o acesso de ${m.nome}?`)) {
                        removerMembroEquipe(m.id)
                        toast.success("Membro removido da equipe.")
                      }
                    }}
                    className="text-stone-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Remover membro"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>

              <div className="mt-5 space-y-1.5 text-xs text-muted-foreground border-t border-stone-200/60 dark:border-stone-800/60 pt-4">
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 shrink-0" />
                  <span className="truncate">{m.email}</span>
                </div>
                {m.telefone && (
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Phone className="size-3.5 shrink-0 text-[#d9b978]" />
                    <span>{m.telefone}</span>
                  </div>
                )}
              </div>

              {/* Permissões Ativas */}
              <div className="mt-4 pt-3 border-t border-stone-200/60 dark:border-stone-800/60">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Módulos Liberados
                </p>
                <div className="flex flex-wrap gap-1">
                  {isDono ? (
                    <span className="rounded-md bg-[#143129] text-[#d9b978] px-2 py-0.5 text-[10px] font-bold">
                      Acesso Total Irrestrito
                    </span>
                  ) : (
                    m.permissoes.map((p) => (
                      <span
                        key={p}
                        className="rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 text-[10px] font-semibold"
                      >
                        {MODULOS_DISPONIVEIS.find((md) => md.id === p)?.label || p}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Modal para Adicionar Novo Membro */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-lg bg-background border-stone-200 dark:border-stone-800 rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <UserPlus className="size-5 text-[#d9b978]" />
              Convidar Novo Colaborador
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSalvarMembro} className="space-y-4 mt-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Cargo / Função *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["tratador", "veterinario", "treinador", "gerente"] as CargoMembro[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => mudarCargo(c)}
                    className={cn(
                      "p-2.5 rounded-xl border text-center transition-all capitalize font-semibold text-xs",
                      cargo === c
                        ? "bg-[#143129] text-[#d9b978] border-[#d9b978] shadow-sm font-bold"
                        : "bg-muted text-muted-foreground border-transparent hover:text-foreground"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Nome Completo *</label>
                <Input
                  placeholder="Ex: João da Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="rounded-xl h-11"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">WhatsApp / Celular</label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">E-mail de Login *</label>
                <Input
                  type="email"
                  placeholder="colaborador@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl h-11"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Senha Inicial *</label>
                <Input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="rounded-xl h-11"
                  required
                />
              </div>
            </div>

            {/* Checkbox de Permissões de Módulos */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-2">
                Módulos que este Colaborador pode Acessar:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MODULOS_DISPONIVEIS.map((m) => {
                  const marcado = permissoes.includes(m.id)
                  return (
                    <div
                      key={m.id}
                      onClick={() => togglePermissao(m.id)}
                      className={cn(
                        "flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer select-none transition-all",
                        marcado
                          ? "border-[#143129] bg-[#143129]/5 dark:border-[#d9b978]/40 dark:bg-[#143129]/30"
                          : "border-stone-200 dark:border-stone-800 bg-background hover:bg-muted/50"
                      )}
                    >
                      <div
                        className={cn(
                          "size-4 rounded-md border flex items-center justify-center mt-0.5 shrink-0 transition-colors",
                          marcado
                            ? "bg-[#143129] border-[#143129] text-[#d9b978] dark:bg-[#d9b978] dark:border-[#d9b978] dark:text-[#143129]"
                            : "border-stone-300 dark:border-stone-600"
                        )}
                      >
                        {marcado && <Check className="size-3" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground leading-none">{m.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 truncate">{m.descricao}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setModalAberto(false)}
                className="rounded-xl text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={carregando}
                className="rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs hover:bg-[#1c4338]"
              >
                {carregando ? "Criando..." : "Criar Acesso do Membro"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
