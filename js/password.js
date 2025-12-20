document.querySelectorAll(".project-lock").forEach(lock => {
  const projectId = lock.dataset.project;
  const input = lock.querySelector(".password-input");
  const button = lock.querySelector(".unlock-btn");
  const error = lock.querySelector(".error-message");
  const preview = document.querySelector(".project-preview");
  const content = lock.nextElementSibling;

  const storageKey = `project-unlocked-${projectId}`;

  // Se já estiver liberado
  // if (localStorage.getItem(storageKey) === "true") {
  //   preview?.remove();
  //   lock.remove();
  //   content.hidden = false;
  //   return;
  // }

  button.addEventListener("click", async () => {
    error.hidden = true;

    const response = await fetch("../api/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: projectId,
        password: input.value
      })
    });

    if (response.ok) {
      // localStorage.setItem(storageKey, "true");
      preview?.remove();
      lock.remove();
      content.hidden = false;
    } else {
      error.hidden = false;
    }
  });
});
