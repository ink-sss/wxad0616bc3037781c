"use strict";
const common_vendor = require("../common/vendor.js");
const ZAN_IMAGES = [
  "/static/zan/zan_1.png",
  "/static/zan/zan_2.png",
  "/static/zan/zan_3.png",
  "/static/zan/zan_4.png",
  "/static/zan/zan_5.png"
];
const COMBO_THRESHOLD = 10;
const COMBO_GAP = 600;
const COMBO_FADE_DELAY = 800;
const TAP_EFFECT_POOL_SIZE = 28;
function createTapEffectSlots() {
  return Array.from({ length: TAP_EFFECT_POOL_SIZE }, (_, slotId) => ({
    slotId,
    runId: 0,
    active: false,
    x: 0,
    y: 0,
    img: ""
  }));
}
function useTapLikeEffect() {
  const tapEffectSlots = common_vendor.ref(createTapEffectSlots());
  const tapEffects = common_vendor.computed(() => tapEffectSlots.value.filter((effect) => effect.active));
  let tapEffectRunId = 0;
  let tapEffectSlotCursor = 0;
  let comboCount = 0;
  let lastTapTime = 0;
  let comboFadeTimer = null;
  let lastDisplayedCount = 0;
  const comboInfo = common_vendor.ref({ visible: false, count: 0, x: 0, y: 0, key: 0 });
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
    const slotIndex = tapEffectSlots.value.findIndex((effect2) => effect2.slotId === targetSlotId);
    const effect = tapEffectSlots.value[slotIndex];
    if (!effect || !effect.active || effect.runId !== targetRunId)
      return;
    tapEffectSlots.value.splice(slotIndex, 1, { ...effect, active: false });
  }
  function scheduleComboFade() {
    if (comboFadeTimer)
      clearTimeout(comboFadeTimer);
    comboFadeTimer = setTimeout(() => {
      comboInfo.value = { ...comboInfo.value, visible: false };
      setTimeout(() => {
        comboCount = 0;
        lastDisplayedCount = 0;
      }, 500);
    }, COMBO_FADE_DELAY);
  }
  function onScreenTap(e) {
    var _a, _b, _c, _d, _e, _f;
    const x = ((_a = e.detail) == null ? void 0 : _a.x) ?? ((_c = (_b = e.touches) == null ? void 0 : _b[0]) == null ? void 0 : _c.clientX) ?? 0;
    const y = ((_d = e.detail) == null ? void 0 : _d.y) ?? ((_f = (_e = e.touches) == null ? void 0 : _e[0]) == null ? void 0 : _f.clientY) ?? 0;
    const now = Date.now();
    if (now - lastTapTime > COMBO_GAP) {
      comboCount = 0;
      lastDisplayedCount = 0;
    }
    lastTapTime = now;
    comboCount++;
    if (comboCount >= COMBO_THRESHOLD) {
      const gap = comboCount - lastDisplayedCount;
      if (lastDisplayedCount === 0 || gap >= 2 + Math.floor(Math.random() * 2)) {
        lastDisplayedCount = comboCount;
        comboInfo.value = {
          visible: true,
          count: comboCount,
          x,
          y: y - 30,
          key: now
        };
      }
    }
    scheduleComboFade();
    const slotIndex = reserveTapEffectSlot();
    const slot = tapEffectSlots.value[slotIndex];
    tapEffectSlots.value.splice(slotIndex, 1, {
      ...slot,
      runId: ++tapEffectRunId,
      active: true,
      x: x - 20,
      y: y - 20,
      img: randomImage()
    });
  }
  return { tapEffects, comboInfo, onScreenTap, finishTapEffect };
}
exports.useTapLikeEffect = useTapLikeEffect;
