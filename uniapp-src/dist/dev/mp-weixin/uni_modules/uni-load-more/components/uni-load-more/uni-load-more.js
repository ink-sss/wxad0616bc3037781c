"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "UniLoadMore",
  props: { status: { type: String, default: "more" }, contentText: { type: Object, default: () => ({ contentdown: "上拉显示更多", contentrefresh: "正在加载...", contentnomore: "没有更多数据了" }) } },
  computed: { statusText() {
    return this.status === "loading" ? this.contentText.contentrefresh : this.status === "noMore" || this.status === "nomore" ? this.contentText.contentnomore : this.contentText.contentdown;
  } }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($options.statusText)
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-db9a50fe"]]);
wx.createComponent(Component);
