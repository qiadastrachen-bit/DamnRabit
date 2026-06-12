(function () {
  const HERO_SCALE = 2.85;
  const HERO_HALF_W = (SpriteRenderer.SPRITE_W * HERO_SCALE) / 2;

  const heroCanvas = document.getElementById('heroCanvas');
  const heroLayer = document.getElementById('heroLayer');
  const particleCanvas = document.getElementById('particleCanvas');
  const progressBar = document.querySelector('.scroll-progress__bar');

  const chapters = [...document.querySelectorAll('.chapter')];
  const revealBlocks = [...document.querySelectorAll('[data-reveal]')];

  const particles = new ParticleField(particleCanvas);
  StoryInteractions.init(particles);
  SideStories.init();
  PathBackground.init();
  CuteEffects.init();
  ChapterHeroes.init();

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  let animFrame = 0;
  let idleTimer = 0;
  let lastScrollY = 0;
  let scrollVelocity = 0;
  let lastChapterIdx = 0;
  let animId = null;

  function getScrollProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? window.scrollY / max : 0;
  }

  function getChapterProgress() {
    const vh = window.innerHeight;
    const scroll = window.scrollY;
    let idx = 0;
    let local = 0;

    chapters.forEach((ch, i) => {
      const top = ch.offsetTop;
      const height = ch.offsetHeight;
      if (scroll >= top - vh * 0.3) {
        idx = i;
        local = Math.min(1, Math.max(0, (scroll - top + vh * 0.3) / (height + vh * 0.2)));
      }
    });
    return { idx, local };
  }

  function updateHero() {
    const { idx, local } = getChapterProgress();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pos = HeroWalk.getPosition(idx, local, vh, vw);

    const floatY = Math.sin(Date.now() * 0.002) * 4;
    const isWalking = scrollVelocity > 0.35 || (local > 0.02 && local < 0.98 && scrollVelocity > 0.1);
    const walkBob = isWalking ? Math.sin(animFrame * 0.6) * 3 : Math.sin(idleTimer * 0.04) * 1.5;

    heroLayer.style.transform = `translate(${pos.x - HERO_HALF_W}px, ${pos.y + floatY + walkBob}px)`;

    const heroAnim = StoryInteractions.getHeroAnim();
    let currentAnim = 'idle';

    const facingOverride = StoryInteractions.getHeroFacing?.();

    if (heroAnim === 'highfive') {
      currentAnim = 'highfive';
      if (frame % 8 === 0) animFrame++;
    } else if (heroAnim === 'wave') {
      currentAnim = 'wave';
      if (frame % 10 === 0) animFrame++;
    } else if (isWalking) {
      currentAnim = 'walk';
      if (frame % 5 === 0) animFrame++;
    } else {
      currentAnim = 'idle';
      idleTimer++;
      if (idleTimer % 20 === 0) animFrame++;
    }

    const flipTowardProp = facingOverride === 'left';
    const flipX = facingOverride ? flipTowardProp : !!pos.flip;

    const sprite = SpriteRenderer.getFrameByAnim(currentAnim, animFrame);
    SpriteRenderer.drawSprite(heroCanvas, sprite, {
      flipX, scale: HERO_SCALE, glow: true,
    });

    heroLayer.style.opacity = idx === 0
      ? String(Math.max(0.92, Math.min(1, pos.opacity * 1.1)))
      : '1';
    heroLayer.style.filter = idx >= 4
      ? 'brightness(1.28) contrast(1.1) saturate(1.05)'
      : 'brightness(1.26) contrast(1.08) saturate(1.04)';

    if (idx !== lastChapterIdx) {
      ProximityStories?.onChapterChange?.(idx);
      if (lastChapterIdx !== 0 || idx !== 0) {
        StoryInteractions.flash(MythRitual?.getChapterFlash?.(idx));
        document.body.classList.add('chapter-transition');
        setTimeout(() => document.body.classList.remove('chapter-transition'), 600);
        PixelAudio.sfx.chapterTransition(idx);
        CuteEffects.chapterPoof(pos.x, pos.y - 40);
        animFrame = 0;
      }
      lastChapterIdx = idx;
    }

    ChapterHeroes.update(idx, local, scrollVelocity);

    document.body.dataset.chapter = idx;
    StoryInteractions.updateNavActive(idx);
  }

  function updateProgress() {
    progressBar.style.width = `${getScrollProgress() * 100}%`;
  }

  function updateReveal() {
    const vh = window.innerHeight;
    const reveal = block => {
      const rect = block.getBoundingClientRect();
      const visible = rect.top < vh * 0.78 && rect.bottom > vh * 0.12;
      if (visible) block.classList.add('is-visible');
    };
    revealBlocks.forEach(reveal);
    document.querySelectorAll('[data-aside-reveal]').forEach(reveal);
  }

  function updateParallax() {
    const scroll = window.scrollY;
    const mx = (window.innerWidth / 2 - mouseX) * 0.01;

    chapters.forEach(ch => {
      const bg = ch.querySelector('.chapter__bg');
      if (!bg) return;
      const offset = (scroll - ch.offsetTop) * 0.12;
      bg.style.transform = `translate(${mx}px, ${offset}px)`;
    });
  }

  function updateSceneProps() {
    const vh = window.innerHeight;
    document.querySelectorAll('.scene-prop').forEach(prop => {
      const rect = prop.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(center - vh * 0.5) / vh;
      if (!prop.classList.contains('is-discovered')) {
        prop.style.opacity = String(Math.max(0.35, 1 - dist * 0.9));
      }
      const parallaxY = (center - vh * 0.5) * 0.06;
      const rot = prop.id === 'mirrorProp' ? '' : '';
      if (!prop.matches(':active') && prop.id !== 'mirrorProp') {
        prop.style.transform = `translateY(${parallaxY}px) ${rot}`;
      }
    });
  }

  let frame = 0;
  function tick() {
    frame++;
    const gameRunning = EggDreamGame?.isRunning?.() || ChapterGames?.isRunning?.();

    if (!gameRunning) {
      scrollVelocity = Math.abs(window.scrollY - lastScrollY);
      lastScrollY = window.scrollY;

      updateHero();
      updateProgress();
      updateReveal();
      updateParallax();
      updateSceneProps();
      HeroProximity.update();

      const { idx } = getChapterProgress();
      particles.update(idx <= 1 ? 1.2 : idx >= 4 ? 0.6 : 0.85, { x: mouseX, y: mouseY });
    }

    animId = requestAnimationFrame(tick);
  }

  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => { scrollVelocity = 0; }, 100);
  }, { passive: true });

  SpriteRenderer.drawSprite(heroCanvas, SpriteRenderer.HERO_PIXELS, { glow: true, scale: HERO_SCALE });
  tick();

  window.addEventListener('beforeunload', () => cancelAnimationFrame(animId));
})();
