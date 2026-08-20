import React, { createContext, useContext, useEffect, useState } from "react"
import { gerarId, hojeIso, limparTudo, resetDbConnections, somarDias } from "./db"
import { carregarDadosExemplo, carregarDadosModulos } from "./dados-exemplo"
import type { CargoMembro, HarasTenant, PermissaoModulo, PlanoSaaS, StatusAssinatura, Usuario } from "./types"

interface AuthContextType {
  usuario: Usuario | null
  haras: HarasTenant | null
  isSuperAdmin: boolean
  isOwner: boolean
  isImpersonating: boolean
  isVisitanteDemo: boolean
  originalSuperAdmin: Usuario | null
  carregandoAuth: boolean
  todosOsHaras: HarasTenant[]
  todosOsUsuarios: Usuario[]
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>
  registerHaras: (params: {
    nomeHaras: string
    responsavel: string
    email: string
    senha: string
    telefone?: string
    cidadeUf?: string
    plano: PlanoSaaS
  }) => Promise<{ success: boolean; error?: string }>
  recuperarSenha: (email: string, novaSenha: string) => Promise<{ success: boolean; error?: string }>
  entrarComoVisitanteDemo: () => Promise<{ success: boolean }>
  logout: () => void
  impersonateHaras: (harasId: string) => void
  stopImpersonating: () => void
  atualizarHaras: (dados: Partial<HarasTenant>) => void
  atualizarStatusAssinatura: (harasId: string, status: StatusAssinatura, plano: PlanoSaaS, diasExpiracao?: number) => void
  criarNovoHarasAdmin: (params: {
    nomeHaras: string
    responsavel: string
    email: string
    telefone?: string
    cidadeUf?: string
    plano: PlanoSaaS
    status: StatusAssinatura
    diasValidade: number
  }) => Promise<{ success: boolean; error?: string }>
  excluirHarasAdmin: (harasId: string) => void
  criarMembroEquipe: (params: {
    nome: string
    email: string
    senha: string
    cargo: CargoMembro
    permissoes: PermissaoModulo[]
    telefone?: string
  }) => Promise<{ success: boolean; error?: string }>
  removerMembroEquipe: (membroId: string) => void
  temPermissao: (modulo: PermissaoModulo) => boolean
}

const STORAGE_HARAS_LIST = "haras_cloud_tenants_v1"
const STORAGE_USERS_LIST = "haras_cloud_users_v1"
const STORAGE_CURRENT_USER = "haras_cloud_auth_user_v1"
const STORAGE_CURRENT_HARAS = "haras_cloud_auth_haras_v1"
const STORAGE_ORIGINAL_ADMIN = "haras_cloud_impersonate_admin_v1"

// Haras inicial padrão: Haras Cardoso
const HARAS_PADRAO_CARDOSO: HarasTenant = {
  id: "haras-cardoso-master",
  nomeHaras: "Haras Cardoso",
  subtitulo: "Gestão & Genética Equina de Alta Performance",
  responsavel: "Fênix Moura",
  email: "contato@harascardoso.com.br",
  telefone: "(11) 98765-4321",
  cidadeUf: "Campinas - SP",
  plano: "imperial",
  ciclo: "anual",
  statusAssinatura: "ativo",
  dataInicio: "2024-01-01",
  dataExpiracao: "2030-12-31",
  limiteEquinos: 9999,
  limiteUsuarios: 9999,
  createdAt: "2024-01-01T00:00:00.000Z",
}

const HARAS_DEMO_CLIENTE: HarasTenant = {
  id: "haras-primavera-demo",
  nomeHaras: "Haras Vale da Primavera",
  subtitulo: "Criatório Mangalarga Marchador & Pampa",
  responsavel: "Carlos Eduardo Silva",
  email: "contato@harasprimavera.com",
  telefone: "(31) 99123-4567",
  cidadeUf: "Belo Horizonte - MG",
  plano: "marchador",
  ciclo: "mensal",
  statusAssinatura: "trial",
  dataInicio: hojeIso(),
  dataExpiracao: somarDias(hojeIso(), 7),
  limiteEquinos: 35,
  limiteUsuarios: 6,
  createdAt: new Date().toISOString(),
}

