import { cn } from "@/lib/utils"

interface HarasLogoProps {
  className?: string
}

export function HarasLogo({ className }: HarasLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("select-none shrink-0 drop-shadow-sm", className)}
    >
      {/* Círculo de Fundo Verde Floresta */}
      <circle cx="50" cy="50" r="48" fill="#143129" />

      {/* Anel Dourado Premium */}
      <circle
        cx="50"
        cy="50"
        r="34"
        stroke="#d9b978"
        strokeWidth="14"
        fill="none"
      />

      {/* Núcleo Central Verde */}
      <circle cx="50" cy="50" r="20" fill="#143129" />

      {/* Recorte da Ferradura / Emblema na Base */}
      <polygon points="43,50 36,84 64,84 57,50" fill="#143129" />

      {/* Borda Externa Dourada Fina */}
      <circle
        cx="50"
        cy="50"
        r="47"
        stroke="#d9b978"
        strokeWidth="1.5"
        strokeOpacity="0.5"
        fill="none"
      />
    </svg>
  )
}
