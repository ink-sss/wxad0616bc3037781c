import { computed, ref } from "vue";

/**
 * 直播聊天输入与小程序键盘适配。
 * 职责边界：维护输入框焦点、文本和键盘高度；消息发送由 useLiveComments 处理。
 */
export function useLiveChatInput({ mode, chatDisabled, getStageRef } = {}) {
  const inputFocused = ref(false);
  const inputText = ref("");
  const keyboardHeight = ref(0);
  const keyboardViewportBaseHeight = ref(0);
  const portraitInputRef = ref(null);
  const landscapeInputRef = ref(null);
  let keyboardListenerBound = false;

  const bottomBarStyle = computed(() => {
    if (!inputFocused.value || keyboardHeight.value <= 0) return {};
    return {
      bottom: `${Number(keyboardHeight.value || 0)}px`,
      paddingBottom: "12rpx",
    };
  });

  function currentInputRef() {
    return getStageRef?.() || (mode.value === "portrait" ? portraitInputRef.value : landscapeInputRef.value);
  }

  function bindKeyboardListener() {
    if (keyboardListenerBound || typeof uni.onKeyboardHeightChange !== "function") return;
    keyboardListenerBound = true;
    uni.onKeyboardHeightChange((res) => {
      keyboardHeight.value = inputFocused.value ? Number(res?.height || 0) : 0;
    });
  }

  function onInputFocus(event = {}) {
    if (chatDisabled.value) {
      currentInputRef()?.blur?.();
      uni.showToast({ title: chatDisabled.value, icon: "none" });
      return;
    }
    inputFocused.value = true;
    bindKeyboardListener();
    keyboardHeight.value = Number(event?.detail?.height || keyboardHeight.value || 0);
  }

  function focusInput() {
    if (chatDisabled.value) {
      uni.showToast({ title: chatDisabled.value, icon: "none" });
      return;
    }
    if (inputFocused.value) return;
    currentInputRef()?.focus?.();
  }

  function blurInput() {
    currentInputRef()?.blur?.();
  }

  function onInputBlur() {
    inputFocused.value = false;
    keyboardHeight.value = 0;
  }

  function syncKeyboardViewportBaseHeight(force = false) {
    if (!force && keyboardViewportBaseHeight.value) return;
    try {
      const info = typeof uni.getSystemInfoSync === "function" ? uni.getSystemInfoSync() : {};
      keyboardViewportBaseHeight.value = Number(info.windowHeight || info.screenHeight || 0);
    } catch (e) {}
  }

  function stopKeyboardListener() {
    inputFocused.value = false;
    keyboardHeight.value = 0;
  }

  return {
    inputFocused,
    inputText,
    keyboardHeight,
    portraitInputRef,
    landscapeInputRef,
    bottomBarStyle,
    onInputFocus,
    focusInput,
    blurInput,
    onInputBlur,
    syncKeyboardViewportBaseHeight,
    stopKeyboardListener,
  };
}
