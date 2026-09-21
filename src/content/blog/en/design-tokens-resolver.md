---
title: 'Design Tokens Resolver: the native module for generating tokens and conditionals'
description: 'Learn how to use the Design Tokens Resolver to make your tokens scalable and create multiple conditionals for themes and breakpoints.'
date: '2026-02-17'
cover: '/blog/covers/design-tokens-resolver.png'
slug: 'design-tokens-resolver-module'
tags:
  [
    'design system',
    'design tokens',
    'design tokens community group',
    'dtcg',
    'design tokens resolver module',
    'resolver',
  ]
---

A challenge every company faces when structuring its design tokens, especially on the engineering side, is how the tokens will be read and converted into a style format.

Every case is different. Many platforms only need the simple stuff, like light and dark mode; others need to adapt to different brands (the so-called multi-brand); and some go even further, with multiple visual themes for accessibility and even different breakpoints.

None of these examples is a limitation when we talk about design tokens; the bottleneck is mostly on the technical side. Many companies choose Style Dictionary as the package for reading and converting tokens to multiple systems, which requires manual configuration for the token build to happen correctly. In recent years, we have seen strong adoption of Tokens Studio (formerly Figma Tokens) alongside Style Dictionary, outsourcing the multi-theme configuration work — but at a cost not every company can afford.

