import { Link } from "react-router-dom"
import { ThemeToggle } from "./ThemeToggle"
import { HarasLogo } from "@/components/icons/HarasLogo"
import { useAuth } from "@/lib/auth-context"
import { Crown } from "lucide-react"

export function MobileTopBar() {
  const { haras, isSuperAdmin } = useAuth()
  const nomeHaras = haras?.nomeHaras || "Haras Cardoso"

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800/60 bg-white/75 dark:bg-stone-950/75 px-4 py-2.5 backdrop-blur-2xl lg:hidden print:hidden">
      <Link to="/app" className="flex items-center gap-2.5 active:scale-95 transition-transform min-w-0">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-b from-[#1c4338] to-[#0a1914] shadow-md border border-[#d9b978]/50 p-1 shrink-0 overflow-hidden">
          {haras?.logoUrl ? (
            <img
              src={haras.logoUrl}
              alt={nomeHaras}
              className="size-full object-contain"
            />
          ) : (
            <HarasLogo className="size-full object-contain filter drop-shadow-sm" />
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-display text-base font-black tracking-tight text-foreground leading-none truncate">
            {nomeHaras}
          </span>
          <span className="text-[9px] uppercase tracking-widest text-[#d9b978] font-bold truncate mt-0.5">
            {haras?.subtitulo || "Gestão & Genética"}
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-1.5 shrink-0">
        {isSuperAdmin && (
          <Link
            to="/superadmin"
            className="flex size-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/40 text-xs font-bold mr-1"
            title="SuperAdmin Master"
          >
            <Crown className="size-4" />
          </Link>
        )}
        <ThemeToggle />
      </div>
    </header>
  )
}
