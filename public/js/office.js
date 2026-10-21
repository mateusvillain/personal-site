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
; (() => {
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
    for (; ;) {
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
    monitorFigma: 'monitor_sem_base_figma_3x1',
    monitorCode: 'monitor_sem_base_vscode_3x1',
    arm: 'suporte_monitor_3x1',
    books: 'livros_2x1',
    bookPile: 'livros_pilha_1x1',
    typewriter: 'maquina_escrever_2x1',
    hat: 'chapeu_seletor_1x1',
    camDslr: 'camera_dslr_1x1',
    camCompact: 'camera_compacta_1x1',
    frameWood: 'foto_moldura_madeira_1x1',
    frameBlack: 'foto_moldura_preta_1x1',
    phoneDock: 'suporte_celular_1x1',
    phoneSprite: 'iphone_15_1x1',
    coaster: 'porta_copos_1x1',
    cup: 'copo_termico_1x1',
    micArm: 'braco_microfone_2x2',
    micBody: 'microfone_2x2',
    door: 'porta_parede_esquerda_1x4',
    floor: 'piso_padrao_4x4',
    wallL: 'parede_esquerda_1x1',
    wallR: 'parede_direita_1x1',
    wallC: 'parede_canto_1x1',
    baseL: 'rodape_esquerda_1x1',
    baseR: 'rodape_direita_1x1',
    baseC: 'rodape_canto_1x1',
  }
  // Sprites do cenario, desenhados uma vez no fundo.
  const BG_KEYS = ['floor', 'wallL', 'wallR', 'wallC', 'baseL', 'baseR', 'baseC']
  // Spritesheets animadas: os quadros ficam lado a lado, todos do mesmo
  // tamanho, e `w`/`d` e a base de cada quadro em tiles.
  const SPRITE_SHEETS = {
    cat: { file: 'gata_deitada_spritesheet', w: 1, d: 2, frames: 8 },
    // A base da imagem so serve de ancora: a cadeira ocupa ~5 tiles.
    mateus: { file: 'mateus_sentado_spritesheet', w: 2, d: 3, frames: 4 },
  }
  const SPR = {}
  // Os sprites da estante e dos itens dela sao espelhados na horizontal para
  // a parede esquerda (frente para +x), o que troca largura e profundidade.
  const MIRRORED = new Set([
    'books',
    'bookPile',
    'typewriter',
    'hat',
    'camDslr',
    'camCompact',
    'frameWood',
    'frameBlack',
  ])
  function loadSprite(key, file, w, d, frames, flip = false) {
    if (flip) [w, d] = [d, w]
    const s = { w, d, frames, flip, ready: false, img: new Image(), masks: {} }
    s.img.onload = () => {
      s.fw = s.img.width / frames
      s.h = s.img.height - (w + d) * 8
      s.ready = true
    }
    s.img.src = `${SPRITE_DIR}${file}.png`
    SPR[key] = s
  }
  for (const [key, file] of Object.entries(SPRITE_FILES)) {
    const [, w, d] = file.match(/_(\d+)x(\d+)(?:_|$)/)
    loadSprite(key, file, +w, +d, 1, MIRRORED.has(key))
  }
  // Sprites sem as medidas no nome: [arquivo, largura, profundidade].
  const SPRITE_SIZED = {}
  for (let n = 1; n <= 5; n++) {
    const part = ['chao', 'gaveteiro', '', '', 'topo'][n - 1]
    const name = `estante_andar${n}${part ? '_' + part : ''}`
    SPRITE_SIZED[`shelf${n}b`] = [`${name}_fundo`, 3, 2]
    SPRITE_SIZED[`shelf${n}f`] = [`${name}_frente`, 3, 2]
  }
  for (const [key, [file, w, d]] of Object.entries(SPRITE_SIZED)) {
    loadSprite(key, file, w, d, 1, true)
  }
  for (const [key, sh] of Object.entries(SPRITE_SHEETS)) {
    loadSprite(key, sh.file, sh.w, sh.d, sh.frames)
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
  function sprite(key, x, y, z = 0, frame = 0, target = null) {
    const s = SPR[key]
    if (!s.ready) return
    const left = Math.round(OX + (x - y) * 16) - s.d * 16
    const top =
      Math.round(OY + (x + y) * 8 - z) + (s.w + s.d) * 8 - s.img.height
    const sx = frame * s.fw
    const h = s.img.height
    const put = (c, img) => {
      if (!s.flip) return c.drawImage(img, sx, 0, s.fw, h, left, top, s.fw, h)
      c.save()
      c.translate(left + s.fw, top)
      c.scale(-1, 1)
      c.drawImage(img, sx, 0, s.fw, h, 0, 0, s.fw, h)
      c.restore()
    }
    if (target) return put(target, s.img)
    put(ctx, s.img)
    if (curId) put(idCtx, spriteMask(s, curId))
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

    // piso: ladrilhos de 4x4 tiles, de tras para a frente (a espessura
    // de 4 px fica abaixo do losango, por isso z = -4)
    for (let i = 0; i < RX / 4; i++) {
      for (let j = 0; j < RY / 4; j++) sprite('floor', i * 4, j * 4, -4, 0, C)
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

    // paredes e rodape, uma celula por vez, de tras para a frente
    sprite('wallC', 0, 0, 0, 0, C)
    sprite('baseC', 0, 0, 0, 0, C)
    for (let k = 1; k < Math.max(RX, RY); k++) {
      if (k < RY) {
        sprite('wallL', 0, k, 0, 0, C)
        sprite('baseL', 0, k, 0, 0, C)
      }
      if (k < RX) {
        sprite('wallR', k, 0, 0, 0, C)
        sprite('baseR', k, 0, 0, 0, C)
      }
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
    // Itens pequenos sobre a mesa: mais escala em x/y que em z.
  }

  // Mesa e tudo o que esta sobre ela, de tras para a frente. As posicoes dos
  // sprites sao o canto de tras da base, em tiles.
  function drawDesk(t) {
    use('desk')
    sprite('desk', 5, 0, 0)
    sprite('pad', 8, 1, DESK_TOP)
    use('monitorL')
    sprite('arm', 5.3, 0, DESK_TOP)
    sprite('monitorFigma', 5.3, 0, DESK_TOP)
    use('laptop')
    sprite('laptop', 8.6, 0, DESK_TOP)
    use('monitorR')
    sprite('arm', 10.9, 0, DESK_TOP)
    sprite('monitorCode', 10.9, 0, DESK_TOP)
    use('phone')
    sprite('phoneDock', 7.2, 1.5, DESK_TOP)
    sprite('phoneSprite', 7.2, 1.5, DESK_TOP)
    use('cup')
    sprite('coaster', 6.0, 1.7, DESK_TOP)
    sprite('cup', 6.0, 1.7, DESK_TOP + 1)
    use('keyboard')
    sprite('keyboard', 8.6, 1.6, DESK_TOP + 1)
    use('mouse')
    sprite('mouse', 11, 1.8, DESK_TOP + 1)
    use('cat')
    // 8 quadros em loop; parada no primeiro com movimento reduzido.
    sprite(
      'cat',
      12.6,
      0.2,
      DESK_TOP,
      reduceMotion ? 0 : Math.floor(t / 140) % 8,
    )
    // Microfone preso na borda de tras da mesa, por cima da gata; o braco e o corpo sao duas
    // camadas do mesmo quadro 2x2.
    use('mic')
    sprite('micArm', 12, 1.3, DESK_TOP)
    sprite('micBody', 12, 1.3, DESK_TOP)
  }

  // Estante na parede da porta (frente para +x), com os itens sobre cada
  // tabua. As alturas das tabuas vem do proprio sprite da estante. A camada
  // da frente (colunas) e desenhada por ultimo, por cima dos itens.
  const SHELF = { x: 0.3, y: 7.2 }
  const BOARD = { top: 127, mid: 102, low: 77, drawers: 52 }

  function drawShelf() {
    const { x, y } = SHELF
    // Posicoes dos itens medidas na estante original (frente para +y):
    // largura ao longo da prateleira (lx) e profundidade (ly). Espelhadas,
    // lx vira y e ly vira x.
    const item = (key, lx, ly, z) => sprite(key, x + ly, y + lx, z)
    // Cada andar e uma camada de fundo (tabua e colunas de tras), os itens
    // dele e uma camada da frente (colunas da frente), de baixo para cima.
    const floor = (n, items) => {
      use('shelf')
      sprite(`shelf${n}b`, x, y, 0)
      if (items) items()
      use('shelf')
      sprite(`shelf${n}f`, x, y, 0)
    }
    floor(1)
    // gaveteiro: maquina de escrever e camera compacta
    floor(2, () => {
      use('typewriter')
      item('typewriter', 0.2, 0.5, BOARD.drawers)
      use('camera')
      item('camCompact', 2.0, 0.6, BOARD.drawers)
    })
    floor(3, () => {
      use('books')
      item('bookPile', 0.1, 0.6, BOARD.low)
      item('books', 1.0, 0.5, BOARD.low)
    })
    floor(4, () => {
      use('books')
      item('books', 0.2, 0.5, BOARD.mid)
      use('camera')
      item('camDslr', 2.0, 0.6, BOARD.mid)
    })
    floor(5, () => {
      use('frames')
      item('frameWood', 0.1, 0.6, BOARD.top)
      item('frameBlack', 1.0, 0.4, BOARD.top)
      use('hat')
      item('hat', 1.9, 0.6, BOARD.top)
    })
  }

  // Porta na parede esquerda (plano x = 0), voltada para +x. O sprite ocupa
  // 1x4 tiles; a folha em si cobre ~3,1 tiles a partir de y + 0,2.
  const DOOR = { y: 1, w: 3.3, h: 171 }

  function drawDoor() {
    use('door')
    sprite('door', 0, DOOR.y, 0)
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
      box: [0, DOOR.y, 0.3, DOOR.y + DOOR.w, 0, DOOR.h],
      draw: drawDoor,
    },
    {
      box: [5, 0, 14, 3, 0, DESK_TOP + 50],
      draw: drawDesk,
      block: [5, 0, 14, 3],
    },
    {
      box: [SHELF.x, SHELF.y, SHELF.x + 2, SHELF.y + 3, 0, 132],
      draw: drawShelf,
      block: [SHELF.x, SHELF.y, SHELF.x + 2, SHELF.y + 3],
    },
  ]
  // Mateus fica sentado na cadeira, de costas, com a mao direita no mouse e
  // a esquerda no teclado. O avatar que andava pela sala (drawAvatar) foi
  // desativado: o grupo abaixo o substitui.
  const SEAT = { x: 9.2, y: 1.7 }
  const avatarGroup = {
    box: [8, 3, 11, 5, 0, 105],
    draw: (t) => {
      curId = AVATAR_ID
      sprite(
        'mateus',
        SEAT.x,
        SEAT.y,
        0,
        reduceMotion ? 0 : Math.floor(t / 250) % 4,
      )
    },
  }
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
    return false // Mateus esta sentado, nao anda
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
    phone: [
      [7, 4],
      [7.7, 1.8],
    ],
    cat: [
      [13, 4],
      [13.4, 1.8],
    ],
    cup: [
      [6, 4],
      [6.5, 2.2],
    ],
    mic: [
      [13, 4],
      [13.5, 1.6],
    ],
    shelf: [
      [2, 3],
      [2.5, 1.5],
    ],
    frames: [
      [2, 3],
      [2, 1],
    ],
    hat: [
      [3, 3],
      [3.4, 1],
    ],
    books: [
      [2, 3],
      [1.8, 1],
    ],
    typewriter: [
      [2, 3],
      [2, 1.2],
    ],
    camera: [
      [3, 3],
      [3.2, 1.2],
    ],
    door: [
      [3, 5],
      [0, 4.8],
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

  let bgDone = false
  function render(t) {
    // O fundo usa sprites, entao so e desenhado depois que todos carregam.
    if (!bgDone && BG_KEYS.every((k) => SPR[k].ready)) {
      drawBackground()
      bgDone = true
    }
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

  requestAnimationFrame(frame)
})()
