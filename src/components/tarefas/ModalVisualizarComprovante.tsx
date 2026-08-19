import { CheckCircle2, User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { type TarefaHaras } from "@/lib/types"

interface ModalVisualizarComprovanteProps {
  aberto: boolean
  tarefa: TarefaHaras | null
  onFechar: () => void
}

export function ModalVisualizarComprovante({
  aberto,
  tarefa,
  onFechar,
}: ModalVisualizarComprovanteProps) {
  if (!tarefa) return null

  const fotos = tarefa.fotosComprovantes || (tarefa.fotoComprovanteUrl ? [tarefa.fotoComprovanteUrl] : [])
  const videos = tarefa.videosComprovantes || []

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="sm:max-w-xl bg-background border-stone-200 dark:border-stone-800 rounded-3xl p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-display text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-500" />
            Comprovante de Manejo Executado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2 text-xs">
          {/* Topo: Título e Detalhes de Conclusão */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <h3 className="font-serif text-base font-bold text-foreground">{tarefa.titulo}</h3>
            {tarefa.descricao && <p className="text-muted-foreground mt-1">{tarefa.descricao}</p>}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-emerald-500/20 text-[11px]">
              <div>
                <span className="text-muted-foreground block">Responsável:</span>
                <strong className="text-foreground flex items-center gap-1 mt-0.5">
                  <User className="size-3 text-[#d9b978]" /> {tarefa.responsavelNome}
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Tempo Gasto:</span>
                <strong className="text-emerald-700 dark:text-emerald-300 block mt-0.5">
                  ⏱️ {tarefa.tempoGastoMinutos || 15} minutos
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Data &amp; Horário:</span>
                <strong className="text-foreground block mt-0.5">
                  {tarefa.dataProgramada} {tarefa.horarioProgramado ? `às ${tarefa.horarioProgramado}` : ""}
                </strong>
              </div>
            </div>
          </div>

          {/* Observações do Tratador */}
          {tarefa.observacoesExecucao && (
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <span className="font-bold text-foreground block mb-0.5">Notas do Tratador:</span>
              <p className="text-muted-foreground italic">"{tarefa.observacoesExecucao}"</p>
            </div>
          )}

          {/* Galeria de Fotos */}
          <div>
            <span className="font-bold text-foreground block mb-2">
              Fotos do Serviço ({fotos.length})
            </span>
            {fotos.length === 0 ? (
              <p className="text-muted-foreground italic">Nenhuma foto anexada nesta tarefa.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {fotos.map((url, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden border border-border bg-black aspect-video group relative">
                    <img src={url} alt={`Comprovante ${idx + 1}`} className="size-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Galeria de Vídeos */}
          {videos.length > 0 && (
            <div>
              <span className="font-bold text-foreground block mb-2">
                Vídeos Comprobatórios ({videos.length})
              </span>
              <div className="space-y-2">
                {videos.map((vUrl, vIdx) => (
                  <div key={vIdx} className="rounded-2xl overflow-hidden border border-border bg-black aspect-video">
                    <video src={vUrl} controls className="size-full" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
