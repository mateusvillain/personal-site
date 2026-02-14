function sendEvent(name, params = {}) {
  gtag('event', name, params);
}

// All links
document.querySelectorAll('[data-link]').forEach(link => {
  link.addEventListener('click', () => {
    const label = link.dataset.link;

    sendEvent('link_click', {
      link_name: label
    });
  });
});

// Social links
document.querySelectorAll('[data-social]').forEach(link => {
  link.addEventListener('click', () => {
    const name = link.dataset.social;

    sendEvent('social_link_click', {
      platform: name
    });
  });
});
