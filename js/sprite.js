/**
 * 蛋兔少女 — 像素风主角精灵 + 多帧动画
 */
const SPRITE_W = 48;
const SPRITE_H = 64;
const PIXEL_SCALE = 2;

const PALETTE = {
  '.': null,
  O: '#3D2F4A',
  s: '#FFF0E0',
  S: '#E8D0C0',
  h: '#F8EDD0',
  H: '#E8D8B0',
  d: '#C8B888',
  e: '#F5E8D8',
  y: '#F0F8FF',
  b: '#98C0D8',
  B: '#6888A8',
  x: '#D8E8F8',
  r: '#F0A0A0',
  m: '#C88888',
  w: '#FAFAF5',
  W: '#E0E0D8',
  Y: '#F0C848',
  R: '#E8A030',
  n: '#E8D060',
  N: '#5A4868',
  g: '#5A6848',
  G: '#485838',
  l: '#F0E0A0',
  L: '#F8EEB8',
  a: '#F0E0A8',
  A: '#D8C890',
  f: '#506040',
  F: '#3E5030',
  t: '#F0E0A0',
  k: '#E8D080',
  p: '#809060',
  c: '#FFD878',
};

function cloneRows(base) {
  return (base || HERO_BASE).map(r => r.split(''));
}

function rowsToStrings(rows) {
  return rows.map(r => r.join(''));
}

// 48×64 基础站立帧（无动态四肢）
const HERO_BASE = (() => {
  const rows = [];
  for (let y = 0; y < SPRITE_H; y++) rows.push(new Array(SPRITE_W).fill('.'));

  const set = (x, y, c) => {
    if (x >= 0 && x < SPRITE_W && y >= 0 && y < SPRITE_H) rows[y][x] = c;
  };
  const rect = (x, y, w, h, c) => {
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++) set(x + i, y + j, c);
  };
  const ellipse = (cx, cy, rx, ry, c) => {
    for (let y = cy - ry; y <= cy + ry; y++)
      for (let x = cx - rx; x <= cx + rx; x++) {
        const dx = (x - cx) / rx, dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) set(x, y, c);
      }
  };

  rect(18, 0, 12, 3, 'w');
  rect(17, 2, 14, 2, 'w');
  rect(16, 3, 16, 3, 'w');
  rect(15, 5, 18, 2, 'w');
  set(14, 6, 'W'); set(33, 6, 'W');
  rect(18, 1, 10, 6, 'Y');
  set(20, 3, 'O'); set(27, 3, 'O');
  set(23, 4, 'm');
  set(21, 2, 'R'); set(26, 2, 'R');
  rect(20, 1, 8, 1, 'c');

  for (let x = 10; x < 38; x++) { set(x, 7, 'h'); set(x, 8, 'H'); }
  rect(8, 9, 32, 4, 'h');
  rect(7, 12, 34, 3, 'H');
  rect(6, 14, 36, 4, 'h');
  for (let x = 14; x < 34; x++) set(x, 15, 'h');
  for (let x = 15; x < 33; x++) set(x, 16, 'H');
  rect(34, 10, 6, 3, 'h');
  rect(36, 13, 8, 4, 'H');
  rect(38, 17, 8, 6, 'h');
  rect(40, 23, 7, 8, 'H');
  rect(41, 31, 6, 10, 'h');
  rect(42, 41, 4, 8, 'H');
  rect(40, 49, 3, 5, 'd');
  rect(38, 12, 5, 3, 'k');
  set(37, 13, 'O'); set(43, 13, 'O');
  rect(4, 14, 4, 3, 'h');
  rect(3, 17, 3, 5, 'H');
  set(2, 16, 't'); set(2, 18, 't');

  rect(6, 14, 3, 5, 'e'); set(5, 15, 'e'); set(5, 16, 'S');
  rect(39, 14, 3, 5, 'e'); set(42, 15, 'e'); set(42, 16, 'S');

  ellipse(24, 22, 11, 10, 's');
  rect(13, 18, 22, 10, 's');
  set(15, 24, 'r'); set(16, 24, 'r');
  set(31, 24, 'r'); set(32, 24, 'r');
  rect(16, 20, 6, 5, 'y');
  rect(26, 20, 6, 5, 'y');
  rect(17, 21, 4, 3, 'b');
  rect(27, 21, 4, 3, 'b');
  set(18, 22, 'x'); set(19, 21, 'B');
  set(28, 22, 'x'); set(29, 21, 'B');
  set(17, 20, 'O'); set(22, 20, 'O');
  set(27, 20, 'O'); set(32, 20, 'O');
  set(18, 24, 'O'); set(21, 24, 'O');
  set(28, 24, 'O'); set(31, 24, 'O');
  set(16, 19, 'O'); set(22, 19, 'O');
  set(26, 19, 'O'); set(32, 19, 'O');
  set(23, 27, 'm'); set(24, 27, 'm'); set(25, 27, 'm');

  rect(20, 30, 8, 1, 'n');
  set(23, 31, 'N'); set(24, 32, 'N'); set(25, 31, 'N');

  rect(12, 32, 24, 3, 'L');
  rect(14, 35, 20, 2, 'l');
  set(13, 33, 'l'); set(34, 33, 'l');
  rect(10, 37, 28, 3, 'g');
  rect(8, 40, 32, 4, 'g');
  rect(7, 44, 34, 3, 'G');
  for (let x = 6; x < 42; x += 3) { set(x, 47, 'L'); set(x + 1, 47, 'l'); }
  rect(8, 48, 32, 2, 'l');
  for (let x = 10; x < 38; x += 4) set(x, 41, 'p');

  rect(6, 38, 5, 6, 'a');
  set(5, 39, 'A'); set(5, 42, 'A');
  rect(7, 39, 3, 3, 'l');
  set(8, 40, 'k');
  set(5, 44, 'c');

  const outline = [];
  for (let y = 0; y < SPRITE_H; y++)
    for (let x = 0; x < SPRITE_W; x++) {
      if (rows[y][x] === '.') continue;
      const neighbors = [[-1,0],[1,0],[0,-1],[0,1]].filter(([dx,dy]) => {
        const nx = x+dx, ny = y+dy;
        return nx < 0 || nx >= SPRITE_W || ny < 0 || ny >= SPRITE_H || rows[ny][nx] === '.';
      });
      if (neighbors.length) outline.push([x, y]);
    }
  outline.forEach(([x, y]) => {
    [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx,dy]) => {
      const nx = x+dx, ny = y+dy;
      if (nx >= 0 && nx < SPRITE_W && ny >= 0 && ny < SPRITE_H && rows[ny][nx] === '.')
        set(nx, ny, 'O');
    });
  });

  return rows.map(r => r.join(''));
})();

