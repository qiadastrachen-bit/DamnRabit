/**
 * 场景道具专属可爱动画 — 蘑菇 / 井 / 镜子 / 麦浪 / 月亮
 */
const PropFx = (() => {
  const PROP_ANIM = {
    mushroom: 'prop-anim--mushroom',
    well: 'prop-anim--well',
    mirror: 'prop-anim--mirror',
    wheat: 'prop-anim--wheat',
    moon: 'prop-anim--moon',
  };

  const PROP_NEAR_MSG = {
    mushroom: '蘑菇伞微微抖了一下…',
    well: '井底传来轻轻的呼唤',
    mirror: '镜光闪了一下',
    wheat: '麦浪向她低头',
    moon: '月光洒落在蛋帽上',
  };

  const PROP_CLICK_EXTRA = {
    mushroom: (el, x, y) => {
      for (let i = 0; i < 6; i++) {
        CuteEffects.spawnFloater?.(x + (i - 3) * 8, y - 20, '·', '#8b4048', i * 60);
        CuteEffects.spawnFloater?.(x, y - 30 - i * 6, '🍄', '#6b3048', i * 90);
      }
      CuteEffects.burst(x, y, '#8b4048', 16);
    },
    well: (el, x, y) => {
      spawnRipple(el);
      for (let i = 0; i < 3; i++) {
        CuteEffects.spawnFloater?.(x, y - 10 - i * 14, '〰', '#7a9ab0', i * 150);
      }
      CuteEffects.burst(x, y, '#7a9ab0', 14);
    },
    mirror: (el, x, y) => {
      el.classList.add('prop-anim--mirror-flash');
      setTimeout(() => el.classList.remove('prop-anim--mirror-flash'), 800);
      CuteEffects.spawnFloater?.(x - 20, y, '◐', '#c8d0e0', 0);
      CuteEffects.spawnFloater?.(x + 20, y, '◑', '#c8d0e0', 100);
      CuteEffects.burst(x, y, '#c8d0e0', 12);
    },
    wheat: (el, x, y) => {
      for (let i = 0; i < 5; i++) {
        CuteEffects.spawnFloater?.(x + (i - 2) * 12, y - 25, '🌾', '#c8b878', i * 70);
      }
      CuteEffects.burst(x, y, '#d8c878', 14);
    },
    moon: (el, x, y) => {
      CuteEffects.spawnFloater?.(x, y - 30, '☾', '#f0e8c8', 0);
      CuteEffects.spawnFloater?.(x, y - 50, '✦', '#f8eeb8', 120);
      CuteEffects.burst(x, y, '#f8eeb8', 18);
    },
  };

  function spawnRipple(el) {
    const r = document.createElement('span');
    r.className = 'prop-ripple';
    el.appendChild(r);
    setTimeout(() => r.remove(), 900);
  }

  function play(key, el, isClick = true) {
    if (!el || !key) return;
    const anim = PROP_ANIM[key];
    if (anim) {
      el.classList.remove(anim);
      void el.offsetWidth;
      el.classList.add(anim);
      setTimeout(() => el.classList.remove(anim), 900);
    }
    const { x, y } = CuteEffects.rectCenter(el);
    if (isClick && PROP_CLICK_EXTRA[key]) PROP_CLICK_EXTRA[key](el, x, y);
  }

  function nearby(key, el) {
    if (!el || !key) return;
    const anim = PROP_ANIM[key];
    if (anim) {
      el.classList.add('prop-anim--nearby');
      setTimeout(() => el.classList.remove('prop-anim--nearby'), 1200);
    }
    const msg = PROP_NEAR_MSG[key];
    if (msg) {
      const { x, y } = CuteEffects.rectCenter(el);
      CuteEffects.showPop?.(x, y - 20, msg, '#d4b86a');
    }
    if (key === 'well') spawnRipple(el);
    if (key === 'mushroom') {
      const { x, y } = CuteEffects.rectCenter(el);
      CuteEffects.spawnFloater?.(x, y - 16, '🌿', '#6b9a68', 0);
    }
  }

  function stickerNearby(el, fxKey) {
    CuteEffects.wiggle?.(el, fxKey === 'moss' ? 'wiggle-moss' : 'wiggle-hop');
    const { x, y } = CuteEffects.rectCenter(el);
    CuteEffects.spawnFloater?.(x, y - 18, '♡', '#f8eeb8', 0);
  }

  const HIGHFIVE_EXTRA = {
    mushroom: (x, y) => {
      CuteEffects.spawnFloater?.(x, y - 22, '🍄', '#8b4048', 0);
      CuteEffects.burst(x, y, '#6b9a68', 10);
    },
    well: (x, y) => {
      CuteEffects.spawnFloater?.(x, y - 16, '💧', '#7a9ab0', 0);
      CuteEffects.burst(x, y, '#7a9ab0', 12);
    },
    mirror: (x, y) => CuteEffects.burst(x, y, '#c8d0e0', 14),
    wheat: (x, y) => {
      CuteEffects.spawnFloater?.(x, y - 20, '🌾', '#d8c878', 0);
      CuteEffects.burst(x, y, '#d8c878', 12);
    },
    moon: (x, y) => {
      CuteEffects.spawnFloater?.(x, y - 24, '☾', '#f0e8c8', 0);
      CuteEffects.burst(x, y, '#f8eeb8', 16);
    },
  };

  function highfive(key, el) {
    if (!el) return;
    el.classList.remove('prop-anim--highfive');
    void el.offsetWidth;
    el.classList.add('prop-anim--highfive');
    setTimeout(() => el.classList.remove('prop-anim--highfive'), 900);

    const { x, y } = CuteEffects.rectCenter(el);
    HIGHFIVE_EXTRA[key]?.(x, y);
    if (!HIGHFIVE_EXTRA[key]) CuteEffects.burst(x, y, '#d4b86a', 10);
  }

  return { play, nearby, stickerNearby, highfive };
})();

window.PropFx = PropFx;
