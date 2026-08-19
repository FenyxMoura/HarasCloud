export type Sexo = "macho" | "femea" | "castrado"

export type StatusEquino = "ativo" | "aposentado" | "vendido" | "falecido"

export interface Equino {
  id: string
  nome: string
  apelido?: string
  sexo: Sexo
  nascimento?: string // yyyy-mm-dd
  raca: string
  pelagem: string
  registro?: string
  microchip?: string
  paiId?: string
  maeId?: string
  origem?: string
  temperamento?: string
  altura?: string
  status: StatusEquino
  observacoes?: string
  createdAt: string
  updatedAt: string
}

export interface FotoEquino {
  id: string
  equinoId: string
  blob: Blob
  ordem: number
  principal: boolean
  legenda?: string
}

export interface VideoEquino {
  id: string
  equinoId: string
  blob: Blob
  ordem: number
  createdAt: string
}

export interface Vacina {
  id: string
  equinoId: string
  nome: string
  dataAplicacao: string // yyyy-mm-dd
  dataProxima?: string // yyyy-mm-dd
  veterinario?: string
  observacoes?: string
  createdAt: string
}

export interface Vermifugo {
  id: string
  equinoId: string
  produto: string
  dataAplicacao: string
  dataProxima?: string
  observacoes?: string
  createdAt: string
}

export type RegistroSaude = { vacina: Vacina } | { vermifugo: Vermifugo }

export const RACAS = [
  "Mangalarga",
  "Mangalarga Marchador",
  "Quarto de Milha",
  "Crioulo",
  "Puro Sangue Inglês",
  "Puro Sangue Lusitano",
  "Árabe",
  "Paint Horse",
  "Appaloosa",
  "Campolina",
  "SRD (Sem Raça Definida)",
  "Outra",
] as const

export const PELAGENS = [
  "Alazã",
  "Alazã tostada",
  "Baia",
  "Baia dourada",
  "Castanha",
  "Preta",
  "Tordilha",
  "Tordilha negra",
  "Rosilha",
  "Pampa",
  "Malhada",
  "Overo",
  "Tobiano",
  "Bragada",
  "Lobuna",
  "Zaina",
  "Picota",
  "Outra",
] as const

export const SEXO_LABEL: Record<Sexo, string> = {
  macho: "Macho",
  femea: "Fêmea",
  castrado: "Castrado",
}

export const STATUS_LABEL: Record<StatusEquino, string> = {
  ativo: "Ativo",
  aposentado: "Aposentado",
  vendido: "Vendido",
  falecido: "Falecido",
}

// ---------- Reprodução ----------

export type MetodoCobertura = "monta-natural" | "ia" | "transferencia"
export type StatusCobertura = "coberta" | "confirmada" | "nao-prenhe" | "parto"

export interface Cobertura {
  id: string
  femeaId: string
  machoId: string
  dataCobertura: string // yyyy-mm-dd
  metodo: MetodoCobertura
  status: StatusCobertura
  dataPartoPrevista?: string
  dataParto?: string
  criaId?: string
  observacoes?: string
  createdAt: string
}

export const METODO_COBERTURA_LABEL: Record<MetodoCobertura, string> = {
  "monta-natural": "Monta natural",
  ia: "Inseminação artificial",
  transferencia: "Transferência de embrião",
}

export const STATUS_COBERTURA_LABEL: Record<StatusCobertura, string> = {
  coberta: "Coberta",
  confirmada: "Gestação confirmada",
  "nao-prenhe": "Não prenhe",
  parto: "Parto realizado",
}

export const DIAS_GESTACAO = 340

// ---------- Alimentação ----------

export type TipoItemEstoque = "racao" | "feno" | "suplemento" | "outro"
export type UnidadeEstoque = "kg" | "saco" | "fardo" | "un"

export interface ItemEstoque {
  id: string
  nome: string
  tipo: TipoItemEstoque
  quantidade: number
  unidade: UnidadeEstoque
  estoqueMinimo?: number
  custoUnitario?: number
  observacoes?: string
}

export interface DietaEquino {
  id: string
  equinoId: string
  itemNome: string
  quantidade: number
  unidade: UnidadeEstoque
  periodo: string
  itemEstoqueId?: string
  observacoes?: string
}

export const TIPO_ITEM_LABEL: Record<TipoItemEstoque, string> = {
  racao: "Ração",
  feno: "Feno",
  suplemento: "Suplemento",
  outro: "Outro",
}

