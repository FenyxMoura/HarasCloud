import type { ReactNode } from "react"
import LiquidChrome from "./LiquidChrome"
import { cn } from "@/lib/utils"

interface LiquidGlassProps {
  children: ReactNode
  className?: string
  /** Cor base do líquido (RGB 0–1). */
  baseColor?: [number, number, number]
  /** Intensidade da ondulação (padrão suave). */
  amplitude?: number
  speed?: number
  interactive?: boolean
  /** Intensidade do desfoque do vidro (classes Tailwind). */
  vidroClass?: string
}

/** Painel de "vidro líquido": líquido animado sob um vidro fosco com reflexo de borda. */
export function LiquidGlass({
  children,
  className,
  baseColor = [0.05, 0.12, 0.09],
  amplitude = 0.35,
  speed = 0.15,
  interactive = false,
  vidroClass = "bg-white/[0.06] backdrop-blur-2xl",
}: LiquidGlassProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <LiquidChrome
        className="absolute inset-0"
        baseColor={baseColor}
        amplitude={amplitude}
        speed={speed}
        interactive={interactive}
      />
      {/* Vidro fosco sobre o líquido */}
      <div className={cn("absolute inset-0", vidroClass)} />
      {/* Reflexo de borda (mais claro em cima, mais escuro embaixo) */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-2px_6px_rgba(0,0,0,0.35)]" />
      <div className="relative">{children}</div>
    </div>
  )
}
