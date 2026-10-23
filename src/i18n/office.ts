import type { Dictionary } from './ui'

/** Textos da pagina do simulador do escritorio (/office/). */
const en = {
  metaTitle: 'Office simulator - Mateus Villain',
  metaDescription:
    'An isometric pixel art version of my home office. Explore the objects, flip the light switch and meet the cat.',
  title: 'Office simulator',
  intro:
    'A tiny pixel art version of the place where I work. Hover over or tap the objects to find out what they are, and use the light switch to turn the lights on or off. The lights also go out on their own at 7 pm and come back at 8 am, Brasília time.',
  canvasLabel:
    'Isometric pixel art illustration of the office, lights on: Mateus sitting at a desk with two monitors, a laptop and a keyboard, the cat lying at the end of the desk, and a bookshelf with a typewriter.',
  canvasLabelOff:
    'Isometric pixel art illustration of the office, lights off: the desk is empty, the monitors are off and the bookshelf with a typewriter is in the dark.',
  objectsTitle: 'Objects in the office',
  lightsButton: 'Office lights',
  lightsOnStatus: 'Lights on. Mateus is back at the desk, with the cat beside him.',
  lightsOffStatus: 'Lights off. The office is empty and the monitors are off.',
  pauseAnimation: 'Pause animation',
  playAnimation: 'Play animation',
  noScript: 'This page needs JavaScript to run the simulator.',
  objects: {
    desk: {
      name: 'GenioDesk Home',
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
      name: 'Macbook Air M4',
      text: 'Laptop on a stand, between the two monitors, with a camera on top.',
    },
    keyboard: {
      name: 'Epomaker AULA F75',
      text: 'A light mechanical keyboard on a dark desk mat.',
    },
    mouse: {
      name: 'Logitech G502 X',
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
      name: 'Figma',
      text: 'The resident tortoiseshell cat. She claimed the end of the desk, right next to the mic.',
    },
    mic: {
      name: 'HyperX Quadcast 2',
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
      name: 'Sony A2000',
      text: 'A compact camera that lives on the shelf, always ready for a quick photo.',
    },
    door: {
      name: 'Door',
      text: 'The way to the rest of the house.',
    },
    postItNote: {
      name: 'Sticky note',
      text: 'A reminder stuck to the monitor so it does not get forgotten.',
    },
    postItPad: {
      name: 'Sticky note pad',
      text: 'For ideas that cannot wait for the next meeting.',
    },
    pen: {
      name: 'Jinhao X750',
      text: 'A fountain pen next to the sticky notes, for sketching ideas on paper.',
    },
    lightSwitch: {
      name: 'Light switch',
      text: 'Turns the office lights on or off.',
    },
    monstera: {
      name: 'Monstera',
      text: 'The only coworker that never interrupts a meeting.',
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
    'Uma versão isométrica em pixel art do meu escritório. Explore os objetos, acenda e apague as luzes e conheça a gata.',
  title: 'Simulador do escritório',
  intro:
    'Uma versão minúscula em pixel art do lugar onde eu trabalho. Passe o mouse ou toque nos objetos para descobrir o que são, e use o interruptor para acender ou apagar as luzes. As luzes também se apagam sozinhas às 19h e voltam às 8h, no horário de Brasília.',
  canvasLabel:
    'Ilustração isométrica em pixel art do escritório, com as luzes acesas: Mateus sentado a uma mesa com dois monitores, um notebook e um teclado, a gata deitada no canto da mesa e uma estante com uma máquina de escrever.',
  canvasLabelOff:
    'Ilustração isométrica em pixel art do escritório, com as luzes apagadas: a mesa está vazia, os monitores desligados e a estante com a máquina de escrever no escuro.',
  objectsTitle: 'Objetos do escritório',
  lightsButton: 'Luzes do escritório',
  lightsOnStatus: 'Luzes acesas. Mateus voltou para a mesa, com a gata ao lado.',
  lightsOffStatus: 'Luzes apagadas. O escritório está vazio e os monitores desligados.',
  pauseAnimation: 'Pausar animação',
  playAnimation: 'Retomar animação',
  noScript: 'Esta página precisa de JavaScript para rodar o simulador.',
  objects: {
    desk: {
      name: 'GenioDesk Home',
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
      name: 'Macbook Air M4',
      text: 'Notebook em um suporte, entre os dois monitores, com uma câmera em cima.',
    },
    keyboard: {
      name: 'Epomaker AULA F75',
      text: 'Um teclado mecânico claro sobre um deskpad escuro.',
    },
    mouse: {
      name: 'Logitech G502 X',
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
      name: 'Figma',
      text: 'A gata de casa, tricolor. Ela dominou o canto da mesa, ao lado do microfone.',
    },
    mic: {
      name: 'HyperX Quadcast 2',
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
      name: 'Sony A2000',
      text: 'Uma câmera compacta que mora na estante, sempre pronta para uma foto rápida.',
    },
    door: {
      name: 'Porta',
      text: 'O caminho para o resto da casa.',
    },
    postItNote: {
      name: 'Post-it',
      text: 'Um lembrete colado no monitor para não ser esquecido.',
    },
    postItPad: {
      name: 'Bloco de post-it',
      text: 'Para ideias que não podem esperar a próxima reunião.',
    },
    pen: {
      name: 'Jinhao X750',
      text: 'Uma caneta-tinteiro ao lado dos post-its, para rabiscar ideias no papel.',
    },
    lightSwitch: {
      name: 'Interruptor',
      text: 'Liga e apaga as luzes do escritório.',
    },
    monstera: {
      name: 'Monstera',
      text: 'A única colega que nunca interrompe uma reunião.',
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
