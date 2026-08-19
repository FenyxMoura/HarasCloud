import { useAuth } from "@/lib/auth-context"
import { ArrowLeft, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ImpersonationBanner() {
  const { isImpersonating, haras, stopImpersonating } = useAuth()

  if (!isImpersonating || !haras) return null

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between border-b border-amber-500/30 bg-amber-600 px-4 py-2 text-white shadow-md print:hidden">
      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
        <ShieldAlert className="size-4.5 animate-pulse shrink-0" />
        <span>
          Modo Suporte Ativo: Você está no painel do <strong className="underline">{haras.nomeHaras}</strong>
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={stopImpersonating}
        className="h-7 rounded-lg border-white/40 bg-white/20 text-xs font-bold text-white hover:bg-white hover:text-stone-900 transition-colors shadow-none"
      >
        <ArrowLeft className="mr-1.5 size-3.5" />
        Sair e Voltar ao SuperAdmin
      </Button>
    </div>
  )
}
