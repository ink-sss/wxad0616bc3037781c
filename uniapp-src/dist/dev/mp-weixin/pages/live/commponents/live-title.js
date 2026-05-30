"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  props: {
    detail: { type: Object, default: () => ({}) }
  },
  computed: {
    avatar() {
      return this.detail.author_avatarUrl || this.detail.avatar || this.detail.logo || "https://weilive.yukelive.com/static/live/default_logo.jpeg";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $options.avatar,
    b: common_vendor.t($props.detail.name || $props.detail.title || "直播间"),
    c: common_vendor.t($props.detail.author_name || $props.detail.anchor_name || $props.detail.look_num || "")
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a1f54890"]]);
wx.createComponent(Component);
