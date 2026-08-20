import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type {
  Cobertura,
  DietaEquino,
  Equino,
  Evento,
  FotoEquino,
  ItemEstoque,
  MedidaCrescimento,
  PrevisaoEstoqueItem,
  RegistroFerrageamento,
  ResumoFinanceiroEquino,
  Transacao,
  Vacina,
  Vermifugo,
  VideoEquino,
} from "./types"

interface HarasDB extends DBSchema {
  equinos: {
    key: string
    value: Equino
  }
  fotos: {
    key: string
    value: FotoEquino
    indexes: { "por-equino": string }
  }
  vacinas: {
    key: string
    value: Vacina
    indexes: { "por-equino": string }
  }
  vermifugos: {
    key: string
    value: Vermifugo
    indexes: { "por-equino": string }
  }
  videos: {
    key: string
    value: VideoEquino
    indexes: { "por-equino": string }
  }
  coberturas: {
    key: string
    value: Cobertura
    indexes: { "por-femea": string }
  }
  estoque: {
    key: string
    value: ItemEstoque
  }
  dietas: {
    key: string
    value: DietaEquino
    indexes: { "por-equino": string }
  }
  transacoes: {
    key: string
    value: Transacao
    indexes: { "por-equino": string }
  }
  eventos: {
    key: string
    value: Evento
    indexes: { "por-equino": string }
  }
  medidas: {
    key: string
    value: MedidaCrescimento
    indexes: { "por-equino": string }
  }
  ferrageamentos: {
    key: string
    value: RegistroFerrageamento
    indexes: { "por-equino": string }
  }
}

/** Stores que possuem índice "por-equino". */
type StorePorEquino = "coberturas" | "dietas" | "transacoes" | "eventos" | "medidas" | "ferrageamentos"

/** Todas as stores de dados (para backup/limpeza). */
export const TODAS_STORES = [
  "equinos",
  "fotos",
  "videos",
  "vacinas",
  "vermifugos",
  "coberturas",
  "estoque",
  "dietas",
  "transacoes",
  "eventos",
  "medidas",
  "ferrageamentos",
] as const

export type NomeStore = (typeof TODAS_STORES)[number]

const STORAGE_CURRENT_HARAS = "haras_cloud_auth_haras_v1"

function getTenantIdAtual(): string {
  if (typeof window === "undefined") return "default"
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_HARAS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.id) return parsed.id
    }
  } catch {
    // fallback
  }
  return "default"
}

let dbPromises: Record<string, Promise<IDBPDatabase<HarasDB>>> = {}

export function resetDbConnections() {
  dbPromises = {}
}

export function getDb() {
  const tenantId = getTenantIdAtual()
  const dbName = `haras_gestao_${tenantId}`

  if (!dbPromises[dbName]) {
    dbPromises[dbName] = openDB<HarasDB>(dbName, 4, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("equinos")) {
          db.createObjectStore("equinos", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("fotos")) {
          const fotos = db.createObjectStore("fotos", { keyPath: "id" })
          fotos.createIndex("por-equino", "equinoId")
        }
        if (!db.objectStoreNames.contains("vacinas")) {
          const vacinas = db.createObjectStore("vacinas", { keyPath: "id" })
          vacinas.createIndex("por-equino", "equinoId")
        }
        if (!db.objectStoreNames.contains("vermifugos")) {
          const vermifugos = db.createObjectStore("vermifugos", { keyPath: "id" })
          vermifugos.createIndex("por-equino", "equinoId")
        }
        if (!db.objectStoreNames.contains("videos")) {
          const videos = db.createObjectStore("videos", { keyPath: "id" })
          videos.createIndex("por-equino", "equinoId")
        }
        if (!db.objectStoreNames.contains("coberturas")) {
          const coberturas = db.createObjectStore("coberturas", { keyPath: "id" })
          coberturas.createIndex("por-femea", "femeaId")
        }
        if (!db.objectStoreNames.contains("estoque")) {
          db.createObjectStore("estoque", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("dietas")) {
          const dietas = db.createObjectStore("dietas", { keyPath: "id" })
          dietas.createIndex("por-equino", "equinoId")
        }
        if (!db.objectStoreNames.contains("transacoes")) {
          const transacoes = db.createObjectStore("transacoes", { keyPath: "id" })
          transacoes.createIndex("por-equino", "equinoId")
        }
        if (!db.objectStoreNames.contains("eventos")) {
          const eventos = db.createObjectStore("eventos", { keyPath: "id" })
          eventos.createIndex("por-equino", "equinoId")
        }
        if (!db.objectStoreNames.contains("medidas")) {
          const medidas = db.createObjectStore("medidas", { keyPath: "id" })
          medidas.createIndex("por-equino", "equinoId")
        }
        if (!db.objectStoreNames.contains("ferrageamentos")) {
          const ferrageamentos = db.createObjectStore("ferrageamentos", { keyPath: "id" })
          ferrageamentos.createIndex("por-equino", "equinoId")
        }
      },
    })
  }
  return dbPromises[dbName]
}


// ---------- Equinos ----------

export async function getAllEquinos(): Promise<Equino[]> {
  const db = await getDb()
  const todos = await db.getAll("equinos")
  return todos.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
}

export async function getEquino(id: string): Promise<Equino | undefined> {
  const db = await getDb()
  return db.get("equinos", id)
}

export async function salvarEquino(equino: Equino): Promise<void> {
  const db = await getDb()
  await db.put("equinos", equino)
}

