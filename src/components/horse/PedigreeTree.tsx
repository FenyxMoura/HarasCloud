import { Link } from "react-router-dom"
import { Dna, ExternalLink, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { corPelagem } from "@/lib/pelagens"
import type { Genealogia3Geracoes, NoGenealogico } from "@/lib/db"
import { cn } from "@/lib/utils"

interface PedigreeTreeProps {
  genealogia: Genealogia3Geracoes
}

function AncestorCard({
  no,
  papel,
  sexo,
  destaque = false,
}: {
  no?: NoGenealogico
  papel: string
  sexo: "macho" | "femea"
  destaque?: boolean
}) {
  const isMacho = sexo === "macho"
  const corBorder = isMacho
    ? "border-sky-500/30 dark:border-sky-500/20 bg-sky-50/50 dark:bg-sky-950/20"
    : "border-rose-500/30 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20"

  if (!no || !no.nome) {
    return (
      <div
        className={cn(
          "flex flex-col justify-center rounded-xl border border-dashed border-stone-300 p-3 text-center text-xs text-stone-400 dark:border-stone-800 dark:text-stone-600 min-h-[70px]",
        )}
      >
        <span className="font-semibold uppercase tracking-wider text-[10px] text-stone-400/80 mb-0.5">
          {papel}
        </span>
        <span>Não informado</span>
      </div>
    )
  }

  const pelagemCor = no.pelagem ? corPelagem(no.pelagem) : undefined

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all shadow-sm",
        corBorder,
        destaque ? "ring-2 ring-[#d9b978]/60 shadow-md bg-white dark:bg-stone-900" : "hover:border-stone-400 dark:hover:border-stone-700",
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
            isMacho
              ? "bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300"
              : "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300",
          )}
        >
          {papel}
        </span>
        {no.cadastrado && no.id && (
          <Link
            to={`/equinos/${no.id}`}
            className="inline-flex items-center gap-1 text-[11px] text-[#8c6d3f] hover:underline dark:text-[#d9b978]"
            title="Abrir ficha do animal"
          >
            <span>Ver ficha</span>
            <ExternalLink className="size-3" />
          </Link>
        )}
      </div>

      <div>
        <p className="font-bold text-stone-900 dark:text-stone-100 text-sm leading-snug group-hover:text-[#8c6d3f] transition-colors">
          {no.nome}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-xs text-stone-600 dark:text-stone-400">
          {no.raca && <span className="truncate max-w-[120px]">{no.raca}</span>}
          {no.pelagem && (
            <span className="inline-flex items-center gap-1">
              <span
                className="size-2 rounded-full border border-black/10 inline-block"
                style={{ backgroundColor: pelagemCor }}
              />
              <span>{no.pelagem}</span>
            </span>
          )}
          {no.registro && (
            <span className="font-mono text-[10px] bg-stone-200/70 dark:bg-stone-800 px-1.5 py-0.2 rounded text-stone-700 dark:text-stone-300">
              Reg: {no.registro}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function PedigreeTree({ genealogia }: PedigreeTreeProps) {
  const { animal, pai, mae, avoPaterno, avoMaternoPaterno, avoMaterno, avoMaternoMaterno } = genealogia

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#143129] text-[#d9b978]">
            <Dna className="size-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
              Árvore Genealógica (Pedigree 3 Gerações)
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Linhagem genética oficial com ancestrais diretos, raças e registros zootécnicos.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 border-[#d9b978]/40 bg-[#d9b978]/10 text-[#8c6d3f] dark:text-[#d9b978]">
            <Sparkles className="size-3" />
            <span>Linhagem Verificada</span>
          </Badge>
        </div>
      </div>

      {/* Dica para mobile */}
      <p className="text-[11px] text-stone-500 md:hidden flex items-center gap-1">
        <span>↔</span> Deslize para os lados para navegar na árvore completa
      </p>

      {/* Grid responsivo em 3 colunas (1ª Ger: Animal | 2ª Ger: Pais | 3ª Ger: Avós) */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="min-w-[720px] grid grid-cols-3 gap-4 items-center bg-stone-50/60 dark:bg-stone-900/40 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800/80">
          
          {/* Coluna 1: O Equino (1ª Geração) */}
          <div className="flex flex-col justify-center">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 text-center">
              1ª Geração (Animal)
            </div>
            <AncestorCard
              no={animal}
              papel="Indivíduo"
              sexo={animal.sexo === "femea" ? "femea" : "macho"}
              destaque={true}
            />
          </div>

          {/* Coluna 2: Pais (2ª Geração) */}
          <div className="flex flex-col justify-between gap-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 mb-1.5 text-center">
                Pai (50%)
              </div>
              <AncestorCard no={pai} papel="Pai" sexo="macho" />
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-1.5 text-center">
                Mãe (50%)
              </div>
              <AncestorCard no={mae} papel="Mãe" sexo="femea" />
            </div>
          </div>

          {/* Coluna 3: Avós (3ª Geração) */}
          <div className="grid grid-rows-4 gap-3">
            <div>
              <AncestorCard no={avoPaterno} papel="Avô Paterno" sexo="macho" />
            </div>
            <div>
              <AncestorCard no={avoMaternoPaterno} papel="Avó Paterna" sexo="femea" />
            </div>
            <div>
              <AncestorCard no={avoMaterno} papel="Avô Materno" sexo="macho" />
            </div>
            <div>
              <AncestorCard no={avoMaternoMaterno} papel="Avó Materna" sexo="femea" />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
