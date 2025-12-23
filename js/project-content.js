const response = await fetch("/api/project-content", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    project: "project-locaweb-ds",
    password: input.value
  })
});