export async function excluirEquino(id: string): Promise<void> {
  const db = await getDb()
  await db.delete("equinos", id)
  // Remove dados relacionados
  const fotos = await db.getAllFromIndex("fotos", "por-equino", id)
  await Promise.all(fotos.map((f) => db.delete("fotos", f.id)))
  const vacinas = await db.getAllFromIndex("vacinas", "por-equino", id)
  await Promise.all(vacinas.map((v) => db.delete("vacinas", v.id)))
  const vermifugos = await db.getAllFromIndex("vermifugos", "por-equino", id)
  await Promise.all(vermifugos.map((v) => db.delete("vermifugos", v.id)))
  const videos = await db.getAllFromIndex("videos", "por-equino", id)
  await Promise.all(videos.map((v) => db.delete("videos", v.id)))
  const dietas = await db.getAllFromIndex("dietas", "por-equino", id)
  await Promise.all(dietas.map((d) => db.delete("dietas", d.id)))
  const transacoes = await db.getAllFromIndex("transacoes", "por-equino", id)
  await Promise.all(transacoes.map((t) => db.delete("transacoes", t.id)))
  const eventos = await db.getAllFromIndex("eventos", "por-equino", id)
  await Promise.all(eventos.map((e) => db.delete("eventos", e.id)))
  const medidas = await db.getAllFromIndex("medidas", "por-equino", id)
  await Promise.all(medidas.map((m) => db.delete("medidas", m.id)))
  const ferrageamentos = await db.getAllFromIndex("ferrageamentos", "por-equino", id)
  await Promise.all(ferrageamentos.map((f) => db.delete("ferrageamentos", f.id)))
  // Coberturas em que o equino participa (fêmea, macho ou cria)
  const coberturas = await db.getAll("coberturas")
  await Promise.all(
    coberturas
      .filter((c) => c.femeaId === id || c.machoId === id || c.criaId === id)
      .map((c) => db.delete("coberturas", c.id)),
  )
}

// ---------- Fotos ----------

export async function getFotoPrincipal(equinoId: string): Promise<FotoEquino | undefined> {
  const fotos = await getFotosEquino(equinoId)
  return fotos.find((f) => f.principal) ?? fotos[0]
}

export async function getFotosEquino(equinoId: string): Promise<FotoEquino[]> {
  const db = await getDb()
  const fotos = await db.getAllFromIndex("fotos", "por-equino", equinoId)
  return fotos.sort((a, b) => a.ordem - b.ordem)
}

export async function adicionarFotos(
  equinoId: string,
  itens: { blob: Blob; legenda?: string }[],
): Promise<void> {
  const db = await getDb()
  const atuais = await getFotosEquino(equinoId)
  const temPrincipal = atuais.some((f) => f.principal)
  const tx = db.transaction("fotos", "readwrite")
  let ordem = atuais.length
  for (const { blob, legenda } of itens) {
    await tx.store.put({
      id: crypto.randomUUID(),
      equinoId,
      blob,
      ordem: ordem++,
      principal: !temPrincipal && ordem - atuais.length === 1,
      legenda: legenda || undefined,
    } satisfies FotoEquino)
  }
  await tx.done
}

export async function atualizarLegendaFoto(id: string, legenda: string): Promise<void> {
  const db = await getDb()
  const foto = await db.get("fotos", id)
  if (!foto) return
  await db.put("fotos", { ...foto, legenda: legenda.trim() || undefined })
}

export async function removerFoto(id: string): Promise<void> {
  const db = await getDb()
  const foto = await db.get("fotos", id)
  await db.delete("fotos", id)
  if (foto?.principal) {
    // Promove a primeira foto restante
    const restantes = await getFotosEquino(foto.equinoId)
    if (restantes.length > 0) {
      const nova = restantes[0]
      await db.put("fotos", { ...nova, principal: true })
    }
  }
}

export async function definirFotoPrincipal(id: string): Promise<void> {
  const db = await getDb()
  const foto = await db.get("fotos", id)
  if (!foto) return
  const todas = await getFotosEquino(foto.equinoId)
  const tx = db.transaction("fotos", "readwrite")
  for (const f of todas) {
    await tx.store.put({ ...f, principal: f.id === id })
  }
  await tx.done
}

// ---------- Vídeos ----------

export async function getVideosEquino(equinoId: string): Promise<VideoEquino[]> {
  const db = await getDb()
  const videos = await db.getAllFromIndex("videos", "por-equino", equinoId)
  return videos.sort((a, b) => a.ordem - b.ordem)
}

export async function adicionarVideos(equinoId: string, blobs: Blob[]): Promise<void> {
  const db = await getDb()
  const atuais = await getVideosEquino(equinoId)
  const tx = db.transaction("videos", "readwrite")
  let ordem = atuais.length
  const agora = new Date().toISOString()
  for (const blob of blobs) {
    await tx.store.put({
      id: crypto.randomUUID(),
      equinoId,
      blob,
      ordem: ordem++,
      createdAt: agora,
    } satisfies VideoEquino)
  }
  await tx.done
}

export async function excluirVideo(id: string): Promise<void> {
  const db = await getDb()
  await db.delete("videos", id)
}

export async function temVideo(equinoId: string): Promise<boolean> {
  const db = await getDb()
  const cursor = await db.transaction("videos").store.index("por-equino").openKeyCursor(IDBKeyRange.only(equinoId))
  return cursor !== null
}

// ---------- Vacinas ----------

export async function getVacinas(): Promise<Vacina[]> {
  const db = await getDb()
  const todas = await db.getAll("vacinas")
  return todas.sort((a, b) => b.dataAplicacao.localeCompare(a.dataAplicacao))
}

export async function getVacinasEquino(equinoId: string): Promise<Vacina[]> {
  const db = await getDb()
  const todas = await db.getAllFromIndex("vacinas", "por-equino", equinoId)
  return todas.sort((a, b) => b.dataAplicacao.localeCompare(a.dataAplicacao))
}

export async function salvarVacina(vacina: Vacina): Promise<void> {
  const db = await getDb()
  await db.put("vacinas", vacina)
}

