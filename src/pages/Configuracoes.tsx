import { useRef, useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Bell,
  Building2,
  CheckCircle2,
  Crown,
  FileText,
  Fingerprint,
  HardDriveDownload,
  HardDriveUpload,
  Smartphone,
  Sparkles,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  WifiOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { HarasLogo } from "@/components/icons/HarasLogo"
import { carregarDadosExemplo, carregarDadosModulos } from "@/lib/dados-exemplo"
import { exportarDados, importarDados, limparTudo } from "@/lib/db"
import { useAuth } from "@/lib/auth-context"
import {
  cadastrarBiometriaAparelho,
  obterBiometriaCadastrada,
  removerBiometriaCadastrada,
  type CredencialBiometrica,
} from "@/lib/biometria"
import {
  isSomHabilitado,
  setSomHabilitado,
  tocarSomAlertaCritico,
  tocarSomSucesso,
  tocarSomNotificacao,
  tocarSomIA,
} from "@/lib/sound-alerts"
import { PLANOS_DISPONIVEIS } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function Configuracoes() {
  const navigate = useNavigate()
  const { usuario, haras, atualizarHaras } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [biometriaSalva, setBiometriaSalva] = useState<CredencialBiometrica | null>(() =>
    obterBiometriaCadastrada()
  )

  const [nomeHaras, setNomeHaras] = useState(haras?.nomeHaras || "Haras Cardoso")
  const [subtitulo, setSubtitulo] = useState(haras?.subtitulo || "Gestão & Genética Equina")
  const [responsavel, setResponsavel] = useState(haras?.responsavel || "")
  const [telefone, setTelefone] = useState(haras?.telefone || "")
  const [cidadeUf, setCidadeUf] = useState(haras?.cidadeUf || "")
  const [logoUrl, setLogoUrl] = useState(haras?.logoUrl || "")
  const [notificacaoDestino, setNotificacaoDestino] = useState<"dono" | "gerente" | "ambos" | "desativado">(
    haras?.notificacaoTarefasDestino || "dono"
  )
  const [somTarefas, setSomTarefas] = useState(haras?.somNotificacaoTarefas ?? true)

  const [exportando, setExportando] = useState(false)
  const [importando, setImportando] = useState(false)
  const [confirmarLimpar, setConfirmarLimpar] = useState(false)
  const [carregandoExemplos, setCarregandoExemplos] = useState(false)
  const [somAtivo, setSomAtivo] = useState(isSomHabilitado())

  useEffect(() => {
    if (haras) {
      setNomeHaras(haras.nomeHaras)
      setSubtitulo(haras.subtitulo || "")
      setResponsavel(haras.responsavel || "")
      setTelefone(haras.telefone || "")
      setCidadeUf(haras.cidadeUf || "")
      setLogoUrl(haras.logoUrl || "")
      setNotificacaoDestino(haras.notificacaoTarefasDestino || "dono")
      setSomTarefas(haras.somNotificacaoTarefas ?? true)
    }
  }, [haras])

  function handleLogoSelecionada(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setLogoUrl(dataUrl)
      atualizarHaras({ logoUrl: dataUrl })
      tocarSomSucesso()
      toast.success("Logomarca do Haras atualizada com sucesso!")
    }
    reader.readAsDataURL(file)
  }

  function removerLogoCustomizada() {
    setLogoUrl("")
    atualizarHaras({ logoUrl: undefined })
    toast.success("Logomarca redefinida para a padrão do Haras Cloud.")
  }

  function salvarPerfilHaras(e: React.FormEvent) {
    e.preventDefault()
    if (!nomeHaras.trim()) {
      toast.error("O nome do Haras não pode ficar vazio.")
      return
    }
    atualizarHaras({
      nomeHaras: nomeHaras.trim(),
      subtitulo: subtitulo.trim(),
      responsavel: responsavel.trim(),
      telefone: telefone.trim(),
      cidadeUf: cidadeUf.trim(),
      logoUrl: logoUrl || undefined,
      notificacaoTarefasDestino: notificacaoDestino,
      somNotificacaoTarefas: somTarefas,
    })
    tocarSomSucesso()
    toast.success("Dados e preferências do Haras atualizados com sucesso!")
  }

  async function exportar() {
    setExportando(true)
    try {
      const json = await exportarDados()
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `backup-${nomeHaras.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Backup exportado com sucesso")
    } catch {
      toast.error("Falha ao exportar o backup")
    } finally {
      setExportando(false)
    }
  }

  async function importarArquivo(file: File) {
    setImportando(true)
    try {
      const texto = await file.text()
      await importarDados(texto)
      toast.success("Dados importados com sucesso!")
      setTimeout(() => navigate("/app"), 600)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Arquivo de backup inválido")
    } finally {
      setImportando(false)
    }
  }

  async function limpar() {
    await limparTudo()
    toast.success("Todos os dados foram removidos")
    setConfirmarLimpar(false)
    setTimeout(() => navigate("/app"), 600)
  }

  const planoAtual = haras ? PLANOS_DISPONIVEIS[haras.plano] : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Configurações do Haras</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Identidade visual, logotipo próprio, alertas para o dono/gerente, app offline e backups.
        </p>
      </div>

      {/* 1. Identidade do Haras & Logotipo Próprio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="rounded-3xl lg:col-span-2 border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl">
          <CardHeader className="pb-3 border-b border-stone-200/60 dark:border-stone-800/60">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Building2 className="size-5 text-[#d9b978]" />
              Identidade &amp; Logotipo do seu Haras
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Box de Logotipo Customizado */}
            <div className="mb-6 p-4 rounded-2xl bg-muted/40 border border-border flex flex-col sm:flex-row items-center gap-4">
              <div className="size-20 rounded-2xl bg-gradient-to-b from-[#1c4338] to-[#0a1914] border border-[#d9b978]/50 p-2 flex items-center justify-center shrink-0 shadow-md overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo Haras" className="size-full object-contain" />
                ) : (
                  <HarasLogo className="size-full" />
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h4 className="font-serif text-sm font-bold text-foreground">Logotipo Oficial do Haras</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sua logo será aplicada na barra lateral, topo no celular, recibos financeiros e contratos A4.
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    className="rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs hover:bg-[#1c4338]"
                  >
                    <Upload className="size-3.5 mr-1.5" />
                    Enviar Logotipo Próprio
                  </Button>
                  {logoUrl && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={removerLogoCustomizada}
                      className="rounded-xl text-rose-500 hover:text-rose-600 text-xs"
                    >
                      <Trash2 className="size-3.5 mr-1" />
                      Remover Logo
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={salvarPerfilHaras} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Nome do Haras</label>
                  <Input
                    value={nomeHaras}
                    onChange={(e) => setNomeHaras(e.target.value)}
                    className="h-11 rounded-xl"
                    placeholder="Ex: Haras Cardoso"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Slogan / Subtítulo</label>
                  <Input
                    value={subtitulo}
                    onChange={(e) => setSubtitulo(e.target.value)}
                    className="h-11 rounded-xl"
                    placeholder="Ex: Criatório de Alta Performance"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Responsável</label>
                  <Input
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    className="h-11 rounded-xl"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">WhatsApp / Telefone</label>
                  <Input
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="h-11 rounded-xl"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Cidade - UF</label>
                  <Input
                    value={cidadeUf}
                    onChange={(e) => setCidadeUf(e.target.value)}
                    className="h-11 rounded-xl"
                    placeholder="Cidade - UF"
                  />
                </div>
              </div>

              {/* Roteamento de Notificação de Tarefas */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Bell className="size-4 text-[#d9b978]" />
                    Quem recebe os alertas de tarefas concluídas pelos tratadores?
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: "dono", label: "👑 Apenas Dono" },
                    { id: "gerente", label: "👔 Apenas Gerente" },
                    { id: "ambos", label: "👥 Dono & Gerente" },
                    { id: "desativado", label: "🔕 Desativado" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setNotificacaoDestino(opt.id as any)}
                      className={cn(
                        "p-2 rounded-xl border text-center font-bold transition-all text-xs",
                        notificacaoDestino === opt.id
                          ? "bg-[#143129] text-[#d9b978] border-[#d9b978] shadow-xs"
                          : "bg-background/80 border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" className="rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs hover:bg-[#1c4338]">
                  Salvar Todas as Configurações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Card do Plano */}
        <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sua Assinatura</span>
              <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-0.5 text-[10px] border border-emerald-500/30">
                {haras?.statusAssinatura === "trial" ? "Trial Grátis" : "Assinatura Ativa"}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-[#143129] text-[#d9b978] flex items-center justify-center border border-[#d9b978]/30 shrink-0">
                <Crown className="size-6" />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-foreground">{planoAtual?.nome}</p>
                <p className="text-xs text-[#d9b978] font-semibold">R$ {planoAtual?.precoMensal}/mês</p>
              </div>
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground border-t border-stone-200/60 dark:border-stone-800/60 pt-3">
              <p>• Limite de até <strong>{haras?.limiteEquinos} equinos</strong></p>
              <p>• Limite de até <strong>{haras?.limiteUsuarios} usuários</strong> na equipe</p>
              <p>• Validade: <strong className="font-mono text-foreground">{haras?.dataExpiracao}</strong></p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-200/60 dark:border-stone-800/60">
            <Button
              variant="outline"
              onClick={() => navigate("/#planos")}
              className="w-full rounded-xl text-xs font-bold"
            >
              Fazer Upgrade de Plano
            </Button>
          </div>
        </Card>
      </div>

      {/* 2. Central de Instalação do App & Funcionamento 100% Offline */}
      <Card className="rounded-3xl border-[#d9b978]/40 bg-gradient-to-br from-[#143129] to-[#0a1914] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8">
          <Smartphone className="size-72 text-[#d9b978]" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d9b978]/20 border border-[#d9b978]/40 text-[#d9b978] text-xs font-bold">
            <WifiOff className="size-3.5" />
            Tecnologia Offline-First para Haras &amp; Fazendas
          </div>

          <h3 className="font-display text-2xl sm:text-3xl font-black text-white leading-tight">
            Baixe o Aplicativo Oficial no Celular para Usar 100% Offline no Campo
          </h3>

          <p className="text-sm text-stone-300 leading-relaxed">
            Nos pastos, piquetes e galpões distantes onde não há sinal de Wi-Fi ou 4G, você e sua equipe continuam
            registrando o trato, fotos, curativos, partos e vacinas sem travar. Assim que o aparelho reconectar à
            internet, todos os dados são sincronizados automaticamente em nuvem!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="font-bold text-[#d9b978] block">1. Abra no Navegador</span>
              <span className="text-stone-400 text-[11px]">Acesse o link do sistema no Safari (iPhone) ou Chrome (Android).</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="font-bold text-[#d9b978] block">2. Adicionar à Tela</span>
              <span className="text-stone-400 text-[11px]">Clique em Compartilhar &gt; "Adicionar à Tela de Início".</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="font-bold text-[#d9b978] block">3. Pronto para Usar</span>
              <span className="text-stone-400 text-[11px]">O ícone do Haras Cloud fica instalado como app nativo com biometria.</span>
            </div>
          </div>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              disabled
              onClick={() => {
                toast.info("Download do APK desativado temporariamente. O aplicativo estará disponível diretamente na Google Play Store.")
              }}
              className="rounded-2xl bg-stone-700/50 text-stone-400 font-bold text-xs cursor-not-allowed opacity-60 border border-stone-600/30"
              title="Download desativado temporariamente"
            >
              <Smartphone className="size-4 mr-1.5" />
              📥 Baixar APK Android (Desativado)
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                toast.info("Para instalar no iPhone ou Android via navegador: abra o menu do navegador e toque em 'Adicionar à Tela de Início'!")
              }}
              className="rounded-2xl bg-white/10 border-white/20 text-white font-bold text-xs hover:bg-white/15"
            >
              <Sparkles className="size-4 mr-1.5 text-[#d9b978]" />
              📱 Instalar via Navegador (PWA Offline)
            </Button>

            <Link to="/apresentacao" target="_blank">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl bg-amber-500/15 border-amber-500/30 text-amber-300 font-bold text-xs hover:bg-amber-500/25"
              >
                <FileText className="size-4 mr-1.5 text-amber-400" />
                📄 Dossiê Executivo &amp; Relatório do Sistema (PDF A4)
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 3. Biometria & Segurança do Aparelho */}
      <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl">
        <CardHeader className="pb-3 border-b border-stone-200/60 dark:border-stone-800/60">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Fingerprint className="size-5 text-[#d9b978]" />
            Biometria &amp; Segurança (Face ID / Impressão Digital)
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Cadastre a biometria deste dispositivo para entrar no sistema em 1 toque sem digitar senha.
          </p>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {biometriaSalva ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-400">Biometria Ativa neste Aparelho</p>
                  <p className="text-[11px] text-stone-300">
                    Dispositivo: {biometriaSalva.dispositivo} (Cadastrado em {biometriaSalva.dataCadastro})
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  removerBiometriaCadastrada()
                  setBiometriaSalva(null)
                  toast.success("Biometria removida deste aparelho.")
                }}
                className="rounded-xl border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold"
              >
                Remover Biometria
              </Button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white">Nenhuma Biometria Cadastrada neste Aparelho</p>
                <p className="text-[11px] text-stone-400">
                  Toque abaixo para vincular o sensor de impressão digital ou FaceID do seu celular ao seu Haras.
                </p>
              </div>
              <Button
                type="button"
                onClick={async () => {
                  if (!usuario) return
                  const res = await cadastrarBiometriaAparelho(usuario.email, usuario.nome)
                  if (res.sucesso) {
                    setBiometriaSalva(obterBiometriaCadastrada())
                    toast.success(res.mensagem)
                  } else {
                    toast.error(res.mensagem)
                  }
                }}
                className="rounded-2xl bg-[#d9b978] hover:bg-[#e8c88a] text-[#143129] font-black text-xs shadow-md shrink-0"
              >
                <Fingerprint className="size-4 mr-1.5" />
                👆 Cadastrar Biometria deste Aparelho
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Efeitos Sonoros e Notificações Inteligentes */}
      <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl">
        <CardHeader className="pb-3 border-b border-stone-200/60 dark:border-stone-800/60 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Volume2 className="size-5 text-[#d9b978]" />
            Efeitos Sonoros &amp; Notificações de Áudio
          </CardTitle>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const novo = !somAtivo
              setSomAtivo(novo)
              setSomHabilitado(novo)
              if (novo) {
                tocarSomSucesso()
                toast.success("Efeitos sonoros ativados!")
              } else {
                toast.info("Efeitos sonoros silenciados.")
              }
            }}
            className="rounded-xl text-xs font-bold"
          >
            {somAtivo ? (
              <>
                <Volume2 className="size-4 mr-1.5 text-emerald-500" />
                Som Ativado
              </>
            ) : (
              <>
                <VolumeX className="size-4 mr-1.5 text-muted-foreground" />
                Silenciado
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => tocarSomAlertaCritico()}
              className="rounded-xl text-xs flex items-center justify-start gap-2"
            >
              🚨 Alerta Crítico (Vacina)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => tocarSomSucesso()}
              className="rounded-xl text-xs flex items-center justify-start gap-2"
            >
              💰 Sucesso / Venda
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => tocarSomNotificacao()}
              className="rounded-xl text-xs flex items-center justify-start gap-2"
            >
              🔔 Lembrete de Tarefa
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => tocarSomIA()}
              className="rounded-xl text-xs flex items-center justify-start gap-2"
            >
              🤖 Ativação Haras Vision
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 4. Backup & Exportação */}
      <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl">
        <CardHeader className="pb-3 border-b border-stone-200/60 dark:border-stone-800/60">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <HardDriveDownload className="size-4.5 text-primary" />
            Backup e Segurança dos Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col gap-2 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Exportar backup completo</p>
              <p className="text-xs text-muted-foreground">
                Gera um arquivo .json seguro contendo todos os equinos, fotos, genealogia, financeiro e tarefas.
              </p>
            </div>
            <Button variant="outline" className="shrink-0 rounded-xl" onClick={exportar} disabled={exportando}>
              <HardDriveDownload className="size-4 mr-1.5" />
              {exportando ? "Exportando…" : "Exportar JSON"}
            </Button>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Restaurar backup</p>
              <p className="text-xs text-muted-foreground">
                Importa os dados de um arquivo salvo anteriormente para este aparelho.
              </p>
            </div>
            <Button variant="outline" className="shrink-0 rounded-xl" onClick={() => inputRef.current?.click()} disabled={importando}>
              <HardDriveUpload className="size-4 mr-1.5" />
              {importando ? "Importando…" : "Escolher arquivo"}
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) importarArquivo(f)
                e.target.value = ""
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 5. Dados de Demonstração */}
      <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl">
        <CardHeader className="pb-3 border-b border-stone-200/60 dark:border-stone-800/60">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Sparkles className="size-4.5 text-primary" />
            Dados de Demonstração &amp; Treinamento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col gap-2 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Povoar com animais e registros de exemplo</p>
              <p className="text-xs text-muted-foreground">
                Gera 5 equinos com fotos, pedigree de 3 gerações, vacinas, vermífugos, estoque e financeiro para testes.
              </p>
            </div>
            <Button
              variant="outline"
              className="shrink-0 rounded-xl"
              disabled={carregandoExemplos}
              onClick={async () => {
                setCarregandoExemplos(true)
                try {
                  toast.loading("Carregando demonstração completa...")
                  await carregarDadosExemplo(true)
                  await carregarDadosModulos(true)
                  toast.dismiss()
                  toast.success("Dados de exemplo carregados!")
                  setTimeout(() => navigate("/app"), 500)
                } catch (e) {
                  toast.dismiss()
                  toast.error("Erro ao carregar dados: " + (e instanceof Error ? e.message : String(e)))
                } finally {
                  setCarregandoExemplos(false)
                }
              }}
            >
              {carregandoExemplos ? "Carregando..." : "Carregar Demonstração"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 6. Zona de perigo */}
      <Card className="rounded-3xl border-destructive/40 bg-destructive/5 dark:bg-destructive/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-lg text-destructive">
            <Trash2 className="size-4.5" />
            Zona de perigo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col gap-2 rounded-2xl border border-destructive/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-destructive">Apagar todos os dados</p>
              <p className="text-xs text-muted-foreground">
                Remove permanentemente todos os equinos, fotos, saúde e financeiro deste aparelho.
              </p>
            </div>
            <Button variant="destructive" className="shrink-0 rounded-xl" onClick={() => setConfirmarLimpar(true)}>
              <Trash2 className="size-4 mr-1.5" />
              Limpar banco
            </Button>
          </div>
        </CardContent>
      </Card>

      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleLogoSelecionada}
      />

      <ConfirmDialog
        open={confirmarLimpar}
        onOpenChange={setConfirmarLimpar}
        titulo="Apagar todos os dados do Haras?"
        descricao="Esta ação é irreversível. Todos os equinos, fotos, vídeos, registros de saúde, reprodução e movimentações financeiras serão excluídos permanentemente."
        confirmText="Sim, apagar tudo"
        destructive={true}
        onConfirm={limpar}
      />
    </div>
  )
}
