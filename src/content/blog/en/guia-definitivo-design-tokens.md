---
title: 'The Ultimate Guide to Design Tokens: What they are and how to use them'
description: 'Design Tokens are variables that store the visual values of your design system, such as colors, typography and spacing. Learn how to use them and scale your design system efficiently.'
date: '2026-04-01'
cover: '/blog/covers/guia-definitivo-design-tokens-1.png'
slug: 'ultimate-guide-to-design-tokens'
tags:
  [
    'design tokens',
    'design system',
    'style dictionary',
    'primitive tokens',
    'semantic tokens',
    'component tokens',
  ]
---

If you have ever worked with a design system, you have probably run into that classic problem: keeping things consistent without turning everything into a mess that is hard to scale. Scenarios like duplicated colors, inconsistent spacing and decisions scattered between design and code start to take their toll over time.

That is exactly where design tokens come in. They are a way to organize design decisions as data — something that can be shared, versioned and used on any platform.

In this guide, the idea is to go beyond the basics and really understand how design tokens work in practice: from the concept to their application in a real design system, going through the different levels of abstraction and the challenges of scale.

## What is a design token?

Design tokens are structured units of data that represent design decisions in a platform-independent way.

When we talk about representing design decisions, we mean every attribute used in a digital product. Every decision, no matter how small, has a meaning, and those meanings are represented by design tokens.

For example, a loose blue color may mean nothing by itself, but once it is placed in an interface — say, on a primary button — it gains a purpose, representing the background color of the buttons with the highest level of hierarchy in the product.

As for being platform-independent, it is important to remember that a design token is not a Figma variable or style, much less a CSS custom property. Design tokens are structured in JSON, so they have an agnostic format that can be interpreted by any system or language, allowing them to be transformed into usable languages such as CSS, Sass, JavaScript, Flutter, Swift, and many others. ^[a token is not a Figma variable!]

The format of a design token follows this pattern:

```json
{
  "color": {
    "background": {
      "type": "color",
      "page": {
        "value": "#ffffff",
        "description": "Page background color"
      }
    }
  }
}
```

In this example, we have a design token called `color.background.page` that represents the color white. It has a literal value of `#ffffff` and a description that explains its meaning.

As we narrow down the naming through nested keys, we extend the token's name until its final layer, where we define the value and, optionally, a description. Design tokens also require you to identify their type, represented by `$type`, which can be `color`, `dimension`, `number`, `typography`, among others.

In other words, a design token is a way of ==turning design decisions into reusable data==.

## Levels of design tokens

When working with design tokens, we usually follow a three-level structure, where each level represents a different level of abstraction:

- Primitive Tokens
- Semantic Tokens
- Component Tokens

Let's look at the concept and structure of each one:

### Primitive Tokens

Primitive Tokens, also known as Basic Tokens, are the fundamental building blocks of your design system. They represent pure visual properties, such as colors, borders and spacing, without context or meaning. Think of them as the basic ingredients you use to make your recipes.

They exist to ensure consistency and avoid loose values in the project. Instead of using `#3B82F6` or `16px` directly in the code, you centralize that in reusable tokens.

These tokens are commonly named in an objective way, describing only the value they hold and following a scale pattern, such as `sm`, `md`, `lg`, or `100`, `200`, `300`.

```json
{
  "color": {
    "neutral": {
      "type": "color",
      "100": {
        "value": "#f8f9fa"
      },
      "200": {
        "value": "#e9ecef"
      },
      "300": {
        "value": "#dee2e6"
      }
    }
  }
}
```

At this level, it does not matter where these values will be used. They are just the base that supports everything else in the system.

### Semantic Tokens

Semantic Tokens are the second level, and they add meaning to primitive tokens. Instead of representing a direct value, they represent an intention within the interface, such as "background color", "primary text" or "spacing between elements".

They usually reference primitive tokens, doing what we call an **alias**, which is when a design token ==has no value of its own and simply points to another token==.

Here, the focus is no longer the value itself, but the role it plays. This makes the design system more flexible and easier to maintain.

```json
{
  "color": {
    "background": {
      "type": "color",
      "primary": {
        "value": "{color.neutral.100}"
      },
      "secondary": {
        "value": "{color.neutral.200}"
      }
    },
    "text": {
      "primary": {
        "value": "{color.neutral.600}"
      },
      "secondary": {
        "value": "{color.neutral.500}"
      }
    }
  }
}
```

### Component Tokens

Component Tokens, as the name suggests, are design tokens specific to design system components, such as `Button`, `Card`, `Text Field`, and so on. They connect semantic tokens directly to the implementation of the components.

At this level, you define how each part of the component should behave visually: background color, padding, border, hover state, and so on.

```json
{
  "button": {
    "background": {
      "type": "color",
      "primary": {
        "value": "{color.background.primary}"
      },
      "secondary": {
        "value": "{color.background.secondary}"
      }
    }
  }
}
```

Unlike the previous two, Component Tokens are harder to scale and maintain. As we create a token for every detail of every component, the number of tokens quickly grows at a large scale, which can bring more clutter to the product than real help.

Also, Component Tokens are not reusable the way Semantic Tokens are. Once you create a token like `button-background-primary`, it will only serve the `Button`, unlike a semantic token called `color-background-primary`, which can be used in many different cases of primary background.

## Practical use

The structure of a token is nothing more than JSON, so that it is completely platform-agnostic. Just as you use tokens for the web, you can also use them for mobile apps. Each system will use a different language, and to avoid recreating tokens, we use JSON as the base and ==translate those tokens into the language we need==.

In the case of the web, we translate design tokens from JSON into CSS, the styling language browsers understand. To do that, we use tools that read the tokens and generate the necessary CSS files.

Taking the primitive design tokens example again:

```json
{
  "color": {
    "neutral": {
      "type": "color",
      "100": {
        "value": "#f8f9fa"
      },
      "200": {
        "value": "#e9ecef"
      },
      "300": {
        "value": "#dee2e6"
      }
    }
  }
}
```

When we run this structure through a design-tokens-to-CSS translator, we get the following output:

```css
:root {
  --color-neutral-100: #f8f9fa;
  --color-neutral-200: #e9ecef;
  --color-neutral-300: #dee2e6;
}
```

With that, we can use the colors in the project without any manual work.

There are a few tools that do this translation, and fortunately most of them are open source. The most famous among them, and one of the most complete, is [Style Dictionary](https://styledictionary.com/), which lets you transform your tokens for every kind of platform (Web, iOS and Android).

---

This is just the first article of the Ultimate Guide to Design Tokens. Over the next few days, I will publish a series of articles going deeper into each of the topics covered here, going further into both concept and application.

If you don't want to miss the next posts, here is my recommendation: subscribe to the newsletter and follow me on [LinkedIn](https://www.linkedin.com/in/mateusvillain/).
