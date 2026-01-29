document.addEventListener("DOMContentLoaded", () => {
  const lines = document.querySelectorAll(".type-line");
  const speed = 45; // ms por letra
  let alreadyTyped = false;

  function startTyping() {
    if (alreadyTyped) return;
    alreadyTyped = true;

    let delay = 0;

    lines.forEach((line) => {
    const text = line.textContent;
    line.textContent = "";

    const startTime = delay;

    setTimeout(() => {
      [...text].forEach((char, i) => {
      setTimeout(() => {
        line.textContent += char;
      }, i * speed);
      });
    }, startTime);

    delay += text.length * speed + 400;
    });
  }

  if (!("IntersectionObserver" in window)) {
      startTyping();
      return;
  }

  const target = lines[0];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
  if (entry.isIntersecting) {
    startTyping();
    observer.unobserve(entry.target);
  }
  });
}, {
  threshold: 0.4
});

  observer.observe(target);
});