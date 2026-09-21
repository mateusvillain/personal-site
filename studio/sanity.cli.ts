import { defineCliConfig } from 'sanity/cli'

// projectId/dataset não são segredo (vão pro bundle do Studio de qualquer
// forma), então ficam hardcoded como o `sanity init` faz — evita depender
// do carregamento de .env, que só funciona dentro de studio/.
export default defineCliConfig({
  api: {
    projectId: 'qdrvdscy',
    dataset: 'production',
  },

  vite: (config) => ({
    ...config,
    server: {
      ...config.server,
      fs: {
        ...config.server?.fs,
        // O callback de login chega como GET /?url=https://api.sanity.io/...
        // e o fs.allow estrito do Vite barra isso com 403 antes do SPA fallback.
        strict: false,
      },
    },
    plugins: [
      ...(config.plugins || []),
      {
        // O provider "Vercel" devolve o session id como query
        // (?url=https://api.sanity.io/v1/auth/fetch?sid=XXX), mas o Studio
        // só consome `#sid=XXX` do hash (sanity/lib/WorkspaceLoader,
        // consumeSessionId). Reescreve antes do bundle carregar.
        name: 'vercel-login-callback-shim',
        transformIndexHtml(html: string) {
          return html.replace(
            '<head>',
            `<head><script>(function(){try{var u=new URL(location.href);var t=u.searchParams.get('url');if(!t)return;var s=new URL(t).searchParams.get('sid');if(!s)return;u.searchParams.delete('url');u.hash='sid='+s;history.replaceState(null,'',u.toString());}catch(e){}})();</script>`,
          )
        },
      },
    ],
  }),
})
