import {
  gerarId,
  getAllEquinos,
  getCoberturas,
  getDietas,
  getEstoque,
  getEventos,
  getFerrageamentos,
  getMedidasEquino,
  getTransacoes,
  limparTudo,
  salvarCobertura,
  salvarDieta,
  salvarEquino,
  salvarEvento,
  salvarFerrageamento,
  salvarItemEstoque,
  salvarMedida,
  salvarTransacao,
  salvarVacina,
  salvarVermifugo,
} from "./db"
import type {
  Cobertura,
  DietaEquino,
  Equino,
  Evento,
  ItemEstoque,
  MedidaCrescimento,
  Transacao,
  Vacina,
  Vermifugo,
} from "./types"

/** Cria os equinos e registros de demonstração. */
export async function carregarDadosExemplo(forcar: boolean = false): Promise<number> {
  const existentes = await getAllEquinos()
  if (existentes.length > 0 && !forcar) return 0

  const agora = new Date().toISOString()
  const mk = (e: Omit<Equino, "id" | "createdAt" | "updatedAt">): Equino => ({
    ...e,
    id: gerarId(),
    createdAt: agora,
    updatedAt: agora,
  })

  // Se forçar mas já tiver equinos com esses nomes, usamos os existentes
  const imperador = mk({
    nome: "Imperador da Serra",
    sexo: "macho",
    nascimento: "2018-03-12",
    raca: "Mangalarga Marchador",
    pelagem: "Tordilha",
    registro: "MG-2018-00421",
    temperamento: "Dócil",
    status: "ativo",
  })
  const sultao = mk({
    nome: "Sultão Dourado",
    sexo: "macho",
    nascimento: "2015-11-08",
    raca: "Quarto de Milha",
    pelagem: "Alazã tostada",
    paiId: imperador.id,
    status: "ativo",
  })
  const estrela = mk({
    nome: "Estrela do Vale",
    sexo: "femea",
    nascimento: "2019-07-02",
    raca: "Mangalarga",
    pelagem: "Alazã",
    paiId: imperador.id,
    status: "ativo",
  })
  const trovao = mk({
    nome: "Trovão Real",
    sexo: "castrado",
    nascimento: "2020-01-19",
    raca: "Crioulo",
    pelagem: "Baia",
    origem: "Criação própria",
    status: "ativo",
  })
  const princesa = mk({
    nome: "Princesa da Mata",
    sexo: "femea",
    nascimento: "2021-05-30",
    raca: "Campolina",
    pelagem: "Preta",
    status: "ativo",
  })

  if (existentes.length === 0 || forcar) {
    for (const e of [imperador, sultao, estrela, trovao, princesa]) {
      await salvarEquino(e)
    }
  }

  const daqui = (dias: number) => {
    const d = new Date()
    d.setDate(d.getDate() + dias)
    return d.toISOString().slice(0, 10)
  }

  const vacinas: Vacina[] = [
    {
      id: gerarId(),
      equinoId: imperador.id,
      nome: "Influenza Equina",
      dataAplicacao: daqui(-320),
      dataProxima: daqui(-9),
      veterinario: "Dra. Marina Duarte",
      createdAt: agora,
    },
    {
      id: gerarId(),
      equinoId: estrela.id,
      nome: "Raiva",
      dataAplicacao: daqui(-350),
      dataProxima: daqui(15),
      veterinario: "Dr. Paulo Nogueira",
      createdAt: agora,
    },
    {
      id: gerarId(),
      equinoId: princesa.id,
      nome: "Tétano",
      dataAplicacao: daqui(-30),
      dataProxima: daqui(28),
      createdAt: agora,
    },
  ]
  for (const v of vacinas) await salvarVacina(v)

  const vermifugos: Vermifugo[] = [
    {
      id: gerarId(),
      equinoId: estrela.id,
      produto: "Ivermectina",
      dataAplicacao: daqui(-40),
      dataProxima: daqui(20),
      createdAt: agora,
    },
    {
      id: gerarId(),
      equinoId: trovao.id,
      produto: "Praziquantel",
      dataAplicacao: daqui(-90),
      dataProxima: daqui(5),
      createdAt: agora,
    },
  ]
  for (const v of vermifugos) await salvarVermifugo(v)

  await carregarDadosModulos(forcar)
  return 5
}

