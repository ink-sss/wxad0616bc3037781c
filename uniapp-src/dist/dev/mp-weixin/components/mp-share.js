"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "MpShare",
  props: { isMpShare: Boolean },
  emits: ["close"],
  data() {
    return { visible: false };
  },
  computed: { shareImage() {
    var _a;
    return (((_a = this.config) == null ? void 0 : _a.pic_url) || "") + "/static/share.png";
  } },
  watch: { isMpShare: { immediate: true, handler(value) {
    this.visible = !!value;
  } } },
  methods: { closePopup() {
    this.visible = false;
    this.$emit("close");
  } }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $options.shareImage,
    b: common_vendor.n($data.visible ? "open" : "close"),
    c: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args), "09")
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4bc10a0e"]]);
wx.createComponent(Component);
