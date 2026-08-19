import { useEffect, useState } from "react"
import { Download, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CONFIG_ATUALIZACAO_PADRAO, type ConfigAtualizacaoApp } from "@/lib/types"

const STORAGE_APP_UPDATE = "haras_cloud_app_update_config_v1"
const VERSAO_CLIENTE_ATUAL = "2.0.0" // Versão rodando no cliente

export function ModalAtualizacaoObrigatoria() {
  const [config, setConfig] = useState<ConfigAtualizacaoApp>(() => {
    const raw = localStorage.getItem(STORAGE_APP_UPDATE)
    if (raw) {
      try {
        return JSON.parse(raw)
      } catch {
        // fallback
      }
    }
    return CONFIG_ATUALIZACAO_PADRAO
  })

  // Listener para sincronizar atualizações lançadas pelo SuperAdmin
  useEffect(() => {
    function checarAtualizacao() {
      const raw = localStorage.getItem(STORAGE_APP_UPDATE)
      if (raw) {
        try {
          setConfig(JSON.parse(raw))
        } catch {
          // ignore
        }
      }
    }
    window.addEventListener("storage", checarAtualizacao)
    return () => window.removeEventListener("storage", checarAtualizacao)
  }, [])

  // Compara versão: se versaoMinimaObrigatoria for maior e bloquearVersaoAntiga for true
  const precisaAtualizar =
    config.bloquearVersaoAntiga &&
    config.versaoMinimaObrigatoria > VERSAO_CLIENTE_ATUAL

  if (!precisaAtualizar) return null

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md bg-[#07130f] border-2 border-amber-500 text-white rounded-3xl p-6 shadow-2xl backdrop-blur-2xl">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <RefreshCw className="size-7 animate-spin text-amber-400" />
          </div>
          <DialogTitle className="font-display text-2xl font-black text-white">
            Atualização Obrigatória Disponível!
          </DialogTitle>
          <p className="text-xs text-stone-300 leading-relaxed">
            Uma nova versão essencial do <strong>Haras Cloud (v{config.versaoMinimaObrigatoria})</strong> foi lançada.
            Para garantir a segurança dos dados e o funcionamento dos novos recursos, atualize seu aplicativo agora.
          </p>
        </DialogHeader>

        <div className="space-y-3 my-2 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-stone-200">
            <p className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
              <Sparkles className="size-3.5" /> Novidades desta versão:
            </p>
            <p className="text-[11px] leading-relaxed text-stone-300">{config.notasVersao}</p>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            onClick={() => {
              const a = document.createElement("a")
              a.href = config.linkDownloadApk || "/app-release.apk"
              a.download = "HarasCloud-v" + config.versaoMinimaObrigatoria + ".apk"
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
            }}
            className="w-full h-12 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Download className="size-4 mr-2" />
            Baixar e Instalar Atualização Agora
          </Button>
          <p className="text-center text-[10px] text-stone-400 mt-2">
            O sistema voltará a liberar as ações automaticamente após a atualização.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
