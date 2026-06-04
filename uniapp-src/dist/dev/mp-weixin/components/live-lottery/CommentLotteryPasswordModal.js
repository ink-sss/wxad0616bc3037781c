"use strict";
const common_vendor = require("../../common/vendor.js");
const closeIcon = "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-frontend-mobile-commons-close-icon-75e80e51.png";
const _sfc_main = {
  __name: "CommentLotteryPasswordModal",
  props: {
    activeModal: {
      type: String,
      required: true
    },
    passwordText: {
      type: String,
      default: "好运连连"
    },
    countdown: {
      type: Number,
      default: 10
    }
  },
  emits: ["close", "send-comment"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const displayPasswordText = common_vendor.computed(() => String(props.passwordText || "").trim() || "好运连连");
    const remainSeconds = common_vendor.ref(props.countdown);
    let timer = null;
    function clearAutoCloseTimer() {
      if (!timer)
        return;
      clearInterval(timer);
      timer = null;
    }
    function startAutoCloseTimer() {
      clearAutoCloseTimer();
      remainSeconds.value = Math.max(Number(props.countdown) || 10, 1);
      timer = setInterval(() => {
        remainSeconds.value -= 1;
        if (remainSeconds.value <= 0) {
          clearAutoCloseTimer();
          emit("close");
        }
      }, 1e3);
    }
    common_vendor.watch(
      () => props.activeModal,
      (modal) => {
        if (modal === "commentPasswordChanged") {
          startAutoCloseTimer();
          return;
        }
        clearAutoCloseTimer();
      },
      { immediate: true }
    );
    common_vendor.onBeforeUnmount(clearAutoCloseTimer);
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.activeModal === "commentPasswordChanged"
      }, __props.activeModal === "commentPasswordChanged" ? {
        b: common_vendor.t(displayPasswordText.value),
        c: common_vendor.o(($event) => emit("send-comment", displayPasswordText.value), "62"),
        d: common_vendor.t(remainSeconds.value),
        e: closeIcon,
        f: common_vendor.o(($event) => emit("close"), "24")
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-cbf1ce47"]]);
wx.createComponent(Component);
