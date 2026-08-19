export function suportaNotificacoes(): boolean {
  return typeof window !== "undefined" && "Notification" in window
}

export function permissaoNotificacoes(): NotificationPermission {
  if (!suportaNotificacoes()) return "denied"
  return Notification.permission
}

export async function pedirPermissaoNotificacoes(): Promise<boolean> {
  if (!suportaNotificacoes()) return false
  const resultado = await Notification.requestPermission()
  return resultado === "granted"
}

export function notificar(titulo: string, corpo: string): void {
  if (permissaoNotificacoes() !== "granted") return
  try {
    new Notification(titulo, { body: corpo })
  } catch {
    // Alguns navegadores exigem o construtor via service worker; ignora silenciosamente
  }
}

/** Envia um lembrete de evento uma única vez por dia (controlado por localStorage). */
export function lembrarEvento(id: string, titulo: string, corpo: string): void {
  const hoje = new Date().toISOString().slice(0, 10)
  const chave = `lembrete-${id}-${hoje}`
  if (localStorage.getItem(chave)) return
  notificar(titulo, corpo)
  localStorage.setItem(chave, "1")
}
