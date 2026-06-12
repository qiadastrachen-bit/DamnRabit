/**
 * 每章背景主角 — 置于页面背后，随滚动漫步
 */
const ChapterHeroes = (() => {
  const CFG = [
    { x: 0.20, y: 0.62, scale: 2.4, flip: false, alpha: 0.88, anim: 'idle' },
    { x: 0.16, y: 0.58, scale: 2.6, flip: false, alpha: 0.92, anim: 'idle', glow: true },
    { x: 0.18, y: 0.56, scale: 2.5, flip: false, alpha: 0.90, anim: 'walk' },
    { x: 0.22, y: 0.54, scale: 2.5, flip: true,  alpha: 0.92, anim: 'idle' },
    { x: 0.17, y: 0.57, scale: 2.6, flip: false, alpha: 0.90, anim: 'walk' },
    { x: 0.20, y: 0.60, scale: 2.5, flip: false, alpha: 0.94, anim: 'idle', glow: true },
  ];

  const canvases = [];
  let frame = 0;

  function init() {
    document.querySelectorAll('.chapter').forEach((ch, i) => {
      if (ch.querySelector('.chapter__hero-bg')) return;
      const wrap = document.createElement('div');
      wrap.className = 'chapter__hero-bg';
      const canvas = document.createElement('canvas');
      canvas.className = 'chapter-hero-canvas';
      canvas.width = 120;
      canvas.height = 160;
      canvas.dataset.chapterIdx = String(i);
      wrap.appendChild(canvas);
      const insertAfter = ch.querySelector('.chapter__bg') || ch.firstChild;
      insertAfter.after(wrap);
      canvases[i] = { canvas, chapter: ch, cfg: CFG[i] || CFG[1] };
      drawStatic(i, 0.3);
    });
    window.addEventListener('resize', onResize);
    onResize();
  }

  function onResize() {
    canvases.forEach((item, i) => {
      if (!item) return;
      const { chapter, cfg } = item;
      const h = chapter.offsetHeight;
      item.canvas.style.height = `${Math.min(h * 0.55, 420)}px`;
      item.canvas.style.width = 'auto';
    });
  }

  function drawStatic(idx, local) {
    const item = canvases[idx];
    if (!item) return;
    const { canvas, cfg } = item;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const anim = cfg.anim === 'walk' && local > 0.1 ? 'walk' : cfg.anim;
    const animF = Math.floor(frame / 8);
    const sprite = SpriteRenderer.getFrameByAnim(anim, animF);

    const scale = 0.55;
    const sw = SpriteRenderer.SPRITE_W;
    const sh = SpriteRenderer.SPRITE_H;
    const drawX = (canvas.width - sw * scale) / 2;
    const drawY = canvas.height - sh * scale - 4;

    ctx.globalAlpha = cfg.alpha;
    SpriteRenderer.drawSpriteToContext(ctx, sprite, drawX, drawY, {
      scale,
      flipX: cfg.flip,
      glow: cfg.glow,
    });
    ctx.globalAlpha = 1;
  }

  function update(activeIdx, local, scrollVelocity) {
    frame++;
    canvases.forEach((item, i) => {
      if (!item) return;
      const { chapter, canvas, cfg } = item;
      const rect = chapter.getBoundingClientRect();
      const vh = window.innerHeight;
      const visible = rect.top < vh * 0.85 && rect.bottom > vh * 0.15;
      const wrap = canvas.parentElement;

      if (!visible) {
        wrap.style.opacity = '0';
        wrap.style.visibility = 'hidden';
        return;
      }

      // 当前章由左侧行走主角展示，隐藏背景剪影避免叠影发虚
      if (i === activeIdx) {
        wrap.style.opacity = '0';
        wrap.style.visibility = 'hidden';
        return;
      }

      wrap.style.visibility = 'visible';
      const dist = Math.abs(rect.top + rect.height * 0.5 - vh * 0.5) / vh;
      const fade = Math.max(0.55, 1 - dist * 0.45);
      wrap.style.opacity = String(fade);

      const t = i === activeIdx ? local : 0.35;
      const walkLocal = i === activeIdx && scrollVelocity > 0.2
        ? t
        : t * 0.5 + 0.25;

      const offsetX = (walkLocal - 0.5) * 24;
      canvas.style.transform = `translateX(${offsetX}px)`;

      if (i === activeIdx) drawStatic(i, local);
      else drawStatic(i, 0.3);
    });
  }

  return { init, update };
})();

window.ChapterHeroes = ChapterHeroes;
