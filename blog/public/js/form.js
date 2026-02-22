const form = document.getElementById("newsletter-form");
const success = document.getElementById("newsletter-success");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const button = form.querySelector("button");
  button.disabled = true;
  button.textContent = "Enviando";

  const email = form.email.value;

  try {
    await fetch("https://buttondown.com/api/emails/embed-subscribe/mateusvillain", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        email,
        embed: "1",
      }),
    });

    form.style.display = "none";
    success.hidden = false;

  } catch {
    button.disabled = false;
    button.textContent = "Assinar";
    alert("Erro ao enviar.");
  }
});
