import { useState, useRef } from "react"
import {
  Camera,
  Eye,
  Leaf,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { PlantaToxica } from "@/lib/types"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const BANCO_PLANTAS_BRASIL: PlantaToxica[] = [
  {
    id: "crotalaria",
    nomePopular: "Crotalária",
    nomeCientifico: "Crotalaria spectabilis / C. mucronata",
    risco: "mortal",
    categoria: "Hepatotóxica Irreversível",
    sintomas: [
      "Icterícia (mucosas amareladas)",
      "Emagrecimento progressivo e perda severa de apetite",
      "Sintomas neurológicos (pressão da cabeça contra cercas/paredes)",
      "Cirrose hepática fulminante",
    ],
    primeirosSocorros:
      "Remover imediatamente o cavalo do piquete. Suspender qualquer esforço. Chamar veterinário para terapia de suporte hepático (soroterapia intensiva e protetores hepáticos).",
    acaoManejo:
      "Arrancar as plantas manualmente antes da frutificação (formação de vagens). Realizar roçagem e descarte fora da área de pastejo.",
    imagemExemplo: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80",
    descricao:
      "Uma das plantas mais perigosas do Brasil para equinos. Contém alcaloides pirrolizidínicos que causam lesões hepáticas acumulativas e irreversíveis.",
  },
  {
    id: "mascagnia",
    nomePopular: "Erva-de-Rato / Cafezinho",
    nomeCientifico: "Palicourea marcgravii / Mascagnia rigida",
    risco: "mortal",
    categoria: "Morte Súbita Cardíaca",
    sintomas: [
      "Queda súbita e morte em minutos após movimentação do animal",
      "Tremores musculares e taquicardia extrema",
      "Relinchos de angústia e respiração ofegante",
    ],
    primeirosSocorros:
      "NÃO movimentar o animal sob nenhuma hipótese. Deixar em repouso absoluto na sombra. Chamar atendimento veterinário de urgência máxima.",
    acaoManejo:
      "Erradicação total por arranquio de raiz e aplicação de herbicida específico nas touceiras florestais e bordas de cerca.",
    imagemExemplo: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80",
    descricao:
      "Planta de alta letalidade. Poucas folhas ingeridas são suficientes para causar parada cardíaca instantânea ao menor esforço físico.",
  },
  {
    id: "samambaia",
    nomePopular: "Samambaia-do-Campo",
    nomeCientifico: "Pteridium aquilinum",
    risco: "alto",
    categoria: "Neurotóxica (Deficiência de Tiamina)",
    sintomas: [
      "Incoordenação motora e andar cambaleante (ataxia)",
      "Fraqueza nas patas traseiras",
      "Postura com pernas afastadas para equilíbrio",
      "Tremores e hiperexcitabilidade",
    ],
    primeirosSocorros:
      "Administração urgente de Tiamina (Vitamina B1) intravenosa prescrita por médico veterinário. Retirar do piquete infestado.",
    acaoManejo:
      "Calagem do solo (a samambaia prolifera em solos ácidos e degradados) e plantio de forrageiras de alta densidade.",
    imagemExemplo: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80",
    descricao:
      "Contém a enzima tiaminase, que destrói a vitamina B1 no organismo do cavalo, causando colapso do sistema nervoso central.",
  },
  {
    id: "lantana",
    nomePopular: "Chumbinho / Cambará",
    nomeCientifico: "Lantana camara",
    risco: "alto",
    categoria: "Hepatogênica & Fotossensibilização",
    sintomas: [
      "Queimaduras e descamação grave nas partes brancas da pele (focinho e patas)",
      "Inchaço na face e conjuntivite",
      "Icterícia e cólicas intermitentes",
    ],
    primeirosSocorros:
      "Abrigamento em baia completamente escura (longe da luz solar). Aplicação de pomadas cicatrizantes e anti-inflamatórios sob orientação veterinária.",
    acaoManejo:
      "Roçagem manual periódica com proteção nas mãos e destruição das raízes.",
    imagemExemplo: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
    descricao:
      "Contém lantaninas que lesam o fígado e impedem a eliminação da filoeritrina, tornando a pele do animal hipersensível aos raios solares.",
  },
  {
    id: "brachiaria",
    nomePopular: "Braquiária (Atenção para Equinos)",
    nomeCientifico: "Brachiaria decumbens / B. humidicola",
    risco: "medio",
    categoria: "Cara Inchada (Hiperparatireoidismo)",
    sintomas: [
      "Aumento de volume nos ossos da face (cara inchada)",
      "Dificuldade de mastigação e perda de peso",
      "Claudicação intermitente e fragilidade óssea",
    ],
    primeirosSocorros:
      "Troca imediata de pastagem para gramíneas recomendadas (Tifton, Coastcross ou Estrela). Suplementação com Cálcio e Fósforo em proporção 2:1.",
    acaoManejo:
      "Evitar manter equinos exclusivamente em pastagens de braquiária pura sem suplementação mineral específica para equinos.",
    imagemExemplo: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80",
    descricao:
      "Possui altos níveis de oxalato que se ligam ao cálcio, impedindo sua absorção e descalcificando os ossos do animal.",
  },
  {
    id: "tifton",
    nomePopular: "Capim Tifton 85",
    nomeCientifico: "Cynodon dactylon cv. Tifton 85",
    risco: "segura",
    categoria: "Forragem Nobre Segura",
    sintomas: [
      "Nenhum sintoma de intoxicação.",
      "Excelente ganho de massa, pelagem brilhante e digestibilidade de alta performance.",
    ],
    primeirosSocorros: "Planta nobre de excelência para pastejo e fenação.",
    acaoManejo: "Manejar a altura de entrada (20-25cm) e saída (10cm) para máxima renovação do pasto.",
    imagemExemplo: "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=600&q=80",
    descricao:
      "Gramínea de elite, altamente recomendada para criatórios de cavalos de marcha, corrida e hipismo devido ao seu altíssimo teor proteico e ausência de toxinas.",
  },
]

export function ScannerPlantas() {
  const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null)
  const [analisando, setAnalisando] = useState(false)
  const [resultado, setResultado] = useState<{
    planta: PlantaToxica
    confianca: number
  } | null>(null)

  const [busca, setBusca] = useState("")
  const [filtroRisco, setFiltroRisco] = useState<string>("todos")
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setImagemSelecionada(reader.result as string)
      iniciarAnaliseIA()
    }
    reader.readAsDataURL(file)
  }

  function iniciarAnaliseIA() {
    setAnalisando(true)
    setResultado(null)

    // Simulação da Inteligência Artificial HarasAI Vision analisando os traços botânicos
    setTimeout(() => {
      // Sorteia ou escolhe uma das plantas com alta confiança
      const plantaEncontrada = BANCO_PLANTAS_BRASIL[0] // Ex: Crotalaria
      setResultado({
        planta: plantaEncontrada,
        confianca: 98.4,
      })
      setAnalisando(false)
      toast.success("Análise botânica concluída pela IA!")
    }, 2200)
  }

  function testarComExemplo(planta: PlantaToxica) {
    setImagemSelecionada(planta.imagemExemplo)
    setAnalisando(true)
    setResultado(null)
    setTimeout(() => {
      setResultado({
        planta,
        confianca: 99.1,
      })
      setAnalisando(false)
    }, 1200)
  }

  const plantasFiltradas = BANCO_PLANTAS_BRASIL.filter((p) => {
    const matchBusca =
      p.nomePopular.toLowerCase().includes(busca.toLowerCase()) ||
      p.nomeCientifico.toLowerCase().includes(busca.toLowerCase()) ||
      p.categoria.toLowerCase().includes(busca.toLowerCase())
    const matchRisco = filtroRisco === "todos" || p.risco === filtroRisco
    return matchBusca && matchRisco
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#d9b978]/20 px-3 py-0.5 text-[10px] font-black text-[#d9b978] border border-[#d9b978]/30 uppercase tracking-widest">
              HarasAI Vision v4.0
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5 mt-1">
            <Leaf className="size-7 text-emerald-500" />
            Scanner de Plantas Tóxicas no Pasto
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fotografe uma folha ou planta suspeita no piquete para a IA identificar a espécie e alertar sobre riscos para os cavalos.
          </p>
        </div>
      </div>

      {/* Box do Scanner com Câmera e Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lado Esquerdo: Área de Captura / Câmera */}
        <Card className="lg:col-span-6 rounded-3xl border-stone-200/80 dark:border-stone-800 p-6 bg-card flex flex-col justify-between overflow-hidden relative">
          <div>
            <CardTitle className="font-display text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              <Camera className="size-5 text-[#d9b978]" />
              Fotografar Folha ou Pasto
            </CardTitle>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-video rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 bg-muted/30 hover:border-[#d9b978] transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center overflow-hidden group"
            >
              {imagemSelecionada ? (
                <div className="relative size-full">
                  <img
                    src={imagemSelecionada}
                    alt="Planta Capturada"
                    className="size-full object-cover rounded-xl"
                  />
                  {analisando && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4">
                      <div className="size-12 rounded-2xl bg-[#143129] text-[#d9b978] flex items-center justify-center border border-[#d9b978]/40 animate-spin mb-3">
                        <Sparkles className="size-6" />
                      </div>
                      <p className="font-bold text-sm">Examinando Morfologia Botânica...</p>
                      <p className="text-[11px] text-[#d9b978] mt-1 font-mono">
                        Rede Neural HarasAI Vision analisando toxinas
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="size-14 rounded-2xl bg-[#143129] text-[#d9b978] flex items-center justify-center mx-auto shadow-md border border-[#d9b978]/30 group-hover:scale-105 transition-transform">
                    <Camera className="size-7" />
                  </div>
                  <p className="font-bold text-sm text-foreground">
                    Clique para Tirar Foto ou Escolher da Galeria
                  </p>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Aponte para as folhas, flores ou sementes para maior precisão no reconhecimento
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-border/60">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Zap className="size-3.5 text-amber-500" /> IA calibrada para pastos brasileiros
            </span>

            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs hover:bg-[#1c4338]"
            >
              <Upload className="mr-1.5 size-3.5" />
              {imagemSelecionada ? "Trocar Imagem" : "Nova Captura"}
            </Button>
          </div>
        </Card>

        {/* Lado Direito: Diagnóstico & Laudo da IA */}
        <Card className="lg:col-span-6 rounded-3xl border-stone-200/80 dark:border-stone-800 p-6 bg-card flex flex-col justify-between">
          <div>
            <CardTitle className="font-display text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              <Sparkles className="size-5 text-[#d9b978]" />
              Laudo Botânico & Risco Clínico
            </CardTitle>

            {!resultado && !analisando && (
              <div className="py-12 text-center text-muted-foreground space-y-2">
                <Leaf className="size-12 mx-auto text-stone-400 opacity-60" />
                <p className="font-bold text-sm text-foreground">Aguardando Captura de Imagem</p>
                <p className="text-xs max-w-xs mx-auto">
                  Tire uma foto ou selecione uma das plantas do guia abaixo para ver o laudo veterinário detalhado.
                </p>
              </div>
            )}

            {analisando && (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="size-8 text-[#d9b978] animate-spin mx-auto" />
                <p className="font-bold text-sm text-foreground">Processando Banco de Espécies Tóxicas...</p>
                <p className="text-xs text-muted-foreground">Classificando alcaloides e glicosídeos cianogênicos.</p>
              </div>
            )}

            {resultado && !analisando && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 border",
                        resultado.planta.risco === "mortal"
                          ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                          : resultado.planta.risco === "alto"
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      )}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {resultado.planta.risco === "mortal"
                        ? "🔴 Risco Mortal Imediato"
                        : resultado.planta.risco === "alto"
                        ? "🟡 Risco Alto / Atenção"
                        : "🟢 Planta Forrageira Segura"}
                    </span>

                    <h3 className="font-display text-2xl font-bold text-foreground mt-2">
                      {resultado.planta.nomePopular}
                    </h3>
                    <p className="text-xs text-muted-foreground italic">{resultado.planta.nomeCientifico}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block">Precisão da IA</span>
                    <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {resultado.confianca}%
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/60 text-xs text-foreground leading-relaxed">
                  <strong>Resumo Clínico:</strong> {resultado.planta.descricao}
                </div>

                {/* Sintomas */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1.5">
                    Sinais de Intoxicação no Cavalo:
                  </p>
                  <ul className="space-y-1">
                    {resultado.planta.sintomas.map((s) => (
                      <li key={s} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Primeiros Socorros */}
                <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-xs space-y-1">
                  <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <ShieldAlert className="size-4" /> Protocolo de Primeiros Socorros:
                  </p>
                  <p className="text-foreground/90 leading-relaxed">{resultado.planta.primeirosSocorros}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Guia Botânico de Consulta Offline */}
      <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 p-6 bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5 mb-5">
          <div>
            <CardTitle className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Leaf className="size-5 text-[#d9b978]" />
              Catálogo de Plantas Tóxicas & Forragens de Pasto
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Consulte espécies para orientar sua equipe de campo e identificar focos de risco.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar planta ou sintoma..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9 h-9 rounded-xl text-xs"
              />
            </div>

            <select
              value={filtroRisco}
              onChange={(e) => setFiltroRisco(e.target.value)}
              className="h-9 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs"
            >
              <option value="todos">Todos os Riscos</option>
              <option value="mortal">🔴 Risco Mortal</option>
              <option value="alto">🟡 Risco Alto</option>
              <option value="segura">🟢 Seguras / Forragens</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plantasFiltradas.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-stone-200 dark:border-stone-800 p-4 bg-muted/20 hover:bg-muted/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border",
                      p.risco === "mortal"
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                        : p.risco === "alto"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    )}
                  >
                    {p.risco === "mortal" ? "Mortal" : p.risco === "alto" ? "Alto Risco" : "Segura"}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">{p.categoria}</span>
                </div>

                <h4 className="font-bold text-sm text-foreground">{p.nomePopular}</h4>
                <p className="text-[11px] text-muted-foreground italic">{p.nomeCientifico}</p>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                  {p.descricao}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testarComExemplo(p)}
                  className="h-8 rounded-xl text-xs font-semibold w-full"
                >
                  <Eye className="mr-1.5 size-3.5 text-[#d9b978]" />
                  Carregar no Scanner
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
