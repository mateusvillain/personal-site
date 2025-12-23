
document.querySelectorAll(".project-lock").forEach(lock => {
  const projectId = lock.dataset.project;
  const input = lock.querySelector(".password-input");
  const button = lock.querySelector(".unlock-btn");
  const error = lock.querySelector(".error-message");
  const content = document.querySelector(".project-content");
  const preview = document.querySelector(".project-preview");

  const storageKey = `project-unlocked-${projectId}`;

  button.addEventListener("click", async () => {
    error.hidden = true;

    const response = await fetch("/api/project-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: projectId,
        password: input.value
      })
    });

    if (!response.ok) {
      error.hidden = false;
      return;
    }

    const data = await response.json();

    content.innerHTML = renderNotion(data.blocks);

    localStorage.setItem(storageKey, "true");
    preview?.remove();
    lock.remove();
  });
});
