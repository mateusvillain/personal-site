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
    'Isometric pixel art illustration of the office: a desk with two monitors, a laptop and a keyboard, a bookshelf with a typewriter, and a cat.',
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
    phone: {
      name: 'Phone dock',
      text: 'The phone stays standing on its dock.',
    },
    cup: {
      name: 'Thermal cup',
      text: 'A thermal cup on its coaster, always within reach.',
    },
    cat: {
      name: 'Cat',
      text: 'The resident tortoiseshell cat. She claimed the end of the desk, right next to the mic.',
    },
    mic: {
      name: 'Microphone',
      text: 'A condenser microphone on a boom arm, for recordings and calls.',
    },
    shelf: {
      name: 'Bookshelf',
      text: 'Books about design, UX and comics, plus a few collectibles.',
    },
    frames: {
      name: 'Photo frames',
      text: 'Framed pictures on the top shelf, next to the hat.',
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
    door: {
      name: 'Door',
      text: 'The way to the rest of the house.',
    },
    book_a_guerra_dos_tronos: {
      name: 'A Game of Thrones',
      text: 'Fiction and fantasy, from the shelf.',
    },
    book_a_melhor_estrategia_e_atitude: {
      name: 'A melhor estratégia é a atitude: Bora vender',
      text: 'One of the books on the shelf.',
    },
    book_american_crime_story: {
      name: 'American Crime Story',
      text: 'One of the books on the shelf.',
    },
    book_avatar_a_promessa: {
      name: 'Avatar: The Promise',
      text: 'Comics, from the shelf.',
    },
    book_estrategia_de_ux: {
      name: 'UX Strategy',
      text: 'A read on design and UX.',
    },
    book_fundamentos_de_ux: {
      name: 'UX Fundamentals',
      text: 'A read on design and UX.',
    },
    book_harry_potter_1_pedra_filosofal: {
      name: 'Harry Potter and the Philosopher\'s Stone',
      text: 'Fiction and fantasy, from the shelf.',
    },
    book_harry_potter_2_camara_secreta: {
      name: 'Harry Potter and the Chamber of Secrets',
      text: 'Fiction and fantasy, from the shelf.',
    },
    book_harry_potter_4_calice_de_fogo: {
      name: 'Harry Potter and the Goblet of Fire',
      text: 'Fiction and fantasy, from the shelf.',
    },
    book_harry_potter_5_ordem_da_fenix: {
      name: 'Harry Potter and the Order of the Phoenix',
      text: 'Fiction and fantasy, from the shelf.',
    },
    book_harry_potter_7_reliquias_da_morte: {
      name: 'Harry Potter and the Deathly Hallows',
      text: 'Fiction and fantasy, from the shelf.',
    },
    book_invincible: {
      name: 'Invincible',
      text: 'Comics, from the shelf.',
    },
    book_maus: {
      name: 'Maus',
      text: 'Comics, from the shelf.',
    },
    book_o_impacto_do_detach: {
      name: 'O impacto do Detach',
      text: 'One of the books on the shelf.',
    },
    book_o_jogo_corporativo_do_ux: {
      name: 'O jogo corporativo do UX',
      text: 'A read on design and UX.',
    },
    book_provocacoes_criativas: {
      name: 'Provocações criativas',
      text: 'A read on design and UX.',
    },
    book_steve_jobs: {
      name: 'Steve Jobs',
      text: 'A biography, from the shelf.',
    },
    book_supernatural: {
      name: 'Supernatural',
      text: 'One of the books on the shelf.',
    },
    book_box_scott_pilgrim: {
      name: 'Scott Pilgrim box set',
      text: 'Comics, from the shelf.',
    },
    book_confissoes_do_crematorio: {
      name: 'Confissões do crematório',
      text: 'One of the books on the shelf.',
    },
    book_design_system_alem_do_layout: {
      name: 'Design System além do layout',
      text: 'A read on design and UX.',
    },
    book_lideranca_em_ux: {
      name: 'Liderança em UX',
      text: 'A read on design and UX.',
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
    'Ilustração isométrica em pixel art do escritório: uma mesa com dois monitores, um notebook e um teclado, uma estante com uma máquina de escrever e uma gata.',
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
    phone: {
      name: 'Suporte do celular',
      text: 'O celular fica em pé no suporte.',
    },
    cup: {
      name: 'Copo térmico',
      text: 'Um copo térmico no porta-copos, sempre ao alcance.',
    },
    cat: {
      name: 'Gata',
      text: 'A gata de casa, tricolor. Ela dominou o canto da mesa, ao lado do microfone.',
    },
    mic: {
      name: 'Microfone',
      text: 'Um microfone condensador em um braço articulado, para gravações e reuniões.',
    },
    shelf: {
      name: 'Estante',
      text: 'Livros de design, UX e quadrinhos, além de alguns colecionáveis.',
    },
    frames: {
      name: 'Porta-retratos',
      text: 'Fotos emolduradas na prateleira de cima, ao lado do chapéu.',
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
    door: {
      name: 'Porta',
      text: 'O caminho para o resto da casa.',
    },
    book_a_guerra_dos_tronos: {
      name: 'A Guerra dos Tronos',
      text: 'Ficção e fantasia, da estante.',
    },
    book_a_melhor_estrategia_e_atitude: {
      name: 'A melhor estratégia é a atitude: Bora vender',
      text: 'Um dos livros da estante.',
    },
    book_american_crime_story: {
      name: 'American Crime Story',
      text: 'Um dos livros da estante.',
    },
    book_avatar_a_promessa: {
      name: 'Avatar: A Promessa',
      text: 'Quadrinhos, da estante.',
    },
    book_estrategia_de_ux: {
      name: 'Estratégia de UX',
      text: 'Uma leitura sobre design e UX.',
    },
    book_fundamentos_de_ux: {
      name: 'Fundamentos de UX',
      text: 'Uma leitura sobre design e UX.',
    },
    book_harry_potter_1_pedra_filosofal: {
      name: 'Harry Potter e a Pedra Filosofal',
      text: 'Ficção e fantasia, da estante.',
    },
    book_harry_potter_2_camara_secreta: {
      name: 'Harry Potter e a Câmara Secreta',
      text: 'Ficção e fantasia, da estante.',
    },
    book_harry_potter_4_calice_de_fogo: {
      name: 'Harry Potter e o Cálice de Fogo',
      text: 'Ficção e fantasia, da estante.',
    },
    book_harry_potter_5_ordem_da_fenix: {
      name: 'Harry Potter e a Ordem da Fênix',
      text: 'Ficção e fantasia, da estante.',
    },
    book_harry_potter_7_reliquias_da_morte: {
      name: 'Harry Potter e as Relíquias da Morte',
      text: 'Ficção e fantasia, da estante.',
    },
    book_invincible: {
      name: 'Invincible',
      text: 'Quadrinhos, da estante.',
    },
    book_maus: {
      name: 'Maus',
      text: 'Quadrinhos, da estante.',
    },
    book_o_impacto_do_detach: {
      name: 'O impacto do Detach',
      text: 'Um dos livros da estante.',
    },
    book_o_jogo_corporativo_do_ux: {
      name: 'O jogo corporativo do UX',
      text: 'Uma leitura sobre design e UX.',
    },
    book_provocacoes_criativas: {
      name: 'Provocações criativas',
      text: 'Uma leitura sobre design e UX.',
    },
    book_steve_jobs: {
      name: 'Steve Jobs',
      text: 'Uma biografia, da estante.',
    },
    book_supernatural: {
      name: 'Supernatural',
      text: 'Um dos livros da estante.',
    },
    book_box_scott_pilgrim: {
      name: 'Box Scott Pilgrim',
      text: 'Quadrinhos, da estante.',
    },
    book_confissoes_do_crematorio: {
      name: 'Confissões do crematório',
      text: 'Um dos livros da estante.',
    },
    book_design_system_alem_do_layout: {
      name: 'Design System além do layout',
      text: 'Uma leitura sobre design e UX.',
    },
    book_lideranca_em_ux: {
      name: 'Liderança em UX',
      text: 'Uma leitura sobre design e UX.',
    },
  },
}

export const office: Dictionary<typeof en> = { en, pt }
export type OfficeStrings = typeof en
