"use strict";
const common_vendor = require("../../../common/vendor.js");
const TrtcApply = () => "./trtc-apply.js";
const _sfc_main = {
  components: { TrtcApply },
  props: {
    liveId: { type: [Number, String], default: "" },
    isTrtcGo: { type: [Number, String], default: 0 },
    disabled: { type: Boolean, default: false }
  },
  emits: ["sendBarrage", "clearScreen", "closeTrtc", "goShop"],
  data() {
    return {
      text: ""
    };
  },
  methods: {
    send() {
      const content = this.text.trim();
      if (!content)
        return;
      this.$emit("sendBarrage", content);
      this.text = "";
    },
    openTrtcApply() {
      this.$refs.trtcApply && this.$refs.trtcApply.open();
    }
  }
};
if (!Array) {
  const _component_trtc_apply = common_vendor.resolveComponent("trtc-apply");
  _component_trtc_apply();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.disabled,
    b: common_vendor.o((...args) => $options.send && $options.send(...args), "c7"),
    c: $data.text,
    d: common_vendor.o(($event) => $data.text = $event.detail.value, "42"),
    e: common_vendor.o(($event) => _ctx.$emit("clearScreen"), "c4"),
    f: common_vendor.o(($event) => _ctx.$emit("goShop"), "1f"),
    g: Number($props.isTrtcGo) === 1
  }, Number($props.isTrtcGo) === 1 ? {
    h: common_vendor.o((...args) => $options.openTrtcApply && $options.openTrtcApply(...args), "7f")
  } : {}, {
    i: common_vendor.sr("trtcApply", "17f926e3-0"),
    j: common_vendor.o(($event) => _ctx.$emit("closeTrtc"), "0f"),
    k: common_vendor.p({
      ["live-id"]: $props.liveId,
      ["is-trtc-go"]: $props.isTrtcGo
    })
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-17f926e3"]]);
wx.createComponent(Component);