const HERO_PIXELS = HERO_BASE;

function clearLegs(rows) {
  for (let y = 49; y < 64; y++)
    for (let x = 14; x < 36; x++)
      if ('sSflFtGk'.includes(rows[y][x])) rows[y][x] = '.';
}

function paintLegs(rows, phase) {
  clearLegs(rows);
  const leg = (lx, ly, lw, lh, shoe, ribbon) => {
    for (let y = ly; y < ly + lh; y++)
      for (let x = lx; x < lx + lw; x++)
        rows[y][x] = y < ly + lh - 4 ? 's' : shoe;
    if (ribbon) {
      rows[ly + lh - 5][lx + 1] = 't';
      rows[ly + lh - 5][lx + 2] = 't';
      rows[ly + lh - 4][lx + 2] = 'k';
    }
  };

  const cycles = [
    () => { leg(15, 50, 7, 6, 'f', true); leg(27, 52, 7, 4, 'f', false); },
    () => { leg(16, 50, 6, 5, 'f', true); leg(26, 51, 8, 5, 'f', true); },
    () => { leg(17, 51, 6, 4, 'f', false); leg(25, 50, 8, 6, 'f', true); },
    () => { leg(18, 52, 5, 3, 'F', false); leg(24, 50, 9, 6, 'f', true); },
    () => { leg(25, 50, 7, 6, 'f', true); leg(15, 52, 7, 4, 'f', false); },
    () => { leg(26, 50, 6, 5, 'f', true); leg(16, 51, 8, 5, 'f', true); },
    () => { leg(25, 51, 6, 4, 'f', false); leg(17, 50, 8, 6, 'f', true); },
    () => { leg(24, 52, 5, 3, 'F', false); leg(18, 50, 9, 6, 'f', true); },
  ];
  cycles[phase % 8]();
}

