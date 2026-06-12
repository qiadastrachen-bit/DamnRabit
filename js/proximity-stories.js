/**
 * 同一章连续靠近 → 递进小剧情
 */
const ProximityStories = (() => {
  const THRESHOLDS = [2, 4, 7];

  const STORIES = {
    0: [
      '月亮缺的那一角……被蛋兔轻轻托住了。',
      '封面上的爪印，是她很多年前落下的。',
      '「谢谢你愿意翻开。」她与读者击了掌。',
    ],
    1: [
      '苔藓止住了哭声，悄悄为她让出一条路。',
      '蘑菇伞抖了抖，像在点头。森林认得这张脸。',
      '蛋微微发热。她不记得名字，但森林记得她的脚步。',
    ],
    2: [
      '三条岔路同时安静了一秒。井底先开口。',
      '风从岔口吹来，带着摇篮曲的半句旋律。',
      '那个名字不是被叫出来的，是被想起来的。',
    ],
    3: [
      '镜中少女伸出手。她迟疑半秒，迎了上去。',
      '王座的影子退后一步——没有脸的恐惧，也会退。',
      '镜里的兔子笑了：「这一百年，轮到你了。」',
    ],
    4: [
      '麦芒划过掌心，像翻过一页粗糙的旧纸。',
      '蛋黄里的兔子蹭了蹭她：「想起来了么？」',
      '风念完最后一句。遗落的梦，被她亲手拾回。',
    ],
    5: [
      '读者与主角击掌。书页沙沙作响。',
      '吊坠发烫。那个深夜写字的女孩，终于想起自己。',
      '空白书页上，爪印悄悄开成了一朵花。',
    ],
  };

  let chapter = -1;
  let count = 0;
  let stage = 0;
  let targets = new Set();
  let lastTrigger = 0;
  const COOLDOWN = 7000;

  function onChapterChange(idx) {
    if (idx === chapter) return;
    chapter = idx;
    count = 0;
    stage = 0;
    targets.clear();
  }

  function heroPoint() {
    const layer = document.getElementById('heroLayer');
    if (!layer) return { x: window.innerWidth * 0.3, y: window.innerHeight * 0.5 };
    const r = layer.getBoundingClientRect();
    return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.4 };
  }

  function triggerStage(chapterIdx, stageIdx) {
    const lines = STORIES[chapterIdx];
    if (!lines?.[stageIdx]) return;

    const { x, y } = heroPoint();
    PixelAudio.sfx.secret();
    window.particles?.burst?.(x, y, '#F8EEB8');
    StoryInteractions.flash('rgba(212,184,106,0.2)');

    if (stageIdx < 2) {
      CuteEffects.showPop(x, y - 50, lines[stageIdx], '#d4b86a');
      PixelAudio.sfx.dialogue();
    } else {
      StoryInteractions.showDialogue(lines[stageIdx]);
    }

    CuteEffects.spawnFloater(x - 16, y - 30, '✦', '#f8eeb8', 0);
    CuteEffects.spawnFloater(x + 16, y - 36, '❝', '#7a9ab0', 120);
  }

  function record(chapterIdx, targetId, kind = 'wave') {
    onChapterChange(chapterIdx);
    if (!targetId) return;

    const key = `${chapterIdx}:${targetId}`;
    const isNew = !targets.has(key);
    targets.add(key);

    count += kind === 'highfive' ? 2 : 1;
    if (isNew) count += 1;

    if (stage >= 3) return;
    if (Date.now() - lastTrigger < COOLDOWN) return;
    if (count < THRESHOLDS[stage]) return;

    triggerStage(chapterIdx, stage);
    stage++;
    lastTrigger = Date.now();
  }

  return { record, onChapterChange };
})();

window.ProximityStories = ProximityStories;
