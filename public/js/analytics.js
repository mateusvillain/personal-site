// Eventos personalizados do GA4. `gtag()` vem do ConsentScript (no <head>);
// sem consentimento, os eventos ficam no dataLayer e o GTM nem carrega.
//
// Links externos em geral ja chegam pela medicao otimizada (`click` com
// `link_url`); redes sociais tem evento proprio para relatorio dedicado.
function sendEvent(name, params = {}) {
  gtag('event', name, params);
}

// Links e botoes marcados com [data-link]
document.querySelectorAll('[data-link]').forEach(link => {
  link.addEventListener('click', () => {
    const params = { link_name: link.dataset.link };
    // Troca de idioma: o destino vem do `hreflang` do link (pt-BR, en).
    if (link.hreflang) params.target_language = link.hreflang;
    sendEvent('link_click', params);
  });
});

// Redes sociais marcadas com [data-social]
document.querySelectorAll('[data-social]').forEach(link => {
  link.addEventListener('click', () => {
    sendEvent('social_link_click', {
      platform: link.dataset.social
    });
  });
});
