const floatEls = document.querySelectorAll('.scroll-float');
const contain = document.querySelector('.scroll-container');

function updateFloatingEffect() {
    const isMobile = window.innerWidth <= 768;
    const scrollAmount = isMobile ? contain.scrollTop : contain.scrollLeft;

    floatEls.forEach((el, i) => {
    const factor = 0.3 + (i % 3) * 0.1;
    const offsetX = Math.sin(scrollAmount * 0.005 + i) * 100 * factor;
    const offsetY = Math.cos(scrollAmount * 0.005 + i) * 10 * factor;
    const rotate = Math.sin(scrollAmount * 0.003 + i) * 20 * factor;

    el.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotate}deg)`;
    });
}

// Scroll horizontal
contain.addEventListener('scroll', updateFloatingEffect);
window.addEventListener('resize', updateFloatingEffect);
updateFloatingEffect();

const container = document.querySelector('.scroll-container');
let scrollVelocity = 0;

// Melhor suporte a trackpad/mouse: considera deltaX e deltaY + deltaMode
container.addEventListener('wheel', (e) => {
    if (window.innerWidth <= 768) return;

    const modeScale = e.deltaMode === 1 ? 16 : (e.deltaMode === 2 ? container.clientWidth : 1);
    const dx = (e.deltaX || 0) * modeScale;
    const dy = (e.deltaY || 0) * modeScale;

    // Só intercepta se vamos realmente mover horizontalmente
    if (Math.abs(dx) >= Math.abs(dy) && Math.abs(dx) > 0) {
        e.preventDefault();
        scrollVelocity += dx;
    } else if (dy !== 0) {
        // Converte rolagem vertical em horizontal
        e.preventDefault();
        scrollVelocity += dy * 1.5;
    }
}, { passive: false });

// Atualiza o scroll constantemente com desaceleração
function updateScroll() {
    if (Math.abs(scrollVelocity) > 0.1) {
        container.scrollLeft += scrollVelocity;
        scrollVelocity *= 0.9; // desacelera suavemente
    } else {
        scrollVelocity = 0;
    }
    requestAnimationFrame(updateScroll);
}

updateScroll();

// Navegação por teclado em desktop
window.addEventListener('keydown', (e) => {
    if (window.innerWidth <= 768) return;
    const key = e.key;
    let delta = 0;
    const step = 80;
    const page = container.clientWidth * 0.9;

    if (key === 'ArrowRight') delta = step;
    else if (key === 'ArrowLeft') delta = -step;
    else if (key === 'PageDown') delta = page;
    else if (key === 'PageUp') delta = -page;
    else if (key === 'Home') delta = -container.scrollLeft;
    else if (key === 'End') delta = (container.scrollWidth - container.clientWidth) - container.scrollLeft;

    if (delta !== 0) {
        e.preventDefault();
        container.scrollLeft += delta;
    }
});
