import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import { ThemeProvider } from "next-themes"
import { Capacitor } from "@capacitor/core"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { AppShell } from "@/components/layout/AppShell"
import { LandingPage } from "@/pages/LandingPage"
import { Login } from "@/pages/Login"
import { Registro } from "@/pages/Registro"
import { SuperAdmin } from "@/pages/SuperAdmin"
import { Dashboard } from "@/pages/Dashboard"

function RotaInicial() {
  const { usuario } = useAuth()
  const isAppNativo =
    Capacitor.isNativePlatform() ||
    (typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window.navigator as any).standalone === true))

  if (isAppNativo) {
    return usuario ? <Navigate to="/app" replace /> : <Navigate to="/login" replace />
  }

  return <LandingPage />
}
import { Equinos } from "@/pages/Equinos"
import { EquinoForm } from "@/pages/EquinoForm"
import { EquinoDetalhe } from "@/pages/EquinoDetalhe"
import { Clientes } from "@/pages/Clientes"
import { Contratos } from "@/pages/Contratos"
import { Instalacoes } from "@/pages/Instalacoes"
import { Leilao } from "@/pages/Leilao"
import { Galeria } from "@/pages/Galeria"
import { ScannerPlantas } from "@/pages/ScannerPlantas"
import { Saude } from "@/pages/Saude"
import { Reproducao } from "@/pages/Reproducao"
import { Alimentacao } from "@/pages/Alimentacao"
import { Financeiro } from "@/pages/Financeiro"
import { Agenda } from "@/pages/Agenda"
import { Equipe } from "@/pages/Equipe"
import { Tarefas } from "@/pages/Tarefas"
import { Configuracoes } from "@/pages/Configuracoes"
import { ApresentacaoDossie } from "@/pages/ApresentacaoDossie"

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* 1. Rota Inicial Inteligente: Landing Page no Navegador ou Login/App no Aplicativo */}
            <Route path="/" element={<RotaInicial />} />

            {/* 2. Telas de Autenticação e SaaS */}
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/superadmin" element={<SuperAdmin />} />
            <Route path="/apresentacao" element={<ApresentacaoDossie />} />

            {/* 3. Painel do Haras (App Shell) */}
            <Route element={<AppShell />}>
              <Route path="/app" element={<Dashboard />} />
              <Route path="/equinos" element={<Equinos />} />
              <Route path="/equinos/novo" element={<EquinoForm />} />
              <Route path="/equinos/:id" element={<EquinoDetalhe />} />
              <Route path="/equinos/:id/editar" element={<EquinoForm />} />
              <Route path="/tarefas" element={<Tarefas />} />
              <Route path="/leilao" element={<Leilao />} />
              <Route path="/instalacoes" element={<Instalacoes />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/contratos" element={<Contratos />} />
              <Route path="/galeria" element={<Galeria />} />
              <Route path="/scanner-plantas" element={<ScannerPlantas />} />
              <Route path="/saude" element={<Saude />} />
              <Route path="/reproducao" element={<Reproducao />} />
              <Route path="/alimentacao" element={<Alimentacao />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/equipe" element={<Equipe />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </ThemeProvider>
  )
}
