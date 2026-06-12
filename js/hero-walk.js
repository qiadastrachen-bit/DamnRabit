/**
 * 主角每章漫步 — 在每一页左侧舞台内走一走
 */
const HeroWalk = (() => {
  const CHAPTER_WALKS = [
    { x0: 0.12, x1: 0.34, y: 0.56, glow: true,  hideBelow: 0.1 },
    { x0: 0.06, x1: 0.28, y: 0.52, glow: true, hideBelow: 0 },
    { x0: 0.08, x1: 0.30, y: 0.50, glow: false, hideBelow: 0 },
    { x0: 0.10, x1: 0.38, y: 0.48, glow: true,  flip: true, hideBelow: 0 },
    { x0: 0.06, x1: 0.28, y: 0.50, glow: false, hideBelow: 0 },
    { x0: 0.10, x1: 0.32, y: 0.54, glow: true,  hideBelow: 0 },
  ];

  function getPosition(chapterIdx, local, vh, vw) {
    const cfg = CHAPTER_WALKS[chapterIdx] || CHAPTER_WALKS[1];
    const t = easeWalk(local);
    const x = (cfg.x0 + (cfg.x1 - cfg.x0) * t) * vw;
    const y = cfg.y * vh;
    const opacity = cfg.hideBelow && local < cfg.hideBelow
      ? Math.min(1, local / cfg.hideBelow + 0.65)
      : 1;

    return {
      x,
      y,
      opacity,
      glow: cfg.glow,
      flip: cfg.flip,
      cfg,
    };
  }

  function easeWalk(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function getStageRect(chapterIdx, vw, vh) {
    const cfg = CHAPTER_WALKS[chapterIdx] || CHAPTER_WALKS[1];
    return {
      left: cfg.x0 * vw,
      right: cfg.x1 * vw,
      width: (cfg.x1 - cfg.x0) * vw,
      y: cfg.y * vh,
    };
  }

  return { getPosition, getStageRect, CHAPTER_WALKS };
})();

window.HeroWalk = HeroWalk;
