"use strict";
const common_vendor = require("../common/vendor.js");
const common_assets = require("../common/assets.js");
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
    const overlayStyle = common_vendor.computed(() => ({
      zIndex: props.zIndex,
      background: props.maskColor
    }));
    const rootStyle = common_vendor.computed(() => ({
      zIndex: props.zIndex + 1
    }));
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
        a: overlayVisible.value
      }, overlayVisible.value ? {
        b: common_vendor.s(overlayStyle.value),
        c: common_vendor.o(($event) => emit("close"), "b0")
      } : {}, {
        d: __props.visible
      }, __props.visible ? common_vendor.e({
        e: __props.showClose
      }, __props.showClose ? {
        f: common_assets._imports_0$9,
        g: common_vendor.o(($event) => emit("close"), "86")
      } : {}, {
        h: common_vendor.s(panelStyle.value),
        i: common_vendor.o(() => {
        }, "9b"),
        j: common_vendor.o(($event) => emit("close"), "53"),
        k: common_vendor.s(rootStyle.value)
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ef5aa7db"]]);
wx.createComponent(Component);
