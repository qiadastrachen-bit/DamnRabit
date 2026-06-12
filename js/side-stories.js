/**
 * 侧边像素小故事 — 点击切换、收藏
 */
const SideStories = (() => {
  const TALES = {
    mushroom: [
      '蘑菇伞下写着：有毒的童话，才记得住。',
      '第七只蘑菇会说谎，别信它的方向。',
      '采蘑菇的人最后都成了故事里的脚注。',
    ],
    well: [
      '井壁上的刻痕：「回来吧，写故事的人。」',
      '往井里扔一枚硬币，听见的是翻书声。',
      '井底没有水，只有一页被泡软的结局。',
    ],
    mirror: [
      '镜中倒影比你早半秒眨眼。',
      '裂痕是镜子在试图说出真相。',
      '照镜三百次，会看见没写的那一页。',
    ],
    wheat: [
      '麦芒划过指尖，像翻过一页粗糙纸。',
      '每一株麦穗，都是一行未写完的句子。',
      '风过麦田，听起来像有人在念你的名字。',
    ],
    egg: [
      '蛋壳内侧画着一张没眉眼的脸。',
      '兔子从不睡觉，它在替你守夜。',
      '蛋裂开时，会先漏出一缕摇篮曲。',
    ],
  };

  function init() {
    document.querySelectorAll('.mini-tale--cycle').forEach(card => {
      const key = card.dataset.tale;
      const lines = TALES[key] || ['……'];
      let idx = 0;
      const textEl = card.querySelector('.mini-tale__body');
      card.addEventListener('click', () => {
        idx = (idx + 1) % lines.length;
        if (textEl) {
          textEl.classList.remove('is-flip');
          void textEl.offsetWidth;
          textEl.textContent = lines[idx];
          textEl.classList.add('is-flip');
        }
        PixelAudio.sfx.page();
        card.classList.add('is-read');
      });
    });

  }

  return { init };
})();

window.SideStories = SideStories;
