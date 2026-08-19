/** Gradiente de fundo (classes Tailwind) por pelagem, usado em cards e avatares. */
const PELAGEM_TEMA: Record<string, string> = {
  Alazã: "from-amber-600 to-orange-800",
  "Alazã tostada": "from-amber-700 to-amber-950",
  Baia: "from-amber-800 to-stone-900",
  "Baia dourada": "from-amber-500 to-amber-800",
  Castanha: "from-red-800 to-red-950",
  Preta: "from-stone-700 to-stone-950",
  Tordilha: "from-slate-400 to-slate-600",
  "Tordilha negra": "from-slate-600 to-slate-900",
  Rosilha: "from-rose-400 to-rose-700",
  Pampa: "from-fuchsia-700 to-purple-900",
  Malhada: "from-orange-600 to-stone-800",
  Overo: "from-amber-600 to-stone-700",
  Tobiano: "from-red-700 to-stone-800",
  Bragada: "from-stone-500 to-stone-800",
  Lobuna: "from-stone-600 to-amber-950",
  Zaina: "from-stone-800 to-black",
  Picota: "from-rose-500 to-stone-800",
  Outra: "from-primary to-emerald-800",
}

/** Retorna classes de gradiente para uma pelagem (com fallback na cor da marca). */
export function temaPelagem(pelagem: string): string {
  return PELAGEM_TEMA[pelagem.trim()] ?? "from-primary to-emerald-800"
}

/** Cor de destaque (hex) para gráficos e detalhes, derivada da pelagem. */
export function corPelagem(pelagem: string): string {
  const mapa: Record<string, string> = {
    Alazã: "#b45309",
    "Alazã tostada": "#92400e",
    Baia: "#78350f",
    "Baia dourada": "#d97706",
    Castanha: "#7f1d1d",
    Preta: "#1c1917",
    Tordilha: "#94a3b8",
    "Tordilha negra": "#475569",
    Rosilha: "#f43f5e",
    Pampa: "#a21caf",
    Malhada: "#c2410c",
    Overo: "#b45309",
    Tobiano: "#b91c1c",
    Bragada: "#78716c",
    Lobuna: "#57534e",
    Zaina: "#292524",
    Picota: "#e11d48",
  }
  return mapa[pelagem.trim()] ?? "#1b4332"
}
