import { useEffect, useState, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize,
  Minimize,
  Pencil,
  RotateCcw,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
  Sparkles,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { atualizarLegendaFoto } from "@/lib/db"
import type { FotoEquino } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface PhotoLightboxProps {
  aberto: boolean
  fotos: FotoEquino[]
  urls: string[]
  indice: number
  onFechar: () => void
  onMudarIndice: (i: number) => void
  onRecarregar: () => void
}

export function PhotoLightbox({
  aberto,
  fotos,
  urls,
  indice,
  onFechar,
  onMudarIndice,
  onRecarregar,
}: PhotoLightboxProps) {
  const [editando, setEditando] = useState(false)
  const [legenda, setLegenda] = useState("")

  // Estados de Transformação
  const [zoom, setZoom] = useState(1)
  const [rotacao, setRotacao] = useState(0)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Referências para Gestos de Toque Mobile (Pinch, Pan, Swipe, Double Tap)
  const touchStateRef = useRef<{
    startX: number
    startY: number
    startPanX: number
    startPanY: number
    startPinchDist: number
    startZoom: number
    isPinching: boolean
    lastTapTime: number
  }>({
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
    startPinchDist: 0,
    startZoom: 1,
    isPinching: false,
    lastTapTime: 0,
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const foto = fotos[indice]
  const total = urls.length
  const currentUrl = urls[indice]

  // Reset visual ao trocar de foto
  const resetTransforms = useCallback(() => {
    setZoom(1)
    setRotacao(0)
    setPan({ x: 0, y: 0 })
  }, [])

  useEffect(() => {
    setLegenda(fotos[indice]?.legenda ?? "")
    setEditando(false)
    resetTransforms()
  }, [indice, aberto, fotos, resetTransforms])

  // Bloqueio do Scroll da Página & Atalhos de Teclado
  useEffect(() => {
    if (!aberto) return
    const prevOverflow = document.body.style.overflow
    const prevTouchAction = document.body.style.touchAction
    document.body.style.overflow = "hidden"
    document.body.style.touchAction = "none"

    const onKey = (e: KeyboardEvent) => {
      if (editando) return
      if (e.key === "Escape") onFechar()
      if (e.key === "ArrowRight") onMudarIndice((indice + 1) % total)
      if (e.key === "ArrowLeft") onMudarIndice((indice - 1 + total) % total)
      if (e.key === "+" || e.key === "=") handleZoomIn()
      if (e.key === "-" || e.key === "_") handleZoomOut()
      if (e.key === "0") resetTransforms()
      if (e.key === "r" || e.key === "R") handleRotateClockwise()
      if (e.key === "f" || e.key === "F") toggleFullscreen()
    }

    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.touchAction = prevTouchAction
      window.removeEventListener("keydown", onKey)
    }
  }, [aberto, indice, total, onFechar, onMudarIndice, editando, resetTransforms])

  function handleZoomIn() {
    setZoom((z) => Math.min(Number((z + 0.5).toFixed(2)), 4))
  }

  function handleZoomOut() {
    setZoom((z) => {
      const next = Math.max(Number((z - 0.5).toFixed(2)), 1)
      if (next === 1) setPan({ x: 0, y: 0 })
      return next
    })
  }

  function handleRotateClockwise() {
    setRotacao((r) => (r + 90) % 360)
  }

  function handleRotateCounterClockwise() {
    setRotacao((r) => (r - 90 + 360) % 360)
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  function handleWheel(e: React.WheelEvent) {
    if (e.deltaY < 0) {
      handleZoomIn()
    } else {
      handleZoomOut()
    }
  }

  // Mouse Drag (Desktop)
  function handleMouseDown(e: React.MouseEvent) {
    if (zoom <= 1) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging || zoom <= 1) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  function handleMouseUp() {
    setIsDragging(false)
  }

  function handleDoubleClick() {
    if (zoom > 1) {
      resetTransforms()
    } else {
      setZoom(2.2)
    }
  }

  // ==========================================
  // GESTOS DE TOQUE AVANÇADOS MOBILE (PINCH, PAN, SWIPE, DOUBLE TAP)
  // ==========================================
  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      // Início do Pinch-to-Zoom (2 Dedos)
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      touchStateRef.current.startPinchDist = dist
      touchStateRef.current.startZoom = zoom
      touchStateRef.current.isPinching = true
    } else if (e.touches.length === 1) {
      // Início de 1 Dedo (Pan ou Swipe)
      touchStateRef.current.startX = e.touches[0].clientX
      touchStateRef.current.startY = e.touches[0].clientY
      touchStateRef.current.startPanX = pan.x
      touchStateRef.current.startPanY = pan.y
      touchStateRef.current.isPinching = false
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && touchStateRef.current.isPinching) {
      // PINCH-TO-ZOOM ATIVO (Calcula escala em tempo real)
      e.preventDefault()
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      if (touchStateRef.current.startPinchDist > 0) {
        const scaleFactor = currentDist / touchStateRef.current.startPinchDist
        const calculatedZoom = Math.min(
          Math.max(touchStateRef.current.startZoom * scaleFactor, 1),
          4
        )
        setZoom(Number(calculatedZoom.toFixed(2)))
      }
    } else if (e.touches.length === 1 && zoom > 1) {
      // PAN / ARRASTE COM ZOOM ATIVO (Move a imagem aproximada)
      e.preventDefault()
      const deltaX = e.touches[0].clientX - touchStateRef.current.startX
      const deltaY = e.touches[0].clientY - touchStateRef.current.startY
      setPan({
        x: touchStateRef.current.startPanX + deltaX,
        y: touchStateRef.current.startPanY + deltaY,
      })
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStateRef.current.isPinching) {
      touchStateRef.current.isPinching = false
      return
    }

    if (e.changedTouches.length === 1) {
      const now = Date.now()
      const deltaX = e.changedTouches[0].clientX - touchStateRef.current.startX
      const deltaY = e.changedTouches[0].clientY - touchStateRef.current.startY
      const distMoved = Math.hypot(deltaX, deltaY)

      // DETECÇÃO DE DUPLO TOQUE NO CELULAR (Double Tap to Zoom)
      if (now - touchStateRef.current.lastTapTime < 320 && distMoved < 15) {
        if (zoom > 1) {
          resetTransforms()
        } else {
          setZoom(2.2)
        }
        touchStateRef.current.lastTapTime = 0
        return
      }
      touchStateRef.current.lastTapTime = now

      // SWIPE GESTURES QUANDO EM ZOOM NORMAL (1x)
      if (zoom <= 1) {
        // Swipe Horizontal (Trocar de Foto)
        if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 60) {
          if (deltaX < 0) {
            onMudarIndice((indice + 1) % total)
          } else {
            onMudarIndice((indice - 1 + total) % total)
          }
        }
        // Swipe Vertical para Baixo (Fechar Visualizador - iOS style)
        else if (deltaY > 90 && Math.abs(deltaX) < 70) {
          onFechar()
        }
      }
    }
  }

  function handleDownload() {
    if (!currentUrl) return
    const a = document.createElement("a")
    a.href = currentUrl
    a.download = `haras-foto-${indice + 1}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success("Foto baixada com sucesso!")
  }

  async function salvarLegenda() {
    if (!foto) return
    await atualizarLegendaFoto(foto.id, legenda)
    toast.success("Legenda atualizada!")
    setEditando(false)
    onRecarregar()
  }

  if (!aberto || typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[99999] h-[100dvh] w-[100dvw] bg-black/98 backdrop-blur-2xl flex flex-col justify-between select-none overflow-hidden touch-none"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Barra Superior Estilo iOS Photos */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 bg-black/50 backdrop-blur-xl border-b border-white/10 text-white z-50">
          {/* Contador e Nível de Zoom */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-white/90 bg-white/15 px-3 py-1 rounded-full backdrop-blur-md">
              {indice + 1} / {total}
            </span>
            {zoom > 1 && (
              <button
                type="button"
                onClick={resetTransforms}
                className="text-[11px] font-mono bg-[#d9b978]/25 text-[#d9b978] px-2.5 py-0.5 rounded-full font-bold border border-[#d9b978]/40 flex items-center gap-1 active:scale-95"
                title="Toque para resetar zoom"
              >
                <span>{Math.round(zoom * 100)}%</span>
                <RefreshCw className="size-2.5" />
              </button>
            )}
          </div>

          {/* Barra de Ferramentas Superior */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleRotateCounterClockwise}
              className="size-8.5 sm:size-9 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-90 transition-all hidden xs:inline-flex"
              title="Girar Anti-horário"
            >
              <RotateCcw className="size-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={handleRotateClockwise}
              className="size-8.5 sm:size-9 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-90 transition-all"
              title="Girar Horário 90°"
            >
              <RotateCw className="size-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={handleDownload}
              className="size-8.5 sm:size-9 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-90 transition-all"
              title="Baixar Foto"
            >
              <Download className="size-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={toggleFullscreen}
              className="size-8.5 sm:size-9 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-90 transition-all hidden sm:inline-flex"
              title="Tela Cheia"
            >
              {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
            </Button>

            {/* Botão Fechar Redondo */}
            <Button
              size="icon"
              variant="ghost"
              onClick={onFechar}
              className="size-8.5 sm:size-9 rounded-full bg-white/20 text-white hover:bg-rose-600 hover:text-white active:scale-90 transition-all ml-1"
              title="Fechar (Esc)"
            >
              <X className="size-5" />
            </Button>
          </div>
        </div>

        {/* Centro: Palco da Imagem Perfeitamente Centralizado com Zoom e Pan Fluido */}
        <div
          className="relative flex-1 flex items-center justify-center w-full h-full p-2 sm:p-6 overflow-hidden touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        >
          {/* Seta Anterior no Desktop */}
          {total > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onMudarIndice((indice - 1 + total) % total)
              }}
              className="hidden sm:flex absolute left-6 top-1/2 -translate-y-1/2 z-40 size-14 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 items-center justify-center backdrop-blur-xl shadow-2xl transition-all hover:scale-110 active:scale-95"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="size-8" />
            </button>
          )}

          {/* Imagem com Transformações Suaves */}
          <div
            className={cn(
              "flex items-center justify-center max-h-[82dvh] max-w-[95dvw] transition-transform duration-75 ease-out",
              isDragging && "cursor-grabbing",
              zoom > 1 && !isDragging && "cursor-grab"
            )}
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom}) rotate(${rotacao}deg)`,
            }}
          >
            {currentUrl ? (
              <img
                src={currentUrl}
                alt={foto?.legenda || `Foto ${indice + 1}`}
                className="max-h-[78dvh] max-w-[92dvw] sm:max-h-[82dvh] sm:max-w-[85dvw] object-contain rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)] pointer-events-none select-none"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-stone-400">
                <Sparkles className="size-10 text-[#d9b978] mb-2 opacity-60" />
                <p className="font-display text-sm font-semibold">Imagem não carregada</p>
              </div>
            )}
          </div>

          {/* Seta Próximo no Desktop */}
          {total > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onMudarIndice((indice + 1) % total)
              }}
              className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 z-40 size-14 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 items-center justify-center backdrop-blur-xl shadow-2xl transition-all hover:scale-110 active:scale-95"
              aria-label="Próxima foto"
            >
              <ChevronRight className="size-8" />
            </button>
          )}

          {/* Botões Flutuantes Rápidos de Zoom Mobile no Centro-Base */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 bg-black/70 backdrop-blur-xl border border-white/20 px-3 py-1.5 rounded-full shadow-2xl sm:hidden">
            <button
              type="button"
              onClick={handleZoomOut}
              className="size-8 rounded-full bg-white/10 text-white flex items-center justify-center active:scale-90"
              title="Diminuir Zoom"
            >
              <ZoomOut className="size-4" />
            </button>

            <button
              type="button"
              onClick={resetTransforms}
              className="px-2.5 py-1 text-[11px] font-mono font-bold text-[#d9b978]"
            >
              {Math.round(zoom * 100)}%
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              className="size-8 rounded-full bg-white/10 text-white flex items-center justify-center active:scale-90"
              title="Aumentar Zoom"
            >
              <ZoomIn className="size-4" />
            </button>
          </div>
        </div>

        {/* Rodapé iOS: Legenda e Miniaturas */}
        <div className="p-3 sm:p-4 bg-black/60 backdrop-blur-xl border-t border-white/10 flex flex-col gap-2 z-50">
          {/* Legenda / Título da Foto */}
          <div className="max-w-md mx-auto w-full text-center">
            {editando ? (
              <div className="flex items-center gap-2">
                <Input
                  value={legenda}
                  onChange={(e) => setLegenda(e.target.value)}
                  placeholder="Escreva a legenda desta foto..."
                  autoFocus
                  className="h-8 rounded-xl border-white/20 bg-white/10 text-xs text-white placeholder:text-white/40 focus-visible:ring-[#d9b978]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") salvarLegenda()
                    if (e.key === "Escape") setEditando(false)
                  }}
                />
                <Button size="sm" className="h-8 rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs" onClick={salvarLegenda}>
                  <Check className="size-3.5 mr-1" /> OK
                </Button>
              </div>
            ) : (
              <div
                className="group flex items-center justify-center gap-1.5 cursor-pointer py-1 px-3 rounded-xl hover:bg-white/10 transition-colors"
                onClick={() => setEditando(true)}
                title="Toque para editar a legenda"
              >
                <p className={cn("text-xs truncate", legenda ? "text-white font-medium" : "text-white/40 italic")}>
                  {legenda || "Toque para adicionar legenda"}
                </p>
                <Pencil className="size-3 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            )}
          </div>

          {/* Filmstrip iOS (Miniaturas deslizáveis na base) */}
          {total > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
              {urls.map((u, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onMudarIndice(i)}
                  className={cn(
                    "relative size-12 sm:size-14 rounded-xl overflow-hidden border-2 transition-all shrink-0",
                    i === indice
                      ? "border-[#d9b978] ring-2 ring-[#d9b978]/50 scale-105"
                      : "border-transparent opacity-40 hover:opacity-100"
                  )}
                >
                  <img src={u} alt={`Miniatura ${i + 1}`} className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
