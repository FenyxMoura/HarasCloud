import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

/** Botão de instalação do PWA — aparece apenas quando o usuário está logado no sistema */
export function InstallPrompt() {
  const { usuario, isVisitanteDemo } = useAuth()
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [oculto, setOculto] = useState(false)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setOculto(true)
      setDeferred(null)
    }
    const jaInstalado =
      window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as unknown as { standalone?: boolean }).standalone === true

    window.addEventListener("beforeinstallprompt", onPrompt)
    window.addEventListener("appinstalled", onInstalled)
    if (jaInstalado) setOculto(true)
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  // Só exibe se estiver logado com conta real
  if (!usuario || isVisitanteDemo || !deferred || oculto) return null

  return (
    <div className="fixed bottom-[82px] right-3 z-30 flex items-center gap-1.5 rounded-2xl bg-[#143129] p-1 shadow-xl shadow-black/30 border border-[#d9b978]/30 sm:bottom-6 sm:right-6 print:hidden">
      <Button
        size="sm"
        className="h-8 rounded-xl bg-transparent px-3 text-xs font-bold text-[#d9b978] hover:bg-[#1c4338] shadow-none"
        onClick={async () => {
          await deferred.prompt()
          setDeferred(null)
        }}
      >
        <Download className="mr-1.5 size-3.5" />
        Instalar app
      </Button>
      <button
        type="button"
        onClick={() => setOculto(true)}
        className="flex size-7 items-center justify-center rounded-xl text-stone-400 hover:bg-white/10 hover:text-white"
        aria-label="Fechar aviso de instalação"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}