export const UNIDADE_LABEL: Record<UnidadeEstoque, string> = {
  kg: "kg",
  saco: "saco",
  fardo: "fardo",
  un: "unidade",
}

export const PERIODOS = ["Manhã", "Tarde", "Noite", "Dia inteiro"] as const

// ---------- Financeiro ----------

export type TipoTransacao = "despesa" | "receita"

export interface Transacao {
  id: string
  tipo: TipoTransacao
  categoria: string
  descricao: string
  valor: number
  data: string
  equinoId?: string
  observacoes?: string
  createdAt: string
}

export const CATEGORIAS_DESPESA = [
  "Ração",
  "Feno",
  "Ferradura",
  "Veterinário",
  "Suplementos",
  "Inscrições",
  "Manutenção",
  "Funcionários",
  "Transporte",
  "Outros",
] as const

export const CATEGORIAS_RECEITA = [
  "Venda de animal",
  "Hospedagem",
  "Aulas",
  "Cria",
  "Competições",
  "Outros",
] as const

export function categoriasPara(tipo: TipoTransacao): readonly string[] {
  return tipo === "despesa" ? CATEGORIAS_DESPESA : CATEGORIAS_RECEITA
}

// ---------- Agenda ----------

export type TipoEvento = "veterinario" | "ferradura" | "competicao" | "leilao" | "visita" | "outro"

export interface Evento {
  id: string
  titulo: string
  tipo: TipoEvento
  data: string
  hora?: string
  equinoId?: string
  observacoes?: string
  concluido?: boolean
  createdAt: string
}

export const TIPO_EVENTO_LABEL: Record<TipoEvento, string> = {
  veterinario: "Veterinário",
  ferradura: "Ferradura",
  competicao: "Competição",
  leilao: "Leilão",
  visita: "Visita",
  outro: "Outro",
}

export const TIPO_EVENTO_ICONE: Record<TipoEvento, string> = {
  veterinario: "💉",
  ferradura: "🔨",
  competicao: "🏆",
  leilao: "🔨",
  visita: "👋",
  outro: "📌",
}

// ---------- Crescimento ----------

export interface MedidaCrescimento {
  id: string
  equinoId: string
  data: string // yyyy-mm-dd
  pesoKg?: number
  alturaCernelha?: number
  observacoes?: string
  createdAt: string
}

// ---------- Podologia (Casqueamento & Ferrageamento) ----------

export type TipoServicoCasco =
  | "casqueamento"
  | "ferradura_ferro"
  | "ferradura_aluminio"
  | "ortopedica"
  | "outro"

export interface RegistroFerrageamento {
  id: string
  equinoId: string
  tipo: TipoServicoCasco
  dataServico: string // yyyy-mm-dd
  dataProximo?: string // yyyy-mm-dd (geralmente +45 dias)
  ferrador?: string
  valor?: number
  observacoes?: string
  createdAt: string
}

export const TIPO_SERVICO_CASCO_LABEL: Record<TipoServicoCasco, string> = {
  casqueamento: "Apenas Casqueamento",
  ferradura_ferro: "Ferradura de Ferro",
  ferradura_aluminio: "Ferradura de Alumínio",
  ortopedica: "Ferradura Ortopédica / Terapêutica",
  outro: "Outro serviço podológico",
}

export const DIAS_PADRAO_RETORNO_CASCO = 45

// ---------- Manejo & Previsão de Estoque ----------

export interface PrevisaoEstoqueItem {
  itemId: string
  itemNome: string
  quantidadeAtual: number
  unidade: string
  consumoDiarioEstimado: number // em kg ou un por dia
  diasRestantes: number
  dataEsgotamento: string // yyyy-mm-dd
  status: "critico" | "alerta" | "seguro"
}

// ---------- Financeiro por Equino ----------

export interface ResumoFinanceiroEquino {
  equinoId: string
  totalDespesas: number
  totalReceitas: number
  saldo: number
  despesasPorCategoria: Record<string, number>
}

// ---------- SaaS Multi-Tenant & Autenticação ----------

export type PlanoSaaS = "potro" | "marchador" | "imperial"
export type StatusAssinatura = "trial" | "ativo" | "pendente" | "cancelado"
export type RoleUsuario = "superadmin" | "tenant_owner" | "tenant_member" | "visitante"
export type CargoMembro = "gerente" | "veterinario" | "tratador" | "treinador" | "outro" | "visitante"
export type PermissaoModulo =
  | "equinos"
  | "saude"
  | "reproducao"
  | "alimentacao"
  | "financeiro"
  | "agenda"
  | "equipe"
  | "configuracoes"
  | "plantas"