function shiftDress(rows, offset) {
  if (!offset) return;
  for (let y = 44; y >= 36; y--) {
    for (let x = 6; x < 42; x++) {
      const ch = rows[y][x];
      if ('lLgGp'.includes(ch) && y + offset < SPRITE_H) {
        if (rows[y + offset][x] === '.') rows[y + offset][x] = ch;
        rows[y][x] = '.';
      }
    }
  }
}

function swayPonytail(rows, dir) {
  if (!dir) return;
  const tail = [];
  for (let y = 10; y < 54; y++)
    for (let x = 38; x < 46; x++)
      if (rows[y][x] !== '.') tail.push([x, y, rows[y][x]]);
  tail.forEach(([x, y, c]) => { rows[y][x] = '.'; });
  tail.forEach(([x, y, c]) => {
    const nx = x + dir;
    if (nx >= 0 && nx < SPRITE_W) rows[y][nx] = c;
  });
}

function bobEgg(rows, dy) {
  if (!dy) return;
  const egg = [];
  for (let y = 0; y < 10; y++)
    for (let x = 14; x < 34; x++)
      if (rows[y][x] !== '.') egg.push([x, y, rows[y][x]]);
  egg.forEach(([x, y]) => { rows[y][x] = '.'; });
  egg.forEach(([x, y, c]) => {
    const ny = y + dy;
    if (ny >= 0 && ny < SPRITE_H) rows[ny][x] = c;
  });
}

function raiseArm(rows, up) {
  if (!up) return;
  for (let y = 29; y < 40; y++)
    for (let x = 6; x < 14; x++) rows[y][x] = '.';
  const arm = [[6,'S'],[7,'s'],[8,'s'],[9,'s'],[10,'s'],[11,'s']];
  arm.forEach(([x, c], i) => { rows[28 - i][x] = c; });
}

function raiseArmForward(rows) {
  for (let y = 29; y < 40; y++)
    for (let x = 33; x < 42; x++) rows[y][x] = '.';
  const arm = [[38,'S'],[37,'s'],[36,'s'],[35,'s'],[34,'s'],[33,'s']];
  arm.forEach(([x, c], i) => { rows[28 - i][x] = c; });
}

function tuckJump(rows, tuck) {
  clearLegs(rows);
  if (tuck) {
    rectLegs(rows, 18, 52, 5, 3, 'f');
    rectLegs(rows, 26, 52, 5, 3, 'f');
  } else {
    rectLegs(rows, 16, 50, 6, 4, 'f');
    rectLegs(rows, 26, 50, 6, 4, 'f');
  }
}

function rectLegs(rows, lx, ly, lw, lh, c) {
  for (let y = ly; y < ly + lh; y++)
    for (let x = lx; x < lx + lw; x++) rows[y][x] = y < ly + lh - 1 ? 's' : c;
}

function buildAnimFrame(modifier) {
  const rows = cloneRows();
  modifier(rows);
  return rowsToStrings(rows);
}

