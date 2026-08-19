import { useState } from "react"
import {
  FileSpreadsheet,
  Printer,
} from "lucide-react"
import { HarasLogo } from "@/components/icons/HarasLogo"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { tocarSomSucesso } from "@/lib/sound-alerts"

interface ItemFaturamento {
  descricao: string
  quantidade: number
  valorUnitario: number
}

interface ModalEspelhoNotaFiscalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clienteNome?: string
}

export function ModalEspelhoNotaFiscal({
  open,
  onOpenChange,
  clienteNome = "Cliente Haras",
}: ModalEspelhoNotaFiscalProps) {
  const { haras } = useAuth()

  const [numeroDemonstrativo] = useState(
    () => `NF-ESP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(100 + Math.random() * 900)}`
  )
  const [tomador, setTomador] = useState(clienteNome)
  const [documentoTomador, setDocumentoTomador] = useState("000.000.000-00")
  const [enderecoTomador] = useState("Av. dos Criadores, 120 - Fazenda")
  const [competencia, setCompetencia] = useState(
    () => `${String(new Date().getMonth() + 1).padStart(2, "0")}/${new Date().getFullYear()}`
  )

  const [itens] = useState<ItemFaturamento[]>([
    { descricao: "Hospedagem & Pensão Completa de Baia (Mês)", quantidade: 1, valorUnitario: 1800 },
    { descricao: "Treinamento & Manejo de Marcha / Pista", quantidade: 1, valorUnitario: 600 },
    { descricao: "Serviço de Casqueamento e Ferrageamento", quantidade: 1, valorUnitario: 220 },
    { descricao: "Aplicação de Suplementação & Vitamina E", quantidade: 1, valorUnitario: 150 },
  ])

  const totalBruto = itens.reduce((acc, item) => acc + item.quantidade * item.valorUnitario, 0)
  const aliquotaImposto = 0.05 // 5% ISS/Simples estimado
  const impostoEstimado = totalBruto * aliquotaImposto

  function handleImprimir() {
    tocarSomSucesso()
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-background border-stone-200 dark:border-stone-800 rounded-3xl p-6">
        <DialogHeader className="print:hidden">
          <DialogTitle className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <FileSpreadsheet className="size-5 text-[#d9b978]" />
            Espelho de Nota Fiscal & Demonstrativo de Serviços
          </DialogTitle>
        </DialogHeader>

        {/* Ajustes do Demonstrativo (Oculto na Impressão) */}
        <div className="print:hidden space-y-3 bg-muted/40 p-4 rounded-2xl border border-border mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-foreground block mb-1">Cliente / Tomador</label>
              <Input
                value={tomador}
                onChange={(e) => setTomador(e.target.value)}
                className="h-9 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-foreground block mb-1">CPF / CNPJ</label>
              <Input
                value={documentoTomador}
                onChange={(e) => setDocumentoTomador(e.target.value)}
                className="h-9 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-foreground block mb-1">Mês de Competência</label>
              <Input
                value={competencia}
                onChange={(e) => setCompetencia(e.target.value)}
                placeholder="MM/AAAA"
                className="h-9 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* ÁREA TIMBRADA FISCAL A4 */}
        <div className="mt-4 p-8 border-2 border-stone-800 rounded-2xl bg-white text-black space-y-6 shadow-md print:shadow-none print:m-0 print:p-8 print:w-full">
          {/* Topo do Demonstrativo Fiscal */}
          <div className="flex items-start justify-between border-b-2 border-stone-800 pb-4">
            <div className="flex items-center gap-3">
              <HarasLogo className="size-14" />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
                  DEMONSTRATIVO FISCAL DE PRESTAÇÃO DE SERVIÇOS
                </span>
                <h2 className="font-display text-xl font-black uppercase text-stone-900 leading-tight">
                  {haras?.nomeHaras || "Haras Cardoso"}
                </h2>
                <p className="text-xs text-stone-600 font-medium">
                  {haras?.responsavel || "Administração Geral"} · {haras?.cidadeUf || "São Paulo - SP"}
                </p>
                <p className="text-[11px] text-stone-500">Contato: {haras?.telefone || "(11) 99999-9999"}</p>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] text-stone-500 block uppercase font-bold">Documento Auxiliar</span>
              <p className="text-xs font-black text-stone-900">{numeroDemonstrativo}</p>
              <p className="text-[11px] text-stone-600 mt-1">Competência: <strong>{competencia}</strong></p>
            </div>
          </div>

          {/* Dados do Tomador / Cliente */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-300 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] font-bold text-stone-500 uppercase block">Tomador dos Serviços:</span>
              <p className="font-bold text-stone-900">{tomador}</p>
              <p className="text-stone-600">Documento: {documentoTomador}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-500 uppercase block">Endereço / Localidade:</span>
              <p className="text-stone-700">{enderecoTomador}</p>
              <p className="text-stone-500 text-[11px]">Natureza da Operação: Prestação de Serviços Rurais</p>
            </div>
          </div>

          {/* Tabela de Serviços */}
          <div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-stone-800 bg-stone-100 font-bold uppercase text-[10px] text-stone-700">
                  <th className="py-2.5 px-3">Item / Descrição do Serviço</th>
                  <th className="py-2.5 px-3 text-center w-16">Qtd</th>
                  <th className="py-2.5 px-3 text-right w-28">Unitário</th>
                  <th className="py-2.5 px-3 text-right w-28">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {itens.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/80">
                    <td className="py-2.5 px-3 font-medium text-stone-900">{item.descricao}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{item.quantidade}</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      R$ {item.valorUnitario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                      R$ {(item.quantidade * item.valorUnitario).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumo Financeiro & Impostos */}
          <div className="pt-3 border-t-2 border-stone-800 flex justify-end">
            <div className="w-72 space-y-1.5 text-xs text-stone-700">
              <div className="flex justify-between">
                <span>Total Bruto dos Serviços:</span>
                <span className="font-mono font-bold text-stone-900">
                  R$ {totalBruto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-stone-500 text-[11px]">
                <span>Tributos Estimados (5% Simples/ISS):</span>
                <span className="font-mono">
                  R$ {impostoEstimado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="pt-2 border-t border-stone-300 flex justify-between text-sm font-black text-stone-950">
                <span>VALOR LÍQUIDO A PAGAR:</span>
                <span className="font-mono text-base text-emerald-800">
                  R$ {totalBruto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Rodapé e Declaração */}
          <div className="pt-6 border-t border-stone-200 text-[10px] text-stone-500 leading-relaxed text-center">
            <p>
              Este espelho destina-se à conferência de faturamento e prestação de contas dos serviços de manejo, hospedagem e treinamento equino.
            </p>
            <p className="mt-0.5 font-bold">
              {haras?.nomeHaras || "Haras Cloud"} · Emitido em {new Date().toLocaleDateString("pt-BR")}
            </p>
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
            Imprimir Demonstrativo / PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
