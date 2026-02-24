const form = document.getElementById("newsletter-form");
const success = document.getElementById("newsletter-success");
const errorBox = document.getElementById("newsletter-error");
const errorMessage = document.getElementById("newsletter-error-message");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const button = form.querySelector("button");
    const email = form.email.value.trim();

    if (!button || !email) {
      return;
    }

    button.disabled = true;
    button.textContent = "Enviando...";

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
        throw new Error(data.error || "Não foi possível enviar sua inscrição agora.");
      }

      form.style.display = "none";
      if (success) {
        success.hidden = false;
      }
    } catch (error) {
      button.disabled = false;
      button.textContent = "Assinar";

      if (errorBox && errorMessage) {
        errorMessage.textContent =
          error instanceof Error ? error.message : "Erro ao enviar inscrição.";
        errorBox.hidden = false;
      }
    }
  });
}
