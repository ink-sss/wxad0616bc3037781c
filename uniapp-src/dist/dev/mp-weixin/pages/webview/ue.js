"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      type: "",
      content: ""
    };
  },
  onLoad(query = {}) {
    this.type = query.type || "privacy";
    const title = this.type === "service" ? "用户协议" : "隐私协议";
    common_vendor.index.setNavigationBarTitle({ title });
    this.getData();
  },
  methods: {
    getData() {
      if (typeof this._get !== "function") {
        return;
      }
      this._get("user.userapple/policy", {}, (res) => {
        const data = res.data || {};
        this.content = this.type === "service" ? data.service : data.privacy;
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.content || ""
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e897ee3d"]]);
wx.createPage(MiniProgramPage);
