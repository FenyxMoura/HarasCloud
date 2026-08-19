import { Award, Dna, QrCode, Shield } from "lucide-react"
import { corPelagem } from "@/lib/pelagens"
import type { Genealogia3Geracoes } from "@/lib/db"
import {
  SEXO_LABEL,
  STATUS_LABEL,
  TIPO_SERVICO_CASCO_LABEL,
  type Equino,
  type MedidaCrescimento,
  type RegistroFerrageamento,
  type Vacina,
  type Vermifugo,
} from "@/lib/types"

interface HorsePrintSheetProps {
  equino: Equino
  fotoPrincipalUrl?: string
  fotoPrincipal?: string
  genealogia: Genealogia3Geracoes
  vacinas: Vacina[]
  vermifugos: Vermifugo[]
  ferrageamentos: RegistroFerrageamento[]
  medidas: MedidaCrescimento[]
  idadeTexto: string
}

export function HorsePrintSheet({
  equino,
  fotoPrincipalUrl,
  fotoPrincipal,
  genealogia,
  vacinas,
  vermifugos,
  ferrageamentos,
  medidas,
  idadeTexto,
}: HorsePrintSheetProps) {
  const foto = fotoPrincipalUrl || fotoPrincipal
  const pelagemHex = corPelagem(equino.pelagem)
  const ultimaMedida = medidas[medidas.length - 1]
  const dataHoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
  const codigoCertificado = `HARAS-${equino.id.slice(0, 6).toUpperCase()}-${new Date().getFullYear()}`

  return (
    <div
      id="print-sheet"
      className="hidden print:block bg-white text-stone-900 font-sans mx-auto w-full max-w-[210mm] p-3 text-[10px] leading-tight"
    >
      {/* Borda Decorativa Dupla de Certificado de Luxo */}
      <div className="border-2 border-double border-[#143129] p-3.5 rounded-xl relative bg-[#fdfcf9]">
        
        {/* Marca d'água sutil de fundo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <span className="font-serif text-[110px] font-black text-[#143129] uppercase">
            HARAS
          </span>
        </div>

        {/* Cabeçalho Nobre com Brasão */}
        <div className="flex items-center justify-between border-b-2 border-[#143129] pb-2 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-lg bg-[#143129] border border-[#d9b978] text-[#d9b978] flex items-center justify-center font-serif font-black text-lg shadow-xs">
              🏇
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-serif font-black tracking-wider text-[#143129]">
                  HARAS SANTA FÉ
                </h1>
                <span className="bg-[#143129] text-[#d9b978] text-[7.5px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded">
                  OFICIAL
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-[#8c6d3f] font-bold">
                Certificado Zootécnico & Ficha Genealógica do Animal
              </p>
            </div>
          </div>

          <div className="text-right border-l-2 border-stone-200 pl-2.5">
            <p className="font-mono font-bold text-[#143129] text-[9.5px]">
              REGISTRO: {codigoCertificado}
            </p>
            <p className="text-[8.5px] text-stone-500">
              EMISSÃO: {dataHoje}
            </p>
            <p className="text-[8.5px] font-semibold text-emerald-700">
              STATUS: {STATUS_LABEL[equino.status].toUpperCase()}
            </p>
          </div>
        </div>

        {/* Identificação Principal & Fotografia */}
        <div className="grid grid-cols-12 gap-3 mb-2.5 items-center">
          {/* Foto Retrato Oficial */}
          <div className="col-span-4 aspect-[4/3] rounded-lg overflow-hidden border border-stone-300 bg-stone-100 flex items-center justify-center relative shadow-xs">
            {foto ? (
              <img
                src={foto}
                alt={equino.nome}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-2 text-stone-400">
                <span className="text-xl block mb-0.5">📸</span>
                <span className="text-[8.5px]">Foto não anexada</span>
              </div>
            )}
          </div>

          {/* Dados Cadastrais & Zootécnicos */}
          <div className="col-span-8 space-y-1.5">
            <div className="flex items-start justify-between border-b border-stone-200 pb-1">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-serif font-bold text-[#143129]">
                    {equino.nome}
                  </h2>
                  <span className="bg-stone-200 text-stone-800 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                    {equino.raca}
                  </span>
                </div>
                {equino.apelido && (
                  <p className="text-[9px] italic text-stone-600">
                    Apelido carinhoso: "{equino.apelido}"
                  </p>
                )}
              </div>
              <span className="font-mono text-[9px] font-bold bg-[#143129]/10 text-[#143129] px-1.5 py-0.5 rounded border border-[#143129]/20">
                {SEXO_LABEL[equino.sexo].toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9.5px]">
              <div>
                <span className="text-stone-500 block text-[8px] uppercase font-bold">Registro Geral (RGN/RGD):</span>
                <span className="font-mono font-bold text-[#143129]">{equino.registro || "Pendente"}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[8px] uppercase font-bold">Microchip:</span>
                <span className="font-mono font-semibold text-stone-800">{equino.microchip || "Não implantado"}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[8px] uppercase font-bold">Pelagem Oficial:</span>
                <span className="font-semibold text-stone-900 flex items-center gap-1">
                  <span className="size-2.5 rounded-full inline-block border border-stone-400" style={{ backgroundColor: pelagemHex }} />
                  {equino.pelagem}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block text-[8px] uppercase font-bold">Nascimento & Idade:</span>
                <span className="font-semibold text-stone-900">
                  {equino.nascimento ? `${equino.nascimento} (${idadeTexto})` : idadeTexto}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block text-[8px] uppercase font-bold">Biometria Atual:</span>
                <span className="font-semibold text-stone-900">
                  {ultimaMedida ? `${ultimaMedida.pesoKg ? `${ultimaMedida.pesoKg} kg` : ""} ${ultimaMedida.alturaCernelha ? `• ${ultimaMedida.alturaCernelha} m` : ""}` : "Aguardando medição"}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block text-[8px] uppercase font-bold">Criador & Origem:</span>
                <span className="font-semibold text-stone-900">{equino.origem || "Criação Haras"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Árvore Genealógica (Pedigree 3 Gerações no estilo Studbook) */}
        <div className="border border-[#143129]/30 rounded-lg p-2.5 mb-2.5 bg-stone-50/70">
          <div className="flex items-center justify-between border-b border-[#143129]/20 pb-1 mb-1.5">
            <div className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider text-[#143129]">
              <Dna className="size-3.5 text-[#8c6d3f]" />
              <span>Linhagem Genealógica Oficial (Pedigree 3 Gerações)</span>
            </div>
            <span className="text-[8.5px] text-stone-500 font-semibold">
              Pureza Racial & Ascendência
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[9.5px]">
            {/* 1ª Geração: Animal */}
            <div className="border border-[#143129] bg-white p-2 rounded flex flex-col justify-center text-center shadow-xs">
              <span className="text-[7.5px] uppercase font-bold text-stone-400">1ª Geração</span>
              <span className="font-serif font-bold text-xs text-[#143129]">{equino.nome}</span>
              <span className="text-[8.5px] text-stone-500">{equino.raca} · {equino.pelagem}</span>
            </div>

            {/* 2ª Geração: Pai & Mãe (50% cada) */}
            <div className="space-y-1.5">
              <div className="border border-sky-300 bg-sky-50/60 p-1.5 rounded">
                <span className="text-[7.5px] uppercase font-bold text-sky-800 flex justify-between">
                  <span>Pai (50%)</span>
                  <span>♂ Garanhão</span>
                </span>
                <span className="font-bold text-stone-900 block truncate">{genealogia.pai?.nome || "Não informado"}</span>
                <span className="text-[8.5px] text-stone-500 block truncate">{genealogia.pai?.raca || "—"}</span>
              </div>
              <div className="border border-rose-300 bg-rose-50/60 p-1.5 rounded">
                <span className="text-[7.5px] uppercase font-bold text-rose-800 flex justify-between">
                  <span>Mãe (50%)</span>
                  <span>♀ Matriz</span>
                </span>
                <span className="font-bold text-stone-900 block truncate">{genealogia.mae?.nome || "Não informada"}</span>
                <span className="text-[8.5px] text-stone-500 block truncate">{genealogia.mae?.raca || "—"}</span>
              </div>
            </div>

            {/* 3ª Geração: 4 Avós (25% cada) */}
            <div className="grid grid-rows-4 gap-1 text-[8.5px]">
              <div className="border border-stone-300 bg-white px-1.5 py-0.5 rounded truncate">
                <span className="text-[7px] uppercase text-stone-400 font-bold">Avô Pat.: </span>
                <span className="font-bold text-stone-800">{genealogia.avoPaterno?.nome || "—"}</span>
              </div>
              <div className="border border-stone-300 bg-white px-1.5 py-0.5 rounded truncate">
                <span className="text-[7px] uppercase text-stone-400 font-bold">Avó Pat.: </span>
                <span className="font-bold text-stone-800">{genealogia.avoMaternoPaterno?.nome || "—"}</span>
              </div>
              <div className="border border-stone-300 bg-white px-1.5 py-0.5 rounded truncate">
                <span className="text-[7px] uppercase text-stone-400 font-bold">Avô Mat.: </span>
                <span className="font-bold text-stone-800">{genealogia.avoMaterno?.nome || "—"}</span>
              </div>
              <div className="border border-stone-300 bg-white px-1.5 py-0.5 rounded truncate">
                <span className="text-[7px] uppercase text-stone-400 font-bold">Avó Mat.: </span>
                <span className="font-bold text-stone-800">{genealogia.avoMaternoMaterno?.nome || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Histórico Sanitário e Podológico Oficial */}
        <div className="grid grid-cols-2 gap-2.5 mb-2.5 text-[9.5px]">
          {/* Vacinas & Vermífugos */}
          <div className="border border-stone-300 rounded-lg p-2 bg-white">
            <div className="font-bold text-[#143129] uppercase tracking-wider text-[8.5px] border-b border-stone-200 pb-0.5 mb-1 flex items-center gap-1">
              <Shield className="size-3 text-emerald-700" />
              <span>Controle Sanitário & Imunizações</span>
            </div>
            {vacinas.length === 0 && vermifugos.length === 0 ? (
              <p className="text-stone-400 italic text-[9px]">Nenhum registro sanitário arquivado.</p>
            ) : (
              <ul className="space-y-0.5 text-[9px]">
                {vacinas.slice(0, 2).map((v) => (
                  <li key={v.id} className="flex justify-between text-stone-800 border-b border-stone-100 pb-0.5">
                    <span>💉 {v.nome} {v.veterinario ? `(${v.veterinario})` : ""}</span>
                    <span className="font-mono text-stone-600">{v.dataAplicacao}</span>
                  </li>
                ))}
                {vermifugos.slice(0, 1).map((vm) => (
                  <li key={vm.id} className="flex justify-between text-stone-800">
                    <span>🪱 {vm.produto}</span>
                    <span className="font-mono text-stone-600">{vm.dataAplicacao}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Podologia & Ferrageamento */}
          <div className="border border-stone-300 rounded-lg p-2 bg-white">
            <div className="font-bold text-[#143129] uppercase tracking-wider text-[8.5px] border-b border-stone-200 pb-0.5 mb-1 flex items-center gap-1">
              <Award className="size-3 text-[#8c6d3f]" />
              <span>Controle de Cascos & Ferrageamento</span>
            </div>
            {ferrageamentos.length === 0 ? (
              <p className="text-stone-400 italic text-[9px]">Nenhum histórico podológico arquivado.</p>
            ) : (
              <ul className="space-y-0.5 text-[9px]">
                {ferrageamentos.slice(0, 2).map((f) => (
                  <li key={f.id} className="flex justify-between text-stone-800 border-b border-stone-100 pb-0.5">
                    <span>🔨 {TIPO_SERVICO_CASCO_LABEL[f.tipo]} {f.ferrador ? `(${f.ferrador})` : ""}</span>
                    <span className="font-mono text-stone-600">{f.dataServico}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Rodapé Oficial com Assinaturas e Carimbos */}
        <div className="pt-2 border-t-2 border-[#143129] grid grid-cols-12 gap-2.5 items-end text-[9px]">
          <div className="col-span-3 flex items-center gap-1.5">
            <div className="size-9 border border-stone-300 rounded p-0.5 bg-white flex items-center justify-center">
              <QrCode className="size-7 text-stone-800" />
            </div>
            <div className="text-[7.5px] text-stone-500 leading-tight">
              <p className="font-bold text-stone-800">Validação Digital</p>
              <p className="font-mono text-[6.5px] text-stone-400">{codigoCertificado}</p>
            </div>
          </div>

          <div className="col-span-5 text-center">
            <div className="border-b border-stone-400 h-5 mb-0.5 mx-3" />
            <p className="font-bold text-stone-800 text-[9px]">Médico Veterinário Responsável</p>
            <p className="text-[7.5px] text-stone-500">CRMV / Assinatura e Carimbo</p>
          </div>

          <div className="col-span-4 text-center">
            <div className="border-b border-stone-400 h-5 mb-0.5 mx-3" />
            <p className="font-bold text-stone-800 text-[9px]">Gerência do Haras</p>
            <p className="text-[7.5px] text-stone-500">Certificação Oficial</p>
          </div>
        </div>

      </div>
    </div>
  )
}
