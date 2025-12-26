let currentLang = localStorage.getItem("lang") || "en";

function loadLanguage(lang) {
fetch(`./lang/${lang}.json`)
  .then(res => res.json())
  .then(data => {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.innerText = data[key];
  });
  localStorage.setItem("lang", lang);
  document.documentElement.setAttribute('lang', lang === 'pt' ? 'pt-BR' : 'en');
  });
}

loadLanguage(currentLang);

document.getElementById("lang-switch").addEventListener("click", () => {
  currentLang = currentLang === "pt" ? "en" : "pt";
  loadLanguage(currentLang);
});