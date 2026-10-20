import type { Dictionary } from './ui'

/** Textos da pagina do simulador do escritorio (/office/). */
const en = {
  metaTitle: 'Office simulator - Mateus Villain',
  metaDescription:
    'An isometric pixel art version of my home office. Walk around, click on the objects and meet the cat.',
  title: 'Office simulator',
  intro:
    'A tiny pixel art version of the place where I work. Click on the floor to walk around, or on any object to go there and find out what it is.',
  canvasLabel:
    'Isometric pixel art illustration of the office: a desk with two monitors, a laptop and a keyboard, a bookshelf with a typewriter, a plant and a cat.',
  panel: {
    idle: 'Pick an object',
    idleText: 'Click on something in the room or choose it from the list.',
    close: 'Clear selection',
  },
  listLabel: 'Objects in the room',
  noScript: 'This page needs JavaScript to run the simulator.',
  objects: {
    desk: {
      name: 'Standing desk',
      text: 'A dark wood desk where most of the work happens.',
    },
    monitorL: {
      name: 'Left monitor',
      text: 'Ultrawide monitor with a webcam on top. Usually shows the clock and a city skyline.',
    },
    monitorR: {
      name: 'Right monitor',
      text: 'Second ultrawide monitor, for design files. Right now it is full of isometric room references.',
    },
    laptop: {
      name: 'Laptop',
      text: 'Laptop on a stand, between the two monitors, with a camera on top.',
    },
    keyboard: {
      name: 'Mechanical keyboard',
      text: 'A light mechanical keyboard on a dark desk mat.',
    },
    mouse: {
      name: 'Mouse',
      text: 'The mouse, on the right side of the desk mat.',
    },
    notebook: {
      name: 'Notebook and pen',
      text: 'The analog corner of the desk, for notes and sketches.',
    },
    phone: {
      name: 'Phone dock',
      text: 'The phone stays standing on its dock.',
    },
    cat: {
      name: 'Cat',
      text: 'The resident tortoiseshell cat. She claimed the end of the desk, right next to the mic.',
    },
    mic: {
      name: 'Microphone',
      text: 'A condenser microphone on a boom arm, for recordings and calls.',
    },
    slippers: {
      name: 'Slippers',
      text: 'Parked under the desk, waiting.',
    },
    shelf: {
      name: 'Bookshelf',
      text: 'Books about design, UX and comics, plus a few collectibles.',
    },
    frames: {
      name: 'Photo frames',
      text: 'Framed pictures on the top shelf, next to the hat.',
    },
    books: {
      name: 'Books',
      text: 'Design, UX, biographies and comics.',
    },
    typewriter: {
      name: 'Typewriter',
      text: 'A vintage typewriter on top of the drawers.',
    },
    hat: {
      name: 'Sorting Hat',
      text: 'Sitting on top of the shelf and judging everyone who walks by.',
    },
    camera: {
      name: 'Cameras',
      text: 'A few cameras living on the shelves.',
    },
    plant: {
      name: 'Monstera',
      text: 'The plant that gets the corner of the room.',
    },
    backpack: {
      name: 'Backpack',
      text: 'Always packed, always ready.',
    },
    ringlight: {
      name: 'Light panel',
      text: 'A light panel on a tripod for videos and calls.',
    },
    curtain: {
      name: 'Curtain',
      text: 'Gray curtain that softens the light from the window.',
    },
    door: {
      name: 'Door',
      text: 'The way to the rest of the house.',
    },
  },
}

const pt: typeof en = {
  metaTitle: 'Simulador do escritório - Mateus Villain',
  metaDescription:
    'Uma versão isométrica em pixel art do meu escritório. Ande pela sala, clique nos objetos e conheça a gata.',
  title: 'Simulador do escritório',
  intro:
    'Uma versão minúscula em pixel art do lugar onde eu trabalho. Clique no chão para andar pela sala, ou em qualquer objeto para ir até ele e descobrir o que é.',
  canvasLabel:
    'Ilustração isométrica em pixel art do escritório: uma mesa com dois monitores, um notebook e um teclado, uma estante com uma máquina de escrever, uma planta e uma gata.',
  panel: {
    idle: 'Escolha um objeto',
    idleText: 'Clique em algo na sala ou escolha na lista.',
    close: 'Limpar seleção',
  },
  listLabel: 'Objetos da sala',
  noScript: 'Esta página precisa de JavaScript para rodar o simulador.',
  objects: {
    desk: {
      name: 'Mesa regulável',
      text: 'Uma mesa de madeira escura onde acontece a maior parte do trabalho.',
    },
    monitorL: {
      name: 'Monitor esquerdo',
      text: 'Monitor ultrawide com uma webcam em cima. Costuma mostrar o relógio e um skyline de cidade.',
    },
    monitorR: {
      name: 'Monitor direito',
      text: 'Segundo monitor ultrawide, para os arquivos de design. Agora está cheio de referências de quartos isométricos.',
    },
    laptop: {
      name: 'Notebook',
      text: 'Notebook em um suporte, entre os dois monitores, com uma câmera em cima.',
    },
    keyboard: {
      name: 'Teclado mecânico',
      text: 'Um teclado mecânico claro sobre um deskpad escuro.',
    },
    mouse: {
      name: 'Mouse',
      text: 'O mouse, do lado direito do deskpad.',
    },
    notebook: {
      name: 'Caderno e caneta',
      text: 'O canto analógico da mesa, para anotações e rabiscos.',
    },
    phone: {
      name: 'Suporte do celular',
      text: 'O celular fica em pé no suporte.',
    },
    cat: {
      name: 'Gata',
      text: 'A gata de casa, tricolor. Ela dominou o canto da mesa, ao lado do microfone.',
    },
    mic: {
      name: 'Microfone',
      text: 'Um microfone condensador em um braço articulado, para gravações e reuniões.',
    },
    slippers: {
      name: 'Chinelos',
      text: 'Estacionados embaixo da mesa, esperando.',
    },
    shelf: {
      name: 'Estante',
      text: 'Livros de design, UX e quadrinhos, além de alguns colecionáveis.',
    },
    frames: {
      name: 'Porta-retratos',
      text: 'Fotos emolduradas na prateleira de cima, ao lado do chapéu.',
    },
    books: {
      name: 'Livros',
      text: 'Design, UX, biografias e quadrinhos.',
    },
    typewriter: {
      name: 'Máquina de escrever',
      text: 'Uma máquina de escrever antiga em cima das gavetas.',
    },
    hat: {
      name: 'Chapéu Seletor',
      text: 'No alto da estante, julgando quem passa.',
    },
    camera: {
      name: 'Câmeras',
      text: 'Algumas câmeras que moram nas prateleiras.',
    },
    plant: {
      name: 'Costela-de-adão',
      text: 'A planta que ficou com o canto da sala.',
    },
    backpack: {
      name: 'Mochila',
      text: 'Sempre pronta, sempre arrumada.',
    },
    ringlight: {
      name: 'Painel de luz',
      text: 'Um painel de luz em um tripé, para vídeos e reuniões.',
    },
    curtain: {
      name: 'Cortina',
      text: 'Cortina cinza que suaviza a luz da janela.',
    },
    door: {
      name: 'Porta',
      text: 'O caminho para o resto da casa.',
    },
  },
}

export const office: Dictionary<typeof en> = { en, pt }
export type OfficeStrings = typeof en
