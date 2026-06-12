/**
 * 可可爱爱的点击小效果 — 贴纸 / 标签 / 小故事卡
 */
const CuteEffects = (() => {
  const STICKER_FX = {
    moss: {
      emoji: ['💧', '🌿', '·'],
      color: '#6b9a68',
      msg: '苔藓小声哭了一下…',
      wiggle: 'wiggle-moss',
    },
    egg: {
      emoji: ['✦', '🥚', '♡'],
      color: '#f0c848',
      msg: '蛋里的兔子动了动耳朵',
      wiggle: 'wiggle-hop',
    },
    star: {
      emoji: ['✦', '★', '·'],
      color: '#f8eeb8',
      msg: '一颗小星星落下来',
      wiggle: 'wiggle-sparkle',
    },
    reader: {
      emoji: ['♡', '✦', '📖'],
      color: '#d4b86a',
      msg: '蛋兔看向了你',
      wiggle: 'wiggle-sparkle',
    },
    page: {
      emoji: ['📄', '✧', '…'],
      color: '#9a8e9e',
      msg: '空白页上有浅浅的爪印',
      wiggle: 'wiggle-hop',
    },
    retry: {
      emoji: ['↺', '✦', '♡'],
      color: '#d4b86a',
      msg: '故事愿意再读一遍',
      wiggle: 'wiggle-sparkle',
    },
  };

  const MINI_FX = {
    tale: { emoji: ['❝', '✧', '❞'], color: '#7a9ab0', msg: null },
    label: { emoji: ['◈', '·'], color: '#d4b86a', msg: null },
  };

  let layer;

  function ensureLayer() {
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'cute-fx-layer';
      layer.setAttribute('aria-hidden', 'true');
      document.body.appendChild(layer);
    }
    return layer;
  }

  function rectCenter(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function spawnFloater(x, y, char, color, delay = 0) {
    const el = document.createElement('span');
    el.className = 'cute-floater';
    el.textContent = char;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = color;
    el.style.animationDelay = `${delay}ms`;
    ensureLayer().appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }

  function highfiveSpark(x1, y1, x2, y2) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const spark = document.createElement('span');
    spark.className = 'highfive-spark';
    spark.style.left = `${mx}px`;
    spark.style.top = `${my}px`;
    ensureLayer().appendChild(spark);
    setTimeout(() => spark.remove(), 700);

    spawnFloater(mx, my - 6, '啪', '#f8eeb8', 0);
    spawnFloater(mx - 14, my - 10, '✦', '#d4b86a', 60);
    spawnFloater(mx + 12, my - 12, '♡', '#f0c848', 100);
    burst(mx, my, '#f8eeb8', 10);
  }

  function showPop(x, y, text, color) {
    if (!text) return;
    const pop = document.createElement('p');
    pop.className = 'cute-pop';
    pop.textContent = text;
    pop.style.left = `${x}px`;
    pop.style.top = `${y}px`;
    pop.style.borderColor = color;
    ensureLayer().appendChild(pop);
    requestAnimationFrame(() => pop.classList.add('is-show'));
    setTimeout(() => {
      pop.classList.remove('is-show');
      setTimeout(() => pop.remove(), 400);
    }, 1800);
  }

  function burst(x, y, color, count = 14) {
    window.particles?.burst?.(x, y, color, count);
  }

  function wiggle(el, cls) {
    if (!el || !cls) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), 600);
  }

  function playAt(el, fxKey) {
    const fx = STICKER_FX[fxKey] || MINI_FX.tale;
    const { x, y } = rectCenter(el);
    const color = fx.color || '#f8eeb8';

    fx.emoji.forEach((e, i) => {
      const angle = (Math.PI * 2 * i) / fx.emoji.length;
      spawnFloater(
        x + Math.cos(angle) * 12,
        y + Math.sin(angle) * 8 - 10,
        e,
        color,
        i * 80,
      );
    });

    burst(x, y, color, fxKey === 'star' ? 20 : 12);
    wiggle(el, fx.wiggle);
    showPop(x, y - 28, fx.msg, color);

    if (fxKey === 'moss') spawnTears(x, y);
    if (fxKey === 'egg') spawnFloater(x, y - 20, '↑', color, 100);

    PixelAudio.sfx.collect();
  }

  function spawnTears(x, y) {
    for (let i = 0; i < 4; i++) {
      const t = document.createElement('span');
      t.className = 'cute-tear';
      t.textContent = '💧';
      t.style.left = `${x + (i - 2) * 10}px`;
      t.style.top = `${y}px`;
      t.style.animationDelay = `${i * 120}ms`;
      ensureLayer().appendChild(t);
      setTimeout(() => t.remove(), 1500);
    }
  }

  function chapterPoof(x, y) {
    burst(x, y, '#f8eeb8', 10);
    spawnFloater(x, y - 16, '✧', '#d4b86a');
    PixelAudio.sfx.page();
  }

  function init() {
    document.querySelectorAll('[data-cute-fx]').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        playAt(el, el.dataset.cuteFx);
      });
    });

    document.querySelectorAll('.path-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const icon = btn.querySelector('.path-btn__icon');
        if (icon) wiggle(icon, 'wiggle-hop');
      });
    });

    document.querySelectorAll('.mini-tale:not(.mini-tale--cycle):not([data-cute-fx])').forEach(card => {
      card.addEventListener('click', () => {
        const { x, y } = rectCenter(card);
        spawnFloater(x, y - 8, '❝', '#7a9ab0');
        burst(x, y, '#7a9ab0', 8);
        wiggle(card, 'wiggle-sparkle');
        PixelAudio.sfx.dialogue();
      });
    });

    document.querySelectorAll('.chapter__aside-label').forEach(label => {
      label.addEventListener('click', () => {
        const { x, y } = rectCenter(label);
        spawnFloater(x + 20, y, '◈', '#d4b86a');
        wiggle(label, 'wiggle-sparkle');
        PixelAudio.sfx.click();
      });
    });
  }

  return {
    init, playAt, chapterPoof, burst,
    spawnFloater, showPop, wiggle, rectCenter, highfiveSpark,
  };
})();

window.CuteEffects = CuteEffects;
