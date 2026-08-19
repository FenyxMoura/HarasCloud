import { useState } from "react"
import {
  FileCheck,
  Printer,
} from "lucide-react"
import { HarasLogo } from "@/components/icons/HarasLogo"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { tocarSomSucesso } from "@/lib/sound-alerts"

interface ModalReciboOficialProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dadosIniciais?: {
    pagador?: string
    documento?: string
    valor?: number
    referente?: string
    data?: string
  }
}

export function ModalReciboOficial({
  open,
  onOpenChange,
  dadosIniciais,
}: ModalReciboOficialProps) {
  const { haras } = useAuth()

  const [numeroRecibo] = useState(
    () => `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  )
  const [pagador, setPagador] = useState(dadosIniciais?.pagador || "")
  const [documentoPagador, setDocumentoPagador] = useState(dadosIniciais?.documento || "")
  const [valor, setValor] = useState(dadosIniciais?.valor?.toString() || "1500")
  const [referente, setReferente] = useState(
    dadosIniciais?.referente || "Serviços de hospedagem e manejo equino (Pensão de Baia)"
  )
  const [dataEmissao, setDataEmissao] = useState(
    dadosIniciais?.data || new Date().toISOString().slice(0, 10)
  )
  const [formaPagamento, setFormaPagamento] = useState("Transferência Bancária / PIX")

  function handleImprimir() {
    tocarSomSucesso()
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-stone-200 dark:border-stone-800 rounded-3xl p-6">
        <DialogHeader className="print:hidden">
          <DialogTitle className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <FileCheck className="size-5 text-[#d9b978]" />
            Emissor de Recibo Oficial A4
          </DialogTitle>
        </DialogHeader>

        {/* Formulário de Ajuste Rápido (Oculto na Impressão) */}
        <div className="print:hidden space-y-3 bg-muted/40 p-4 rounded-2xl border border-border mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-foreground block mb-1">Nome do Pagador / Cliente</label>
              <Input
                value={pagador}
                onChange={(e) => setPagador(e.target.value)}
                placeholder="Ex: João Ferreira da Costa"
                className="h-9 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-foreground block mb-1">CPF / CNPJ do Pagador</label>
              <Input
                value={documentoPagador}
                onChange={(e) => setDocumentoPagador(e.target.value)}
                placeholder="000.000.000-00"
                className="h-9 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-foreground block mb-1">Valor (R$)</label>
              <Input
                type="number"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="h-9 rounded-xl font-mono font-bold text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-foreground block mb-1">Forma de Pagamento</label>
              <Input
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                className="h-9 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-foreground block mb-1">Data de Emissão</label>
              <Input
                type="date"
                value={dataEmissao}
                onChange={(e) => setDataEmissao(e.target.value)}
                className="h-9 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-foreground block mb-1">Referente a (Especificação)</label>
            <Input
              value={referente}
              onChange={(e) => setReferente(e.target.value)}
              className="h-9 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* ÁREA IMPRESSA / DOCUMENTO OFICIAL A4 */}
        <div className="mt-4 p-8 border-2 border-stone-800/60 rounded-2xl bg-white text-black space-y-6 shadow-md print:shadow-none print:border-stone-800 print:m-0 print:p-8 print:w-full">
          {/* Cabeçalho */}
          <div className="flex items-start justify-between border-b-2 border-stone-800 pb-4">
            <div className="flex items-center gap-3">
              <HarasLogo className="size-12" />
              <div>
                <h2 className="font-display text-xl font-black tracking-tight uppercase">
                  {haras?.nomeHaras || "Haras Cardoso"}
                </h2>
                <p className="text-xs text-stone-600 font-medium">
                  {haras?.subtitulo || "Centro de Criação e Treinamento Equino"}
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {haras?.cidadeUf || "São Paulo - SP"} · Contato: {haras?.telefone || "(11) 99999-9999"}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-stone-500 uppercase">Recibo Oficial</span>
              <p className="font-mono text-sm font-black text-stone-800">{numeroRecibo}</p>
              <div className="mt-1 px-3 py-1 bg-stone-100 border border-stone-300 rounded-lg text-right">
                <span className="text-[10px] text-stone-500 uppercase block font-bold">Valor</span>
                <span className="font-mono text-base font-black text-stone-900">
                  R$ {Number(valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Corpo do Recibo */}
          <div className="space-y-4 text-xs sm:text-sm text-stone-800 leading-relaxed text-justify">
            <p>
              Recebemos de <strong>{pagador || "_____________________________________"}</strong>
              {documentoPagador ? `, inscrito(a) sob o CPF/CNPJ nº <strong>${documentoPagador}</strong>` : ""}, a quantia de{" "}
              <strong>
                R$ {Number(valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </strong>
              , correspondente a:
            </p>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 font-medium text-stone-700 italic">
              "{referente}"
            </div>

            <p>
              Forma de Pagamento: <strong>{formaPagamento}</strong>.
            </p>

            <p className="text-stone-600 text-xs">
              Para maior clareza e firmeza do que foi acordado, firmamos o presente recibo dando plena, geral e irrevogável quitação da importância recebida.
            </p>
          </div>

          {/* Data e Assinaturas */}
          <div className="pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-8 text-center text-xs">
            <div>
              <p className="text-stone-600">
                {haras?.cidadeUf || "Localidade"}, {dataEmissao.split("-").reverse().join("/")}
              </p>
            </div>

            <div className="w-64 space-y-1">
              <div className="border-b border-stone-800 w-full mb-1" />
              <p className="font-bold text-stone-900">{haras?.responsavel || "Administração do Haras"}</p>
              <p className="text-[10px] text-stone-500 uppercase">{haras?.nomeHaras || "Haras Cloud"}</p>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="print:hidden pt-4 flex items-center justify-end gap-2.5">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl text-xs">
            Fechar
          </Button>
          <Button
            onClick={handleImprimir}
            className="rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs hover:bg-[#1c4338] shadow-md"
          >
            <Printer className="mr-1.5 size-4" />
            Imprimir / Salvar PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
