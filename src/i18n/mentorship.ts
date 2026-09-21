import type { Dictionary } from './ui'

/** Textos da pagina de mentorias e consultoria. */
const en = {
  metaTitle: 'Mentoring - Mateus Villain',
  metaDescription:
    'One-on-one mentoring, ongoing coaching and consulting on design systems, UI and design careers, with Mateus Villain.',
  title: 'Mentoring',
  intro:
    'If you need help with a specific topic or want guidance on a project you are (or will be) responsible for, feel free to book a mentoring session.',
  openAgenda: 'Mentoring schedule is open!',
  contactHtml:
    "Reach out to me via <a href='https://linkedin.com/in/mateusvillain' class='link'>LinkedIn</a> or by e-mail at <a href='mailto:mentoria@mateusvillain.com' class='link'>mentoria@mateusvillain.com</a> to book your sessions.",
  topics: {
    title: 'What are the topics?',
    description:
      'The most requested topic is design systems, but we can cover other subjects too, such as UI, artificial intelligence or development resources aimed at designers:',
    tags: [
      'Design System',
      'Design Tokens',
      'Git',
      'Figma MCP',
      'User Interface',
      'HTML and CSS',
      'Accessibility',
      'Handoff',
      'Framer',
    ],
  },
  duration: {
    title: 'How long is a session?',
    description:
      'The minimum session length is 1 hour, but I am totally open to extending it if needed.',
  },
  where: {
    title: 'Where do sessions take place?',
    description: 'Sessions take place on Google Meet.',
  },
  pricing: {
    title: 'Plans and pricing',
    perSession: '/session',
    mentoring: {
      title: 'Mentoring',
      description:
        'One-on-one mentoring focused on giving you clarity and practical direction. Ideal for those who want to grow faster in design systems, UI, or make better career decisions.',
      items: ['1 hour of mentoring', 'Support and contact via WhatsApp'],
      price: 'R$ 120',
    },
    coaching: {
      title: 'Ongoing coaching',
      description:
        'Continuous coaching for consistent growth. Here the focus is on going beyond the conversation and generating real results in your day-to-day work as a designer.',
      items: [
        '1 hour of mentoring',
        '4 meetings per month',
        'Access to exclusive materials and tools',
        'Personalized growth plan',
        'Support and contact via WhatsApp',
      ],
      price: 'R$ 108',
    },
    consulting: {
      title: 'Consulting',
      description:
        'Consulting aimed at companies that need to structure, evolve or unblock their design system and design processes.',
      items: [
        'Creating or evolving a design system',
        'Mapping problems (inconsistent UI, rework, etc.)',
        'Structured action plan (priorities + roadmap)',
        'Hands-on workshops with the team',
        '3 printed copies of Design System Beyond the Layout',
      ],
      contactHtml:
        "Send an e-mail to <a href='mailto:contato@mateusvillain.com' class='link'>contato@mateusvillain.com</a> so we can schedule a conversation.",
    },
  },
  faq: {
    title: 'Frequently asked questions',
    items: [
      {
        question: 'How do the sessions work?',
        answer:
          'Sessions cover one or more topics of your choice, on the day and time that works best for you. During the session, I am completely open to whatever you want to bring. It can be questions, help with your portfolio or projects at work, guidance while building a product... You decide!',
      },
      {
        question: 'Can sessions be recorded?',
        answer:
          'Sessions are usually not recorded, but we can agree on that and record through Google Meet itself.',
      },
      {
        question: 'How does rescheduling work?',
        answer:
          'Rescheduling the day and time of a session is perfectly fine, but so I can organize myself, I only ask that you let me know at least 1 day in advance.',
      },
      {
        question: 'What payment methods are accepted?',
        answer:
          'At the moment the accepted payment method is Pix (Brazilian instant payment). If you are outside Brazil, get in touch and we will find an alternative.',
      },
      {
        question: 'Can I request an invoice?',
        answer:
          'Yes! If you need an invoice (nota fiscal), just let me know and I will issue it. For that, I will need some details about you or your company.',
      },
    ],
  },
}

