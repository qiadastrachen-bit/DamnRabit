/**
 * 拾梦夜行 — 蛋兔横版像素小游戏
 * ← → 移动 · 空格/↑ 跳跃 · ESC 暂停
 */
const EggDreamGame = (() => {
  const GW = 320;
  const GH = 180;
  const SCALE = 2;
  const GRAVITY = 0.42;
  const JUMP_V = -6.8;
  const MOVE_SPEED = 2.2;
  const WORLD_W = 2560;

  const COLORS = {
    sky1: '#0e0a14', sky2: '#1a1428',
    ground: '#2a3a2a', groundTop: '#3d5238',
    platform: '#3a3048', platTop: '#5a4868',
    thorn: '#6b3048', star: '#f8eeb8',
    shadow: '#1a1028', well: '#2a3040',
    mist: '#7a9ab0', hp: '#d4b86a', text: '#e8e0d4',
  };

  let overlay, canvas, ctx, hudEl, menuEl, touchEl;
  let running = false;
  let paused = false;
  let state = 'menu';
  let animId = null;
  let camera = 0;
  let shakeT = 0;
  let frame = 0;

  const keys = {};
  const player = {
    x: 40, y: 100, vx: 0, vy: 0,
    w: 18, h: 50,
    onGround: false, facing: 1,
    anim: 'idle', animF: 0, inv: 0,
    hp: 3, stars: 0,
  };

  let platforms = [];
  let stars = [];
  let enemies = [];
  let thorns = [];
  let decor = [];

  function init() {
    overlay = document.getElementById('gameOverlay');
    canvas = document.getElementById('gameCanvas');
    hudEl = document.getElementById('gameHud');
    menuEl = document.getElementById('gameMenu');
    touchEl = document.getElementById('gameTouch');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    canvas.width = GW;
    canvas.height = GH;

    bindControls();
    buildLevel();
  }

  function buildLevel() {
    platforms = [
      { x: 0, y: 148, w: 500, h: 32 },
      { x: 540, y: 128, w: 100, h: 16 },
      { x: 680, y: 108, w: 90, h: 16 },
      { x: 820, y: 128, w: 120, h: 16 },
      { x: 980, y: 98, w: 80, h: 16 },
      { x: 1100, y: 118, w: 140, h: 16 },
      { x: 1280, y: 138, w: 200, h: 16 },
      { x: 1520, y: 108, w: 90, h: 16 },
      { x: 1650, y: 88, w: 80, h: 16 },
      { x: 1770, y: 118, w: 110, h: 16 },
      { x: 1920, y: 138, w: 180, h: 16 },
      { x: 2140, y: 118, w: 100, h: 16 },
      { x: 2280, y: 98, w: 120, h: 16 },
      { x: 2440, y: 148, w: 200, h: 32 },
    ];

    stars = [
      { x: 120, y: 120, got: false }, { x: 280, y: 100, got: false },
      { x: 580, y: 100, got: false }, { x: 710, y: 80, got: false },
      { x: 870, y: 100, got: false }, { x: 1010, y: 70, got: false },
      { x: 1160, y: 90, got: false }, { x: 1350, y: 110, got: false },
      { x: 1550, y: 80, got: false }, { x: 1680, y: 60, got: false },
      { x: 1820, y: 90, got: false }, { x: 2000, y: 110, got: false },
      { x: 2180, y: 90, got: false }, { x: 2320, y: 70, got: false },
      { x: 2490, y: 120, got: false },
    ];

    enemies = [
      { x: 350, y: 132, w: 20, h: 16, vx: 0.6, min: 300, max: 460, kind: 'shadow' },
      { x: 900, y: 112, w: 20, h: 16, vx: -0.5, min: 830, max: 1020, kind: 'shadow' },
      { x: 1400, y: 122, w: 20, h: 16, vx: 0.7, min: 1290, max: 1460, kind: 'shadow' },
      { x: 2050, y: 122, w: 20, h: 16, vx: -0.6, min: 1930, max: 2090, kind: 'shadow' },
    ];

    thorns = [
      { x: 500, y: 156, w: 36, h: 12 },
      { x: 1260, y: 146, w: 24, h: 12 },
      { x: 1910, y: 146, w: 30, h: 12 },
    ];

    decor = [
      { kind: 'tree', x: 60 }, { kind: 'tree', x: 200 },
      { kind: 'tree', x: 450 }, { kind: 'mushroom', x: 620 },
      { kind: 'tree', x: 1050 }, { kind: 'mushroom', x: 1500 },
      { kind: 'tree', x: 2200 }, { kind: 'well', x: 2500 },
    ];
  }

  function resetPlayer() {
    Object.assign(player, {
      x: 40, y: 100, vx: 0, vy: 0,
      onGround: false, facing: 1,
      anim: 'idle', animF: 0, inv: 0,
      hp: 3, stars: 0,
    });
    stars.forEach(s => { s.got = false; });
    enemies.forEach(e => {
      e.vx = Math.abs(e.vx) * (e.x < (e.min + e.max) / 2 ? 1 : -1);
    });
    camera = 0;
    shakeT = 0;
    frame = 0;
  }

  function bindControls() {
    document.getElementById('coverGameBtn')?.addEventListener('click', open);
    document.getElementById('gameStartBtn')?.addEventListener('click', start);
    document.getElementById('gameResumeBtn')?.addEventListener('click', resume);
    document.getElementById('gameQuitBtn')?.addEventListener('click', close);
    document.getElementById('gameRetryBtn')?.addEventListener('click', () => {
      if (overlay?.dataset.mode === 'chapter') return;
      resetPlayer();
      start();
    });
    document.getElementById('gameBackBtn')?.addEventListener('click', close);

    window.addEventListener('keydown', e => {
      if (!running) return;
      keys[e.code] = true;
      if (e.code === 'Escape') {
        e.preventDefault();
        paused ? resume() : pause();
      }
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
        e.preventDefault();
    });
    window.addEventListener('keyup', e => { keys[e.code] = false; });

    touchEl?.querySelectorAll('[data-game-key]').forEach(btn => {
      const code = btn.dataset.gameKey;
      btn.addEventListener('pointerdown', e => { e.preventDefault(); keys[code] = true; btn.classList.add('is-pressed'); });
      btn.addEventListener('pointerup', () => { keys[code] = false; btn.classList.remove('is-pressed'); });
      btn.addEventListener('pointerleave', () => { keys[code] = false; btn.classList.remove('is-pressed'); });
    });
  }

  function resetMenuButtons() {
    document.getElementById('gameMenuTitle').textContent = '拾梦夜行';
    document.getElementById('gameMenuDesc').innerHTML =
      '蛋兔少女穿行迷雾森林，收集 15 枚梦碎片，抵达尽头古井。<br>躲避暗影与荆棘，跳跃平台，找回遗落的童话。';
    document.getElementById('gameStartBtn').style.display = '';
    document.getElementById('gameStartBtn').textContent = '开始冒险';
    document.getElementById('gameResumeBtn').style.display = 'none';
    document.getElementById('gameRetryBtn').style.display = 'none';
    document.getElementById('gameRetryBtn').textContent = '再来一次';
    document.getElementById('gameQuitBtn').style.display = '';
    document.querySelector('.game-menu__tag').textContent = '— 像素小游戏 —';
  }

  function open() {
    if (window.ChapterGames?.close) ChapterGames.close();
    overlay?.removeAttribute('data-mode');
    touchEl && (touchEl.style.display = '');
    overlay?.removeAttribute('hidden');
    document.body.classList.add('game-active');
    state = 'menu';
    resetMenuButtons();
    menuEl?.classList.add('is-visible');
    hudEl?.classList.remove('is-visible');
    resetPlayer();
    render();
    PixelAudio.sfx.page();
  }

  function close() {
    running = false;
    paused = false;
    cancelAnimationFrame(animId);
    overlay?.setAttribute('hidden', '');
    overlay?.removeAttribute('data-mode');
    touchEl && (touchEl.style.display = '');
    document.body.classList.remove('game-active');
    menuEl?.classList.remove('is-visible');
    hudEl?.classList.remove('is-visible');
    Object.keys(keys).forEach(k => { keys[k] = false; });
  }

  function start() {
    if (overlay?.dataset.mode === 'chapter') return;
    resetPlayer();
    state = 'play';
    running = true;
    paused = false;
    menuEl?.classList.remove('is-visible');
    hudEl?.classList.add('is-visible');
    PixelAudio.sfx.transition();
    loop();
  }

  function pause() {
    paused = true;
    menuEl?.classList.add('is-visible');
    document.getElementById('gameMenuTitle').textContent = '暂停';
    document.getElementById('gameStartBtn').style.display = 'none';
    document.getElementById('gameResumeBtn').style.display = '';
  }

  function resume() {
    paused = false;
    menuEl?.classList.remove('is-visible');
    document.getElementById('gameStartBtn').style.display = '';
    document.getElementById('gameResumeBtn').style.display = 'none';
    document.getElementById('gameMenuTitle').textContent = '拾梦夜行';
    if (!animId) loop();
  }

  function loop() {
    if (!running) return;
    if (!paused) {
      update();
      render();
    }
    animId = requestAnimationFrame(loop);
  }

  function update() {
    frame++;
    if (shakeT > 0) shakeT--;

    const left = keys.ArrowLeft || keys.KeyA;
    const right = keys.ArrowRight || keys.KeyD;
    const jump = keys.Space || keys.ArrowUp || keys.KeyW;

    if (left) { player.vx = -MOVE_SPEED; player.facing = -1; }
    else if (right) { player.vx = MOVE_SPEED; player.facing = 1; }
    else { player.vx *= 0.7; if (Math.abs(player.vx) < 0.1) player.vx = 0; }

    if (jump && player.onGround) {
      player.vy = JUMP_V;
      player.onGround = false;
      PixelAudio.sfx.click();
    }

    player.vy += GRAVITY;
    player.x += player.vx;
    player.y += player.vy;

    if (player.x < 0) player.x = 0;
    if (player.x > WORLD_W - player.w) player.x = WORLD_W - player.w;

    player.onGround = false;
    platforms.forEach(p => resolvePlatform(player, p));

    if (player.y > GH + 20) hurt(1, true);

    enemies.forEach(e => {
      e.x += e.vx;
      if (e.x <= e.min || e.x >= e.max) e.vx *= -1;
      if (player.inv <= 0 && aabb(player, e)) hurt();
    });

    thorns.forEach(t => {
      if (player.inv <= 0 && aabb(player, t)) hurt();
    });

    stars.forEach(s => {
      if (!s.got && dist(player, s) < 22) {
        s.got = true;
        player.stars++;
        PixelAudio.sfx.collect();
      }
    });

    if (player.inv > 0) player.inv--;

    if (player.x >= 2480 && player.stars >= 10) win();
    else if (player.x >= 2480 && player.stars < 10) {
      if (frame % 90 === 0) showTip('再收集些梦碎片吧…');
    }

    if (player.hp <= 0) lose();

    if (!player.onGround) player.anim = player.vy < 0 ? 'jump' : 'fall';
    else if (Math.abs(player.vx) > 0.5) player.anim = 'walk';
    else player.anim = 'idle';

    if (frame % (player.anim === 'walk' ? 6 : player.anim === 'idle' ? 18 : 8) === 0)
      player.animF++;

    camera = Math.max(0, Math.min(player.x - GW * 0.35, WORLD_W - GW));
    updateHud();
  }

  function resolvePlatform(ent, p) {
    if (ent.x + ent.w <= p.x || ent.x >= p.x + p.w || ent.y + ent.h <= p.y || ent.y >= p.y + p.h) return;
    const overlapL = ent.x + ent.w - p.x;
    const overlapR = p.x + p.w - ent.x;
    const overlapT = ent.y + ent.h - p.y;
    const overlapB = p.y + p.h - ent.y;
    const min = Math.min(overlapL, overlapR, overlapT, overlapB);
    if (min === overlapT && ent.vy >= 0) {
      ent.y = p.y - ent.h;
      ent.vy = 0;
      ent.onGround = true;
    } else if (min === overlapB && ent.vy < 0) {
      ent.y = p.y + p.h;
      ent.vy = 0;
    } else if (min === overlapL) {
      ent.x = p.x - ent.w;
      ent.vx = 0;
    } else if (min === overlapR) {
      ent.x = p.x + p.w;
      ent.vx = 0;
    }
  }

  function aabb(a, b) {
    return a.x < b.x + (b.w || 16) && a.x + a.w > b.x && a.y < b.y + (b.h || 16) && a.y + a.h > b.y;
  }

  function dist(a, b) {
    return Math.hypot(a.x + a.w / 2 - b.x, a.y + a.h / 2 - b.y);
  }

  function hurt(amount = 1, pit = false) {
    player.hp -= amount;
    player.inv = 90;
    player.vy = pit ? -4 : -3;
    shakeT = 12;
    PixelAudio.sfx.click();
    if (pit) { player.x = Math.max(0, player.x - 40); player.y = 80; }
  }

  function win() {
    state = 'win';
    running = false;
    menuEl?.classList.add('is-visible');
    document.getElementById('gameMenuTitle').textContent = '梦抵达了井边';
    document.getElementById('gameMenuDesc').textContent =
      `你收集了 ${player.stars} 枚梦碎片，蛋兔想起了回家的路。`;
    document.getElementById('gameStartBtn').style.display = 'none';
    document.getElementById('gameResumeBtn').style.display = 'none';
    document.getElementById('gameRetryBtn').style.display = '';
    document.getElementById('gameQuitBtn').style.display = '';
    PixelAudio.sfx.secret();
    if (player.stars >= 15 && window.StoryInteractions) {
      [0, 1, 2, 3, 4].forEach(i => {
        const slot = document.querySelector(`.fragment-slot[data-idx="${i}"]`);
        slot?.classList.add('is-collected');
      });
    }
  }

  function lose() {
    state = 'lose';
    running = false;
    menuEl?.classList.add('is-visible');
    document.getElementById('gameMenuTitle').textContent = '迷雾吞没了足迹';
    document.getElementById('gameMenuDesc').textContent = '再试一次？森林会记住勇敢的人。';
    document.getElementById('gameStartBtn').style.display = 'none';
    document.getElementById('gameResumeBtn').style.display = 'none';
    document.getElementById('gameRetryBtn').style.display = '';
  }

  let tipT = 0;
  let tipText = '';
  function showTip(t) { tipText = t; tipT = 120; }

  function updateHud() {
    if (!hudEl) return;
    hudEl.querySelector('.game-hud__hp').textContent = '♥'.repeat(player.hp) + '♡'.repeat(3 - player.hp);
    hudEl.querySelector('.game-hud__stars').textContent = `✦ ${player.stars}/15`;
  }

  function render() {
    const sx = shakeT ? (Math.random() - 0.5) * 4 : 0;
    const sy = shakeT ? (Math.random() - 0.5) * 3 : 0;

    ctx.save();
    ctx.translate(sx, sy);

    drawBackground();
    ctx.save();
    ctx.translate(-camera, 0);

    decor.forEach(d => drawDecor(d));
    platforms.forEach(p => drawPlatform(p));
    thorns.forEach(t => drawThorn(t));
    stars.forEach(s => drawStar(s));
    enemies.forEach(e => drawEnemy(e));
    drawGoal();
    drawPlayer();

    ctx.restore();
    drawForeground();
    if (tipT > 0) { tipT--; drawTip(); }

    ctx.restore();
  }

  function drawBackground() {
    const grad = ctx.createLinearGradient(0, 0, 0, GH);
    grad.addColorStop(0, COLORS.sky2);
    grad.addColorStop(1, COLORS.sky1);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, GW, GH);

    for (let i = 0; i < 30; i++) {
      const sx = ((i * 97 + camera * 0.1) % (GW + 40)) - 20;
      const sy = 12 + (i * 37) % 50;
      ctx.fillStyle = i % 5 === 0 ? COLORS.star : COLORS.mist;
      ctx.globalAlpha = 0.3 + (i % 3) * 0.15;
      ctx.fillRect(sx, sy, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(120,140,160,0.06)';
    for (let x = -camera % 80; x < GW; x += 80)
      ctx.fillRect(x, 60, 60, GH);
  }

  function drawForeground() {
    ctx.fillStyle = 'rgba(14,10,20,0.35)';
    ctx.fillRect(0, GH - 24, GW, 24);
    for (let x = 0; x < GW; x += 16)
      ctx.fillRect(x, GH - 20 + (x % 32 === 0 ? 2 : 0), 8, 2);
  }

  function drawPlatform(p) {
    ctx.fillStyle = COLORS.platform;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = COLORS.platTop;
    ctx.fillRect(p.x, p.y, p.w, 3);
    for (let x = p.x + 4; x < p.x + p.w; x += 12)
      ctx.fillRect(x, p.y + 5, 4, 2);
  }

  function drawThorn(t) {
    ctx.fillStyle = COLORS.thorn;
    for (let i = 0; i < t.w; i += 6)
      ctx.fillRect(t.x + i, t.y, 4, 8);
    ctx.fillRect(t.x, t.y + 6, t.w, 6);
  }

  function drawStar(s) {
    if (s.got) return;
    const bob = Math.sin(frame * 0.08 + s.x) * 2;
    const px = s.x - 4;
    const py = s.y - 4 + bob;
    ctx.fillStyle = COLORS.star;
    ctx.fillRect(px + 3, py, 2, 8);
    ctx.fillRect(px, py + 3, 8, 2);
    ctx.fillRect(px + 2, py + 2, 4, 4);
    ctx.globalAlpha = 0.4 + Math.sin(frame * 0.1) * 0.2;
    ctx.fillRect(px - 2, py - 2, 12, 12);
    ctx.globalAlpha = 1;
  }

  function drawEnemy(e) {
    const float = Math.sin(frame * 0.06 + e.x) * 2;
    ctx.fillStyle = COLORS.shadow;
    ctx.fillRect(e.x, e.y + float, e.w, e.h);
    ctx.fillStyle = '#9a8e9e';
    ctx.fillRect(e.x + 5, e.y + 4 + float, 3, 3);
    ctx.fillRect(e.x + 12, e.y + 4 + float, 3, 3);
    ctx.fillStyle = COLORS.thorn;
    ctx.fillRect(e.x + 4, e.y + 12 + float, 12, 2);
  }

  function drawDecor(d) {
    if (d.kind === 'tree') {
      ctx.fillStyle = '#14101a';
      ctx.fillRect(d.x, 100, 10, 48);
      ctx.fillStyle = '#1e2830';
      ctx.fillRect(d.x - 10, 80, 30, 28);
      ctx.fillRect(d.x - 6, 70, 22, 16);
    } else if (d.kind === 'mushroom') {
      ctx.fillStyle = COLORS.thorn;
      ctx.fillRect(d.x + 6, 118, 6, 14);
      ctx.fillStyle = '#8b4048';
      ctx.fillRect(d.x, 106, 18, 14);
    } else if (d.kind === 'well') {
      ctx.fillStyle = COLORS.well;
      ctx.fillRect(d.x, 108, 36, 40);
      ctx.fillStyle = '#1a2030';
      ctx.fillRect(d.x + 4, 112, 28, 16);
      ctx.fillStyle = COLORS.mist;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(d.x + 8, 116, 20, 8);
      ctx.globalAlpha = 1;
    }
  }

  function drawGoal() {
    const gx = 2500;
    ctx.fillStyle = COLORS.mist;
    ctx.font = '8px monospace';
    ctx.fillText(player.stars >= 10 ? '抵达井边 ✦' : '需要10碎片', gx, 88);
  }

  function drawPlayer() {
    const sprite = SpriteRenderer.getFrameByAnim(player.anim, player.animF);
    const drawX = player.x + player.w / 2 - (SPRITE_W * 0.55) / 2;
    const drawY = player.y + player.h - SPRITE_H * 0.55;
    const alpha = player.inv > 0 && frame % 6 < 3 ? 0.45 : 1;

    ctx.globalAlpha = alpha;
    SpriteRenderer.drawSpriteToContext(ctx, sprite, drawX, drawY, {
      scale: 0.55,
      flipX: player.facing < 0,
      glow: player.inv > 0,
    });
    ctx.globalAlpha = 1;
  }

  function drawTip() {
    ctx.fillStyle = 'rgba(14,10,20,0.85)';
    ctx.fillRect(GW / 2 - 80, 20, 160, 18);
    ctx.strokeStyle = COLORS.hp;
    ctx.strokeRect(GW / 2 - 80, 20, 160, 18);
    ctx.fillStyle = COLORS.text;
    ctx.font = '7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(tipText, GW / 2, 32);
    ctx.textAlign = 'left';
  }

  return { init, open, close, isRunning: () => running };
})();

window.EggDreamGame = EggDreamGame;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => EggDreamGame.init());
} else {
  EggDreamGame.init();
}
