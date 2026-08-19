import { useState, useRef, useEffect } from "react"
import {
  Bot,
  Maximize2,
  Minus,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react"
import { HarasLogo } from "@/components/icons/HarasLogo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { useEquinosComFotos } from "@/lib/hooks"
import { getSaidas, getEventos, getEstoque } from "@/lib/db"
import { tocarSomIA, isSomHabilitado, setSomHabilitado } from "@/lib/sound-alerts"
import { cn } from "@/lib/utils"

interface MensagemIA {
  id: string
  remetente: "usuario" | "ia"
  texto: string
  timestamp: string
  sugestoes?: string[]
}

const SUGESTOES_INICIAIS = [
  "🐴 Quantos cavalos temos cadastrados no plantel?",
  "💉 Tem alguma vacina ou vermífugo pendente?",
  "🌾 Qual a melhor rotina para prevenir cólica?",
  "💰 Como estão as vendas e faturamento do haras?",
]

export function HarasAICopilot() {
  const { haras, usuario } = useAuth()
  const { equinos } = useEquinosComFotos()
  
  const [aberto, setAberto] = useState(false)
  const [minimizado, setMinimizado] = useState(false)
  const [somLigado, setSomLigado] = useState(isSomHabilitado())
  const [mensagens, setMensagens] = useState<MensagemIA[]>([
    {
      id: "1",
      remetente: "ia",
      texto: `Olá, ${usuario?.nome || "Criador"}! Sou o **HarasAI Copilot**, seu assistente especialista em equinocultura e gestão do ${haras?.nomeHaras || "Haras"}.\n\nEstou conectado ao seu plantel e posso responder sobre a saúde dos animais, agenda, custos ou manejo veterinário. Como posso te ajudar hoje?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sugestoes: SUGESTOES_INICIAIS,
    },
  ])
  const [inputTexto, setInputTexto] = useState("")
  const [digitando, setDigitando] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (aberto && !minimizado) {
      scrollToBottom()
    }
  }, [mensagens, aberto, minimizado])

  function alternarSom() {
    const novo = !somLigado
    setSomLigado(novo)
    setSomHabilitado(novo)
  }

  async function processarRespostaIA(perguntaUsuario: string) {
    setDigitando(true)

    // Coleta dados em tempo real do banco para contextualizar a IA
    const saidas = await getSaidas()
    const eventos = await getEventos()
    const estoque = await getEstoque()

    const equinosAtivos = equinos.filter((e) => e.status === "ativo")
    const machos = equinosAtivos.filter((e) => e.sexo === "macho")
    const femeas = equinosAtivos.filter((e) => e.sexo === "femea")
    const vendidos = saidas.filter((s) => s.motivo === "venda")

    const perguntaLower = perguntaUsuario.toLowerCase()
    let resposta = ""

    if (perguntaLower.includes("quantos cavalo") || perguntaLower.includes("plantel") || perguntaLower.includes("animais")) {
      resposta = `Atualmente o **${haras?.nomeHaras || "Haras"}** conta com **${equinosAtivos.length} equinos ativos** no plantel:\n\n` +
        `• 🐎 **${machos.length} Machos / Garanhões**\n` +
        `• 🌸 **${femeas.length} Fêmeas / Matrizes**\n` +
        `• 💰 **${vendidos.length} Animais comercializados** no histórico.\n\n` +
        `Alguns dos animais registrados são: ${equinosAtivos.slice(0, 4).map((e) => e.nome).join(", ")}${equinosAtivos.length > 4 ? " e outros." : "."}`
    } else if (perguntaLower.includes("vacina") || perguntaLower.includes("vermifugo") || perguntaLower.includes("saude") || perguntaLower.includes("pendente")) {
      resposta = `🔍 **Auditoria Sanitária do Plantel:**\n\n` +
        `Recomendo verificar as carteiras sanitárias na aba **Saúde**. No Brasil, o protocolo vacinal essencial para equinos inclui:\n\n` +
        `1. **Tétano & Encefalomielite:** Reforço anual obrigatório.\n` +
        `2. **Influenza Equina (Gripe):** A cada 6 meses para cavalos de prova/trânsito.\n` +
        `3. **Raiva:** Anual em áreas endêmicas.\n` +
        `4. **Vermifugação Estratégica:** Rodízio de princípios ativos (Ivermectina / Moxidectina / Praziquantel) a cada 90 dias.`
    } else if (perguntaLower.includes("cólica") || perguntaLower.includes("colica") || perguntaLower.includes("dor")) {
      resposta = `⚠️ **Protocolo de Urgência para Cólica Equina:**\n\n` +
        `1. **Sinais Comuns:** Cavalo olhando para o flanco, cavando o chão, deitando e rolando, suor excessivo e ausência de fezes.\n` +
        `2. **Primeiros Socorros Imediatos:**\n` +
        `   • Suspenda imediatamente qualquer alimento e concentrado (ração/grãos).\n` +
        `   • Caminhe suavemente com o animal na guia para estimular o peristaltismo (evite que ele role bruscamente).\n` +
        `   • **NÃO aplique analgésicos sem autorização do veterinário**, pois isso mascara os sintomas de torção.\n` +
        `   • Chame o médico veterinário com urgência máxima.`
    } else if (perguntaLower.includes("venda") || perguntaLower.includes("faturamento") || perguntaLower.includes("financeiro")) {
      const totalVendas = vendidos.reduce((acc, s) => acc + (s.valorVenda || 0), 0)
      resposta = `💰 **Resumo Comercial do Haras:**\n\n` +
        `• Total de animais vendidos: **${vendidos.length}**\n` +
        `• Faturamento acumulado com vendas: **R$ ${totalVendas.toLocaleString("pt-BR")}**\n\n` +
        `Você pode emitir recibos e conferir o fluxo de caixa na aba **Financeiro**.`
    } else if (perguntaLower.includes("estoque") || perguntaLower.includes("racao") || perguntaLower.includes("ração") || perguntaLower.includes("feno") || perguntaLower.includes("alimentacao") || perguntaLower.includes("alimentação")) {
      resposta = `🌾 **Estoque & Nutrição do Haras:**\n\n` +
        `Você possui **${estoque.length} itens cadastrados** no controle de insumos:\n\n` +
        (estoque.length > 0
          ? estoque.map((item) => `• **${item.nome}:** ${item.quantidade} ${item.unidade}`).join("\n")
          : `• *Nenhum item com estoque cadastrado ainda. Cadastre rações e feno na aba Alimentação.*`) +
        `\n\nLembre-se de manter o volumoso fracionado ao longo do dia para evitar sobrecarga gástrica.`
    } else if (perguntaLower.includes("agenda") || perguntaLower.includes("evento") || perguntaLower.includes("hoje")) {
      resposta = `📅 Você tem **${eventos.length} eventos** registrados na sua agenda oficial. Acesse a aba **Agenda** para conferir a grade mensal ou exportar para o seu Google Calendar!`
    } else {
      resposta = `Com base nas melhores práticas da equinocultura e manejo do **${haras?.nomeHaras || "Haras"}**:\n\n` +
        `Para garantir a máxima performance e longevidade dos cavalos, mantenha sempre água limpa à vontade, volumoso de alta qualidade (feno de Tifton ou alfafa) em proporção mínima de 1.5% do peso vivo por dia, e mineralização específica para equinos.\n\n` +
        `Como posso te orientar mais detalhadamente sobre esse tema?`
    }

    setTimeout(() => {
      const novaMsgIA: MensagemIA = {
        id: (Date.now() + 1).toString(),
        remetente: "ia",
        texto: resposta,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setMensagens((prev) => [...prev, novaMsgIA])
      setDigitando(false)
      if (somLigado) tocarSomIA()
    }, 1200)
  }

  function handleEnviar(e?: React.FormEvent, textoCustom?: string) {
    if (e) e.preventDefault()
    const txt = (textoCustom || inputTexto).trim()
    if (!txt) return

    const msgUser: MensagemIA = {
      id: Date.now().toString(),
      remetente: "usuario",
      texto: txt,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMensagens((prev) => [...prev, msgUser])
    setInputTexto("")
    processarRespostaIA(txt)
  }

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50">
      {/* Botão Flutuante quando fechado */}
      {!aberto && (
        <button
          type="button"
          onClick={() => {
            setAberto(true)
            setMinimizado(false)
            if (somLigado) tocarSomIA()
          }}
          className="group relative flex items-center gap-2.5 rounded-full bg-[#143129] border border-[#d9b978]/40 p-3.5 sm:px-5 sm:py-3.5 text-white shadow-2xl hover:scale-105 hover:border-[#d9b978] transition-all active:scale-95"
        >
          <div className="size-6 sm:size-7 flex items-center justify-center rounded-xl bg-[#d9b978]/20 text-[#d9b978]">
            <Bot className="size-4 sm:size-5" />
          </div>
          <span className="hidden sm:inline font-display text-xs font-bold text-[#d9b978] tracking-wide">
            HarasAI Copilot
          </span>
          <span className="absolute -top-1 -right-1 flex size-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-3 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Janela do Assistente IA */}
      {aberto && (
        <div
          className={cn(
            "bg-background/95 backdrop-blur-2xl border border-stone-200 dark:border-stone-800 shadow-2xl rounded-3xl flex flex-col overflow-hidden transition-all duration-300",
            minimizado
              ? "w-72 h-14"
              : "w-[92vw] sm:w-[420px] h-[550px] max-h-[85vh]"
          )}
        >
          {/* Header do Chatbot */}
          <div className="bg-[#143129] px-4 py-3 text-white flex items-center justify-between border-b border-[#d9b978]/20">
            <div className="flex items-center gap-2.5">
              <HarasLogo className="size-7" />
              <div>
                <h3 className="font-display text-xs font-bold text-[#d9b978] flex items-center gap-1.5">
                  HarasAI Copilot
                  <span className="size-2 rounded-full bg-emerald-400 inline-block" />
                </h3>
                <p className="text-[10px] text-white/70">Inteligência Especialista do Haras</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={alternarSom}
                className="p-1.5 rounded-lg text-white/70 hover:text-[#d9b978] hover:bg-white/10 transition-colors"
                title={somLigado ? "Desativar efeitos sonoros" : "Ativar efeitos sonoros"}
              >
                {somLigado ? <Volume2 className="size-4" /> : <VolumeX className="size-4 opacity-50" />}
              </button>

              <button
                type="button"
                onClick={() => setMinimizado(!minimizado)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                {minimizado ? <Maximize2 className="size-3.5" /> : <Minus className="size-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setAberto(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-rose-400 hover:bg-white/10 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {!minimizado && (
            <>
              {/* Corpo de Mensagens */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
                {mensagens.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[85%]",
                      msg.remetente === "usuario" ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "p-3 rounded-2xl leading-relaxed whitespace-pre-wrap",
                        msg.remetente === "usuario"
                          ? "bg-[#143129] text-white rounded-br-none shadow-sm"
                          : "bg-muted border border-border/80 text-foreground rounded-bl-none shadow-sm"
                      )}
                    >
                      {msg.texto}
                    </div>

                    <span className="text-[9px] text-muted-foreground mt-1 px-1">{msg.timestamp}</span>

                    {/* Sugestões de Perguntas Rápidas */}
                    {msg.sugestoes && (
                      <div className="mt-2.5 space-y-1.5 w-full">
                        <p className="text-[10px] font-bold text-[#d9b978] uppercase tracking-wider">
                          Sugestões Rápidas:
                        </p>
                        {msg.sugestoes.map((sug, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleEnviar(undefined, sug)}
                            className="w-full text-left p-2 rounded-xl bg-background/80 hover:bg-muted border border-border text-[11px] text-foreground font-medium transition-colors flex items-center justify-between group"
                          >
                            <span className="truncate">{sug}</span>
                            <Zap className="size-3 text-[#d9b978] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {digitando && (
                  <div className="flex items-center gap-1.5 text-muted-foreground p-2 rounded-xl bg-muted/60 max-w-[120px]">
                    <Sparkles className="size-3.5 text-[#d9b978] animate-spin" />
                    <span className="text-[10px] font-bold">Analisando...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input do Chat */}
              <form
                onSubmit={handleEnviar}
                className="p-3 border-t border-border bg-background flex items-center gap-2"
              >
                <Input
                  placeholder="Pergunte ao HarasAI Copilot..."
                  value={inputTexto}
                  onChange={(e) => setInputTexto(e.target.value)}
                  className="h-10 rounded-2xl text-xs bg-muted/40"
                  disabled={digitando}
                />
                <Button
                  type="submit"
                  disabled={digitando || !inputTexto.trim()}
                  className="size-10 rounded-2xl bg-[#143129] text-[#d9b978] hover:bg-[#1c4338] shrink-0 p-0"
                >
                  <Send className="size-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  )
}
