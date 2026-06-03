"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "CommentPrizeConfirmModal",
  props: {
    activeModal: {
      type: String,
      required: true
    }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.activeModal === "commentPrizeConfirm"
      }, __props.activeModal === "commentPrizeConfirm" ? {
        b: common_vendor.o(($event) => emit("close"), "bf")
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-fbdcf40a"]]);
wx.createComponent(Component);
