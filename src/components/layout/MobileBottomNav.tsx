import { useState, type TouchEvent } from "react"
import { NavLink, useLocation, Link } from "react-router-dom"
import {
  CalendarDays,
  FileSignature,
  Gavel,
  Heart,
  HeartPulse,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  Leaf,
  Menu,
  Moon,
  Plus,
  Settings,
  Sun,
  UserCheck,
  Users,
  Wallet,
  Wheat,
} from "lucide-react"
import { useTheme } from "next-themes"
import { HorseIcon } from "@/components/icons/HorseIcon"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const PRINCIPAIS = [
  { to: "/app", label: "Início", icon: LayoutDashboard, end: true },
  { to: "/equinos", label: "Equinos", icon: HorseIcon },
  { to: "/saude", label: "Saúde", icon: HeartPulse },
  { to: "/alimentacao", label: "Manejo", icon: Wheat },
  { to: "/financeiro", label: "Finanças", icon: Wallet },
]

const EXTRAS = [
  {
    to: "/leilao",
    label: "Leilão & Vitrine de Vendas",
    descricao: "Catálogo de equinos com lances no WhatsApp",
    icon: Gavel,
    color: "bg-amber-500/15 text-[#d9b978]",
  },
  {
    to: "/instalacoes",
    label: "Baias & Piquetes",
    descricao: "Mapa visual de cocheiras e rotação de pastagem",
    icon: Home,
    color: "bg-emerald-500/15 text-emerald-500",
  },
  {
    to: "/clientes",
    label: "Clientes & Alunos",
    descricao: "Proprietários de baias e alunos da escola",
    icon: UserCheck,
    color: "bg-sky-500/15 text-sky-500",
  },
  {
    to: "/contratos",
    label: "Gerador de Contratos A4",
    descricao: "Contratos de venda, hospedagem e aulas",
    icon: FileSignature,
    color: "bg-purple-500/15 text-purple-500",
  },
  {
    to: "/galeria",
    label: "Galeria do Haras",
    descricao: "Mural de fotos e vídeos dos animais e pistas",
    icon: ImageIcon,
    color: "bg-[#d9b978]/20 text-[#d9b978]",
  },
  {
    to: "/scanner-plantas",
    label: "🌿 Scanner IA de Plantas",
    descricao: "Identificar plantas tóxicas no pasto com foto",
    icon: Leaf,
    color: "bg-emerald-500/15 text-emerald-500",
  },
  {
    to: "/equipe",
    label: "Minha Equipe",
    descricao: "Cadastrar tratadores, veterinários e gerentes",
    icon: Users,
    color: "bg-sky-500/15 text-sky-500",
  },
  {
    to: "/reproducao",
    label: "Reprodução & Coberturas",
    descricao: "Gestações, partos e controle de coberturas",
    icon: Heart,
    color: "bg-rose-500/15 text-rose-500",
  },
  {
    to: "/agenda",
    label: "Agenda de Eventos",
    descricao: "Compromissos, visitas, provas e consultas",
    icon: CalendarDays,
    color: "bg-amber-500/15 text-amber-500",
  },
  {
    to: "/configuracoes",
    label: "Configurações & Backup",
    descricao: "Exportar dados, ajustar haras e preferências",
    icon: Settings,
    color: "bg-stone-500/15 text-stone-500",
  },
]

