"use strict";
const common_vendor = require("../common/vendor.js");
if (!Array) {
  const _easycom_wd_overlay2 = common_vendor.resolveComponent("wd-overlay");
  const _easycom_wd_transition2 = common_vendor.resolveComponent("wd-transition");
  (_easycom_wd_overlay2 + _easycom_wd_transition2)();
}
const _easycom_wd_overlay = () => "../node-modules/wot-design-uni/components/wd-overlay/wd-overlay.js";
const _easycom_wd_transition = () => "../node-modules/wot-design-uni/components/wd-transition/wd-transition.js";
if (!Math) {
  (_easycom_wd_overlay + _easycom_wd_transition)();
}
const _sfc_main = {
  __name: "bottom-sheet-popup",
  props: {
    visible: { type: Boolean, default: false },
    height: { type: String, default: "75vh" },
    background: { type: String, default: "#fff" },
    radius: { type: String, default: "24rpx 24rpx 0 0" },
    zIndex: { type: Number, default: 80 },
    duration: { type: Number, default: 500 },
    withMask: { type: Boolean, default: false },
    maskColor: { type: String, default: "rgba(0, 0, 0, 0.35)" },
    allowOverflow: { type: Boolean, default: false },
    showClose: { type: Boolean, default: true }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const overlayVisible = common_vendor.ref(false);
    let overlayTimer = null;
    const panelStyle = common_vendor.computed(() => {
      return {
        height: props.height,
        background: props.background,
        borderRadius: props.radius,
        overflow: props.allowOverflow ? "visible" : void 0
      };
    });
    common_vendor.watch(
      () => [props.visible, props.withMask, props.duration],
      ([visible, withMask, duration]) => {
        if (overlayTimer) {
          clearTimeout(overlayTimer);
          overlayTimer = null;
        }
        if (visible && withMask) {
          overlayVisible.value = false;
          overlayTimer = setTimeout(() => {
            overlayVisible.value = true;
            overlayTimer = null;
          }, duration);
          return;
        }
        overlayVisible.value = false;
      },
      { immediate: true }
    );
    common_vendor.onBeforeUnmount(() => {
      if (overlayTimer) {
        clearTimeout(overlayTimer);
        overlayTimer = null;
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => emit("close"), "9c"),
        b: common_vendor.p({
          show: overlayVisible.value,
          ["custom-style"]: "z-index:" + __props.zIndex + ";background:" + __props.maskColor + ";"
        }),
        c: __props.showClose
      }, __props.showClose ? {
        d: common_vendor.o(($event) => emit("close"), "d5")
      } : {}, {
        e: common_vendor.s(panelStyle.value),
        f: common_vendor.o(() => {
        }, "ac"),
        g: common_vendor.o(($event) => emit("close"), "eb"),
        h: common_vendor.p({
          show: __props.visible,
          duration: __props.duration,
          ["enter-class"]: "sheet-popup-enter",
          ["enter-active-class"]: "sheet-popup-enter-active",
          ["enter-to-class"]: "sheet-popup-enter-to",
          ["leave-class"]: "sheet-popup-leave",
          ["leave-active-class"]: "sheet-popup-leave-active",
          ["leave-to-class"]: "sheet-popup-leave-to",
          ["custom-style"]: "position:fixed;left:0;top:0;right:0;bottom:0;z-index:" + (__props.zIndex + 1) + ";"
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ef5aa7db"]]);
wx.createComponent(Component);
