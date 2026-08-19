import { useEffect, useState, type ReactNode } from "react"
import { AppWindow, Check, Download, Home, Share, Smartphone, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

type Plataforma = "ios" | "android" | "desktop" | "outro"

function detectarPlataforma(): Plataforma {
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  if (isIOS) return "ios"
  if (/Android/i.test(ua)) return "android"
  if (/Windows|Macintosh|Linux/.test(ua)) return "desktop"
  return "outro"
}

function Passo({ numero, icone, titulo, descricao }: { numero: number; icone: ReactNode; titulo: string; descricao: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {numero}
      </div>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-semibold">
          {icone}
          {titulo}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">{descricao}</p>
      </div>
    </div>
  )
}

/** Guia de instalação do PWA — abre apenas para usuários logados. */
export function InstallGuide() {
  const { usuario, isVisitanteDemo } = useAuth()
  const [aberto, setAberto] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [plataforma, setPlataforma] = useState<Plataforma>("outro")

  useEffect(() => {
    setPlataforma(detectarPlataforma())
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const abrir = () => {
      if (usuario && !isVisitanteDemo) setAberto(true)
    }
    window.addEventListener("beforeinstallprompt", onPrompt)
    window.addEventListener("abrir-guia-instalacao", abrir)

    const jaVisto = localStorage.getItem("haras-guia-instalacao-visto")
    const standalone = window.matchMedia("(display-mode: standalone)").matches
    const timer = setTimeout(() => {
      if (!standalone && !jaVisto && usuario && !isVisitanteDemo) setAberto(true)
    }, 4000)

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("abrir-guia-instalacao", abrir)
      clearTimeout(timer)
    }
  }, [usuario, isVisitanteDemo])

  function fechar() {
    localStorage.setItem("haras-guia-instalacao-visto", "1")
    setAberto(false)
  }

  async function instalarAgora() {
    if (!deferred) return
    await deferred.prompt()
    const escolha = await deferred.userChoice
    if (escolha.outcome === "accepted") setAberto(false)
    setDeferred(null)
  }

  return (
    <Dialog open={aberto} onOpenChange={(o) => (o ? setAberto(true) : fechar())}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 font-display text-2xl">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-800 text-white shadow-md">
              <Smartphone className="size-5" />
            </span>
            Instale o Haras no seu celular
          </DialogTitle>
          <DialogDescription>
            O app fica na tela inicial, abre em tela cheia e funciona até sem internet. Os dados continuam salvos neste aparelho.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {plataforma === "ios" && (
            <>
              <Passo
                numero={1}
                icone={<Share className="size-3.5 text-primary" />}
                titulo="Toque em Compartilhar"
                descricao="No Safari, toque no botão Compartilhar (o quadrado com a seta), na barra de baixo."
              />
              <Passo
                numero={2}
                icone={<AppWindow className="size-3.5 text-primary" />}
                titulo='Toque em "Adicionar à Tela de Início"'
                descricao="Role a lista de opções até encontrar o atalho azul com o símbolo de +."
              />
              <Passo
                numero={3}
                icone={<Home className="size-3.5 text-primary" />}
                titulo='Confirme em "Adicionar"'
                descricao="O ícone do Haras (ferradura dourada) aparece na sua tela inicial, pronto para usar."
              />
            </>
          )}

          {plataforma === "android" && (
            <>
              {deferred ? (
                <>
                  <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 text-center">
                    <p className="text-sm font-medium">Seu navegador permite instalar direto.</p>
                    <Button className="mt-3 w-full rounded-xl" onClick={instalarAgora}>
                      <Download className="size-4" />
                      Instalar agora
                    </Button>
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    Ou abra o menu ⋮ do navegador e toque em “Adicionar à tela inicial” / “Instalar app”.
                  </p>
                </>
              ) : (
                <>
                  <Passo
                    numero={1}
                    icone={<span className="font-bold">⋮</span>}
                    titulo="Abra o menu do navegador"
                    descricao="Toque nos três pontinhos, no canto superior direito."
                  />
                  <Passo
                    numero={2}
                    icone={<AppWindow className="size-3.5 text-primary" />}
                    titulo='Toque em "Instalar app"'
                    descricao="O atalho pode estar como “Instalar aplicativo” ou “Adicionar à tela inicial”."
                  />
                  <Passo
                    numero={3}
                    icone={<Home className="size-3.5 text-primary" />}
                    titulo="Pronto!"
                    descricao="O ícone do Haras (ferradura dourada) aparece na tela inicial."
                  />
                </>
              )}
            </>
          )}

          {plataforma === "desktop" && (
            <>
              <p className="text-sm text-muted-foreground">
                No computador, o app também pode ser instalado — fica na área de trabalho e abre em janela própria.
              </p>
              {deferred ? (
                <Button className="w-full rounded-xl" onClick={instalarAgora}>
                  <Download className="size-4" />
                  Instalar no computador
                </Button>
              ) : (
                <p className="rounded-xl bg-muted p-3 text-center text-xs text-muted-foreground">
                  No Chrome/Edge, o botão de instalar fica no ícone de monitor com o + na barra de endereço.
                </p>
              )}
            </>
          )}

          {plataforma === "outro" && (
            <p className="text-sm text-muted-foreground">
              No seu navegador, procure por “Adicionar à tela inicial” ou “Instalar app” no menu — o atalho do Haras vai aparecer
              com o ícone da ferradura dourada.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Check className="size-3.5 text-emerald-600" />
            Leva menos de 30 segundos
          </p>
          <Button variant="outline" className="rounded-xl" onClick={fechar}>
            <X className="size-3.5" />
            Agora não
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
