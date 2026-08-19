/**
 * Módulo de Integração InfinitePay para Cobrança de Assinaturas (Pix & Cartão de Crédito)
 */

import { PLANOS_DISPONIVEIS, type PlanoSaaS } from "./types"

export interface RespostaCheckoutInfinitePay {
  sucesso: boolean
  idTransacao: string
  urlCheckout?: string
  qrCodePix?: string
  copiaColaPix?: string
  mensagem?: string
}

export async function gerarCheckoutAssinatura(
  planoId: PlanoSaaS,
  ciclo: "mensal" | "anual",
  dadosHaras: {
    nomeHaras: string
    email: string
    telefone: string
    responsavel: string
  }
): Promise<RespostaCheckoutInfinitePay> {
  const plano = PLANOS_DISPONIVEIS[planoId]
  const valor = ciclo === "anual" ? plano.precoAnual * 12 : plano.precoMensal
  const descricao = `Assinatura ${plano.nome} Haras Cloud (${ciclo === "anual" ? "Anual" : "Mensal"})`

  try {
    // Se houver endpoint configurado para InfinitePay API
    const infinitePayApiKey = import.meta.env.VITE_INFINITEPAY_API_KEY
    const infinitePayHandle = import.meta.env.VITE_INFINITEPAY_HANDLE || "harascloud"

    if (infinitePayApiKey) {
      // Chamada oficial InfinitePay Payment Links API
      const res = await fetch("https://api.infinitepay.io/v2/payment_links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${infinitePayApiKey}`,
        },
        body: JSON.stringify({
          amount: valor * 100, // em centavos
          description: descricao,
          customer: {
            name: dadosHaras.responsavel || dadosHaras.nomeHaras,
            email: dadosHaras.email,
            phone_number: dadosHaras.telefone,
          },
          payment_methods: ["pix", "credit_card"],
        }),
      })

      const data = await res.json()
      if (res.ok && data.url) {
        return {
          sucesso: true,
          idTransacao: data.id || `inf_${Date.now()}`,
          urlCheckout: data.url,
          copiaColaPix: data.pix_code,
        }
      }
    }

    // Fallback: Link direto InfinitePay Handle / Checkout Inteligente
    const idTransacao = `inf_${Date.now()}`
    const urlCheckout = `https://infinitepay.io/pay/${infinitePayHandle}?amount=${valor}&desc=${encodeURIComponent(descricao)}`

    return {
      sucesso: true,
      idTransacao,
      urlCheckout,
      mensagem: "Checkout InfinitePay pronto!",
    }
  } catch (error) {
    return {
      sucesso: false,
      idTransacao: "",
      mensagem: "Erro ao gerar checkout com InfinitePay.",
    }
  }
}
