"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  props: {
    liveId: { type: [Number, String], default: "" },
    onlineNumber: { type: [Number, String], default: 0 }
  },
  emits: ["goShop", "sendLbMsg", "callBMethod"],
  computed: {
    displayNumber() {
      const value = Number(this.onlineNumber || 0);
      return value > 9999 ? `${(value / 1e4).toFixed(1)}万` : value;
    }
  },
  methods: {
    getLuckyBag() {
      this.$emit("callBMethod");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($options.displayNumber),
    b: common_vendor.o(($event) => _ctx.$emit("goShop"), "5d")
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-026e2678"]]);
wx.createComponent(Component);
