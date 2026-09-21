import type { Dictionary } from './ui'

/**
 * Textos da parte publica do case do Locaweb Design System. A parte
 * protegida vem do Notion e existe apenas em portugues (ver
 * `protected.notice`).
 */
const en = {
  metaTitle: 'Locaweb Design System - Mateus Villain',
  metaDescription:
    'Optimizing the Locaweb design system, focusing on design tokens, accessibility and scalability.',
  title: 'Restructuring the tokens of the Locaweb Design System',
  tags: ['design system', 'design tokens', 'accessibility', 'user interface'],
  company: 'Company:',
  companyName: 'Locaweb',
  role: 'Role:',
  roleName: 'Product designer',
  overview: {
    title: 'Overview',
    text: 'The Locaweb design system was built on top of Vuetify to speed up development, but it ended up producing components and tokens that were hard to scale and lacked clear documentation. In this project, my role was to review and improve these elements, bringing more scalability and efficiency to designers and developers.',
    resultsTitle: 'Results',
    results: [
      'New design tokens system, separating primitive and semantic tokens, with clear and scalable naming.',
      'Rebuilt color palettes, ensuring accessible contrast and well-defined semantic usage.',
      'Typographic scales with relative units and better adaptation to smaller screens.',
      'Elevation system completely redesigned, based on lighting models and with usage guidelines for components and microinteractions.',
      'Clear documentation, explaining general component usage and individual properties, along with accessibility criteria.',
      'Components with accessibility attributes (ARIA) included, and screen-reader labels defined directly in the Figma component.',
    ],
  },
  discovery: {
    title: 'Discovery',
    analysisTitle: 'Product analysis',
    analysis: [
      'The first analysis consisted of cataloguing every design token and understanding its use case within the design system. In addition, using Figma analytics, I was able to observe the number of insertions of styles, variables and components in the file, as well as the number of detaches.',
      'Looking at color usage, I noticed that in every palette at least one shade was never used, and due to the lack of documentation there was no real guidance on how and when to use each one. With the sole exception of the neutral palette, all the others were only used for microinteractions in components, but without names that indicated that. I also noticed that some shades used as text backgrounds in components did not have enough contrast according to WCAG guidelines.',
    ],
    colorTokensAlt:
      'Example of color tokens with inconsistent names between the main palette and the gray scale, showing a lack of naming standardization.',
    typography: [
      'The responsiveness of the typographic scale was poorly executed. Instead of working with relative units (such as rem or em), as is conventional, and reducing the value per breakpoint, texts simply dropped one step down the scale: if on desktop we had 40, 32 and 24 pixel texts, on mobile the one using 40 became 32 pixels, the 32 became 24, and so on.',
      'This reduction resulted in texts that were far too large on mobile devices, and also in the last two scales ending up the same size, since the last one had no smaller value to fall back to.',
    ],
    typographyUsage:
      'However, the biggest problem I noticed regarding typography was its practical use. Within the design system itself, some headings were made of different sizes, and products had no consistent pattern between them. This was due to the unclear naming (font-size-xl, lg, md...) and to the lack of any indication of what an h1, h2 or other tags should be.',
    typographyAlt:
      'List of texts with different font sizes, showing a disorganized typographic scale that adapts poorly across devices.',
    fonts:
      'Finally, the design system also provided the same scales for both brand typefaces, Ubuntu (primary) and Open Sans (secondary), but the latter was rarely used in projects — some designers did not even know it existed.',
    interviewsTitle: 'Interviews with collaborators',
    interviews: [
      'For the second analysis, I prepared a script and ran an individual interview with each of the designers who were already using the design system in their products, aiming to understand their perceptions about token usage.',
      'The research confirmed some of the data I had already collected in the first analysis, but also brought new findings:',
    ],
    interviewNotes: [
      {
        title: 'Little use of the secondary color',
        text: 'Designers never used the secondary color anywhere in the product interfaces, and since there was no documentation, they could not say what that palette was for.',
      },
      {
        title: 'Difficulty understanding typographic hierarchies',
        text: 'Designers had different understandings of when to use most of the typographic scales. There were different definitions of what the page title, subtitle, and even a section heading should be.',
      },
      {
        title: 'Unused "light" weight',
        text: 'The file provided the "light" weight for each of the eight scales, and even with very few insertions seen in analytics, every designer said they never used it and did not know its use case.',
      },
      {
        title: 'Uncertainty about using gray scales in text',
        text: 'Due to the lack of standards and recommendations, designers had different understandings of how to use the gray scales in text to support the hierarchy of headings and paragraphs.',
      },
    ],
    comparisonTitle: 'Comparing design and code',
    comparison: [
      'The third and final analysis involved a direct comparison between Figma and code for every design token and component.',
      'I first did this survey on my own, to form my own views initially, but in the end I decided to meet with the person responsible for the design system front-end development, both to collect more information and to hand over the points I had gathered.',
    ],
    comparisonNotes: [
      {
        title: 'Components with different names',
        text: 'Although designers and developers used the same components, some of them did not share the same name, as was the case with Dialog for designers and Modal for developers.',
      },
      {
        title: 'Typographic scales with distinct names',
        text: 'While designers recognized the scales by a certain naming in Figma, the design token naming actually used by developers was different.',
      },
      {
        title: 'Elevation differences between design and code',
        text: 'The design system file in Figma provided some elevation levels (shadow styles) that were completely different from the tokens, both in naming and in value.',
      },
    ],
  },
  protected: {
    title: 'Confidential information',
    text: 'The solution of this project contains confidential information. To keep reading, you need to enter the correct password in the field below.',
    noPasswordHtml:
      "Don't have the password? Get in touch with me on <lui-link external href='https://www.linkedin.com/in/mateusvillain/'>LinkedIn</lui-link> or by e-mail at <strong>contato@mateusvillain.com</strong>.",
    notice: 'The protected content is available in Portuguese only.',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter the project password',
    passwordError: 'Incorrect password. Please try again.',
    unlock: 'Unlock',
    required: 'Required field.',
    wrongPassword: 'The password you entered is incorrect. Please try again.',
    loadError: 'Error loading content.',
  },
}

