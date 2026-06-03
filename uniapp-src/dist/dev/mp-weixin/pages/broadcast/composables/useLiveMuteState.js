"use strict";
const common_vendor = require("../../../common/vendor.js");
function useLiveMuteState({ roomSetting }) {
  const userMuted = common_vendor.ref(false);
  const userBlocked = common_vendor.ref(false);
  const muteTipVisible = common_vendor.ref(false);
  const muteEndTime = common_vendor.ref(0);
  const muteRemainText = common_vendor.ref("");
  let muteCountdownTimer = null;
  const chatDisabled = common_vendor.computed(() => {
    if (userBlocked.value)
      return "您已被拉黑，无法发言";
    if (userMuted.value) {
      if (muteRemainText.value)
        return `禁言中，剩余${muteRemainText.value}`;
      return "您已被禁言";
    }
    if (roomSetting.value.muteAll === 1)
      return "当前全员禁言中";
    if (roomSetting.value.enableChat === 0)
      return "聊天已关闭";
    return "";
  });
  function startMuteCountdown(durationMinutes) {
    stopMuteCountdown();
    muteEndTime.value = Date.now() + durationMinutes * 60 * 1e3;
    muteTipVisible.value = true;
    updateMuteRemainText();
    muteCountdownTimer = setInterval(() => {
      updateMuteRemainText();
      if (Date.now() >= muteEndTime.value) {
        userMuted.value = false;
        muteTipVisible.value = false;
        stopMuteCountdown();
        common_vendor.index.showToast({ title: "禁言已解除", icon: "none" });
      }
    }, 1e3);
  }
  function stopMuteCountdown() {
    if (muteCountdownTimer) {
      clearInterval(muteCountdownTimer);
      muteCountdownTimer = null;
    }
  }
  function updateMuteRemainText() {
    const remain = Math.max(0, muteEndTime.value - Date.now());
    if (remain <= 0) {
      muteRemainText.value = "";
      return;
    }
    const mins = Math.floor(remain / 6e4);
    const secs = Math.floor(remain % 6e4 / 1e3);
    muteRemainText.value = mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`;
  }
  return {
    userMuted,
    userBlocked,
    muteTipVisible,
    muteRemainText,
    chatDisabled,
    startMuteCountdown,
    stopMuteCountdown
  };
}
exports.useLiveMuteState = useLiveMuteState;
