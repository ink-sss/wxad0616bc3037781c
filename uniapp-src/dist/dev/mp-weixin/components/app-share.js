"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "AppShare",
  props: { isAppShare: Boolean, appParams: { type: Object, default: () => ({}) } },
  emits: ["close"],
  data() {
    return { visible: false, shareConfig: {}, logo: "" };
  },
  watch: { isAppShare: { immediate: true, handler(value) {
    this.visible = !!value;
  } } },
  created() {
    this.getData();
  },
  methods: {
    getData() {
      if (typeof this._get !== "function")
        return;
      this._get("settings/appShare", {}, (res) => {
        var _a, _b;
        this.shareConfig = ((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.appshare) || {};
        this.logo = ((_b = res == null ? void 0 : res.data) == null ? void 0 : _b.logo) || "";
      });
    },
    closePopup() {
      this.visible = false;
      this.$emit("close");
    },
    share(type, scene) {
      const params = this.appParams || {};
      const config = this.shareConfig || {};
      const payload = { provider: "weixin", scene, type, title: params.title || "", summary: params.summary || "", imageUrl: params.image || this.logo };
      if (config.type === 2) {
        payload.scene = "WXSceneSession";
        payload.type = 5;
        payload.miniProgram = { id: config.gh_id, path: params.path || "", webUrl: config.web_url, type: 0 };
      } else if (config.type === 1 && config.open_site) {
        payload.href = config.open_site + (params.path || "");
      } else if (config.down_url) {
        payload.href = config.down_url;
      }
      if (typeof common_vendor.index.share === "function")
        common_vendor.index.share(payload);
      else
        this.$emit("close");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o(($event) => $options.share(0, "WXSceneSession"), "51"),
    b: common_vendor.o(($event) => $options.share(0, "WXSenceTimeline"), "82"),
    c: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args), "a0"),
    d: common_vendor.o(() => {
    }, "32"),
    e: common_vendor.n($data.visible ? "open" : "close"),
    f: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args), "09")
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-834698c0"]]);
wx.createComponent(Component);
