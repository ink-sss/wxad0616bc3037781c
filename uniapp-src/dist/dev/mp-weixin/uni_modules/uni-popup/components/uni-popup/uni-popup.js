"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "UniPopup",
  props: { type: { type: String, default: "center" }, maskClick: { type: Boolean, default: true }, isMaskClick: { type: Boolean, default: true } },
  emits: ["change", "maskClick"],
  data() {
    return { visible: false };
  },
  methods: {
    open() {
      this.visible = true;
      this.$emit("change", { show: true, type: this.type });
    },
    close() {
      this.visible = false;
      this.$emit("change", { show: false, type: this.type });
    },
    onMaskClick() {
      if (this.maskClick || this.isMaskClick) {
        this.$emit("maskClick");
        this.close();
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.visible
  }, $data.visible ? {
    b: common_vendor.n("uni-popup__content--" + $props.type),
    c: common_vendor.o(() => {
    }, "4a"),
    d: common_vendor.o((...args) => $options.onMaskClick && $options.onMaskClick(...args), "65")
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-526cda1c"]]);
wx.createComponent(Component);