export function MobileBottomNav() {
  const [sheetAberto, setSheetAberto] = useState(false)
  const [startY, setStartY] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState<number>(0)
  const [isDragging, setIsDragging] = useState(false)
  const location = useLocation()
  const { resolvedTheme, setTheme } = useTheme()
  const escuro = resolvedTheme === "dark"

  const estaEmExtra = EXTRAS.some((e) => location.pathname.startsWith(e.to))

  function onTouchStartHandle(e: TouchEvent) {
    setStartY(e.touches[0].clientY)
    setIsDragging(true)
  }

  function onTouchMoveHandle(e: TouchEvent) {
    if (startY === null) return
    const diff = e.touches[0].clientY - startY
    if (diff > 0) {
      setDragOffset(diff)
    }
  }

  function onTouchEndHandle() {
    setIsDragging(false)
    if (dragOffset > 50) {
      setSheetAberto(false)
    }
    setStartY(null)
    setDragOffset(0)
  }

  return (
    <>
      <nav
        aria-label="Navegação móvel"
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center pointer-events-none px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
      >
        <div className="flex h-[62px] w-full max-w-md items-center justify-between rounded-[2rem] border border-white/20 dark:border-stone-800/80 bg-white/90 dark:bg-stone-950/90 p-1 shadow-2xl shadow-black/25 backdrop-blur-2xl pointer-events-auto">
          {PRINCIPAIS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSheetAberto(false)}
              className={({ isActive }) =>
                cn(
                  "flex h-full flex-1 basis-0 min-w-0 flex-col items-center justify-center rounded-[1.3rem] text-[10px] font-semibold transition-colors duration-150 active:scale-95",
                  isActive
                    ? "bg-[#143129] text-[#d9b978] dark:bg-[#143129] dark:text-[#d9b978] shadow-xs font-bold"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100",
                )
              }
            >
              <item.icon className="size-4.5 shrink-0" />
              <span className="truncate max-w-full leading-none mt-1 tracking-tight">{item.label}</span>
            </NavLink>
          ))}

          {/* Botão "Mais" / Menu iOS */}
          <button
            type="button"
            onClick={() => setSheetAberto(true)}
            className={cn(
              "flex h-full flex-1 basis-0 min-w-0 flex-col items-center justify-center rounded-[1.3rem] text-[10px] font-semibold transition-colors duration-150 active:scale-95",
              estaEmExtra || sheetAberto
                ? "bg-[#143129] text-[#d9b978] dark:bg-[#143129] dark:text-[#d9b978] shadow-xs font-bold"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100",
            )}
            aria-label="Abrir mais opções do menu"
          >
            <Menu className="size-4.5 shrink-0" />
            <span className="truncate max-w-full leading-none mt-1 tracking-tight">Mais</span>
          </button>
        </div>
      </nav>

      {/* Sheet iOS Estilo Gaveta Inferior (Arrastável, sem X) */}
      <Sheet open={sheetAberto} onOpenChange={(aberto) => {
        setSheetAberto(aberto)
        if (!aberto) setDragOffset(0)
      }}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          style={{
            transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
            transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
          className="rounded-t-[2.5rem] border-t border-white/20 bg-stone-50/98 dark:bg-stone-900/98 p-5 pb-8 backdrop-blur-2xl max-h-[85vh] overflow-y-auto"
        >
          {/* Barra de arraste (handle estilo iPhone que fecha puxando) */}
          <div
            className="mx-auto -mt-2 mb-3 flex w-full flex-col items-center justify-center py-2.5 cursor-grab active:cursor-grabbing select-none"
            onTouchStart={onTouchStartHandle}
            onTouchMove={onTouchMoveHandle}
            onTouchEnd={onTouchEndHandle}
          >
            <div className="h-1.5 w-14 rounded-full bg-stone-300 dark:bg-stone-700" />
            <span className="text-[10px] text-stone-400 mt-1.5 font-medium">
              Deslize para baixo para fechar
            </span>
          </div>

          <SheetHeader
            className="mb-4 text-left select-none"
            onTouchStart={onTouchStartHandle}
            onTouchMove={onTouchMoveHandle}
            onTouchEnd={onTouchEndHandle}
          >
            <SheetTitle className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
              Mais Módulos & Ferramentas
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-2.5">
            {EXTRAS.map((item) => {
              const ativo = location.pathname.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSheetAberto(false)}
                  className={cn(
                    "flex items-center gap-3.5 rounded-2xl p-3.5 transition-all border",
                    ativo
                      ? "border-[#143129] bg-[#143129]/10 dark:border-[#d9b978]/40 dark:bg-[#143129]/40"
                      : "border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-950/60 hover:bg-stone-100 dark:hover:bg-stone-800",
                  )}
                >
                  <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", item.color)}>
                    <item.icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      {item.label}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                      {item.descricao}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Ações Rápidas do Haras */}
          <div className="mt-5 pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
            <Link
              to="/equinos/novo"
              onClick={() => setSheetAberto(false)}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#143129] py-3 text-xs font-bold text-[#d9b978] shadow-sm active:scale-95 transition-transform"
            >
              <Plus className="size-4" />
              Novo Cavalo
            </Link>

            <button
              type="button"
              onClick={() => setTheme(escuro ? "light" : "dark")}
              className="flex items-center justify-center gap-2 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 px-4 py-3 text-xs font-semibold text-stone-700 dark:text-stone-300 active:scale-95 transition-transform"
            >
              {escuro ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-sky-600" />}
              <span>{escuro ? "Tema Claro" : "Tema Escuro"}</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
