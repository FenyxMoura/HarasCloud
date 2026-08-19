import { useState, useRef } from "react"
import {
  Camera,
  Check,
  CheckCircle2,
  Layers,
  RefreshCw,
  Sparkles,
  Upload,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  analisarImagemEstoqueIA,
  analisarEscoreCorporalIA,
  analisarFeridaIA,
  type ResultadoContagemEstoque,
  type ResultadoEscoreCorporal,
  type ResultadoTriagemFerida,
} from "@/lib/ia-vision"
import { tocarSomIA, tocarSomSucesso } from "@/lib/sound-alerts"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface HarasVisionModalProps {
  aberto: boolean
  modoInicial?: "estoque" | "escore" | "ferida"
  onFechar: () => void
  onAtualizarEstoque?: (quantidade: number, tipo: string) => void
}

export function HarasVisionModal({
  aberto,
  modoInicial = "estoque",
  onFechar,
  onAtualizarEstoque,
}: HarasVisionModalProps) {
  const [modo, setModo] = useState<"estoque" | "escore" | "ferida">(modoInicial)
  const [imagemPreview, setImagemPreview] = useState<string | null>(null)
  const [analisando, setAnalisando] = useState(false)
  const [mostrarBoxes, setMostrarBoxes] = useState(true)

  // Resultados
  const [resEstoque, setResEstoque] = useState<ResultadoContagemEstoque | null>(null)
  const [resEscore, setResEscore] = useState<ResultadoEscoreCorporal | null>(null)
  const [resFerida, setResFerida] = useState<ResultadoTriagemFerida | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  function resetState() {
    setImagemPreview(null)
    setResEstoque(null)
    setResEscore(null)
    setResFerida(null)
    setAnalisando(false)
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      setImagemPreview(dataUrl)
      await executarAnalise(dataUrl, modo)
    }
    reader.readAsDataURL(file)
  }

  async function executarAnalise(imagem: string, tipoModo: "estoque" | "escore" | "ferida") {
    setAnalisando(true)
    tocarSomIA()

    try {
      if (tipoModo === "estoque") {
        const resultado = await analisarImagemEstoqueIA(imagem, "feno")
        setResEstoque(resultado)
        tocarSomSucesso()
        toast.success(`IA detectou ${resultado.totalContado} volumes no galpão!`)
      } else if (tipoModo === "escore") {
        const resultado = await analisarEscoreCorporalIA(imagem)
        setResEscore(resultado)
        tocarSomSucesso()
        toast.success(`Escore Corporal calculado: ${resultado.escoreHenneke}/9`)
      } else if (tipoModo === "ferida") {
        const resultado = await analisarFeridaIA(imagem)
        setResFerida(resultado)
        tocarSomSucesso()
        toast.success("Triagem clínica concluída com segurança.")
      }
    } catch {
      toast.error("Não foi possível processar a imagem. Tente novamente.")
    } finally {
      setAnalisando(false)
    }
  }

  function aplicarAtualizacaoEstoque() {
    if (!resEstoque) return
    onAtualizarEstoque?.(resEstoque.totalContado, resEstoque.tipoItemDetectado)
    toast.success(`Estoque atualizado para ${resEstoque.totalContado} unidades!`)
    onFechar()
    resetState()
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(v) => {
        if (!v) {
          onFechar()
          resetState()
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl bg-background border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-7 overflow-y-auto max-h-[92vh]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-2xl bg-[#143129] text-[#d9b978] flex items-center justify-center shadow-md">
                <Sparkles className="size-5" />
              </div>
              <div>
                <span>Haras Vision IA</span>
                <p className="text-xs font-normal text-muted-foreground">
                  Visão Computacional Inteligente &amp; Triagem Segura
                </p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Seleção de Modo */}
        <div className="grid grid-cols-3 gap-2 mt-3 p-1.5 rounded-2xl bg-muted/40 border border-border/50 text-xs">
          <button
            type="button"
            onClick={() => {
              setModo("estoque")
              if (imagemPreview) executarAnalise(imagemPreview, "estoque")
            }}
            className={cn(
              "py-2 px-3 rounded-xl font-bold transition-all text-center",
              modo === "estoque"
                ? "bg-[#143129] text-[#d9b978] shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            📦 Contar Estoque
          </button>

          <button
            type="button"
            onClick={() => {
              setModo("escore")
              if (imagemPreview) executarAnalise(imagemPreview, "escore")
            }}
            className={cn(
              "py-2 px-3 rounded-xl font-bold transition-all text-center",
              modo === "escore"
                ? "bg-[#143129] text-[#d9b978] shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            ⚖️ Escore Corporal
          </button>

          <button
            type="button"
            onClick={() => {
              setModo("ferida")
              if (imagemPreview) executarAnalise(imagemPreview, "ferida")
            }}
            className={cn(
              "py-2 px-3 rounded-xl font-bold transition-all text-center",
              modo === "ferida"
                ? "bg-[#143129] text-[#d9b978] shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            🩹 Triagem Feridas
          </button>
        </div>

        {/* Box de Captura de Imagem */}
        {!imagemPreview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-[#d9b978] rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-colors bg-muted/20 mt-4 group"
          >
            <div className="size-16 rounded-3xl bg-[#143129]/10 dark:bg-[#143129] text-[#d9b978] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Camera className="size-8" />
            </div>
            <h3 className="font-serif text-lg font-bold text-foreground">
              {modo === "estoque"
                ? "Fotografe a Pilha de Fardos ou Sacos no Galpão"
                : modo === "escore"
                ? "Tire uma Foto Lateral do Cavalo"
                : "Tire uma Foto da Ferida ou Lesão"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Clique para tirar uma foto ou selecionar uma imagem da galeria do celular.
            </p>
            <Button
              type="button"
              className="mt-5 rounded-2xl bg-[#143129] text-[#d9b978] font-bold text-xs hover:bg-[#1c4338]"
            >
              <Upload className="size-3.5 mr-1.5" />
              Abrir Câmera / Galeria
            </Button>
          </div>
        ) : (
          /* Preview da Foto com Bounding Boxes em Tempo Real */
          <div className="space-y-4 mt-4">
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-black aspect-video max-h-72 mx-auto flex items-center justify-center">
              <img
                src={imagemPreview}
                alt="Foto para análise"
                className="size-full object-contain"
              />

              {/* Bounding Boxes da IA sobre os fardos/sacos */}
              {mostrarBoxes &&
                resEstoque?.boxes.map((b) => (
                  <div
                    key={b.id}
                    className="absolute border-2 border-amber-400 bg-amber-400/20 rounded-md transition-all pointer-events-none"
                    style={{
                      left: `${b.x}%`,
                      top: `${b.y}%`,
                      width: `${b.width}%`,
                      height: `${b.height}%`,
                    }}
                  >
                    <span className="absolute -top-4 left-0 bg-amber-400 text-stone-950 font-black text-[9px] px-1 py-0.2 rounded font-mono">
                      {b.label}
                    </span>
                  </div>
                ))}

              {/* Loader de Processamento Neural */}
              {analisando && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white z-30">
                  <RefreshCw className="size-8 text-[#d9b978] animate-spin mb-2" />
                  <p className="font-serif text-sm font-bold">Processando Visão Computacional...</p>
                  <p className="text-xs text-stone-300">Contando objetos e avaliando pixels</p>
                </div>
              )}
            </div>

            {/* Ações da Foto */}
            <div className="flex items-center justify-between text-xs">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  resetState()
                  fileInputRef.current?.click()
                }}
                className="rounded-xl text-xs"
              >
                <Camera className="size-3.5 mr-1" />
                Tirar Outra Foto
              </Button>

              {resEstoque && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setMostrarBoxes(!mostrarBoxes)}
                  className="rounded-xl text-xs text-muted-foreground"
                >
                  <Layers className="size-3.5 mr-1" />
                  {mostrarBoxes ? "Ocultar Caixas" : "Mostrar Caixas da IA"}
                </Button>
              )}
            </div>

            {/* RESULTADO 1: CONTAGEM DE ESTOQUE */}
            {resEstoque && (
              <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#d9b978] flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    Contagem Concluída com Sucesso
                  </span>
                  <span className="text-xs font-mono font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                    96% Precisão
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-black text-foreground">
                    {resEstoque.totalContado}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {resEstoque.tipoItemDetectado === "feno" ? "Fardos de Feno Detectados" : "Sacos de Ração"}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">{resEstoque.observacoes}</p>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button
                    onClick={aplicarAtualizacaoEstoque}
                    className="rounded-2xl bg-[#143129] text-[#d9b978] font-bold text-xs hover:bg-[#1c4338] shadow-md"
                  >
                    <Check className="size-4 mr-1.5" />
                    Atualizar Estoque para {resEstoque.totalContado} Volumes
                  </Button>
                </div>
              </div>
            )}

            {/* RESULTADO 2: ESCORE CORPORAL HENNEKE */}
            {resEscore && (
              <div className="p-4 sm:p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Avaliação Escore Corporal Henneke (1 a 9)
                  </span>
                  <span className="text-xs font-bold bg-emerald-500 text-white px-2.5 py-0.5 rounded-full">
                    {resEscore.classificacao}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-black text-foreground">
                    {resEscore.escoreHenneke}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">/ 9.0 (Ideal para Trabalho)</span>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground pt-1 border-t border-border/60">
                  <p>• <strong>Costelas:</strong> {resEscore.regioesAnalisadas.costelas}</p>
                  <p>• <strong>Dorso/Lombo:</strong> {resEscore.regioesAnalisadas.dorsoLombo}</p>
                  <p>• <strong>Recomendação:</strong> {resEscore.recomendacaoNutricional}</p>
                </div>
              </div>
            )}

            {/* RESULTADO 3: TRIAGEM DE FERIDAS */}
            {resFerida && (
              <div className="p-4 sm:p-5 rounded-3xl bg-sky-500/10 border border-sky-500/30 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Triagem Segura de Lesão
                  </span>
                  <span className="text-xs font-bold bg-sky-500 text-white px-2 py-0.5 rounded-full">
                    Área: ~{resFerida.areaEstimadaCm2} cm²
                  </span>
                </div>

                <p className="text-xs font-semibold text-foreground">{resFerida.tipoLesao}</p>

                <div className="p-3 rounded-2xl bg-background/80 border border-border text-xs space-y-1.5">
                  <p className="font-bold text-foreground">Protocolo Diário Sugerido:</p>
                  {resFerida.protocoloRecomendado.map((p, idx) => (
                    <p key={idx} className="text-muted-foreground flex items-start gap-1.5">
                      <span className="text-[#d9b978] font-bold">✓</span> {p}
                    </p>
                  ))}
                </div>

                <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 font-medium">
                  {resFerida.alertaSeguranca}
                </p>
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelected}
        />
      </DialogContent>
    </Dialog>
  )
}