export interface Usuario {
  id: string
  nome: string
  email: string
  senha?: string
  role: RoleUsuario
  harasId: string
  cargo?: CargoMembro
  permissoes: PermissaoModulo[]
  telefone?: string
  ativo: boolean
  createdAt: string
}

export interface HarasTenant {
  id: string
  nomeHaras: string
  subtitulo?: string
  responsavel: string
  email: string
  telefone?: string
  cnpjOuCpf?: string
  cidadeUf?: string
  plano: PlanoSaaS
  ciclo: "mensal" | "anual"
  statusAssinatura: StatusAssinatura
  dataInicio: string
  dataExpiracao: string
  limiteEquinos: number
  limiteUsuarios: number
  logoUrl?: string
  notificacaoTarefasDestino?: "dono" | "gerente" | "ambos" | "desativado"
  somNotificacaoTarefas?: boolean
  createdAt: string
}

export interface InfoPlano {
  id: PlanoSaaS
  nome: string
  subtitulo: string
  precoMensal: number
  precoAnual: number
  limiteEquinos: number
  limiteUsuarios: number
  destaque?: boolean
  recursos: string[]
}

export const PLANOS_DISPONIVEIS: Record<PlanoSaaS, InfoPlano> = {
  potro: {
    id: "potro",
    nome: "Plano Potro",
    subtitulo: "Ideal para criadores iniciantes e pequenos plantéis",
    precoMensal: 89,
    precoAnual: 74, // ~R$ 888/ano (2 meses grátis)
    limiteEquinos: 10,
    limiteUsuarios: 2,
    recursos: [
      "Até 10 equinos cadastrados",
      "2 acessos de equipe (Tratador / Vet)",
      "Controle completo de vacinas & vermífugos",
      "Ficha de manejo de ração & feno",
      "Agenda de eventos & compromissos",
      "Exportação de ficha em PDF",
      "Acesso no Celular e Computador (PWA)",
    ],
  },
  marchador: {
    id: "marchador",
    nome: "Plano Marchador",
    subtitulo: "O mais escolhido por haras profissionais e criatórios",
    precoMensal: 179,
    precoAnual: 149, // ~R$ 1.788/ano
    limiteEquinos: 35,
    limiteUsuarios: 6,
    destaque: true,
    recursos: [
      "Até 35 equinos cadastrados",
      "6 acessos de equipe com permissões",
      "Tudo do Plano Potro",
      "Financeiro completo (DRE, Caixa, Custos/animal)",
      "Centro de Reprodução & Gestações",
      "Galeria de fotos em alta resolução",
      "Alertas inteligentes com som",
      "Gerador de Contratos & Recibos A4",
      "Backup automático em nuvem",
    ],
  },
  imperial: {
    id: "imperial",
    nome: "Plano Imperial",
    subtitulo: "Para grandes haras, centros de reprodução e leilões",
    precoMensal: 299,
    precoAnual: 249, // ~R$ 2.988/ano
    limiteEquinos: 9999, // Ilimitado
    limiteUsuarios: 9999,
    recursos: [
      "Equinos e Plantel ILIMITADOS",
      "Usuários de equipe ILIMITADOS",
      "Tudo do Plano Marchador",
      "HarasAI Vision IA Ilimitado",
      "Vitrine de Leilões Públicos",
      "Instalações & Piquetes Avançados",
      "Suporte Prioritário VIP 24/7",
    ],
  },
}

// Configuração de Atualização Obrigatória do App
export interface ConfigAtualizacaoApp {
  versaoAppInstalada: string
  versaoMinimaObrigatoria: string
  bloquearVersaoAntiga: boolean
  linkDownloadApk: string
  notasVersao: string
  dataPublicacao: string
}

export const CONFIG_ATUALIZACAO_PADRAO: ConfigAtualizacaoApp = {
  versaoAppInstalada: "2.1.0",
  versaoMinimaObrigatoria: "2.0.0",
  bloquearVersaoAntiga: false,
  linkDownloadApk: "/app-release.apk",
  notasVersao: "Melhorias de desempenho, galeria progressiva de manejo e Haras Vision IA integrado.",
  dataPublicacao: "2026-08-19",
}

