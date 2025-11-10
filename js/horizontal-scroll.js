const floatEls = document.querySelectorAll('.scroll-float');
const contain = document.querySelector('.scroll-container');

// Efeito flutuante: apenas X no desktop
let horizontalProgress = 0;
function updateFloatingEffect() {
  const isMobile = window.innerWidth <= 768;
  const amount = isMobile ? (contain ? contain.scrollTop : 0) : horizontalProgress;
  floatEls.forEach((el, i) => {
    const factor = 0.3 + (i % 3) * 0.1;
    const offsetX = Math.sin(amount * 0.005 + i) * 100 * factor;
    const offsetY = isMobile ? Math.cos(amount * 0.005 + i) * 10 * factor : 0;
    const rotate = isMobile ? Math.sin(amount * 0.003 + i) * 20 * factor : 0;
    el.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotate}deg)`;
  });
}
if (contain) contain.addEventListener('scroll', updateFloatingEffect);
updateFloatingEffect();

// Nova abordagem (desktop): viewport fixa + trilho transladado (sem scroll vertical)
let track = null;
let current = 0;   // posição atual
let target = 0;    // posição desejada
let maxScroll = 0; // limite
let rafId = 0;

function ensureTrack() {
  if (!contain) return null;
  // Se foi criado wrapper sticky antes, desfaz
  const parent = contain.parentElement;
  if (parent && parent.classList.contains('hscroll-wrapper')) {
    parent.parentNode.insertBefore(contain, parent);
    parent.remove();
  }
  let t = contain.querySelector('.scroll-track');
  if (!t) {
    t = document.createElement('div');
    t.className = 'scroll-track';
    while (contain.firstChild) t.appendChild(contain.firstChild);
    contain.appendChild(t);
  }
  return t;
}

function recalc() {
  if (!contain) return;
  track = ensureTrack();
  if (!track) return;
  const vw = contain.clientWidth;
  const total = track.scrollWidth;
  maxScroll = Math.max(0, total - vw);
  target = Math.min(Math.max(target, 0), maxScroll);
  current = Math.min(Math.max(current, 0), maxScroll);
  applyTransform();
}

function applyTransform() {
  if (!track) return;
  track.style.transform = `translate3d(${-current}px, 0, 0)`;
  horizontalProgress = current;
  updateFloatingEffect();
}

function tick() {
  const diff = target - current;
  if (Math.abs(diff) < 0.1) {
    current = target;
    applyTransform();
    rafId = 0;
    return;
  }
  current += diff * 0.12; // easing
  applyTransform();
  rafId = requestAnimationFrame(tick);
}

function startTick() {
  if (!rafId) rafId = requestAnimationFrame(tick);
}

function onWheel(e) {
  if (window.innerWidth <= 768) return; // somente desktop
  if (!track) return;
  const modeScale = e.deltaMode === 1 ? 16 : (e.deltaMode === 2 ? window.innerHeight : 1);
  const dx = (e.deltaX || 0) * modeScale;
  const dy = (e.deltaY || 0) * modeScale;
  const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
  if (delta !== 0) {
    e.preventDefault();
    target = Math.min(Math.max(target + delta, 0), maxScroll);
    startTick();
  }
}

function onKey(e) {
  if (window.innerWidth <= 768) return;
  if (!track) return;
  let delta = 0;
  const step = 80;
  const page = contain.clientWidth * 0.9;
  if (e.key === 'ArrowRight') delta = step;
  else if (e.key === 'ArrowLeft') delta = -step;
  else if (e.key === 'PageDown') delta = page;
  else if (e.key === 'PageUp') delta = -page;
  else if (e.key === 'Home') delta = -target;
  else if (e.key === 'End') delta = maxScroll - target;
  if (delta !== 0) {
    e.preventDefault();
    target = Math.min(Math.max(target + delta, 0), maxScroll);
    startTick();
  }
}

window.addEventListener('wheel', onWheel, { passive: false, capture: true });
window.addEventListener('keydown', onKey);
window.addEventListener('resize', recalc);

// Inicializa
recalc();
