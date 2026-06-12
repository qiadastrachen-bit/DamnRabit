/**
 * 页脚像素鸡腿 — 个人小标识 + 点击彩蛋
 */
(function () {
  const WELCOME = '欢迎来到鸡腿大王创造的世界';

  const PAL = {
    '.': null,
    b: '#e8dcc8',
    B: '#d8c8a8',
    m: '#c87840',
    M: '#e8a050',
    d: '#8b5030',
    w: '#fff8f0',
  };

  const LEG = [
    '......bbbb.......',
    '.....bbbbb.......',
    '....bbbbbbb......',
    '....mmmbbbb......',
    '...mmmmmbbb......',
    '...mmMmmmbb......',
    '...mmmmmmbb..w...',
    '...mmmmmmbb.www..',
    '...mmmmmmbb.www..',
    '....mmmmbbb.www..',
    '.....mmmbbb..w...',
    '......mmbbb......',
    '.......mbbb......',
    '........bbb......',
    '.........bb......',
    '..........b......',
  ];

  let hideTimer = null;

  function draw(canvas, scale) {
    if (!canvas) return;
    const rows = LEG.length;
    const cols = LEG[0].length;
    canvas.width = cols * scale;
    canvas.height = rows * scale;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const ch = LEG[y][x];
        const color = PAL[ch];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }

  function showWelcome() {
    const toast = document.getElementById('legToast');
    const btn = document.getElementById('legLogoBtn');
    if (!toast) return;

    toast.hidden = false;
    toast.classList.remove('is-show');
    void toast.offsetWidth;
    toast.classList.add('is-show');

    PixelAudio?.sfx?.secret?.();
    StoryInteractions?.flash?.('rgba(232, 160, 80, 0.22)');

    if (btn) {
      const canvas = btn.querySelector('[data-leg-logo]');
      const rect = canvas?.getBoundingClientRect();
      if (rect && window.CuteEffects?.spawnFloater) {
        CuteEffects.spawnFloater(rect.left + rect.width / 2, rect.top - 8, '🍗', '#e8a050', 0);
        CuteEffects.spawnFloater(rect.left + rect.width / 2 - 20, rect.top - 16, '✦', '#f8eeb8', 80);
        CuteEffects.spawnFloater(rect.left + rect.width / 2 + 18, rect.top - 12, '♡', '#c87840', 140);
      }
    }

    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      toast.classList.remove('is-show');
      setTimeout(() => { toast.hidden = true; }, 400);
    }, 3800);
  }

  function init() {
    document.querySelectorAll('[data-leg-logo]').forEach(canvas => {
      draw(canvas, parseInt(canvas.dataset.scale || '3', 10));
    });

    document.getElementById('legLogoBtn')?.addEventListener('click', showWelcome);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
