const PixelAudio = (() => {
  let ctx = null;
  let enabled = true;

  function ensure() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function beep(freq = 440, dur = 0.08, type = 'square', vol = 0.06, delay = 0) {
    if (!enabled) return;
    try {
      const ac = ensure();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const t = ac.currentTime + delay;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t);
      osc.stop(t + dur);
    } catch (_) { /* 静默降级 */ }
  }

  function sequence(notes, gap = 0.09, type = 'triangle', vol = 0.05) {
    notes.forEach(([freq, dur], i) => beep(freq, dur || 0.1, type, vol, i * gap));
  }

  const sfx = {
    click: () => beep(520, 0.05, 'square', 0.04),
    collect: () => { beep(660, 0.06); setTimeout(() => beep(880, 0.1), 60); },
    dialogue: () => beep(380, 0.04, 'triangle', 0.05),
    choice: () => { beep(440, 0.07); setTimeout(() => beep(554, 0.09), 80); },
    secret: () => {
      beep(330, 0.1);
      setTimeout(() => beep(494, 0.12), 100);
      setTimeout(() => beep(659, 0.15), 200);
    },
    transition: () => beep(220, 0.15, 'sawtooth', 0.03),
    page: () => beep(300, 0.06, 'triangle', 0.04),

    /** 各章翻页音效 — 与故事氛围对应 */
    chapterTransition(idx) {
      const themes = {
        0: () => sequence([[523, 0.12], [659, 0.14], [784, 0.18]], 0.1, 'sine', 0.045),
        1: () => sequence([[196, 0.15], [247, 0.12], [294, 0.2]], 0.12, 'triangle', 0.04),
        2: () => sequence([[349, 0.1], [311, 0.1], [277, 0.14], [262, 0.16]], 0.09, 'triangle', 0.042),
        3: () => sequence([[147, 0.14], [175, 0.12], [196, 0.1], [175, 0.14]], 0.11, 'sawtooth', 0.035),
        4: () => sequence([[392, 0.1], [440, 0.1], [494, 0.12], [523, 0.15]], 0.1, 'sine', 0.04),
        5: () => sequence([[262, 0.1], [330, 0.1], [392, 0.12], [523, 0.18], [659, 0.22]], 0.09, 'sine', 0.048),
      };
      (themes[idx] || themes[1])();
    },
  };

  const CHAPTER_AMBIENT = {
    0: '封面 · 蛋醒之梦',
    1: '序章 · 迷雾森林',
    2: '第一章 · 岔路低语',
    3: '第二章 · 倒置王座',
    4: '第三章 · 麦野黄昏',
    5: '终章 · 黎明书页',
  };

  function toggle() {
    enabled = !enabled;
    if (enabled) ensure();
    return enabled;
  }

  return { sfx, toggle, isEnabled: () => enabled, CHAPTER_AMBIENT };
})();

window.PixelAudio = PixelAudio;
