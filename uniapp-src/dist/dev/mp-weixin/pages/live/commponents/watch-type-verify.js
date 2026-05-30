"use strict";
const pages_live_pageTools = require("../page-tools.js");
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  props: {
    liveId: { type: [Number, String], default: "" },
    mode: { type: String, default: "password" }
  },
  emits: ["ok"],
  data() {
    return {
      visible: false,
      value: "",
      submitting: false,
      currentMode: this.mode
    };
  },
  methods: {
    open(mode = this.mode) {
      this.currentMode = mode;
      this.visible = true;
    },
    close() {
      this.visible = false;
    },
    submit() {
      if (!this.value || this.submitting)
        return;
      this.submitting = true;
      const endpoint = this.currentMode === "mobile" ? "live.index/verifyWatchMobile" : "live.index/verifyWatchPwd";
      pages_live_pageTools.requestWithVm(this, "_post", endpoint, {
        live_id: this.liveId,
        value: this.value,
        mobile: this.value,
        password: this.value
      }).then(() => {
        this.close();
        this.$emit("ok");
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
    b: common_vendor.t($data.currentMode === "mobile" ? "手机号验证" : "观看密码"),
    c: $data.currentMode !== "mobile",
    d: $data.currentMode === "mobile" ? "请输入手机号" : "请输入观看密码",
    e: $data.value,
    f: common_vendor.o(($event) => $data.value = $event.detail.value, "73"),
    g: $data.submitting,
    h: common_vendor.o((...args) => $options.submit && $options.submit(...args), "d9")
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-532c7d4b"]]);
wx.createComponent(Component);
