import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Baby,
  Camera,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  HeartPulse,
  Menu,
  MessageCircle,
  Sparkles,
  Star,
  Users,
  UtensilsCrossed,
  Wallet,
  X,
} from "lucide-react"
import { HorseIcon } from "@/components/icons/HorseIcon"
import { HarasLogo } from "@/components/icons/HarasLogo"
import { Button } from "@/components/ui/button"
import { PLANOS_DISPONIVEIS, type PlanoSaaS } from "@/lib/types"
import { cn } from "@/lib/utils"

export function LandingPage() {
  const [menuMobileAberto, setMenuMobileAberto] = useState(false)
  const [cicloAnual, setCicloAnual] = useState(true)
  const [qtdCavalos, setQtdCavalos] = useState(25)
  const [custoMensalCabeca, setCustoMensalCabeca] = useState(700)
  const [faqAberto, setFaqAberto] = useState<number | null>(0)
  const [abaRecursoAtiva, setAbaRecursoAtiva] = useState<
    "plantel" | "ia_vision" | "tarefas" | "reproducao" | "saude" | "manejo" | "scanner" | "financeiro" | "equipe"
  >("plantel")

  const scrollTabsRef = useRef<HTMLDivElement>(null)

  function rolarTabs(direcao: "esquerda" | "direita") {
    if (!scrollTabsRef.current) return
    const offset = direcao === "esquerda" ? -280 : 280
    scrollTabsRef.current.scrollBy({ left: offset, behavior: "smooth" })
  }

  // Economia estimada no haras
  const gastoTotalAno = qtdCavalos * custoMensalCabeca * 12
  const economiaEstimadaAno = Math.round(gastoTotalAno * 0.15)

  const RECURSOS_SHOWCASE = {
    plantel: {
      titulo: "Ficha Completa do Cavalo & Pedigree de 3 Gerações",
      subtitulo: "Centralize resenha, fotos em alta definição, microchip, registro e árvore genealógica completa.",
      detalhes: [
        "Árvore genealógica de 3 gerações (Pai, Mãe, Avós e Bisavós)",
        "Emissão oficial de Certificado Studbook em PDF A4 com 1 clique",
        "Galeria de fotos e vídeos em alta resolução para cada animal",
        "Controle de pelagem, temperamento, medidas de cernelha e peso",
      ],
      badge: "Genealogia Completa",
      cor: "text-[#d9b978]",
    },
    ia_vision: {
      titulo: "🤖 Haras Vision IA: Contagem no Galpão, Escore & Feridas",
      subtitulo: "Inteligência artificial visual de alta precisão calibrada especialmente para equinos e estoque.",
      detalhes: [
        "Contagem automática de sacos de ração e fardos de feno por foto no galpão",
        "Avaliação de Escore Corporal Henneke (ECC 1 a 9) com 1 foto lateral",
        "Triagem veterinária imediata de feridas e lesões com orientações de curativo",
        "Reconhecimento visual instantâneo sem necessidade de digitação manual",
      ],
      badge: "Inteligência Artificial Exclusiva",
      cor: "text-amber-400",
    },
    tarefas: {
      titulo: "📋 Manejo & Checklist com Alarme Sonoro no Celular",
      subtitulo: "Controle as rotinas do haras com comprovação fotográfica e avisos para o Dono e Gerente.",
      detalhes: [
        "Cronômetro ao vivo com alarme sonoro alto para o tratador não esquecer horários",
        "Galeria progressiva de fotos das baías e bebedouros cheios durante a ronda",
        "Roteamento seletivo de avisos no celular (Apenas Dono, Gerente ou Ambos)",
        "Histórico de auditoria por data para verificar o serviço executado em qualquer dia",
      ],
      badge: "Manejo & Produtividade",
      cor: "text-emerald-400",
    },
    reproducao: {
      titulo: "🧬 Biotecnologia, TE, Gestações 340 Dias & Protocolo APGAR",
      subtitulo: "Gerencie garanhões, matrizes, receptoras, coletas e contagem regressiva de parto.",
      detalhes: [
        "Controle de Transferência de Embriões (Doadora x Garanhão x Receptora)",
        "Calculadora gestacional de 340 dias com alerta para o piquete de maternidade",
        "Protocolo Neonatal APGAR para avaliação de vitalidade do potro ao nascer",
        "Registro de coletas de sêmen, botijões de nitrogênio e doses congeladas",
      ],
      badge: "Centro Reprodutivo",
      cor: "text-rose-400",
    },
    saude: {
      titulo: "Saúde Preventiva, Calendário Sanitário & Alertas Sonoros",
      subtitulo: "Nunca mais perca o prazo de uma vacina, vermífugo ou casqueamento no seu criatório.",
      detalhes: [
        "Cronograma automático de vacinas (Influenza, Raiva, Tétano, etc.)",
        "Controle de vermifugação com rodízio inteligente de princípios ativos",
        "Histórico de casqueamento e ferrageamento com retorno em 45 dias",
        "Notificações visuais e efeitos sonoros para prazos críticos",
      ],
      badge: "Clínica & Podologia",
      cor: "text-emerald-400",
    },
    manejo: {
      titulo: "Manejo Diário de Ração, Feno & Previsão de Estoque",
      subtitulo: "Cálculo exato de consumo por baia e geração da Ficha do Tratador para WhatsApp.",
      detalhes: [
        "Dietas individualizadas por período (Manhã, Tarde e Noite)",
        "Previsão de dias de autonomia de feno e ração antes do esgotamento",
        "Ficha Diária de Manejo copiada para o WhatsApp do Tratador em 1 segundo",
        "Redução comprovada de até 18% em desperdício de insumos",
      ],
      badge: "Nutrição Eficiente",
      cor: "text-amber-400",
    },
    scanner: {
      titulo: "🌿 Scanner de Plantas Tóxicas nos Pastos por Foto",
      subtitulo: "Tecnologia de visão computacional com IA para proteger a vida dos seus animais no pasto.",
      detalhes: [
        "Aponte a câmera do celular para a planta no piquete ou pasto",
        "Identificação imediata da espécie (ex: Crotalaria, Samambaia, Mascagnia)",
        "Classificação de toxicidade: 🔴 Mortal, 🟡 Atenção ou 🟢 Segura",
        "Protocolo imediato de primeiros socorros veterinários e erradicação",
      ],
      badge: "Botânica Veterinária",
      cor: "text-[#d9b978]",
    },
    financeiro: {
      titulo: "Gestão Financeira, DRE, Contratos & Recibos",
      subtitulo: "Saiba exatamente o custo e o retorno de cada cavalo do seu plantel.",
      detalhes: [
        "Custo rateado por animal (ração, veterinário, ferradura, medicamentos)",
        "Resultado líquido mensal (DRE e Fluxo de Caixa do Haras)",
        "Gerador de Contratos de Compra & Venda e Coberturas com Assinatura Digital",
        "Emissão de Recibos Profissionais de Venda e Prestação de Serviços em A4",
      ],
      badge: "Gestão de Lucro",
      cor: "text-sky-400",
    },
    equipe: {
      titulo: "App 100% Offline nos Pastos, Biometria & Gestão de Equipe",
      subtitulo: "Crie acessos independentes para o Veterinário, Tratadores e Gerente.",
      detalhes: [
        "Funciona 100% offline nos piquetes distantes e sincroniza automático",
        "Login rápido no celular por Digital ou Reconhecimento Facial (Face ID)",
        "O Veterinário acessa prontuários e reprodução com finanças bloqueadas",
        "O Tratador acessa a ficha de ração do dia e tarefas de baia",
      ],
      badge: "Segurança & Equipe",
      cor: "text-violet-400",
    },
  }

  const DEPOIMENTOS = [
    {
      nome: "Dr. Rodrigo Alcantara",
      cargo: "Proprietário & Criador",
      haras: "Haras Vila Real (Campinas/SP)",
      texto: "O Haras Cloud revolucionou a nossa rotina. O controle de vacinas e a ficha de manejo no WhatsApp para os tratadores acabaram com os erros de alimentação. O sistema é extremamente rápido no celular.",
      estrelas: 5,
    },
    {
      nome: "Dra. Juliana Mendes",
      cargo: "Médica Veterinária Especialista em Equinos",
      haras: "Centro de Reprodução Haras Bela Vista",
      texto: "Ter o histórico reprodutivo, as datas de parto e o scanner de plantas com IA na palma da mão no meio do piquete é fantástico. Não consigo mais trabalhar sem o Haras Cloud.",
      estrelas: 5,
    },
    {
      nome: "Marcos Vinicius Ferraz",
      cargo: "Gestor Operacional",
      haras: "Criatório Mangalarga Imperial (MG)",
      texto: "A facilidade de criar acessos para cada peão e tratador sem expor nosso financeiro é o grande diferencial. E o cálculo de feno nos economizou mais de R$ 20 mil no ano.",
      estrelas: 5,
    },
  ]

  const FAQS = [
    {
      p: "O Haras Cloud funciona no celular sem precisar baixar na App Store/Play Store?",
      r: "Sim! O Haras Cloud é um PWA (Progressive Web App) de última geração. Você pode adicioná-lo à tela inicial do seu iPhone ou Android em 1 clique. Ele funciona como um aplicativo nativo, com carregamento instantâneo e sem ocupar a memória do aparelho.",
    },
    {
      p: "Posso usar o sistema em múltiplos haras ou propriedades?",
      r: "Sim! Cada cliente possui seu próprio Haras isolado e seguro. Se você administra mais de uma propriedade, pode alternar entre elas ou convidar gerentes locais para cada unidade.",
    },
    {
      p: "Como funciona o teste gratuito de 7 dias?",
      r: "O cadastro leva menos de 1 minuto e você não precisa cadastrar nenhum cartão de crédito. Você ganha acesso imediato a 100% das ferramentas para usar no seu haras durante 7 dias. Ao final do período, você escolhe se deseja assinar.",
    },
    {
      p: "Como funciona a segurança e o backup dos meus animais?",
      r: "Seus dados contam com criptografia avançada e você pode gerar backups completos em arquivo .JSON ou imprimir relatórios e certificados Studbook em PDF A4 a qualquer instante.",
    },
    {
      p: "Posso exportar relatórios para enviar no WhatsApp dos proprietários de cavalos?",
      r: "Sim! Todas as fichas de saúde, manejo diário de ração, comprovantes financeiros e extratos de custo por animal possuem botões dedicados de compartilhamento e impressão limpa.",
    },
  ]

  return (
    <div className="min-h-screen bg-[#07130f] text-[#f7f2e7] antialiased selection:bg-[#d9b978]/30 selection:text-white font-sans overflow-x-hidden">
      {/* 1. Header / Navbar Comercial Responsiva com Menu Mobile */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07130f]/90 backdrop-blur-2xl px-3.5 py-2.5 sm:px-8 sm:py-3.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          {/* Logo & Marca (Ultra Responsivo) */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 active:scale-95 transition-transform group shrink-0 min-w-0">
            <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl sm:rounded-2xl bg-[#0a1914] shadow-md border border-[#d9b978]/40 group-hover:border-[#d9b978] transition-colors shrink-0 p-1">
              <HarasLogo className="size-full" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-lg sm:text-2xl font-black tracking-tight text-white block leading-none">
                  Haras<span className="text-[#d9b978]">Cloud</span>
                </span>
                <span className="rounded-md bg-[#d9b978]/20 px-1 py-0.2 text-[8px] sm:text-[9px] font-black text-[#d9b978] uppercase tracking-widest border border-[#d9b978]/30">
                  v4.0
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.18em] text-white/50 font-bold block mt-0.5 truncate hidden xs:block">
                Gestão Equina
              </span>
            </div>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden items-center gap-6 xl:gap-8 lg:flex text-xs xl:text-sm font-semibold text-white/70">
            <a href="#recursos" className="hover:text-[#d9b978] transition-colors">Recursos</a>
            <a href="#ia-scanner" className="hover:text-[#d9b978] transition-colors flex items-center gap-1 text-[#d9b978]">
              <Sparkles className="size-3.5" />
              Scanner IA
            </a>
            <a href="#calculadora" className="hover:text-[#d9b978] transition-colors">Simulador</a>
            <a href="#planos" className="hover:text-[#d9b978] transition-colors">Planos</a>
            <a href="#depoimentos" className="hover:text-[#d9b978] transition-colors">Depoimentos</a>
            <a href="#faq" className="hover:text-[#d9b978] transition-colors">Dúvidas</a>
          </nav>

          {/* Ações / Botões (Não Quebram no Celular) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link to="/login">
              <Button
                variant="ghost"
                className="text-xs sm:text-sm font-bold text-white hover:bg-white/10 hover:text-white rounded-xl h-8 sm:h-10 px-2.5 sm:px-4"
              >
                Entrar
              </Button>
            </Link>

            <Link to="/registro">
              <Button className="rounded-xl bg-gradient-to-r from-[#d9b978] to-[#c59e56] h-8 sm:h-10 px-3 sm:px-5 text-xs sm:text-sm font-black text-[#143129] shadow-md shadow-[#d9b978]/20 hover:brightness-110 active:scale-95 transition-all whitespace-nowrap">
                <span className="hidden sm:inline">Testar 7 Dias Grátis</span>
                <span className="sm:hidden">7 Dias Grátis</span>
              </Button>
            </Link>

            {/* Botão Hambúrguer para Celular */}
            <button
              type="button"
              onClick={() => setMenuMobileAberto(!menuMobileAberto)}
              className="lg:hidden p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Abrir menu"
            >
              {menuMobileAberto ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Menu Dropdown no Mobile */}
        {menuMobileAberto && (
          <div className="lg:hidden mt-3 pt-3 border-t border-white/10 space-y-2 pb-2">
            <a
              href="#recursos"
              onClick={() => setMenuMobileAberto(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:bg-white/5 hover:text-[#d9b978]"
            >
              Recursos do Sistema
            </a>
            <a
              href="#ia-scanner"
              onClick={() => setMenuMobileAberto(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-[#d9b978] hover:bg-white/5 flex items-center gap-1.5"
            >
              <Sparkles className="size-3.5" />
              Scanner de Plantas com IA
            </a>
            <a
              href="#calculadora"
              onClick={() => setMenuMobileAberto(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:bg-white/5 hover:text-[#d9b978]"
            >
              Simulador de Economia
            </a>
            <a
              href="#planos"
              onClick={() => setMenuMobileAberto(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:bg-white/5 hover:text-[#d9b978]"
            >
              Planos & Assinaturas
            </a>
            <a
              href="#depoimentos"
              onClick={() => setMenuMobileAberto(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:bg-white/5 hover:text-[#d9b978]"
            >
              Depoimentos de Criadores
            </a>
            <a
              href="#faq"
              onClick={() => setMenuMobileAberto(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:bg-white/5 hover:text-[#d9b978]"
            >
              Dúvidas Frequentes
            </a>
          </div>
        )}
      </header>

      {/* 2. Hero Cinematográfico */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-20 sm:pb-28">
        {/* Luzes dinâmicas de fundo */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 -top-20 size-[30rem] sm:size-[46rem] -translate-x-1/2 rounded-full bg-emerald-600/15 blur-[100px] sm:blur-[140px]" />
          <div className="absolute right-0 top-1/4 size-[20rem] sm:size-[32rem] rounded-full bg-[#d9b978]/15 blur-[90px] sm:blur-[120px]" />
        </div>

        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#d9b978]/40 bg-gradient-to-r from-[#d9b978]/15 via-[#143129]/60 to-[#d9b978]/15 px-3 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-xs font-bold text-[#d9b978] mb-5 shadow-sm backdrop-blur-md max-w-full">
            <Sparkles className="size-3.5 sm:size-4 animate-pulse text-[#d9b978] shrink-0" />
            <span className="truncate">A Ferramenta Mais Avançada para Criadores de Cavalos</span>
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.12] sm:leading-[1.1]">
            A Inteligência que o seu Haras Precisa.{" "}
            <span className="bg-gradient-to-r from-[#f7e4be] via-[#d9b978] to-[#b88c4b] bg-clip-text text-transparent block sm:inline">
              Simples, Rápido e Completo.
            </span>
          </h1>

          <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-sm sm:text-lg text-white/75 leading-relaxed px-2">
            Centralize todo o seu plantel, saúde preventiva, genealogia de 3 gerações, reprodução, financeiro e sua equipe de tratadores em uma única plataforma — no celular ou computador.
          </p>

          <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
            <Link to="/registro" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-[#d9b978] via-[#e2c78e] to-[#c59e56] px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-black text-[#143129] shadow-xl shadow-[#d9b978]/25 hover:brightness-110 active:scale-95 transition-all">
                Iniciar Teste Grátis de 7 Dias
                <ArrowRight className="ml-2 size-4 sm:size-5" />
              </Button>
            </Link>
            <Link to="/apresentacao" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-2xl border-[#d9b978]/40 bg-white/5 px-5 sm:px-7 py-5 sm:py-6 text-sm sm:text-base font-bold text-white backdrop-blur-md hover:bg-white/15 active:scale-95 transition-all"
              >
                <Eye className="mr-2 size-4 sm:size-5 text-[#d9b978]" />
                Ver Demonstração Interativa & Dossiê
              </Button>
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] sm:text-xs font-medium text-white/60">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 sm:size-4 text-[#d9b978]" /> Sem cartão de crédito
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 sm:size-4 text-[#d9b978]" /> Funciona no iPhone e Android
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 sm:size-4 text-[#d9b978]" /> Suporte no WhatsApp
            </span>
          </div>

          {/* Preview Interativo do Haras Cloud */}
          <div className="relative mt-10 sm:mt-14 rounded-[2rem] sm:rounded-[2.5rem] border border-white/20 bg-gradient-to-b from-white/10 to-black/40 p-2 sm:p-4 shadow-2xl shadow-black/80 backdrop-blur-2xl">
            <div className="rounded-[1.5rem] sm:rounded-[2rem] bg-[#0c1f19] p-4 sm:p-8 text-left border border-white/10 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 sm:pb-5">
                <div className="flex items-center gap-3">
                  <div className="size-10 sm:size-12 rounded-xl sm:rounded-2xl bg-[#0a1914] flex items-center justify-center border border-[#d9b978]/40 shadow-inner shrink-0 p-1">
                    <HarasLogo className="size-full" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-base sm:text-xl font-bold text-white truncate">
                      Painel Operacional — Haras Cardoso
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#d9b978] font-semibold truncate">
                      5 Equinos · 2 Gestações · Calendário Sanitário em Dia
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold text-emerald-300 flex items-center gap-1.5 border border-emerald-500/30">
                    <span className="size-1.5 sm:size-2 rounded-full bg-emerald-400 animate-ping" />
                    Haras Cloud Conectado
                  </span>
                </div>
              </div>

              {/* Grid com KPIs em tempo real */}
              <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
                <div className="rounded-xl sm:rounded-2xl bg-white/[0.04] p-3 sm:p-4 border border-white/10">
                  <p className="text-[10px] sm:text-xs font-semibold text-white/60 uppercase tracking-wider">Plantel</p>
                  <p className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">5 <span className="text-[10px] sm:text-xs font-normal text-white/50">cavalos</span></p>
                  <p className="text-[10px] sm:text-[11px] text-emerald-400 mt-1 font-medium truncate">100% vacinados</p>
                </div>

                <div className="rounded-xl sm:rounded-2xl bg-white/[0.04] p-3 sm:p-4 border border-white/10">
                  <p className="text-[10px] sm:text-xs font-semibold text-white/60 uppercase tracking-wider">Gestações / TE</p>
                  <p className="font-display text-2xl sm:text-3xl font-extrabold text-rose-400 mt-1">2 <span className="text-[10px] sm:text-xs font-normal text-white/50">ativas</span></p>
                  <p className="text-[10px] sm:text-[11px] text-rose-300 mt-1 font-medium truncate">Parto em 45 dias</p>
                </div>

                <div className="rounded-xl sm:rounded-2xl bg-white/[0.04] p-3 sm:p-4 border border-white/10">
                  <p className="text-[10px] sm:text-xs font-semibold text-white/60 uppercase tracking-wider">Autonomia Feno</p>
                  <p className="font-display text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1">45 <span className="text-[10px] sm:text-xs font-normal text-white/50">dias</span></p>
                  <p className="text-[10px] sm:text-[11px] text-amber-300 mt-1 font-medium truncate">Estoque seguro</p>
                </div>

                <div className="rounded-xl sm:rounded-2xl bg-white/[0.04] p-3 sm:p-4 border border-white/10">
                  <p className="text-[10px] sm:text-xs font-semibold text-white/60 uppercase tracking-wider">Resultado Mês</p>
                  <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#d9b978] mt-1">R$ 14.850</p>
                  <p className="text-[10px] sm:text-[11px] text-emerald-400 mt-1 font-medium truncate">+18% no caixa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Showcase Interativo dos Módulos */}
      <section id="recursos" className="py-16 sm:py-24 bg-[#050e0b] border-y border-white/5 relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#d9b978]">Tecnologia para Criadores</span>
            <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold text-white mt-1.5 sm:mt-2">
              Todas as Ferramentas que o seu Haras Precisa
            </h2>
            <p className="text-xs sm:text-sm text-white/65 mt-2">
              Abandone papéis e planilhas. Tenha tudo estruturado no padrão internacional.
            </p>
          </div>

          {/* Abas Interativas de Recursos (Barra Horizontal Cinematográfica com Swipe + Setas no Desktop) */}
          <div className="relative max-w-5xl mx-auto group">
            {/* Botão Rolar Esquerda (Desktop) */}
            <button
              type="button"
              onClick={() => rolarTabs("esquerda")}
              className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 size-9 rounded-full bg-[#143129]/90 backdrop-blur-md border border-[#d9b978]/40 text-[#d9b978] shadow-xl items-center justify-center hover:bg-[#1f473c] hover:scale-110 active:scale-95 transition-all cursor-pointer"
              aria-label="Rolar abas para a esquerda"
            >
              <ChevronLeft className="size-4.5" />
            </button>

            {/* Botão Rolar Direita (Desktop) */}
            <button
              type="button"
              onClick={() => rolarTabs("direita")}
              className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 size-9 rounded-full bg-[#143129]/90 backdrop-blur-md border border-[#d9b978]/40 text-[#d9b978] shadow-xl items-center justify-center hover:bg-[#1f473c] hover:scale-110 active:scale-95 transition-all cursor-pointer"
              aria-label="Rolar abas para a direita"
            >
              <ChevronRight className="size-4.5" />
            </button>

            {/* Efeitos de Fade Suave nas Laterais */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#050e0b] to-transparent z-10 hidden sm:block" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#050e0b] to-transparent z-10 hidden sm:block" />

            <div
              ref={scrollTabsRef}
              onWheel={(e) => {
                if (scrollTabsRef.current) {
                  scrollTabsRef.current.scrollLeft += e.deltaY * 0.7
                }
              }}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-2 sm:px-6 scroll-smooth snap-x cursor-grab active:cursor-grabbing"
            >
              {[
                { id: "plantel", label: "Plantel & Pedigree", icon: HorseIcon },
                { id: "ia_vision", label: "Haras Vision IA", icon: Camera },
                { id: "tarefas", label: "Checklist & Alarme", icon: CheckSquare },
                { id: "reproducao", label: "Biotecnologia & TE", icon: Baby },
                { id: "saude", label: "Saúde & Vacinas", icon: HeartPulse },
                { id: "manejo", label: "Manejo & Feno", icon: UtensilsCrossed },
                { id: "scanner", label: "Scanner de Plantas", icon: Sparkles },
                { id: "financeiro", label: "Financeiro & Contratos", icon: Wallet },
                { id: "equipe", label: "Offline & Equipe", icon: Users },
              ].map((tab) => {
                const ativo = abaRecursoAtiva === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAbaRecursoAtiva(tab.id as typeof abaRecursoAtiva)}
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 snap-center border cursor-pointer select-none",
                      ativo
                        ? "bg-[#d9b978] text-[#07130f] border-[#d9b978] shadow-lg shadow-[#d9b978]/25 font-black scale-102"
                        : "bg-[#0b1d16] border-[#d9b978]/20 text-stone-300 hover:text-white hover:border-[#d9b978]/50 hover:bg-[#122b21]"
                    )}
                  >
                    <tab.icon className="size-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Card Detalhado do Recurso Selecionado */}
          {(() => {
            const r = RECURSOS_SHOWCASE[abaRecursoAtiva]
            return (
              <div className="mt-6 sm:mt-8 rounded-2xl sm:rounded-3xl border border-white/15 bg-gradient-to-br from-[#0c1f19] via-[#081511] to-[#040b08] p-5 sm:p-10 shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
                  <div>
                    <span className="rounded-full bg-[#d9b978]/20 px-3 py-0.5 text-[10px] sm:text-xs font-bold text-[#d9b978] border border-[#d9b978]/30 inline-block mb-2 sm:mb-3">
                      {r.badge}
                    </span>
                    <h3 className="font-display text-xl sm:text-3xl font-bold text-white leading-snug">
                      {r.titulo}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70 mt-2 sm:mt-3 leading-relaxed">
                      {r.subtitulo}
                    </p>

                    <div className="mt-5 space-y-2.5 sm:space-y-3">
                      {r.detalhes.map((d) => (
                        <div key={d} className="flex items-start gap-2.5 sm:gap-3">
                          <div className="size-4.5 sm:size-5 rounded-full bg-[#d9b978]/20 text-[#d9b978] flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 mt-0.5 border border-[#d9b978]/30">
                            ✓
                          </div>
                          <span className="text-xs sm:text-sm text-white/85">{d}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 sm:mt-8">
                      <Link to="/registro" className="block sm:inline-block">
                        <Button className="w-full sm:w-auto rounded-xl bg-[#d9b978] text-[#143129] font-bold hover:bg-[#e8c88a] px-6 py-5 text-xs sm:text-sm">
                          Testar este Módulo Grátis
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Demonstração visual do card */}
                  <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-6 backdrop-blur-md">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                      <span className="text-white/60 font-mono text-[11px]">Módulo: {r.badge}</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" /> Sincronizado
                      </span>
                    </div>

                    <div className="mt-4 space-y-2.5 sm:space-y-3">
                      <div className="rounded-xl bg-white/5 p-3 sm:p-4 border border-white/10">
                        <p className="text-xs font-bold text-[#d9b978]">Imperador da Serra (Garanhão Destaque)</p>
                        <p className="text-[11px] sm:text-xs text-white/60 mt-0.5">Mangalarga Marchador · Registro MG-2018-00421 · Tordilho</p>
                        <div className="mt-2.5 flex items-center justify-between text-[10px] sm:text-[11px] text-white/70 border-t border-white/10 pt-2">
                          <span>Última Vacina: Influenza (em dia)</span>
                          <span className="text-emerald-400 font-semibold">100% Apto</span>
                        </div>
                      </div>

                      <div className="rounded-xl bg-white/5 p-3 sm:p-4 border border-white/10">
                        <p className="text-xs font-bold text-[#d9b978]">Estrela do Vale (Matriz / Doadora)</p>
                        <p className="text-[11px] sm:text-xs text-white/60 mt-0.5">Mangalarga · Prenha de Imperador da Serra (60 dias)</p>
                        <div className="mt-2.5 flex items-center justify-between text-[10px] sm:text-[11px] text-white/70 border-t border-white/10 pt-2">
                          <span>Parto Previsto: 15/10/2026</span>
                          <span className="text-rose-300 font-semibold">Gestação Confirmada</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </section>

      {/* 4. Destaque: Scanner IA de Plantas Tóxicas */}
      <section id="ia-scanner" className="py-16 sm:py-24 relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl sm:rounded-[2.5rem] border border-[#d9b978]/40 bg-gradient-to-br from-[#143129] via-[#0d1f19] to-[#08130f] p-6 sm:p-12 relative shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d9b978]/20 px-3 py-0.5 text-[10px] sm:text-xs font-bold text-[#d9b978] border border-[#d9b978]/30">
                  <Sparkles className="size-3.5" />
                  HarasAI Vision
                </span>
                <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white mt-3 leading-tight">
                  Identifique Plantas Venenosas no Pasto Tirando uma Foto
                </h2>
                <p className="text-xs sm:text-base text-white/70 mt-2 sm:mt-3 leading-relaxed">
                  Evite mortes e cólicas fatais no seu plantel. O tratador aponta a câmera do celular para a planta no piquete e a IA faz a triagem botânica instantânea.
                </p>

                <div className="mt-5 space-y-2.5 sm:space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">✓</div>
                    <span className="text-xs sm:text-sm text-white/90">Identificação botânica precisa por Inteligência Artificial</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="size-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">✓</div>
                    <span className="text-xs sm:text-sm text-white/90">Classificação de risco: 🔴 Mortal, 🟡 Atenção ou 🟢 Segura</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="size-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">✓</div>
                    <span className="text-xs sm:text-sm text-white/90">Protocolo imediato de primeiros socorros veterinários</span>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8">
                  <Link to="/registro" className="block sm:inline-block">
                    <Button className="w-full sm:w-auto rounded-xl bg-[#d9b978] text-[#143129] font-bold shadow-lg hover:bg-[#e8c88a] px-6 py-5 text-xs sm:text-sm">
                      Experimentar Scanner com IA
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Demonstração visual do scanner com IA */}
              <div className="rounded-xl sm:rounded-2xl border border-white/15 bg-black/50 p-4 sm:p-6 backdrop-blur-md">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                  <span className="text-white/60 font-mono text-[11px]">Scanner HarasAI #8492</span>
                  <span className="text-rose-400 font-bold flex items-center gap-1 text-[11px]">
                    <span className="size-2 rounded-full bg-rose-500 animate-ping" /> Risco Mortal
                  </span>
                </div>
                <div className="mt-3.5 rounded-xl bg-white/5 p-3.5 sm:p-4 border border-white/10">
                  <p className="text-[10px] uppercase tracking-wider text-white/50">Planta Reconhecida</p>
                  <p className="text-base sm:text-lg font-bold text-white mt-0.5">Crotalária (Crotalaria spectabilis)</p>
                  <p className="text-xs text-rose-300 mt-2 leading-relaxed">
                    ⚠️ <strong>Alerta Clínico:</strong> Causa intoxicação hepática irreversível nos cavalos (alcaloides pirrolizidínicos). Sintomas de cólica e perda de apetite.
                  </p>
                  <div className="mt-3.5 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                    <span>Ação preventiva:</span>
                    <span className="text-[#d9b978] font-bold">Isolar o piquete hoje</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Calculadora Interativa de Economia */}
      <section id="calculadora" className="py-16 sm:py-24 bg-[#050e0b]">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#d9b978]">Retorno do Investimento</span>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mt-1.5 sm:mt-2">
            Simulador de Economia no Seu Haras
          </h2>
          <p className="text-xs sm:text-sm text-white/65 mt-2 max-w-xl mx-auto">
            Descubra quanto você economiza por ano evitando desperdício de ração e falhas em coberturas:
          </p>

          <div className="mt-8 sm:mt-10 rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-10 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
              <div className="space-y-5 sm:space-y-6">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm font-bold text-white">
                    <span>Quantidade de Cavalos</span>
                    <span className="text-[#d9b978] font-mono text-sm sm:text-base">{qtdCavalos} animais</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="100"
                    value={qtdCavalos}
                    onChange={(e) => setQtdCavalos(Number(e.target.value))}
                    className="w-full mt-2 accent-[#d9b978] h-2 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs sm:text-sm font-bold text-white">
                    <span>Custo Médio Mensal por Cabeça</span>
                    <span className="text-[#d9b978] font-mono text-sm sm:text-base">R$ {custoMensalCabeca}</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="2000"
                    step="50"
                    value={custoMensalCabeca}
                    onChange={(e) => setCustoMensalCabeca(Number(e.target.value))}
                    className="w-full mt-2 accent-[#d9b978] h-2 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="rounded-xl sm:rounded-2xl bg-[#143129] p-5 sm:p-7 border border-[#d9b978]/40 text-center shadow-xl">
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#d9b978]">Economia Estimada por Ano</p>
                <p className="font-display text-3xl sm:text-5xl font-black text-white mt-1 sm:mt-2">
                  R$ {economiaEstimadaAno.toLocaleString("pt-BR")}
                </p>
                <p className="text-[11px] sm:text-xs text-white/70 mt-2 leading-relaxed">
                  A assinatura do Haras Cloud se paga logo no primeiro mês de uso!
                </p>
                <Link to="/registro" className="block">
                  <Button className="w-full mt-4 sm:mt-5 rounded-xl bg-[#d9b978] text-[#143129] font-black hover:bg-[#e8c88a] py-5 text-xs sm:text-sm">
                    Garantir essa Economia Agora
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Planos & Assinaturas */}
      <section id="planos" className="py-16 sm:py-24 relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#d9b978]">Transparência Total</span>
          <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold text-white mt-1.5 sm:mt-2">
            Planos Feitos para Cada Tamanho de Haras
          </h2>
          <p className="text-xs sm:text-sm text-white/65 mt-2 max-w-xl mx-auto">
            Comece agora com 7 dias de avaliação gratuita sem necessidade de cartão de crédito.
          </p>

          {/* Toggle Mensal / Anual */}
          <div className="mt-6 sm:mt-9 flex items-center justify-center gap-3">
            <span className={cn("text-xs font-bold", !cicloAnual ? "text-white" : "text-white/50")}>Mensal</span>
            <button
              type="button"
              onClick={() => setCicloAnual(!cicloAnual)}
              className="relative h-7 w-14 sm:h-8 sm:w-16 rounded-full bg-[#143129] p-1 border border-[#d9b978]/50 transition-colors cursor-pointer"
            >
              <div
                className={cn(
                  "size-5 sm:size-6 rounded-full bg-[#d9b978] transition-transform duration-200 shadow-md",
                  cicloAnual ? "translate-x-7 sm:translate-x-8" : "translate-x-0"
                )}
              />
            </button>
            <span className={cn("text-xs font-bold flex items-center gap-1.5", cicloAnual ? "text-white" : "text-white/50")}>
              Anual <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] sm:text-[10px] text-emerald-300 font-bold border border-emerald-500/40">2 Meses Grátis</span>
            </span>
          </div>

          <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 text-left">
            {(Object.keys(PLANOS_DISPONIVEIS) as PlanoSaaS[]).map((planoKey) => {
              const p = PLANOS_DISPONIVEIS[planoKey]
              const preco = cicloAnual ? p.precoAnual : p.precoMensal
              return (
                <div
                  key={p.id}
                  className={cn(
                    "rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 transition-all flex flex-col justify-between relative",
                    p.destaque
                      ? "bg-gradient-to-b from-[#143129] to-[#0d1f19] border-2 border-[#d9b978] shadow-2xl shadow-[#d9b978]/15"
                      : "bg-white/[0.03] border border-white/10 hover:border-white/20"
                  )}
                >
                  {p.destaque && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#d9b978] px-3 sm:px-4 py-1 text-[10px] sm:text-[11px] font-black text-[#143129] uppercase tracking-wider shadow-md">
                      Mais Escolhido
                    </div>
                  )}

                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-white">{p.nome}</h3>
                    <p className="text-xs text-white/65 mt-1 min-h-[28px] sm:min-h-[32px]">{p.subtitulo}</p>

                    <div className="mt-4 sm:mt-6 flex items-baseline gap-1">
                      <span className="text-xs sm:text-sm font-bold text-white/70">R$</span>
                      <span className="font-display text-3xl sm:text-5xl font-black text-white">{preco}</span>
                      <span className="text-xs text-white/50">/ mês</span>
                    </div>
                    {cicloAnual && (
                      <p className="text-[10px] sm:text-[11px] text-emerald-400 mt-1 font-semibold">
                        Faturamento anual (Economize R$ {(p.precoMensal - p.precoAnual) * 12}/ano)
                      </p>
                    )}

                    <div className="mt-5 sm:mt-7 pt-5 sm:pt-6 border-t border-white/10 space-y-2.5 sm:space-y-3">
                      {p.recursos.map((rec) => (
                        <div key={rec} className="flex items-start gap-2 text-xs sm:text-sm text-white/85">
                          <Check className="size-3.5 sm:size-4 text-[#d9b978] shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8">
                    <Link to={`/registro?plano=${p.id}`}>
                      <Button
                        className={cn(
                          "w-full rounded-xl sm:rounded-2xl py-5 sm:py-6 font-black text-xs sm:text-sm transition-all",
                          p.destaque
                            ? "bg-[#d9b978] text-[#143129] hover:bg-[#e8c88a] shadow-lg shadow-[#d9b978]/20"
                            : "bg-white/10 text-white hover:bg-white/20"
                        )}
                      >
                        Iniciar Teste de 7 Dias
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 7. Depoimentos & Prova Social */}
      <section id="depoimentos" className="py-16 sm:py-24 bg-[#050e0b] border-t border-white/5">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#d9b978]">Aprovado por Criadores</span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white mt-1.5 sm:mt-2">
              Quem Usa, Recomenda o Haras Cloud
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {DEPOIMENTOS.map((dep) => (
              <div key={dep.nome} className="rounded-2xl sm:rounded-3xl bg-white/[0.03] border border-white/10 p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[#d9b978] mb-3 sm:mb-4">
                    {Array.from({ length: dep.estrelas }).map((_, i) => (
                      <Star key={i} className="size-3.5 sm:size-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed italic">
                    "{dep.texto}"
                  </p>
                </div>

                <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-white/10">
                  <p className="font-bold text-xs sm:text-sm text-white">{dep.nome}</p>
                  <p className="text-[11px] sm:text-xs text-[#d9b978] font-medium">{dep.cargo}</p>
                  <p className="text-[10px] sm:text-[11px] text-white/50">{dep.haras}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section id="faq" className="py-16 sm:py-24 bg-[#07130f]">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#d9b978]">Dúvidas Frequentes</span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1.5 mb-8 sm:mb-10">Perguntas e Respostas</h2>

          <div className="space-y-3 text-left">
            {FAQS.map((f, i) => (
              <div key={f.p} className="rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setFaqAberto(faqAberto === i ? null : i)}
                  className="flex w-full items-center justify-between p-4 sm:p-5 text-xs sm:text-sm font-bold text-white text-left hover:text-[#d9b978] transition-colors gap-2"
                >
                  <span>{f.p}</span>
                  <ChevronDown className={cn("size-4 shrink-0 transition-transform duration-200", faqAberto === i ? "rotate-180 text-[#d9b978]" : "")} />
                </button>
                {faqAberto === i && (
                  <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-white/70 leading-relaxed border-t border-white/5">
                    {f.r}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Botão Flutuante de WhatsApp */}
      <a
        href="https://wa.me/5511987654321?text=Olá! Gostaria de saber mais sobre o Haras Cloud."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 rounded-full bg-emerald-600 p-3 sm:px-5 sm:py-3.5 text-xs sm:text-sm font-black text-white shadow-2xl hover:bg-emerald-500 active:scale-95 transition-all border border-emerald-400/40"
      >
        <MessageCircle className="size-5" />
        <span className="hidden sm:inline">Falar com Especialista</span>
      </a>

      {/* 10. Footer Oficial Haras Cloud */}
      <footer className="border-t border-white/10 bg-[#040a08] py-8 sm:py-12 text-center text-xs text-white/50">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="size-8 sm:size-9 rounded-xl bg-[#0a1914] flex items-center justify-center border border-[#d9b978]/40 p-1 shrink-0">
              <HarasLogo className="size-full" />
            </div>
            <div className="text-left">
              <span className="font-display font-black text-xs sm:text-sm text-white block leading-none">Haras Cloud</span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-white/40">Plataforma de Gestão Equina</span>
            </div>
          </div>
          <p className="text-[11px]">© {new Date().getFullYear()} Haras Cloud — Todos os direitos reservados.</p>
          <div className="flex items-center gap-4 text-white/70 font-semibold text-[11px] sm:text-xs">
            <Link to="/login" className="hover:text-white">Área do Cliente</Link>
            <Link to="/registro" className="hover:text-white">Criar Conta</Link>
            <a href="#planos" className="hover:text-white">Planos</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
