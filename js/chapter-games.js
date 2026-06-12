/**
 * 章节小戏 — 每页剧情匹配的轻量小游戏
 */
const ChapterGames = (() => {
  const GW = 320;
  const GH = 180;

  const COLORS = {
    bg1: '#1a1428', bg2: '#0e0a14',
    gold: '#d4b86a', text: '#e8e0d4', mist: '#7a9ab0',
    moss: '#3d5238', mossBad: '#6b3048',
    moon: '#f8eeb8', star: '#f8eeb8',
    wheat: '#c8b878', mirror: '#9ab0c8',
    tear: '#8ab8d8', tearCore: '#c8e8f8',
  };

  const FONT_LABEL = 'bold 13px "ZCOOL KuaiLe", "Microsoft YaHei", sans-serif';
  const FONT_UI = 'bold 12px monospace';
  const FONT_CHIP = 'bold 11px "ZCOOL KuaiLe", "Microsoft YaHei", sans-serif';
  const FONT_TILE = '16px monospace';

  const DEFS = [
    {
      title: '月光拾页',
      tag: '封面 · 小戏',
      desc: '月下半透明的书页飘落。在它们消散前点击接住，凑齐 8 张散落的封面残页。',
      hud: '点击接住书页 · 8 张过关',
    },
    {
      title: '林间迷径',
      tag: '序章 · 小戏',
      desc: '森林石径蜿蜒如迷宫。用方向键穿行地图，只走石径、避开会哭的苔藓，抵达出口 G。',
      hud: '↑↓←→ 走迷宫 · 抵达 G 出口',
    },
    {
      title: '岔路迷踪',
      tag: '第一章 · 小戏',
      desc: '三条小径短暂亮起。井底的声音会呼唤你——跟上那道金光，连对 5 次。',
      hud: '点击亮起的那条路',
    },
    {
      title: '镜中消消',
      tag: '第二章 · 小戏',
      desc: '镜宫里散落着眼、蛋、星与泪。交换相邻方块，三连消除，凑满 120 分。',
      hud: '点击选中方块 · 再点相邻交换',
    },
    {
      title: '接住眼泪',
      tag: '第三章 · 小戏',
      desc: '会哭的苔藓把眼泪洒进麦田。左右移动蛋兔，接住落下的泪珠，共 20 滴。',
      hud: '← → 或拖动 · 接住眼泪',
    },
    {
      title: '书写终章',
      tag: '终章 · 小戏',
      desc: '空白书页等待落笔。按正确顺序点选词片，拼出童话的最后一句。',
      hud: '按顺序点击词片',
    },
  ];

  let overlay, canvas, ctx, menuEl, hudEl, touchEl;
  let hudHp, hudScore, hudKeys;
  let running = false;
  let chapterIdx = 0;
  let game = null;
  let animId = null;
  let pointerHandler = null;
  let pointerMoveHandler = null;
  let keyDownHandler = null;
  let keyUpHandler = null;
  const keys = {};

  function init() {
    overlay = document.getElementById('gameOverlay');
    canvas = document.getElementById('gameCanvas');
    menuEl = document.getElementById('gameMenu');
    hudEl = document.getElementById('gameHud');
    touchEl = document.getElementById('gameTouch');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    canvas.width = GW;
    canvas.height = GH;

    hudHp = hudEl?.querySelector('.game-hud__hp');
    hudScore = hudEl?.querySelector('.game-hud__stars');
    hudKeys = hudEl?.querySelector('.game-hud__keys');

    document.getElementById('gameBtn')?.addEventListener('click', openCurrent);
    document.querySelectorAll('[data-chapter-game]').forEach(btn => {
      btn.addEventListener('click', () => open(parseInt(btn.dataset.chapterGame, 10)));
    });

    document.getElementById('gameStartBtn')?.addEventListener('click', onMenuStart, { capture: true });
    document.getElementById('gameRetryBtn')?.addEventListener('click', onMenuRetry, { capture: true });
    document.getElementById('gameQuitBtn')?.addEventListener('click', onMenuQuit, { capture: true });
    document.getElementById('gameBackBtn')?.addEventListener('click', onMenuQuit, { capture: true });
  }

  function isChapterMode() {
    return overlay?.dataset.mode === 'chapter';
  }

  function openCurrent() {
    const idx = parseInt(document.body.dataset.chapter || '0', 10);
    open(idx);
  }

  function open(idx) {
    if (EggDreamGame?.isRunning?.()) EggDreamGame.close();
    chapterIdx = Math.max(0, Math.min(5, idx));
    const def = DEFS[chapterIdx];

    overlay?.removeAttribute('hidden');
    overlay.dataset.mode = 'chapter';
    document.body.classList.add('game-active');
    touchEl && (touchEl.style.display = 'none');

    document.getElementById('gameMenuTitle').textContent = def.title;
    document.getElementById('gameMenuDesc').textContent = def.desc;
    document.querySelector('.game-menu__tag').textContent = `— ${def.tag} —`;

    document.getElementById('gameStartBtn').style.display = '';
    document.getElementById('gameStartBtn').textContent = '开始小戏';
    document.getElementById('gameResumeBtn').style.display = 'none';
    document.getElementById('gameRetryBtn').style.display = 'none';
    document.getElementById('gameQuitBtn').style.display = '';
    document.getElementById('gameBackBtn').style.display = 'none';

    menuEl?.classList.add('is-visible');
    hudEl?.classList.remove('is-visible');
    running = false;
    game = null;
    drawIdleBg(chapterIdx);
    PixelAudio.sfx.page();
  }

  function close() {
    running = false;
    cancelAnimationFrame(animId);
    animId = null;
    detachPointer();
    detachKeys();
    if (touchEl) {
      touchEl.style.display = '';
      const jump = touchEl.querySelector('.touch-btn--jump');
      if (jump) jump.style.display = '';
    }
    overlay?.setAttribute('hidden', '');
    overlay?.removeAttribute('data-mode');
    document.body.classList.remove('game-active');
    menuEl?.classList.remove('is-visible');
    hudEl?.classList.remove('is-visible');
    touchEl && (touchEl.style.display = '');
    game = null;
  }

  function onMenuStart(e) {
    if (!isChapterMode() || menuEl?.classList.contains('is-visible') === false) return;
    e.stopImmediatePropagation();
    start();
  }

  function onMenuRetry(e) {
    if (!isChapterMode()) return;
    e.stopImmediatePropagation();
    start();
  }

  function onMenuQuit(e) {
    if (!isChapterMode()) return;
    e.stopImmediatePropagation();
    close();
  }

  function start() {
    game = createGame(chapterIdx);
    running = true;
    menuEl?.classList.remove('is-visible');
    hudEl?.classList.add('is-visible');
    attachPointer();
    attachKeys();
    if (game.usesTouchLR && touchEl) {
      touchEl.style.display = 'flex';
      touchEl.querySelector('.touch-btn--jump')?.style && (touchEl.querySelector('.touch-btn--jump').style.display = 'none');
    }
    PixelAudio.sfx.transition();
    loop();
  }

  function endWin() {
    running = false;
    cancelAnimationFrame(animId);
    detachPointer();
    detachKeys();
    menuEl?.classList.add('is-visible');
    hudEl?.classList.remove('is-visible');

    const winMsgs = [
      '封面拼齐了。故事愿意被翻开。',
      '你没有踩碎任何苔藓。森林记住了你的脚步。',
      '你听见了井底的呼唤，从未走错岔路。',
      '镜中碎片归位。少女在另一侧对你笑了。',
      '二十滴眼泪接住。梦不再遗落。',
      '最后一笔落下。童话没有结局，只有翻页的人。',
    ];

    document.getElementById('gameMenuTitle').textContent = '✦ 小戏完成';
    document.getElementById('gameMenuDesc').textContent = winMsgs[chapterIdx];
    document.getElementById('gameStartBtn').style.display = 'none';
    document.getElementById('gameRetryBtn').style.display = '';
    document.getElementById('gameRetryBtn').textContent = '再玩一次';
    document.getElementById('gameQuitBtn').style.display = '';
    PixelAudio.sfx.secret();

    if (window.StoryInteractions?.collectFragment) {
      StoryInteractions.collectFragment(chapterIdx % 5);
    }
  }

  function endLose(msg) {
    running = false;
    cancelAnimationFrame(animId);
    detachPointer();
    detachKeys();
    menuEl?.classList.add('is-visible');
    hudEl?.classList.remove('is-visible');

    document.getElementById('gameMenuTitle').textContent = '再试一次？';
    document.getElementById('gameMenuDesc').textContent = msg || '童话里的小挫折，翻页继续。';
    document.getElementById('gameStartBtn').style.display = 'none';
    document.getElementById('gameRetryBtn').style.display = '';
    document.getElementById('gameRetryBtn').textContent = '再来一次';
    document.getElementById('gameQuitBtn').style.display = '';
  }

  function loop() {
    if (!running || !game) return;
    game.frame = (game.frame || 0) + 1;
    game.update();
    game.render(ctx);
    updateHud();

    if (game.won) endWin();
    else if (game.lost) endLose(game.loseMsg);

    animId = requestAnimationFrame(loop);
  }

  function updateHud() {
    if (!game || !hudEl) return;
    const def = DEFS[chapterIdx];
    hudHp.textContent = game.hp != null ? '♥'.repeat(game.hp) + '♡'.repeat(Math.max(0, 3 - game.hp)) : '♥♥♥';
    hudScore.textContent = game.scoreText || '';
    hudKeys.textContent = def.hud;
  }

  function attachPointer() {
    detachPointer();
    pointerHandler = e => {
      if (!running || !game?.onClick) return;
      const { x, y } = canvasPoint(e);
      game.onClick(x, y);
    };
    pointerMoveHandler = e => {
      if (!running || !game?.onPointerMove) return;
      const { x } = canvasPoint(e);
      game.onPointerMove(x);
    };
    canvas.addEventListener('pointerdown', pointerHandler);
    if (game?.onPointerMove) canvas.addEventListener('pointermove', pointerMoveHandler);
  }

  function detachPointer() {
    if (pointerHandler) canvas.removeEventListener('pointerdown', pointerHandler);
    if (pointerMoveHandler) canvas.removeEventListener('pointermove', pointerMoveHandler);
    pointerHandler = pointerMoveHandler = null;
  }

  function drawIdleBg(idx) {
    if (!ctx) return;
    fillChapterBg(ctx, idx);
    ctx.fillStyle = 'rgba(14,10,20,0.55)';
    ctx.fillRect(0, 0, GW, GH);
    ctx.fillStyle = COLORS.gold;
    ctx.font = FONT_UI;
    ctx.textAlign = 'center';
    ctx.fillText(DEFS[idx].title, GW / 2, GH / 2);
    ctx.textAlign = 'left';
  }

  function fillChapterBg(ctx, idx) {
    const g = ctx.createLinearGradient(0, 0, 0, GH);
    g.addColorStop(0, COLORS.bg1);
    g.addColorStop(1, COLORS.bg2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, GW, GH);

    const accents = ['moon', 'forest', 'mist', 'castle', 'field', 'dawn'];
    const kind = accents[idx] || 'moon';
    ctx.globalAlpha = 0.25;
    if (kind === 'moon') {
      ctx.fillStyle = COLORS.moon;
      ctx.beginPath();
      ctx.arc(GW / 2, 50, 28, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'forest') {
      ctx.fillStyle = COLORS.moss;
      for (let i = 0; i < 8; i++) ctx.fillRect(20 + i * 36, 100, 12, 50);
    } else if (kind === 'mist') {
      ctx.fillStyle = COLORS.mist;
      for (let i = 0; i < 5; i++) ctx.fillRect(30 + i * 55, 70 + (i % 2) * 20, 40, 8);
    } else if (kind === 'castle') {
      ctx.fillStyle = '#3a3048';
      ctx.fillRect(120, 60, 80, 90);
      ctx.fillRect(140, 40, 40, 24);
    } else if (kind === 'field') {
      ctx.fillStyle = COLORS.wheat;
      for (let i = 0; i < 12; i++) ctx.fillRect(16 + i * 24, 90, 4, 40);
    } else {
      ctx.fillStyle = COLORS.gold;
      for (let i = 0; i < 20; i++) {
        ctx.fillRect((i * 53) % GW, (i * 29) % 80, 2, 2);
      }
    }
    ctx.globalAlpha = 1;
  }

  function createGame(idx) {
    const makers = [makeMoonPages, makeForestMaze, makePathChoice, makeMirrorMatch3, makeTearCatch, makeEndingWrite];
    return makers[idx]();
  }

  function canvasPoint(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (GW / rect.width),
      y: (e.clientY - rect.top) * (GH / rect.height),
    };
  }

  function attachKeys() {
    detachKeys();
    if (!game?.usesKeys) return;
    keyDownHandler = e => {
      if (!running) return;
      keys[e.code] = true;
      game.onKey?.(e.code, true);
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS'].includes(e.code)) {
        e.preventDefault();
      }
    };
    keyUpHandler = e => { keys[e.code] = false; game.onKey?.(e.code, false); };
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    touchEl?.querySelectorAll('[data-game-key]').forEach(btn => {
      const code = btn.dataset.gameKey;
      if (code === 'Space') return;
      const down = e => { e.preventDefault(); keys[code] = true; btn.classList.add('is-pressed'); };
      const up = () => { keys[code] = false; btn.classList.remove('is-pressed'); };
      btn.addEventListener('pointerdown', down);
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointerleave', up);
      btn._cgCleanup = () => {
        btn.removeEventListener('pointerdown', down);
        btn.removeEventListener('pointerup', up);
        btn.removeEventListener('pointerleave', up);
      };
    });
  }

  function detachKeys() {
    if (keyDownHandler) window.removeEventListener('keydown', keyDownHandler);
    if (keyUpHandler) window.removeEventListener('keyup', keyUpHandler);
    keyDownHandler = keyUpHandler = null;
    Object.keys(keys).forEach(k => { keys[k] = false; });
    touchEl?.querySelectorAll('[data-game-key]').forEach(btn => btn._cgCleanup?.());
  }

  /* —— 封面：月光拾页 —— */
  function makeMoonPages() {
    const pages = [];
    let spawnT = 0;
    let caught = 0;
    const need = 8;

    return {
      hp: 3, frame: 0, won: false, lost: false,
      scoreText: `残页 ${caught}/${need}`,
      loseMsg: '书页消散在月光里……再试一次吧。',
      update() {
        spawnT--;
        if (spawnT <= 0) {
          spawnT = 28 + Math.random() * 20;
          pages.push({
            x: 24 + Math.random() * (GW - 48),
            y: -12,
            vy: 0.55 + Math.random() * 0.35,
            life: 220,
            rot: Math.random() * 0.5,
          });
        }
        pages.forEach(p => {
          p.y += p.vy;
          p.life--;
        });
        for (let i = pages.length - 1; i >= 0; i--) {
          if (pages[i].life <= 0 && pages[i].y > 20) {
            pages.splice(i, 1);
            this.hp--;
            if (this.hp <= 0) this.lost = true;
          } else if (pages[i].y > GH + 20) {
            pages.splice(i, 1);
          }
        }
        if (caught >= need) this.won = true;
        this.scoreText = `残页 ${caught}/${need}`;
      },
      onClick(x, y) {
        for (let i = pages.length - 1; i >= 0; i--) {
          const p = pages[i];
          if (Math.hypot(x - p.x, y - p.y) < 18) {
            pages.splice(i, 1);
            caught++;
            PixelAudio.sfx.collect();
            return;
          }
        }
      },
      render(ctx) {
        fillChapterBg(ctx, 0);
        pages.forEach(p => {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = Math.min(1, p.life / 80);
          ctx.fillStyle = COLORS.moon;
          ctx.fillRect(-8, -10, 16, 20);
          ctx.strokeStyle = COLORS.gold;
          ctx.strokeRect(-8, -10, 16, 20);
          ctx.restore();
        });
        drawLabel(ctx, '接住飘落的封面残页', 8);
      },
    };
  }

  /* —— 序章：林间迷径（方向键走迷宫） —— */
  function makeForestMaze() {
    const COLS = 18;
    const MAP = [
      '##################',
      '#G..M........M...#',
      '#.##.##.##.##.##.#',
      '#.#.M..#..M..#..##',
      '#.#.##.##..#.##.##',
      '#.#......#.....#.#',
      '#.#####.##.#####.#',
      '#...M..........S.#',
      '##################',
    ].map(row => row.padEnd(COLS, '#').slice(0, COLS));

    const TILE = 14;
    const ROWS = MAP.length;
    const OX = Math.floor((GW - COLS * TILE) / 2);
    const OY = 22;

    const grid = MAP.map(row => row.split(''));
    const player = { c: 0, r: 0 };
    let moveLock = 0;
    let steps = 0;

    grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 'S') {
          player.c = c;
          player.r = r;
          row[c] = '.';
        }
      });
    });

    function tryMove(dx, dy, self) {
      if (moveLock > 0) return;
      const nc = player.c + dx;
      const nr = player.r + dy;
      const cell = grid[nr]?.[nc];
      if (!cell || cell === '#') return;

      moveLock = 11;
      player.c = nc;
      player.r = nr;
      steps++;

      if (cell === 'M') {
        self.hp--;
        PixelAudio.sfx.click();
        if (self.hp <= 0) self.lost = true;
      } else if (cell === 'G') {
        self.won = true;
        PixelAudio.sfx.collect();
      } else {
        PixelAudio.sfx.click();
      }
      self.scoreText = `步数 ${steps} · 目标 G`;
    }

    function readInput(self) {
      if (keys.ArrowUp || keys.KeyW) tryMove(0, -1, self);
      else if (keys.ArrowDown || keys.KeyS) tryMove(0, 1, self);
      else if (keys.ArrowLeft || keys.KeyA) tryMove(-1, 0, self);
      else if (keys.ArrowRight || keys.KeyD) tryMove(1, 0, self);
    }

    function handlePadClick(x, y, self) {
      const pad = [
        { dx: 0, dy: -1, x: GW - 52, y: GH - 72, w: 22, h: 18 },
        { dx: -1, dy: 0, x: GW - 76, y: GH - 52, w: 22, h: 18 },
        { dx: 1, dy: 0, x: GW - 28, y: GH - 52, w: 22, h: 18 },
        { dx: 0, dy: 1, x: GW - 52, y: GH - 32, w: 22, h: 18 },
      ];
      for (const p of pad) {
        if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) {
          tryMove(p.dx, p.dy, self);
          return true;
        }
      }
      return false;
    }

    return {
      usesKeys: true,
      hp: 3,
      frame: 0,
      won: false,
      lost: false,
      scoreText: '步数 0 · 目标 G',
      loseMsg: '踩到苔藓了……它哭得很伤心。再试一次吧。',
      update() {
        if (moveLock > 0) moveLock--;
        readInput(this);
      },
      onClick(x, y) {
        handlePadClick(x, y, this);
      },
      render(ctx) {
        fillChapterBg(ctx, 1);

        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const cell = grid[r][c];
            const x = OX + c * TILE;
            const y = OY + r * TILE;
            if (cell === '#') {
              ctx.fillStyle = '#1e2830';
              ctx.fillRect(x, y, TILE, TILE);
              ctx.fillStyle = '#2a4038';
              ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
            } else if (cell === 'M') {
              ctx.fillStyle = '#2a4030';
              ctx.fillRect(x, y, TILE, TILE);
              ctx.fillStyle = COLORS.mossBad;
              ctx.fillRect(x + 3, y + 5, TILE - 6, TILE - 8);
              ctx.fillStyle = '#8b5068';
              ctx.fillRect(x + 5, y + 3, 3, 3);
            } else if (cell === 'G') {
              ctx.fillStyle = '#3a4838';
              ctx.fillRect(x, y, TILE, TILE);
              ctx.fillStyle = COLORS.gold;
              ctx.font = FONT_CHIP;
              ctx.textAlign = 'center';
              ctx.fillText('G', x + TILE / 2, y + TILE / 2 + 4);
            } else {
              ctx.fillStyle = '#2a4030';
              ctx.fillRect(x, y, TILE, TILE);
              ctx.fillStyle = '#3d5238';
              ctx.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);
            }
          }
        }

        const px = OX + player.c * TILE + TILE / 2;
        const py = OY + player.r * TILE + TILE / 2;
        ctx.fillStyle = COLORS.gold;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0e0a14';
        ctx.fillRect(px - 2, py - 3, 2, 2);
        ctx.fillRect(px + 1, py - 3, 2, 2);

        ctx.textAlign = 'left';
        drawPad(ctx);
        drawLabel(ctx, '↑↓←→ 走石径 · 踩 M 扣血 · 到达 G', 4);
      },
    };
  }

  function drawPad(ctx) {
    const cx = GW - 52;
    const cy = GH - 52;
    const btns = [
      { label: '↑', x: cx - 11, y: cy - 22 },
      { label: '←', x: cx - 33, y: cy - 2 },
      { label: '→', x: cx + 11, y: cy - 2 },
      { label: '↓', x: cx - 11, y: cy + 18 },
    ];
    btns.forEach(b => {
      ctx.fillStyle = 'rgba(58,48,72,0.85)';
      ctx.fillRect(b.x, b.y, 22, 18);
      ctx.strokeStyle = COLORS.mist;
      ctx.strokeRect(b.x, b.y, 22, 18);
      ctx.fillStyle = COLORS.text;
      ctx.font = FONT_UI;
      ctx.textAlign = 'center';
      ctx.fillText(b.label, b.x + 11, b.y + 13);
    });
    ctx.textAlign = 'left';
  }

  /* —— 第一章：岔路迷踪 —— */
  function makePathChoice() {
    const paths = [
      { id: 'castle', x: 50, label: '城堡', icon: '🏰' },
      { id: 'well', x: 130, label: '古井', icon: '🕳' },
      { id: 'field', x: 210, label: '麦田', icon: '🌾' },
    ];
    let round = 0;
    let phase = 'wait';
    let timer = 60;
    let target = 1;
    let flash = 0;

    return {
      hp: 3, frame: 0, won: false, lost: false,
      scoreText: `连对 ${round}/5`,
      loseMsg: '迷雾遮住了岔路……再听一次井底的呼唤。',
      update() {
        timer--;
        if (phase === 'wait' && timer <= 0) {
          target = Math.floor(Math.random() * 3);
          phase = 'flash';
          flash = 90;
          timer = 0;
        }
        if (phase === 'flash') {
          flash--;
          if (flash <= 0) {
            phase = 'wait';
            timer = 40;
            this.hp--;
            if (this.hp <= 0) this.lost = true;
          }
        }
        this.scoreText = `连对 ${round}/5`;
      },
      onClick(x) {
        if (phase !== 'flash') return;
        const hit = paths.findIndex((p, i) => Math.abs(x - (p.x + 30)) < 36);
        if (hit < 0) return;
        phase = 'wait';
        timer = 50;
        if (hit === target) {
          round++;
          PixelAudio.sfx.collect();
          if (round >= 5) this.won = true;
        } else {
          this.hp--;
          PixelAudio.sfx.click();
          if (this.hp <= 0) this.lost = true;
        }
      },
      render(ctx) {
        fillChapterBg(ctx, 2);
        paths.forEach((p, i) => {
          const lit = phase === 'flash' && i === target;
          ctx.fillStyle = lit ? COLORS.gold : '#3a3048';
          ctx.fillRect(p.x, 70, 60, 70);
          ctx.fillStyle = lit ? '#0e0a14' : COLORS.text;
          ctx.font = FONT_TILE;
          ctx.fillText(p.icon, p.x + 16, 108);
          ctx.font = FONT_CHIP;
          ctx.fillText(p.label, p.x + 6, 132);
          if (lit) {
            ctx.strokeStyle = COLORS.moon;
            ctx.strokeRect(p.x - 2, 68, 64, 74);
          }
        });
        const hint = phase === 'flash' ? '快！点击亮起的路' : '听……井底在呼唤';
        drawLabel(ctx, hint, 8);
      },
    };
  }

  /* —— 第二章：镜中消消 —— */
  function makeMirrorMatch3() {
    const COLS = 6;
    const ROWS = 6;
    const CELL = 44;
    const OX = (GW - COLS * CELL) / 2;
    const OY = 30;
    const TARGET = 120;
    const TILE = [
      { icon: '◉', bg: '#4a5870', fg: '#c8d8f0' },
      { icon: '◇', bg: '#3a4860', fg: '#e8f0ff' },
      { icon: '✦', bg: '#5a5040', fg: '#f8eeb8' },
      { icon: '蛋', bg: '#5a4830', fg: '#f0c848' },
      { icon: '💧', bg: '#3a5060', fg: '#9ac8e8' },
    ];

    let grid = [];
    let selected = null;
    let score = 0;
    let lock = false;
    let popT = 0;
    let popSet = new Set();

    const idx = (r, c) => r * COLS + c;

    function randType() {
      return Math.floor(Math.random() * TILE.length);
    }

    function wouldMatch(g, r, c, t) {
      if (c >= 2 && g[idx(r, c - 1)] === t && g[idx(r, c - 2)] === t) return true;
      if (r >= 2 && g[idx(r - 1, c)] === t && g[idx(r - 2, c)] === t) return true;
      return false;
    }

    function buildGrid() {
      const g = [];
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          let t;
          do { t = randType(); } while (wouldMatch(g, r, c, t));
          g.push(t);
        }
      }
      return g;
    }

    function findMatches(g) {
      const set = new Set();
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 2; c++) {
          const t = g[idx(r, c)];
          if (t < 0) continue;
          if (g[idx(r, c + 1)] === t && g[idx(r, c + 2)] === t) {
            for (let k = c; k < COLS && g[idx(r, k)] === t; k++) set.add(idx(r, k));
          }
        }
      }
      for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS - 2; r++) {
          const t = g[idx(r, c)];
          if (t < 0) continue;
          if (g[idx(r + 1, c)] === t && g[idx(r + 2, c)] === t) {
            for (let k = r; k < ROWS && g[idx(k, c)] === t; k++) set.add(idx(k, c));
          }
        }
      }
      return set;
    }

    function settle(g) {
      for (let c = 0; c < COLS; c++) {
        const col = [];
        for (let r = ROWS - 1; r >= 0; r--) {
          const v = g[idx(r, c)];
          if (v >= 0) col.push(v);
        }
        let r = ROWS - 1;
        col.forEach(v => { g[idx(r, c)] = v; r--; });
        while (r >= 0) {
          let t;
          do { t = randType(); } while (r >= 2 && g[idx(r + 1, c)] === t && g[idx(r + 2, c)] === t);
          g[idx(r, c)] = t;
          r--;
        }
      }
    }

    function resolveMatches(self) {
      const matched = findMatches(grid);
      if (!matched.size) {
        lock = false;
        if (score >= TARGET) self.won = true;
        return;
      }
      popSet = matched;
      popT = 14;
      score += matched.size * 10;
      PixelAudio.sfx.collect();
      self.scoreText = `得分 ${score}/${TARGET}`;
      matched.forEach(i => { grid[i] = -1; });
      setTimeout(() => {
        if (!running) return;
        settle(grid);
        popSet = new Set();
        resolveMatches(self);
      }, 180);
    }

    grid = buildGrid();

    return {
      hp: null, frame: 0, won: false, lost: false,
      scoreText: `得分 ${score}/${TARGET}`,
      loseMsg: '',
      update() {
        if (popT > 0) popT--;
      },
      onClick(x, y) {
        if (lock) return;
        const c = Math.floor((x - OX) / CELL);
        const r = Math.floor((y - OY) / CELL);
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
        const i = idx(r, c);
        if (grid[i] < 0) return;

        if (selected == null) {
          selected = { r, c };
          PixelAudio.sfx.click();
          return;
        }

        const dr = Math.abs(selected.r - r);
        const dc = Math.abs(selected.c - c);
        if (dr + dc !== 1) {
          selected = { r, c };
          PixelAudio.sfx.click();
          return;
        }

        const a = idx(selected.r, selected.c);
        const b = i;
        lock = true;
        [grid[a], grid[b]] = [grid[b], grid[a]];
        const matched = findMatches(grid);
        if (!matched.size) {
          [grid[a], grid[b]] = [grid[b], grid[a]];
          lock = false;
          PixelAudio.sfx.click();
        } else {
          resolveMatches(this);
          PixelAudio.sfx.collect();
        }
        selected = null;
      },
      render(ctx) {
        fillChapterBg(ctx, 3);
        ctx.fillStyle = 'rgba(42,48,64,0.85)';
        ctx.fillRect(OX - 4, OY - 4, COLS * CELL + 8, ROWS * CELL + 8);
        ctx.strokeStyle = COLORS.mirror;
        ctx.strokeRect(OX - 4, OY - 4, COLS * CELL + 8, ROWS * CELL + 8);

        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const i = idx(r, c);
            const t = grid[i];
            if (t < 0) continue;
            const x = OX + c * CELL + 3;
            const y = OY + r * CELL + 3;
            const tile = TILE[t];
            const sel = selected && selected.r === r && selected.c === c;
            const pop = popSet.has(i) && popT > 0;

            ctx.fillStyle = pop ? COLORS.gold : tile.bg;
            ctx.fillRect(x, y, CELL - 6, CELL - 6);
            if (sel) {
              ctx.strokeStyle = COLORS.gold;
              ctx.lineWidth = 2;
              ctx.strokeRect(x - 1, y - 1, CELL - 4, CELL - 4);
              ctx.lineWidth = 1;
            }
            ctx.fillStyle = tile.fg;
            ctx.font = FONT_TILE;
            ctx.textAlign = 'center';
            ctx.fillText(tile.icon, x + (CELL - 6) / 2, y + (CELL - 2) / 2);
          }
        }
        ctx.textAlign = 'left';
        drawLabel(ctx, '交换相邻方块 · 三连消除', 6);
      },
    };
  }

  /* —— 第三章：接住眼泪 —— */
  function makeTearCatch() {
    const player = { x: GW / 2, w: 56, h: 14 };
    let tears = [];
    let caught = 0;
    const need = 20;
    let spawnT = 0;
    let miss = 0;
    const maxMiss = 5;

    return {
      usesKeys: true,
      usesTouchLR: true,
      hp: 3,
      frame: 0,
      won: false,
      lost: false,
      scoreText: `眼泪 ${caught}/${need}`,
      loseMsg: '太多眼泪落地了……苔藓还在哭。',
      update() {
        if (keys.ArrowLeft || keys.KeyA) player.x -= 4.2;
        if (keys.ArrowRight || keys.KeyD) player.x += 4.2;
        player.x = Math.max(player.w / 2 + 8, Math.min(GW - player.w / 2 - 8, player.x));

        spawnT--;
        if (spawnT <= 0) {
          spawnT = 22 + Math.random() * 18;
          tears.push({
            x: 20 + Math.random() * (GW - 40),
            y: -8,
            vy: 1.2 + Math.random() * 0.8,
            r: 5 + Math.random() * 3,
          });
        }

        const catchY = GH - 28;
        tears.forEach(t => { t.y += t.vy; });

        for (let i = tears.length - 1; i >= 0; i--) {
          const t = tears[i];
          if (t.y >= catchY - 6 && t.y <= catchY + 10
              && Math.abs(t.x - player.x) < player.w / 2 + t.r) {
            tears.splice(i, 1);
            caught++;
            PixelAudio.sfx.collect();
            if (caught >= need) this.won = true;
          } else if (t.y > GH + 12) {
            tears.splice(i, 1);
            miss++;
            if (miss >= maxMiss) this.lost = true;
          }
        }
        this.scoreText = `眼泪 ${caught}/${need}`;
        this.hp = Math.max(0, 3 - Math.floor(miss / 2));
      },
      onPointerMove(x) {
        player.x = Math.max(player.w / 2 + 8, Math.min(GW - player.w / 2 - 8, x));
      },
      render(ctx) {
        fillChapterBg(ctx, 4);

        tears.forEach(t => drawTear(ctx, t.x, t.y, t.r));

        const px = player.x - player.w / 2;
        const py = GH - 32;
        ctx.fillStyle = '#5a4868';
        ctx.fillRect(px, py, player.w, player.h);
        ctx.fillStyle = COLORS.gold;
        ctx.fillRect(px + 4, py - 4, player.w - 8, 4);
        ctx.fillStyle = COLORS.wheat;
        ctx.font = FONT_CHIP;
        ctx.textAlign = 'center';
        ctx.fillText('蛋兔', player.x, py - 10);
        ctx.textAlign = 'left';

        drawLabel(ctx, '← → 移动 · 接住苔藓的眼泪', 6);
      },
    };
  }

  function drawTear(ctx, x, y, r) {
    ctx.fillStyle = COLORS.tear;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.7, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.tearCore;
    ctx.fillRect(x - 1, y - r * 0.5, 2, 3);
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - r * 0.3, y - r * 0.35, 2, 2);
    ctx.globalAlpha = 1;
  }

  /* —— 终章：书写终章 —— */
  function makeEndingWrite() {
    const words = ['故事', '没有', '结局', '只有', '翻页的人', '愿意', '再读一遍'];
    let next = 0;
    const chips = words.map((w, i) => ({
      word: w,
      x: 16 + (i % 3) * 98,
      y: 96 + Math.floor(i / 3) * 40,
      w: 88,
      h: 34,
      used: false,
    }));

    return {
      hp: 3, frame: 0, won: false, lost: false,
      scoreText: `落笔 ${next}/${words.length}`,
      loseMsg: '笔迹乱了……童话的句号还没写好。',
      update() {},
      onClick(x, y) {
        const chip = chips.find(c => !c.used && x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h);
        if (!chip) return;
        if (chip.word === words[next]) {
          chip.used = true;
          next++;
          PixelAudio.sfx.collect();
          if (next >= words.length) this.won = true;
        } else {
          this.hp--;
          PixelAudio.sfx.click();
          if (this.hp <= 0) this.lost = true;
        }
        this.scoreText = `落笔 ${next}/${words.length}`;
      },
      render(ctx) {
        fillChapterBg(ctx, 5);
        ctx.fillStyle = 'rgba(248,238,184,0.08)';
        ctx.fillRect(40, 30, 240, 50);
        ctx.strokeStyle = COLORS.gold;
        ctx.strokeRect(40, 30, 240, 50);

        const written = words.slice(0, next).join('');
        ctx.fillStyle = COLORS.gold;
        ctx.font = FONT_CHIP;
        ctx.textAlign = 'center';
        wrapText(ctx, written || '……', GW / 2, 54, 220, 14);
        ctx.textAlign = 'left';

        chips.forEach(c => {
          if (c.used) return;
          ctx.fillStyle = '#3a3048';
          ctx.fillRect(c.x, c.y, c.w, c.h);
          ctx.strokeStyle = COLORS.mist;
          ctx.strokeRect(c.x, c.y, c.w, c.h);
          ctx.fillStyle = COLORS.text;
          ctx.font = FONT_CHIP;
          ctx.textAlign = 'center';
          ctx.fillText(c.word, c.x + c.w / 2, c.y + 22);
        });
        ctx.textAlign = 'left';
        drawLabel(ctx, '按顺序点选词片', 8);
      },
    };
  }

  function drawLabel(ctx, text, y) {
    ctx.fillStyle = 'rgba(14,10,20,0.82)';
    ctx.fillRect(0, y - 2, GW, 18);
    ctx.fillStyle = COLORS.mist;
    ctx.font = FONT_LABEL;
    ctx.textAlign = 'center';
    ctx.fillText(text, GW / 2, y + 12);
    ctx.textAlign = 'left';
  }

  function wrapText(ctx, text, x, y, maxW, lineH) {
    let line = '';
    let ly = y;
    for (const ch of text) {
      const test = line + ch;
      if (ctx.measureText(test).width > maxW) {
        ctx.fillText(line, x, ly);
        line = ch;
        ly += lineH;
      } else line = test;
    }
    if (line) ctx.fillText(line, x, ly);
  }

  return {
    init,
    open,
    openCurrent,
    close,
    isRunning: () => running || isChapterMode() && !overlay?.hasAttribute('hidden'),
  };
})();

window.ChapterGames = ChapterGames;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ChapterGames.init());
} else {
  ChapterGames.init();
}
