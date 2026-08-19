import {
  CalendarDays,
  CheckCircle2,
  FileSignature,
  Gavel,
  Heart,
  HeartPulse,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  Leaf,
  Settings,
  UserCheck,
  Users,
  Wallet,
  Wheat,
} from "lucide-react"
import { HorseIcon } from "@/components/icons/HorseIcon"
import type { ComponentType } from "react"

export interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  end?: boolean
}

export interface NavSection {
  titulo: string
  itens: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    titulo: "VISÃO GERAL",
    itens: [
      { to: "/app", label: "Início", icon: LayoutDashboard, end: true },
      { to: "/leilao", label: "Leilão & Vitrine", icon: Gavel },
      { to: "/galeria", label: "Galeria Haras", icon: ImageIcon },
    ],
  },
  {
    titulo: "PLANTEL & BIOTECNOLOGIA",
    itens: [
      { to: "/equinos", label: "Plantel de Equinos", icon: HorseIcon },
      { to: "/reproducao", label: "Reprodução & TE", icon: Heart },
      { to: "/saude", label: "Saúde & Vacinas", icon: HeartPulse },
      { to: "/alimentacao", label: "Alimentação", icon: Wheat },
      { to: "/scanner-plantas", label: "🌿 Scanner IA", icon: Leaf },
    ],
  },
  {
    titulo: "ESTRUTURA & NEGÓCIOS",
    itens: [
      { to: "/tarefas", label: "Manejo & Tarefas", icon: CheckCircle2 },
      { to: "/instalacoes", label: "Baias & Pastos", icon: Home },
      { to: "/clientes", label: "Clientes & Alunos", icon: UserCheck },
      { to: "/contratos", label: "Contratos A4", icon: FileSignature },
      { to: "/financeiro", label: "Financeiro & Recibos", icon: Wallet },
      { to: "/agenda", label: "Agenda & Eventos", icon: CalendarDays },
    ],
  },
  {
    titulo: "GESTÃO & SISTEMA",
    itens: [
      { to: "/equipe", label: "Minha Equipe", icon: Users },
      { to: "/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
]

// Flattened para compatibilidade onde necessário
export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.itens)
