const StoryInteractions = (() => {
  const DIALOGUES = [
    '……别盯着我的眼睛。蛋会害羞的。',
    '你听见了吗？风里有翻书的声音。',
    '我不是迷路了。是故事需要一个人把它走完。',
    '兔子说，恐惧长得像一只没有脸的王。',
    '每一百年醒来一次，其实挺累的。但故事总得有人读。',
    '你收集的碎片……是某页童话掉落的字。',
    '嘘。井底有人在念你的名字。',
  ];

  const PATH_TEXTS = {
    castle: '她踏上左径。城堡倒悬在天上，石阶向上延伸，却通向更深的地方。风从下方吹来，蛋上的兔子捂住了耳朵——「那里住着上一个写故事的人。」',
    well: '蛋上的兔子轻轻动了动耳朵。她选择了中间。不是因为她勇敢，而是因为井底的声音，叫了她的名字。',
    field: '右径的麦田在黄昏里沙沙作响。每一株麦穗都是一行未写完的句子。兔子说：「要是我有腿，我早就跑过去了。」她还是去了。脚步比心跳慢半拍。',
  };

  const SECRETS = {
    mushroom: { text: '蘑菇伞下藏着一行小字：「有毒的童话，才记得住。」', fragment: 0 },
    well: { text: '井壁回响：「……回来吧，写故事的人。」', fragment: 1 },
    mirror: { text: '镜中倒影眨了眨眼——比你快半秒。', fragment: 2 },
    wheat: { text: '麦芒划过指尖，像翻过一页粗糙的旧纸。', fragment: 3 },
    moon: { text: '月亮缺了一角。那一角变成了蛋。', fragment: 4 },
  };

  const collected = new Set();
  let selectedPath = 'well';
  let heroAnim = 'idle';
  let heroAnimUntil = 0;
  let heroFacingProp = null;
  let konamiIdx = 0;
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

  const els = {
    heroHitbox: document.getElementById('heroHitbox'),
    dialogueBubble: document.getElementById('dialogueBubble'),
    dialogueText: document.getElementById('dialogueText'),
    secretToast: document.getElementById('secretToast'),
    secretToastText: document.getElementById('secretToastText'),
    fragmentBar: document.getElementById('fragmentBar'),
    pathChoices: document.getElementById('pathChoices'),
    pathResultText: document.getElementById('pathResultText'),
    startBtn: document.getElementById('startBtn'),
    coverMoon: document.getElementById('coverMoon'),
    soundBtn: document.getElementById('soundBtn'),
    restartBtn: document.getElementById('restartBtn'),
    shareBtn: document.getElementById('shareBtn'),
    flashOverlay: document.getElementById('flashOverlay'),
    secretEnding: document.getElementById('secretEnding'),
    chapterNav: document.getElementById('chapterNav'),
    mirrorProp: document.getElementById('mirrorProp'),
    coverTitle: document.getElementById('coverTitle'),
  };

  function flash(color = 'rgba(248,238,184,0.25)') {
    const f = els.flashOverlay;
    if (!f) return;
    f.style.background = color;
    f.classList.add('is-active');
    setTimeout(() => f.classList.remove('is-active'), 400);
  }

  function shakeHero() {
    const canvas = document.getElementById('heroCanvas');
    canvas?.classList.add('is-shake');
    setTimeout(() => canvas?.classList.remove('is-shake'), 500);
  }

  function showDialogue(text) {
    els.dialogueText.textContent = text;
    els.dialogueBubble.hidden = false;
    els.dialogueBubble.classList.remove('is-pop');
    void els.dialogueBubble.offsetWidth;
    els.dialogueBubble.classList.add('is-pop');
    PixelAudio.sfx.dialogue();
    heroAnim = 'wave';
    heroAnimUntil = Date.now() + 1200;
    clearTimeout(showDialogue._t);
    showDialogue._t = setTimeout(() => { els.dialogueBubble.hidden = true; }, 3500);
  }

  function showSecret(text) {
    els.secretToastText.textContent = text;
    els.secretToast.hidden = false;
    els.secretToast.classList.remove('is-show');
    void els.secretToast.offsetWidth;
    els.secretToast.classList.add('is-show');
    PixelAudio.sfx.secret();
    clearTimeout(showSecret._t);
    showSecret._t = setTimeout(() => { els.secretToast.hidden = true; }, 3200);
  }

  function collectFragment(idx) {
    if (collected.has(idx)) return;
    collected.add(idx);
    const slot = els.fragmentBar?.querySelector(`[data-idx="${idx}"]`);
    slot?.classList.add('is-collected');
    PixelAudio.sfx.collect();
    particles?.burst?.(window.innerWidth * 0.5, window.innerHeight * 0.4, '#F8EEB8');

    if (collected.size === 5) {
      els.secretEnding?.removeAttribute('hidden');
      showSecret('全部碎片集齐！隐藏结局已浮现……');
    }
  }

  function triggerSecret(key) {
    const s = SECRETS[key];
    if (!s) return;
    const el = document.querySelector(`[data-secret="${key}"]`)
      || (key === 'moon' ? els.coverMoon : null);
    PropFx?.play?.(key, el, true);
    showSecret(s.text);
    collectFragment(s.fragment);
    shakeHero();
  }

  function targetId(el, kind) {
    if (!el) return kind;
    if (kind === 'sticker') return `sticker:${el.dataset.cuteFx || 'note'}`;
    if (kind === 'moon') return 'moon';
    return `prop:${el.dataset.secret || el.id || kind}`;
  }

  function currentChapter() {
    return parseInt(document.body.dataset.chapter || '0', 10);
  }

  function setFacingToward(el) {
    const layer = document.getElementById('heroLayer');
    if (!layer || !el) return;
    const hr = layer.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    heroFacingProp = er.left + er.width / 2 >= hr.left + hr.width / 2 ? 'right' : 'left';
  }

  function waveNear(el, kind) {
    heroAnim = 'wave';
    heroAnimUntil = Date.now() + 1400;
    setFacingToward(el);

    const ch = currentChapter();
    ProximityStories?.record?.(ch, targetId(el, kind), 'wave');

    if (kind === 'sticker' && el?.dataset?.cuteFx) {
      const msgs = {
        moss: '……别踩苔藓，它在哭呢。',
        egg: '梦遗落在麦芒之间。',
        star: '星星认得蛋兔的路。',
        reader: '她向读者挥了挥手。',
        retry: '愿意再读一遍吗？',
      };
      const m = msgs[el.dataset.cuteFx];
      if (m && CuteEffects.rectCenter) {
        const { x, y } = CuteEffects.rectCenter(el);
        CuteEffects.showPop(x, y - 24, m, '#d4b86a');
      }
      PixelAudio.sfx.dialogue();
    } else {
      PixelAudio.sfx.dialogue();
    }
    el?.classList.add('is-hero-nearby');
    setTimeout(() => el?.classList.remove('is-hero-nearby'), 1500);
  }

  function highfiveNear(el, kind, secretKey) {
    heroAnim = 'highfive';
    heroAnimUntil = Date.now() + 1600;
    setFacingToward(el);

    const ch = currentChapter();
    ProximityStories?.record?.(ch, targetId(el, kind), 'highfive');

    const layer = document.getElementById('heroLayer');
    const hr = layer?.getBoundingClientRect();
    const er = el?.getBoundingClientRect();
    if (hr && er) {
      CuteEffects.highfiveSpark?.(
        hr.left + hr.width * 0.5,
        hr.top + hr.height * 0.35,
        er.left + er.width / 2,
        er.top + er.height / 2,
      );
    }

    PropFx?.highfive?.(secretKey || el?.dataset?.secret || el?.dataset?.cuteFx, el);

    const msgs = {
      mushroom: '蘑菇伞抬起来，和她轻轻碰了碰。',
      well: '井口荡起涟漪，像在回握她的手。',
      mirror: '镜面凉了一瞬。镜中少女与她击掌。',
      wheat: '麦浪弯下腰，与她击掌般相碰。',
      moon: '月光落在掌心，温温的。',
      moss: '苔藓不哭了。它与她击掌，很软。',
      egg: '蛋里的兔子探出头，轻轻碰了碰她。',
      star: '星光落在指尖，啪的一声。',
      reader: '她与读者击掌。书页沙沙响。',
      retry: '再读一遍的约定，落在掌心。',
    };
    const key = secretKey || el?.dataset?.secret || el?.dataset?.cuteFx;
    const m = msgs[key];
    if (m && el && CuteEffects.rectCenter) {
      const { x, y } = CuteEffects.rectCenter(el);
      CuteEffects.showPop(x, y - 28, m, '#f8eeb8');
    }

    el?.classList.add('is-highfive');
    document.getElementById('heroLayer')?.classList.add('hero-highfive');
    PixelAudio.sfx.collect();
    setTimeout(() => {
      el?.classList.remove('is-highfive');
      document.getElementById('heroLayer')?.classList.remove('hero-highfive');
    }, 1600);
  }

  function setupHeroClick() {
    els.heroHitbox?.addEventListener('click', () => {
      const line = DIALOGUES[Math.floor(Math.random() * DIALOGUES.length)];
      showDialogue(line);
    });
  }

  const PATH_FLASH = {
    castle: 'rgba(154,120,176,0.28)',
    well: 'rgba(122,154,176,0.25)',
    field: 'rgba(200,160,80,0.28)',
  };

  function setupPathChoices() {
    els.pathChoices?.querySelectorAll('.path-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedPath = btn.dataset.path;
        els.pathChoices.querySelectorAll('.path-btn').forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        els.pathResultText.textContent = PATH_TEXTS[selectedPath];
        PixelAudio.sfx.choice();
        flash(PATH_FLASH[selectedPath] || PATH_FLASH.well);
        PathBackground?.switchTo?.(selectedPath);
        document.getElementById('pathResult')?.classList.add('is-visible');
      });
    });
  }

  function setupSecrets() {
    document.querySelectorAll('[data-secret]').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        triggerSecret(el.dataset.secret);
        el.classList.add('is-discovered');
      });
    });
  }

  function setupMirrorDrag() {
    const mirror = els.mirrorProp;
    if (!mirror) return;
    let dragging = false;
    let startX = 0, startRot = -5;

    mirror.addEventListener('pointerdown', e => {
      dragging = true;
      startX = e.clientX;
      mirror.setPointerCapture(e.pointerId);
    });
    mirror.addEventListener('pointermove', e => {
      if (!dragging) return;
      const rot = startRot + (e.clientX - startX) * 0.15;
      mirror.style.transform = `rotate(${Math.max(-30, Math.min(30, rot))}deg)`;
    });
    mirror.addEventListener('pointerup', () => {
      if (dragging) {
        dragging = false;
        if (!collected.has(2)) triggerSecret('mirror');
      }
    });
  }

  function setupChapterNav() {
    const chapters = [...document.querySelectorAll('.chapter')];
    els.chapterNav?.querySelectorAll('.chapter-nav__dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = +dot.dataset.target;
        const ch = chapters[idx];
        if (!ch) return;
        PixelAudio.sfx.chapterTransition(idx);
        flash();
        window.scrollTo({ top: ch.offsetTop, behavior: 'smooth' });
      });
    });
  }

  function setupStart() {
    els.startBtn?.addEventListener('click', () => {
      PixelAudio.sfx.transition();
      flash('rgba(212,184,106,0.3)');
      els.coverTitle?.classList.add('is-open');
      setTimeout(() => {
        document.getElementById('ch-prologue')?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    });
  }

  function setupMoon() {
    els.coverMoon?.addEventListener('click', () => {
      els.coverMoon.classList.add('is-eclipse');
      triggerSecret('moon');
      setTimeout(() => els.coverMoon.classList.remove('is-eclipse'), 2000);
    });
  }

  function setupSound() {
    els.soundBtn?.addEventListener('click', () => {
      const on = PixelAudio.toggle();
      els.soundBtn.classList.toggle('is-muted', !on);
      els.soundBtn.textContent = on ? '♪' : '♪̸';
      PixelAudio.sfx.click();
    });
  }

  function setupShare() {
    els.shareBtn?.addEventListener('click', async () => {
      const text = '「故事没有结局。只有翻页的人，愿意再读一遍。」— 《蛋与兔 · 碎梦童话》';
      try {
        await navigator.clipboard.writeText(text);
        showSecret('童话摘录已复制到剪贴板 ✦');
      } catch {
        showSecret(text);
      }
    });
  }

  function setupKonami() {
    document.addEventListener('keydown', e => {
      if (e.key === KONAMI[konamiIdx]) {
        konamiIdx++;
        if (konamiIdx === KONAMI.length) {
          konamiIdx = 0;
          showSecret('🥚 秘技：蛋兔对你比了个心');
          showDialogue('谢谢你找到了隐藏的路。其实每一条小径，都通向同一个结局。');
          els.secretEnding?.removeAttribute('hidden');
          [0, 1, 2, 3, 4].forEach(i => collectFragment(i));
          PixelAudio.sfx.secret();
        }
      } else {
        konamiIdx = 0;
      }
    });
  }

  function setupTypewriter() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.dataset.typed) return;
        el.dataset.typed = '1';
        const full = el.textContent;
        el.textContent = '';
        el.classList.add('is-typing');
        let i = 0;
        const tick = () => {
          if (i < full.length) {
            el.textContent += full[i++];
            setTimeout(tick, 50 + Math.random() * 30);
          } else {
            el.classList.remove('is-typing');
          }
        };
        tick();
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-typewriter]').forEach(el => observer.observe(el));
  }

  function updateNavActive(idx) {
    els.chapterNav?.querySelectorAll('.chapter-nav__dot').forEach(dot => {
      dot.classList.toggle('is-active', +dot.dataset.target === idx);
    });
  }

  function getHeroAnim() {
    if (Date.now() < heroAnimUntil) return heroAnim;
    heroFacingProp = null;
    return 'idle';
  }

  function getHeroFacing() {
    return Date.now() < heroAnimUntil ? heroFacingProp : null;
  }

  function getSelectedPath() { return selectedPath; }

  function init(particleRef) {
    window.particles = particleRef;
    setupHeroClick();
    setupPathChoices();
    setupSecrets();
    setupMirrorDrag();
    setupChapterNav();
    setupStart();
    setupMoon();
    setupSound();
    setupShare();
    setupKonami();
    setupTypewriter();

    els.restartBtn?.addEventListener('click', () => {
      collected.clear();
      els.fragmentBar?.querySelectorAll('.fragment-slot').forEach(s => s.classList.remove('is-collected'));
      els.secretEnding?.setAttribute('hidden', '');
      selectedPath = 'well';
      els.pathChoices?.querySelectorAll('.path-btn').forEach(b => {
        b.classList.toggle('is-selected', b.dataset.path === 'well');
      });
      els.pathResultText.textContent = PATH_TEXTS.well;
      PathBackground?.switchTo?.('well');
      PixelAudio.sfx.page();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  return {
    init, getHeroAnim, getHeroFacing, getSelectedPath, updateNavActive, flash, showDialogue, collected, waveNear, highfiveNear, collectFragment,
  };
})();

window.StoryInteractions = StoryInteractions;
