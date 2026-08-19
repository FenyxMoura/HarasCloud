import { diasAte } from "./db"
import type { Equino, Vacina, Vermifugo } from "./types"

export type AlertaSaude = {
  tipo: "vacina" | "vermifugo"
  id: string
  equinoId: string
  equinoNome: string
  titulo: string
  dataProxima: string
  dias: number
}

/** Retorna vacinas/vermífugos vencidos ou vencendo nos próximos 30 dias. */
export function calcularAlertas(
  vacinas: Vacina[],
  vermifugos: Vermifugo[],
  equinos: Equino[],
): AlertaSaude[] {
  const porId = new Map(equinos.map((e) => [e.id, e]))
  const alertas: AlertaSaude[] = []

  for (const v of vacinas) {
    if (!v.dataProxima) continue
    const dias = diasAte(v.dataProxima)
    if (dias <= 30) {
      alertas.push({
        tipo: "vacina",
        id: v.id,
        equinoId: v.equinoId,
        equinoNome: porId.get(v.equinoId)?.nome ?? "—",
        titulo: v.nome,
        dataProxima: v.dataProxima,
        dias,
      })
    }
  }

  for (const vm of vermifugos) {
    if (!vm.dataProxima) continue
    const dias = diasAte(vm.dataProxima)
    if (dias <= 30) {
      alertas.push({
        tipo: "vermifugo",
        id: vm.id,
        equinoId: vm.equinoId,
        equinoNome: porId.get(vm.equinoId)?.nome ?? "—",
        titulo: vm.produto,
        dataProxima: vm.dataProxima,
        dias,
      })
    }
  }

  return alertas.sort((a, b) => a.dias - b.dias)
}

export function situacaoSaude(dias: number): { label: string; classe: string } {
  if (dias < 0) {
    const n = Math.abs(dias)
    return {
      label: `Vencida há ${n} dia${n === 1 ? "" : "s"}`,
      classe: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
    }
  }
  if (dias === 0) {
    return { label: "Vence hoje", classe: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200" }
  }
  if (dias <= 7) {
    return {
      label: `Em ${dias} dia${dias === 1 ? "" : "s"}`,
      classe: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    }
  }
  return {
    label: `Em ${dias} dias`,
    classe: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  }
}
