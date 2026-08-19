import { useCallback, useEffect, useRef, useState } from "react"
import { blobParaUrl, getAllEquinos, getFotoPrincipal, temVideo } from "./db"
import { carregarDadosExemplo } from "./dados-exemplo"
import type { Equino, FotoEquino, VideoEquino } from "./types"

/** Converte blobs de fotos em URLs de objeto, revogando ao desmontar. */
export function useFotoUrls(fotos: FotoEquino[]): string[] {
  const [urls, setUrls] = useState<string[]>([])
  useEffect(() => {
    const criadas = fotos.map((f) => blobParaUrl(f.blob))
    setUrls(criadas)
    return () => criadas.forEach((u) => URL.revokeObjectURL(u))
  }, [fotos])
  return urls
}

/** Converte blobs de vídeos em URLs de objeto, revogando ao desmontar. */
export function useVideoUrls(videos: VideoEquino[]): string[] {
  const [urls, setUrls] = useState<string[]>([])
  useEffect(() => {
    const criadas = videos.map((v) => blobParaUrl(v.blob))
    setUrls(criadas)
    return () => criadas.forEach((u) => URL.revokeObjectURL(u))
  }, [videos])
  return urls
}

export interface EquinosComFotos {
  equinos: Equino[]
  fotos: Record<string, string>
  videos: Record<string, boolean>
  loading: boolean
  reload: () => void
}

/** Carrega todos os equinos, a foto principal e se há vídeo de cada um com alta performance e sem bloqueios. */
export function useEquinosComFotos(): EquinosComFotos {
  const [equinos, setEquinos] = useState<Equino[]>([])
  const [fotos, setFotos] = useState<Record<string, string>>({})
  const [videos, setVideos] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [versao, setVersao] = useState(0)
  const urlsAnteriores = useRef<string[]>([])

  const reload = useCallback(() => setVersao((v) => v + 1), [])

  useEffect(() => {
    let cancelado = false
    ;(async () => {
      try {
        const lista = await getAllEquinos()

        if (cancelado) return

        // Renderiza os animais imediatamente para ZERO delay na tela
        setEquinos(lista)
        setLoading(false)

        // Busca fotos e vídeos em paralelo no background sem travar a interface
        const urls: Record<string, string> = {}
        const tems: Record<string, boolean> = {}

        await Promise.all(
          lista.map(async (e) => {
            try {
              const [foto, hasVid] = await Promise.all([
                getFotoPrincipal(e.id),
                temVideo(e.id),
              ])
              if (foto) urls[e.id] = blobParaUrl(foto.blob)
              if (hasVid) tems[e.id] = true
            } catch (err) {
              console.warn("Erro ao buscar mídia de equino:", e.id, err)
            }
          })
        )

        if (cancelado) return

        urlsAnteriores.current.forEach((u) => URL.revokeObjectURL(u))
        urlsAnteriores.current = Object.values(urls)
        setFotos(urls)
        setVideos(tems)
      } catch (error) {
        console.error("Erro ao carregar equinos:", error)
        if (!cancelado) setLoading(false)
      }
    })()

    return () => {
      cancelado = true
    }
  }, [versao])

  return { equinos, fotos, videos, loading, reload }
}