const pt: typeof en = {
  metaTitle: 'Locaweb Design System - Mateus Villain',
  metaDescription:
    'Otimização do design system da Locaweb, com foco em design tokens, acessibilidade e escalabilidade.',
  title: 'Reestruturando os tokens do Locaweb Design System',
  tags: ['design system', 'design tokens', 'acessibilidade', 'user interface'],
  company: 'Empresa:',
  companyName: 'Locaweb',
  role: 'Atuação:',
  roleName: 'Product designer',
  overview: {
    title: 'Visão geral',
    text: 'O design system da Locaweb foi criado a partir do Vuetify para agilizar o desenvolvimento, mas acabou gerando componentes e tokens pouco escaláveis e sem documentação clara. Nesse projeto, meu papel foi revisar e melhorar esses elementos, trazendo mais escalabilidade e eficiência para designers e desenvolvedores.',
    resultsTitle: 'Resultados',
    results: [
      'Novo sistema de design tokens, com separação entre tokens primitivos e semânticos, nomenclaturas claras e escaláveis.',
      'Paletas de cores recriadas, garantindo contrastes acessíveis e com uso semântico definido.',
      'Escalas tipográficas com medidas relativas e melhor adaptação a telas menores.',
      'Sistema de elevação totalmente reformulado, baseado em modelos de iluminação e com definição de uso em componentes e microinterações.',
      'Documentação clara, com explicação de uso geral dos componentes e suas propriedades individuais, e critérios de acessibilidade.',
      'Componentes com atributos de acessibilidade (ARIA) incluídos, e adoção de rótulos para softwares leitura de tela com definição diretamente no componente do Figma.',
    ],
  },
  discovery: {
    title: 'Descobertas',
    analysisTitle: 'Análise do produto',
    analysis: [
      'A primeira análise consistiu em catalogar cada design token e entender qual o caso de uso que eles tinham no design system. Além disso, utilizando o analytics do Figma, pude observar o número de inserções dos estilos, variáveis e componentes do arquivo, além da quantidade de detaches.',
      'Avaliando o uso das cores, reparei que em todas as paletas, pelo menos um dos tons nunca era utilizado, e pela falta de documentação, não havia uma indicação verdadeira de como e quando utilizar cada uma, considerando que apenas com exceção a paleta de cores neutras, todas as outras eram apenas usadas para microinterações nos componentes, mas sem nomenclaturas que indicassem isso. Além disso, também percebi que alguns tons usados como background para textos em componentes não contrastavam bem, seguindo as diretrizes da WCAG.',
    ],
    colorTokensAlt:
      'Exemplo de tokens de cores com nomes inconsistentes entre a paleta principal e a escala de cinza, mostrando falta de padronização na nomenclatura.',
    typography: [
      'A responsividade do sistema de escalas tipográficas não era bem executado. Em vez de trabalhar com medidas relativas (como rem ou em), como é o convencional, e reduzir o valor conforme o breakpoint, os textos apenas reduziam o tamanho para uma escala abaixo, ou seja, se em desktop tinhamos textos de 40, 32 e 24 pixels, em mobile o texto que usava 40 atualizava para 32 pixels, e o 32 para 24 pixels, e assim por diante.',
      'Essa redução ocasionava tanto em textos demasiadamente grandes em dispositivos móveis, como também nas duas últimas escalas com o mesmo tamanho, já que a última não possuia um valor menor para atualizar.',
    ],
    typographyUsage:
      'Entretanto, o maior problema que notei com relação a tipografia era o seu uso prático. No próprio design system, alguns títulos eram compostos por tamanhos diferentes, e os produtos não possuíam padrão entre si. Isso se devia pela nomenclatura nada clara (font-size-xl, lg, md...) e por não ter nenhuma indicação do que seria um h1, h2 e outras tags.',
    typographyAlt:
      'Lista de textos com diferentes tamanhos de fonte, mostrando uma escala tipográfica desorganizada e pouco responsiva entre dispositivos.',
    fonts:
      'Por fim, o design system também fornecia as mesmas escalas para as duas fontes da marca, Ubuntu (principal) e Open Sans (secundária), mas a última raramente era usada nos projetos, considerando que até mesmo alguns designers nem sabiam da existência dela.',
    interviewsTitle: 'Entrevista com colaboradores',
    interviews: [
      'Para a segunda análise, preparei um roteiro e realizei uma entrevista individual com cada um dos designers que já vinham utilizando o design system nos seus produtos, com o objetivo de entender as percepções de cada um sobre o uso dos tokens.',
      'A pesquisa comprovou alguns dos dados que eu já havia coletado na primeira análise, mas também me trouxe novos resultados:',
    ],
    interviewNotes: [
      {
        title: 'Pouco uso da cor secundária',
        text: 'Os designers não utilizavam a cor secundária em nenhuma ocasião na interface dos produtos, e como não havia documentação, não sabiam dizer para que essa paleta servia.',
      },
      {
        title: 'Dificuldades em entender as hierarquias tipográficas',
        text: 'Os designers tinham entendimentos diferentes sobre quando utilizar a maioria das escalas tipográficas. Haviam diferentes definições do que seria o título da página, subtítulo, e até mesmo uma chamada de seção.',
      },
      {
        title: 'Inutilização do peso "light"',
        text: 'O arquivo fornecia o peso “light” para cada uma das oito escalas, e mesmo que com pouquíssimas inserções vistas no analytics, todos os designers afirmaram nunca usar e nem saber o seu caso de uso.',
      },
      {
        title: 'Incerteza sobre o uso das escalas de cinza nos textos',
        text: 'Pela falta de padronização e recomendação, os designers tinham diferentes entendimentos entre si sobre o uso das escalas de cinza em textos, de forma a colaborar na hierarquia de títulos e parágrafos.',
      },
    ],
    comparisonTitle: 'Comparações entre design e código',
    comparison: [
      'A terceira e última análise envolveu uma comparação direta entre Figma e código de todos os design tokens e componentes.',
      'Esse levantamento foi feito primeiramente sozinho, para ter inicialmente as minhas próprias visões, mas no final decidi me reunir com o responsável pelo desenvolvimento front-end do design system, tanto para ter a oportunidade de coletar mais informações como já passar para ele os pontos que coletei.',
    ],
    comparisonNotes: [
      {
        title: 'Componentes com nomes diferentes',
        text: 'Apesar dos designers e desenvolvedores usarem os mesmos componentes, alguns deles não compartilhavam o mesmo nome, como era o caso do Dialog para os designers, e Modal para os desenvolvedores.',
      },
      {
        title: 'Escalas tipográficas com nomes distintos',
        text: 'Enquanto os designers reconheciam as escalas por uma determinada nomenclatura no Figma, a nomenclatura do design token usada na prática pelos desenvolvedores eram outras.',
      },
      {
        title: 'Diferenças nas elevações em design e código',
        text: 'O arquivo do design system no Figma fornecia alguns níveis de elevação (estilos de sombra), que eram completamente diferentes dos tokens, tanto em nomenclatura quanto em valor.',
      },
    ],
  },
  protected: {
    title: 'Informações confidenciais',
    text: 'A solução do projeto contém informações confidenciais. Para continuar lendo, é necessário informar a senha correta no campo a seguir.',
    noPasswordHtml:
      "Não possui a senha? Entre em contato comigo pelo <lui-link external href='https://www.linkedin.com/in/mateusvillain/'>LinkedIn</lui-link> ou pelo e-mail <strong>contato@mateusvillain.com</strong>.",
    notice: '',
    passwordLabel: 'Senha',
    passwordPlaceholder: 'Digite a senha do projeto',
    passwordError: 'Senha incorreta. Tente novamente.',
    unlock: 'Desbloquear',
    required: 'Campo obrigatório.',
    wrongPassword: 'A senha informada está incorreta. Tente novamente.',
    loadError: 'Erro ao carregar conteúdo.',
  },
}

export const caseLocaweb: Dictionary<typeof en> = { en, pt }
