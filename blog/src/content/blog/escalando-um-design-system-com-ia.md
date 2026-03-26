---
title: 'Escalando um Design System com IA: Reduzindo trabalho e automatizando processos'
description: 'Utilize inteligência artificial para automatizar a criação e manutenção de design tokens, componentes e documentações.'
date: '2026-03-26'
cover: '/blog/covers/design-system-ia.png'
tags:
  [
    'design system',
    'design tokens',
    'ia',
    'dtcg',
    'design tokens resolver module',
    'resolver',
    'terrazzo',
    'antigravity',
    'claude',
  ]
---

A parte "difícil" de um design system não é criar as interfaces. Essa é, na verdade, a parte mais tranquila, e talvez a mais repetitiva de todo o processo. O desafio real é garantir que ele seja escalável, consistente e fácil de manter ao longo do tempo, ou em outras palavras, a governança.

A IA vem facilitando o processo para criar interfaces tanto no ambiente de design, por meio de ferramentas como o Figma, como no ambiente de desenvolvimento, por meio de código.

Criar do zero algo que nós já conhecemos pode ser mais prejudicial para o principal recurso que todos nós temos mas que não pode ser recuperado: o tempo. A inteligência artificial é uma aliada perfeita para o cenário de automatizar o fluxo de criação e manutenção de design tokens, componentes e documentações. Cabe a nós usarmos da maneira correta.

Nesse artigo, eu trago um formato em que você pode usar IA aplicada ao seu trabalho de design ou engenharia para criar e escalar um design system.

## Preparando o ambiente

Para que tudo saia de maneira correta, é importante que você tenha algumas ferramentas a sua disposição:

### Ferramentas

