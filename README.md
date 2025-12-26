# Mateus Villain

Este repositório contém o código do meu site pessoal, um portfólio estático que mostra quem sou, meus projetos e conteúdos, com foco em design, desenvolvimento e experiências. 
GitHub

Está publicado em: https://mateusvillain.com

## Sobre

Meu site pessoal é feito com HTML, CSS/SCSS e JavaScript, organizado de forma modular:

* HTML das páginas principais
* CSS / SCSS para estilos e layout
* JavaScript para interatividade
* Imagens, fontes e internacionalização
* Arquivos de idioma (lang) para suportar conteúdo multilíngue

É um projeto estático que pode ser hospedado em qualquer servidor ou GitHub Pages. 
GitHub Docs

## Tecnologias

O projeto usa:

* HTML — estrutura das páginas
* CSS e SCSS — estilos e organização do design
* JavaScript — interações
* Estrutura simples de arquivos para modularização

## Estrutura
```
personal-site/
├── api/
│   ├── callback.js
│   ├── mood.js                 # Estrutura de mood conectada ao Notion
│   ├── project.js              # Cria a estrutura do projeto e insere a senha
│   ├── projects.js             # Realiza a conexão com a database do Notion
│   ├── spotify.js              # Busca a música ouvida no momento no Spotify
│   ├── time.js                 # BUsca o horário atual do local
│   └── weather.js              # Busca o clima atual do local
│
├── css/
│   ├── components.css          # Estilos dos componentes ilustrados na index
│   └── style.css               # Estilos do site gerados pelo index.scss
│
├── font/                       # Fontes utilizadas no site
├── img/                        # Imagens e assets visuais
│
├── js/
│   ├── analytics.js            # Eventos enviados para o Google Analytics
│   ├── book-cover.js           # Efeito de rotação
│   ├── horizontal-scroll.js    # Muda o sentido da página para horiontal
│   ├── lang.js                 # Realiza a mudança de idioma do site
│   ├── mood.js                 # Adiciona o sistema de mood no site
│   ├── password.js             # Adiciona senha para relevar conteúdo
│   ├── spotify.js              # Exibe a música e artista tocando no momento
│   ├── tabs.js                 # Componente de tabs
│   ├── time.js                 # Exibe e atualiza o horário da cidade a cada 1s
│   ├── type-line.js            # Efeito de digitação
│   └── weather.js              # Exibe o clima local da cidade
│
├── lang/                       # Arquivos de idioma do site
│   ├── en.js
│   └── pt.js
│
├── sass/
│   ├── index.scss              # Conexão dos arquivos .scss
│   ├── projects.scss           # Estilos das pgáinas de projeto
│   └── style.scss              # Estilos gerais do site
```

## Como rodar localmente

```
git clone https://github.com/mateusvillain/personal-site.git
cd personal-site
npm install
```

## Contato

* [LinkedIn](https://linkedin.com/in/mateusvillain)
* contato@mateusvillain.com