To solve these problems and avoid keeping that dependency on a tool, the [Design Tokens Community Group (DTCG)](https://www.designtokens.org) created the [resolver](https://www.designtokens.org/tr/2025.10/resolver/), officially released on October 28, 2025 (a day also known as my birthday), a native module for computing how design tokens are connected and generated. The resolver deals with how to decide, deterministically, which final value should emerge when there are aliases, modes, sets and contextual overrides.

## Structuring a resolver

Let's start with a simple example, imagining the following file structure:

```
design-system/
├── dist/
│   └── tokens.css
├── tokens/
│   ├── primitive/
│   │   ├── theme/
│   │   │   ├── color.dark.json
│   │   │   └── color.light.json
│   │   ├── spacing/
│   │   │   ├── spacing.desktop.json
│   │   │   └── spacing.mobile.json
│   │   └── typography/
│   │       ├── typography.base.json
│   │       ├── typography.desktop.json
│   │       └── typography.mobile.json
│   └── semantic/
│       ├── color/
│       │   ├── color.background.json
│       │   └── color.text.json
│       ├── spacing/
│       │   ├── spacing.breakpoint.json
│       │   └── spacing.layout.json
│       └── typography/
│           └── typography.size.json
├── tokens.resolver.json
└── package.json
```

In this structure, I am separating the design tokens into folders by the primitive and semantic groups, and into files, keeping more precise control over editing and versioning. Notice that in the primitive folder I am also splitting the design tokens into different files per mode: one for light and dark color themes, and another for breakpoints, where the naming stays the same but the values differ.

```json
//color.light.json
{
  "color": {
    "$type": "color",
    "brand": {
      "100": { "value": "#eff4ff" },
      "200": { "value": "#adc9ff" },
      "300": { "value": "#6095ff" },
      "400": { "value": "#1e69ff" }
    }
  }
}
```

```json
//spacing.desktop.json
{
  "spacing": {
    "$type": "dimension",
    "sm": {
      "value": "4",
      "unit": "px"
    },
    "md": {
      "value": "8",
      "unit": "px"
    },
    "lg": {
      "value": "16",
      "unit": "px"
    }
  }
}
```

These design tokens are later used to create new design tokens, but used as aliases. In an extremely simple form, we can have the following:

```json
//color.background.json
{
  "color": {
    "$type": "color",
    "background": {
      "surface": {
        "$value": "{color.brand.200}"
      },
      "container": {
        "$value": "{color.brand.400}"
      }
    }
  }
}
```

With that, the final value of `color.background.surface` depends on which mode is active in the product, which in our case is controlled via `@media` and data attributes (`data-*`). To avoid a series of manual configurations, which is the current scenario at many companies, the Resolver helps map all the files and separate the values without overrides.

### Mandatory criteria

Before I explain how each part of the resolver works, here are a few important things you need to know to configure the file correctly:

- The resolver must use JSON syntax
- The file name must have the `.resolver.json` extension
- The correct version for it to work (the current one is 2025.10)
- The `resolutionOrder` defined in the document

### Versioning and identification

For the resolver to work correctly, the file must declare the version. So far, version `2025.10` is the only one released and in operation.

You can also declare `name` and `description` to identify the resolver, although these values are optional.

```json
{
  "name": "Design System",
  "description": "Design Tokens Resolver",
  "version": "2025.10"
}
```

### Sets

Sets are collections of design tokens organized by the person responsible for the design system. As I mentioned at the start of the article, there are countless ways to organize tokens. Many designers and engineers define all tokens in a single file, or split them by category (primitive, semantic and component), or even use a single file for each token type, as in the example I brought.

Defining sets in the resolver corresponds to which design token files you want to map when running the token-to-style build.

```json
{
  "name": "Design System",
  "version": "2025.10",
  "sets": {
    "colors": {
      "description": "Semantic colors",
      "sources": [
        { "$ref": "semantic/color.background.json" },
        { "$ref": "semantic/color.text.json" }
      ]
    },
    "spacing": {
      "description": "Semantic spacing",
      "sources": [
        { "$ref": "spacing.layout.json" },
        { "$ref": "spacing.breakpoint.json" }
      ]
    }
  }
}
```

In the example, I created two sets: the first for colors, referencing two files, and the second for spacing, also referencing two files. The format requires each `sources` entry to be an array, even if there is only a single file being referenced. The order of the sets is not important, since it is defined in `resolutionOrder` (more on that soon), but the order of the `sources` is. If there are repeated values across files, only the last value in the order will be generated.

You can also define a `description` for each set you create, to give more context about its use.

### Modifiers

Modifiers are like sets — they organize collections of design tokens — but their purpose is to create conditionals with the values.

In our example, we have design token files for light and dark color modes, and for mobile and desktop spacing. To avoid overwritten data, besides the token names matching, it is important that the modifiers indicate which files will swap values.

```json
{
  "name": "Design System",
  "version": "2025.10",
  "sets": {
    // ...
  },
  "modifiers": {
    "theme": {
      "description": "Light and dark mode",
      "contexts": {
        "dark": [{ "$ref": "primitive/colors/color.dark.json" }],
        "light": [{ "$ref": "primitive/colors/color.light.json" }]
      },
      "default": "light"
    },
    "size": {
      "description": "Mobile and desktop sizes",
      "contexts": {
        "mobile": [
          { "$ref": "primitive/spacing/spacing.mobile.json" },
          { "$ref": "primitive/typography/typography.mobile.json" }
        ],
        "desktop": [
          { "$ref": "primitive/spacing/spacing.desktop.json" },
          { "$ref": "primitive/typography/typography.desktop.json" }
        ]
      },
      "default": "desktop"
    }
  }
}
```

In the example, I created two modifiers for the design system: the first for light and dark color modes, and the second for spacing on mobile and desktop devices.

Just like sets use `sources`, modifiers must have `contexts` with at least two contexts, in array format. For each `contexts` you can define a `default` value indicating the product's default base.

### resolutionOrder

The last definition in the resolver is the resolution order, which defines the order in which the token collections (sets and modifiers) will be generated during the build. Even though file order matters within sets and modifiers, this is the resolver's priority ordering.

```json
{
  "name": "Design System",
  "version": "2025.10",
  "sets": {
    // ...
  },
  "modifiers": {
    // ...
  },
  "resolutionOrder": [
    { "$ref": "#/modifiers/theme" },
    { "$ref": "#/modifiers/size" },
    { "$ref": "#/sets/colors" },
    { "$ref": "#/sets/spacing" }
  ]
}
```

Since the order of the files was already defined earlier, in the resolution order we only need to apply the order of the sets and modifiers. In the example, I am prioritizing the generation of color modes and desktop/mobile values — that is, primitive tokens — and then generating the semantic tokens.

## This is just the beginning

I structured and wrote this article with examples you can use in practice, but by no means do I dismiss reading the [official DTCG documentation](https://www.designtokens.org/tr/2025.10/resolver/#bundling). Don't be put off by the long page: the texts are short and the documentation is full of examples.

Since it is a recently created module, it is still in its first version, with few applications that support it. If you want to try it out, I recommend using [Terrazzo](https://terrazzo.app/docs/2.0/guides/resolvers/), a package similar to Style Dictionary but more in line with the new DTCG guidelines.
