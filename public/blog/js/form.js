const form = document.getElementById("newsletter-form");
const success = document.getElementById("newsletter-success");
const errorBox = document.getElementById("newsletter-error");
const errorMessage = document.getElementById("newsletter-error-message");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const button = form.querySelector("lui-button");
    const email = String(new FormData(form).get("email") ?? "").trim();

    if (!button || !email) {
      return;
    }

    // Textos no idioma da pagina, definidos nos atributos data-* do form
    const idleText = button.textContent;
    const submittingText = form.dataset.submittingText || "Enviando...";
    const genericError =
      form.dataset.errorText || "Não foi possível enviar sua inscrição agora.";

    button.disabled = true;
    button.textContent = submittingText;

    if (errorBox) {
      errorBox.hidden = true;
    }

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || genericError);
      }

      form.style.display = "none";
      if (success) {
        success.hidden = false;
      }
    } catch (error) {
      button.disabled = false;
      button.textContent = idleText;

      if (errorBox && errorMessage) {
        errorMessage.textContent =
          error instanceof Error ? error.message : genericError;
        errorBox.hidden = false;
      }
    }
  });
}
