import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const escuro = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Alternar tema"
      className={cn("hover:bg-accent/60", className)}
      onClick={() => setTheme(escuro ? "light" : "dark")}
    >
      {escuro ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
