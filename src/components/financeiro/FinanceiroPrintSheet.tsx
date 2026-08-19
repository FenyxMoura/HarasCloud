import { QrCode } from "lucide-react"
import { formatarData } from "@/lib/db"
import type { Equino, Transacao } from "@/lib/types"

interface FinanceiroPrintSheetProps {
  transacoes: Transacao[]
  equinos: Equino[]
  mesFiltro: string
  resumo: {
    receitas: number
    despesas: number
    saldo: number
  }
  metricasPorEquino: Array<{
    equino: Equino
    metricas: {
      totalDespesas: number
      totalReceitas: number
      saldo: number
    }
  }>
  categoriasDespesa: Array<{
    categoria: string
    valor: number
    percentual: number
  }>
}

function formatarMoeda(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function FinanceiroPrintSheet({
  transacoes,
  equinos,
  mesFiltro,
  resumo,
  metricasPorEquino,
  categoriasDespesa,
}: FinanceiroPrintSheetProps) {
  const dataHoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
  const codigoRelatorio = `FIN-${new Date().getFullYear()}-${mesFiltro.replace("-", "") || "GERAL"}`
  
  const nomePeriodo = mesFiltro === "todos" 
    ? "Balanço Geral Acumulado" 
    : new Date(`${mesFiltro}-01T00:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).toUpperCase()

  const margemPercentual = resumo.receitas > 0 ? ((resumo.saldo / resumo.receitas) * 100).toFixed(1) : "0"

  return (
    <div
      id="print-sheet"
      className="hidden print:block bg-white text-stone-900 font-sans mx-auto w-full max-w-[210mm] p-3 text-[10px] leading-tight"
    >
      {/* Moldura Nobre de Documento Executivo */}
      <div className="border-2 border-[#143129] p-3.5 rounded-xl relative bg-[#fdfcf9]">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b-2 border-[#143129] pb-2 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-lg bg-[#143129] border border-[#d9b978] text-[#d9b978] flex items-center justify-center font-serif font-black text-lg shadow-xs">
              💰
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-serif font-black tracking-wider text-[#143129]">
                  HARAS SANTA FÉ
                </h1>
                <span className="bg-[#143129] text-[#d9b978] text-[7.5px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded">
                  LIVRO CAIXA
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-[#8c6d3f] font-bold">
                Relatório Executivo de Fluxo de Caixa & Demonstração de Resultados
              </p>
            </div>
          </div>

          <div className="text-right border-l-2 border-stone-200 pl-2.5">
            <p className="font-mono font-bold text-[#143129] text-[9.5px]">
              DOC: #{codigoRelatorio}
            </p>
            <p className="text-[8.5px] text-stone-500">
              EMISSÃO: {dataHoje}
            </p>
            <p className="text-[8.5px] font-bold text-stone-700">
              PERÍODO: {nomePeriodo}
            </p>
          </div>
        </div>

        {/* Quadro Resumo Executivo (DRE) */}
        <div className="grid grid-cols-4 gap-2 mb-2.5">
          <div className="border border-emerald-300 bg-emerald-50/50 p-2 rounded-lg text-center">
            <span className="text-[8.5px] uppercase font-bold text-emerald-800 block">Receitas Totais</span>
            <span className="font-mono font-bold text-sm text-emerald-700 block">
              {formatarMoeda(resumo.receitas)}
            </span>
          </div>

          <div className="border border-rose-300 bg-rose-50/50 p-2 rounded-lg text-center">
            <span className="text-[8.5px] uppercase font-bold text-rose-800 block">Despesas Totais</span>
            <span className="font-mono font-bold text-sm text-rose-700 block">
              {formatarMoeda(resumo.despesas)}
            </span>
          </div>

          <div className="border border-stone-300 bg-white p-2 rounded-lg text-center">
            <span className="text-[8.5px] uppercase font-bold text-stone-600 block">Resultado Líquido</span>
            <span className={`font-mono font-black text-sm block ${resumo.saldo >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {formatarMoeda(resumo.saldo)}
            </span>
          </div>

          <div className="border border-[#143129]/30 bg-[#143129]/10 p-2 rounded-lg text-center">
            <span className="text-[8.5px] uppercase font-bold text-[#143129] block">Margem / Rentabilidade</span>
            <span className="font-mono font-bold text-sm text-[#143129] block">
              {margemPercentual}%
            </span>
          </div>
        </div>

        {/* Centro de Custos por Categoria */}
        <div className="border border-stone-300 rounded-lg p-2.5 mb-2.5 bg-white">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#143129] block border-b border-stone-200 pb-0.5 mb-1.5">
            Distribuição de Custos Operacionais por Categoria
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-[9px]">
            {categoriasDespesa.slice(0, 6).map((c) => (
              <div key={c.categoria} className="flex justify-between border-b border-stone-100 pb-0.5">
                <span className="font-medium text-stone-700">{c.categoria}:</span>
                <span className="font-mono font-semibold text-stone-900">
                  {formatarMoeda(c.valor)} ({c.percentual.toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Animais: Custo & Rentabilidade */}
        <div className="border border-stone-300 rounded-lg p-2.5 mb-2.5 bg-white">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#143129] block border-b border-stone-200 pb-0.5 mb-1.5">
            Análise Individual por Equino
          </span>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9px]">
            {metricasPorEquino.slice(0, 6).map(({ equino, metricas }) => (
              <div key={equino.id} className="flex items-center justify-between border-b border-stone-100 pb-0.5">
                <span className="font-bold text-stone-800 truncate max-w-[130px]">{equino.nome} ({equino.raca}):</span>
                <span className="font-mono">
                  Desp: <strong className="text-rose-700">{formatarMoeda(metricas.totalDespesas)}</strong> | Rec: <strong className="text-emerald-700">{formatarMoeda(metricas.totalReceitas)}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Extrato Analítico de Lançamentos Recentes */}
        <div className="border border-stone-300 rounded-lg overflow-hidden mb-2.5">
          <div className="bg-[#143129] text-white px-2.5 py-1 flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
            <span>Últimos Lançamentos do Livro Caixa</span>
            <span>Total: {transacoes.length} registros</span>
          </div>
          <table className="w-full text-[9px] text-left">
            <thead className="bg-stone-100 border-b border-stone-200 text-stone-600 font-semibold uppercase text-[8.5px]">
              <tr>
                <th className="p-1">Data</th>
                <th className="p-1">Tipo</th>
                <th className="p-1">Categoria</th>
                <th className="p-1">Descrição</th>
                <th className="p-1">Animal</th>
                <th className="p-1 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {transacoes.slice(0, 6).map((t) => {
                const eq = equinos.find((e) => e.id === t.equinoId)
                return (
                  <tr key={t.id} className="border-b border-stone-100 last:border-0">
                    <td className="p-1 font-mono">{formatarData(t.data)}</td>
                    <td className="p-1 font-semibold">
                      <span className={t.tipo === "receita" ? "text-emerald-700" : "text-rose-700"}>
                        {t.tipo === "receita" ? "RECEITA" : "DESPESA"}
                      </span>
                    </td>
                    <td className="p-1 font-medium">{t.categoria}</td>
                    <td className="p-1 truncate max-w-[150px]">{t.descricao}</td>
                    <td className="p-1 text-stone-500">{eq?.nome || "Geral Haras"}</td>
                    <td className="p-1 text-right font-mono font-bold">
                      <span className={t.tipo === "receita" ? "text-emerald-700" : "text-rose-700"}>
                        {t.tipo === "receita" ? "+" : "−"} {formatarMoeda(t.valor)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Assinaturas Oficiais */}
        <div className="mt-2.5 pt-2 border-t border-stone-300 grid grid-cols-12 gap-2.5 items-end text-[9px]">
          <div className="col-span-3 flex items-center gap-1.5">
            <div className="size-8 border border-stone-300 rounded p-0.5 bg-white flex items-center justify-center">
              <QrCode className="size-6 text-stone-800" />
            </div>
            <div className="text-[7.5px] text-stone-500 leading-tight">
              <p className="font-bold text-stone-800">Autenticação</p>
              <p className="font-mono text-[6.5px] text-stone-400">{codigoRelatorio}</p>
            </div>
          </div>

          <div className="col-span-5 text-center">
            <div className="border-b border-stone-400 h-4 mb-0.5 mx-3" />
            <p className="font-bold text-stone-800 text-[9px]">Diretoria Financeira / Controladoria</p>
          </div>

          <div className="col-span-4 text-center">
            <div className="border-b border-stone-400 h-4 mb-0.5 mx-3" />
            <p className="font-bold text-stone-800 text-[9px]">Administração Geral</p>
          </div>
        </div>

      </div>
    </div>
  )
}
