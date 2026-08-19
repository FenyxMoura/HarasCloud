import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { ArrowRight, Building2, Check, CheckCircle2, Lock, Mail, MapPin, Phone, User } from "lucide-react"
import { HarasLogo } from "@/components/icons/HarasLogo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PLANOS_DISPONIVEIS, type PlanoSaaS } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function Registro() {
  const [searchParams] = useSearchParams()
  const planoParam = (searchParams.get("plano") as PlanoSaaS) || "marchador"

  const [nomeHaras, setNomeHaras] = useState("")
  const [responsavel, setResponsavel] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [telefone, setTelefone] = useState("")
  const [cidadeUf, setCidadeUf] = useState("")
  const [plano, setPlano] = useState<PlanoSaaS>(planoParam)
  const [carregando, setCarregando] = useState(false)

  const { registerHaras } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nomeHaras.trim() || !responsavel.trim() || !email.trim() || !senha) {
      toast.error("Preencha todos os campos obrigatórios.")
      return
    }

    setCarregando(true)
    const res = await registerHaras({
      nomeHaras,
      responsavel,
      email,
      senha,
      telefone,
      cidadeUf,
      plano,
    })
    setCarregando(false)

    if (res.success) {
      toast.success("Conta do Haras criada com sucesso! 7 dias grátis ativados.")
      navigate("/app")
    } else {
      toast.error(res.error || "Erro ao registrar o haras.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0d1f19] px-4 py-12 text-[#f7f2e7] relative overflow-hidden">
      {/* Luzes de fundo */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-10 size-[36rem] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[120px]" />
      </div>

      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 active:scale-95 transition-transform">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#0a1914] shadow-lg border border-[#d9b978]/40 p-1.5">
              <HarasLogo className="size-full" />
            </div>
            <div className="text-left">
              <span className="font-display text-2xl font-black tracking-tight text-white block leading-none">
                Haras<span className="text-[#d9b978]">Cloud</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#d9b978] font-bold">
                Criar Novo Haras
              </span>
            </div>
          </Link>
          <p className="text-sm text-white/60 mt-3">
            Inicie seu teste gratuito de 7 dias com acesso a todas as ferramentas
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Escolha de Plano */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-2">Selecione o Plano Desejado</label>
              <div className="grid grid-cols-3 gap-2">
                {(["potro", "marchador", "imperial"] as PlanoSaaS[]).map((pk) => {
                  const p = PLANOS_DISPONIVEIS[pk]
                  const ativo = plano === pk
                  return (
                    <button
                      key={pk}
                      type="button"
                      onClick={() => setPlano(pk)}
                      className={cn(
                        "p-3 rounded-2xl border text-left transition-all relative",
                        ativo
                          ? "bg-[#143129] border-[#d9b978] shadow-md ring-1 ring-[#d9b978]"
                          : "bg-white/5 border-white/10 hover:border-white/20 text-white/70"
                      )}
                    >
                      {ativo && <Check className="size-3 text-[#d9b978] absolute top-2 right-2" />}
                      <p className="font-bold text-xs text-white">{p.nome}</p>
                      <p className="text-[10px] text-[#d9b978] font-semibold mt-1">R$ {p.precoMensal}/mês</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">Nome do seu Haras *</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                  <Input
                    type="text"
                    placeholder="Ex: Haras Santa Fé"
                    value={nomeHaras}
                    onChange={(e) => setNomeHaras(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#d9b978]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">Nome do Responsável *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                  <Input
                    type="text"
                    placeholder="Seu nome completo"
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#d9b978]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">E-mail de Acesso *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#d9b978]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">Criar Senha *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#d9b978]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">WhatsApp / Celular</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                  <Input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#d9b978]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">Cidade e UF</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                  <Input
                    type="text"
                    placeholder="Ex: Campinas - SP"
                    value={cidadeUf}
                    onChange={(e) => setCidadeUf(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#d9b978]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={carregando}
                className="w-full h-12 rounded-xl bg-[#d9b978] text-[#143129] font-bold text-sm shadow-lg shadow-[#d9b978]/20 hover:bg-[#e8c88a] active:scale-95 transition-all"
              >
                {carregando ? "Criando seu Haras..." : "Criar Conta & Iniciar Teste Grátis"}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </form>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-[#d9b978]" /> 7 dias de acesso total
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-[#d9b978]" /> Sem cobrança antecipada
            </span>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-white/60">
          Já possui cadastro?{" "}
          <Link to="/login" className="font-bold text-[#d9b978] hover:underline">
            Entrar na sua conta
          </Link>
        </div>
      </div>
    </div>
  )
}
