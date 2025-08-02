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

container.addEventListener('wheel', (e) => {
    if (window.innerWidth > 768) {
    e.preventDefault();
    scrollVelocity += e.deltaY * 1.5;
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