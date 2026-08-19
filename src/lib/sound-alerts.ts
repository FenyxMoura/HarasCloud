/**
 * Sistema de Efeitos Sonoros Nativos do Haras Cloud
 * Utiliza a Web Audio API do navegador (sem arquivos pesados externos).
 */

const STORAGE_KEY_SOM = "haras_cloud_som_habilitado"
const STORAGE_KEY_VOLUME = "haras_cloud_som_volume"

export function isSomHabilitado(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_KEY_SOM)
    return val !== "false" // Padrão: ativado
  } catch {
    return true
  }
}

export function setSomHabilitado(habilitado: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_SOM, habilitado ? "true" : "false")
  } catch {}
}

export function getVolumeSom(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEY_VOLUME)
    return val ? parseFloat(val) : 0.6
  } catch {
    return 0.6
  }
}

export function setVolumeSom(vol: number): void {
  try {
    localStorage.setItem(STORAGE_KEY_VOLUME, vol.toString())
  } catch {}
}

function getAudioContext(): AudioContext | null {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return null
    return new AudioContextClass()
  } catch {
    return null
  }
}

/** 🚨 Som de Alerta Crítico (Vacinas/Vermífugos Vencidos) */
export function tocarSomAlertaCritico(): void {
  if (!isSomHabilitado()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const volume = getVolumeSom()
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = "sawtooth"
  osc.frequency.setValueAtTime(880, now) // A5
  osc.frequency.exponentialRampToValueAtTime(440, now + 0.15)
  osc.frequency.setValueAtTime(880, now + 0.18)
  osc.frequency.exponentialRampToValueAtTime(440, now + 0.35)

  gain.gain.setValueAtTime(volume * 0.4, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.4)
}

/** 💰 Som de Sucesso / Confirmação Financeira */
export function tocarSomSucesso(): void {
  if (!isSomHabilitado()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const volume = getVolumeSom()
  const now = ctx.currentTime

  // Duplo sino harmônico
  const notas = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6 (Arpeggio maior)
  notas.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(freq, now + i * 0.07)

    gain.gain.setValueAtTime(0, now + i * 0.07)
    gain.gain.linearRampToValueAtTime(volume * 0.3, now + i * 0.07 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.35)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + i * 0.07)
    osc.stop(now + i * 0.07 + 0.4)
  })
}

/** 🔔 Som de Notificação Suave de Agenda/Evento */
export function tocarSomNotificacao(): void {
  if (!isSomHabilitado()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const volume = getVolumeSom()
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = "sine"
  osc.frequency.setValueAtTime(587.33, now) // D5
  osc.frequency.setValueAtTime(880, now + 0.08) // A5

  gain.gain.setValueAtTime(volume * 0.25, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.35)
}

/** 🤖 Som de Ativação do HarasAI Copilot */
export function tocarSomIA(): void {
  if (!isSomHabilitado()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const volume = getVolumeSom()
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = "triangle"
  osc.frequency.setValueAtTime(440, now)
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.12)
  osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.25) // E6

  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(volume * 0.25, now + 0.04)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.35)
}

/** ⏱️ Som de Início de Tarefa (Cronômetro Ativado) */
export function tocarSomInicioTarefa(): void {
  if (!isSomHabilitado()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const volume = getVolumeSom()
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = "sine"
  osc.frequency.setValueAtTime(523.25, now) // C5
  osc.frequency.setValueAtTime(659.25, now + 0.08) // E5
  osc.frequency.setValueAtTime(783.99, now + 0.16) // G5

  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(volume * 0.35, now + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.35)
}

/** 🏆 Som de Conclusão de Tarefa / Checklist */
export function tocarSomConclusaoTarefa(): void {
  if (!isSomHabilitado()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const volume = getVolumeSom()
  const now = ctx.currentTime

  const acordes = [523.25, 659.25, 783.99, 1046.5, 1318.51] // Fanfarra C Maior
  acordes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "triangle"
    osc.frequency.setValueAtTime(freq, now + i * 0.06)

    gain.gain.setValueAtTime(0, now + i * 0.06)
    gain.gain.linearRampToValueAtTime(volume * 0.3, now + i * 0.06 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.4)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + i * 0.06)
    osc.stop(now + i * 0.06 + 0.4)
  })
}

/** ⏰ Som de Alarme / Lembrete de Horário de Tarefa */
export function tocarSomAlarmeTarefa(): void {
  if (!isSomHabilitado()) return
  const ctx = getAudioContext()
  if (!ctx) return

  const volume = getVolumeSom()
  const now = ctx.currentTime

  // Duplo bipe de relógio/notificação
  for (let b = 0; b < 2; b++) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    const t = now + b * 0.18
    osc.type = "sine"
    osc.frequency.setValueAtTime(987.77, t) // B5
    osc.frequency.exponentialRampToValueAtTime(1318.51, t + 0.08) // E6

    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(volume * 0.45, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(t)
    osc.stop(t + 0.15)
  }
}

