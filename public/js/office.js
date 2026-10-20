/**
 * Simulador do escritorio (/office/).
 *
 * Cena isometrica 2:1 em pixel art num canvas de baixa resolucao (472x456),
 * ampliado em multiplos inteiros pelo CSS. Os objetos que ja tem sprite em
 * `public/sprites/` usam o PNG; os demais ainda sao desenhados por codigo.
 *
 * Sistema de coordenadas: x e y sao em tiles (a sala vai de 0 a RX e de 0 a
 * RY, com a camera olhando de +x,+y para a origem) e z e em pixels. Cada
 * tile tem 32x16 px na tela e ~20 cm (a mesa tem 9 tiles de comprimento). A parede da esquerda e o plano x = 0, a da
 * direita e o plano y = 0.
 *
 * Cada objeto e desenhado tambem num segundo canvas ("buffer de ids"), com
 * uma cor chapada por id, que serve para saber o que esta sob o mouse.
 */
;(() => {
  const root = document.querySelector('[data-office]')
  const canvas = document.querySelector('[data-office-canvas]')
  const dataEl = document.getElementById('office-data')
  if (!root || !canvas || !dataEl) return

  const data = JSON.parse(dataEl.textContent)
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  // ------------------------------------------------------------------
  // Constantes e contextos
  // ------------------------------------------------------------------
  const W = 472
  const H = 456
  const OX = 204
  const OY = 212
  const RX = 16
  const RY = 12
  const WALL = 200
  // Altura do tampo da mesa em px (a do sprite) e na escala antiga do codigo.
  const DESK_TOP = 59
  const DESK_Z = 26

  const ctx = canvas.getContext('2d')
  const idCanvas = document.createElement('canvas')
  idCanvas.width = W
  idCanvas.height = H
  const idCtx = idCanvas.getContext('2d', { willReadFrequently: true })
  const bgCanvas = document.createElement('canvas')
  bgCanvas.width = W
  bgCanvas.height = H
  const bgCtx = bgCanvas.getContext('2d')

  const keys = Object.keys(data.objects)
  const IDX = {}
  keys.forEach((k, i) => (IDX[k] = i + 1))
  const AVATAR_ID = keys.length + 1
  const ID_COLORS = []
  for (let i = 0; i <= AVATAR_ID; i++) ID_COLORS[i] = `rgb(${i},0,0)`

  // ------------------------------------------------------------------
  // Primitivas de desenho
  // ------------------------------------------------------------------
  let C = ctx
  let curId = 0
  // Transformacao dos objetos desenhados por codigo, que foram escritos numa
  // escala menor: {ox, oy, oz} sao a origem antiga, {nx, ny, nz} a nova, k
  // escala x e y e kz escala z. Nulo para o que usa a escala dos sprites.
  let LG = null
  function legacy(def, fn, ...args) {
    LG = def
    fn(...args)
    LG = null
  }
  function xf(def, b) {
    const [x0, y0, x1, y1, z0, z1] = b
    const X = (v) => (v - def.ox) * def.k + def.nx
    const Y = (v) => (v - def.oy) * def.k + def.ny
    const Z = (v) => (v - (def.oz || 0)) * def.kz + (def.nz || 0)
    const r = [X(x0), Y(y0), X(x1), Y(y1)]
    return z0 === undefined ? r : [...r, Z(z0), Z(z1)]
  }

  const use = (name) => (curId = IDX[name] || 0)

  function px(x, y, w, h, col) {
    if (w <= 0 || h <= 0) return
    C.fillStyle = col
    C.fillRect(x, y, w, h)
    if (curId && C === ctx) {
      idCtx.fillStyle = ID_COLORS[curId]
      idCtx.fillRect(x, y, w, h)
    }
  }

  const q = (v) => Math.round(v * 16) / 16
  function P(x, y, z) {
    if (LG) {
      x = (x - LG.ox) * LG.k + LG.nx
      y = (y - LG.oy) * LG.k + LG.ny
      z = (z - (LG.oz || 0)) * LG.kz + (LG.nz || 0)
    }
    x = q(x)
    y = q(y)
    return [Math.round(OX + (x - y) * 16), Math.round(OY + (x + y) * 8 - z)]
  }

  function poly(pts, col) {
    let minY = Infinity
    let maxY = -Infinity
    for (const p of pts) {
      if (p[1] < minY) minY = p[1]
      if (p[1] > maxY) maxY = p[1]
    }
    const n = pts.length
    for (let y = Math.round(minY); y < Math.round(maxY); y++) {
      const yc = y + 0.5
      const xs = []
      for (let i = 0; i < n; i++) {
        const a = pts[i]
        const b = pts[(i + 1) % n]
        if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) {
          xs.push(a[0] + ((yc - a[1]) / (b[1] - a[1])) * (b[0] - a[0]))
        }
      }
      xs.sort((a, b) => a - b)
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const x0 = Math.round(xs[k])
        const x1 = Math.round(xs[k + 1])
        if (x1 > x0) px(x0, y, x1 - x0, 1, col)
      }
    }
  }

  function line(x0, y0, x1, y1, col) {
    const dx = Math.abs(x1 - x0)
    const dy = -Math.abs(y1 - y0)
    const sx = x0 < x1 ? 1 : -1
    const sy = y0 < y1 ? 1 : -1
    let err = dx + dy
    for (;;) {
      px(x0, y0, 1, 1, col)
      if (x0 === x1 && y0 === y1) break
      const e2 = 2 * err
      if (e2 >= dy) {
        err += dy
        x0 += sx
      }
      if (e2 <= dx) {
        err += dx
        y0 += sy
      }
    }
  }

  function ell(cx, cy, rx, ry, col) {
    for (let y = -ry; y <= ry; y++) {
      const half = Math.round(rx * Math.sqrt(1 - (y / ry) * (y / ry)))
      px(cx - half, cy + y, half * 2 + 1, 1, col)
    }
  }

  // Cores: hex -> {top, left, right} (luz vindo de cima e da esquerda).
  function mix(hex, to, f) {
    const n = parseInt(hex.slice(1), 16)
    const t = to === 'w' ? 255 : 0
    const ch = (s) => Math.round(((n >> s) & 255) * (1 - f) + t * f)
    return `rgb(${ch(16)},${ch(8)},${ch(0)})`
  }
  const matCache = {}
  function mat(hex) {
    return (matCache[hex] ||= {
      top: mix(hex, 'w', 0.16),
      left: hex,
      right: mix(hex, 'b', 0.3),
    })
  }
  const asMat = (m) => (typeof m === 'string' ? mat(m) : m)

  // Caixa: top, face +y ("left") e face +x ("right").
  function box(x, y, z, w, d, h, m) {
    m = asMat(m)
    poly(
      [
        P(x, y + d, z + h),
        P(x + w, y + d, z + h),
        P(x + w, y + d, z),
        P(x, y + d, z),
      ],
      m.left,
    )
    poly(
      [
        P(x + w, y, z + h),
        P(x + w, y + d, z + h),
        P(x + w, y + d, z),
        P(x + w, y, z),
      ],
      m.right,
    )
    poly(
      [
        P(x, y, z + h),
        P(x + w, y, z + h),
        P(x + w, y + d, z + h),
        P(x, y + d, z + h),
      ],
      m.top,
    )
  }

  // Retangulos em pixels sobre uma face. u anda ao longo do eixo da face e
  // v para cima, ambos em px a partir do ponto (x, y, z) (e escalados junto
  // com o objeto, se ele for desenhado na escala antiga).
  function fyRect(x, y, z, u0, u1, v0, v1, col) {
    const [bx, by] = P(x, y, z)
    if (LG) {
      u0 = Math.round(u0 * LG.k)
      u1 = Math.round(u1 * LG.k)
      v0 = Math.round(v0 * LG.kz)
      v1 = Math.round(v1 * LG.kz)
    }
    for (let i = u0; i < u1; i++) {
      px(bx + i, by - v1 + ((i + 1) >> 1), 1, v1 - v0, col)
    }
  }
  function fxRect(x, y, z, u0, u1, v0, v1, col) {
    const [bx, by] = P(x, y, z)
    if (LG) {
      u0 = Math.round(u0 * LG.k)
      u1 = Math.round(u1 * LG.k)
      v0 = Math.round(v0 * LG.kz)
      v1 = Math.round(v1 * LG.kz)
    }
    for (let i = u0; i < u1; i++) {
      px(bx - i - 1, by - v1 + ((i + 1) >> 1), 1, v1 - v0, col)
    }
  }

  // Ponto sobre uma face de cima (2x1 px na escala antiga).
  function dot(x, y, z, col) {
    const [sx, sy] = P(x, y, z)
    const k = LG ? LG.k : 1
    const w = Math.round(2 * k)
    px(sx - (w >> 1), sy, w, Math.max(1, Math.round(k)), col)
  }

  // Sprites PNG. O nome do arquivo termina em _LxP.png (largura e
  // profundidade em tiles); a imagem tem (L+P)*16 px de largura e a altura
  // e a do losango da base ((L+P)*8) mais a altura do objeto, com a base
  // alinhada ao fundo da imagem.
  const SPRITE_DIR = '/sprites/'
  const SPRITE_FILES = {
    desk: 'mesa_regulavel_9x3',
    pad: 'mousepad_4x2',
    laptop: 'macbook_air_2x1',
    keyboard: 'teclado_75_2x1',
    mouse: 'mouse_1x1',
    monitor: 'monitor_ultrawide_sem_base_3x1',
    arm: 'suporte_monitor_3x1',
  }
  const SPR = {}
  for (const [key, file] of Object.entries(SPRITE_FILES)) {
    const [, w, d] = file.match(/_(\d+)x(\d+)$/)
    const s = { w: +w, d: +d, ready: false, img: new Image(), masks: {} }
    s.img.onload = () => {
      s.h = s.img.height - (s.w + s.d) * 8
      s.ready = true
    }
    s.img.src = `${SPRITE_DIR}${file}.png`
    SPR[key] = s
  }

  // Silhueta do sprite numa cor chapada, para o buffer de ids.
  function spriteMask(s, id) {
    if (!s.masks[id]) {
      const m = document.createElement('canvas')
      m.width = s.img.width
      m.height = s.img.height
      const mc = m.getContext('2d')
      mc.drawImage(s.img, 0, 0)
      mc.globalCompositeOperation = 'source-in'
      mc.fillStyle = ID_COLORS[id]
      mc.fillRect(0, 0, m.width, m.height)
      s.masks[id] = m
    }
    return s.masks[id]
  }

  // Desenha o sprite com o canto de tras da base em (x, y) e altura z.
  function sprite(key, x, y, z = 0) {
    const s = SPR[key]
    if (!s.ready) return
    const left = Math.round(OX + (x - y) * 16) - s.d * 16
    const top =
      Math.round(OY + (x + y) * 8 - z) + (s.w + s.d) * 8 - s.img.height
    ctx.drawImage(s.img, left, top)
    if (curId) idCtx.drawImage(spriteMask(s, curId), left, top)
  }

  // ------------------------------------------------------------------
  // Paleta
  // ------------------------------------------------------------------
  const wood = {
    top: '#5d4333',
    left: '#41301f',
    right: '#2f2217',
  }
  const dark = '#1d1e22'
  const metal = '#c7cacf'
  const OUTLINE = '#2a2230'

  // ------------------------------------------------------------------
  // Fundo estatico: piso, paredes e sombras
  // ------------------------------------------------------------------
  function rng(seed) {
    return () => {
      seed |= 0
      seed = (seed + 0x6d2b79f5) | 0
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  function drawBackground() {
    C = bgCtx
    curId = 0
    C.fillStyle = '#00000000'
    C.clearRect(0, 0, W, H)

    // laje do piso
    poly([P(0, RY, 0), P(RX, RY, 0), P(RX, RY, -10), P(0, RY, -10)], '#8d6b42')
    poly([P(RX, 0, 0), P(RX, RY, 0), P(RX, RY, -10), P(RX, 0, -10)], '#6c4f31')

    // base do piso (as tabuas deixam frestas de 1px entre si)
    poly([P(0, 0, 0), P(RX, 0, 0), P(RX, RY, 0), P(0, RY, 0)], '#c9a66e')

    // tabuas do piso
    const rand = rng(7)
    const tones = ['#d2b27c', '#c9a66e', '#d8ba86', '#c4a068']
    const groove = '#b8935a'
    for (let j = 0; j < RY; j++) {
      const y0 = j
      const y1 = j + 1
      let x = -rand() * 5
      while (x < RX) {
        const len = 4 + rand() * 5
        const a = Math.max(0, x)
        const b = Math.min(RX, x + len)
        if (b > a) {
          const col = tones[Math.floor(rand() * tones.length)]
          poly([P(a, y0, 0), P(b, y0, 0), P(b, y1, 0), P(a, y1, 0)], col)
          const [e0x, e0y] = P(b, y0, 0)
          const [e1x, e1y] = P(b, y1, 0)
          if (b < RX) line(e0x, e0y, e1x, e1y, groove)
        }
        x += len
      }
    }

    // sombras no chao (so dos objetos soltos)
    C.globalAlpha = 0.16
    for (const g of groups) {
      if (!g.shadow) continue
      const [x0, y0, x1, y1] = g.shadow
      const X1 = Math.min(RX, x1 + 1.2)
      const Y1 = Math.min(RY, y1 + 1.2)
      poly(
        [
          P(x0 + 0.5, y0 + 0.5, 0),
          P(X1, y0 + 0.5, 0),
          P(X1, Y1, 0),
          P(x0 + 0.5, Y1, 0),
        ],
        '#2a1d10',
      )
    }
    C.globalAlpha = 1

    // paredes
    box(-0.6, -0.6, 0, 0.6, RY + 0.6, WALL, {
      top: '#e4e4df',
      left: '#a3a8ad',
      right: '#9aa0a8',
    })
    box(0, -0.6, 0, RX, 0.6, WALL, {
      top: '#eaeae5',
      left: '#b6bbc1',
      right: '#8e949b',
    })
    // rodape
    const [lbx, lby] = P(0, 0, 0)
    for (let i = 0; i < RX * 16; i++) {
      px(lbx + i, lby - 8 + ((i + 1) >> 1), 1, 8, '#dedfdb')
    }
    for (let i = 0; i < RY * 16; i++) {
      px(lbx - i - 1, lby - 8 + ((i + 1) >> 1), 1, 8, '#cfd1cf')
    }

    // contorno externo da sala
    const buf = bgCtx.getImageData(0, 0, W, H).data
    bgCtx.fillStyle = OUTLINE
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const o = (y * W + x) * 4
        if (buf[o + 3] !== 0) continue
        if (
          (x > 0 && buf[o - 1] !== 0) ||
          (x < W - 1 && buf[o + 7] !== 0) ||
          (y > 0 && buf[o - W * 4 + 3] !== 0) ||
          (y < H - 1 && buf[o + W * 4 + 3] !== 0)
        ) {
          bgCtx.fillRect(x, y, 1, 1)
        }
      }
    }
  }

  // ------------------------------------------------------------------
  // Objetos
  // ------------------------------------------------------------------
  // Escalas antigas -> escala dos sprites.
  const SCALE = { k: 2.5, kz: 2.27, oz: 0, nz: 0 }
  const L = {
    door: { ...SCALE, ox: 0.1, oy: 0, nx: 0.8, ny: 0 },
    curtain: { ...SCALE, ox: 8.3, oy: 0, nx: 14, ny: 0 },
    shelf: { ...SCALE, ox: 0, oy: 2.2, nx: 0, ny: 3 },
    backpack: { ...SCALE, ox: 0.12, oy: 4.3, nx: 0.2, ny: 8.2 },
    plant: { ...SCALE, ox: 0.12, oy: 5.27, nx: 0.2, ny: 9.85 },
    ringlight: { ...SCALE, ox: 8.1, oy: 5.9, nx: 13.6, ny: 9.5 },
    // Itens pequenos sobre a mesa: mais escala em x/y que em z.
    notebook: {
      k: 1.3,
      kz: 1.6,
      ox: 1.85,
      oy: 1.2,
      nx: 5.6,
      ny: 1.6,
      oz: DESK_Z,
      nz: DESK_TOP,
    },
    phone: {
      k: 1.6,
      kz: 1.0,
      ox: 3.0,
      oy: 0.9,
      nx: 7.4,
      ny: 1.5,
      oz: DESK_Z,
      nz: DESK_TOP,
    },
    cat: {
      k: 1.3,
      kz: 1.3,
      ox: 7.4,
      oy: 0.25,
      nx: 11.9,
      ny: 1.2,
      oz: DESK_Z,
      nz: DESK_TOP,
    },
    mic: {
      k: 1.2,
      kz: 1.3,
      ox: 8.15,
      oy: 1.85,
      nx: 13.8,
      ny: 0.6,
      oz: DESK_Z,
      nz: DESK_TOP,
    },
    slippers: {
      k: 1.6,
      kz: 1.5,
      ox: 4.2,
      oy: 0.8,
      nx: 8.6,
      ny: 0.5,
      oz: 0,
      nz: 0,
    },
  }

  function drawNotebook() {
    use('notebook')
    box(1.85, 1.2, DESK_Z, 0.9, 0.7, 0.8, '#b8402e')
    box(1.9, 1.25, DESK_Z + 0.8, 0.9, 0.7, 0.9, '#e8b92f')
    box(2.1, 1.9, DESK_Z, 0.9, 0.07, 0.9, '#15161a')
  }

  function drawPhone() {
    use('phone')
    box(3.0, 0.9, DESK_Z, 0.4, 0.35, 1, '#15161a')
    box(3.05, 1.0, DESK_Z + 1, 0.3, 0.1, 11, '#0e0f12')
    fyRect(3.05, 1.1, DESK_Z + 1, 1, 4, 2, 10, '#262b33')
  }

  function drawCat(t) {
    use('cat')
    const breath = reduceMotion ? 0 : Math.round(Math.sin(t / 450) * 0.5 + 0.5)
    const z0 = DESK_Z + 0.8
    // cauda (balanca de vez em quando)
    const flick =
      !reduceMotion &&
      Math.floor(t / 1700) % 4 === 0 &&
      Math.floor(t / 120) % 2 === 0
    box(flick ? 8.2 : 8.12, 0.55, z0, 0.12, 0.45, 6, '#2a1c15')
    // corpo sentado, de frente para a sala
    box(7.58, 0.5, z0, 0.64, 0.72, 7 + breath, '#7b4b2c')
    fyRect(7.58, 1.22, z0, 3, 7, 0, 5, '#efe3d0')
    // cabeca
    const hz = z0 + 5 + breath
    box(7.56, 0.95, hz, 0.68, 0.55, 6, '#8a5a36')
    // orelhas
    box(7.56, 0.98, hz + 6, 0.16, 0.16, 2, '#2a1c15')
    box(8.08, 0.98, hz + 6, 0.16, 0.16, 2, '#2a1c15')
    // manchas laranja e preta
    dot(7.75, 0.6, z0 + 7 + breath, '#d98a3a')
    dot(8.0, 0.7, z0 + 7 + breath, '#15100d')
    dot(7.8, 0.85, z0 + 7 + breath, '#d98a3a')
    fyRect(7.56, 1.5, hz, 0, 5, 3, 6, '#d98a3a')
    fyRect(7.56, 1.5, hz, 8, 11, 3, 6, '#15100d')
    // olhos e focinho
    fyRect(7.56, 1.5, hz, 3, 5, 2, 4, '#d6c24a')
    fyRect(7.56, 1.5, hz, 7, 9, 2, 4, '#d6c24a')
    fyRect(7.56, 1.5, hz, 4, 5, 2, 4, '#15100d')
    fyRect(7.56, 1.5, hz, 8, 9, 2, 4, '#15100d')
    fyRect(7.56, 1.5, hz, 5, 7, 0, 1, '#e8a87c')
  }

  function drawMic() {
    use('mic')
    box(8.15, 1.85, DESK_Z, 0.1, 0.1, 25, '#17181b')
    box(7.0, 1.87, DESK_Z + 23, 1.25, 0.08, 2, '#17181b')
    box(7.05, 1.7, DESK_Z + 10, 0.32, 0.32, 14, '#26282d')
    box(7.1, 1.74, DESK_Z + 20, 0.22, 0.22, 4, '#6d7078')
  }

  function drawSlippers() {
    use('slippers')
    box(4.2, 0.8, 0, 0.45, 0.9, 3, '#2d3036')
    box(5.0, 1.0, 0, 0.45, 0.9, 3, '#2d3036')
    box(4.22, 0.85, 3, 0.4, 0.4, 0.5, '#1b1d21')
    box(5.02, 1.05, 3, 0.4, 0.4, 0.5, '#1b1d21')
  }

  // Mesa e tudo o que esta sobre ela, de tras para a frente. As posicoes dos
  // sprites sao o canto de tras da base, em tiles.
  function drawDesk(t) {
    legacy(L.slippers, drawSlippers)
    use('desk')
    sprite('desk', 5, 0, 0)
    sprite('pad', 8, 1, DESK_TOP)
    use('monitorL')
    sprite('arm', 5.3, 0, DESK_TOP)
    sprite('monitor', 5.3, 0, DESK_TOP)
    use('laptop')
    sprite('laptop', 8.6, 0, DESK_TOP)
    use('monitorR')
    sprite('arm', 10.9, 0, DESK_TOP)
    sprite('monitor', 10.9, 0, DESK_TOP)
    legacy(L.notebook, drawNotebook)
    legacy(L.phone, drawPhone)
    use('keyboard')
    sprite('keyboard', 8.6, 1.6, DESK_TOP + 1)
    use('mouse')
    sprite('mouse', 11, 1.8, DESK_TOP + 1)
    legacy(L.cat, drawCat, t)
    legacy(L.mic, drawMic)
  }

  const bookColors = [
    '#16171b',
    '#2f5f8a',
    '#7a2a2e',
    '#d6b24a',
    '#e8e4da',
    '#2e6a4f',
    '#b8532e',
    '#3a3a46',
  ]

  function drawShelf() {
    use('shelf')
    const post = '#1b1c1f'
    const board = '#b8723a'
    // pernas de tras e da frente
    box(0.0, 2.2, 0, 0.1, 0.1, 82, post)
    box(0.0, 4.1, 0, 0.1, 0.1, 82, post)
    // fundo e prateleira de baixo
    box(0.05, 2.25, 6, 0.7, 1.9, 2, board)
    box(0.2, 2.5, 8, 0.5, 0.7, 5, '#c49a68')
    box(0.22, 3.3, 8, 0.45, 0.5, 6, '#1f2024')
    // gavetas
    const dr = { top: '#d28a4a', left: '#c27a38', right: '#bf7a3c' }
    box(0.05, 2.3, 14, 0.72, 1.8, 22, dr)
    fxRect(0.77, 2.3, 14, 1, 28, 10, 11, '#8a5424')
    fxRect(0.77, 2.3, 14, 9, 20, 5, 6, '#15161a')
    fxRect(0.77, 2.3, 14, 9, 20, 16, 17, '#15161a')
    // pernas da frente
    box(0.7, 2.2, 0, 0.1, 0.1, 82, post)
    box(0.7, 4.1, 0, 0.1, 0.1, 82, post)

    // maquina de escrever
    use('typewriter')
    box(0.1, 2.5, 36, 0.62, 1.1, 5, '#cfcac0')
    box(0.05, 2.4, 41, 0.36, 1.3, 2, '#25262a')
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 8; c++) {
        fxRect(
          0.72,
          2.55,
          36,
          2 + c * 2,
          3 + c * 2,
          1 + r * 1.5,
          2 + r * 1.5,
          '#6a6860',
        )
      }
    }

    // copo de canetas
    use('shelf')
    box(0.3, 3.8, 36, 0.28, 0.28, 5, '#2b5fc4')

    // prateleira de livros
    box(0.05, 2.25, 47, 0.7, 1.9, 2, board)
    use('camera')
    box(0.18, 2.35, 49, 0.45, 0.5, 6, '#1d1d1f')
    box(0.55, 2.45, 50, 0.18, 0.3, 3, '#33343a')
    use('books')
    let yy = 2.95
    const heights = [11, 10, 11, 9, 11, 10, 8, 11, 9, 10, 8]
    for (let i = 0; i < heights.length && yy < 4.0; i++) {
      const th = 0.09 + (i % 3) * 0.02
      box(0.2, yy, 49, 0.5, th, heights[i], bookColors[i % bookColors.length])
      yy += th
    }

    // prateleira de cima
    use('shelf')
    box(0.05, 2.25, 62, 0.7, 1.9, 2, board)
    use('books')
    box(0.15, 2.4, 64, 0.55, 0.8, 4, '#2a5d7a')
    box(0.18, 2.45, 68, 0.5, 0.7, 3, '#3a7a5a')
    box(0.15, 3.3, 64, 0.5, 0.6, 3, '#e8e4da')
    use('camera')
    box(0.15, 3.3, 67, 0.4, 0.5, 5, '#1d1d1f')
    box(0.5, 3.45, 68, 0.15, 0.25, 2.5, '#33343a')
    use('shelf')
    box(0.35, 4.0, 64, 0.2, 0.15, 4, '#a63a30')

    // tampo
    box(0.0, 2.2, 78, 0.85, 2.0, 2, board)
    box(0.35, 2.4, 80, 0.1, 0.6, 9, '#1c1c1f')
    fxRect(0.45, 2.45, 82, 1, 8, 0, 6, '#e4c9a0')
    box(0.35, 3.2, 80, 0.2, 0.2, 5, '#6aa84a')

    // chapeu seletor
    use('hat')
    const [hx, hy] = P(0.4, 3.85, 80)
    const hs = 2
    const hp = (dx, dy) => [hx + dx * hs, hy + dy * hs]
    ell(hx, hy - hs, 11 * hs, 4 * hs, '#4a3a2b')
    ell(hx, hy - 2 * hs, 9 * hs, 3 * hs, '#5a4733')
    poly(
      [hp(-6, -2), hp(6, -2), hp(8, -20), hp(12, -32), hp(4, -30), hp(-2, -16)],
      '#54402f',
    )
    poly([hp(2, -4), hp(6, -4), hp(8, -20), hp(12, -32), hp(8, -26)], '#3c2d20')
  }

  function drawPlant() {
    use('plant')
    box(0.25, 5.4, 0, 0.6, 0.6, 12, '#34373c')
    box(0.22, 5.37, 12, 0.66, 0.66, 1.2, '#4a4d54')
    const [cx, cy] = P(0.55, 5.7, 13)
    const leaves = [
      [-4, -8, 7, 9, '#1c5430'],
      [8, -10, 8, 8, '#2a7a44'],
      [-10, -20, 8, 8, '#2a7a44'],
      [2, -22, 8, 10, '#1f6a38'],
      [12, -26, 7, 7, '#19492b'],
      [-2, -34, 7, 8, '#2f8a4c'],
      [10, -38, 6, 7, '#2a7a44'],
    ]
    const ls = 2.5
    leaves.forEach(([dx, dy, rx, ry, col]) =>
      ell(
        cx + Math.round(dx * ls),
        cy + Math.round(dy * ls),
        Math.round(rx * ls),
        Math.round(ry * ls),
        col,
      ),
    )
    line(cx, cy, cx - 10, cy - 70, '#19492b')
    line(cx + 3, cy, cx + 25, cy - 75, '#19492b')
  }

  function drawBackpack() {
    use('backpack')
    box(0.15, 4.3, 0, 0.6, 0.65, 22, '#17181b')
    box(0.72, 4.4, 1, 0.12, 0.45, 10, '#202226')
    fxRect(0.84, 4.4, 1, 2, 6, 3, 8, '#101114')
    fxRect(0.75, 4.3, 14, 8, 11, 0, 7, '#c8c8c4')
  }

  function drawRingLight() {
    use('ringlight')
    const [bx, by] = P(8.4, 6.3, 18)
    for (const [lx, ly] of [
      [9.0, 6.6],
      [8.1, 6.7],
      [8.1, 5.9],
    ]) {
      const [ex, ey] = P(lx, ly, 0)
      line(bx, by, ex, ey, '#15161a')
    }
    box(8.36, 6.26, 0, 0.08, 0.08, 50, '#17181b')
    box(8.3, 5.9, 46, 0.1, 0.8, 16, {
      top: '#f2f2ee',
      left: '#d8d8d4',
      right: '#ebebe6',
    })
    fxRect(8.4, 5.95, 46, 1, 12, 2, 14, '#fbfbf8')
  }

  function drawCurtain() {
    use('curtain')
    box(8.3, 0, 0, 0.7, 0.2, 84, '#8d9199')
    for (let i = 0; i < 11; i++) {
      if (i % 3 === 0) fyRect(8.3, 0.2, 0, i, i + 1, 0, 84, '#767a82')
      else if (i % 3 === 1) fyRect(8.3, 0.2, 0, i, i + 1, 0, 84, '#9a9ea6')
    }
    box(8.25, 0.0, 84, 0.8, 0.22, 2, '#2a2b2f')
  }

  function drawDoor() {
    use('door')
    box(0.1, 0, 0, 1.4, 0.14, 82, '#e6e6e2')
    fyRect(0.1, 0.14, 0, 2, 22, 2, 79, '#f2f2ee')
    fyRect(0.1, 0.14, 0, 5, 19, 6, 36, '#e4e4df')
    fyRect(0.1, 0.14, 0, 5, 19, 42, 74, '#e4e4df')
    fyRect(0.1, 0.14, 0, 17, 19, 38, 40, '#8a8e94')
  }

  // ------------------------------------------------------------------
  // Avatar
  // ------------------------------------------------------------------
  const av = {
    x: 8.5,
    y: 7.5,
    dir: 1,
    path: [],
    phase: 0,
    moving: false,
    faceTo: null,
  }

  // O avatar e desenhado numa grade de 3x3 px por "pixel" de projeto, o que
  // da ~1,2 m de altura na escala da sala.
  function drawAvatar() {
    const S = 3
    const [fx, fy] = P(av.x, av.y, 0)
    const r = (x, y, w, h, col) =>
      px(
        fx + Math.round(x * S),
        fy + Math.round(y * S),
        Math.round(w * S),
        Math.round(h * S),
        col,
      )
    const step = av.moving ? Math.floor(av.phase * 8) % 2 : 0
    const bob = av.moving ? step : 0
    const front = av.dir === 0 || av.dir === 1
    const shirt = '#2b2f3a'
    const shirtDark = '#20242d'
    const skin = '#e0a67a'
    const hair = '#2a1a12'
    const beard = '#3b2a20'
    // sombra
    curId = 0
    C.globalAlpha = 0.25
    ell(fx, fy, 20, 8, '#1a1208')
    C.globalAlpha = 1
    curId = AVATAR_ID
    // pernas e tenis
    r(-4, -12, 3, 11 - (step ? 1 : 0), '#3b4a6b')
    r(1, -12, 3, 11 - (step ? 0 : 1), '#2f3c58')
    r(-5, -1 - (step ? 1 : 0), 4, 1, '#e8e8e4')
    r(1, -1 - (step ? 0 : 1), 4, 1, '#e8e8e4')
    // tronco e bracos
    r(-5, -24 - bob, 10, 12, shirt)
    r(1, -24 - bob, 4, 12, shirtDark)
    r(-7, -23 - bob + (step ? 1 : 0), 2, 10, shirt)
    r(5, -23 - bob + (step ? 0 : 1), 2, 10, shirtDark)
    r(-7, -13 - bob + (step ? 1 : 0), 2, 2, skin)
    r(5, -13 - bob + (step ? 0 : 1), 2, 2, skin)
    // cabeca
    r(-4, -34 - bob, 8, 10, skin)
    if (front) {
      r(-4, -35 - bob, 8, 4, hair)
      r(-4, -31 - bob, 1, 2, hair)
      r(3, -31 - bob, 1, 2, hair)
      // oculos
      const ex = av.dir === 0 ? 1 : -1
      r(-3 + ex, -30 - bob, 3, 2, '#1b1b1f')
      r(1 + ex, -30 - bob, 3, 2, '#1b1b1f')
      r(-2.4 + ex, -29.5 - bob, 1.4, 1, '#f3efe6')
      r(1.6 + ex, -29.5 - bob, 1.4, 1, '#f3efe6')
      // barba
      r(-4, -27 - bob, 8, 3, beard)
      r(-1, -26 - bob, 2, 1, skin)
    } else {
      r(-4, -35 - bob, 8, 10, hair)
      r(-3, -33 - bob, 3, 1, '#4a3225')
    }
    curId = 0
  }

  // ------------------------------------------------------------------
  // Cena: grupos ordenados em profundidade
  // ------------------------------------------------------------------
  // box = [x0, y0, x1, y1, z0, z1] so para ordenar; block = retangulo
  // (em tiles) que impede de andar.
  const groups = [
    {
      box: xf(L.door, [0.1, 0, 1.5, 0.14, 0, 82]),
      draw: () => legacy(L.door, drawDoor),
    },
    {
      box: xf(L.curtain, [8.25, 0, 9, 0.22, 0, 84]),
      draw: () => legacy(L.curtain, drawCurtain),
    },
    {
      box: [5, 0, 14, 3, 0, DESK_TOP + 50],
      draw: drawDesk,
      block: [5, 0, 14, 3],
    },
    {
      box: xf(L.shelf, [0, 2.2, 0.85, 4.2, 0, 82]),
      draw: () => legacy(L.shelf, drawShelf),
      block: xf(L.shelf, [0, 2.2, 0.85, 4.2]),
      shadow: xf(L.shelf, [0, 2.2, 0.85, 4.2]),
    },
    {
      box: xf(L.backpack, [0.12, 4.3, 0.85, 4.95, 0, 22]),
      draw: () => legacy(L.backpack, drawBackpack),
      block: xf(L.backpack, [0.12, 4.3, 0.85, 4.95]),
      shadow: xf(L.backpack, [0.12, 4.3, 0.85, 4.95]),
    },
    {
      box: xf(L.plant, [0.12, 5.27, 0.98, 6.13, 0, 50]),
      draw: () => legacy(L.plant, drawPlant),
      block: xf(L.plant, [0.12, 5.27, 0.98, 6.13]),
      shadow: xf(L.plant, [0.12, 5.27, 0.98, 6.13]),
    },
    {
      box: xf(L.ringlight, [8.1, 5.9, 9, 6.7, 0, 64]),
      draw: () => legacy(L.ringlight, drawRingLight),
      block: xf(L.ringlight, [8.3, 6.1, 8.5, 6.5]),
      shadow: xf(L.ringlight, [8.1, 5.9, 9, 6.7]),
    },
  ]
  const avatarGroup = { box: [0, 0, 0, 0, 0, 105], draw: drawAvatar }
  const sceneGroups = [...groups, avatarGroup]

  function screenBounds(b) {
    const [x0, y0, x1, y1, z0, z1] = b
    let l = Infinity
    let r = -Infinity
    let t = Infinity
    let bt = -Infinity
    for (const x of [x0, x1]) {
      for (const y of [y0, y1]) {
        for (const z of [z0, z1]) {
          const [sx, sy] = P(x, y, z)
          l = Math.min(l, sx)
          r = Math.max(r, sx)
          t = Math.min(t, sy)
          bt = Math.max(bt, sy)
        }
      }
    }
    return { l, r, t, b: bt }
  }

  function behind(a, b) {
    // true se o grupo a deve ser desenhado antes de b
    if (a[2] <= b[0]) return true
    if (b[2] <= a[0]) return false
    if (a[3] <= b[1]) return true
    if (b[3] <= a[1]) return false
    return a[5] <= b[4]
  }

  function sortGroups() {
    avatarGroup.box = [av.x - 0.8, av.y - 0.8, av.x + 0.8, av.y + 0.8, 0, 105]
    const infos = sceneGroups.map((g) => ({ g, s: screenBounds(g.box) }))
    const out = []
    const seen = new Set()
    const overlap = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b
    const visit = (info) => {
      if (seen.has(info)) return
      seen.add(info)
      for (const other of infos) {
        if (other === info || seen.has(other)) continue
        if (overlap(info.s, other.s) && behind(other.g.box, info.g.box))
          visit(other)
      }
      out.push(info.g)
    }
    infos.forEach(visit)
    return out
  }

  // ------------------------------------------------------------------
  // Navegacao
  // ------------------------------------------------------------------
  // Um tile e bloqueado se o centro dele fica a menos de MARGIN de um objeto
  // (o avatar tem ~1,5 tile de largura) ou na borda da sala.
  const MARGIN = 0.8
  const blocked = []
  for (let j = 0; j < RY; j++) {
    blocked[j] = []
    for (let i = 0; i < RX; i++) {
      const cx = i + 0.5
      const cy = j + 0.5
      blocked[j][i] =
        i === 0 ||
        j === 0 ||
        i === RX - 1 ||
        j === RY - 1 ||
        groups.some(
          (g) =>
            g.block &&
            cx > g.block[0] - MARGIN &&
            cx < g.block[2] + MARGIN &&
            cy > g.block[1] - MARGIN &&
            cy < g.block[3] + MARGIN,
        )
    }
  }
  const walkable = (i, j) =>
    i >= 0 && j >= 0 && i < RX && j < RY && !blocked[j][i]

  function findPath(from, to) {
    const key = (i, j) => j * RX + i
    const prev = new Map([[key(from[0], from[1]), null]])
    const queue = [from]
    while (queue.length) {
      const [i, j] = queue.shift()
      if (i === to[0] && j === to[1]) {
        const path = []
        let k = key(i, j)
        let cur = [i, j]
        while (prev.get(k)) {
          path.unshift(cur)
          cur = prev.get(k)
          k = key(cur[0], cur[1])
        }
        return path
      }
      for (const [di, dj] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const ni = i + di
        const nj = j + dj
        if (!walkable(ni, nj) || prev.has(key(ni, nj))) continue
        prev.set(key(ni, nj), [i, j])
        queue.push([ni, nj])
      }
    }
    return null
  }

  function walkTo(tile, faceTo) {
    const start = av.path.length
      ? av.path[0]
      : [Math.floor(av.x), Math.floor(av.y)]
    const route = findPath(start, tile)
    if (!route) return false
    av.faceTo = faceTo || null
    av.path = av.path.length ? [av.path[0], ...route] : route
    if (reduceMotion) {
      const last = av.path[av.path.length - 1]
      if (last) {
        av.x = last[0] + 0.5
        av.y = last[1] + 0.5
      }
      av.path = []
      faceAvatar()
    }
    return true
  }

  function faceAvatar() {
    if (!av.faceTo) return
    const dx = av.faceTo[0] - av.x
    const dy = av.faceTo[1] - av.y
    av.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 0 : 2) : dy > 0 ? 1 : 3
  }

  function updateAvatar(dt) {
    if (!av.path.length) {
      av.moving = false
      return
    }
    av.moving = true
    av.phase += dt
    const [ti, tj] = av.path[0]
    const dx = ti + 0.5 - av.x
    const dy = tj + 0.5 - av.y
    const dist = Math.hypot(dx, dy)
    const step = 7 * dt
    if (Math.abs(dx) > Math.abs(dy)) av.dir = dx > 0 ? 0 : 2
    else if (dist > 0) av.dir = dy > 0 ? 1 : 3
    if (step >= dist) {
      av.x = ti + 0.5
      av.y = tj + 0.5
      av.path.shift()
      if (!av.path.length) {
        av.moving = false
        faceAvatar()
      }
    } else {
      av.x += (dx / dist) * step
      av.y += (dy / dist) * step
    }
  }

  // Onde ficar para "usar" cada objeto: [tile, ponto para olhar].
  const spots = {
    desk: [
      [8, 4],
      [9.5, 1.5],
    ],
    monitorL: [
      [6, 4],
      [6.8, 0.5],
    ],
    monitorR: [
      [12, 4],
      [12.4, 0.5],
    ],
    laptop: [
      [9, 4],
      [9.5, 0.5],
    ],
    keyboard: [
      [9, 4],
      [9.6, 2.2],
    ],
    mouse: [
      [11, 4],
      [11.5, 2.3],
    ],
    notebook: [
      [6, 4],
      [6, 2.3],
    ],
    phone: [
      [7, 4],
      [7.7, 1.8],
    ],
    cat: [
      [13, 4],
      [13.2, 2.5],
    ],
    mic: [
      [13, 4],
      [13.5, 1.6],
    ],
    slippers: [
      [9, 4],
      [9.5, 1.5],
    ],
    shelf: [
      [3, 6],
      [1, 6],
    ],
    books: [
      [3, 6],
      [1, 5.5],
    ],
    typewriter: [
      [3, 5],
      [1, 5.2],
    ],
    hat: [
      [3, 7],
      [1, 7.2],
    ],
    camera: [
      [3, 4],
      [1, 4],
    ],
    plant: [
      [3, 10],
      [1.2, 11],
    ],
    backpack: [
      [3, 9],
      [1, 9],
    ],
    ringlight: [
      [12, 10],
      [14.4, 10.5],
    ],
    curtain: [
      [14, 4],
      [15, 0.3],
    ],
    door: [
      [2, 2],
      [2.5, 0.2],
    ],
  }

  // ------------------------------------------------------------------
  // Selecao, painel e lista
  // ------------------------------------------------------------------
  const titleEl = root.querySelector('[data-office-title]')
  const textEl = root.querySelector('[data-office-text]')
  const items = [...root.querySelectorAll('[data-office-item]')]
  let selected = null
  let hovered = 0

  function select(key) {
    selected = key
    const info = data.objects[key]
    titleEl.textContent = info.name
    textEl.textContent = info.text
    items.forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.officeItem === key)),
    )
    const spot = spots[key]
    if (spot) walkTo(spot[0], spot[1])
  }

  items.forEach((b) => {
    b.setAttribute('aria-pressed', 'false')
    b.addEventListener('click', () => select(b.dataset.officeItem))
  })

  // ------------------------------------------------------------------
  // Ponteiro
  // ------------------------------------------------------------------
  const pointer = { x: -1, y: -1, inside: false }
  const tip = root.querySelector('[data-office-tip]')

  function toCanvas(e) {
    const r = canvas.getBoundingClientRect()
    return [
      Math.floor(((e.clientX - r.left) * W) / r.width),
      Math.floor(((e.clientY - r.top) * H) / r.height),
    ]
  }

  function floorTile(cx, cy) {
    const a = (cx - OX) / 16 // x - y
    const b = (cy - OY) / 8 // x + y
    const x = (a + b) / 2
    const y = (b - a) / 2
    if (x < 0 || y < 0 || x >= RX || y >= RY) return null
    const i = Math.floor(x)
    const j = Math.floor(y)
    return walkable(i, j) ? [i, j] : null
  }

  function idAt(cx, cy) {
    if (cx < 0 || cy < 0 || cx >= W || cy >= H) return 0
    return idCtx.getImageData(cx, cy, 1, 1).data[0]
  }

  canvas.addEventListener('pointermove', (e) => {
    const [cx, cy] = toCanvas(e)
    pointer.x = cx
    pointer.y = cy
    pointer.inside = true
    if (tip) {
      const r = canvas.getBoundingClientRect()
      tip.style.left = `${e.clientX - r.left + 14}px`
      tip.style.top = `${e.clientY - r.top + 14}px`
    }
  })
  canvas.addEventListener('pointerleave', () => {
    pointer.inside = false
    hovered = 0
    if (tip) tip.hidden = true
  })
  canvas.addEventListener('pointerdown', (e) => {
    const [cx, cy] = toCanvas(e)
    const id = idAt(cx, cy)
    if (id > 0 && id <= keys.length) {
      select(keys[id - 1])
      return
    }
    if (id === AVATAR_ID) return
    const tile = floorTile(cx, cy)
    if (tile) walkTo(tile, null)
  })

  // ------------------------------------------------------------------
  // Loop
  // ------------------------------------------------------------------
  function outline(buf, id, col) {
    ctx.fillStyle = col
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const o = (y * W + x) * 4
        if (buf[o] !== id || buf[o + 3] === 0) continue
        if (
          x === 0 ||
          y === 0 ||
          x === W - 1 ||
          y === H - 1 ||
          buf[o - 4] !== id ||
          buf[o + 4] !== id ||
          buf[o - W * 4] !== id ||
          buf[o + W * 4] !== id
        ) {
          ctx.fillRect(x, y, 1, 1)
        }
      }
    }
  }

  function render(t) {
    C = ctx
    ctx.clearRect(0, 0, W, H)
    idCtx.clearRect(0, 0, W, H)
    ctx.drawImage(bgCanvas, 0, 0)
    for (const g of sortGroups()) {
      curId = 0
      g.draw(t)
    }
    curId = 0

    const buf = idCtx.getImageData(0, 0, W, H).data
    // contorno escuro em volta dos objetos, so contra o fundo
    ctx.fillStyle = OUTLINE
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const o = (y * W + x) * 4
        if (buf[o + 3] === 0) continue
        if (x > 0 && buf[o - 1] === 0) ctx.fillRect(x - 1, y, 1, 1)
        if (x < W - 1 && buf[o + 7] === 0) ctx.fillRect(x + 1, y, 1, 1)
        if (y > 0 && buf[o - W * 4 + 3] === 0) ctx.fillRect(x, y - 1, 1, 1)
        if (y < H - 1 && buf[o + W * 4 + 3] === 0) ctx.fillRect(x, y + 1, 1, 1)
      }
    }

    hovered = pointer.inside ? idAt(pointer.x, pointer.y) : 0
    if (hovered === AVATAR_ID) hovered = 0
    const selId = selected ? IDX[selected] : 0
    if (selId) {
      const pulse = reduceMotion || Math.floor(t / 450) % 2 === 0
      outline(buf, selId, pulse ? '#ffd34d' : '#fff1b3')
    }
    if (hovered && hovered !== selId) outline(buf, hovered, '#ffffff')

    const onObject = hovered > 0
    canvas.style.cursor =
      onObject || (pointer.inside && floorTile(pointer.x, pointer.y))
        ? 'pointer'
        : 'default'
    if (tip) {
      if (onObject) {
        tip.textContent = data.objects[keys[hovered - 1]].name
        tip.hidden = false
      } else tip.hidden = true
    }
  }

  let last = 0
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0)
    last = now
    updateAvatar(dt)
    render(now)
    requestAnimationFrame(frame)
  }

  // Ampliacao em multiplos inteiros para os pixels ficarem nitidos.
  const stage = canvas.parentElement
  function fit() {
    const cs = getComputedStyle(stage)
    const avail =
      stage.clientWidth -
      parseFloat(cs.paddingLeft) -
      parseFloat(cs.paddingRight)
    // Multiplos inteiros nas telas largas; em telas pequenas, preenche a largura.
    const scale = avail >= W * 2 ? Math.floor(avail / W) : avail / W
    canvas.style.width = `${Math.round(W * scale)}px`
  }
  new ResizeObserver(fit).observe(stage)
  fit()

  drawBackground()
  requestAnimationFrame(frame)
})()