const pt: typeof en = {
  metaTitle: 'Mentorias - Mateus Villain',
  metaDescription:
    'Mentorias individuais, acompanhamento contínuo e consultoria em design system, UI e carreira em design, com Mateus Villain.',
  title: 'Mentorias',
  intro:
    'Se você precisa de ajuda com algum assunto ou quer um acompanhamento em algum projeto que você está ou será responsável, fique à vontade para marcar uma mentoria.',
  openAgenda: 'Agenda de mentorias aberta!',
  contactHtml:
    "Entre em contato comigo via <a href='https://linkedin.com/in/mateusvillain' class='link'>LinkedIn</a> ou pelo e-mail <a href='mailto:mentoria@mateusvillain.com' class='link'>mentoria@mateusvillain.com</a> para agendar suas mentorias.",
  topics: {
    title: 'Quais os temas?',
    description:
      'O principal tema pedido nas mentorias é design system, mas podemos tratar de outros assuntos, como UI, inteligência artificial ou recursos de desenvolvimento mas para designers:',
    tags: [
      'Design System',
      'Design Tokens',
      'Git',
      'Figma MCP',
      'User Interface',
      'HTML e CSS',
      'Acessibilidade',
      'Handoff',
      'Framer',
    ],
  },
  duration: {
    title: 'Qual a duração de mentoria?',
    description:
      'A duração mínima da mentoria é de 1 hora, mas totalmente aberto para estendermos se for necessário.',
  },
  where: {
    title: 'Onde a mentoria é feita?',
    description: 'As mentorias são feitas pelo Google Meet.',
  },
  pricing: {
    title: 'Categorias e valores',
    perSession: '/sessão',
    mentoring: {
      title: 'Mentoria',
      description:
        'Mentoria 1:1 focada em te dar clareza e direcionamento prático. Ideal para quem quer evoluir mais rápido em design system, UI ou tomar decisões melhores na carreira.',
      items: ['1 hora de mentoria', 'Suporte e contato por WhatsApp'],
      price: 'R$ 120',
    },
    coaching: {
      title: 'Acompanhamento',
      description:
        'Um acompanhamento contínuo para evolução consistente. Aqui o foco é sair da conversa e gerar resultado real no seu dia a dia como designer.',
      items: [
        '1 hora de mentoria',
        '4 encontros por mês',
        'Acesso a materiais e ferramentas exclusivas',
        'Plano de evolução personalizado',
        'Suporte e contato por WhatsApp',
      ],
      price: 'R$ 108',
    },
    consulting: {
      title: 'Consultoria',
      description:
        'Consultoria voltada para empresas que precisam estruturar, evoluir ou destravar seu design system e processos de design.',
      items: [
        'Criação ou evolução de design system',
        'Mapeamento de problemas (UI inconsistente, retrabalho, etc.)',
        'Plano de ação estruturado (prioridades + roadmap)',
        'Workshops com time (mão na massa)',
        '3 livros físicos de Design System além do layout',
      ],
      contactHtml:
        "Envie um e-mail para <a href='mailto:contato@mateusvillain.com' class='link'>contato@mateusvillain.com</a> para agendarmos uma conversa.",
    },
  },
  faq: {
    title: 'Perguntas frequentes',
    items: [
      {
        question: 'Como funcionam as mentorias?',
        answer:
          'As mentorias são realizadas com um ou mais temas que você decidir, no dia e horário que for mais confortável para você. Durante a mentoria, fico totalmente aberto para você trazer o que quiser. Podem ser dúvidas, ajuda com portfólio ou projetos na empresa, acompanhamento na construção de um produto... Quem decide é você!',
      },
      {
        question: 'É possível gravar as mentorias?',
        answer:
          'Normalmente as mentorias não são gravadas, mas podemos alinhar isso e realizar a gravação pelo próprio Google Meet.',
      },
      {
        question: 'Como funcionam os reagendamentos?',
        answer:
          'Reagendar o dia e o horário de uma mentoria é perfeitamente aceitável, mas para que eu possa me organizar, peço apenas que me avise com pelo menos 1 dia de antecedência.',
      },
      {
        question: 'Qual a forma de pagamento?',
        answer: 'A forma de pagamento aceita no momento é Pix.',
      },
      {
        question: 'Posso solicitar nota fiscal?',
        answer:
          'Sim! Caso você precise solicitar a nota fiscal, basta apenas me avisar que farei a emissão. Para isso, precisarei de algumas informações suas ou da sua empresa.',
      },
    ],
  },
}

export const mentorship: Dictionary<typeof en> = { en, pt }
