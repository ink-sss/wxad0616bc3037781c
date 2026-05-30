"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  name: "DiyService",
  props: { itemData: { type: Object, default: () => ({}) } },
  computed: {
    params() {
      return this.itemData.params || {};
    },
    styleConfig() {
      return this.itemData.style || {};
    },
    serviceStyle() {
      const s = this.styleConfig;
      return `right:${s.right || 0}%;bottom:${s.bottom || 0}%;opacity:${Number(s.opacity || 100) / 100};`;
    }
  },
  methods: {
    callPhone() {
      if (this.params.phone_num)
        common_vendor.index.makePhoneCall({ phoneNumber: this.params.phone_num });
    },
    gotoService() {
      if (typeof this.getUserId === "function" && this.getUserId())
        this.gotoPage(`/pagesPlus/chat/chat?chat_user_id=${this.itemData.data}&nickName=平台客服`);
      else if (typeof this.doLogin === "function")
        this.doLogin();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $options.params.type === "phone"
  }, $options.params.type === "phone" ? {
    b: $options.params.image,
    c: common_vendor.o((...args) => $options.callPhone && $options.callPhone(...args), "5d")
  } : {}, {
    d: $options.params.type === "wx"
  }, $options.params.type === "wx" ? {
    e: $options.params.image
  } : {}, {
    f: $options.params.type === "chat" && $props.itemData.data
  }, $options.params.type === "chat" && $props.itemData.data ? {
    g: $options.params.image,
    h: common_vendor.o((...args) => $options.gotoService && $options.gotoService(...args), "78")
  } : {}, {
    i: common_vendor.s($options.serviceStyle)
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-45c39c8a"]]);
wx.createComponent(Component);
