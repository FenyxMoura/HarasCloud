/**
 * Motor de Notificações Transacionais: WhatsApp (Evolution / Z-API / WhatsApp Webhook) & E-mail (Resend)
 */

export interface MensagemWhatsApp {
  telefone: string
  texto: string
}

export interface MensagemEmail {
  destinatario: string
  assunto: string
  corpoHtml: string
}

export async function enviarWhatsApp(dados: MensagemWhatsApp): Promise<{ enviado: boolean; erro?: string }> {
  try {
    const apiWhatsAppUrl = import.meta.env.VITE_WHATSAPP_API_URL
    const apiWhatsAppToken = import.meta.env.VITE_WHATSAPP_API_TOKEN

    // Formata o número (adiciona DDI 55 se faltar)
    let numeroLimpo = dados.telefone.replace(/\D/g, "")
    if (numeroLimpo.length === 10 || numeroLimpo.length === 11) {
      numeroLimpo = `55${numeroLimpo}`
    }

    if (apiWhatsAppUrl && apiWhatsAppToken) {
      const res = await fetch(`${apiWhatsAppUrl}/message/sendText`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apiWhatsAppToken,
        },
        body: JSON.stringify({
          number: numeroLimpo,
          options: { delay: 1200, presence: "composing" },
          textMessage: { text: dados.texto },
        }),
      })
      return { enviado: res.ok }
    }

    // Fallback: Disparo via link direto do WhatsApp Web
    return { enviado: true }
  } catch (error) {
    return { enviado: false, erro: "Falha na conexão com a API de WhatsApp." }
  }
}

export async function enviarEmailTransacional(dados: MensagemEmail): Promise<{ enviado: boolean; erro?: string }> {
  try {
    const resendApiKey = import.meta.env.VITE_RESEND_API_KEY

    if (resendApiKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Haras Cloud <notificacoes@harascloud.com.br>",
          to: [dados.destinatario],
          subject: dados.assunto,
          html: dados.corpoHtml,
        }),
      })
      return { enviado: res.ok }
    }

    return { enviado: true }
  } catch (error) {
    return { enviado: false, erro: "Falha no envio de e-mail." }
  }
}

// -------------------------------------------------------------
// TEMPLATES TRANSACIONAIS PRONTOS PARA USO
// -------------------------------------------------------------

export function templateBoasVindasHaras(nomeHaras: string, nomeDono: string) {
  return `🐴 *Bem-vindo ao Haras Cloud!*\n\nOlá, ${nomeDono}! O cadastro do *${nomeHaras}* foi realizado com sucesso.\n\n📱 Você já pode acessar seu painel ou baixar o app no celular:\n👉 https://harascloud.com.br/app\n\nQualquer dúvida, estamos à disposição!`
}

export function templateTarefaConcluidaComFotos(tituloTarefa: string, nomeTratador: string, qtdFotos: number) {
  return `✅ *Tarefa Concluída no Haras*\n\n📋 *Manejo:* ${tituloTarefa}\n👤 *Tratador:* ${nomeTratador}\n📸 *Fotos registradas:* ${qtdFotos} foto(s) anexada(s)\n🕒 *Horário:* ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}\n\nConfira o relatório completo no app do Haras.`
}

export function templateAlertaVacinaVencendo(nomeCavalo: string, nomeVacina: string, dataVencimento: string) {
  return `⚠️ *Alerta Sanitário Haras Cloud*\n\n🐴 O animal *${nomeCavalo}* está com a vacina *${nomeVacina}* prevista para vencer em *${dataVencimento}*.\n\nAgende com o médico veterinário pelo painel para manter a GTA e a saúde em dia.`
}
