/**
 * 主角靠近贴纸 / 道具：挥手 → 贴近击掌
 * 主角固定在屏幕左侧，需滚动页面让目标元素靠近她。
 */
const HeroProximity = (() => {
  const STICKER_WAVE = 145;
  const PROP_WAVE = 165;
  const STICKER_HIGHFIVE = 88;
  const PROP_HIGHFIVE = 95;
  const MOON_WAVE = 155;
  const MOON_HIGHFIVE = 100;
  const WAVE_COOLDOWN = 4500;
  const HIGHFIVE_COOLDOWN = 9000;
  const DWELL_MS = 480;

  const lastWave = new Map();
  const lastHighfive = new Map();
  const dwell = new Map();

  function heroCenter() {
    const layer = document.getElementById('heroLayer');
    if (!layer) return null;
    const r = layer.getBoundingClientRect();
    return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.55 };
  }

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function canTrigger(map, el, cooldown) {
    const t = map.get(el) || 0;
    if (Date.now() - t < cooldown) return false;
    map.set(el, Date.now());
    return true;
  }

  function targetCenter(el) {
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    return rect.bottom >= 0 && rect.top <= window.innerHeight;
  }

  function updateDwell(el, inZone) {
    if (!inZone) {
      dwell.delete(el);
      return false;
    }
    const d = dwell.get(el);
    if (!d) {
      dwell.set(el, { since: Date.now() });
      return false;
    }
    return Date.now() - d.since >= DWELL_MS;
  }

  function collectTargets() {
    const list = [];
    document.querySelectorAll('[data-cute-fx]').forEach(el => {
      if (isVisible(el)) list.push({ el, kind: 'sticker', wave: STICKER_WAVE, hf: STICKER_HIGHFIVE });
    });
    document.querySelectorAll('.scene-prop.is-interactive[data-secret]').forEach(el => {
      if (isVisible(el)) list.push({ el, kind: 'prop', wave: PROP_WAVE, hf: PROP_HIGHFIVE });
    });
    document.querySelectorAll('[data-secret="moon"]').forEach(el => {
      if (isVisible(el)) list.push({ el, kind: 'moon', wave: MOON_WAVE, hf: MOON_HIGHFIVE });
    });
    return list;
  }

  function tryHighfive(el, hero, center, highfiveRange, kind, secretKey) {
    const d = dist(hero, center);
    const ready = updateDwell(el, d < highfiveRange);
    if (!ready || !canTrigger(lastHighfive, el, HIGHFIVE_COOLDOWN)) return;
    lastWave.set(el, Date.now());
    StoryInteractions.highfiveNear(el, kind, secretKey);
  }

  function tryWave(el, hero, center, waveRange, kind) {
    if (dist(hero, center) >= waveRange) return;
    if (!canTrigger(lastWave, el, WAVE_COOLDOWN)) return;
    StoryInteractions.waveNear(el, kind);
    if (kind === 'sticker') PropFx.stickerNearby(el, el.dataset.cuteFx);
    else PropFx.nearby(secretKeyFrom(el, kind), el);
  }

  function secretKeyFrom(el, kind) {
    if (kind === 'moon') return 'moon';
    return el.dataset.secret || el.dataset.cuteFx;
  }

  function checkTarget(hero, t) {
    const center = targetCenter(t.el);
    const key = secretKeyFrom(t.el, t.kind);
    tryHighfive(t.el, hero, center, t.hf, t.kind, key);
    tryWave(t.el, hero, center, t.wave, t.kind);
    return dist(hero, center);
  }

  function getApproachState() {
    const hero = heroCenter();
    if (!hero) return { text: '← 蛋兔停在这里 · 慢速滚动把贴纸送过来', level: 'idle' };

    const targets = collectTargets();
    if (!targets.length) {
      return { text: '继续翻页 · 下一页有贴纸和道具', level: 'none' };
    }

    let nearest = Infinity;
    let nearestWave = STICKER_WAVE;
    targets.forEach(t => {
      const d = dist(hero, targetCenter(t.el));
      if (d < nearest) {
        nearest = d;
        nearestWave = t.wave;
      }
    });

    if (nearest < nearestWave * 0.65) {
      return { text: '贴得很近了！停一下等击掌', level: 'touch' };
    }
    if (nearest < nearestWave) {
      return { text: '相遇了！她在挥手', level: 'wave' };
    }
    if (nearest < nearestWave + 120) {
      return { text: '快到了 ↑↓ 再微调滚动一点点', level: 'almost' };
    }
    if (nearest < nearestWave + 280) {
      return { text: '↓ 慢滚 · 把左侧贴纸/道具送到蛋兔身旁', level: 'near' };
    }
    return { text: '← 蛋兔在屏幕左侧 · 滚动页面让目标靠过来', level: 'far' };
  }

  function updateApproachHint() {
    const hint = document.getElementById('heroApproachHint');
    if (!hint) return;
    const { text, level } = getApproachState();
    if (hint.textContent !== text) hint.textContent = text;
    hint.dataset.level = level;
  }

  function update() {
    const hero = heroCenter();
    if (!hero) return;

    collectTargets().forEach(t => checkTarget(hero, t));
    updateApproachHint();
  }

  return { update, getApproachState };
})();

window.HeroProximity = HeroProximity;
