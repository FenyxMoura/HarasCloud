import { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"
import {
  Camera,
  Download,
  Image as ImageIcon,
  Maximize2,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getGaleria, salvarItemGaleria, removerItemGaleria, gerarId } from "@/lib/db"
import { useEquinosComFotos } from "@/lib/hooks"
import { useAuth } from "@/lib/auth-context"
import type { CategoriaGaleria, ItemGaleria } from "@/lib/types"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const CATEGORIAS: { id: "todas" | CategoriaGaleria; label: string }[] = [
  { id: "todas", label: "🌟 Todas as Fotos & Vídeos" },
  { id: "garanhaocavalos", label: "🐴 Garanhões & Matrizes" },
  { id: "potros", label: "🍼 Potraria & Criação" },
  { id: "pistas", label: "🏆 Pistas & Premiações" },
  { id: "instalacoes", label: "🏡 Estrutura do Haras" },
  { id: "geral", label: "📸 Geral" },
]

export function Galeria() {
  const { haras } = useAuth()
  const { equinos } = useEquinosComFotos()

  const [itens, setItens] = useState<ItemGaleria[]>([])
  const [categoriaAtiva, setCategoriaAtiva] = useState<"todas" | CategoriaGaleria>("todas")
  const [modalUploadAberto, setModalUploadAberto] = useState(false)
  const [itemVisualizando, setItemVisualizando] = useState<ItemGaleria | null>(null)

  // Form de Upload
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [categoria, setCategoria] = useState<CategoriaGaleria>("garanhaocavalos")
  const [equinoId, setEquinoId] = useState("")
  const [midiaDataUrl, setMidiaDataUrl] = useState<string | null>(null)
  const [tipoMidia, setTipoMidia] = useState<"foto" | "video">("foto")
  const [salvando, setSalvando] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  async function carregar() {
    const dados = await getGaleria()
    setItens(dados)
  }

  useEffect(() => {
    carregar()
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const isVid = file.type.startsWith("video/")
    setTipoMidia(isVid ? "video" : "foto")

    const reader = new FileReader()
    reader.onload = () => {
      setMidiaDataUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleSalvarMidia(e: React.FormEvent) {
    e.preventDefault()
    if (!midiaDataUrl) {
      toast.error("Selecione uma foto ou vídeo para enviar.")
      return
    }

    setSalvando(true)
    try {
      const eq = equinos.find((item) => item.id === equinoId)
      const novoItem: ItemGaleria = {
        id: gerarId(),
        harasId: haras?.id || "haras-cardoso-master",
        equinoId: equinoId || undefined,
        equinoNome: eq?.nome || undefined,
        titulo: titulo.trim() || (eq ? `Foto de ${eq.nome}` : "Registro do Haras"),
        descricao: descricao.trim() || undefined,
        categoria,
        tipo: tipoMidia,
        dataUrl: midiaDataUrl,
        destaque: false,
        createdAt: new Date().toISOString(),
      }

      await salvarItemGaleria(novoItem)
      toast.success("Mídia adicionada à Galeria com sucesso!")
      setModalUploadAberto(false)
      setTitulo("")
      setDescricao("")
      setMidiaDataUrl(null)
      await carregar()
    } catch {
      toast.error("Erro ao salvar arquivo na galeria.")
    } finally {
      setSalvando(false)
    }
  }

  async function handleExcluirMidia(id: string) {
    if (!confirm("Deseja realmente remover esta mídia da galeria?")) return
    try {
      await removerItemGaleria(id)
      setItemVisualizando(null)
      await carregar()
      toast.success("Mídia removida com sucesso!")
    } catch {
      toast.error("Erro ao excluir mídia.")
    }
  }

  const itensFiltrados =
    categoriaAtiva === "todas"
      ? itens
      : itens.filter((item) => item.categoria === categoriaAtiva)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Camera className="size-7 text-[#d9b978]" />
            Galeria & Acervo Visual do Haras
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fotos em alta resolução e vídeos promocionais do plantel, instalações e premiações.
          </p>
        </div>

        <Button
          onClick={() => setModalUploadAberto(true)}
          className="rounded-2xl bg-[#143129] text-[#d9b978] font-bold text-xs sm:text-sm hover:bg-[#1c4338] shadow-md active:scale-95"
        >
          <Upload className="mr-1.5 size-4" />
          Enviar Nova Mídia
        </Button>
      </div>

      {/* Categorias / Filtros */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto no-scrollbar">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategoriaAtiva(cat.id)}
            className={cn(
              "px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95",
              categoriaAtiva === cat.id
                ? "bg-[#143129] text-[#d9b978] shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid de Mídias */}
      {itensFiltrados.length === 0 ? (
        <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 p-12 text-center">
          <div className="size-16 rounded-2xl bg-[#143129] text-[#d9b978] flex items-center justify-center mx-auto mb-3">
            <Camera className="size-8" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">Nenhuma mídia neste álbum</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Envie fotos em alta resolução ou vídeos dos seus cavalos para compor o acervo do haras.
          </p>
          <Button
            onClick={() => setModalUploadAberto(true)}
            className="mt-5 rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs"
          >
            Fazer Upload Agora
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {itensFiltrados.map((item) => (
            <div
              key={item.id}
              onClick={() => setItemVisualizando(item)}
              className="group relative aspect-square rounded-3xl overflow-hidden cursor-pointer border border-stone-200 dark:border-stone-800 bg-black/40 shadow-sm hover:shadow-xl transition-all"
            >
              {item.tipo === "video" ? (
                <video
                  src={item.dataUrl}
                  className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <img
                  src={item.dataUrl}
                  alt={item.titulo}
                  className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              )}

              {/* Overlay Escuro com Infos */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                <div className="flex justify-end">
                  <span className="p-1.5 rounded-xl bg-black/50 text-white backdrop-blur-md">
                    <Maximize2 className="size-3.5" />
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold text-white leading-tight truncate">{item.titulo}</p>
                  {item.equinoNome && (
                    <p className="text-[10px] text-[#d9b978] font-semibold truncate mt-0.5">
                      {item.equinoNome}
                    </p>
                  )}
                </div>
              </div>

              {item.tipo === "video" && (
                <div className="absolute top-2.5 left-2.5 size-7 rounded-xl bg-black/60 text-white flex items-center justify-center backdrop-blur-md">
                  <Video className="size-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Upload de Mídia */}
      <Dialog open={modalUploadAberto} onOpenChange={setModalUploadAberto}>
        <DialogContent className="sm:max-w-md bg-background border-stone-200 dark:border-stone-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Upload className="size-5 text-[#d9b978]" />
              Enviar Foto ou Vídeo para a Galeria
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSalvarMidia} className="space-y-4 mt-3">
            {/* Box de Seleção de Arquivo */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-6 text-center cursor-pointer hover:border-[#d9b978] transition-colors bg-muted/30"
            >
              {midiaDataUrl ? (
                <div className="relative aspect-video rounded-xl overflow-hidden max-h-48 mx-auto">
                  {tipoMidia === "video" ? (
                    <video src={midiaDataUrl} className="size-full object-cover" controls />
                  ) : (
                    <img src={midiaDataUrl} alt="Preview" className="size-full object-cover" />
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="size-10 rounded-full bg-[#143129]/10 dark:bg-[#143129] text-[#d9b978] flex items-center justify-center mx-auto">
                    <ImageIcon className="size-5" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    Clique para selecionar uma foto ou vídeo
                  </p>
                  <p className="text-[10px] text-muted-foreground">PNG, JPG, MP4 ou WebM</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Título da Mídia</label>
              <Input
                placeholder="Ex.: Foto Oficial de Estrela do Vale"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Álbum / Categoria</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as CategoriaGaleria)}
                  className="w-full h-10 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs"
                >
                  <option value="garanhaocavalos">Garanhões & Matrizes</option>
                  <option value="potros">Potraria & Criação</option>
                  <option value="pistas">Pistas & Premiações</option>
                  <option value="instalacoes">Estrutura do Haras</option>
                  <option value="geral">Geral</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Vincular a um Cavalo</label>
                <select
                  value={equinoId}
                  onChange={(e) => setEquinoId(e.target.value)}
                  className="w-full h-10 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs"
                >
                  <option value="">Nenhum (Geral do Haras)</option>
                  {equinos.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Descrição / Legenda</label>
              <Textarea
                placeholder="Detalhes adicionais sobre este registro..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={2}
                className="rounded-xl resize-none text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setModalUploadAberto(false)}
                className="rounded-xl text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={salvando || !midiaDataUrl}
                className="rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs hover:bg-[#1c4338]"
              >
                {salvando ? "Enviando..." : "Salvar na Galeria"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lightbox / Visualizador iOS Pro via Portal */}
      {itemVisualizando && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[99999] h-[100dvh] w-[100dvw] bg-black/98 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden">
          <div className="flex items-center justify-between text-white border-b border-white/10 pb-3 z-50">
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-white">{itemVisualizando.titulo}</h3>
              {itemVisualizando.equinoNome && (
                <p className="text-xs text-[#d9b978] font-semibold">{itemVisualizando.equinoNome}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const a = document.createElement("a")
                  a.href = itemVisualizando.dataUrl
                  a.download = `${itemVisualizando.titulo || "haras-midia"}.${itemVisualizando.tipo === "video" ? "mp4" : "jpg"}`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                }}
                className="size-9 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center active:scale-95 transition-all"
                title="Baixar Arquivo"
              >
                <Download className="size-4" />
              </button>

              <button
                type="button"
                onClick={() => handleExcluirMidia(itemVisualizando.id)}
                className="size-9 rounded-full bg-rose-600/30 text-rose-300 hover:bg-rose-600 hover:text-white flex items-center justify-center active:scale-95 transition-all"
                title="Excluir Mídia (1 clique)"
              >
                <Trash2 className="size-4" />
              </button>

              <button
                type="button"
                onClick={() => setItemVisualizando(null)}
                className="size-9 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center active:scale-95 transition-all ml-1"
                title="Fechar"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-2 sm:p-4 min-h-0">
            {itemVisualizando.tipo === "video" ? (
              <video
                src={itemVisualizando.dataUrl}
                controls
                autoPlay
                className="max-h-[78dvh] max-w-[92dvw] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)]"
              />
            ) : (
              <img
                src={itemVisualizando.dataUrl}
                alt={itemVisualizando.titulo}
                className="max-h-[78dvh] max-w-[92dvw] rounded-2xl object-contain shadow-[0_0_50px_rgba(0,0,0,0.8)]"
              />
            )}
          </div>

          {itemVisualizando.descricao && (
            <div className="bg-black/60 p-3 rounded-2xl border border-white/10 max-w-xl mx-auto text-center text-xs text-white/85">
              {itemVisualizando.descricao}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}
