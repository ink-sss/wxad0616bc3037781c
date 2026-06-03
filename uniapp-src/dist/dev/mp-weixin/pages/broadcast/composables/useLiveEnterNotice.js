"use strict";
const common_vendor = require("../../../common/vendor.js");
const ENTER_NOTICE_HIDE_DELAY = 4e3;
const ENTER_NOTICE_LEAVE_DURATION = 500;
function useLiveEnterNotice() {
  const enterNotice = common_vendor.ref({
    visible: false,
    leaving: false,
    nick: "",
    noticeType: "enter",
    // "enter" | "leave"
    key: 0
  });
  let hideTimer = null;
  let removeTimer = null;
  function clearTimers() {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    if (removeTimer) {
      clearTimeout(removeTimer);
      removeTimer = null;
    }
  }
  function hideEnterNotice() {
    if (!enterNotice.value.visible)
      return;
    enterNotice.value = {
      ...enterNotice.value,
      leaving: true
    };
    removeTimer = setTimeout(() => {
      enterNotice.value = {
        visible: false,
        leaving: false,
        nick: "",
        noticeType: "enter",
        key: enterNotice.value.key
      };
      removeTimer = null;
    }, ENTER_NOTICE_LEAVE_DURATION);
  }
  function showEnterNotice(nick, noticeType = "enter") {
    const displayNick = String(nick || "").trim();
    if (!displayNick)
      return;
    clearTimers();
    enterNotice.value = {
      visible: true,
      leaving: false,
      nick: displayNick,
      noticeType,
      key: enterNotice.value.key + 1
    };
    hideTimer = setTimeout(() => {
      hideTimer = null;
      hideEnterNotice();
    }, ENTER_NOTICE_HIDE_DELAY);
  }
  common_vendor.onBeforeUnmount(() => {
    clearTimers();
  });
  return {
    enterNotice,
    showEnterNotice
  };
}
exports.useLiveEnterNotice = useLiveEnterNotice;