export async function excluirVacina(id: string): Promise<void> {
  const db = await getDb()
  await db.delete("vacinas", id)
}

// ---------- Vermífugos ----------

export async function getVermifugos(): Promise<Vermifugo[]> {
  const db = await getDb()
  const todas = await db.getAll("vermifugos")
  return todas.sort((a, b) => b.dataAplicacao.localeCompare(a.dataAplicacao))
}

export async function getVermifugosEquino(equinoId: string): Promise<Vermifugo[]> {
  const db = await getDb()
  const todas = await db.getAllFromIndex("vermifugos", "por-equino", equinoId)
  return todas.sort((a, b) => b.dataAplicacao.localeCompare(a.dataAplicacao))
}

export async function salvarVermifugo(vermifugo: Vermifugo): Promise<void> {
  const db = await getDb()
  await db.put("vermifugos", vermifugo)
}

export async function excluirVermifugo(id: string): Promise<void> {
  const db = await getDb()
  await db.delete("vermifugos", id)
}

// ---------- Utilitários ----------

export function blobParaUrl(blob: Blob): string {
  return URL.createObjectURL(blob)
}

export function formatarData(iso?: string): string {
  if (!iso) return "—"
  const [ano, mes, dia] = iso.split("-")
  return `${dia}/${mes}/${ano}`
}

export function calcularIdade(nascimento?: string): string {
  if (!nascimento) return "—"
  const nasc = new Date(`${nascimento}T00:00:00`)
  const agora = new Date()
  let anos = agora.getFullYear() - nasc.getFullYear()
  let meses = agora.getMonth() - nasc.getMonth()
  if (meses < 0) {
    anos -= 1
    meses += 12
  }
  if (anos > 0) return `${anos} ano${anos > 1 ? "s" : ""}${meses > 0 ? ` e ${meses} ${meses > 1 ? "meses" : "mês"}` : ""}`
  return `${meses} ${meses > 1 ? "meses" : "mês"}`
}

export function diasAte(dataIso: string): number {
  const alvo = new Date(`${dataIso}T00:00:00`)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000)
}

export function hojeIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function somarDias(dataIso: string, dias: number): string {
  const d = new Date(`${dataIso}T00:00:00`)
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

export function somarMeses(dataIso: string, meses: number): string {
  const d = new Date(`${dataIso}T00:00:00`)
  d.setMonth(d.getMonth() + meses)
  return d.toISOString().slice(0, 10)
}

export function gerarId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID()
    } catch {
      // fallback
    }
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ---------- Genérico (novas stores) ----------

async function listarStore<T>(store: NomeStore, comparador?: (a: T, b: T) => number): Promise<T[]> {
  const db = await getDb()
  const todos = (await db.getAll(store as never)) as unknown as T[]
  return comparador ? todos.sort(comparador) : todos
}

async function salvarStore(store: NomeStore, valor: unknown): Promise<void> {
  const db = await getDb()
  await db.put(store as never, valor as never)
}

async function excluirStore(store: NomeStore, id: string): Promise<void> {
  const db = await getDb()
  await db.delete(store as never, id)
}

async function listarPorEquinoStore<T>(store: StorePorEquino, equinoId: string, comparador?: (a: T, b: T) => number): Promise<T[]> {
  const db = await getDb()
  const todos = (await (db as never as {
    getAllFromIndex(store: string, index: string, key: string): Promise<unknown[]>
  }).getAllFromIndex(store, "por-equino", equinoId)) as unknown as T[]
  return comparador ? todos.sort(comparador) : todos
}

// ---------- Coberturas (Reprodução) ----------

export async function getCoberturas(): Promise<Cobertura[]> {
  return listarStore<Cobertura>("coberturas", (a, b) => b.dataCobertura.localeCompare(a.dataCobertura))
}

export async function getCoberturasFemea(femeaId: string): Promise<Cobertura[]> {
  const db = await getDb()
  const todos = (await (db as never as {
    getAllFromIndex(store: string, index: string, key: string): Promise<unknown[]>
  }).getAllFromIndex("coberturas", "por-femea", femeaId)) as unknown as Cobertura[]
  return todos.sort((a, b) => b.dataCobertura.localeCompare(a.dataCobertura))
}

export async function salvarCobertura(cobertura: Cobertura): Promise<void> {
  await salvarStore("coberturas", cobertura)
}

export async function excluirCobertura(id: string): Promise<void> {
  await excluirStore("coberturas", id)
}

// ---------- Estoque (Alimentação) ----------