export function verificarAcessoRecursoPlano(
  plano: PlanoSaaS,
  modulo: "reproducao" | "financeiro" | "leilao" | "contratos" | "scanner_ilimitado" | "equinos_cadastro",
  totalEquinosAtuais: number = 0
): { permitido: boolean; motivo?: string } {
  const info = PLANOS_DISPONIVEIS[plano]

  if (modulo === "equinos_cadastro") {
    if (totalEquinosAtuais >= info.limiteEquinos) {
      return {
        permitido: false,
        motivo: `Seu ${info.nome} atingiu o limite de ${info.limiteEquinos} equinos. Faça o upgrade para expandir seu plantel.`,
      }
    }
    return { permitido: true }
  }

  if (plano === "potro") {
    if (modulo === "reproducao" || modulo === "contratos" || modulo === "leilao") {
      return {
        permitido: false,
        motivo: `O módulo de ${modulo.toUpperCase()} está disponível a partir do Plano Marchador.`,
      }
    }
  }

  return { permitido: true }
}

// ---------- Guia de Plantas Tóxicas ----------

export interface PlantaToxica {
  id: string
  nomePopular: string
  nomeCientifico: string
  risco: "mortal" | "alto" | "medio" | "segura"
  categoria: string
  sintomas: string[]
  primeirosSocorros: string
  acaoManejo: string
  imagemExemplo: string
  descricao: string
}

// ---------- Registro de Saídas, Vendas e Óbitos ----------

export type MotivoSaida = "venda" | "obito" | "cedido" | "transferencia" | "outro"

export interface RegistroSaida {
  id: string
  harasId: string
  equinoId: string
  equinoNome: string
  motivo: MotivoSaida
  data: string // YYYY-MM-DD
  // Venda / Transferência
  compradorNome?: string
  compradorContato?: string
  compradorDocumento?: string
  valorVenda?: number
  formaPagamento?: string
  destinoHaras?: string
  // Óbito / Falecimento
  causaMortis?: string
  laudoVeterinario?: string
  veterinarioResponsavel?: string
  localSepultamento?: string
  // Geral
  observacoes?: string
  comprovanteDataUrl?: string
  createdAt: string
}

// ---------- Galeria Multimídia do Haras ----------

export type CategoriaGaleria = "geral" | "garanhaocavalos" | "potros" | "pistas" | "instalacoes"

export interface ItemGaleria {
  id: string
  harasId: string
  equinoId?: string
  equinoNome?: string
  titulo: string
  descricao?: string
  categoria: CategoriaGaleria
  tipo: "foto" | "video"
  dataUrl: string
  destaque: boolean
  createdAt: string
}

// ---------- Clientes & Alunos do Haras ----------

export type TipoCliente = "pensionista" | "aluno" | "comprador" | "outro"

export interface ClienteHaras {
  id: string
  harasId: string
  nome: string
  documento?: string // CPF ou CNPJ
  telefone: string
  email?: string
  tipo: TipoCliente
  // Para pensionistas
  cavalosHospedados?: string[] // IDs dos equinos ou nomes
  numeroBaias?: number
  // Financeiro
  valorMensalidade?: number
  diaVencimento?: number // 1 a 31
  status: "ativo" | "inadimplente" | "inativo"
  // Para alunos
  modalidade?: string // ex: Marcha, Salto, Tambor, Iniciante
  instrutor?: string
  diasSemana?: string[] // ex: ['Seg', 'Qua', 'Sex']
  // Geral
  endereco?: string
  observacoes?: string
  createdAt: string
}

// ---------- Contratos Jurídicos do Haras ----------

export type TipoContrato = "venda" | "hospedagem" | "cobertura" | "aulas"

export interface ContratoGerado {
  id: string
  harasId: string
  tipo: TipoContrato
  titulo: string
  clienteNome: string
  clienteDocumento?: string
  equinoNome?: string
  valor?: number
  formaPagamento?: string
  conteudoHtml: string
  dataGeracao: string
}

// ---------- Biotecnologia & Transferência de Embriões (TE) ----------

export interface EmbriaoTE {
  id: string
  harasId: string
  doadoraId: string
  doadoraNome: string
  garanhaoId: string
  garanhaoNome: string
  receptoraId?: string
  receptoraNome?: string
  dataColeta: string // YYYY-MM-DD
  dataInovulacao?: string
  qualidadeEmbriao: "Grau 1 (Excelente)" | "Grau 2 (Bom)" | "Grau 3 (Regular)" | "Degenerado"
  status: "coletado" | "transferido" | "congelado" | "confirmada" | "reabsorvido"
  veterinarioResponsavel?: string
  observacoes?: string
  createdAt: string
}

