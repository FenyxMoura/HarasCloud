import { useEffect, useRef, useState, type ReactNode } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle2,
  Clapperboard,
  ImagePlus,
  Plus,
  Star,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { HorseAvatar } from "@/components/horse/HorseAvatar"
import {
  adicionarFotos,
  adicionarVideos,
  atualizarLegendaFoto,
  definirFotoPrincipal,
  excluirEquino,
  excluirVideo,
  getAllEquinos,
  getEquino,
  getFotosEquino,
  getVideosEquino,
  removerFoto,
  salvarEquino,
} from "@/lib/db"
import { useFotoUrls, useVideoUrls } from "@/lib/hooks"
import {
  PELAGENS,
  RACAS,
  SEXO_LABEL,
  STATUS_LABEL,
  type Equino,
  type FotoEquino,
  type Sexo,
  type StatusEquino,
  type VideoEquino,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface FormState {
  nome: string
  apelido: string
  sexo: Sexo
  nascimento: string
  raca: string
  racaCustom: string
  pelagem: string
  pelagemCustom: string
  registro: string
  microchip: string
  paiId: string
  maeId: string
  origem: string
  temperamento: string
  altura: string
  status: StatusEquino
  observacoes: string
}

const FORM_INICIAL: FormState = {
  nome: "",
  apelido: "",
  sexo: "macho",
  nascimento: "",
  raca: "",
  pelagem: "",
  racaCustom: "",
  pelagemCustom: "",
  registro: "",
  microchip: "",
  paiId: "",
  maeId: "",
  origem: "",
  temperamento: "",
  altura: "",
  status: "ativo",
  observacoes: "",
}

function Campo({
  label,
  children,
  className,
  obrigatorio,
}: {
  label: string
  children: ReactNode
  className?: string
  obrigatorio?: boolean
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-sm font-medium">
        {label}
        {obrigatorio && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  )
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{titulo}</h2>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">{children}</CardContent>
    </Card>
  )
}

interface NovaFoto {
  id: string
  blob: Blob
  url: string
  legenda: string
}

interface NovoVideo {
  id: string
  blob: Blob
  url: string
}

export function EquinoForm() {
  const { id } = useParams()
  const editando = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(FORM_INICIAL)
  const [equinoOriginal, setEquinoOriginal] = useState<Equino | undefined>()
  const [equinos, setEquinos] = useState<Equino[]>([])
  const [fotosExistentes, setFotosExistentes] = useState<FotoEquino[]>([])
  const [legendasExistentes, setLegendasExistentes] = useState<Record<string, string>>({})
  const [novasFotos, setNovasFotos] = useState<NovaFoto[]>([])
  const [videosExistentes, setVideosExistentes] = useState<VideoEquino[]>([])
  const [novosVideos, setNovosVideos] = useState<NovoVideo[]>([])
  const [erroNome, setErroNome] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [salvoId, setSalvoId] = useState("")
  const [confirmarExclusao, setConfirmarExclusao] = useState(false)
  const [carregando, setCarregando] = useState(editando)
  const inputArquivo = useRef<HTMLInputElement>(null)
  const inputVideo = useRef<HTMLInputElement>(null)

  const urlsExistentes = useFotoUrls(fotosExistentes)
  const urlsVideos = useVideoUrls(videosExistentes)

  useEffect(() => {
    setLegendasExistentes((prev) => {
      const novo = { ...prev }
      for (const f of fotosExistentes) {
        if (!(f.id in novo)) novo[f.id] = f.legenda ?? ""
      }
      return novo
    })
  }, [fotosExistentes])

  useEffect(() => {
    ;(async () => {
      const lista = await getAllEquinos()
      setEquinos(lista)
      if (editando && id) {
        const e = await getEquino(id)
        if (e) {
          setEquinoOriginal(e)
          setForm({
            nome: e.nome,
            apelido: e.apelido ?? "",
            sexo: e.sexo,
            nascimento: e.nascimento ?? "",
            raca: RACAS.includes(e.raca as (typeof RACAS)[number]) ? e.raca : "Outra",
            racaCustom: RACAS.includes(e.raca as (typeof RACAS)[number]) ? "" : e.raca,
            pelagem: PELAGENS.includes(e.pelagem as (typeof PELAGENS)[number]) ? e.pelagem : "Outra",
            pelagemCustom: PELAGENS.includes(e.pelagem as (typeof PELAGENS)[number]) ? "" : e.pelagem,
            registro: e.registro ?? "",
            microchip: e.microchip ?? "",
            paiId: e.paiId ?? "",
            maeId: e.maeId ?? "",
            origem: e.origem ?? "",
            temperamento: e.temperamento ?? "",
            altura: e.altura ?? "",
            status: e.status,
            observacoes: e.observacoes ?? "",
          })
          setFotosExistentes(await getFotosEquino(id))
          setVideosExistentes(await getVideosEquino(id))
        }
        setCarregando(false)
      }
    })()
  }, [editando, id])

  function setCampo<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  function adicionarArquivos(files: FileList | null) {
    if (!files) return
    const novos: NovaFoto[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({ id: crypto.randomUUID(), blob: f, url: URL.createObjectURL(f), legenda: "" }))
    setNovasFotos((f) => [...f, ...novos])
  }

  function removerNovaFoto(fotoId: string) {
    setNovasFotos((f) => {
      const alvo = f.find((x) => x.id === fotoId)
      if (alvo) URL.revokeObjectURL(alvo.url)
      return f.filter((x) => x.id !== fotoId)
    })
  }

  function adicionarArquivosVideo(files: FileList | null) {
    if (!files) return
    const novos: NovoVideo[] = Array.from(files)
      .filter((f) => f.type.startsWith("video/"))
      .map((f) => ({ id: crypto.randomUUID(), blob: f, url: URL.createObjectURL(f) }))
    setNovosVideos((v) => [...v, ...novos])
  }

  function removerNovoVideo(videoId: string) {
    setNovosVideos((v) => {
      const alvo = v.find((x) => x.id === videoId)
      if (alvo) URL.revokeObjectURL(alvo.url)
      return v.filter((x) => x.id !== videoId)
    })
  }

  async function removerVideoExistente(videoId: string) {
    await excluirVideo(videoId)
    if (id) setVideosExistentes(await getVideosEquino(id))
  }

  async function removerFotoExistente(fotoId: string) {
    await removerFoto(fotoId)
    if (id) setFotosExistentes(await getFotosEquino(id))
  }

  async function salvarLegendaExistente(fotoId: string) {
    await atualizarLegendaFoto(fotoId, legendasExistentes[fotoId] ?? "")
    toast.success("Legenda salva")
  }

  function atualizarLegendaNova(fotoId: string, valor: string) {
    setNovasFotos((fs) => fs.map((f) => (f.id === fotoId ? { ...f, legenda: valor } : f)))
  }

  async function tornarPrincipal(fotoId: string) {
    await definirFotoPrincipal(fotoId)
    if (id) setFotosExistentes(await getFotosEquino(id))
  }

  async function salvar() {
    if (!form.nome.trim()) {
      setErroNome(true)
      toast.error("Informe o nome do equino")
      return
    }
    const racaFinal = form.raca === "Outra" ? form.racaCustom.trim() : form.raca
    const pelagemFinal = form.pelagem === "Outra" ? form.pelagemCustom.trim() : form.pelagem
    const agora = new Date().toISOString()
    const equinoId = editando && id ? id : crypto.randomUUID()

    const equino: Equino = {
      id: equinoId,
      nome: form.nome.trim(),
      apelido: form.apelido.trim() || undefined,
      sexo: form.sexo,
      nascimento: form.nascimento || undefined,
      raca: racaFinal,
      pelagem: pelagemFinal,
      registro: form.registro.trim() || undefined,
      microchip: form.microchip.trim() || undefined,
      paiId: form.paiId || undefined,
      maeId: form.maeId || undefined,
      origem: form.origem.trim() || undefined,
      temperamento: form.temperamento.trim() || undefined,
      altura: form.altura.trim() || undefined,
      status: form.status,
      observacoes: form.observacoes.trim() || undefined,
      createdAt: equinoOriginal?.createdAt ?? agora,
      updatedAt: agora,
    }

    await salvarEquino(equino)
    if (novasFotos.length > 0) {
      await adicionarFotos(equinoId, novasFotos.map((f) => ({ blob: f.blob, legenda: f.legenda })))
    }
    if (novosVideos.length > 0) {
      await adicionarVideos(equinoId, novosVideos.map((v) => v.blob))
    }

    if (editando) {
      toast.success("Equino atualizado com sucesso")
      navigate(`/equinos/${equinoId}`)
    } else {
      setSalvoId(equinoId)
      setSalvo(true)
      window.scrollTo({ top: 0 })
    }
  }

  async function excluir() {
    if (!id) return
    await excluirEquino(id)
    toast.success("Equino excluído")
    navigate("/equinos")
  }

  function reiniciar() {
    setForm(FORM_INICIAL)
    setNovasFotos((f) => {
      f.forEach((x) => URL.revokeObjectURL(x.url))
      return []
    })
    setNovosVideos((v) => {
      v.forEach((x) => URL.revokeObjectURL(x.url))
      return []
    })
    setErroNome(false)
    setSalvo(false)
  }

  if (salvo) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Card className="rounded-xl">
          <CardContent className="flex flex-col items-center gap-4 px-6 py-14 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <CheckCircle2 className="size-8" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold">Equino cadastrado!</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {form.nome} agora faz parte do seu haras. Que tal continuar?
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to={`/equinos/${salvoId}`}>
                <Button>Ver ficha do equino</Button>
              </Link>
              <Button variant="outline" onClick={reiniciar}>
                <Plus className="size-4" />
                Cadastrar outro
              </Button>
              <Link to="/equinos">
                <Button variant="ghost">Voltar à lista</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (carregando) {
    return <p className="py-10 text-center text-muted-foreground">Carregando…</p>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to={editando && id ? `/equinos/${id}` : "/equinos"}
            className="mb-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Voltar
          </Link>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {editando ? "Editar equino" : "Novo equino"}
          </h1>
        </div>
      </div>

      <Secao titulo="Identificação">
        <Campo label="Nome" obrigatorio className="sm:col-span-2">
          <Input
            value={form.nome}
            onChange={(e) => {
              setCampo("nome", e.target.value)
              if (e.target.value.trim()) setErroNome(false)
            }}
            placeholder="Ex.: Imperador da Serra"
            className={cn("rounded-lg", erroNome && "border-destructive focus-visible:ring-destructive/30")}
          />
          {erroNome && <p className="text-xs text-destructive">O nome é obrigatório.</p>}
        </Campo>
        <Campo label="Apelido">
          <Input value={form.apelido} onChange={(e) => setCampo("apelido", e.target.value)} placeholder="Como é chamado no dia a dia" className="rounded-lg" />
        </Campo>
        <Campo label="Sexo">
          <Select value={form.sexo} onValueChange={(v) => setCampo("sexo", v as Sexo)}>
            <SelectTrigger className="rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="macho">{SEXO_LABEL.macho}</SelectItem>
              <SelectItem value="femea">{SEXO_LABEL.femea}</SelectItem>
              <SelectItem value="castrado">{SEXO_LABEL.castrado}</SelectItem>
            </SelectContent>
          </Select>
        </Campo>
        <Campo label="Data de nascimento">
          <Input type="date" value={form.nascimento} onChange={(e) => setCampo("nascimento", e.target.value)} className="rounded-lg" />
        </Campo>
        <Campo label="Raça">
          <Select value={form.raca} onValueChange={(v) => setCampo("raca", v)}>
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="Selecione a raça" />
            </SelectTrigger>
            <SelectContent>
              {RACAS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>
        {form.raca === "Outra" && (
          <Campo label="Qual raça?">
            <Input value={form.racaCustom} onChange={(e) => setCampo("racaCustom", e.target.value)} placeholder="Digite a raça" className="rounded-lg" />
          </Campo>
        )}
        <Campo label="Pelagem">
          <Select value={form.pelagem} onValueChange={(v) => setCampo("pelagem", v)}>
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="Selecione a pelagem" />
            </SelectTrigger>
            <SelectContent>
              {PELAGENS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>
        {form.pelagem === "Outra" && (
          <Campo label="Qual pelagem?">
            <Input value={form.pelagemCustom} onChange={(e) => setCampo("pelagemCustom", e.target.value)} placeholder="Digite a pelagem" className="rounded-lg" />
          </Campo>
        )}
      </Secao>

      <Secao titulo="Registro e origem">
        <Campo label="Registro (ABC/ABCCMM etc.)">
          <Input value={form.registro} onChange={(e) => setCampo("registro", e.target.value)} placeholder="Ex.: MG-2020-00123" className="rounded-lg" />
        </Campo>
        <Campo label="Microchip">
          <Input value={form.microchip} onChange={(e) => setCampo("microchip", e.target.value)} placeholder="Número do chip" className="rounded-lg" />
        </Campo>
        <Campo label="Origem">
          <Input value={form.origem} onChange={(e) => setCampo("origem", e.target.value)} placeholder="Ex.: Criação própria, comprado de…" className="rounded-lg" />
        </Campo>
        <Campo label="Altura (alçada)">
          <Input value={form.altura} onChange={(e) => setCampo("altura", e.target.value)} placeholder="Ex.: 1,55 m" className="rounded-lg" />
        </Campo>
        <Campo label="Temperamento" className="sm:col-span-2">
          <Input value={form.temperamento} onChange={(e) => setCampo("temperamento", e.target.value)} placeholder="Ex.: Dócil, enérgico, cuidadoso…" className="rounded-lg" />
        </Campo>
      </Secao>

      <Secao titulo="Genealogia">
        <Campo label="Pai">
          <Select value={form.paiId} onValueChange={(v) => setCampo("paiId", v)}>
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="Selecione o pai" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nenhum">Não informado</SelectItem>
              {equinos
                .filter((e) => e.sexo === "macho" && e.id !== id)
                .map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nome}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </Campo>
        <Campo label="Mãe">
          <Select value={form.maeId} onValueChange={(v) => setCampo("maeId", v)}>
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="Selecione a mãe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nenhum">Não informado</SelectItem>
              {equinos
                .filter((e) => e.sexo === "femea" && e.id !== id)
                .map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nome}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </Campo>
      </Secao>

      <Secao titulo="Situação">
        <Campo label="Status">
          <Select value={form.status} onValueChange={(v) => setCampo("status", v as StatusEquino)}>
            <SelectTrigger className="rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>
        <Campo label="Observações" className="sm:col-span-2">
          <Textarea
            value={form.observacoes}
            onChange={(e) => setCampo("observacoes", e.target.value)}
            placeholder="Anotações importantes sobre o animal…"
            rows={3}
            className="rounded-lg"
          />
        </Campo>
      </Secao>

      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Fotos e vídeos</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={inputArquivo}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              adicionarArquivos(e.target.files)
              e.target.value = ""
            }}
          />
          {(fotosExistentes.length > 0 || novasFotos.length > 0) && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {fotosExistentes.map((f, i) => (
                <div key={f.id} className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-card shadow-xs">
                  <div className="group relative">
                    <HorseAvatar nome={form.nome || "Equino"} fotoUrl={urlsExistentes[i]} className="aspect-square" />
                    
                    {/* Botões de Ação Sempre Acessíveis no Celular e no Desktop */}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 z-10">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        aria-label="Definir como foto principal"
                        onClick={() => tornarPrincipal(f.id)}
                        className={cn(
                          "h-7 px-2 rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-all",
                          f.principal
                            ? "bg-amber-400 text-amber-950 font-black border border-amber-500"
                            : "bg-black/60 text-white hover:bg-black/80"
                        )}
                        title="Foto Principal"
                      >
                        <Star className={cn("size-3.5 mr-1", f.principal ? "fill-amber-950 text-amber-950" : "text-amber-300")} />
                        <span className="text-[10px]">{f.principal ? "Principal" : "Capa"}</span>
                      </Button>

                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        aria-label="Remover foto"
                        onClick={() => removerFotoExistente(f.id)}
                        className="size-7 rounded-lg shadow-sm active:scale-95 bg-rose-600/90 hover:bg-rose-700 text-white"
                        title="Excluir foto"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    {f.principal && (
                      <span className="absolute left-2 top-2 z-10 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-amber-950 shadow-md">
                        ★ Capa Principal
                      </span>
                    )}
                  </div>

                  <div className="border-t border-border bg-muted/20 p-2">
                    <Input
                      value={legendasExistentes[f.id] ?? ""}
                      onChange={(e) =>
                        setLegendasExistentes((prev) => ({ ...prev, [f.id]: e.target.value }))
                      }
                      onBlur={() => salvarLegendaExistente(f.id)}
                      placeholder="Legenda da foto..."
                      className="h-7.5 rounded-lg px-2 text-xs bg-background"
                    />
                  </div>
                </div>
              ))}

              {novasFotos.map((f, index) => (
                <div key={f.id} className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-card shadow-xs">
                  <div className="group relative">
                    <img src={f.url} alt="Nova foto" className="aspect-square w-full object-cover" />

                    {/* Botões de Ação para Novas Fotos */}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 z-10">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          // Move para o topo para virar principal
                          setNovasFotos((prev) => [f, ...prev.filter((x) => x.id !== f.id)])
                          toast.success("Foto definida como principal (Capa)")
                        }}
                        className={cn(
                          "h-7 px-2 rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-all",
                          index === 0 && fotosExistentes.length === 0
                            ? "bg-amber-400 text-amber-950 font-black border border-amber-500"
                            : "bg-black/60 text-white hover:bg-black/80"
                        )}
                        title="Definir como foto principal"
                      >
                        <Star className={cn("size-3.5 mr-1", index === 0 && fotosExistentes.length === 0 ? "fill-amber-950 text-amber-950" : "text-amber-300")} />
                        <span className="text-[10px]">
                          {index === 0 && fotosExistentes.length === 0 ? "Principal" : "Tornar Capa"}
                        </span>
                      </Button>

                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        aria-label="Remover foto"
                        onClick={() => removerNovaFoto(f.id)}
                        className="size-7 rounded-lg shadow-sm active:scale-95 bg-rose-600/90 hover:bg-rose-700 text-white"
                        title="Excluir foto"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    <span className="absolute left-2 top-2 z-10 rounded-full bg-[#143129] px-2 py-0.5 text-[10px] font-bold text-[#d9b978] shadow-md border border-[#d9b978]/30">
                      Nova
                    </span>
                  </div>

                  <div className="border-t border-border bg-muted/20 p-2">
                    <Input
                      value={f.legenda}
                      onChange={(e) => atualizarLegendaNova(f.id, e.target.value)}
                      placeholder="Legenda da foto..."
                      className="h-7.5 rounded-lg px-2 text-xs bg-background"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => inputArquivo.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-4 py-8 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/60 hover:text-foreground"
          >
            <ImagePlus className="size-6" />
            <span className="text-sm font-medium">Adicionar fotos</span>
            <span className="text-xs">Você pode enviar várias de uma vez — a primeira vira a capa</span>
          </button>

          <div className="flex items-center gap-3 pt-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Vídeos</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <input
            ref={inputVideo}
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={(e) => {
              adicionarArquivosVideo(e.target.files)
              e.target.value = ""
            }}
          />
          {(videosExistentes.length > 0 || novosVideos.length > 0) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {videosExistentes.map((v, i) => (
                <div key={v.id} className="group relative overflow-hidden rounded-lg border border-border">
                  <video src={urlsVideos[i]} controls playsInline className="aspect-video w-full bg-black" />
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="destructive"
                      aria-label="Remover vídeo"
                      onClick={() => removerVideoExistente(v.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  <span className="absolute left-2 top-2 rounded-full bg-primary/90 px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    Vídeo
                  </span>
                </div>
              ))}
              {novosVideos.map((v) => (
                <div key={v.id} className="group relative overflow-hidden rounded-lg border border-border">
                  <video src={v.url} controls playsInline className="aspect-video w-full bg-black" />
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="destructive"
                      aria-label="Remover vídeo"
                      onClick={() => removerNovoVideo(v.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  <span className="absolute left-2 top-2 rounded-full bg-emerald-600/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    Novo
                  </span>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => inputVideo.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-4 py-8 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/60 hover:text-foreground"
          >
            <Clapperboard className="size-6" />
            <span className="text-sm font-medium">Adicionar vídeos</span>
            <span className="text-xs">Grave ou envie um vídeo do cavalo — ótimo para ver o andamento e o temperamento</span>
          </button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <div className="flex gap-3">
          <Button size="lg" className="rounded-lg" onClick={salvar}>
            <CheckCircle2 className="size-4" />
            {editando ? "Salvar alterações" : "Cadastrar equino"}
          </Button>
          <Button variant="outline" size="lg" className="rounded-lg" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
        </div>
        {editando && (
          <Button
            variant="ghost"
            size="lg"
            className="rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setConfirmarExclusao(true)}
          >
            <Trash2 className="size-4" />
            Excluir
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmarExclusao}
        onOpenChange={setConfirmarExclusao}
        titulo="Excluir equino?"
        descricao="Esta ação remove o equino, as fotos e todos os registros de saúde. Essa ação não pode ser desfeita."
        confirmText="Excluir"
        onConfirm={excluir}
      />
    </div>
  )
}