export async function getEstoque(): Promise<ItemEstoque[]> {
  return listarStore<ItemEstoque>("estoque", (a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
}

export async function salvarItemEstoque(item: ItemEstoque): Promise<void> {
  await salvarStore("estoque", item)
}

export async function excluirItemEstoque(id: string): Promise<void> {
  await excluirStore("estoque", id)
}

// ---------- Dietas (Alimentação) ----------

export async function getDietas(): Promise<DietaEquino[]> {
  return listarStore<DietaEquino>("dietas")
}

export async function getDietasEquino(equinoId: string): Promise<DietaEquino[]> {
  return listarPorEquinoStore<DietaEquino>("dietas", equinoId)
}

export async function salvarDieta(dieta: DietaEquino): Promise<void> {
  await salvarStore("dietas", dieta)
}

export async function excluirDieta(id: string): Promise<void> {
  await excluirStore("dietas", id)
}

// ---------- Transações (Financeiro) ----------

export async function getTransacoes(): Promise<Transacao[]> {
  return listarStore<Transacao>("transacoes", (a, b) => b.data.localeCompare(a.data))
}

export async function salvarTransacao(transacao: Transacao): Promise<void> {
  await salvarStore("transacoes", transacao)
}

export async function excluirTransacao(id: string): Promise<void> {
  await excluirStore("transacoes", id)
}

// ---------- Eventos (Agenda) ----------

export async function getEventos(): Promise<Evento[]> {
  return listarStore<Evento>("eventos", (a, b) => b.data.localeCompare(a.data))
}

export async function salvarEvento(evento: Evento): Promise<void> {
  await salvarStore("eventos", evento)
}

export async function excluirEvento(id: string): Promise<void> {
  await excluirStore("eventos", id)
}

// ---------- Medidas (Crescimento) ----------

export async function getMedidasEquino(equinoId: string): Promise<MedidaCrescimento[]> {
  return listarPorEquinoStore<MedidaCrescimento>("medidas", equinoId, (a, b) => a.data.localeCompare(b.data))
}

export async function salvarMedida(medida: MedidaCrescimento): Promise<void> {
  await salvarStore("medidas", medida)
}

export async function excluirMedida(id: string): Promise<void> {
  await excluirStore("medidas", id)
}

// ---------- Podologia (Casqueamento & Ferrageamento) ----------

export async function getFerrageamentos(): Promise<RegistroFerrageamento[]> {
  return listarStore<RegistroFerrageamento>("ferrageamentos", (a, b) => b.dataServico.localeCompare(a.dataServico))
}

export async function getFerrageamentosEquino(equinoId: string): Promise<RegistroFerrageamento[]> {
  return listarPorEquinoStore<RegistroFerrageamento>("ferrageamentos", equinoId, (a, b) => b.dataServico.localeCompare(a.dataServico))
}

export async function salvarFerrageamento(registro: RegistroFerrageamento): Promise<void> {
  await salvarStore("ferrageamentos", registro)
}

export async function excluirFerrageamento(id: string): Promise<void> {
  await excluirStore("ferrageamentos", id)
}

// ---------- Previsão Inteligente de Estoque ----------

export function calcularAutonomiaEstoque(
  itensEstoque: ItemEstoque[],
  dietas: DietaEquino[],
  totalEquinosAtivos: number,
  consumoPadraoKg: number = 3.5,
): PrevisaoEstoqueItem[] {
  // Mapa de consumo real cadastrado nas dietas por nome de item aproximado ou ID
  const consumoPorItem = new Map<string, number>()

  for (const d of dietas) {
    const chave = (d.itemEstoqueId ?? d.itemNome).trim().toLowerCase()
    const qtdDiaria = d.quantidade > 0 ? d.quantidade : 0
    consumoPorItem.set(chave, (consumoPorItem.get(chave) ?? 0) + qtdDiaria)
  }

  const hoje = hojeIso()

  return itensEstoque.map((item) => {
    const chaveId = item.id.toLowerCase()
    const chaveNome = item.nome.trim().toLowerCase()

    let consumoDiario = consumoPorItem.get(chaveId) ?? consumoPorItem.get(chaveNome) ?? 0

    // Se não há dietas cadastradas para este item, e é ração/feno, usa a estimativa inteligente por animal
    if (consumoDiario === 0 && totalEquinosAtivos > 0) {
      if (item.tipo === "racao" || item.tipo === "feno") {
        consumoDiario = totalEquinosAtivos * consumoPadraoKg
      }
    }

    // Se o item for em saco (ex: 40kg) ou fardo, converter proporcionalmente para kg se a unidade for saco
    let qtdConvertida = item.quantidade
    if (item.unidade === "saco" && consumoDiario > 0) {
      qtdConvertida = item.quantidade * 40 // 1 saco padrão = 40kg
    } else if (item.unidade === "fardo" && consumoDiario > 0) {
      qtdConvertida = item.quantidade * 12 // 1 fardo de feno médio = 12kg
    }

    let diasRestantes = 999
    if (consumoDiario > 0) {
      diasRestantes = Math.max(0, Math.floor(qtdConvertida / consumoDiario))
    }

    const dataEsgotamento = diasRestantes < 999 ? somarDias(hoje, diasRestantes) : somarDias(hoje, 365)

    let status: "critico" | "alerta" | "seguro" = "seguro"
    if (diasRestantes <= 7) {
      status = "critico"
    } else if (diasRestantes <= 15 || (item.estoqueMinimo != null && item.quantidade <= item.estoqueMinimo)) {
      status = "alerta"
    }

    return {
      itemId: item.id,
      itemNome: item.nome,
      quantidadeAtual: item.quantidade,
      unidade: item.unidade,
      consumoDiarioEstimado: Math.round(consumoDiario * 10) / 10,
      diasRestantes,
      dataEsgotamento,
      status,
    }
  })
}

// ---------- Finanças por Equino ----------

export function calcularMetricasFinanceirasEquinos(
  transacoes: Transacao[],
  equinos: Equino[],
): Map<string, ResumoFinanceiroEquino> {
  const mapa = new Map<string, ResumoFinanceiroEquino>()

  for (const eq of equinos) {
    mapa.set(eq.id, {
      equinoId: eq.id,
      totalDespesas: 0,
      totalReceitas: 0,
      saldo: 0,
      despesasPorCategoria: {},
    })
  }

  for (const t of transacoes) {
    if (!t.equinoId) continue
    let res = mapa.get(t.equinoId)
    if (!res) {
      res = {
        equinoId: t.equinoId,
        totalDespesas: 0,
        totalReceitas: 0,
        saldo: 0,
        despesasPorCategoria: {},
      }
      mapa.set(t.equinoId, res)
    }

    if (t.tipo === "despesa") {
      res.totalDespesas += t.valor
      res.despesasPorCategoria[t.categoria] = (res.despesasPorCategoria[t.categoria] ?? 0) + t.valor
    } else {
      res.totalReceitas += t.valor
    }
    res.saldo = res.totalReceitas - res.totalDespesas
  }

  return mapa
}

// ---------- Árvore Genealógica (3 Gerações) ----------

export interface NoGenealogico {
  id?: string
  nome: string
  sexo?: "macho" | "femea" | "castrado"
  raca?: string
  pelagem?: string
  registro?: string
  cadastrado: boolean
}

export interface Genealogia3Geracoes {
  animal: NoGenealogico
  pai?: NoGenealogico
  mae?: NoGenealogico
  avoPaterno?: NoGenealogico
  avoMaternoPaterno?: NoGenealogico
  avoMaterno?: NoGenealogico
  avoMaternoMaterno?: NoGenealogico
}

export function obterGenealogia3Geracoes(equino: Equino, todosEquinos: Equino[]): Genealogia3Geracoes {
  const mapaPorId = new Map<string, Equino>()
  const mapaPorNome = new Map<string, Equino>()

  for (const e of todosEquinos) {
    mapaPorId.set(e.id, e)
    mapaPorNome.set(e.nome.trim().toLowerCase(), e)
  }

  function resolver(idOuNome?: string, sexoPadrao?: "macho" | "femea"): NoGenealogico | undefined {
    if (!idOuNome) return undefined
    const encontrado = mapaPorId.get(idOuNome) ?? mapaPorNome.get(idOuNome.trim().toLowerCase())
    if (encontrado) {
      return {
        id: encontrado.id,
        nome: encontrado.nome,
        sexo: encontrado.sexo,
        raca: encontrado.raca,
        pelagem: encontrado.pelagem,
        registro: encontrado.registro,
        cadastrado: true,
      }
    }
    return {
      nome: idOuNome,
      sexo: sexoPadrao,
      cadastrado: false,
    }
  }

  const pai = resolver(equino.paiId, "macho")
  const mae = resolver(equino.maeId, "femea")

  const eqPai = equino.paiId ? mapaPorId.get(equino.paiId) : undefined
  const eqMae = equino.maeId ? mapaPorId.get(equino.maeId) : undefined

  return {
    animal: {
      id: equino.id,
      nome: equino.nome,
      sexo: equino.sexo,
      raca: equino.raca,
      pelagem: equino.pelagem,
      registro: equino.registro,
      cadastrado: true,
    },
    pai,
    mae,
    avoPaterno: eqPai ? resolver(eqPai.paiId, "macho") : undefined,
    avoMaternoPaterno: eqPai ? resolver(eqPai.maeId, "femea") : undefined,
    avoMaterno: eqMae ? resolver(eqMae.paiId, "macho") : undefined,
    avoMaternoMaterno: eqMae ? resolver(eqMae.maeId, "femea") : undefined,
  }
}

// ---------- Backup / Importação ----------

async function blobParaBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let bin = ""
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(bin)
}

function base64ParaBlob(base64: string, tipo: string): Blob {
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type: tipo })
}

