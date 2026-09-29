// Seletor de tema do topo (src/components/SiteHeader.astro): claro, escuro ou
// sistema. No modo sistema o `data-theme` recebe a preferencia do sistema
// resolvida, porque parte do CSS so reage a `:root[data-theme='dark']`.
const root = document.documentElement;
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
const radios = document.querySelectorAll('input[name="theme"]');

function currentMode() {
  const saved = localStorage.getItem("theme");
  return saved === "light" || saved === "dark" ? saved : "system";
}

function applyTheme(mode) {
  const theme = mode === "system" ? (systemDark.matches ? "dark" : "light") : mode;
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-theme-mode", mode);
  radios.forEach((radio) => {
    radio.checked = radio.value === mode;
  });
}

radios.forEach((radio) => {
  radio.addEventListener("change", () => {
    if (!radio.checked) return;
    if (radio.value === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", radio.value);
    }
    applyTheme(radio.value);
  });
});

systemDark.addEventListener("change", () => {
  if (currentMode() === "system") applyTheme("system");
});

applyTheme(currentMode());
