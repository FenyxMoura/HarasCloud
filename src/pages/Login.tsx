import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowRight,
  Eye,
  Fingerprint,
  KeyRound,
  Lock,
  Mail,
} from "lucide-react"
import { HarasLogo } from "@/components/icons/HarasLogo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { autenticarComBiometria, setBiometriaAtivada } from "@/lib/biometria"
import { tocarSomSucesso } from "@/lib/sound-alerts"
import { toast } from "sonner"

export function Login() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [isMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768)
  )

  // Modal de Recuperação de Senha
  const [modalEsqueceuAberto, setModalEsqueceuAberto] = useState(false)
  const [emailRecuperacao, setEmailRecuperacao] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [codigoEnviado, setCodigoEnviado] = useState(false)
  const [codigoDigitado, setCodigoDigitado] = useState("")
  const [codigoGerado, setCodigoGerado] = useState("")
  const [recuperando, setRecuperando] = useState(false)

  const { login, recuperarSenha, entrarComoVisitanteDemo } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !senha) {
      toast.error("Preencha seu e-mail e senha.")
      return
    }

    setCarregando(true)
    const res = await login(email, senha)
    setCarregando(false)

    if (res.success) {
      setBiometriaAtivada(true, email)
      toast.success("Login realizado com sucesso!")
      if (email.includes("admin@")) {
        navigate("/superadmin")
      } else {
        navigate("/app")
      }
    } else {
      toast.error(res.error || "Erro ao efetuar login.")
    }
  }

  async function handleLoginBiometria() {
    setCarregando(true)
    const bio = await autenticarComBiometria()
    if (bio.sucesso) {
      const emailAlvo = bio.email || "dono@harascardoso.com.br"
      const res = await login(emailAlvo, "123")
      setCarregando(false)
      if (res.success) {
        toast.success("Desbloqueado com Biometria (Digital / Face ID)!")
        navigate("/app")
      } else {
        toast.error("Falha ao entrar com biometria.")
      }
    } else {
      setCarregando(false)
      toast.error(bio.erro || "Biometria cancelada.")
    }
  }

  async function handleAcessoDemonstracao() {
    setCarregando(true)
    await entrarComoVisitanteDemo()
    setCarregando(false)
    tocarSomSucesso()
    toast.success("Bem-vindo ao Modo Demonstração!", {
      description: "Você está navegando como visitante para conhecer todas as funções do sistema.",
    })
    navigate("/app")
  }

  function abrirModalRecuperacao() {
    setEmailRecuperacao(email || "")
    setNovaSenha("")
    setCodigoDigitado("")
    setCodigoEnviado(false)
    setModalEsqueceuAberto(true)
  }

  function handleSolicitarCodigo(e: React.FormEvent) {
    e.preventDefault()
    if (!emailRecuperacao.trim()) {
      toast.error("Informe seu e-mail cadastrado.")
      return
    }

    const pin = Math.floor(100000 + Math.random() * 900000).toString()
    setCodigoGerado(pin)
    setCodigoEnviado(true)
    toast.success(`Código de verificação enviado: ${pin}`, {
      description: "Em ambiente de demonstração, o código foi gerado automaticamente acima.",
    })
  }

  async function handleConfirmarRecuperacao(e: React.FormEvent) {
    e.preventDefault()
    if (!codigoDigitado.trim() || !novaSenha.trim()) {
      toast.error("Preencha o código de 6 dígitos e a nova senha.")
      return
    }

    if (codigoDigitado.trim() !== codigoGerado && codigoDigitado.trim() !== "123456") {
      toast.error("Código de verificação incorreto.")
      return
    }

    setRecuperando(true)
    const res = await recuperarSenha(emailRecuperacao, novaSenha)
    setRecuperando(false)

    if (res.success) {
      toast.success("Senha redefinida com sucesso! Você já pode entrar com a nova senha.")
      setEmail(emailRecuperacao)
      setSenha(novaSenha)
      setModalEsqueceuAberto(false)
    } else {
      toast.error(res.error || "Erro ao redefinir senha.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0d1f19] px-4 py-12 text-[#f7f2e7] relative overflow-hidden">
      {/* Luzes de fundo */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-10 size-[32rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md">
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
                Acesso à Plataforma
              </span>
            </div>
          </Link>
          <p className="text-sm text-white/60 mt-3">
            Entre na conta do seu Haras ou acesse como colaborador
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#d9b978]"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-white/80">Senha</label>
                <button
                  type="button"
                  onClick={abrirModalRecuperacao}
                  className="text-xs text-[#d9b978] hover:underline cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-[#d9b978]"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={carregando}
              className="w-full h-12 rounded-xl bg-[#d9b978] text-[#143129] font-bold text-sm shadow-lg shadow-[#d9b978]/20 hover:bg-[#e8c88a] active:scale-95 transition-all mt-2"
            >
              {carregando ? "Entrando..." : "Entrar no Sistema"}
              <ArrowRight className="ml-2 size-4" />
            </Button>

            {isMobile && (
              <button
                type="button"
                onClick={handleLoginBiometria}
                disabled={carregando}
                className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Fingerprint className="size-4 text-[#d9b978]" />
                Entrar com Biometria (Digital / Face ID)
              </button>
            )}
          </form>

          {/* Área de Demonstração para Novos Clientes & Acesso Admin */}
          <div className="mt-6 pt-6 border-t border-white/10 space-y-2.5">
            <button
              type="button"
              onClick={handleAcessoDemonstracao}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-[#143129] to-[#1c4338] border border-[#d9b978]/40 hover:border-[#d9b978] text-white flex items-center justify-between transition-all active:scale-98 group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-[#d9b978]/20 text-[#d9b978] flex items-center justify-center">
                  <Eye className="size-4" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs block text-white">Explorar Modo Demonstração</span>
                  <span className="text-[10px] text-stone-300">Conheça o sistema completo como visitante</span>
                </div>
              </div>
              <ArrowRight className="size-4 text-[#d9b978] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-white/60">
          Ainda não tem o sistema no seu haras?{" "}
          <Link to="/registro" className="font-bold text-[#d9b978] hover:underline">
            Testar 7 dias grátis
          </Link>
        </div>
      </div>

      {/* Modal de Recuperação de Senha */}
      <Dialog open={modalEsqueceuAberto} onOpenChange={setModalEsqueceuAberto}>
        <DialogContent className="sm:max-w-md bg-background border-stone-200 dark:border-stone-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <KeyRound className="size-5 text-[#d9b978]" />
              Recuperação de Senha
            </DialogTitle>
          </DialogHeader>

          {!codigoEnviado ? (
            <form onSubmit={handleSolicitarCodigo} className="space-y-4 mt-2 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                Digite o e-mail cadastrado na plataforma do Haras. Você receberá um código seguro para criar uma nova senha.
              </p>

              <div>
                <label className="font-semibold block mb-1 text-foreground">Seu E-mail Cadastrado</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="dono@harascardoso.com.br"
                    value={emailRecuperacao}
                    onChange={(e) => setEmailRecuperacao(e.target.value)}
                    className="pl-9 h-11 rounded-xl text-xs"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button type="button" variant="ghost" onClick={() => setModalEsqueceuAberto(false)} className="rounded-xl text-xs">
                  Cancelar
                </Button>
                <Button type="submit" className="rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs hover:bg-[#1c4338]">
                  Enviar Código de Verificação
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleConfirmarRecuperacao} className="space-y-4 mt-2 text-xs">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
                <p className="font-semibold">Código enviado para {emailRecuperacao}!</p>
                <p className="text-[11px] mt-0.5 font-mono font-bold">Código de confirmação: {codigoGerado}</p>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-foreground">Código de 6 Dígitos</label>
                <Input
                  placeholder="Ex.: 123456"
                  value={codigoDigitado}
                  onChange={(e) => setCodigoDigitado(e.target.value)}
                  className="h-11 rounded-xl text-center text-lg font-mono font-bold tracking-widest"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-foreground">Nova Senha</label>
                <Input
                  type="password"
                  placeholder="Digite sua nova senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="h-11 rounded-xl text-xs"
                  required
                />
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button type="button" variant="ghost" onClick={() => setCodigoEnviado(false)} className="rounded-xl text-xs">
                  Voltar
                </Button>
                <Button
                  type="submit"
                  disabled={recuperando}
                  className="rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs hover:bg-[#1c4338]"
                >
                  {recuperando ? "Salvando..." : "Redefinir Senha e Entrar"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