/** Exporta todos os dados (com fotos/vídeos em base64) como string JSON. */
export async function exportarDados(): Promise<string> {
  const db = await getDb()
  const dados: Record<string, unknown> = {}
  for (const store of TODAS_STORES) {
    const registros = await db.getAll(store as never)
    if (store === "fotos" || store === "videos") {
      dados[store] = await Promise.all(
        (registros as { blob: Blob }[]).map(async (r) => ({
          ...r,
          blob: await blobParaBase64(r.blob),
        })),
      )
    } else {
      dados[store] = registros
    }
  }
  return JSON.stringify({ versao: 1, exportadoEm: new Date().toISOString(), dados })
}

/** Limpa todas as stores e importa os dados de um JSON gerado pelo exportarDados. */
export async function importarDados(json: string): Promise<void> {
  const parsed = JSON.parse(json) as { versao?: number; dados?: Record<string, unknown[]> }
  if (!parsed?.dados) throw new Error("Arquivo de backup inválido.")
  const db = await getDb()
  const tx = db.transaction(TODAS_STORES as never, "readwrite")
  for (const store of TODAS_STORES) {
    await tx.objectStore(store as never).clear()
  }
  await tx.done

  for (const store of TODAS_STORES) {
    const registros = parsed.dados[store]
    if (!Array.isArray(registros)) continue
    if (store === "fotos" || store === "videos") {
      for (const r of registros as Record<string, unknown>[]) {
        const rec = { ...r, blob: base64ParaBlob(r.blob as string, (r.blobTipo as string) ?? "application/octet-stream") }
        await salvarStore(store, rec)
      }
    } else {
      for (const r of registros) {
        await salvarStore(store, r)
      }
    }
  }
}

/** Remove todos os dados do banco (usado antes de importar ou para limpar). */
export async function limparTudo(): Promise<void> {
  const db = await getDb()
  const tx = db.transaction(TODAS_STORES as never, "readwrite")
  for (const store of TODAS_STORES) {
    await tx.objectStore(store as never).clear()
  }
  await tx.done
  try {
    localStorage.removeItem("haras_cloud_saidas")
    localStorage.removeItem("haras_cloud_galeria")
  } catch {}
}

// ---------- REGISTROS DE SAÍDAS (VENDAS, CEDIDOS, ÓBITOS) ----------

const STORAGE_SAIDAS = "haras_cloud_saidas"

