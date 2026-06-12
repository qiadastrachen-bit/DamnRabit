/**
 * 第一章岔路 — 像素风背景画切换
 */
const PathBackground = (() => {
  let canvas, ctx, current = 'well';
  const PX = 4;

  function init() {
    canvas = document.getElementById('pathBgCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', () => { resize(); draw(current); });
    draw('well');
    canvas.classList.add('is-visible', 'path-bg--well');
    updateAsideScene('well');
    document.getElementById('ch-ch1')?.setAttribute('data-selected-path', 'well');
  }

  function resize() {
    const ch = document.getElementById('ch-ch1');
    if (!ch || !canvas) return;
    canvas.width = ch.offsetWidth;
    canvas.height = ch.offsetHeight;
  }

  function px(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * PX, y * PX, w * PX, h * PX);
  }

  function drawCastle() {
    const W = Math.ceil(canvas.width / PX);
    const H = Math.ceil(canvas.height / PX);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < H; y++) {
      const t = y / H;
      ctx.fillStyle = `rgb(${14 + t * 8},${8 + t * 4},${28 + t * 10})`;
      ctx.fillRect(0, y * PX, canvas.width, PX);
    }

    for (let i = 0; i < 40; i++) {
      const sx = (i * 47) % W;
      const sy = (i * 23) % Math.floor(H * 0.5);
      px(sx, sy, 1, 1, i % 3 === 0 ? '#f8eeb8' : '#9a8eb8');
    }

    const cx = Math.floor(W * 0.35);
    const castleY = Math.floor(H * 0.08);
    px(cx, castleY, 28, 3, '#5a4868');
    px(cx + 2, castleY + 3, 24, 14, '#4a3858');
    px(cx + 4, castleY + 17, 20, 3, '#6b5880');
    for (let i = 0; i < 5; i++) px(cx + 6 + i * 4, castleY + 3, 2, 14, '#3a2848');
    px(cx + 10, castleY + 6, 8, 6, '#7a9ab0');
    px(cx + 12, castleY - 4, 4, 4, '#d4b86a');

    for (let y = castleY + 20; y < H * 0.55; y += 2) {
      const x = cx + 12 + (y % 4 === 0 ? 1 : 0);
      px(x, y, 3, 2, '#6b5880');
      px(x - 1, y, 1, 2, '#3a2848');
    }

    for (let x = 0; x < W; x += 3) {
      const th = 8 + (x % 5);
      px(x, H - th - 4, 2, th, '#1a1420');
      px(x - 1, H - th - 8, 4, 5, '#243028');
    }

    px(8, H - 6, W - 16, 2, '#2a2038');

    ctx.globalAlpha = 0.15;
    for (let y = 0; y < H; y += 2)
      ctx.fillRect(0, y * PX, canvas.width, PX);
    ctx.globalAlpha = 1;
  }

  function drawWell() {
    const W = Math.ceil(canvas.width / PX);
    const H = Math.ceil(canvas.height / PX);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < H; y++) {
      const t = y / H;
      ctx.fillStyle = `rgb(${12 + t * 6},${16 + t * 8},${22 + t * 6})`;
      ctx.fillRect(0, y * PX, canvas.width, PX);
    }

    for (let x = 0; x < W; x += 4) {
      const th = 10 + (x % 7);
      px(x, H - th - 3, 3, th, '#141c18');
      px(x, H - th - 10, 5, 7, '#1e2a22');
    }

    for (let i = 0; i < 25; i++) {
      ctx.globalAlpha = 0.08 + (i % 5) * 0.03;
      px((i * 31) % W, (i * 17) % H, 8, 2, '#c8d8e8');
    }
    ctx.globalAlpha = 1;

    const wx = Math.floor(W * 0.28);
    const wy = Math.floor(H * 0.45);
    px(wx, wy, 16, 12, '#3a4050');
    px(wx + 2, wy + 2, 12, 6, '#1a2030');
    px(wx + 4, wy + 3, 8, 4, '#4a6888');

    ctx.globalAlpha = 0.4;
    for (let r = 0; r < 6; r++) {
      px(wx + 6 - r, wy + 5 - r, 4 + r * 2, 2, '#7a9ab0');
    }
    ctx.globalAlpha = 1;

    px(wx + 5, wy - 2, 6, 3, '#5a4868');
    px(wx + 7, wy - 5, 2, 3, '#d4b86a');

    for (let i = 0; i < 12; i++) {
      const fx = wx + 8 + Math.sin(i) * 20;
      const fy = wy + 14 + i * 3;
      px(fx, fy, 1, 1, '#98b0c8');
    }

    px(6, H - 5, W - 12, 2, '#1a2030');
  }

  function drawField() {
    const W = Math.ceil(canvas.width / PX);
    const H = Math.ceil(canvas.height / PX);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, '#2a1838');
    sky.addColorStop(0.35, '#6b4058');
    sky.addColorStop(0.6, '#c88858');
    sky.addColorStop(1, '#3a2818');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.55);

    ctx.fillStyle = '#2a2018';
    ctx.fillRect(0, canvas.height * 0.55, canvas.width, canvas.height * 0.45);

    const sunX = Math.floor(W * 0.7);
    px(sunX, 6, 6, 6, '#f0c878');
    ctx.globalAlpha = 0.25;
    px(sunX - 3, 4, 12, 10, '#f8d888');
    ctx.globalAlpha = 1;

    const fieldY = Math.floor(H * 0.52);
    for (let x = 0; x < W; x += 2) {
      const h = 6 + (x % 4);
      px(x, fieldY, 1, h, '#b0a060');
      px(x, fieldY - 2, 2, 2, '#d8c878');
    }

    for (let x = 0; x < W; x += 5) {
      px(x, fieldY + 8, 3, H - fieldY - 10, '#908050');
    }

    px(4, H - 5, W - 8, 2, '#4a3828');

    for (let i = 0; i < 8; i++) {
      ctx.globalAlpha = 0.12;
      px(10 + i * 12, fieldY + 2 + (i % 3), 14, 1, '#f8eeb8');
    }
    ctx.globalAlpha = 1;
  }

  const DRAWERS = { castle: drawCastle, well: drawWell, field: drawField };

  function draw(path) {
    current = path;
    (DRAWERS[path] || drawWell)();
  }

  function switchTo(path) {
    if (!canvas) return;
    const ch = document.getElementById('ch-ch1');
    canvas.classList.add('is-switching');
    ch?.setAttribute('data-selected-path', path);

    setTimeout(() => {
      draw(path);
      canvas.classList.remove('path-bg--castle', 'path-bg--well', 'path-bg--field');
      canvas.classList.add(`path-bg--${path}`);
      setTimeout(() => canvas.classList.remove('is-switching'), 50);
    }, 200);

    updateAsideScene(path);
    updateAsideTale(path);
  }

  const ASIDE_TALES = {
    castle: '从未有人走过左路。倒悬城堡的门把手，安装在天花板上。',
    well: '井壁回响：「……回来吧，写故事的人。」',
    field: '麦芒划过指尖，像翻过一页粗糙的旧纸。',
  };

  function updateAsideScene(path) {
    const scene = document.querySelector('#ch-ch1 .pixel-scene--paths');
    if (!scene) return;
    scene.classList.remove('pixel-scene--paths-active-castle', 'pixel-scene--paths-active-well', 'pixel-scene--paths-active-field');
    scene.classList.add(`pixel-scene--paths-active-${path}`);
  }

  function updateAsideTale(path) {
    const note = document.querySelector('#ch-ch1 .mini-tale:not(.mini-tale--cycle) .mini-tale__body');
    if (note) {
      note.style.opacity = '0';
      setTimeout(() => {
        note.textContent = {
          castle: '左路向上，却通向更深。城堡里住着上一个写故事的人。',
          well: '中路向下，却听见自己的名字。井底有摇篮曲的回声。',
          field: '右路平坦，却每一步都像踩在未写完的句子上。',
        }[path] || ASIDE_TALES.well;
        note.style.opacity = '1';
      }, 300);
    }
  }

  return { init, switchTo, draw };
})();

window.PathBackground = PathBackground;
