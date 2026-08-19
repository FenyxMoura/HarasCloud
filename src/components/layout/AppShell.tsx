import { Outlet, useLocation } from "react-router-dom"
import { SidebarNav } from "./Sidebar"
import { MobileTopBar } from "./MobileTopBar"
import { MobileBottomNav } from "./MobileBottomNav"
import { InstallPrompt } from "./InstallPrompt"
import { InstallGuide } from "./InstallGuide"
import { ImpersonationBanner } from "./ImpersonationBanner"
import { DemoVisitorBanner } from "./DemoVisitorBanner"
import { TrialBanner } from "./TrialBanner"
import { ModalAtualizacaoObrigatoria } from "./ModalAtualizacaoObrigatoria"
import { HarasAICopilot } from "@/components/ia/HarasAICopilot"

export function AppShell() {
  const location = useLocation()
  return (
    <div className="min-h-svh flex flex-col">
      <ModalAtualizacaoObrigatoria />
      <SidebarNav />
      <div className="flex-1 lg:pl-64 print:pl-0 flex flex-col min-h-svh">
        <ImpersonationBanner />
        <DemoVisitorBanner />
        <TrialBanner />
        <MobileTopBar />
        <main className="flex-1">
          <div key={location.pathname} className="page-in mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-14 lg:pt-10">
            <Outlet />
          </div>
        </main>
      </div>
      <HarasAICopilot />
      <MobileBottomNav />
      <InstallPrompt />
      <InstallGuide />
    </div>
  )
}