// ---------- Neonatologia & Potros Nascidos ----------

export interface PotroNeonatologia {
  id: string
  harasId: string
  nome: string
  dataNascimento: string
  horaNascimento?: string
  maeNome: string
  paiNome?: string
  receptoraNome?: string
  sexo: Sexo
  pelagem: string
  pesoNascimentoKg?: number
  tempoPrimeiraMamadaMin?: number
  ingestaoColostroAdequada: boolean
  curaUmbigoRealizada: boolean
  escoreApgar?: number // 1 a 10
  observacoes?: string
  createdAt: string
}

// ---------- Mapa de Instalações: Cocheiras / Baias & Piquetes ----------

export interface BaiaInstalacao {
  id: string
  harasId: string
  numero: string // Ex: "Baia 01", "Cocheira A-02"
  setor: string // Ex: "Pavilhão Garanhões", "Maternidade", "Pavilhão Principal"
  equinoId?: string
  equinoNome?: string
  statusLimpeza: "limpa" | "em_uso" | "manutencao"
  dimensoes?: string // Ex: "4x4m"
  observacoes?: string
}

export interface PiqueteInstalacao {
  id: string
  harasId: string
  nome: string // Ex: "Piquete 01 - Tifton"
  tipoCapim: string // Ex: "Tifton 85", "Coastcross"
  status: "em_uso" | "descanso" | "recuperacao"
  animaisAlocados?: string[]
  diasDescansoRestantes?: number
  areaHectares?: number
}

// ---------- Catálogo & Vitrine de Leilões Públicos ----------

export interface LoteLeilao {
  id: string
  harasId: string
  numeroLote: number
  equinoId: string
  equinoNome: string
  raca: string
  pelagem: string
  nascimento?: string
  paiNome?: string
  maeNome?: string
  lanceInicial: number
  condicoesPagamento: string // Ex: "30 parcelas (2+2+26)"
  videoUrl?: string
  fotoPrincipalUrl?: string
  descricaoComercial: string
  destaque: boolean
  status: "aberto" | "arrematado" | "reservado"
}

// ---------- Módulo de Tarefas, Manejo & Produtividade ----------

export type CategoriaTarefa = "equino" | "sitio_animais" | "manutencao_infra"
export type TurnoTarefa = "manha" | "tarde" | "noite"
export type PrioridadeTarefa = "rotina" | "alta" | "urgente_saude"
export type StatusTarefa = "pendente" | "em_andamento" | "concluida"

export interface TarefaHaras {
  id: string
  harasId: string
  titulo: string
  descricao?: string
  categoria: CategoriaTarefa
  turno: TurnoTarefa
  prioridade: PrioridadeTarefa
  status: StatusTarefa
  horarioProgramado?: string // Ex: "08:00"
  dataProgramada: string // yyyy-mm-dd
  equinoId?: string
  equinoNome?: string
  baiaId?: string
  baiaNome?: string
  responsavelNome: string
  iniciadoEm?: string // ISO timestamp de quando clicou em [▶ Iniciar]
  concluidoEm?: string // ISO timestamp de quando clicou em [⏹ Concluir]
  tempoGastoMinutos?: number
  fotoComprovanteUrl?: string
  fotosComprovantes?: string[] // Múltiplas fotos tiradas durante a tarefa
  videosComprovantes?: string[] // Vídeos curtos opcionais gravados durante a tarefa
  lembreteMinutosAntes?: number // Padrão 15 min
  observacoesExecucao?: string
  createdAt: string
}

export const CATEGORIA_TAREFA_LABEL: Record<CategoriaTarefa, string> = {
  equino: "🐴 Manejo Equino",
  sitio_animais: "🌾 Animais do Sítio",
  manutencao_infra: "🏡 Manutenção & Sítio",
}

export const TURNO_TAREFA_LABEL: Record<TurnoTarefa, string> = {
  manha: "🌅 Manhã",
  tarde: "☀️ Tarde",
  noite: "🌙 Noite",
}

export const PRIORIDADE_TAREFA_LABEL: Record<PrioridadeTarefa, string> = {
  rotina: "Rotina",
  alta: "Alta",
  urgente_saude: "Urgente / Saúde",
}
