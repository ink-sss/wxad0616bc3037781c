"use strict";
const common_vendor = require("../../../../common/vendor.js");
if (!Math) {
  wdTransition();
}
const wdTransition = () => "../wd-transition/wd-transition.js";
const __default__ = {
  name: "wd-overlay",
  options: {
    virtualHost: true,
    addGlobalClass: true,
    styleIsolation: "shared"
  }
};
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  ...__default__,
  props: common_vendor.overlayProps,
  emits: ["click"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    function handleClick() {
      emit("click");
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(handleClick, "66"),
        b: common_vendor.p({
          show: _ctx.show,
          name: "fade",
          ["custom-class"]: "wd-overlay",
          duration: _ctx.duration,
          ["custom-style"]: `z-index: ${_ctx.zIndex}; ${_ctx.customStyle}`,
          ["disable-touch-move"]: _ctx.lockScroll
        })
      };
    };
  }
});
wx.createComponent(_sfc_main);
