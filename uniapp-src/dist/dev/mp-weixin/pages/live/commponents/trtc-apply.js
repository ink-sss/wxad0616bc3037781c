"use strict";
const common_vendor = require("../../../common/vendor.js");
const pages_live_pageTools = require("../page-tools.js");
const _sfc_main = {
  props: {
    liveId: { type: [Number, String], default: "" },
    isTrtcGo: { type: [Number, String], default: 0 }
  },
  emits: ["closeTrtc"],
  data() {
    return {
      visible: false,
      submitting: false
    };
  },
  methods: {
    open() {
      this.visible = true;
    },
    close() {
      this.visible = false;
    },
    applyTrtc() {
      if (this.submitting)
        return;
      this.submitting = true;
      pages_live_pageTools.requestWithVm(this, "_post", "live.trtc/applyTrtc", { live_id: this.liveId }).then(() => {
        common_vendor.index.showToast({ title: "申请已发送", icon: "none" });
        this.close();
      }).finally(() => {
        this.submitting = false;
      });
    },
    applyGo() {
      return pages_live_pageTools.requestWithVm(this, "_post", "live.trtc/applyGo", { live_id: this.liveId });
    },
    applyCancel() {
      if (this.submitting)
        return;
      this.submitting = true;
      pages_live_pageTools.requestWithVm(this, "_post", "live.trtc/applyCancel", { live_id: this.liveId }).then(() => {
        this.$emit("closeTrtc");
        this.close();
      }).finally(() => {
        this.submitting = false;
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.visible
  }, $data.visible ? {
    b: $data.submitting,
    c: common_vendor.o((...args) => $options.applyTrtc && $options.applyTrtc(...args), "3a"),
    d: $data.submitting,
    e: common_vendor.o((...args) => $options.applyCancel && $options.applyCancel(...args), "91"),
    f: common_vendor.o(() => {
    }, "e1"),
    g: common_vendor.o((...args) => $options.close && $options.close(...args), "0c")
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8d90ebb1"]]);
wx.createComponent(Component);
