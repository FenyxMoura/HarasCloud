import { Link } from "react-router-dom"
import { ArrowRight, Eye, Sparkles } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export function DemoVisitorBanner() {
  const { isVisitanteDemo } = useAuth()

  if (!isVisitanteDemo) return null

  return (
    <div className="bg-gradient-to-r from-[#143129] via-[#1c4338] to-[#143129] text-white px-4 py-2 text-xs font-semibold border-b border-[#d9b978]/40 flex items-center justify-between gap-3 sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-2 max-w-2xl truncate">
        <span className="flex size-6 items-center justify-center rounded-lg bg-[#d9b978] text-[#143129] shrink-0 font-bold">
          <Eye className="size-3.5" />
        </span>
        <span className="truncate">
          <strong>Modo Demonstração (Visitante):</strong> Você está navegando em uma cópia de teste com dados simulados.
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link to="/registro">
          <Button
            size="sm"
            className="h-7 px-3 rounded-lg bg-[#d9b978] hover:bg-[#e8c88a] text-[#143129] font-bold text-[11px] shadow-sm active:scale-95"
          >
            <Sparkles className="size-3 mr-1" />
            Criar Minha Conta no Haras
            <ArrowRight className="size-3 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
