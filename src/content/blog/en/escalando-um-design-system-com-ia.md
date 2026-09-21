---
title: 'Scaling a Design System with AI: Reducing work and automating processes'
description: 'Use artificial intelligence to automate the creation and maintenance of design tokens, components and documentation.'
date: '2026-03-26'
cover: '/blog/covers/design-system-ia.png'
slug: 'scaling-a-design-system-with-ai'
tags:
  [
    'design system',
    'design tokens',
    'ai',
    'dtcg',
    'design tokens resolver module',
    'resolver',
    'terrazzo',
    'antigravity',
    'claude',
  ]
---

The "hard" part of a design system is not creating the interfaces. That is actually the easiest part, and perhaps the most repetitive of the whole process. The real challenge is making sure it is scalable, consistent and easy to maintain over time — in other words, governance.

AI has been making the process of creating interfaces easier both in the design environment, through tools like Figma, and in the development environment, through code.

Creating from scratch something we already know can be harmful to the main resource we all have but cannot recover: time. Artificial intelligence is the perfect ally for automating the flow of creating and maintaining design tokens, components and documentation. It is up to us to use it the right way.

In this article, I bring a format in which you can apply AI to your design or engineering work to create and scale a design system.

## Setting up the environment

For everything to go smoothly, it is important to have a few tools at your disposal:

### Tools

