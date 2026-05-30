"use strict";
const common_vendor = require("../../../../common/vendor.js");
const UniIcons = () => "../../../uni-icons/components/uni-icons/uni-icons.js";
const _sfc_main = {
  name: "UniNoticeBar",
  components: { UniIcons },
  props: { text: { type: String, default: "" }, color: { type: String, default: "#ed6a0c" }, backgroundColor: { type: String, default: "#fffbe8" }, showIcon: Boolean, showClose: Boolean, scrollable: Boolean, single: Boolean },
  emits: ["click", "close"],
  data() {
    return { show: true };
  },
  computed: { barStyle() {
    return { color: this.color, backgroundColor: this.backgroundColor };
  } },
  methods: { close() {
    this.show = false;
    this.$emit("close");
  } }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../../uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.show
  }, $data.show ? common_vendor.e({
    b: $props.showIcon
  }, $props.showIcon ? {
    c: common_vendor.p({
      type: "info",
      color: $props.color,
      size: 18
    })
  } : {}, {
    d: common_vendor.t($props.text),
    e: $props.showClose
  }, $props.showClose ? {
    f: common_vendor.o($options.close, "11"),
    g: common_vendor.p({
      type: "close",
      color: $props.color,
      size: 18
    })
  } : {}, {
    h: common_vendor.s($options.barStyle),
    i: common_vendor.o(($event) => _ctx.$emit("click"), "50")
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-15b4e47c"]]);
wx.createComponent(Component);