export async function getSaidas(): Promise<import("./types").RegistroSaida[]> {
  try {
    const raw = localStorage.getItem(STORAGE_SAIDAS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export async function salvarSaida(saida: import("./types").RegistroSaida): Promise<void> {
  const todas = await getSaidas()
  const idx = todas.findIndex((s) => s.id === saida.id)
  if (idx >= 0) {
    todas[idx] = saida
  } else {
    todas.unshift(saida)
  }
  localStorage.setItem(STORAGE_SAIDAS, JSON.stringify(todas))

  // Atualiza o status do equino correspondente
  const equino = await getEquino(saida.equinoId)
  if (equino) {
    const novoStatus: import("./types").StatusEquino =
      saida.motivo === "venda"
        ? "vendido"
        : saida.motivo === "obito"
        ? "falecido"
        : "aposentado"
    await salvarEquino({ ...equino, status: novoStatus, updatedAt: new Date().toISOString() })
  }
}

export async function removerSaida(id: string): Promise<void> {
  const todas = await getSaidas()
  const filtradas = todas.filter((s) => s.id !== id)
  localStorage.setItem(STORAGE_SAIDAS, JSON.stringify(filtradas))
}

// ---------- GALERIA MULTIMÍDIA DO HARAS ----------

const STORAGE_GALERIA = "haras_cloud_galeria"

export async function getGaleria(): Promise<import("./types").ItemGaleria[]> {
  try {
    const raw = localStorage.getItem(STORAGE_GALERIA)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export async function salvarItemGaleria(item: import("./types").ItemGaleria): Promise<void> {
  const todas = await getGaleria()
  const idx = todas.findIndex((g) => g.id === item.id)
  if (idx >= 0) {
    todas[idx] = item
  } else {
    todas.unshift(item)
  }
  localStorage.setItem(STORAGE_GALERIA, JSON.stringify(todas))
}

export async function removerItemGaleria(id: string): Promise<void> {
  const todas = await getGaleria()
  const filtradas = todas.filter((g) => g.id !== id)
  localStorage.setItem(STORAGE_GALERIA, JSON.stringify(filtradas))
}

// ---------- CLIENTES E ALUNOS DO HARAS ----------

const STORAGE_CLIENTES = "haras_cloud_clientes"

export async function getClientes(): Promise<import("./types").ClienteHaras[]> {
  try {
    const raw = localStorage.getItem(STORAGE_CLIENTES)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export async function salvarCliente(cliente: import("./types").ClienteHaras): Promise<void> {
  const todas = await getClientes()
  const idx = todas.findIndex((c) => c.id === cliente.id)
  if (idx >= 0) {
    todas[idx] = cliente
  } else {
    todas.unshift(cliente)
  }
  localStorage.setItem(STORAGE_CLIENTES, JSON.stringify(todas))
}

export async function removerCliente(id: string): Promise<void> {
  const todas = await getClientes()
  const filtradas = todas.filter((c) => c.id !== id)
  localStorage.setItem(STORAGE_CLIENTES, JSON.stringify(filtradas))
}

// ---------- BIOTECNOLOGIA & TRANSFERÊNCIA DE EMBRIÕES (TE) ----------

const STORAGE_TE = "haras_cloud_embrioes_te"

export async function getEmbrioesTE(): Promise<import("./types").EmbriaoTE[]> {
  try {
    const raw = localStorage.getItem(STORAGE_TE)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export async function salvarEmbriaoTE(item: import("./types").EmbriaoTE): Promise<void> {
  const todas = await getEmbrioesTE()
  const idx = todas.findIndex((e) => e.id === item.id)
  if (idx >= 0) todas[idx] = item
  else todas.unshift(item)
  localStorage.setItem(STORAGE_TE, JSON.stringify(todas))
}

export async function removerEmbriaoTE(id: string): Promise<void> {
  const todas = await getEmbrioesTE()
  localStorage.setItem(STORAGE_TE, JSON.stringify(todas.filter((e) => e.id !== id)))
}

// ---------- NEONATOLOGIA & POTROS NASCIDOS ----------

const STORAGE_POTROS = "haras_cloud_potros_neonatologia"

export async function getPotrosNeonatologia(): Promise<import("./types").PotroNeonatologia[]> {
  try {
    const raw = localStorage.getItem(STORAGE_POTROS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export async function salvarPotroNeonatologia(item: import("./types").PotroNeonatologia): Promise<void> {
  const todas = await getPotrosNeonatologia()
  const idx = todas.findIndex((p) => p.id === item.id)
  if (idx >= 0) todas[idx] = item
  else todas.unshift(item)
  localStorage.setItem(STORAGE_POTROS, JSON.stringify(todas))
}

export async function removerPotroNeonatologia(id: string): Promise<void> {
  const todas = await getPotrosNeonatologia()
  localStorage.setItem(STORAGE_POTROS, JSON.stringify(todas.filter((p) => p.id !== id)))
}

// ---------- INSTALAÇÕES: BAIAS & COCHEIRAS ----------

const STORAGE_BAIAS = "haras_cloud_baias"

const BAIAS_DEFAULT: import("./types").BaiaInstalacao[] = [
  { id: "baia-01", harasId: "haras-cardoso-master", numero: "Baia 01", setor: "Pavilhão Principal", statusLimpeza: "em_uso", equinoNome: "Imperador da Serra" },
  { id: "baia-02", harasId: "haras-cardoso-master", numero: "Baia 02", setor: "Pavilhão Principal", statusLimpeza: "em_uso", equinoNome: "Estrela do Cardoso" },
  { id: "baia-03", harasId: "haras-cardoso-master", numero: "Baia 03", setor: "Pavilhão Principal", statusLimpeza: "limpa" },
  { id: "baia-04", harasId: "haras-cardoso-master", numero: "Baia 04", setor: "Pavilhão Principal", statusLimpeza: "limpa" },
  { id: "baia-05", harasId: "haras-cardoso-master", numero: "Baia 05", setor: "Pavilhão Garanhões", statusLimpeza: "em_uso", equinoNome: "Relâmpago Negro" },
  { id: "baia-06", harasId: "haras-cardoso-master", numero: "Baia 06", setor: "Pavilhão Garanhões", statusLimpeza: "manutencao" },
  { id: "baia-07", harasId: "haras-cardoso-master", numero: "Maternidade 01", setor: "Maternidade", statusLimpeza: "em_uso", equinoNome: "Dama da Noite" },
  { id: "baia-08", harasId: "haras-cardoso-master", numero: "Maternidade 02", setor: "Maternidade", statusLimpeza: "limpa" },
]

export async function getBaias(): Promise<import("./types").BaiaInstalacao[]> {
  try {
    const raw = localStorage.getItem(STORAGE_BAIAS)
    if (!raw) {
      localStorage.setItem(STORAGE_BAIAS, JSON.stringify(BAIAS_DEFAULT))
      return BAIAS_DEFAULT
    }
    return JSON.parse(raw)
  } catch {
    return BAIAS_DEFAULT
  }
}

export async function salvarBaia(item: import("./types").BaiaInstalacao): Promise<void> {
  const todas = await getBaias()
  const idx = todas.findIndex((b) => b.id === item.id)
  if (idx >= 0) todas[idx] = item
  else todas.push(item)
  localStorage.setItem(STORAGE_BAIAS, JSON.stringify(todas))
}

export async function removerBaia(id: string): Promise<void> {
  const todas = await getBaias()
  localStorage.setItem(STORAGE_BAIAS, JSON.stringify(todas.filter((b) => b.id !== id)))
}

// ---------- INSTALAÇÕES: PIQUETES & PASTO ----------

const STORAGE_PIQUETES = "haras_cloud_piquetes"

const PIQUETES_DEFAULT: import("./types").PiqueteInstalacao[] = [
  { id: "piq-01", harasId: "haras-cardoso-master", nome: "Piquete 01 - Tifton Master", tipoCapim: "Tifton 85", status: "em_uso", areaHectares: 2.5, animaisAlocados: ["Potros Desmamados", "Matrizes"] },
  { id: "piq-02", harasId: "haras-cardoso-master", nome: "Piquete 02 - Coastcross", tipoCapim: "Coastcross", status: "descanso", diasDescansoRestantes: 12, areaHectares: 3.0 },
  { id: "piq-03", harasId: "haras-cardoso-master", nome: "Piquete 03 - Pista de Soltura", tipoCapim: "Grama Estrela", status: "em_uso", areaHectares: 1.8, animaisAlocados: ["Garanhões (Revezamento)"] },
  { id: "piq-04", harasId: "haras-cardoso-master", nome: "Piquete 04 - Maternidade", tipoCapim: "Tifton 85", status: "recuperacao", diasDescansoRestantes: 20, areaHectares: 1.5 },
]

export async function getPiquetes(): Promise<import("./types").PiqueteInstalacao[]> {
  try {
    const raw = localStorage.getItem(STORAGE_PIQUETES)
    if (!raw) {
      localStorage.setItem(STORAGE_PIQUETES, JSON.stringify(PIQUETES_DEFAULT))
      return PIQUETES_DEFAULT
    }
    return JSON.parse(raw)
  } catch {
    return PIQUETES_DEFAULT
  }
}

export async function salvarPiquete(item: import("./types").PiqueteInstalacao): Promise<void> {
  const todas = await getPiquetes()
  const idx = todas.findIndex((p) => p.id === item.id)
  if (idx >= 0) todas[idx] = item
  else todas.push(item)
  localStorage.setItem(STORAGE_PIQUETES, JSON.stringify(todas))
}

export async function removerPiquete(id: string): Promise<void> {
  const todas = await getPiquetes()
  localStorage.setItem(STORAGE_PIQUETES, JSON.stringify(todas.filter((p) => p.id !== id)))
}

// ---------- VITRINE DE LEILÃO & VENDAS PÚBLICAS ----------

const STORAGE_LEILAO = "haras_cloud_leilao_lotes"

export async function getLotesLeilao(): Promise<import("./types").LoteLeilao[]> {
  try {
    const raw = localStorage.getItem(STORAGE_LEILAO)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export async function salvarLoteLeilao(item: import("./types").LoteLeilao): Promise<void> {
  const todas = await getLotesLeilao()
  const idx = todas.findIndex((l) => l.id === item.id)
  if (idx >= 0) todas[idx] = item
  else todas.push(item)
  localStorage.setItem(STORAGE_LEILAO, JSON.stringify(todas))
}

export async function removerLoteLeilao(id: string): Promise<void> {
  const todas = await getLotesLeilao()
  localStorage.setItem(STORAGE_LEILAO, JSON.stringify(todas.filter((l) => l.id !== id)))
}

// ---------- GESTÃO DE TAREFAS, MANEJO & CRONÔMETRO ----------

const STORAGE_TAREFAS = "haras_cloud_tarefas_v2"

const TAREFAS_DEFAULT: import("./types").TarefaHaras[] = [
  {
    id: "tar-01",
    harasId: "haras-cardoso-master",
    titulo: "Limpeza e troca de maravalha - Baía 01",
    descricao: "Retirar esterco, desinfetar piso e repor camada de maravalha seca.",
    categoria: "equino",
    turno: "manha",
    prioridade: "rotina",
    status: "pendente",
    horarioProgramado: "07:30",
    dataProgramada: new Date().toISOString().slice(0, 10),
    baiaNome: "Baia 01",
    equinoNome: "Imperador da Serra",
    responsavelNome: "Carlos Tratador",
    lembreteMinutosAntes: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: "tar-02",
    harasId: "haras-cardoso-master",
    titulo: "Curativo e pomada antisséptica - Pata Traseira",
    descricao: "Lavar ferida com soro, aplicar Ungüento/Rifocina e colocar liga de descanso.",
    categoria: "equino",
    turno: "manha",
    prioridade: "urgente_saude",
    status: "pendente",
    horarioProgramado: "08:15",
    dataProgramada: new Date().toISOString().slice(0, 10),
    baiaNome: "Baia 02",
    equinoNome: "Estrela do Cardoso",
    responsavelNome: "Dr. Veterinário / Carlos",
    lembreteMinutosAntes: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: "tar-03",
    harasId: "haras-cardoso-master",
    titulo: "Alimentar Galinheiro e Repor Água dos Bebedouros",
    descricao: "Colocar ração de postura, milho triturado e lavar os bebedouros automáticos das aves.",
    categoria: "sitio_animais",
    turno: "manha",
    prioridade: "rotina",
    status: "pendente",
    horarioProgramado: "09:00",
    dataProgramada: new Date().toISOString().slice(0, 10),
    responsavelNome: "Marcos Caseiro",
    lembreteMinutosAntes: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: "tar-04",
    harasId: "haras-cardoso-master",
    titulo: "Cortar grama e verificar cerca viva do Piquete 02",
    descricao: "Passar roçadeira nos mourões e verificar se a fita elétrica está isolada sem encostar no capim.",
    categoria: "manutencao_infra",
    turno: "tarde",
    prioridade: "alta",
    status: "pendente",
    horarioProgramado: "14:00",
    dataProgramada: new Date().toISOString().slice(0, 10),
    responsavelNome: "Marcos Caseiro",
    lembreteMinutosAntes: 15,
    createdAt: new Date().toISOString(),
  },
]

export async function getTarefas(): Promise<import("./types").TarefaHaras[]> {
  try {
    const raw = localStorage.getItem(STORAGE_TAREFAS)
    if (!raw) {
      localStorage.setItem(STORAGE_TAREFAS, JSON.stringify(TAREFAS_DEFAULT))
      return TAREFAS_DEFAULT
    }
    return JSON.parse(raw)
  } catch {
    return TAREFAS_DEFAULT
  }
}

export async function salvarTarefa(item: import("./types").TarefaHaras): Promise<void> {
  const todas = await getTarefas()
  const idx = todas.findIndex((t) => t.id === item.id)
  if (idx >= 0) todas[idx] = item
  else todas.unshift(item)
  localStorage.setItem(STORAGE_TAREFAS, JSON.stringify(todas))
}

export async function iniciarTarefa(id: string): Promise<import("./types").TarefaHaras | null> {
  const todas = await getTarefas()
  const idx = todas.findIndex((t) => t.id === id)
  if (idx < 0) return null
  
  const atualizada: import("./types").TarefaHaras = {
    ...todas[idx],
    status: "em_andamento",
    iniciadoEm: todas[idx].iniciadoEm || new Date().toISOString(),
  }
  todas[idx] = atualizada
  localStorage.setItem(STORAGE_TAREFAS, JSON.stringify(todas))
  return atualizada
}

export async function anexarMidiaTarefa(
  id: string,
  midiaUrl: string,
  tipo: "foto" | "video"
): Promise<import("./types").TarefaHaras | null> {
  const todas = await getTarefas()
  const idx = todas.findIndex((t) => t.id === id)
  if (idx < 0) return null

  const tarefa = todas[idx]
  if (tipo === "foto") {
    const fotos = tarefa.fotosComprovantes || []
    tarefa.fotosComprovantes = [...fotos, midiaUrl]
    if (!tarefa.fotoComprovanteUrl) tarefa.fotoComprovanteUrl = midiaUrl
  } else {
    const videos = tarefa.videosComprovantes || []
    tarefa.videosComprovantes = [...videos, midiaUrl]
  }

  todas[idx] = tarefa
  localStorage.setItem(STORAGE_TAREFAS, JSON.stringify(todas))
  return tarefa
}

export async function concluirTarefa(
  id: string,
  fotoComprovanteUrl?: string,
  observacoesExecucao?: string,
  fotosExtras?: string[],
  videosExtras?: string[]
): Promise<import("./types").TarefaHaras | null> {
  const todas = await getTarefas()
  const idx = todas.findIndex((t) => t.id === id)
  if (idx < 0) return null

  const agora = new Date()
  const tarefa = todas[idx]
  let tempoGasto = tarefa.tempoGastoMinutos

  if (tarefa.iniciadoEm) {
    const inicio = new Date(tarefa.iniciadoEm).getTime()
    const diffMs = agora.getTime() - inicio
    tempoGasto = Math.max(1, Math.round(diffMs / (1000 * 60)))
  } else {
    tempoGasto = 15 // Padrão estimado se concluiu direto
  }

  const todasFotos = [
    ...(tarefa.fotosComprovantes || []),
    ...(fotoComprovanteUrl ? [fotoComprovanteUrl] : []),
    ...(fotosExtras || []),
  ].filter((v, i, a) => a.indexOf(v) === i)

  const todosVideos = [
    ...(tarefa.videosComprovantes || []),
    ...(videosExtras || []),
  ].filter((v, i, a) => a.indexOf(v) === i)

  const atualizada: import("./types").TarefaHaras = {
    ...tarefa,
    status: "concluida",
    concluidoEm: agora.toISOString(),
    tempoGastoMinutos: tempoGasto,
    fotoComprovanteUrl: fotoComprovanteUrl || todasFotos[0] || tarefa.fotoComprovanteUrl,
    fotosComprovantes: todasFotos,
    videosComprovantes: todosVideos,
    observacoesExecucao: observacoesExecucao || tarefa.observacoesExecucao,
  }
  todas[idx] = atualizada
  localStorage.setItem(STORAGE_TAREFAS, JSON.stringify(todas))
  return atualizada
}

export async function removerTarefa(id: string): Promise<void> {
  const todas = await getTarefas()
  localStorage.setItem(STORAGE_TAREFAS, JSON.stringify(todas.filter((t) => t.id !== id)))
}
