import { useEffect, useState } from "react"
import {
  Gavel,
  MessageCircle,
  Plus,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getLotesLeilao, salvarLoteLeilao, removerLoteLeilao, gerarId } from "@/lib/db"
import { useEquinosComFotos } from "@/lib/hooks"
import { useAuth } from "@/lib/auth-context"
import { tocarSomSucesso } from "@/lib/sound-alerts"
import type { LoteLeilao } from "@/lib/types"
import { toast } from "sonner"

export function Leilao() {
  const { haras } = useAuth()
  const { equinos, fotos } = useEquinosComFotos()

  const [lotes, setLotes] = useState<LoteLeilao[]>([])
  const [dialogAberto, setDialogAberto] = useState(false)
  const [equinoId, setEquinoId] = useState("")
  const [lanceInicial, setLanceInicial] = useState("15000")
  const [condicoes, setCondicoes] = useState("30 parcelas (2+2+26)")
  const [descricao, setDescricao] = useState("Animal de marcha picada excepcional, excelente morfologia e temperamento dócil.")
  const [videoUrl] = useState("")

  async function carregar() {
    const dados = await getLotesLeilao()
    if (dados.length === 0 && equinos.length > 0) {
      // Cria 2 lotes de demonstração com os equinos existentes
      const demoLotes: LoteLeilao[] = equinos.slice(0, 2).map((eq, idx) => ({
        id: `lote-${idx + 1}`,
        harasId: haras?.id || "haras-cardoso-master",
        numeroLote: idx + 1,
        equinoId: eq.id,
        equinoNome: eq.nome,
        raca: eq.raca,
        pelagem: eq.pelagem,
        lanceInicial: 18000 + idx * 5000,
        condicoesPagamento: "30 parcelas (2+2+26)",
        descricaoComercial: "Destaque do leilão! Marcha premiada com registro definitivo na associação.",
        destaque: true,
        status: "aberto",
        fotoPrincipalUrl: fotos[eq.id],
      }))
      for (const l of demoLotes) await salvarLoteLeilao(l)
      setLotes(demoLotes)
    } else {
      setLotes(dados)
    }
  }

  useEffect(() => {
    carregar()
  }, [equinos])

  async function handleSalvarLote() {
    const eq = equinos.find((e) => e.id === equinoId)
    if (!eq) {
      toast.error("Selecione um equino para o lote.")
      return
    }

    const novoLote: LoteLeilao = {
      id: gerarId(),
      harasId: haras?.id || "haras-cardoso-master",
      numeroLote: lotes.length + 1,
      equinoId: eq.id,
      equinoNome: eq.nome,
      raca: eq.raca,
      pelagem: eq.pelagem,
      lanceInicial: Number(lanceInicial || 10000),
      condicoesPagamento: condicoes,
      descricaoComercial: descricao,
      destaque: true,
      status: "aberto",
      videoUrl: videoUrl.trim() || undefined,
      fotoPrincipalUrl: fotos[eq.id],
    }

    await salvarLoteLeilao(novoLote)
    tocarSomSucesso()
    toast.success("Lote adicionado à vitrine do leilão!")
    setDialogAberto(false)
    carregar()
  }

  function darLanceWhatsApp(lote: LoteLeilao) {
    tocarSomSucesso()
    const msg = encodeURIComponent(
      `Olá! Tenho interesse no *Lote ${lote.numeroLote} - ${lote.equinoNome}* (${lote.raca}) anunciado na vitrine oficial do ${haras?.nomeHaras || "Haras Cloud"}. Gostaria de mais informações e dar um lance!`
    )
    const phone = haras?.telefone?.replace(/\D/g, "") || "5511999999999"
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Gavel className="size-7 text-[#d9b978]" />
            Vitrine de Leilão & Venda de Equinos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Catálogo digital de animais à venda com fotos, linhagem e botão direto para lances no WhatsApp.
          </p>
        </div>

        <Button
          onClick={() => setDialogAberto(true)}
          className="rounded-2xl bg-[#143129] text-[#d9b978] font-bold text-xs sm:text-sm hover:bg-[#1c4338] shadow-md active:scale-95 transition-all"
        >
          <Plus className="mr-1.5 size-4" />
          Cadastrar Lote
        </Button>
      </div>

      {/* Grid de Lotes do Leilão */}
      {lotes.length === 0 ? (
        <Card className="rounded-3xl border-stone-200/80 dark:border-stone-800 p-12 text-center">
          <Gavel className="size-12 mx-auto text-amber-500 opacity-60 mb-2" />
          <p className="font-bold text-foreground">Nenhum lote cadastrado no momento</p>
          <p className="text-xs text-muted-foreground mt-1">
            Coloque animais do plantel na vitrine pública de vendas para receber lances e propostas.
          </p>
          <Button onClick={() => setDialogAberto(true)} className="mt-4 rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs">
            Adicionar Primeiro Lote
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lotes.map((lote) => {
            const foto = lote.fotoPrincipalUrl || fotos[lote.equinoId]

            return (
              <Card
                key={lote.id}
                className="group overflow-hidden rounded-3xl border-2 border-stone-200/80 dark:border-stone-800 bg-card hover:border-[#d9b978]/60 transition-all shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Foto do Lote */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                    {foto ? (
                      <img
                        src={foto}
                        alt={lote.equinoNome}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-4xl font-display font-black text-stone-700">
                        🐴
                      </div>
                    )}

                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-[#d9b978] border border-[#d9b978]/30 px-3 py-1 rounded-xl text-xs font-black font-mono shadow-md">
                      LOTE #{String(lote.numeroLote).padStart(2, "0")}
                    </div>

                    <div className="absolute top-3 right-3 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                      {lote.status === "aberto" ? "Disponível" : "Arrematado"}
                    </div>
                  </div>

                  {/* Informações do Animal */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-display text-xl font-bold text-foreground leading-tight">
                        {lote.equinoNome}
                      </h3>
                      <p className="text-xs text-muted-foreground font-semibold">
                        {lote.raca} · {lote.pelagem}
                      </p>
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2">
                      {lote.descricaoComercial}
                    </p>

                    {/* Preço e Condições */}
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                      <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 block">
                        Lance Inicial / Valor
                      </span>
                      <p className="font-mono text-xl font-black text-foreground">
                        R$ {lote.lanceInicial.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                        Condições: {lote.condicoesPagamento}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="p-5 pt-0 flex items-center gap-2">
                  <Button
                    onClick={() => darLanceWhatsApp(lote)}
                    className="flex-1 rounded-2xl bg-[#25D366] text-white font-bold text-xs hover:bg-[#1EBE5D] shadow-md"
                  >
                    <MessageCircle className="mr-1.5 size-4" />
                    Dar Lance no WhatsApp
                  </Button>

                  <Button
                    size="icon"
                    variant="outline"
                    onClick={async () => {
                      await removerLoteLeilao(lote.id)
                      toast.success("Lote removido do leilão.")
                      carregar()
                    }}
                    className="size-10 rounded-2xl text-rose-500 border-stone-200 dark:border-stone-800"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal Novo Lote */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="sm:max-w-md bg-background border-stone-200 dark:border-stone-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
              <Gavel className="size-5 text-[#d9b978]" />
              Adicionar Animal ao Leilão
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2 text-xs">
            <div>
              <label className="font-semibold block mb-1">Selecione o Equino do Haras *</label>
              <select
                value={equinoId}
                onChange={(e) => setEquinoId(e.target.value)}
                className="w-full h-10 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs"
              >
                <option value="">Selecione um animal...</option>
                {equinos.map((e) => (
                  <option key={e.id} value={e.id}>{e.nome} ({e.raca} · {e.pelagem})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Lance Inicial (R$) *</label>
                <Input
                  type="number"
                  value={lanceInicial}
                  onChange={(e) => setLanceInicial(e.target.value)}
                  className="h-10 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Condições de Pagamento</label>
                <Input
                  value={condicoes}
                  onChange={(e) => setCondicoes(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Descrição Comercial & Marcha</label>
              <Textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                className="rounded-xl resize-none text-xs"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="ghost" onClick={() => setDialogAberto(false)} className="rounded-xl text-xs">
              Cancelar
            </Button>
            <Button onClick={handleSalvarLote} className="rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs">
              Publicar Lote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
