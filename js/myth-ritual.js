/**
 * 神话仪式 — 章节神祇色、梦屑残句、书页批注、契约瞬间、读者入书
 */
const MythRitual = (() => {
  const CHAPTER_FLASH = [
    'rgba(212,184,106,0.22)',
    'rgba(61,82,56,0.32)',
    'rgba(74,90,106,0.28)',
    'rgba(42,24,56,0.34)',
    'rgba(200,184,120,0.3)',
    'rgba(232,200,160,0.32)',
  ];

  const FRAGMENT_VERSES = [
    '蕈下藏句，毒童话方记得',
    '渊底无名，却唤旧人',
    '鉴裂半秒，王影退阶',
    '穗银作响，风念遗句',
    '朔缺一角，化而为蛋',
  ];

  const MYTH_UNLOCK = {
    0: '「翻页的人，终将成为下一则童话。」',
    1: '苔藓止哭，为初生者让路。',
    2: '三径同寂，唯井记得你的名字。',
    3: '镜中少女伸手时，恐惧退了一寸。',
    4: '麦风念罢，遗落的梦回到掌心。',
    5: '空白页上，爪印开成花——读者已入书。',
  };

  const els = {
    annotation: null,
    annotationText: null,
    mosaic: null,
    fragmentBar: null,
  };

  let unlockedStages = new Set();

  function init() {
    els.annotation = document.getElementById('bookAnnotation');
    els.annotationText = document.getElementById('bookAnnotationText');
    els.mosaic = document.getElementById('fragmentMosaic');
    els.fragmentBar = document.getElementById('fragmentBar');

    els.fragmentBar?.querySelectorAll('.fragment-slot').forEach((slot, i) => {
      slot.title = FRAGMENT_VERSES[i] || '';
      slot.setAttribute('aria-label', FRAGMENT_VERSES[i] || `梦屑 ${i + 1}`);
    });
  }

  function getChapterFlash(idx) {
    return CHAPTER_FLASH[idx] ?? CHAPTER_FLASH[0];
  }

  function showAnnotation(text, duration = 4200) {
    if (!els.annotation || !els.annotationText) {
      StoryInteractions?.showSecret?.(text);
      return;
    }
    els.annotationText.textContent = text;
    els.annotation.hidden = false;
    els.annotation.classList.remove('is-show');
    void els.annotation.offsetWidth;
    els.annotation.classList.add('is-show');
    PixelAudio.sfx.page();
    clearTimeout(showAnnotation._t);
    showAnnotation._t = setTimeout(() => {
      els.annotation.classList.remove('is-show');
      setTimeout(() => { els.annotation.hidden = true; }, 400);
    }, duration);
  }

  function contractFreeze() {
    document.body.classList.add('myth-contract');
    const layer = document.getElementById('heroLayer');
    layer?.classList.add('myth-contract-pulse');
    setTimeout(() => {
      document.body.classList.remove('myth-contract');
      layer?.classList.remove('myth-contract-pulse');
    }, 340);
  }

  function onFragmentCollected(idx) {
    const slot = els.fragmentBar?.querySelector(`[data-idx="${idx}"]`);
    if (slot) {
      slot.classList.add('is-collected');
      slot.dataset.verse = FRAGMENT_VERSES[idx] || '';
    }
    showAnnotation(`梦屑落定：${FRAGMENT_VERSES[idx]}`);
  }

  function onAllFragments() {
    document.body.classList.add('fragments-complete');
    els.mosaic?.removeAttribute('hidden');
    els.mosaic?.classList.add('is-revealed');
    document.querySelectorAll('.chapter-nav__dot').forEach(dot => {
      dot.classList.add('is-claw');
    });
    showAnnotation('五屑归位。蛋里睡着故事，兔里醒着读者。', 5500);
    StoryInteractions?.flash?.('rgba(248,238,184,0.35)');
    PixelAudio.sfx.secret();
  }

  function unlockMythStage(chapterIdx, stageIdx) {
    const key = `${chapterIdx}:${stageIdx}`;
    if (unlockedStages.has(key)) return;
    unlockedStages.add(key);

    const aside = document.querySelector(`.chapter[data-chapter="${chapterIdx}"] .chapter__aside`);
    aside?.classList.add('myth-unlocked');

    const line = MYTH_UNLOCK[chapterIdx];
    if (line && stageIdx >= 2) {
      let echo = aside?.querySelector('.myth-echo');
      if (!echo && aside) {
        echo = document.createElement('p');
        echo.className = 'myth-echo';
        aside.appendChild(echo);
      }
      if (echo) echo.textContent = line;
    }
  }

  function setSelectedPath(path) {
    document.body.dataset.selectedPath = path;
    const echoCastle = document.getElementById('pathEchoCastle');
    const echoField = document.getElementById('pathEchoField');
    echoCastle?.toggleAttribute('hidden', path !== 'castle');
    echoField?.toggleAttribute('hidden', path !== 'field');
  }

  function markChapterVisited(idx) {
    document.querySelector(`.chapter-nav__dot[data-target="${idx}"]`)?.classList.add('is-visited');
  }

  function readerRitual() {
    document.body.classList.add('reader-in-story');
    contractFreeze();
    showAnnotation('读故事的人，也成为了故事里的一部分。', 5000);
    StoryInteractions?.flash?.('rgba(232,200,160,0.38)');
  }

  function reset() {
    unlockedStages.clear();
    document.body.classList.remove('fragments-complete', 'reader-in-story');
    document.body.dataset.selectedPath = 'well';
    els.mosaic?.setAttribute('hidden', '');
    els.mosaic?.classList.remove('is-revealed');
    document.querySelectorAll('.chapter-nav__dot').forEach(dot => {
      dot.classList.remove('is-claw', 'is-visited');
    });
    document.querySelectorAll('.myth-echo').forEach(el => el.remove());
    document.querySelectorAll('.chapter__aside.myth-unlocked').forEach(el => {
      el.classList.remove('myth-unlocked');
    });
    els.fragmentBar?.querySelectorAll('.fragment-slot').forEach(slot => {
      slot.classList.remove('is-collected');
      delete slot.dataset.verse;
    });
  }

  return {
    init,
    getChapterFlash,
    showAnnotation,
    contractFreeze,
    onFragmentCollected,
    onAllFragments,
    unlockMythStage,
    setSelectedPath,
    markChapterVisited,
    readerRitual,
    reset,
    FRAGMENT_VERSES,
  };
})();

window.MythRitual = MythRitual;
