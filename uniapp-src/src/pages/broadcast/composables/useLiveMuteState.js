import { computed, ref } from "vue";

/**
 * 用户禁言/拉黑和全员禁言展示状态。
 * 职责边界：维护禁言倒计时、提示条和输入禁用文案；具体禁言事件来源由 WebSocket 消息处理器注入。
 */
export function useLiveMuteState({ roomSetting }) {
  const userMuted = ref(false);
  const userBlocked = ref(false);
  const muteTipVisible = ref(false);
  const muteEndTime = ref(0);
  const muteRemainText = ref("");
  let muteCountdownTimer = null;

  const chatDisabled = computed(() => {
    if (userBlocked.value) return "您已被拉黑，无法发言";
    if (userMuted.value) {
      if (muteRemainText.value) return `禁言中，剩余${muteRemainText.value}`;
      return "您已被禁言";
    }
    if (roomSetting.value.muteAll === 1) return "当前全员禁言中";
    if (roomSetting.value.enableChat === 0) return "聊天已关闭";
    return "";
  });

  function startMuteCountdown(durationMinutes) {
    stopMuteCountdown();
    muteEndTime.value = Date.now() + durationMinutes * 60 * 1000;
    muteTipVisible.value = true;
    updateMuteRemainText();
    muteCountdownTimer = setInterval(() => {
      updateMuteRemainText();
      if (Date.now() >= muteEndTime.value) {
        userMuted.value = false;
        muteTipVisible.value = false;
        stopMuteCountdown();
        uni.showToast({ title: "禁言已解除", icon: "none" });
      }
    }, 1000);
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
    const mins = Math.floor(remain / 60000);
    const secs = Math.floor((remain % 60000) / 1000);
    muteRemainText.value = mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`;
  }

  return {
    userMuted,
    userBlocked,
    muteTipVisible,
    muteRemainText,
    chatDisabled,
    startMuteCountdown,
    stopMuteCountdown,
  };
}
