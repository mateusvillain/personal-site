import type { Dictionary } from './ui'

/**
 * Textos da pagina inicial. Os campos `*Html` contem marcacao (links) e
 * devem ser renderizados com `set:html`.
 */
const en = {
  metaTitle: 'Mateus Villain - Product Designer and Design System specialist',
  role: 'Designer and author',
  photoAlt:
    'Photo of Mateus Villain: a man with a full beard and shaved head, wearing round-framed glasses, looks straight at the camera. He is holding a coffee cup with a lid. The photo has a polaroid style, with a blurred indoor background.',
  shortBioHtml:
    "I am a Product Designer specializing in Design Systems and the author of <a class='link' href='https://www.casadocodigo.com.br/products/livro-design-system' target='_blank'>Design System Beyond the Layout</a>. I currently work at Locaweb as a Senior DesignOps, where I contribute to the development of the Locaweb Design System and help foster a strong design culture across the company.",
  shortBio2Html:
    "I am the organizer of <a class='link' href='https://detach.com.br/' target='_blank'>Detach!</a>, a Brazilian event about design at scale, and a professor at <a class='link' href='https://escolaescala.com/' target='_blank'>Escåla</a> and <a class='link' href='https://cursos.alura.com.br/user/mateusvillain' target='_blank'>Alura</a>, where I teach Design Systems, DesignOps and UX. I also offer <a class='link' href='/mentorship/'>mentoring</a> services for designers and teams.",
  shortBio3Html:
    "You can find me on <a class='link' data-link='x-twitter' data-social='x-twitter' href='https://x.com/mateusvillain' target='_blank'>X</a>, <a class='link' data-link='linkedin' data-social='linkedin' href='https://www.linkedin.com/in/mateusvillain/' target='_blank'>LinkedIn</a> and <a class='link' data-link='github' data-social='github' href='https://github.com/mateusvillain' target='_blank'>GitHub</a>.",
  blogTitle: 'Latest posts',
  blogLink: 'Go to blog',
  projects: {
    title: 'Works',
    reset: 'Reset layout',
    cardRole: 'project card',
    dragInstructions:
      'Draggable card. Use the mouse or touch to reposition it, or the arrow keys to move and Escape to return to the original position.',
    locawebTitle: 'Restructuring the design tokens of Locaweb',
    locawebDescription:
      'Understanding the current token system problems and solving them by creating a new design tokens library.',
    bookTitle: 'Design System Beyond the Layout',
    bookDescription:
      'A practical guide to building and evolving Design Systems.',
    letsuiDescription:
      'Let’s UI is a complete, open-source multi-brand design system, created to make interfaces fully fluid.',
  },
}

const pt: typeof en = {
  metaTitle: 'Mateus Villain - Product Designer e especialista em Design System',
  role: 'Designer e autor',
  photoAlt:
    'Fotografia de Mateus Villain: Homem de barba cheia e cabeça raspada, usando óculos de armação arredondada, olha diretamente para a câmera. Ele segura um copo de café com tampa. A foto tem estilo de polaroid, com fundo desfocado em ambiente interno.',
  shortBioHtml:
    "Sou Product Designer, especialista em Design Systems e autor do livro <a class='link' href='https://www.casadocodigo.com.br/products/livro-design-system' target='_blank'>Design System além do layout</a>. Atualmente, atuo como Senior DesignOps na Locaweb, onde desempenho um papel fundamental na construção do Design System da empresa e no fortalecimento da cultura de design.",
  shortBio2Html:
    "Sou organizador do <a class='link' href='https://detach.com.br/' target='_blank'>Detach!</a>, evento brasileiro sobre design em escala, e professor na <a class='link' href='https://escolaescala.com/' target='_blank'>Escåla</a> e na <a class='link' href='https://cursos.alura.com.br/user/mateusvillain' target='_blank'>Alura</a>, onde ensino Design Systems, DesignOps e UX. Também ministro <a class='link' href='/pt/mentorship/'>mentorias</a> para designers e equipes.",
  shortBio3Html:
    "Você pode me encontrar no <a class='link' data-link='x-twitter' data-social='x-twitter' href='https://x.com/mateusvillain' target='_blank'>X</a>, <a class='link' data-link='linkedin' data-social='linkedin' href='https://www.linkedin.com/in/mateusvillain/' target='_blank'>LinkedIn</a> e no <a class='link' data-link='github' data-social='github' href='https://github.com/mateusvillain' target='_blank'>GitHub</a>.",
  blogTitle: 'Últimos posts',
  blogLink: 'Ir para o blog',
  projects: {
    title: 'Trabalhos',
    reset: 'Reorganizar',
    cardRole: 'card de projeto',
    dragInstructions:
      'Card arrastável. Use o mouse ou toque para reposicionar, ou as setas do teclado para mover e Escape para retornar à posição original.',
    locawebTitle: 'Reestruturando os design tokens do Locaweb Design System',
    locawebDescription:
      'Entendendo os problemas do atual sistema e solucionando por meio de uma coletânea de design tokens.',
    bookTitle: 'Design System além do layout',
    bookDescription: 'Um guia prático para criar e evoluir Design Systems.',
    letsuiDescription:
      'Let’s UI é um design system open source e multi-brand, criado para projetar interfaces totalmente fluídas e agnósticas.',
  },
}

export const home: Dictionary<typeof en> = { en, pt }