/** Preenche todos os módulos com dados de demonstração. */
export async function carregarDadosModulos(forcar: boolean = false): Promise<void> {
  const equinos = await getAllEquinos()
  if (equinos.length === 0) {
    await carregarDadosExemplo(true)
    return
  }

  const porNome = (nome: string) => equinos.find((e) => e.nome.startsWith(nome))
  const imperador = porNome("Imperador") ?? equinos[0]
  const estrela = porNome("Estrela") ?? equinos[1] ?? equinos[0]
  const princesa = porNome("Princesa") ?? equinos[2] ?? equinos[0]
  const trovao = porNome("Trovão") ?? equinos[3] ?? equinos[0]
  const sultao = porNome("Sultão") ?? equinos[4] ?? equinos[0]

  const daqui = (dias: number) => {
    const d = new Date()
    d.setDate(d.getDate() + dias)
    return d.toISOString().slice(0, 10)
  }
  const agora = new Date().toISOString()

  // --- Reprodução ---
  if ((await getCoberturas()).length === 0 || forcar) {
    const coberturas: Cobertura[] = [
      {
        id: gerarId(),
        femeaId: estrela.id,
        machoId: imperador.id,
        dataCobertura: daqui(-60),
        metodo: "monta-natural",
        status: "confirmada",
        dataPartoPrevista: daqui(280),
        observacoes: "Gestação confirmada por ultrassom aos 30 dias.",
        createdAt: agora,
      },
      {
        id: gerarId(),
        femeaId: princesa.id,
        machoId: sultao.id,
        dataCobertura: daqui(-15),
        metodo: "ia",
        status: "coberta",
        dataPartoPrevista: daqui(325),
        createdAt: agora,
      },
    ]
    for (const c of coberturas) await salvarCobertura(c)
  }

  // --- Estoque ---
  if ((await getEstoque()).length === 0 || forcar) {
    const estoque: ItemEstoque[] = [
      { id: gerarId(), nome: "Ração Pellet 3mm", tipo: "racao", quantidade: 200, unidade: "kg", estoqueMinimo: 80, custoUnitario: 4.5 },
      { id: gerarId(), nome: "Feno Tifton", tipo: "feno", quantidade: 30, unidade: "fardo", estoqueMinimo: 10, custoUnitario: 25 },
      { id: gerarId(), nome: "Suplemento Cálcio", tipo: "suplemento", quantidade: 2, unidade: "saco", estoqueMinimo: 4, custoUnitario: 120 },
    ]
    for (const i of estoque) await salvarItemEstoque(i)
  }

  // --- Dietas ---
  if ((await getDietas()).length === 0 || forcar) {
    const dietas: DietaEquino[] = [
      { id: gerarId(), equinoId: estrela.id, itemNome: "Ração Pellet 3mm", quantidade: 2, unidade: "kg", periodo: "Manhã" },
      { id: gerarId(), equinoId: estrela.id, itemNome: "Feno Tifton", quantidade: 6, unidade: "kg", periodo: "Noite" },
      { id: gerarId(), equinoId: imperador.id, itemNome: "Ração Pellet 3mm", quantidade: 3, unidade: "kg", periodo: "Manhã" },
      { id: gerarId(), equinoId: imperador.id, itemNome: "Feno Tifton", quantidade: 8, unidade: "kg", periodo: "Noite" },
      { id: gerarId(), equinoId: trovao.id, itemNome: "Suplemento Cálcio", quantidade: 0.5, unidade: "kg", periodo: "Tarde" },
    ]
    for (const d of dietas) await salvarDieta(d)
  }

  // --- Transações ---
  if ((await getTransacoes()).length === 0 || forcar) {
    const transacoes: Transacao[] = [
      { id: gerarId(), tipo: "receita", categoria: "Hospedagem", descricao: "Hospedagem — box 2 (mensal)", valor: 900, data: daqui(-20), createdAt: agora },
      { id: gerarId(), tipo: "despesa", categoria: "Ração", descricao: "Ração Pellet 3mm (saco 30kg)", valor: 135, data: daqui(-18), createdAt: agora },
      { id: gerarId(), tipo: "despesa", categoria: "Veterinário", descricao: "Consulta + ultrassom (Estrela)", valor: 350, data: daqui(-30), equinoId: estrela.id, createdAt: agora },
      { id: gerarId(), tipo: "despesa", categoria: "Ferradura", descricao: "Ferrageamento completo (3 animais)", valor: 540, data: daqui(-12), createdAt: agora },
      { id: gerarId(), tipo: "receita", categoria: "Venda de animal", descricao: "Venda do cavalo Duque (potro)", valor: 8500, data: daqui(-45), createdAt: agora },
      { id: gerarId(), tipo: "despesa", categoria: "Manutenção", descricao: "Manutenção do curral", valor: 720, data: daqui(-60), createdAt: agora },
      { id: gerarId(), tipo: "receita", categoria: "Aulas", descricao: "Aulas de equitação (4 alunos)", valor: 1200, data: daqui(-5), createdAt: agora },
    ]
    for (const t of transacoes) await salvarTransacao(t)
  }

  // --- Eventos ---
  if ((await getEventos()).length === 0 || forcar) {
    const eventos: Evento[] = [
      { id: gerarId(), titulo: "Ferrageamento do Trovão", tipo: "ferradura", data: daqui(5), hora: "08:00", equinoId: trovao.id, createdAt: agora },
      { id: gerarId(), titulo: "Vacina Influenza (Estrela)", tipo: "veterinario", data: daqui(12), hora: "09:30", equinoId: estrela.id, createdAt: agora },
      { id: gerarId(), titulo: "Prova de Marcha — Mangalarga", tipo: "competicao", data: daqui(25), createdAt: agora },
      { id: gerarId(), titulo: "Visita de comprador (potro)", tipo: "visita", data: daqui(8), hora: "14:00", equinoId: sultao.id, createdAt: agora },
    ]
    for (const ev of eventos) await salvarEvento(ev)
  }

  // --- Medidas ---
  if ((await getMedidasEquino(estrela.id)).length === 0 || forcar) {
    const medidas: MedidaCrescimento[] = [
      { id: gerarId(), equinoId: estrela.id, data: daqui(-180), pesoKg: 380, alturaCernelha: 1.52, createdAt: agora },
      { id: gerarId(), equinoId: estrela.id, data: daqui(-90), pesoKg: 402, alturaCernelha: 1.54, createdAt: agora },
      { id: gerarId(), equinoId: estrela.id, data: daqui(-10), pesoKg: 428, alturaCernelha: 1.55, createdAt: agora },
    ]
    for (const m of medidas) await salvarMedida(m)
  }

  // --- Ferrageamentos / Podologia ---
  if ((await getFerrageamentos()).length === 0 || forcar) {
    const ferrageamentos = [
      {
        id: gerarId(),
        equinoId: imperador.id,
        tipo: "ferradura_ferro" as const,
        dataServico: daqui(-15),
        dataProximo: daqui(30),
        ferrador: "Mestre Antônio",
        valor: 180,
        observacoes: "Aprumos corrigidos e ferradura nova",
        createdAt: agora,
      },
      {
        id: gerarId(),
        equinoId: estrela.id,
        tipo: "casqueamento" as const,
        dataServico: daqui(-40),
        dataProximo: daqui(5),
        ferrador: "Mestre Antônio",
        valor: 80,
        observacoes: "Manutenção de casco natural",
        createdAt: agora,
      },
      {
        id: gerarId(),
        equinoId: trovao.id,
        tipo: "ferradura_aluminio" as const,
        dataServico: daqui(-50),
        dataProximo: daqui(-5),
        ferrador: "Carlos Ferrador",
        valor: 220,
        observacoes: "Ferradura leve para competição",
        createdAt: agora,
      },
    ]
    for (const f of ferrageamentos) await salvarFerrageamento(f)
  }
}

/** Limpa todo o banco e recria um conjunto perfeito de 5 equinos com dados completos. */
export async function recriarBancoComDadosDemonstracao(): Promise<void> {
  await limparTudo()
  await carregarDadosExemplo(true)
}
