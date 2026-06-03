import { onBeforeUnmount, ref } from "vue";

const ENTER_NOTICE_HIDE_DELAY = 4000;
const ENTER_NOTICE_LEAVE_DURATION = 500;

/**
 * 直播间用户进场/离场提醒。
 * 职责边界：维护独立浮层的展示、离场动画和自动清理；不写入聊天消息列表。
 * 支持 enter/leave 两种类型，UI 模板根据 noticeType 切换文案。
 */
export function useLiveEnterNotice() {
  const enterNotice = ref({
    visible: false,
    leaving: false,
    nick: "",
    noticeType: "enter", // "enter" | "leave"
    key: 0,
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
    if (!enterNotice.value.visible) return;
    enterNotice.value = {
      ...enterNotice.value,
      leaving: true,
    };
    removeTimer = setTimeout(() => {
      enterNotice.value = {
        visible: false,
        leaving: false,
        nick: "",
        noticeType: "enter",
        key: enterNotice.value.key,
      };
      removeTimer = null;
    }, ENTER_NOTICE_LEAVE_DURATION);
  }

  /**
   * @param {string} nick 显示昵称
   * @param {"enter"|"leave"} [noticeType="enter"] 飘屏类型
   */
  function showEnterNotice(nick, noticeType = "enter") {
    const displayNick = String(nick || "").trim();
    if (!displayNick) return;
    clearTimers();
    enterNotice.value = {
      visible: true,
      leaving: false,
      nick: displayNick,
      noticeType,
      key: enterNotice.value.key + 1,
    };
    hideTimer = setTimeout(() => {
      hideTimer = null;
      hideEnterNotice();
    }, ENTER_NOTICE_HIDE_DELAY);
  }

  onBeforeUnmount(() => {
    clearTimers();
  });

  return {
    enterNotice,
    showEnterNotice,
  };
}
