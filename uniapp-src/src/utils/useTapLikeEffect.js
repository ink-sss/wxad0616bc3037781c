import { computed, ref } from "vue";

// 点赞特效图片列表（从 static/zan/ 随机选取）
const ZAN_IMAGES = [
  "https://man.lqjy.cc/static/zan/zan_1.png",
  "https://man.lqjy.cc/static/zan/zan_2.png",
  "https://man.lqjy.cc/static/zan/zan_3.png",
  "https://man.lqjy.cc/static/zan/zan_4.png",
  "https://man.lqjy.cc/static/zan/zan_5.png",
];

// 连击计数器显示阈值
const COMBO_THRESHOLD = 10;
// 连击间隔（ms），超过此时间视为中断
const COMBO_GAP = 600;
// 连击计数器消失延迟（ms）
const COMBO_FADE_DELAY = 800;
const TAP_EFFECT_POOL_SIZE = 28;

function createTapEffectSlots() {
  return Array.from({ length: TAP_EFFECT_POOL_SIZE }, (_, slotId) => ({
    slotId,
    runId: 0,
    active: false,
    x: 0,
    y: 0,
    img: "",
  }));
}

/**
 * 竖屏点击空白区域点赞特效 composable
 * - 点击弹出随机 zan 图片，抖动后消失
 * - 连续点击 10 次以上，在最后一张图片上方显示 x10、x12、x15 等连击计数
 * @returns {{ tapEffects, comboInfo, onScreenTap, finishTapEffect }}
 */
export function useTapLikeEffect() {
  const tapEffectSlots = ref(createTapEffectSlots());
  const tapEffects = computed(() => tapEffectSlots.value.filter((effect) => effect.active));
  let tapEffectRunId = 0;
  let tapEffectSlotCursor = 0;

  // 连击状态
  let comboCount = 0;
  let lastTapTime = 0;
  let comboFadeTimer = null;
  let lastDisplayedCount = 0;
  // comboInfo: { visible, count, x, y, key } — 给模板渲染用
  const comboInfo = ref({ visible: false, count: 0, x: 0, y: 0, key: 0 });

  function randomImage() {
    return ZAN_IMAGES[Math.floor(Math.random() * ZAN_IMAGES.length)];
  }

  function reserveTapEffectSlot() {
    const inactiveIndex = tapEffectSlots.value.findIndex((effect) => !effect.active);
    if (inactiveIndex >= 0) {
      tapEffectSlotCursor = (inactiveIndex + 1) % TAP_EFFECT_POOL_SIZE;
      return inactiveIndex;
    }
    const slotIndex = tapEffectSlotCursor;
    tapEffectSlotCursor = (tapEffectSlotCursor + 1) % TAP_EFFECT_POOL_SIZE;
    return slotIndex;
  }

  function finishTapEffect(slotId, runId) {
    const targetSlotId = Number(slotId);
    const targetRunId = Number(runId);
    const slotIndex = tapEffectSlots.value.findIndex((effect) => effect.slotId === targetSlotId);
    const effect = tapEffectSlots.value[slotIndex];
    if (!effect || !effect.active || effect.runId !== targetRunId) return;
    tapEffectSlots.value.splice(slotIndex, 1, { ...effect, active: false });
  }

  function resetCombo() {
    comboCount = 0;
    lastDisplayedCount = 0;
    comboInfo.value = { ...comboInfo.value, visible: false };
  }

  function scheduleComboFade() {
    if (comboFadeTimer) clearTimeout(comboFadeTimer);
    comboFadeTimer = setTimeout(() => {
      comboInfo.value = { ...comboInfo.value, visible: false };
      // 延迟重置计数，让淡出动画播完
      setTimeout(() => {
        comboCount = 0;
        lastDisplayedCount = 0;
      }, 500);
    }, COMBO_FADE_DELAY);
  }

  function onScreenTap(e) {
    const x = e.detail?.x ?? e.touches?.[0]?.clientX ?? 0;
    const y = e.detail?.y ?? e.touches?.[0]?.clientY ?? 0;
    const now = Date.now();

    // --- 连击判定 ---
    if (now - lastTapTime > COMBO_GAP) {
      comboCount = 0;
      lastDisplayedCount = 0;
    }
    lastTapTime = now;
    comboCount++;

    // 达到阈值后显示连击计数器
    if (comboCount >= COMBO_THRESHOLD) {
      // 首次达到阈值，或每隔 2~3 次更新一次显示
      const gap = comboCount - lastDisplayedCount;
      if (lastDisplayedCount === 0 || gap >= 2 + Math.floor(Math.random() * 2)) {
        lastDisplayedCount = comboCount;
        comboInfo.value = {
          visible: true,
          count: comboCount,
          x,
          y: y - 30,
          key: now,
        };
      }
    }
    scheduleComboFade();

    // --- 图片特效 ---
    const slotIndex = reserveTapEffectSlot();
    const slot = tapEffectSlots.value[slotIndex];
    tapEffectSlots.value.splice(slotIndex, 1, {
      ...slot,
      runId: ++tapEffectRunId,
      active: true,
      x: x - 20,
      y: y - 20,
      img: randomImage(),
    });
  }

  return { tapEffects, comboInfo, onScreenTap, finishTapEffect };
}