- [Google Antigravity](https://antigravity.google/download)
- [Figma](https://www.figma.com/pt-br/downloads/)
- [Claude](https://claude.com/download)
- [Git](https://git-scm.com/install/) (v18+)
- [Node.js](https://nodejs.org/pt-br/download/current.)

### Repositórios

- [Repositório do projeto](https://github.com/mateusvillain/design-system-ia)
- [Figma Console MCP](https://github.com/southleft/figma-console-mcp)
- [Projeto no Figma](https://www.figma.com/community/file/1619045820290556230), para testar as aplicações

## Parte 1: Auditoria de UI

Nenhum design system fica pronto em 5 minutos, muito menos em 1 mês. É um processo de construção contínuo. Todo design system precisa ter uma marca por trás para ditar quais são os princípios que ele irá seguir, e a quais produtos ou serviços ele irá atingir.

Nesse primeiro momento, vamos analisar o arquivo do Figma para entender como ele está organizado e quais são os componentes que temos disponíveis.

## Parte 1.5: Usando IA para criar interfaces no Figma

Ninguém merece ter que ficar criando um botão do zero sempre que for construir um novo design system no Figma. A questão não é ser um processo difícil, porque não é, mas sim pelo fato de ser um processo moroso. Você sabe como é, como funciona, o que precisa ser feito. Já correu por essa estrada várias vezes. Pra não precisar ter que fazer tudo isso mais uma vez manualmente, use IA. Domine ela para ela não dominar você.

Eu já escrevi um outro artigo aqui falando sobre a aplicação de IA dentro do Figma para controlar tudo: protótipos, estilos, variáveis, componentes, auto layout, dev mode... Praticamente não tem limites. Então antes de continuar, dê uma olhada na minha outra publicação: [Design no Figma com Claude: como usar IA para criar interfaces e controlar todo o seu Figma](https://www.mateusvillain.com/blog/design-no-figma-com-claude).

Esse processo não usa o Figma MCP, então você não precisa se preocupar com pagar algum plano do Figma para ter o Dev Mode, e nem mesmo precisa ter um plano do Claude pago.

Esse é um modelo não nativo, criado pelo [TJ Pitre](https://www.linkedin.com/in/tpitre/), mas há poucos dias atrás, o [Figma lançou essa funcionalidade](https://www.figma.com/blog/the-figma-canvas-is-now-open-to-agents/) nativamente de interação com agente para gerar informações no canvas de design, só que nesse caso, é preciso ter, pelo menos, o Figma pago.

## Parte 2: Preparando o terreno para os tokens

Os design tokens são um dos recursos mais valiosos em um design system. Eles tratam das decisões de design ao longo de cada interface. Quando olhamos para um simples botão, ao mesmo tempo estamos olhando para uma série de tokens, de cor, espaçamento, tipografia, borda.

O recurso de variáveis que o Figma possui imita a funcionalidade de tokens, mas não trata isso de forma fiel, e limita o uso a uma série de possibilidades que os tokens permitem.

Os design tokens costumam ser separados em três níveis:

### Primitive Tokens

São os valores básicos do design system. Tipo cores, espaçamentos, tipografia, bordas. Eles não têm contexto de uso, só definem “matéria-prima”.

```css
:root {
  --color-red-500: #e02828ff;
  --color-blue-500: #007bff;
  --spacing-8: 8px;
  --spacing-16: 16px;
  --radius-4: 4px;
}
```

### Semantic Tokens

São uma camada acima. Eles dão significado aos primitivos, conectando o valor a um contexto de uso.

```css
:root {
  --color-primary: var(--color-blue-500);
  --color-danger: var(--color-red-500);
  --spacing-small: var(--spacing-8);
  --spacing-medium: var(--spacing-16);
  --border-radius-default: var(--radius-4);
}
```

### Component Tokens

São tokens específicos de um componente, que definem como ele deve ser visualmente e, às vezes, comportamentalmente.

```css
:root {
  --button-background: var(--color-primary);
  --button-padding: var(--spacing-small) var(--spacing-medium);
  --button-radius: var(--border-radius-default);
  --button-danger-background: var(--color-danger);
}
```

## Parte 3: Componentes e microinterações

Componentes são blocos reutilizáveis de interface que combinam estrutura, estilo e comportamento. Eles são a base de qualquer design system e permitem que os designers e desenvolvedores trabalhem de forma mais eficiente e consistente.

Não existe uma regra de quais componentes devem existir num design system. Isso sempre irá variar da necessidade que os produtos possuem. Contudo, há alguns componentes que são comuns de se encontrar:

- `Button`
- `Card`
- `Modal`
- `Text Field`
- `Select`

Construir componentes é mais do que só unir formas com textos no Figma. É preciso pensar na sua adaptação para diferentes dispositivos, estados de interação, diferentes tamanhos, acessibilidade... É um processo que exige muita atenção aos detalhes.

Um componente simples, como um Botão, pode estar carregado de uma série de decisões, como o padrão de escrita, estados que variam entre hover, pressão, foco e desabilitado, variantes para diferentes hierarquias, uso de ícones para facilitar o entendimento, e atributos acessíveis para facilitar o uso por pessoas que dependem de tecnologias assistivas.

## Parte 4: Partindo para o código

O Figma é uma boa ferramenta para visualizar interfaces de forma mais prática se compararmos com uma IDE. O próprio Dylan Field, CEO do Figma, disse isso no seu perfil do X quando lançaram a funcionalidade "Code to Canvas". Eu concordo com a afirmação, mas verdade seja dita: o valor de verdade está no código.

As variáveis que criamos no Figma são uma alusão a tokens, como eu já disse anteriormente. Design tokens de verdade são estruturas em JSON, como essa:

```json
{
  "lui": {
    "color": {
      "primary": {
        "background": {
          "surface": {
            "$value": "{lui.brand.color.primary.1}"
          },
          "container": {
            "$value": "{lui.brand.color.primary.4}"
          }
        },
        "border": {
          "stroke": {
            "$value": "{lui.brand.color.primary.4}"
          }
        },
        "text": {
          "body": {
            "$value": "{lui.brand.color.primary.4}"
          }
        },
        "icon": {
          "default": {
            "$value": "{lui.brand.color.primary.4}"
          }
        }
      }
    }
  }
}
```

Mas, enquanto houver a separação entre as profissões de design e desenvolvimento, o Figma ainda será uma ferramenta que faz parte do processo de trabalho, e com isso, precisamos de meios para facilitar a entrega do visual para o código.

Para isso, criei um plugin que permite exportar todos os estilos e variáveis em formato de token no padrão W3C da [Design Tokens Community Group](https://www.designtokens.org/) (DTCG).

Esse plugin consegue analisar se suas variáveis possuem modos diferentes, de forma que consiga gerar arquivos separados para preparar os seus tokens para serem convertidos de JSON para CSS ou outra linguagem, permitindo design systems com múltiplos temas, como os convencionais light e dark mode, e até mesmo multi-brand, atendendo a duas ou mais marcas.

Você vai encontrar o plugin no meu repositório [design-system-ia](https://github.com/mateusvillain/design-system-ia), que já tem o ambiente preparado para receber os tokens e fazer a tradução. Dentro dele, também tem uma pasta chamada "example", caso você queira conferir um exemplo completo tanto da parte bruta, quanto da parte gerada e pronta pra uso.

Importe o plugin no Figma a partir do arquivo `manifest.json` que ele já estará apto para ser usado, lembrando que para importar plugins, é necessário ter o Figma Desktop.

### Organização

O repositório é formado pela seguinte estrutura:

```
design-system-ia/
├── .agents
│   ├── rules
│   └── workflows
│
├── dist                    # Tokens gerados em CSS
├── example                 # Repositório com exemplo de aplicação
├── tokens/
│   ├── primitive           # Organização de tokens primitivos
│   └── semantic            # Organização de tokens semânticos
│
├── tokens-exporter         # Plugin para exportar variáveis do Figma em tokens
├── terrazzo.config.ts      # Arquivo de configuração do Terrazzo
└── tokens.resolver.json    # Resolver dos design tokens
```

Para manter uma boa organização do projeto, e ser mais fácil localizar, seus tokens devem ficar dentro da pasta "tokens", mas alocados em uma das subpastas já criadas (primitive e semantic), ou novas pastas que você desejar criar. A partir do plugin, você pode copiar os códigos em JSON ou simplesmente exportá-los para a sua máquina.

Esse é o único processo com relação aos arquivos de tokens que você deverá fazer ao sair do Figma para o código. As próximas etapas tratam mais sobre a tradução e o formato em que elas serão geradas.

O arquivo `terrazzo.config.ts` pertence a biblioteca Terrazzo, instalada nesse repositório. Ela é uma tradutora de tokens que segue o padrão W3C, atuando na primeira versão estável da DTCG.

Já o arquivo `tokens.resolver.json` é também uma novidade recente, criada pela DTCG, para organizar os arquivos de tokens que serão gerados além de identificar quais arquivos possuem os mesmos tokens, mas com valores diferentes.

## Parte 5: Regras e Workflows com agentes de IA

Escalar um design system com IA significa que você estará interagindo o tempo todo com agentes para executarem uma série de tarefas, como criar um token, realizar a manutenção num componente, validar uma interface e até documentar. Precisamos usar a IA como nossa aliada, mas de forma esperta, para que ela consiga executar um determinado checklist, te indicando o que ela faz, como fez, e te dando a opção de revisar o que foi feito.

IDEs como o Google Antigravity e Cursor possuem recursos nativos para aplicar regras e workflows para o agente, de forma que sempre que você executar um prompt, ele saiba o que deve e o que não deve fazer.

### Rules

São instruções que definem como o código deve ser gerado ou estruturado dentro da IDE. Elas funcionam como um “guia automático”:

- padrões de código (ex: nome de variável, estrutura de componente)
- uso de tecnologias (ex: sempre usar CSS Modules, ou tokens do design system)
- boas práticas (ex: evitar inline styles)

As Rules ficam implicitas sempre que você está interagindo com o agente por meio do chat. Podem ser estabelecidas para estarem em funcionamento a cada prompt, olhando para todos os cenários, ao mesmo também que também podem ser definidas para acontecerem somente quando uma decisão ou workflow acontecer, sempre estabelecido por você.

### Workflows

São fluxos automatizados de tarefas dentro da IDE. Eles conectam várias ações em sequência, por exemplo:

- criar componente → já gerar testes → já aplicar tokens → já documentar
- ou: alterar design → atualizar código → rodar validações

Durante a interação com o agente via chat, é possível indicar qual workflow você deseja trabalhar naquele momento. É como um "prompt encapsulado". Você apenas referencia o workflow, e talvez precise dar alguma instrução mínima para não ser nada genérico.

Se estiver trabalhando com um workflow que avalia um componente no Figma para em seguida desenvolver, você pode apenas referenciar o processo, o nome do componente, e o link do componente no Figma para que ele saiba o que deve analisar corretamente:

`/create-component Button {link-do-figma}`

## Parte 6: Design Tokens Resolver

A Design Tokens Community Group lançou, junto da primeira versão estável dos design tokens, um arquivo de configuração chamado "resolver". De forma sucinta, ele serve para identificar quais são os arquivos de design tokens inseridos no repositório, quais deles fazem condicionais (mesmo nomenclatura mas com valores diferentes), para preparar para uma geração saudável.

Felizmente, eu já publiquei isso aqui no meu site, você pode ler em [Design Tokens Resolver: o módulo nativo para gerar tokens e condicionais](https://www.mateusvillain.com/blog/design-tokens-resolver).

No repositório, você vai encontrar esse arquivo com algumas configurações já feitas, para facilitar o seu processo:

```json
{
  "name": "Design System",
  "version": "2025.10",
  "sets": {
    "semantic": {
      "sources": [{ "$ref": "tokens/semantic/semantic.json" }]
    }
  },
  "modifiers": {
    "size": {
      "default": "desktop",
      "contexts": {
        "mobile": [{ "$ref": "tokens/primitive/spacing.small.json" }],
        "desktop": [{ "$ref": "tokens/primitive/spacing.large.json" }]
      }
    },
    "brandTheme": {
      "default": "brand-a-light",
      "contexts": {
        "brand-a-light": [{ "$ref": "tokens/theme/brand-a/light.json" }],
        "brand-a-dark": [{ "$ref": "tokens/theme/brand-a/dark.json" }],
        "brand-b-light": [{ "$ref": "tokens/theme/brand-b/light.json" }],
        "brand-b-dark": [{ "$ref": "tokens/theme/brand-b/dark.json" }]
      }
    }
  },
  "resolutionOrder": [
    { "$ref": "#/sets/semantic" },
    { "$ref": "#/modifiers/size" },
    { "$ref": "#/modifiers/brandTheme" }
  ]
}
```

O que temos nesse arquivo é a identificação de um set, que se trata do arquivo `semantic.json`, enquanto todos os outros arquivos referenciados são modifiers, sendo um para size, tratando de valores responsivos, e outro para brand, criando os temas de cor claro e escuro para duas marcas fictícias.

## Parte 7: Traduzindo tokens com Terrazzo

Existem algumas ferramentas que ajudam na tradução de tokens. A mais famosa e conhecida é o Style Dictionary, que por sinal, é a ferramenta mais completa que temos. Ela permite que você crie tokens em JSON e os exporte para diversos formatos, como CSS, SCSS, LESS JavaScript, Flutter, Swift, entre outras linguagens. O Style Dictionary abre as portas para que seus tokens possam estar tanto em dispositivos web quanto em aplicativos para smartphones.

Contudo, o Style Dictionary ainda não atende de forma perfeita a primeira versão estável de tokens da DTCG. No geral, isso não é um problema, considerando ainda que boa parte dos design systems usam essa ferramenta e continuam muito bem. Contudo, estamos caminhando para esse padrão, e o próprio Style Dictionary vem trabalhando para atender a esse modelo.

Para resolver isso, uma nova ferramenta semelhante surgiu, chamada Terrazzo. Ela é uma ferramenta mais leve e simples que o Style Dictionary, mas que atende perfeitamente a primeira versão estável de tokens da DTCG. Além disso, ela é open source e conta com uma comunidade ativa.

Instalar o Terrazzo é extremamente simples, e toda configuração que você precisa fazer pode ser encontrada na [documentação](https://terrazzo.app/docs/) deles.

No nosso repositório, você já vai encontrar o arquivo de configuração, chamado `terrazzo.config.ts`. Dentro dele, terá o seguinte:

```typescript
import { defineConfig } from '@terrazzo/cli'
import css from '@terrazzo/plugin-css'

export default defineConfig({
  tokens: ['./tokens.resolver.json'], // Arquivo que o Terrazzo deve olhar para gerar os tokens
  outDir: './dist/', // Pasta em que o arquivo será gerado
  plugins: [
    css({
      filename: 'tokens.css', // Nome do arquivo de tokens gerado em CSS
      permutations: [
        {
          // Gera todos os tokens nas suas versões "default", definidas no resolver.json
          input: {},
          prepare: (css) => `:root {\n  ${css}\n}`,
        },
        {
          input: { brandTheme: 'brand-a-light' }, // Nome do "context" no resolver.json
          include: ['color.**'], // Filtra apenas pelos tokens que começam por esse nome
          prepare: (css) =>
            `[data-brand="brand-a"][data-theme="light"] {\n  color-scheme: light;\n  ${css}\n}`,
        },
        {
          input: { brandTheme: 'brand-a-light' },
          include: ['color.**'],
          prepare: (css) =>
            `@media (prefers-color-scheme: light) {\n  [data-brand="brand-a"] {\n    color-scheme: light;\n    ${css}  \n  }\n}`,
          // O @media (prefers-color-scheme: light/dark) é usado quando queremos dar ao usuário a possibilidade de decidir qual tema ele quer visualizar
        },
        {
          input: { brandTheme: 'brand-a-dark' },
          include: ['color.**'],
          prepare: (css) =>
            `[data-brand="brand-a"][data-theme="dark"] {\n  color-scheme: dark;\n  ${css}\n}`,
          // O data-theme é usado para identificar o tema definido no sistema operacional, e usar como padrão no site
        },
        {
          input: { brandTheme: 'brand-a-dark' },
          include: ['color.**'],
          prepare: (css) =>
            `@media (prefers-color-scheme: dark) {\n  [data-brand="brand-a"] {\n    color-scheme: dark;\n    ${css}  \n  }\n}`,
        },
        {
          input: { brandTheme: 'brand-b-light' },
          include: ['color.**'],
          prepare: (css) =>
            `[data-brand="brand-b"][data-theme="light"] {\n  color-scheme: light;\n  ${css}\n}`,
        },
        {
          input: { brandTheme: 'brand-b-light' },
          include: ['color.**'],
          prepare: (css) =>
            `@media (prefers-color-scheme: light) {\n  [data-brand="brand-b"] {\n    color-scheme: light;\n    ${css}  \n  }\n}`,
        },
        {
          input: { brandTheme: 'brand-b-dark' },
          include: ['color.**'],
          prepare: (css) =>
            `[data-brand="brand-b"][data-theme="dark"] {\n  color-scheme: dark;\n  ${css}\n}`,
        },
        {
          input: { brandTheme: 'brand-b-dark' },
          include: ['color.**'],
          prepare: (css) =>
            `@media (prefers-color-scheme: dark) {\n  [data-brand="brand-b"] {\n    color-scheme: dark;\n    ${css}  \n  }\n}`,
        },
        {
          input: { size: 'desktop' },
          include: ['spacing.**'],
          prepare: (css) =>
            `@media (width >= 600px) {\n  :root {\n    ${css}\n  }\n}`,
          // O @media (width >= X) faz com que o sistema aplique apenas os valores dentro dele quando a largura foi maior ou igual ao valor definido
        },
        {
          input: { size: 'mobile' },
          include: ['spacing.**'],
          prepare: (css) =>
            `@media (width < 600px) {\n  :root {\n    ${css}\n  }\n}`,
          // O @media (width < X) faz com que o sistema aplique apenas os valores dentro dele quando a largura foi menor ao valor definido
        },
      ],
    }),
  ],
  lint: {
    rules: {
      'core/consistent-naming': ['error', { format: 'kebab-case' }],
      'a11y/min-font-size': ['error', { minSizeRem: 1 }],
      'core/valid-color': [
        'error',
        { legacyFormat: false, ignoreRanges: false },
      ],
      'core/valid-font-family': 'error',
      'core/valid-font-weight': 'error',
      'core/duplicate-values': 'off',
    },
  },
})
```

Propositalmente, já deixei alguns comentários ao longo do arquivo pra facilitar o entendimento do que cada parte faz, mas detalhando melhor:

As duas primeiras linhas importam as funções necessárias para a configuração do Terrazzo, sendo uma a função principal e a outra um plugin para geração de tokens em CSS:

```typescript
import { defineConfig } from '@terrazzo/cli'
import css from '@terrazzo/plugin-css'
```

A função `defineConfig` é a função principal do Terrazzo, e é ela que vai receber a configuração do Terrazzo. Já o `css` é um plugin que vai receber a configuração do plugin de CSS.

Já a terceira linha é a que define o arquivo que o Terrazzo deve olhar para gerar os tokens:

```typescript
export default defineConfig({
  ...
})
```

Dentro dela, tratamos todas as configurações que queremos ao executar o Terrazzo, e o que ele deve fazer ao gerar o arquivo.

```typescript
tokens: ['./tokens.resolver.json'],
outDir: './dist/',
```

O `tokens` é o arquivo que o Terrazzo deve olhar para gerar os tokens. Dentro dos colchetes, é possível adicionar mais um arquivo apenas separando por virgula. Como estamos trabalhando com um arquivo resolver que centraliza tudo isso, basta inserir apenas ele. O `outDir` é a pasta em que o arquivo será gerado.

Para gerar nossos tokens em outras linguagens, aplicamos as que o Terrazzo aceita dentro de `plugins`. No exemplo, estamos usando a geração de arquivo para CSS, mas também é possível gerar em SCSS.

```typescript
plugins: [
  css({
    ...
  })
]
```

Para dar um nome ao arquivo gerado, usamos o `filename`.

```typescript
filename: 'tokens.css'
```

Já o `permutations` é um array de objetos que vai definir todas as permutações que o Terrazzo deve gerar. Dentro dele, cada objeto vai ter um `input`, para identificar qual set ou modifier olhar quando o Terrazzo analisar o resolver, e um `prepare` para preparar o arquivo final seguindo ou não algum modelo. É possível também adicionar um `include` para filtrar quais tokens devem ser usados nessa permutação. Nesse caso, ao rodar o Terrazzo, ele somente irá olhar para os tokens que começam com o termo que você incluiu dentro dos colchetes.

```typescript
permutations: [
  {
    input: { brandTheme: 'brand-a-light' },
    include: ['color.**'],
    prepare: (css) =>
      `[data-brand="brand-a"][data-theme="light"] {\n  color-scheme: light;\n  ${css}\n}`,
  },
]
```

Para executar o Terrazzo, basta rodar o comando `npm run build` ou `npx tz build` no terminal, e ele irá gerar o arquivo `tokens.css` na pasta `dist/`.

## Continue automatizando

Você vai usar IA para automatizar processos em design e desenvolvimento criando e realizando manutenções, mas note que a IA pode ir além disso. Aproveite da inteligência somada as regras e workflows, e toda a base de conhecimento do produto, para realizar análises e validações de performance, consistência (tanto visual quanto de código), acessibilidade e estrutura.

Aproveite isso para documentar tudo o que você projetou. Repositórios como o famoso Storybook são gratuitos para serem adicionados ao seu projeto, podendo documentar todas as propriedades e casos de uso do seu design system.

E claro, vá além dessa publicação. Não existe uma única forma e nem uma forma correta. Esse é só um caso dentre vários que surgiram e ainda vão surgir. Aproveite de outros recursos e integrações para cada vez melhorar esse processo.
