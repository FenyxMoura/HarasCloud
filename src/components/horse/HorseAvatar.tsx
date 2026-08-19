import { useMemo } from "react"
import { HorseIcon } from "@/components/icons/HorseIcon"
import { cn } from "@/lib/utils"

const GRADIENTES = [
  "from-[#112922] via-[#18392f] to-[#0c1f19]",
  "from-[#2a241f] via-[#3d342d] to-[#1c1815]",
  "from-[#4a2810] via-[#633614] to-[#2e1809]",
  "from-[#1a2333] via-[#243247] to-[#101722]",
  "from-[#381616] via-[#4d1e1e] to-[#240e0e]",
  "from-[#283818] via-[#384e22] to-[#19240f]",
]

interface HorseAvatarProps {
  nome: string
  fotoUrl?: string
  className?: string
  /** Classes de gradiente para o fundo quando não há foto (ex.: tema da pelagem). */
  tema?: string
  /** Tamanho das iniciais. */
  tamanhoIniciais?: string
  mostrarIcone?: boolean
}

export function HorseAvatar({
  nome,
  fotoUrl,
  className,
  tema,
  tamanhoIniciais = "text-2xl sm:text-3xl",
  mostrarIcone = true,
}: HorseAvatarProps) {
  const gradiente = useMemo(() => {
    if (tema) return tema
    let hash = 0
    for (const c of nome) hash = (hash * 31 + c.charCodeAt(0)) >>> 0
    return GRADIENTES[hash % GRADIENTES.length]
  }, [nome, tema])

  const iniciais = useMemo(() => {
    return (
      nome
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase() || "H"
    )
  }, [nome])

  return (
    <div className={cn("relative overflow-hidden flex items-center justify-center select-none", className)}>
      {fotoUrl ? (
        <img src={fotoUrl} alt={nome} className="h-full w-full object-cover" />
      ) : (
        <div
          className={cn(
            "relative h-full w-full flex flex-col items-center justify-center bg-gradient-to-br transition-all duration-300",
            gradiente
          )}
        >
          {/* Luz ambiente e textura */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#d9b978]/15 via-transparent to-black/60 pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />

          {/* Marca d'água elegante da silhueta do cavalo */}
          {mostrarIcone && (
            <div className="absolute -right-2 -bottom-2 opacity-15 pointer-events-none text-[#d9b978]">
              <HorseIcon className="size-32 sm:size-44 rotate-[-8deg]" />
            </div>
          )}

          {/* Selo Equestre VIP / Brasão com Iniciais */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="relative size-16 sm:size-20 rounded-full border-2 border-[#d9b978]/80 bg-black/40 backdrop-blur-md shadow-2xl flex items-center justify-center p-1 group-hover:border-[#d9b978] transition-colors">
              {/* Anel interno pontilhado decorativo */}
              <div className="absolute inset-1 rounded-full border border-dashed border-[#d9b978]/40" />
              <span className={cn("font-serif font-black tracking-widest text-[#f5deb3] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]", tamanhoIniciais)}>
                {iniciais}
              </span>
            </div>
            <span className="mt-1.5 text-[9px] uppercase tracking-[0.2em] font-mono font-bold text-[#d9b978]/80 drop-shadow-sm">
              Pedigree Haras
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
