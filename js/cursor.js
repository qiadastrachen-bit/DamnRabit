const PixelCursor = (() => {
  const el = document.getElementById('pixelCursor');
  let mx = -100, my = -100;
  let tx = -100, ty = -100;
  let raf = null;

  if (!el || window.matchMedia('(pointer: coarse)').matches) return { init: () => {} };

  document.addEventListener('mousemove', e => {
    tx = e.clientX;
    ty = e.clientY;
  }, { passive: true });

  document.addEventListener('mousedown', () => el.classList.add('is-clicking'));
  document.addEventListener('mouseup', () => el.classList.remove('is-clicking'));

  const hoverables = 'button, a, .is-interactive, .hero-hitbox, .path-btn, .chapter-nav__dot';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverables)) el.classList.add('is-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverables)) el.classList.remove('is-hover');
  });

  function tick() {
    mx += (tx - mx) * 0.35;
    my += (ty - my) * 0.35;
    el.style.transform = `translate(${mx}px, ${my}px)`;
    raf = requestAnimationFrame(tick);
  }

  function init() {
    document.body.classList.add('has-custom-cursor');
    tick();
  }

  return { init, getPos: () => ({ x: mx, y: my }) };
})();

window.PixelCursor = PixelCursor;
