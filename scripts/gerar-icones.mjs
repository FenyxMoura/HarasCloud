// Gera os ícones PNG do PWA (ferradura dourada em fundo verde) sem dependências.
// Uso: node scripts/gerar-icones.mjs
import { deflateSync } from "node:zlib"
import { writeFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..")
const saida = join(raiz, "public")

// ---------- Codificação PNG ----------
function crc32(buf) {
  const tabela = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    tabela[n] = c >>> 0
  }
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = tabela[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(tipo, dados) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(dados.length)
  const tipoBuf = Buffer.from(tipo, "ascii")
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([tipoBuf, dados])))
  return Buffer.concat([len, tipoBuf, dados, crc])
}

function codificarPng(size, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // profundidade de bits
  ihdr[9] = 6 // RGBA
  const stride = size * 4 + 1
  const raw = Buffer.alloc(stride * size)
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0 // filtro none
    rgba.copy(raw, y * stride + 1, y * size * 4, (y + 1) * size * 4)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))])
}

// ---------- Desenho ----------
function lerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

const VERDE_1 = [0x1e, 0x43, 0x34]
const VERDE_2 = [0x0b, 0x20, 0x18]
const DOURADO = [0xd9, 0xb9, 0x78]
const DOURADO_CLARO = [0xf0, 0xdc, 0xab]

// Normaliza ângulo (graus) para 0..360
function angulo(px, py, cx, cy) {
  const a = (Math.atan2(py - cy, px - cx) * 180) / Math.PI
  return a < 0 ? a + 360 : a
}

/** Desenha um pixel (0..1 normalizado) — retorna cor RGBA ou null se transparente. */
function corPixel(px, py, maskable) {
  // Fundo: gradiente diagonal verde + brilho radial sutil
  const t = (px + py) / 2
  let cor = lerp(VERDE_1, VERDE_2, t)
  const dx = px - 0.5
  const dy = py - 0.5
  const distCentro = Math.sqrt(dx * dx + dy * dy)
  cor = lerp(cor, [0x2a, 0x5c, 0x47], Math.max(0, 1 - distCentro * 1.6) * 0.35)

  // Ferradura
  const cx = 0.5
  const cy = 0.52
  const re = maskable ? 0.30 : 0.34 // raio externo
  const ri = re * 0.6 // raio interno
  const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2)
  const a = angulo(px, py, cx, cy)
  // Aberta em cima: exclui ângulos 88°..132° (topo, canvas y cresce para baixo)
  const noArco = dist >= ri && dist <= re && !(a > 88 && a < 132)
  if (noArco) {
    // Brilho no arco: mais claro no topo do "U"
    const brilho = Math.max(0, Math.cos(((a - 200) * Math.PI) / 180)) * 0.35
    const c = lerp(DOURADO, DOURADO_CLARO, brilho)
    return [c[0], c[1], c[2], 255]
  }

  // Furos de prego (3): nas pontas e no centro inferior
  const furos = [
    { a: 100, raio: 0.028 }, // ponta direita (topo)
    { a: 120, raio: 0.028 }, // ponta esquerda (topo)
    { a: 210, raio: 0.03 }, // centro inferior
  ]
  const rm = (re + ri) / 2
  for (const f of furos) {
    const fa = (f.a * Math.PI) / 180
    const fx = cx + Math.cos(fa) * rm
    const fy = cy + Math.sin(fa) * rm
    if (Math.sqrt((px - fx) ** 2 + (py - fy) ** 2) <= f.raio) {
      return [cor[0], cor[1], cor[2], 255]
    }
  }

  // Cantos arredondados (só nos ícones normais)
  if (!maskable) {
    const raioCanto = 0.12
    const cxs = px < 0.5 ? raioCanto : 1 - raioCanto
    const cys = py < 0.5 ? raioCanto : 1 - raioCanto
    const noCanto = (px < 0.5 ? px < raioCanto : px > 1 - raioCanto) && (py < 0.5 ? py < raioCanto : py > 1 - raioCanto)
    if (noCanto && Math.sqrt((px - cxs) ** 2 + (py - cys) ** 2) > raioCanto) {
      return null
    }
  }

  return [cor[0], cor[1], cor[2], 255]
}

function desenharIcone(size, maskable) {
  const SS = 3 // supersampling para suavizar bordas
  const rgba = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = (x + (sx + 0.5) / SS) / size
          const py = (y + (sy + 0.5) / SS) / size
          const c = corPixel(px, py, maskable)
          if (c) {
            r += c[0]
            g += c[1]
            b += c[2]
            a += 1
          }
        }
      }
      const total = SS * SS
      const idx = (y * size + x) * 4
      if (a === 0) {
        rgba[idx] = 0
        rgba[idx + 1] = 0
        rgba[idx + 2] = 0
        rgba[idx + 3] = 0
      } else {
        rgba[idx] = Math.round(r / a)
        rgba[idx + 1] = Math.round(g / a)
        rgba[idx + 2] = Math.round(b / a)
        rgba[idx + 3] = 255
      }
    }
  }
  return codificarPng(size, rgba)
}

mkdirSync(saida, { recursive: true })

const alvos = [
  ["icon-192.png", 192, false],
  ["icon-512.png", 512, false],
  ["icon-maskable-512.png", 512, true],
  ["apple-touch-icon.png", 180, false],
]

for (const [nome, size, maskable] of alvos) {
  const buf = desenharIcone(size, maskable)
  writeFileSync(join(saida, nome), buf)
  console.log(`✓ public/${nome} (${size}x${size})`)
}
