"use strict";
const common_vendor = require("../../../common/vendor.js");
function useLiveChatInput({ mode, chatDisabled, getStageRef } = {}) {
  const inputFocused = common_vendor.ref(false);
  const inputText = common_vendor.ref("");
  const keyboardHeight = common_vendor.ref(0);
  const keyboardViewportBaseHeight = common_vendor.ref(0);
  const portraitInputRef = common_vendor.ref(null);
  const landscapeInputRef = common_vendor.ref(null);
  let keyboardListenerBound = false;
  const bottomBarStyle = common_vendor.computed(() => {
    if (!inputFocused.value || keyboardHeight.value <= 0)
      return {};
    return {
      bottom: `${Number(keyboardHeight.value || 0)}px`,
      paddingBottom: "12rpx"
    };
  });
  function currentInputRef() {
    return (getStageRef == null ? void 0 : getStageRef()) || (mode.value === "portrait" ? portraitInputRef.value : landscapeInputRef.value);
  }
  function bindKeyboardListener() {
    if (keyboardListenerBound || typeof common_vendor.index.onKeyboardHeightChange !== "function")
      return;
    keyboardListenerBound = true;
    common_vendor.index.onKeyboardHeightChange((res) => {
      keyboardHeight.value = inputFocused.value ? Number((res == null ? void 0 : res.height) || 0) : 0;
    });
  }
  function onInputFocus(event = {}) {
    var _a, _b, _c;
    if (chatDisabled.value) {
      (_b = (_a = currentInputRef()) == null ? void 0 : _a.blur) == null ? void 0 : _b.call(_a);
      common_vendor.index.showToast({ title: chatDisabled.value, icon: "none" });
      return;
    }
    inputFocused.value = true;
    bindKeyboardListener();
    keyboardHeight.value = Number(((_c = event == null ? void 0 : event.detail) == null ? void 0 : _c.height) || keyboardHeight.value || 0);
  }
  function focusInput() {
    var _a, _b;
    if (chatDisabled.value) {
      common_vendor.index.showToast({ title: chatDisabled.value, icon: "none" });
      return;
    }
    if (inputFocused.value)
      return;
    (_b = (_a = currentInputRef()) == null ? void 0 : _a.focus) == null ? void 0 : _b.call(_a);
  }
  function blurInput() {
    var _a, _b;
    (_b = (_a = currentInputRef()) == null ? void 0 : _a.blur) == null ? void 0 : _b.call(_a);
  }
  function onInputBlur() {
    inputFocused.value = false;
    keyboardHeight.value = 0;
  }
  function syncKeyboardViewportBaseHeight(force = false) {
    if (!force && keyboardViewportBaseHeight.value)
      return;
    try {
      const info = typeof common_vendor.index.getSystemInfoSync === "function" ? common_vendor.index.getSystemInfoSync() : {};
      keyboardViewportBaseHeight.value = Number(info.windowHeight || info.screenHeight || 0);
    } catch (e) {
    }
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
    stopKeyboardListener
  };
}
exports.useLiveChatInput = useLiveChatInput;
