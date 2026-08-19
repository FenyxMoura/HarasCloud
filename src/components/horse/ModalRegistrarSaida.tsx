import { useState } from "react"
import {
  HeartCrack,
  LogOut,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { salvarSaida, gerarId } from "@/lib/db"
import { useAuth } from "@/lib/auth-context"
import type { Equino, MotivoSaida, RegistroSaida } from "@/lib/types"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ModalRegistrarSaidaProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equinos: Equino[]
  equinoPreselecionado?: Equino | null
  onSalvo?: () => void
}

export function ModalRegistrarSaida({
  open,
  onOpenChange,
  equinos,
  equinoPreselecionado,
  onSalvo,
}: ModalRegistrarSaidaProps) {
  const { haras } = useAuth()

  const [equinoId, setEquinoId] = useState(equinoPreselecionado?.id || "")
  const [motivo, setMotivo] = useState<MotivoSaida>("venda")
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  
  // Venda
  const [compradorNome, setCompradorNome] = useState("")
  const [compradorContato, setCompradorContato] = useState("")
  const [valorVenda, setValorVenda] = useState<string>("")
  const [formaPagamento, setFormaPagamento] = useState("À Vista / PIX")
  const [destinoHaras, setDestinoHaras] = useState("")

  // Óbito
  const [causaMortis, setCausaMortis] = useState("")
  const [laudoVeterinario, setLaudoVeterinario] = useState("")
  const [veterinarioResponsavel, setVeterinarioResponsavel] = useState("")
  const [localSepultamento, setLocalSepultamento] = useState("")

  // Geral
  const [observacoes, setObservacoes] = useState("")
  const [salvando, setSalvando] = useState(false)

  const equinoEscolhido = equinos.find((e) => e.id === (equinoPreselecionado?.id || equinoId))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const targetId = equinoPreselecionado?.id || equinoId
    if (!targetId) {
      toast.error("Selecione o equino que está saindo do haras.")
      return
    }

    const eq = equinos.find((item) => item.id === targetId)
    const eqNome = eq?.nome || "Equino"

    setSalvando(true)
    try {
      const registro: RegistroSaida = {
        id: gerarId(),
        harasId: haras?.id || "haras-cardoso-master",
        equinoId: targetId,
        equinoNome: eqNome,
        motivo,
        data,
        compradorNome: motivo === "venda" || motivo === "cedido" ? compradorNome : undefined,
        compradorContato: motivo === "venda" || motivo === "cedido" ? compradorContato : undefined,
        valorVenda: motivo === "venda" && valorVenda ? Number(valorVenda) : undefined,
        formaPagamento: motivo === "venda" ? formaPagamento : undefined,
        destinoHaras: destinoHaras || undefined,
        causaMortis: motivo === "obito" ? causaMortis : undefined,
        laudoVeterinario: motivo === "obito" ? laudoVeterinario : undefined,
        veterinarioResponsavel: motivo === "obito" ? veterinarioResponsavel : undefined,
        localSepultamento: motivo === "obito" ? localSepultamento : undefined,
        observacoes: observacoes || undefined,
        createdAt: new Date().toISOString(),
      }

      await salvarSaida(registro)
      toast.success(
        motivo === "venda"
          ? `Venda de ${eqNome} registrada com sucesso!`
          : motivo === "obito"
          ? `Registro de óbito de ${eqNome} arquivado no Memorial.`
          : `Saída de ${eqNome} registrada.`
      )

      onOpenChange(false)
      if (onSalvo) onSalvo()
    } catch (err) {
      toast.error("Erro ao salvar registro de saída.")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-background border-stone-200 dark:border-stone-800">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <LogOut className="size-5 text-[#d9b978]" />
            Registrar Saída do Haras / Venda / Óbito
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          {/* Seleção do Equino */}
          {!equinoPreselecionado && (
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">Selecione o Equino *</label>
              <select
                value={equinoId}
                onChange={(e) => setEquinoId(e.target.value)}
                className="w-full h-11 rounded-xl bg-muted border border-stone-200 dark:border-stone-800 px-3 text-xs font-medium text-foreground"
                required
              >
                <option value="">Escolha um cavalo do plantel...</option>
                {equinos
                  .filter((e) => e.status === "ativo")
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nome} ({e.raca} · {e.pelagem})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {equinoEscolhido && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
              <span className="font-bold text-amber-800 dark:text-amber-300">
                Cavalo Selecionado: {equinoEscolhido.nome}
              </span>
              <span className="text-[11px] text-muted-foreground">{equinoEscolhido.raca}</span>
            </div>
          )}

          {/* Motivo da Saída */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-2">Motivo da Saída do Haras *</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "venda", label: "💰 Venda Realizada", desc: "Comprador & Valor" },
                { id: "obito", label: "🕯️ Falecimento / Óbito", desc: "Causa & Laudo" },
                { id: "cedido", label: "🤝 Cedido / Empréstimo", desc: "Temporário / Treino" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMotivo(item.id as MotivoSaida)}
                  className={cn(
                    "p-3 rounded-2xl border text-left transition-all",
                    motivo === item.id
                      ? "bg-[#143129] border-[#d9b978] text-[#d9b978] shadow-sm font-bold"
                      : "bg-muted border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <p className="text-xs font-bold">{item.label}</p>
                  <p className="text-[10px] mt-0.5 opacity-70">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Data da Saída / Evento *</label>
            <Input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="h-11 rounded-xl"
              required
            />
          </div>

          {/* Campos específicos se for VENDA */}
          {motivo === "venda" && (
            <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-4">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="size-4" /> Dados Comerciais da Venda
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Nome do Comprador *</label>
                  <Input
                    placeholder="Ex: Celso Antunes"
                    value={compradorNome}
                    onChange={(e) => setCompradorNome(e.target.value)}
                    className="h-10 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Telefone / WhatsApp</label>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={compradorContato}
                    onChange={(e) => setCompradorContato(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Valor da Venda (R$)</label>
                  <Input
                    type="number"
                    placeholder="Ex: 45000"
                    value={valorVenda}
                    onChange={(e) => setValorVenda(e.target.value)}
                    className="h-10 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Forma de Pagamento</label>
                  <select
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value)}
                    className="w-full h-10 rounded-xl bg-background border border-stone-200 dark:border-stone-800 px-3 text-xs"
                  >
                    <option value="À Vista / PIX">À Vista / PIX</option>
                    <option value="Parcelado (12x / 24x / 36x)">Parcelado em Boletos</option>
                    <option value="Permuta / Troca">Permuta de Animais</option>
                    <option value="Leilão Oficial">Arrematado em Leilão</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Haras / Cidade de Destino</label>
                  <Input
                    placeholder="Ex: Haras Bela Vista - SP"
                    value={destinoHaras}
                    onChange={(e) => setDestinoHaras(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Campos específicos se for ÓBITO */}
          {motivo === "obito" && (
            <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 space-y-4">
              <p className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <HeartCrack className="size-4" /> Registro Veterinário de Falecimento
              </p>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Causa Mortis *</label>
                <Input
                  placeholder="Ex: Cólica Torção / Parada Cardíaca / Idade Avançada"
                  value={causaMortis}
                  onChange={(e) => setCausaMortis(e.target.value)}
                  className="h-10 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Veterinário Responsável</label>
                  <Input
                    placeholder="Dr. / CRMV"
                    value={veterinarioResponsavel}
                    onChange={(e) => setVeterinarioResponsavel(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">Local do Sepultamento</label>
                  <Input
                    placeholder="Ex: Piquete das Acácias (Memorial)"
                    value={localSepultamento}
                    onChange={(e) => setLocalSepultamento(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Laudo Veterinário / Observações Clínicas</label>
                <Textarea
                  placeholder="Detalhes clínicos da necrópsia ou atendimento emergencial..."
                  value={laudoVeterinario}
                  onChange={(e) => setLaudoVeterinario(e.target.value)}
                  rows={2}
                  className="rounded-xl resize-none text-xs"
                />
              </div>
            </div>
          )}

          {/* Observações Gerais */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Histórico / Observações Adicionais</label>
            <Textarea
              placeholder="Anotações complementares para o histórico do haras..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
              className="rounded-xl resize-none text-xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={salvando}
              className="rounded-xl bg-[#143129] text-[#d9b978] font-bold text-xs hover:bg-[#1c4338]"
            >
              {salvando ? "Salvando..." : "Confirmar e Arquivar Saída"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