- [Google Antigravity](https://antigravity.google/download)
- [Figma](https://www.figma.com/downloads/)
- [Claude](https://claude.com/download)
- [Node.js](https://nodejs.org/en/download/current) (v18+)
- [Git](https://git-scm.com/install/) (optional)

### Repositories

- [Project repository](https://github.com/mateusvillain/design-system-ia)
- [Figma Console MCP](https://github.com/southleft/figma-console-mcp)
- [Figma project](https://www.figma.com/community/file/1619045820290556230), to test the applications

## Part 1: UI audit

No design system is ready in 5 minutes, let alone in 1 month. It is a continuous construction process. Every design system needs a brand behind it to dictate the principles it will follow and which products or services it will serve.

In this first moment, we will analyze the Figma file to understand how it is organized and which components we have available.

## Part 1.5: Using AI to create interfaces in Figma

Nobody deserves having to build a button from scratch every time they start a new design system in Figma. The point is not that it is a hard process, because it isn't, but that it is a slow one. You know what it is, how it works, what needs to be done. You have been down this road many times. To avoid doing all of it manually once again, use AI. Master it so it doesn't master you.

I have already written another article here about applying AI inside Figma to control everything: prototypes, styles, variables, components, auto layout, dev mode... There are practically no limits. So before moving on, take a look at my other post: [Designing in Figma with Claude: how to use AI to create interfaces and control your entire Figma](/blog/designing-in-figma-with-claude/).

This process does not use the Figma MCP, so you don't need to worry about paying for a Figma plan to get Dev Mode, and you don't even need a paid Claude plan.

This is a non-native model, created by [TJ Pitre](https://www.linkedin.com/in/tpitre/), but just a few days ago [Figma released this feature](https://www.figma.com/blog/the-figma-canvas-is-now-open-to-agents/) natively — agent interaction to generate content on the design canvas — except in that case you need at least a paid Figma plan.

## Part 2: Preparing the ground for tokens

Design tokens are one of the most valuable resources in a design system. They deal with the design decisions across every interface. When we look at a simple button, we are also looking at a series of tokens: color, spacing, typography, border.

Figma's variables feature mimics the functionality of tokens, but it does not handle it faithfully, and it limits the use to a fraction of the possibilities that tokens allow.

Design tokens are usually separated into three levels:

### Primitive Tokens

These are the basic values of the design system. Things like colors, spacing, typography, borders. They have no usage context; they just define the "raw material".

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

These are one layer above. They give meaning to the primitives, connecting the value to a usage context.

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

These are tokens specific to a component, defining how it should look and, sometimes, how it should behave.

```css
:root {
  --button-background: var(--color-primary);
  --button-padding: var(--spacing-small) var(--spacing-medium);
  --button-radius: var(--border-radius-default);
  --button-danger-background: var(--color-danger);
}
```

## Part 3: Components and microinteractions

Components are reusable interface blocks that combine structure, style and behavior. They are the foundation of any design system and allow designers and developers to work more efficiently and consistently.

There is no rule about which components should exist in a design system. That will always depend on the needs of the products. However, there are some components that are common to find:

- `Button`
- `Card`
- `Modal`
- `Text Field`
- `Select`

Building components is more than just putting shapes and text together in Figma. You need to think about how they adapt to different devices, interaction states, different sizes, accessibility... It is a process that demands a lot of attention to detail.

A simple component, like a Button, can be loaded with a series of decisions, such as writing conventions, states that vary between hover, pressed, focus and disabled, variants for different hierarchies, the use of icons to aid understanding, and accessible attributes to make it easier for people who rely on assistive technologies.

## Part 4: Moving to code

Figma is a good tool for visualizing interfaces in a more practical way compared to an IDE. Dylan Field himself, Figma's CEO, said so on his X profile when they launched the "Code to Canvas" feature. I agree with the statement, but truth be told: the real value is in the code.

The variables we create in Figma are an allusion to tokens, as I said earlier. Real design tokens are JSON structures, like this one:

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

But as long as design and development remain separate professions, Figma will still be a tool that is part of the workflow, and so we need ways to make it easier to hand off the visuals to code.

For that, I created a plugin that exports all styles and variables in token format following the W3C standard from the [Design Tokens Community Group](https://www.designtokens.org/) (DTCG).

This plugin can detect whether your variables have different modes, so it can generate separate files to prepare your tokens for conversion from JSON to CSS or another language, enabling design systems with multiple themes — like the conventional light and dark modes — and even multi-brand, serving two or more brands.

You will find the plugin in my [design-system-ia](https://github.com/mateusvillain/design-system-ia) repository, which already has the environment ready to receive the tokens and do the translation. Inside it, there is also a folder called "example", in case you want to check a complete example of both the raw part and the generated, ready-to-use part.

Import the plugin in Figma from the `manifest.json` file and it will be ready to use — remembering that importing plugins requires Figma Desktop.

### Organization

The repository has the following structure:

```
design-system-ia/
├── .agents
│   ├── rules
│   └── workflows
│
├── dist                    # Tokens generated in CSS
├── example                 # Repository with an example application
├── tokens/
│   ├── primitive           # Primitive tokens
│   └── semantic            # Semantic tokens
│
├── tokens-exporter         # Plugin to export Figma variables as tokens
├── terrazzo.config.ts      # Terrazzo configuration file
└── tokens.resolver.json    # Design tokens resolver
```

To keep the project well organized and easy to navigate, your tokens should live inside the "tokens" folder, placed in one of the existing subfolders (primitive and semantic) or in new folders you want to create. From the plugin, you can copy the JSON code or simply export it to your machine.

This is the only step regarding the token files that you will need to do when moving from Figma to code. The next steps are more about the translation and the format in which they will be generated.

The `terrazzo.config.ts` file belongs to the Terrazzo library, installed in this repository. It is a token translator that follows the W3C standard, working with the first stable version of the DTCG spec.

The `tokens.resolver.json` file is also a recent addition, created by the DTCG, to organize the token files that will be generated and to identify which files contain the same tokens but with different values.

## Part 5: Rules and Workflows with AI agents

Scaling a design system with AI means you will be constantly interacting with agents to execute a series of tasks, like creating a token, maintaining a component, validating an interface and even documenting. We need to use AI as our ally, but in a smart way, so it can run a given checklist, telling you what it does, how it did it, and giving you the option to review what was done.

IDEs like Google Antigravity and Cursor have native features for applying rules and workflows to the agent, so that whenever you run a prompt, it knows what it should and should not do.

### Rules

These are instructions that define how code should be generated or structured within the IDE. They work as an "automatic guide":

- code standards (e.g. variable naming, component structure)
- technology usage (e.g. always use CSS Modules, or design system tokens)
- best practices (e.g. avoid inline styles)

Rules are implicit whenever you interact with the agent through the chat. They can be set to run on every prompt, covering all scenarios, or they can be defined to apply only when a certain decision or workflow happens — always established by you.

### Workflows

These are automated task flows within the IDE. They chain several actions in sequence, for example:

- create component → generate tests → apply tokens → document
- or: change design → update code → run validations

While interacting with the agent via chat, you can indicate which workflow you want to work with at that moment. It is like an "encapsulated prompt". You just reference the workflow, and maybe give some minimal instruction so it isn't generic.

If you are working with a workflow that evaluates a component in Figma and then develops it, you can just reference the process, the component name, and the link to the component in Figma so it knows exactly what to analyze:

`/create-component Button {figma-link}`

## Part 6: Design Tokens Resolver

Alongside the first stable version of design tokens, the Design Tokens Community Group released a configuration file called "resolver". In short, it identifies which design token files are in the repository and which of them are conditionals (same naming but different values), preparing everything for a healthy generation.

Fortunately, I have already published about this here on my site; you can read it at [Design Tokens Resolver: the native module for generating tokens and conditionals](/blog/design-tokens-resolver-module/).

In the repository, you will find this file with some configuration already done, to make your process easier:

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

What we have in this file is the identification of one set, the `semantic.json` file, while all the other referenced files are modifiers: one for size, handling responsive values, and another for brand, creating light and dark color themes for two fictional brands.

## Part 7: Translating tokens with Terrazzo

There are a few tools that help translate tokens. The most famous and well-known is Style Dictionary, which, by the way, is the most complete tool we have. It lets you create tokens in JSON and export them to several formats, such as CSS, SCSS, LESS, JavaScript, Flutter, Swift, among other languages. Style Dictionary opens the door for your tokens to live both on web devices and in smartphone apps.

However, Style Dictionary does not yet fully support the first stable version of DTCG tokens. In general, this is not a problem, considering that a good portion of design systems use this tool and are doing just fine. But we are moving toward this standard, and Style Dictionary itself has been working to support this model.

To solve this, a new similar tool emerged, called Terrazzo. It is a lighter and simpler tool than Style Dictionary, but it fully supports the first stable version of DTCG tokens. It is also open source and has an active community.

Installing Terrazzo is extremely simple, and all the configuration you need can be found in their [documentation](https://terrazzo.app/docs/).

In our repository, you will already find the configuration file, called `terrazzo.config.ts`. Inside it, you will have the following:

```typescript
import { defineConfig } from '@terrazzo/cli'
import css from '@terrazzo/plugin-css'

export default defineConfig({
  tokens: ['./tokens.resolver.json'], // File Terrazzo should look at to generate the tokens
  outDir: './dist/', // Folder where the file will be generated
  plugins: [
    css({
      filename: 'tokens.css', // Name of the generated CSS token file
      permutations: [
        {
          // Generates all tokens in their "default" versions, defined in resolver.json
          input: {},
          prepare: (css) => `:root {\n  ${css}\n}`,
        },
        {
          input: { brandTheme: 'brand-a-light' }, // Name of the "context" in resolver.json
          include: ['color.**'], // Filters only tokens whose name starts with this
          prepare: (css) =>
            `[data-brand="brand-a"][data-theme="light"] {\n  color-scheme: light;\n  ${css}\n}`,
        },
        {
          input: { brandTheme: 'brand-a-light' },
          include: ['color.**'],
          prepare: (css) =>
            `@media (prefers-color-scheme: light) {\n  [data-brand="brand-a"] {\n    color-scheme: light;\n    ${css}  \n  }\n}`,
          // @media (prefers-color-scheme: light/dark) is used when we want to let the user decide which theme they want to see
        },
        {
          input: { brandTheme: 'brand-a-dark' },
          include: ['color.**'],
          prepare: (css) =>
            `[data-brand="brand-a"][data-theme="dark"] {\n  color-scheme: dark;\n  ${css}\n}`,
          // data-theme is used to identify the theme set in the operating system and use it as the site default
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
          // @media (width >= X) makes the system apply the values inside it only when the width is greater than or equal to the defined value
        },
        {
          input: { size: 'mobile' },
          include: ['spacing.**'],
          prepare: (css) =>
            `@media (width < 600px) {\n  :root {\n    ${css}\n  }\n}`,
          // @media (width < X) makes the system apply the values inside it only when the width is less than the defined value
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

I intentionally left some comments throughout the file to make it easier to understand what each part does, but in more detail:

The first two lines import the functions needed to configure Terrazzo — the main function and a plugin for generating tokens in CSS:

```typescript
import { defineConfig } from '@terrazzo/cli'
import css from '@terrazzo/plugin-css'
```

The `defineConfig` function is Terrazzo's main function, and it is what receives the Terrazzo configuration. `css` is a plugin that receives the CSS plugin configuration.

The third line is the one that defines the file Terrazzo should look at to generate the tokens:

```typescript
export default defineConfig({
  ...
})
```

Inside it, we handle all the settings we want when running Terrazzo, and what it should do when generating the file.

```typescript
tokens: ['./tokens.resolver.json'],
outDir: './dist/',
```

`tokens` is the file Terrazzo should look at to generate the tokens. Inside the brackets, you can add another file by separating it with a comma. Since we are working with a resolver file that centralizes all of this, we only need to include that one. `outDir` is the folder where the file will be generated.

To generate our tokens in other languages, we apply the ones Terrazzo accepts inside `plugins`. In the example, we are generating a CSS file, but it is also possible to generate SCSS.

```typescript
plugins: [
  css({
    ...
  })
]
```

To name the generated file, we use `filename`.

```typescript
filename: 'tokens.css'
```

`permutations` is an array of objects that defines all the permutations Terrazzo should generate. Inside it, each object has an `input`, to identify which set or modifier to look at when Terrazzo analyzes the resolver, and a `prepare` to prepare the final file following (or not) some template. You can also add an `include` to filter which tokens should be used in that permutation. In that case, when running Terrazzo, it will only look at the tokens that start with the term you included inside the brackets.

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

To run Terrazzo, just run `npm run build` or `npx tz build` in the terminal, and it will generate the `tokens.css` file in the `dist/` folder.

## Keep automating

You will use AI to automate processes in design and development by creating and maintaining things, but note that AI can go beyond that. Take advantage of the intelligence combined with rules and workflows, plus the product's whole knowledge base, to run analyses and validations of performance, consistency (both visual and code), accessibility and structure.

Use it to document everything you have designed. Repositories like the famous Storybook are free to add to your project and can document every property and use case of your design system.

And of course, go beyond this post. There is no single way, and no right way. This is just one case among many that have emerged and will keep emerging. Take advantage of other resources and integrations to keep improving this process.