// Contas iniciais de demonstração
const USUARIOS_INICIAIS: Usuario[] = [
  {
    id: "user-superadmin-01",
    nome: "Administrador Master",
    email: "admin@harascloud.com",
    senha: "admin",
    role: "superadmin",
    harasId: HARAS_PADRAO_CARDOSO.id,
    cargo: "gerente",
    permissoes: ["equinos", "saude", "reproducao", "alimentacao", "financeiro", "agenda", "equipe", "configuracoes", "plantas"],
    ativo: true,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "user-dono-cardoso",
    nome: "Fênix Moura (Dono)",
    email: "dono@harascardoso.com.br",
    senha: "123",
    role: "tenant_owner",
    harasId: HARAS_PADRAO_CARDOSO.id,
    cargo: "gerente",
    permissoes: ["equinos", "saude", "reproducao", "alimentacao", "financeiro", "agenda", "equipe", "configuracoes", "plantas"],
    ativo: true,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "user-vet-cardoso",
    nome: "Dra. Camila Nogueira",
    email: "veterinaria@harascardoso.com.br",
    senha: "123",
    role: "tenant_member",
    harasId: HARAS_PADRAO_CARDOSO.id,
    cargo: "veterinario",
    permissoes: ["equinos", "saude", "reproducao", "agenda", "plantas"],
    telefone: "(11) 98888-7777",
    ativo: true,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "user-dono-primavera",
    nome: "Carlos Eduardo",
    email: "carlos@harasprimavera.com",
    senha: "123",
    role: "tenant_owner",
    harasId: HARAS_DEMO_CLIENTE.id,
    cargo: "gerente",
    permissoes: ["equinos", "saude", "reproducao", "alimentacao", "financeiro", "agenda", "equipe", "configuracoes", "plantas"],
    ativo: true,
    createdAt: new Date().toISOString(),
  },
]

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [todosOsHaras, setTodosOsHaras] = useState<HarasTenant[]>(() => {
    const raw = localStorage.getItem(STORAGE_HARAS_LIST)
    if (raw) {
      try {
        return JSON.parse(raw)
      } catch {
        // fallback
      }
    }
    return [HARAS_PADRAO_CARDOSO, HARAS_DEMO_CLIENTE]
  })

  const [todosOsUsuarios, setTodosOsUsuarios] = useState<Usuario[]>(() => {
    const raw = localStorage.getItem(STORAGE_USERS_LIST)
    if (raw) {
      try {
        return JSON.parse(raw)
      } catch {
        // fallback
      }
    }
    return USUARIOS_INICIAIS
  })

  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER)
    if (raw) {
      try {
        return JSON.parse(raw)
      } catch {
        // fallback
      }
    }
    // Inicialmente sem usuário logado para exigir login real
    return null
  })

  const [haras, setHaras] = useState<HarasTenant | null>(() => {
    const raw = localStorage.getItem(STORAGE_CURRENT_HARAS)
    if (raw) {
      try {
        return JSON.parse(raw)
      } catch {
        // fallback
      }
    }
    return null
  })

  const [originalSuperAdmin, setOriginalSuperAdmin] = useState<Usuario | null>(() => {
    const raw = localStorage.getItem(STORAGE_ORIGINAL_ADMIN)
    if (raw) {
      try {
        return JSON.parse(raw)
      } catch {
        // fallback
      }
    }
    return null
  })

  const [carregandoAuth, setCarregandoAuth] = useState(false)

  // Sincroniza persistência de dados
  useEffect(() => {
    localStorage.setItem(STORAGE_HARAS_LIST, JSON.stringify(todosOsHaras))
  }, [todosOsHaras])

  useEffect(() => {
    localStorage.setItem(STORAGE_USERS_LIST, JSON.stringify(todosOsUsuarios))
  }, [todosOsUsuarios])

  useEffect(() => {
    if (usuario) {
      localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(usuario))
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER)
    }
  }, [usuario])

  useEffect(() => {
    if (haras) {
      localStorage.setItem(STORAGE_CURRENT_HARAS, JSON.stringify(haras))
    } else {
      localStorage.removeItem(STORAGE_CURRENT_HARAS)
    }
  }, [haras])

  useEffect(() => {
    if (originalSuperAdmin) {
      localStorage.setItem(STORAGE_ORIGINAL_ADMIN, JSON.stringify(originalSuperAdmin))
    } else {
      localStorage.removeItem(STORAGE_ORIGINAL_ADMIN)
    }
  }, [originalSuperAdmin])

  const isSuperAdmin = usuario?.role === "superadmin" || originalSuperAdmin !== null
  const isOwner = usuario?.role === "tenant_owner" || isSuperAdmin
  const isImpersonating = originalSuperAdmin !== null

  // Validação de permissões
  function temPermissao(modulo: PermissaoModulo): boolean {
    if (!usuario) return false
    if (usuario.role === "superadmin" || usuario.role === "tenant_owner") return true
    return usuario.permissoes?.includes(modulo) ?? false
  }

  // Login
  async function login(email: string, senha: string): Promise<{ success: boolean; error?: string }> {
    setCarregandoAuth(true)
    await new Promise((r) => setTimeout(r, 400)) // Simulação de resposta rápida

    const userMatch = todosOsUsuarios.find(
      (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
    )

    if (!userMatch) {
      setCarregandoAuth(false)
      return { success: false, error: "E-mail não cadastrado na plataforma." }
    }

    if (userMatch.senha && userMatch.senha !== senha) {
      setCarregandoAuth(false)
      return { success: false, error: "Senha incorreta. Verifique suas credenciais." }
    }

    if (!userMatch.ativo) {
      setCarregandoAuth(false)
      return { success: false, error: "Este usuário está temporariamente desativado. Fale com o dono do Haras." }
    }

    const harasMatch = todosOsHaras.find((h) => h.id === userMatch.harasId) || HARAS_PADRAO_CARDOSO

    setUsuario(userMatch)
    setHaras(harasMatch)
    resetDbConnections()
    setOriginalSuperAdmin(null)
    setCarregandoAuth(false)
    return { success: true }
  }

  // Registro de Novo Haras (Checkout / Trial)
  async function registerHaras(params: {
    nomeHaras: string
    responsavel: string
    email: string
    senha: string
    telefone?: string
    cidadeUf?: string
    plano: PlanoSaaS
  }): Promise<{ success: boolean; error?: string }> {
    setCarregandoAuth(true)
    await new Promise((r) => setTimeout(r, 500))

    const jaExiste = todosOsUsuarios.some(
      (u) => u.email.trim().toLowerCase() === params.email.trim().toLowerCase()
    )
    if (jaExiste) {
      setCarregandoAuth(false)
      return { success: false, error: "Este e-mail já está cadastrado. Faça login ou use outro e-mail." }
    }

    const novoHarasId = `haras-${gerarId().slice(0, 8)}`
    const novoHaras: HarasTenant = {
      id: novoHarasId,
      nomeHaras: params.nomeHaras.trim(),
      responsavel: params.responsavel.trim(),
      email: params.email.trim().toLowerCase(),
      telefone: params.telefone?.trim(),
      cidadeUf: params.cidadeUf?.trim(),
      plano: params.plano,
      ciclo: "mensal",
      statusAssinatura: "trial",
      dataInicio: hojeIso(),
      dataExpiracao: somarDias(hojeIso(), 7),
      limiteEquinos: params.plano === "potro" ? 10 : params.plano === "marchador" ? 35 : 9999,
      limiteUsuarios: params.plano === "potro" ? 2 : params.plano === "marchador" ? 6 : 9999,
      createdAt: new Date().toISOString(),
    }

    const novoUsuarioDono: Usuario = {
      id: `user-${gerarId().slice(0, 8)}`,
      nome: params.responsavel.trim(),
      email: params.email.trim().toLowerCase(),
      senha: params.senha,
      role: "tenant_owner",
      harasId: novoHarasId,
      cargo: "gerente",
      permissoes: ["equinos", "saude", "reproducao", "alimentacao", "financeiro", "agenda", "equipe", "configuracoes", "plantas"],
      telefone: params.telefone?.trim(),
      ativo: true,
      createdAt: new Date().toISOString(),
    }

    setTodosOsHaras((prev) => [novoHaras, ...prev])
    setTodosOsUsuarios((prev) => [novoUsuarioDono, ...prev])
    setHaras(novoHaras)
    setUsuario(novoUsuarioDono)
    resetDbConnections()
    setOriginalSuperAdmin(null)
    setCarregandoAuth(false)

    return { success: true }
  }

  // Logout
  function logout() {
    setUsuario(null)
    setHaras(null)
    resetDbConnections()
    setOriginalSuperAdmin(null)
  }

  // Modo Suporte: Entrar no Haras do cliente com 1 clique (Impersonation)
  function impersonateHaras(harasId: string) {
    const alvoHaras = todosOsHaras.find((h) => h.id === harasId)
    if (!alvoHaras) return

    // Salva o admin original para poder voltar
    if (!originalSuperAdmin && usuario) {
      setOriginalSuperAdmin(usuario)
    }

    // Acha o dono do haras alvo para assumir a identidade dele
    const donoAlvo = todosOsUsuarios.find((u) => u.harasId === harasId && u.role === "tenant_owner") || {
      id: `temp-${harasId}`,
      nome: `Suporte [${alvoHaras.responsavel}]`,
      email: alvoHaras.email,
      role: "tenant_owner" as const,
      harasId: alvoHaras.id,
      cargo: "gerente" as const,
      permissoes: ["equinos", "saude", "reproducao", "alimentacao", "financeiro", "agenda", "equipe", "configuracoes", "plantas"] as PermissaoModulo[],
      ativo: true,
      createdAt: hojeIso(),
    }

    setHaras(alvoHaras)
    setUsuario(donoAlvo)
  }

  // Sair do Modo Suporte e voltar ao SuperAdmin
  function stopImpersonating() {
    if (originalSuperAdmin) {
      setUsuario(originalSuperAdmin)
      const adminHaras = todosOsHaras.find((h) => h.id === originalSuperAdmin.harasId) || HARAS_PADRAO_CARDOSO
      setHaras(adminHaras)
      setOriginalSuperAdmin(null)
    }
  }

  // Atualizar dados do Haras
  function atualizarHaras(dados: Partial<HarasTenant>) {
    if (!haras) return
    const atualizado = { ...haras, ...dados }
    setHaras(atualizado)
    setTodosOsHaras((prev) => prev.map((h) => (h.id === atualizado.id ? atualizado : h)))
  }

  // Atualizar status de assinatura (SuperAdmin)
  function atualizarStatusAssinatura(
    harasId: string,
    status: StatusAssinatura,
    plano: PlanoSaaS,
    diasExpiracao: number = 30
  ) {
    setTodosOsHaras((prev) =>
      prev.map((h) => {
        if (h.id === harasId) {
          return {
            ...h,
            statusAssinatura: status,
            plano,
            dataExpiracao: somarDias(hojeIso(), diasExpiracao),
            limiteEquinos: plano === "potro" ? 10 : plano === "marchador" ? 35 : 9999,
            limiteUsuarios: plano === "potro" ? 2 : plano === "marchador" ? 6 : 9999,
          }
        }
        return h
      })
    )
    if (haras?.id === harasId) {
      setHaras((prev) =>
        prev
          ? {
              ...prev,
              statusAssinatura: status,
              plano,
              dataExpiracao: somarDias(hojeIso(), diasExpiracao),
              limiteEquinos: plano === "potro" ? 10 : plano === "marchador" ? 35 : 9999,
              limiteUsuarios: plano === "potro" ? 2 : plano === "marchador" ? 6 : 9999,
            }
          : null
      )
    }
  }

  // Criar membro da equipe (Dono do Haras)
  async function criarMembroEquipe(params: {
    nome: string
    email: string
    senha: string
    cargo: CargoMembro
    permissoes: PermissaoModulo[]
    telefone?: string
  }): Promise<{ success: boolean; error?: string }> {
    if (!haras) return { success: false, error: "Haras não identificado." }

    const jaExiste = todosOsUsuarios.some(
      (u) => u.email.trim().toLowerCase() === params.email.trim().toLowerCase()
    )
    if (jaExiste) {
      return { success: false, error: "Este e-mail já pertence a outro usuário na plataforma." }
    }

    const novoMembro: Usuario = {
      id: `user-${gerarId().slice(0, 8)}`,
      nome: params.nome.trim(),
      email: params.email.trim().toLowerCase(),
      senha: params.senha,
      role: "tenant_member",
      harasId: haras.id,
      cargo: params.cargo,
      permissoes: params.permissoes,
      telefone: params.telefone?.trim(),
      ativo: true,
      createdAt: new Date().toISOString(),
    }

    setTodosOsUsuarios((prev) => [...prev, novoMembro])
    return { success: true }
  }

  // Recuperação de Senha
  async function recuperarSenha(email: string, novaSenha: string): Promise<{ success: boolean; error?: string }> {
    setCarregandoAuth(true)
    await new Promise((r) => setTimeout(r, 600))

    const idx = todosOsUsuarios.findIndex((u) => u.email.trim().toLowerCase() === email.trim().toLowerCase())
    if (idx < 0) {
      setCarregandoAuth(false)
      return { success: false, error: "Nenhuma conta encontrada com este e-mail." }
    }

    const atualizado: Usuario = {
      ...todosOsUsuarios[idx],
      senha: novaSenha,
    }

    const novaLista = [...todosOsUsuarios]
    novaLista[idx] = atualizado
    setTodosOsUsuarios(novaLista)
    localStorage.setItem(STORAGE_USERS_LIST, JSON.stringify(novaLista))
    setCarregandoAuth(false)
    return { success: true }
  }

  // Entrar no Modo Visitante / Demonstração Interativa
  async function entrarComoVisitanteDemo(): Promise<{ success: boolean }> {
    setCarregandoAuth(true)
    await new Promise((r) => setTimeout(r, 400))

    const usuarioVisitante: Usuario = {
      id: "user-visitante-demo",
      nome: "Visitante (Modo Demonstração)",
      email: "visitante@demo.harascloud.com.br",
      role: "visitante",
      harasId: HARAS_PADRAO_CARDOSO.id,
      cargo: "visitante",
      permissoes: ["equinos", "saude", "reproducao", "alimentacao", "financeiro", "agenda", "equipe", "configuracoes", "plantas"],
      ativo: true,
      createdAt: new Date().toISOString(),
    }

    setUsuario(usuarioVisitante)
    setHaras(HARAS_PADRAO_CARDOSO)
    resetDbConnections()
    try {
      await carregarDadosExemplo(false)
      await carregarDadosModulos()
    } catch {
      // ignore
    }
    setOriginalSuperAdmin(null)
    setCarregandoAuth(false)
    return { success: true }
  }

  // Criar Novo Haras Manualmente (Painel SuperAdmin)
  async function criarNovoHarasAdmin(params: {
    nomeHaras: string
    responsavel: string
    email: string
    telefone?: string
    cidadeUf?: string
    plano: PlanoSaaS
    status: StatusAssinatura
    diasValidade: number
  }): Promise<{ success: boolean; error?: string }> {
    const novoHarasId = `haras-${gerarId().slice(0, 8)}`
    const novoHaras: HarasTenant = {
      id: novoHarasId,
      nomeHaras: params.nomeHaras.trim(),
      responsavel: params.responsavel.trim(),
      email: params.email.trim().toLowerCase(),
      telefone: params.telefone?.trim(),
      cidadeUf: params.cidadeUf?.trim(),
      plano: params.plano,
      ciclo: "mensal",
      statusAssinatura: params.status,
      dataInicio: hojeIso(),
      dataExpiracao: somarDias(hojeIso(), params.diasValidade),
      limiteEquinos: params.plano === "potro" ? 10 : params.plano === "marchador" ? 35 : 9999,
      limiteUsuarios: params.plano === "potro" ? 2 : params.plano === "marchador" ? 6 : 9999,
      createdAt: new Date().toISOString(),
    }

    const novoUsuario: Usuario = {
      id: `user-${gerarId().slice(0, 8)}`,
      nome: params.responsavel.trim(),
      email: params.email.trim().toLowerCase(),
      senha: "123",
      role: "tenant_owner",
      harasId: novoHarasId,
      cargo: "gerente",
      permissoes: ["equinos", "saude", "reproducao", "alimentacao", "financeiro", "agenda", "equipe", "configuracoes", "plantas"],
      telefone: params.telefone?.trim(),
      ativo: true,
      createdAt: new Date().toISOString(),
    }

    setTodosOsHaras((prev) => [novoHaras, ...prev])
    setTodosOsUsuarios((prev) => [novoUsuario, ...prev])
    return { success: true }
  }

  // Excluir Haras e seus Usuários (Painel SuperAdmin)
  function excluirHarasAdmin(harasId: string) {
    setTodosOsHaras((prev) => prev.filter((h) => h.id !== harasId))
    setTodosOsUsuarios((prev) => prev.filter((u) => u.harasId !== harasId))
  }

  // Remover membro da equipe
  function removerMembroEquipe(membroId: string) {
    setTodosOsUsuarios((prev) => prev.filter((u) => u.id !== membroId))
  }

  const isVisitanteDemo = usuario?.role === "visitante"

  return (
    <AuthContext.Provider
      value={{
        usuario,
        haras,
        isSuperAdmin,
        isOwner,
        isImpersonating,
        isVisitanteDemo,
        originalSuperAdmin,
        carregandoAuth,
        todosOsHaras,
        todosOsUsuarios,
        login,
        registerHaras,
        recuperarSenha,
        entrarComoVisitanteDemo,
        logout,
        impersonateHaras,
        stopImpersonating,
        atualizarHaras,
        atualizarStatusAssinatura,
        criarNovoHarasAdmin,
        excluirHarasAdmin,
        criarMembroEquipe,
        removerMembroEquipe,
        temPermissao,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return ctx
}
