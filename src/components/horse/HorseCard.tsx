import { Link } from "react-router-dom"
import { ArrowUpRight, Clapperboard, Sparkles } from "lucide-react"
import SpotlightCard from "@/components/bits/SpotlightCard/SpotlightCard"
import { HorseAvatar } from "./HorseAvatar"
import { calcularIdade } from "@/lib/db"
import { temaPelagem } from "@/lib/pelagens"
import { SEXO_LABEL, STATUS_LABEL, type Equino } from "@/lib/types"
import { cn } from "@/lib/utils"

interface HorseCardProps {
  equino: Equino
  fotoUrl?: string
  temVideo?: boolean
}

const STATUS_DOT: Record<Equino["status"], string> = {
  ativo: "bg-emerald-500",
  aposentado: "bg-stone-400",
  vendido: "bg-sky-500",
  falecido: "bg-red-500",
}

export function HorseCard({ equino, fotoUrl, temVideo }: HorseCardProps) {
  return (
    <SpotlightCard className="group h-full overflow-hidden rounded-2xl p-0 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5">
      <Link to={`/equinos/${equino.id}`} className="flex h-full flex-col">
        {/* Foto com overlay */}
        <div className="relative">
          <HorseAvatar
            nome={equino.nome}
            fotoUrl={fotoUrl}
            tema={temaPelagem(equino.pelagem)}
            className="aspect-[4/3] transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h3 className="font-display text-lg font-semibold leading-tight text-white drop-shadow-sm">
              {equino.nome}
            </h3>
            <p className="mt-0.5 text-xs font-medium text-white/80">
              {equino.raca} · {equino.pelagem} · {calcularIdade(equino.nascimento)}
            </p>
          </div>
          {/* Badges */}
          <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
            {temVideo && (
              <span className="flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                <Clapperboard className="size-3" />
                Vídeo
              </span>
            )}
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-stone-800 backdrop-blur-sm">
              {SEXO_LABEL[equino.sexo]}
            </span>
          </div>
        </div>

        {/* Rodapé do card */}
        <div className="flex flex-1 items-center justify-between gap-3 border-t border-border/70 p-4">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className={cn("size-1.5 rounded-full", STATUS_DOT[equino.status])} />
            {STATUS_LABEL[equino.status]}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Ver ficha
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
          {!equino.registro ? null : (
            <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
              <Sparkles className="size-3" />
              {equino.registro}
            </span>
          )}
        </div>
      </Link>
    </SpotlightCard>
  )
}
