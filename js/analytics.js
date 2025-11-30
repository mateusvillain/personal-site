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

// Tabs
document.querySelectorAll('[role="tab"]').forEach(tab => {
  tab.addEventListener('click', () => {
    const label = tab.dataset.tab;

    // Dispara o evento do GA4
    sendEvent('tools_tab_click', {
      tab_name: label
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

// Let's UI
document.querySelectorAll('[data-lui]').forEach(link => {
  link.addEventListener('click', () => {
    const name = link.dataset.social;

    sendEvent('lui_link_click', {
      platform: name
    });
  });
});
