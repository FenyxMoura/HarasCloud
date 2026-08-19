import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
  FileSignature,
  Pencil,
  Printer,
} from "lucide-react"
import { HarasLogo } from "@/components/icons/HarasLogo"
import { Button } from "@/components/ui/button"
import { Card, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useEquinosComFotos } from "@/lib/hooks"
import { useAuth } from "@/lib/auth-context"
import { getClientes } from "@/lib/db"
import { tocarSomSucesso } from "@/lib/sound-alerts"
import type { ClienteHaras, TipoContrato } from "@/lib/types"
import { cn } from "@/lib/utils"

export function Contratos() {
  const [searchParams] = useSearchParams()
  const { haras } = useAuth()
  const { equinos } = useEquinosComFotos()
  const [clientes, setClientes] = useState<ClienteHaras[]>([])

  const [tipoContrato, setTipoContrato] = useState<TipoContrato>(
    (searchParams.get("tipo") as TipoContrato) || "venda"
  )

  // Dados do Contrato
  const [clienteNome, setClienteNome] = useState(searchParams.get("clienteNome") || "")
  const [clienteDocumento, setClienteDocumento] = useState("")
  const [clienteTelefone, setClienteTelefone] = useState("")

  const [equinoId, setEquinoId] = useState("")
  const [valor, setValor] = useState(searchParams.get("valor") || "15000")
  const [formaPagamento, setFormaPagamento] = useState("À vista via PIX / Transferência")
  const [dataContrato] = useState(new Date().toISOString().slice(0, 10))
  const [cidadeForo] = useState(haras?.cidadeUf || "São Paulo - SP")

  useEffect(() => {
    getClientes().then(setClientes)
  }, [])

  // Auto preenchimento ao escolher cliente existente
  function handleSelecionarCliente(id: string) {
    const c = clientes.find((item) => item.id === id)
    if (!c) return
    setClienteNome(c.nome)
    setClienteDocumento(c.documento || "")
    setClienteTelefone(c.telefone || "")
    if (c.valorMensalidade) setValor(c.valorMensalidade.toString())
  }

  const equinoEscolhido = equinos.find((e) => e.id === equinoId)

  function handleImprimir() {
    tocarSomSucesso()
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Top Header (Oculto na Impressão) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileSignature className="size-7 text-[#d9b978]" />
            Gerador Automático de Contratos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gere contratos jurídicos profissionais prontos para assinatura e impressão com o brasão do haras.
          </p>
        </div>

        <Button
          onClick={handleImprimir}
          className="rounded-2xl bg-[#143129] text-[#d9b978] font-bold text-xs sm:text-sm hover:bg-[#1c4338] shadow-md active:scale-95 transition-all"
        >
          <Printer className="mr-1.5 size-4" />
          Imprimir / Salvar em PDF
        </Button>
      </div>

      {/* Seletor de Modelo de Contrato (Oculto na Impressão) */}
      <div className="print:hidden grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            id: "venda",
            label: "🐴 Compra e Venda",
            desc: "Alienação e transferência de animal com reserva",
          },
          {
            id: "hospedagem",
            label: "🏡 Hospedagem & Pensão",
            desc: "Pensão de baia, manejo e alimentação",
          },
          {
            id: "cobertura",
            label: "🧬 Cobertura & Sêmen",
            desc: "Garantia de prenhez e cessão genética",
          },
          {
            id: "aulas",
            label: "🏇 Aulas de Equitação",
            desc: "Escola de marcha, salto e hipismo",
          },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setTipoContrato(m.id as TipoContrato)}
            className={cn(
              "p-4 rounded-3xl border text-left transition-all",
              tipoContrato === m.id
                ? "bg-[#143129] border-[#d9b978] text-[#d9b978] shadow-md font-bold"
                : "bg-card border-stone-200 dark:border-stone-800 text-muted-foreground hover:text-foreground"
            )}
          >
            <p className="text-xs sm:text-sm font-bold">{m.label}</p>
            <p className="text-[10px] sm:text-[11px] mt-1 opacity-70 leading-tight">{m.desc}</p>
          </button>
        ))}
      </div>

      {/* Formulário de Preenchimento Dinâmico (Oculto na Impressão) */}
      <Card className="print:hidden rounded-3xl border-stone-200/80 dark:border-stone-800 p-6 bg-card">
        <CardTitle className="font-display text-base font-bold text-foreground flex items-center gap-2 mb-4">
          <Pencil className="size-4 text-[#d9b978]" />
          Preenchimento das Partes e Cláusulas
        </CardTitle>

        <div className="space-y-4 text-xs">
          {/* Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-foreground block mb-1">Puxar de Cliente Cadastrado</label>
              <select
                onChange={(e) => handleSelecionarCliente(e.target.value)}
                className="w-full h-10 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs"
              >
                <option value="">Digitar dados manualmente...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} ({c.tipo === "aluno" ? "Aluno" : "Pensionista"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Nome do Contratante / Comprador *</label>
              <Input
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder="Nome completo do cliente"
                className="h-10 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">CPF ou CNPJ do Cliente</label>
              <Input
                value={clienteDocumento}
                onChange={(e) => setClienteDocumento(e.target.value)}
                placeholder="000.000.000-00"
                className="h-10 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Dados do Animal e Valores */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-foreground block mb-1">Equino Envolvido (se houver)</label>
              <select
                value={equinoId}
                onChange={(e) => setEquinoId(e.target.value)}
                className="w-full h-10 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs"
              >
                <option value="">Selecione um cavalo do plantel...</option>
                {equinos.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nome} ({e.raca} · {e.pelagem})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Valor do Contrato (R$)</label>
              <Input
                type="number"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="h-10 rounded-xl text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Forma de Pagamento</label>
              <Input
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                className="h-10 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ÁREA DO DOCUMENTO JURÍDICO A4 TIMBRADO */}
      <div className="p-8 sm:p-12 border-2 border-stone-800 rounded-3xl bg-white text-black space-y-6 shadow-xl print:shadow-none print:m-0 print:p-8 print:w-full print:border-none">
        {/* Cabeçalho Oficial do Haras */}
        <div className="flex items-center justify-between border-b-2 border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <HarasLogo className="size-14" />
            <div>
              <h2 className="font-display text-xl font-black uppercase text-stone-900 leading-tight">
                {haras?.nomeHaras || "Haras Cardoso"}
              </h2>
              <p className="text-xs text-stone-600 font-semibold">
                {haras?.subtitulo || "Centro de Genética, Manejo & Treinamento Equino"}
              </p>
              <p className="text-[11px] text-stone-500">
                {haras?.cidadeUf || "São Paulo - SP"} · Contato: {haras?.telefone || "(11) 99999-9999"}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono uppercase font-bold text-stone-500 block">Instrumento Particular</span>
            <span className="text-xs font-mono font-bold text-stone-900 uppercase">Via Registrada</span>
          </div>
        </div>

        {/* Título do Contrato */}
        <div className="text-center py-2 border-b border-stone-300">
          <h3 className="font-display text-base sm:text-lg font-black uppercase tracking-wider text-stone-950">
            {tipoContrato === "venda" && "CONTRATO DE COMPRA E VENDA DE ANIMAL EQUINO"}
            {tipoContrato === "hospedagem" && "CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE HOSPEDAGEM E PENSÃO DE BAIA"}
            {tipoContrato === "cobertura" && "CONTRATO DE CESSÃO DE COBERTURA / SÊMEN EQUINO"}
            {tipoContrato === "aulas" && "CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE EQUITAÇÃO E AULAS"}
          </h3>
        </div>

        {/* Qualificação das Partes */}
        <div className="text-xs text-stone-800 leading-relaxed text-justify space-y-3">
          <p>
            <strong>VENDEDOR / CONTRATADO:</strong> <strong>{haras?.nomeHaras || "HARAS CARDOSO"}</strong>, representado neste ato por seu gestor responsável <strong>{haras?.responsavel || "Administrador do Haras"}</strong>, com sede em {haras?.cidadeUf || "São Paulo - SP"}, doravante denominado simplesmente <strong>CONTRATADO</strong>.
          </p>

          <p>
            <strong>COMPRADOR / CONTRATANTE:</strong> <strong>{clienteNome || "__________________________________________________"}</strong>
            {clienteDocumento ? `, portador do CPF/CNPJ nº <strong>${clienteDocumento}</strong>` : ", portador do CPF nº ____________________"}
            {clienteTelefone ? `, telefone <strong>${clienteTelefone}</strong>` : ""}, doravante denominado <strong>CONTRATANTE</strong>.
          </p>
        </div>

        {/* Cláusulas do Contrato Conforme o Tipo */}
        <div className="text-xs text-stone-800 leading-relaxed text-justify space-y-4 pt-2">
          {tipoContrato === "venda" && (
            <>
              <p>
                <strong>CLÁUSULA 1ª - DO OBJETO:</strong> O presente contrato tem por objeto a alienação e transferência definitiva do equino denominado <strong>{equinoEscolhido?.nome || "________________________"}</strong>, da raça <strong>{equinoEscolhido?.raca || "Mangalarga Marchador"}</strong>, pelagem <strong>{equinoEscolhido?.pelagem || "Alazã"}</strong>, registro nº <strong>{equinoEscolhido?.registro || "Em andamento"}</strong>.
              </p>
              <p>
                <strong>CLÁUSULA 2ª - DO VALOR E PAGAMENTO:</strong> Pela compra do animal acima descrito, o CONTRATANTE pagará ao CONTRATADO o valor total de <strong>R$ {Number(valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>, mediante <strong>{formaPagamento}</strong>.
              </p>
              <p>
                <strong>CLÁUSULA 3ª - DA SANIDADE E RESERVA DE DOMÍNIO:</strong> O CONTRATADO declara que o animal encontra-se em perfeitas condições higiênico-sanitárias e com vacinação em dia. A transferência da posse e propriedade definitiva opera-se com a quitação integral do preço acordado.
              </p>
            </>
          )}

          {tipoContrato === "hospedagem" && (
            <>
              <p>
                <strong>CLÁUSULA 1ª - DO OBJETO:</strong> O CONTRATADO obriga-se a disponibilizar estrutura de baia, piquetes e serviços de trato para o equino <strong>{equinoEscolhido?.nome || "do Contratante"}</strong>, compreendendo alimentação balanceada (volumoso e concentrado), limpeza diária de cocheira e água potável à vontade.
              </p>
              <p>
                <strong>CLÁUSULA 2ª - DO PREÇO E VENCIMENTO:</strong> Pela pensão e serviços prestados, o CONTRATANTE pagará a quantia mensal de <strong>R$ {Number(valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>, com vencimento todo dia 10 de cada mês.
              </p>
              <p>
                <strong>CLÁUSULA 3ª - DA VETERINÁRIA:</strong> Em casos de emergência clínica ou cólica, o CONTRATADO fica autorizado a acionar o médico veterinário de plantão para socorro imediato, cujas despesas correrão por conta do proprietário do animal.
              </p>
            </>
          )}

          {tipoContrato === "cobertura" && (
            <>
              <p>
                <strong>CLÁUSULA 1ª - DO OBJETO:</strong> O presente contrato tem por objeto a cessão de 01 (uma) cobertura ou dose de sêmen do garanhão <strong>{equinoEscolhido?.nome || "Garanhão Chefe"}</strong>, para fecundação da matriz indicada pelo CONTRATANTE.
              </p>
              <p>
                <strong>CLÁUSULA 2ª - DA GARANTIA DE PRENHEZ:</strong> O CONTRATADO assegura a garantia de prenhez positiva comprovada por ultrassonografia veterinária, com direito a repetição de salto na mesma estação reprodutiva caso a égua não emprenhe.
              </p>
              <p>
                <strong>CLÁUSULA 3ª - DO VALOR:</strong> Pela cessão genética, o CONTRATANTE pagará o valor de <strong>R$ {Number(valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>.
              </p>
            </>
          )}

          {tipoContrato === "aulas" && (
            <>
              <p>
                <strong>CLÁUSULA 1ª - DO OBJETO:</strong> Prestação de serviços de instrução e aulas práticas de equitação, manejo e adestramento equino para o aluno <strong>{clienteNome || "Contratante"}</strong>.
              </p>
              <p>
                <strong>CLÁUSULA 2ª - DA MENSALIDADE:</strong> O valor da mensalidade é de <strong>R$ {Number(valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>, incluindo disponibilização de animais treinados e pista equipada.
              </p>
              <p>
                <strong>CLÁUSULA 3ª - DA SEGURANÇA:</strong> É obrigatório o uso de capacete hípico e botas adequadas durante todas as sessões de treino.
              </p>
            </>
          )}

          <p>
            <strong>CLÁUSULA DE FORO:</strong> As partes elegem a Comarca de <strong>{cidadeForo}</strong> para dirimir quaisquer dúvidas decorrentes do presente contrato, renunciando a qualquer outro por mais privilegiado que seja.
          </p>
        </div>

        {/* Data e Assinaturas Oficiais */}
        <div className="pt-10 border-t border-stone-300 space-y-8 text-xs">
          <p className="text-center text-stone-600">
            {cidadeForo}, {dataContrato.split("-").reverse().join("/")}
          </p>

          <div className="grid grid-cols-2 gap-12 pt-6 text-center">
            <div className="space-y-1">
              <div className="border-b border-stone-800 w-full mb-1" />
              <p className="font-bold text-stone-900 uppercase">{haras?.nomeHaras || "CONTRATADO"}</p>
              <p className="text-[10px] text-stone-500">{haras?.responsavel || "Gestão Geral"}</p>
            </div>

            <div className="space-y-1">
              <div className="border-b border-stone-800 w-full mb-1" />
              <p className="font-bold text-stone-900 uppercase">{clienteNome || "CONTRATANTE"}</p>
              <p className="text-[10px] text-stone-500">{clienteDocumento || "CPF/CNPJ"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 pt-4 text-center text-[10px] text-stone-500">
            <div>
              <div className="border-b border-stone-400 w-full mb-1" />
              <p>Testemunha 1: Nome / CPF</p>
            </div>
            <div>
              <div className="border-b border-stone-400 w-full mb-1" />
              <p>Testemunha 2: Nome / CPF</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