const ANIM_FRAMES = {
  idle: [
    (r) => { paintLegs(r, 0); bobEgg(r, 0); },
    (r) => { paintLegs(r, 0); bobEgg(r, 1); shiftDress(r, 1); },
    (r) => { paintLegs(r, 0); bobEgg(r, 0); },
    (r) => { paintLegs(r, 0); bobEgg(r, -1); },
  ],
  walk: [
    (r) => { paintLegs(r, 0); swayPonytail(r, 1); bobEgg(r, 1); },
    (r) => { paintLegs(r, 1); swayPonytail(r, 0); shiftDress(r, 1); },
    (r) => { paintLegs(r, 2); swayPonytail(r, -1); bobEgg(r, 0); },
    (r) => { paintLegs(r, 3); swayPonytail(r, 0); shiftDress(r, 1); },
    (r) => { paintLegs(r, 4); swayPonytail(r, -1); bobEgg(r, 1); },
    (r) => { paintLegs(r, 5); swayPonytail(r, 0); shiftDress(r, 1); },
    (r) => { paintLegs(r, 6); swayPonytail(r, 1); bobEgg(r, 0); },
    (r) => { paintLegs(r, 7); swayPonytail(r, 0); shiftDress(r, 1); },
  ],
  wave: [
    (r) => { paintLegs(r, 0); },
    (r) => { paintLegs(r, 0); raiseArm(r, true); },
    (r) => { paintLegs(r, 0); raiseArm(r, true); bobEgg(r, 1); },
    (r) => { paintLegs(r, 0); raiseArm(r, true); },
  ],
  highfive: [
    (r) => { paintLegs(r, 1); raiseArm(r, true); },
    (r) => { paintLegs(r, 0); raiseArmForward(r); bobEgg(r, 1); },
    (r) => { paintLegs(r, 0); raiseArmForward(r); shiftDress(r, 1); },
    (r) => { paintLegs(r, 0); raiseArmForward(r); },
    (r) => { paintLegs(r, 0); raiseArm(r, true); },
  ],
  jump: [
    (r) => { tuckJump(r, false); shiftDress(r, 1); },
    (r) => { tuckJump(r, true); bobEgg(r, -1); },
    (r) => { tuckJump(r, true); },
  ],
  fall: [
    (r) => { paintLegs(r, 2); },
    (r) => { paintLegs(r, 6); },
  ],
};

const ANIM_CACHE = {};
function getAnimFrames(name) {
  if (!ANIM_CACHE[name]) {
    ANIM_CACHE[name] = (ANIM_FRAMES[name] || ANIM_FRAMES.idle).map(fn => buildAnimFrame(fn));
  }
  return ANIM_CACHE[name];
}

function getFrameByAnim(anim, frame) {
  const frames = getAnimFrames(anim);
  return frames[frame % frames.length];
}

function getWalkFrame(frame) { return getFrameByAnim('walk', frame); }
function getWaveFrame(frame) { return getFrameByAnim('wave', frame); }
function getJumpFrame(frame) { return getFrameByAnim('jump', frame); }

function drawPixels(ctx, rows, x, y, scale, flipX, glow) {
  const h = rows.length;
  const w = rows[0].length;

  if (glow) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    for (let py = 0; py < h; py++)
      for (let px = 0; px < w; px++) {
        const ch = rows[py][px];
        if (ch === '.' || !PALETTE[ch]) continue;
        const dx = flipX ? x + (w - 1 - px) * scale : x + px * scale;
        ctx.fillStyle = PALETTE[ch];
        ctx.fillRect(dx, y + py * scale, scale, scale);
      }
    ctx.restore();
  }

  for (let py = 0; py < h; py++)
    for (let px = 0; px < w; px++) {
      const ch = rows[py][px];
      if (ch === '.' || !PALETTE[ch]) continue;
      const dx = flipX ? x + (w - 1 - px) * scale : x + px * scale;
      ctx.fillStyle = PALETTE[ch];
      ctx.fillRect(dx, y + py * scale, scale, scale);
    }
}

function drawSprite(canvas, spriteRows, options = {}) {
  const { scale = PIXEL_SCALE, flipX = false, offsetY = 0, glow = false } = options;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  const rows = typeof spriteRows[0] === 'string'
    ? spriteRows
    : spriteRows;
  const strRows = typeof rows[0] === 'string' ? rows : rowsToStrings(rows);
  drawPixels(ctx, strRows, 0, offsetY * scale, scale, flipX, glow);
}

function drawSpriteToContext(ctx, spriteRows, x, y, options = {}) {
  const { scale = 1, flipX = false, glow = false } = options;
  ctx.imageSmoothingEnabled = false;
  const strRows = typeof spriteRows[0] === 'string' ? spriteRows : rowsToStrings(spriteRows);
  drawPixels(ctx, strRows, x, y, scale, flipX, glow);
}

window.SpriteRenderer = {
  drawSprite,
  drawSpriteToContext,
  getWalkFrame,
  getWaveFrame,
  getJumpFrame,
  getFrameByAnim,
  getAnimFrames,
  HERO_PIXELS,
  HERO_BASE,
  SPRITE_W,
  SPRITE_H,
  PIXEL_SCALE,
  PALETTE,
  ANIM_FRAMES,
};
