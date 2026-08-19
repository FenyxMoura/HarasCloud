import { useRef, useState } from "react"
import {
  Camera,
  CheckCircle2,
  FileVideo,
  Plus,
  Trash2,
  User,
  Video,
} from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { type TarefaHaras } from "@/lib/types"
import { concluirTarefa } from "@/lib/db"
import { tocarSomConclusaoTarefa } from "@/lib/sound-alerts"
import { toast } from "sonner"

interface ModalConcluirTarefaProps {
  aberto: boolean
  tarefa: TarefaHaras | null
  onFechar: () => void
  onConcluido: () => void
}

export function ModalConcluirTarefa({
  aberto,
  tarefa,
  onFechar,
  onConcluido,
}: ModalConcluirTarefaProps) {
  const [fotos, setFotos] = useState<string[]>(tarefa?.fotosComprovantes || [])
  const [videos, setVideos] = useState<string[]>(tarefa?.videosComprovantes || [])
  const [observacoes, setObservacoes] = useState(tarefa?.observacoesExecucao || "")
  const [concluindo, setConcluindo] = useState(false)

  const fileFotoRef = useRef<HTMLInputElement>(null)
  const fileVideoRef = useRef<HTMLInputElement>(null)

  function handleFotoSelecionada(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setFotos((prev) => [...prev, dataUrl])
      toast.success("Foto do comprovante adicionada!")
    }
    reader.readAsDataURL(file)
  }

  function handleVideoSelecionado(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setVideos((prev) => [...prev, dataUrl])
      toast.success("Vídeo comprobatório adicionado!")
    }
    reader.readAsDataURL(file)
  }

  function removerFoto(index: number) {
    setFotos((prev) => prev.filter((_, i) => i !== index))
  }

  function removerVideo(index: number) {
    setVideos((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleFinalizar() {
    if (!tarefa) return

    setConcluindo(true)
    try {
      const fotoPrincipal = fotos[0] || undefined
      await concluirTarefa(tarefa.id, fotoPrincipal, observacoes.trim(), fotos, videos)
      tocarSomConclusaoTarefa()
      toast.success("🎉 Tarefa concluída com sucesso!", {
        description: `Serviço registrado no histórico de ${tarefa.responsavelNome}.`,
      })
      onConcluido()
      onFechar()
    } catch {
      toast.error("Erro ao concluir tarefa.")
    } finally {
      setConcluindo(false)
    }
  }

  if (!tarefa) return null

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="sm:max-w-lg bg-background border-stone-200 dark:border-stone-800 rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="size-6 text-emerald-500" />
            Concluir &amp; Registrar Comprovante
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2 text-xs">
          {/* Card Resumo do Serviço */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
            <h4 className="font-serif text-sm font-bold text-foreground">{tarefa.titulo}</h4>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-muted-foreground text-[11px]">
              <span className="flex items-center gap-1 font-semibold">
                <User className="size-3 text-[#d9b978]" /> {tarefa.responsavelNome}
              </span>
              {tarefa.baiaNome && <span>📍 {tarefa.baiaNome}</span>}
              {tarefa.equinoNome && <span>🐴 {tarefa.equinoNome}</span>}
            </div>
          </div>

          {/* Seção de Fotos do Trato & Água */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <Camera className="size-3.5 text-[#d9b978]" />
                Fotos do Manejo / Comprovante ({fotos.length})
              </label>
              <button
                type="button"
                onClick={() => fileFotoRef.current?.click()}
                className="text-[11px] font-bold text-[#d9b978] hover:underline flex items-center gap-1"
              >
                <Plus className="size-3" /> Adicionar Foto
              </button>
            </div>

            {fotos.length === 0 ? (
              <div
                onClick={() => fileFotoRef.current?.click()}
                className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-[#d9b978] rounded-2xl p-5 text-center cursor-pointer transition-colors bg-muted/10 group"
              >
                <Camera className="size-6 mx-auto text-muted-foreground group-hover:text-[#d9b978] transition-colors mb-1.5" />
                <p className="font-semibold text-foreground text-xs">Tirar foto do cocho, baía ou bebedouro</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Tire uma foto rápida do corredor ou dos cavalos tratados
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {fotos.map((url, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden aspect-video border border-border group bg-black">
                    <img src={url} alt={`Comprovante ${idx + 1}`} className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removerFoto(idx)}
                      className="absolute top-1 right-1 size-5 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileFotoRef.current?.click()}
                  className="rounded-xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-[#d9b978] flex flex-col items-center justify-center p-2 text-muted-foreground hover:text-foreground aspect-video"
                >
                  <Plus className="size-4 mb-0.5" />
                  <span className="text-[10px] font-bold">+ Foto</span>
                </button>
              </div>
            )}
          </div>

          {/* Seção de Vídeo Opcional */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <Video className="size-3.5 text-sky-500" />
                Vídeo Curto Opcional ({videos.length})
              </label>
              <button
                type="button"
                onClick={() => fileVideoRef.current?.click()}
                className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
              >
                <Plus className="size-3" /> Gravar / Enviar Vídeo
              </button>
            </div>

            {videos.length > 0 && (
              <div className="space-y-1.5">
                {videos.map((_vUrl, vIdx) => (
                  <div key={vIdx} className="flex items-center justify-between p-2 rounded-xl bg-sky-500/10 border border-sky-500/20">
                    <span className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-300 text-xs">
                      <FileVideo className="size-4" /> Vídeo Gravado #{vIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removerVideo(vIdx)}
                      className="size-6 rounded-lg text-rose-500 hover:bg-rose-500/10 flex items-center justify-center"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Observações de Execução */}
          <div>
            <label className="font-semibold block mb-1 text-foreground">
              Observações do Manejo (Opcional)
            </label>
            <Textarea
              placeholder="Ex.: Todos os cavalos comeram com apetite, bebedouros 02 e 04 limpos e revisados..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
              className="rounded-xl text-xs resize-none"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onFechar} className="rounded-xl text-xs">
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleFinalizar}
              disabled={concluindo}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-95"
            >
              {concluindo ? "Salvando..." : "Confirmar Conclusão da Tarefa"}
            </Button>
          </DialogFooter>
        </div>

        <input ref={fileFotoRef} type="file" accept="image/*" className="hidden" onChange={handleFotoSelecionada} />
        <input ref={fileVideoRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelecionado} />
      </DialogContent>
    </Dialog>
  )
}
