import { NavLink, Link } from "react-router-dom"
import { NAV_SECTIONS } from "./nav"
import { HarasLogo } from "@/components/icons/HarasLogo"
import { ThemeToggle } from "./ThemeToggle"
import { useAuth } from "@/lib/auth-context"
import { Crown, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

export function SidebarNav() {
  const { haras, usuario, isSuperAdmin, logout, temPermissao } = useAuth()

  const nomeExibicao = haras?.nomeHaras || "Haras Cardoso"
  const subtituloExibicao = haras?.subtitulo || "Gestão & Genética Equina"

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex print:hidden">
      {/* Top Header do Haras com Logo Oficial Centralizada e Polida */}
      <div className="flex items-center gap-3.5 px-5 pb-5 pt-6 border-b border-sidebar-border/80 bg-sidebar/50 backdrop-blur-sm">
        <div className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-[#1c4338] to-[#0a1914] shadow-lg border border-[#d9b978]/50 p-1.5 overflow-hidden group">
          {haras?.logoUrl ? (
            <img
              src={haras.logoUrl}
              alt={nomeExibicao}
              className="size-full object-contain group-hover:scale-105 transition-transform"
            />
          ) : (
            <HarasLogo className="size-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-black tracking-tight truncate text-white leading-tight">
            {nomeExibicao}
          </p>
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#d9b978] truncate mt-0.5 opacity-90">
            {subtituloExibicao}
          </p>
        </div>
      </div>

      {/* Botão de Acesso SuperAdmin Master se aplicável */}
      {isSuperAdmin && (
        <div className="px-3 pt-3">
          <Link
            to="/superadmin"
            className="flex items-center justify-between gap-2 rounded-xl bg-amber-500/15 border border-amber-500/30 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Crown className="size-4 text-amber-300" />
              Painel SuperAdmin
            </span>
            <span className="text-[9px] uppercase tracking-widest bg-amber-500/30 px-1.5 py-0.5 rounded font-black">
              Master
            </span>
          </Link>
        </div>
      )}

      {/* Navegação de Módulos Categorizada */}
      <nav className="flex flex-1 flex-col gap-5 px-3 py-4 overflow-y-auto no-scrollbar">
        {NAV_SECTIONS.map((secao) => {
          const itensPermitidos = secao.itens.filter((item) => {
            if (item.to === "/app") return true
            const modKey = item.to.replace("/", "") as Parameters<typeof temPermissao>[0]
            return temPermissao(modKey)
          })

          if (itensPermitidos.length === 0) return null

          return (
            <div key={secao.titulo} className="space-y-1">
              <p className="px-3 text-[10px] font-black uppercase tracking-widest text-[#d9b978]/70">
                {secao.titulo}
              </p>
              <div className="space-y-0.5">
                {itensPermitidos.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-[#1c3027] text-[#e8c37f] font-bold shadow-sm ring-1 ring-[#c9a45c]/50"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                      )
                    }
                  >
                    <item.icon className="size-4 shrink-0 opacity-90" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Perfil do Usuário Logado & Toggle de Tema */}
      <div className="border-t border-sidebar-border p-3 space-y-2 bg-sidebar/80">
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-sidebar-accent/50 p-2.5 border border-sidebar-border/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-xl bg-[#143129] text-[#d9b978] flex items-center justify-center font-bold text-xs shrink-0 border border-[#d9b978]/40 shadow-sm">
              {usuario?.nome.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-none">
                {usuario?.nome || "Usuário"}
              </p>
              <span className="text-[9px] uppercase tracking-wider text-sidebar-foreground/60 truncate mt-1 block">
                {usuario?.role === "superadmin"
                  ? "SuperAdmin"
                  : usuario?.role === "tenant_owner"
                  ? "Dono do Haras"
                  : usuario?.cargo || "Colaborador"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Sair da conta"
            className="text-sidebar-foreground/60 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="size-4" />
          </button>
        </div>

        <div className="flex items-center justify-between px-2 pt-1">
          <Link to="/" className="text-[10px] text-sidebar-foreground/50 hover:text-[#d9b978] transition-colors font-medium">
            Página de Vendas
          </Link>
          <ThemeToggle className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground" />
        </div>
      </div>
    </aside>
  )
}
