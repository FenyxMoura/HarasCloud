import { Link } from "react-router-dom"
import { ArrowRight, Clock, Crown } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { PLANOS_DISPONIVEIS } from "@/lib/types"

export function TrialBanner() {
  const { haras, isVisitanteDemo, isSuperAdmin } = useAuth()

  if (!haras || isVisitanteDemo || isSuperAdmin || haras.statusAssinatura !== "trial") {
    return null
  }

  const planoInfo = PLANOS_DISPONIVEIS[haras.plano]

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 px-4 py-2 text-xs font-bold border-b border-amber-600/30 flex items-center justify-between gap-3 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-2 max-w-2xl truncate">
        <span className="flex size-6 items-center justify-center rounded-lg bg-stone-950 text-amber-400 shrink-0 font-black">
          <Clock className="size-3.5" />
        </span>
        <span className="truncate">
          <strong>Período de Testes Ativo ({planoInfo?.nome || "Plano Marchador"}):</strong> 100% dos recursos liberados até {haras.dataExpiracao}.
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link to="/configuracoes">
          <Button
            size="sm"
            className="h-7 px-3 rounded-lg bg-stone-950 hover:bg-stone-900 text-amber-400 font-black text-[11px] shadow-sm active:scale-95 transition-all"
          >
            <Crown className="size-3 mr-1 text-amber-400" />
            Contratar Plano Definitivo
            <ArrowRight className="size-3 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
