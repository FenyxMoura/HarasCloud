import { Link } from "react-router-dom"
import {
  ArrowLeft,
  Baby,
  Building2,
  Camera,
  CheckCircle2,
  CheckSquare,
  HeartPulse,
  Printer,
  Shield,
  Smartphone,
  Sparkles,
  UtensilsCrossed,
  Wallet,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HarasLogo } from "@/components/icons/HarasLogo"
import { HorseIcon } from "@/components/icons/HorseIcon"

export function ApresentacaoDossie() {
  function handleImprimir() {
    window.print()
  }

  const MODULOS = [
    {
      num: "01",
      icone: HorseIcon,
      titulo: "Gestão de Plantel & Genealogia Zootécnica",
      subtitulo: "Centralização completa de registros, fotos em alta definição e árvore genealógica",
      destaques: [
        "Ficha individual detalhada: chip, pelagem, data de nascimento, registro de associação e resenha.",
        "Árvore genealógica completa de 3 gerações (Pai, Mãe, Avós e Bisavós).",
        "Emissão oficial de Certificado Studbook em PDF A4 com 1 clique.",
        "Galeria de fotos e vídeos progressivos por animal com histórico de evolução.",
      ],
      impacto: "Elimina pastas físicas, previne perda de documentos e valoriza o animal em vendas.",
    },
    {
      num: "02",
      icone: Camera,
      titulo: "Haras Vision IA — Visão Computacional Especializada",
      subtitulo: "Inteligência Artificial exclusiva treinada para rotinas de criatórios e estoques",
      destaques: [
        "Contagem automática de sacos de ração e fardos de feno por foto do depósito no galpão.",
        "Avaliação de Escore de Condição Corporal Henneke (ECC 1 a 9) com 1 foto lateral do animal.",
        "Triagem veterinária imediata de feridas e lesões com protocolo de primeiros socorros.",
        "Zero digitação manual: reconhecimento instantâneo por câmera.",
      ],
      impacto: "Auditoria precisa de estoque sem desvios e monitoramento nutricional sem achismos.",
    },
    {
      num: "03",
      icone: CheckSquare,
      titulo: "Manejo Operacional & Checklist com Alarme Sonoro",
      subtitulo: "Controle rigoroso da rotina diária da equipe de tratadores e peões",
      destaques: [
        "Ronda de baías com conferência de cochos, bebedouros e limpeza de cama.",
        "Registro progressivo de fotos das baias ao longo do turno antes de finalizar a tarefa.",
        "Alarme sonoro configurável emitido no celular do proprietário ou gerente na conclusão.",
        "Auditoria de pontualidade: registro exato do minuto de início e término de cada manejo.",
      ],
      impacto: "Garante que 100% dos animais recebam água e trato na hora certa com prova visual.",
    },
    {
      num: "04",
      icone: Baby,
      titulo: "Biotecnologia Reprodutiva & Transferência de Embriões (TE)",
      subtitulo: "Acompanhamento genético de ponta para matrizes, garanhões e receptoras",
      destaques: [
        "Controle de coletas de sêmen, inseminações artificiais e lavados uterinos de TE.",
        "Banco de embriões criopreservados com linhagem paterna e materna rastreável.",
        "Contagem regressiva de gestação de 340 dias com alertas para início de lactação e parto.",
        "Protocolo APGAR Neonatal para avaliação imediata de vitalidade do potro recém-nascido.",
      ],
      impacto: "Aumento na taxa de prenhez, aproveitamento de receptoras e preservação da linhagem campeã.",
    },
    {
      num: "05",
      icone: HeartPulse,
      titulo: "Saúde Preventiva & Calendário Sanitário Completo",
      subtitulo: "Segurança veterinária total com histórico clínico e controle de imunizações",
      destaques: [
        "Calendário de vacinação obrigatória (Influenza, Tétano, Raiva, Encefalomielite, Garrotilho).",
        "Controle de vermifugação inteligente com histórico para evitar resistência parasitária.",
        "Ficha clínica completa: ferrageamento, odontologia equina, cirurgias e exames de AIE/Mormo.",
        "Alertas preventivos para evitar animais com vacinas vencidas em trânsito (GTA).",
      ],
      impacto: "Prevenção de surtos sanitários, redução de custos com emergências e conformidade legal.",
    },
    {
      num: "06",
      icone: UtensilsCrossed,
      titulo: "Nutrição Equina & Autonomia de Estoque de Feno",
      subtitulo: "Planejamento alimentar científico com previsão de consumo e alertas de compra",
      destaques: [
        "Cálculo automático de autonomia do galpão em dias (ex: '45 dias de estoque seguro').",
        "Dietas balanceadas por categoria: potros em crescimento, éguas lactantes e animais de prova.",
        "Avisos automáticos de ponto de reposição para evitar falta de volumoso ou ração concentrada.",
      ],
      impacto: "Economia de até 15% na compra antecipada de insumos e saúde gastrointestinal preservada.",
    },
    {
      num: "07",
      icone: Sparkles,
      titulo: "Scanner IA de Plantas Tóxicas nos Pastos",
      subtitulo: "Identificação botânica em tempo real para proteção do rebanho nos piquetes",
      destaques: [
        "Reconhecimento por foto de plantas venenosas (Maconha-brava, Palicourea, Crotalária, etc.).",
        "Guia veterinário com grau de toxicidade, sintomas clínicos e procedimentos de emergência.",
        "Mapeamento de piquetes seguros para soltura de éguas com cria e potros jovens.",
      ],
      impacto: "Proteção contra cólicas tóxicas, abortos espontâneos e mortes súbitas no pasto.",
    },
    {
      num: "08",
      icone: Wallet,
      titulo: "Gestão Financeira, DRE & Contratos Digitais",
      subtitulo: "Controle financeiro especializado no agronegócio equestre com emissão de documentos",
      destaques: [
        "DRE Gerencial e Fluxo de Caixa com cálculo de custo médio mensal por cabeça (R$/cavalo).",
        "Centro de custos individualizado: saiba exatamente quanto cada cavalo gasta por mês.",
        "Gerador de Contratos Oficiais com modelo A4: Compra e Venda, Cobertura/Sêmen e Pensão/Estábulo.",
        "Emissão de recibos e espelhos de pagamento com 1 toque.",
      ],
      impacto: "Visão clara do lucro do criatório, precificação correta de coberturas e segurança jurídica.",
    },
    {
      num: "09",
      icone: Building2,
      titulo: "Instalações, Piquetes & Vitrine de Leilões",
      subtitulo: "Organização física das baias e canal de comercialização de lotes para compradores",
      destaques: [
        "Mapa de ocupação de baias, maternidade, quarentena e piquetes de pastejo.",
        "Vitrine de Leilões com exibição de lotes, vídeos de marcha, pedigree e captação de lances.",
        "Apresentação profissional do haras para investidores e clientes em dias de visita.",
      ],
      impacto: "Maximização da taxa de conversão em vendas de coberturas, embriões e animais montados.",
    },
    {
      num: "10",
      icone: Smartphone,
      titulo: "Aplicativo Offline-First com Biometria no Celular",
      subtitulo: "Operação garantida mesmo no meio do pasto sem sinal de internet ou Wi-Fi",
      destaques: [
        "Banco de dados local no aparelho: lança vacinas, fotos e tarefas 100% offline.",
        "Sincronização em nuvem automática e em tempo real assim que detectar conexão.",
        "Login biométrico seguro por Digital (Touch ID) ou Reconhecimento Facial (Face ID).",
        "Disponível como Aplicativo Android (.APK nativo) e Aplicativo Web Instalável (PWA).",
      ],
      impacto: "A equipe trabalha no campo sem desculpas de falta de sinal e os dados chegam ao dono na hora.",
    },
  ]

  return (
    <div className="min-h-screen bg-[#07130f] text-stone-100 print:bg-white print:text-stone-900 selection:bg-[#d9b978] selection:text-[#07130f]">
      {/* Barra de Ações Superior (Oculta na Impressão) */}
      <header className="sticky top-0 z-50 bg-[#0d1f19]/90 backdrop-blur-xl border-b border-[#d9b978]/30 px-4 py-3 print:hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/app">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-white/20 text-stone-200 hover:text-white bg-white/5 hover:bg-white/10 text-xs font-bold"
            >
              <ArrowLeft className="size-4 mr-1.5" />
              Voltar ao Painel
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleImprimir}
              className="rounded-xl bg-[#d9b978] hover:bg-[#e8c88a] text-[#07130f] font-black text-xs shadow-lg shadow-[#d9b978]/20 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="size-4 mr-1.5" />
              Imprimir / Salvar em PDF A4
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo do Dossiê Oficial */}
      <main className="max-w-5xl mx-auto px-6 py-10 print:p-0 print:max-w-full">
        {/* Capa Executiva do Dossiê */}
        <section className="text-center pb-12 border-b border-white/10 print:border-stone-300 print:pb-8">
          <div className="flex justify-center mb-6">
            <div className="flex size-20 items-center justify-center rounded-3xl bg-[#143129] border-2 border-[#d9b978] shadow-2xl p-2 print:border-stone-800">
              <HarasLogo className="size-full" />
            </div>
          </div>

          <span className="text-xs font-black uppercase tracking-[0.3em] text-[#d9b978] print:text-amber-700">
            Dossiê Executivo Oficial · Apresentação Comercial
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-white mt-3 print:text-stone-950">
            Haras<span className="text-[#d9b978] print:text-amber-700">Cloud</span>
          </h1>
          <p className="text-base sm:text-lg text-stone-300 max-w-2xl mx-auto mt-3 print:text-stone-700 leading-relaxed">
            A Plataforma Inteligente Mais Completa para Gestão de Criatórios de Cavalos, Genealogia, Reprodução e Manejo.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs text-stone-400 print:text-stone-600 font-medium">
            <span className="flex items-center gap-1.5">
              <Shield className="size-4 text-[#d9b978]" /> Padrão Internacional Studbook
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Zap className="size-4 text-[#d9b978]" /> Haras Vision IA Integrada
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Smartphone className="size-4 text-[#d9b978]" /> 100% Offline nos Pastos
            </span>
          </div>
        </section>

        {/* Resumo Executivo da Solução */}
        <section className="py-10 border-b border-white/10 print:border-stone-300 print:py-6">
          <h2 className="font-display text-2xl font-bold text-white print:text-stone-950 mb-3">
            O que é o Haras Cloud?
          </h2>
          <p className="text-sm text-stone-300 print:text-stone-700 leading-relaxed">
            O <strong>Haras Cloud</strong> é um ecossistema tecnológico completo desenvolvido especificamente para atender as demandas zootécnicas, operacionais, sanitárias e financeiras de criatórios de cavalos de elite e centros de treinamento. Substitui cadernos de papel, planilhas dispersas e mensagens informais de WhatsApp por uma central de inteligência unificada acessível pelo computador e pelo aplicativo móvel.
          </p>
        </section>

        {/* Grade Detalhada dos 10 Módulos */}
        <section className="py-10 space-y-8 print:py-6 print:space-y-6">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-black uppercase tracking-widest text-[#d9b978] print:text-amber-700">
              Arquitetura Funcional
            </span>
            <h2 className="font-display text-3xl font-black text-white print:text-stone-950 mt-1">
              Os 10 Pilares do Sistema
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {MODULOS.map((m) => (
              <Card
                key={m.num}
                className="p-6 rounded-3xl bg-[#0b1d16] border border-[#d9b978]/30 print:bg-white print:border-stone-300 print:shadow-none shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#d9b978] text-[#07130f] font-black text-lg shadow-md">
                    <m.icone className="size-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#d9b978] print:text-amber-700">
                        Módulo {m.num}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white print:text-stone-950 mt-0.5">
                      {m.titulo}
                    </h3>
                    <p className="text-xs text-stone-300 print:text-stone-600 mt-1">
                      {m.subtitulo}
                    </p>

                    {/* Lista de Recursos Chave */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-xs">
                      {m.destaques.map((d, i) => (
                        <div key={i} className="flex items-start gap-2 text-stone-200 print:text-stone-800">
                          <CheckCircle2 className="size-3.5 text-[#d9b978] shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>

                    {/* Impacto no Criatório */}
                    <div className="mt-4 p-3 rounded-2xl bg-white/5 print:bg-stone-100 border border-white/10 print:border-stone-200 text-xs">
                      <p className="text-[#d9b978] print:text-amber-800 font-bold">
                        🎯 Impacto Prático no Haras:
                      </p>
                      <p className="text-stone-300 print:text-stone-700 mt-0.5">{m.impacto}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Tabela Comparativa de Planos */}
        <section className="py-10 border-t border-white/10 print:border-stone-300 print:py-6">
          <h2 className="font-display text-2xl font-bold text-white print:text-stone-950 text-center mb-6">
            Planos de Assinatura &amp; Capacidade
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-5 rounded-3xl bg-[#0b1d16] border border-white/15 print:bg-white print:border-stone-300">
              <h3 className="font-bold text-base text-white print:text-stone-950">Plano Potro</h3>
              <p className="text-stone-400 mt-0.5">Criatórios Iniciantes</p>
              <p className="font-display text-2xl font-black text-[#d9b978] mt-3">R$ 89<span className="text-xs font-normal text-stone-400">/mês</span></p>
              <ul className="mt-4 space-y-2 text-stone-300 print:text-stone-700">
                <li>✓ Até 10 equinos cadastrados</li>
                <li>✓ 2 acessos de equipe</li>
                <li>✓ Manejo, vacinas e fichas</li>
                <li>✓ Acesso Mobile Offline</li>
              </ul>
            </div>

            <div className="p-5 rounded-3xl bg-[#143129] border-2 border-[#d9b978] print:bg-white print:border-stone-800 shadow-xl relative">
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#d9b978] text-[#07130f] font-black text-[10px] uppercase tracking-wider">
                Mais Escolhido
              </span>
              <h3 className="font-bold text-base text-white print:text-stone-950">Plano Marchador</h3>
              <p className="text-stone-300 mt-0.5">Haras Profissionais</p>
              <p className="font-display text-2xl font-black text-[#d9b978] mt-3">R$ 179<span className="text-xs font-normal text-stone-400">/mês</span></p>
              <ul className="mt-4 space-y-2 text-stone-200 print:text-stone-800 font-medium">
                <li>✓ Até 35 equinos cadastrados</li>
                <li>✓ 6 acessos de equipe</li>
                <li>✓ Biotecnologia &amp; TE completa</li>
                <li>✓ Financeiro, DRE e Contratos</li>
                <li>✓ Alertas Sonoros e Checklist</li>
              </ul>
            </div>

            <div className="p-5 rounded-3xl bg-[#0b1d16] border border-white/15 print:bg-white print:border-stone-300">
              <h3 className="font-bold text-base text-white print:text-stone-950">Plano Imperial</h3>
              <p className="text-stone-400 mt-0.5">Grandes Centros &amp; Leilões</p>
              <p className="font-display text-2xl font-black text-[#d9b978] mt-3">R$ 299<span className="text-xs font-normal text-stone-400">/mês</span></p>
              <ul className="mt-4 space-y-2 text-stone-300 print:text-stone-700">
                <li>✓ Equinos ILIMITADOS</li>
                <li>✓ Usuários ILIMITADOS</li>
                <li>✓ Haras Vision IA Ilimitada</li>
                <li>✓ Vitrine de Leilões Públicos</li>
                <li>✓ Suporte VIP 24/7</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Rodapé Oficial para Assinatura e Contato */}
        <footer className="pt-10 pb-6 border-t border-white/10 print:border-stone-300 text-center text-xs text-stone-400 print:text-stone-600 space-y-2">
          <p className="font-bold text-white print:text-stone-950">
            Haras Cloud — Tecnologia Zootécnica para o Agronegócio Equestre
          </p>
          <p>Documento gerado para fins de apresentação comercial e auditoria de implantação.</p>
          <p className="text-[10px] font-mono text-stone-500">Versão do Sistema: 2.1.0 · Suporte Oficial Haras Cloud</p>
        </footer>
      </main>
    </div>
  )
}
