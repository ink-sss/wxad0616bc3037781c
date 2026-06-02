"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  name: "DiyOrder",
  props: {
    itemData: { type: Object, default: () => ({}) },
    userInfo: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      orderItem: [
        { name: "待付款", url: "/pages/order/list?status=unpay", pop: "payment" },
        { name: "待发货", url: "/pages/order/list?status=unsend", pop: "delivery" },
        { name: "待收货", url: "/pages/order/list?status=unreceive", pop: "received" },
        { name: "已完成", url: "/pages/order/list?status=finished", pop: "comment" },
        { name: "退款/售后", url: "/pages/order/refund-list", pop: "refund" }
      ]
    };
  },
  computed: {
    styleConfig() {
      return this.itemData && this.itemData.style || {};
    },
    styleType() {
      return this.styleConfig.type || 1;
    },
    orderCount() {
      return this.userInfo && this.userInfo.orderCount;
    },
    wrapStyle() {
      const style = this.styleConfig;
      return [
        `background:${style.bgcolor || ""}`,
        `padding:${this.rpx(style.paddingTop)} ${this.rpx(style.paddingLeft)} ${this.rpx(style.paddingBottom)} ${this.rpx(style.paddingLeft)}`
      ].join(";");
    },
    orderStyle() {
      const style = this.styleConfig;
      return [
        `background:${style.background || "#fff"}`,
        `border-radius:${this.rpx(style.topRadio)} ${this.rpx(style.topRadio)} ${this.rpx(style.bottomRadio)} ${this.rpx(style.bottomRadio)}`
      ].join(";");
    }
  },
  methods: {
    rpx(value) {
      const number = Number(value || 0) * 2;
      return `${Number.isNaN(number) ? 0 : number}rpx`;
    },
    openLink(url) {
      if (typeof this.gotoPage === "function")
        this.gotoPage(url);
      else
        common_vendor.index.navigateTo({ url });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.orderItem, (item, index, i0) => {
      return common_vendor.e({
        a: `/static/order/${$options.styleType}-${index}.png`
      }, $options.orderCount ? common_vendor.e({
        b: $options.orderCount[item.pop] != null && Number($options.orderCount[item.pop]) > 0
      }, $options.orderCount[item.pop] != null && Number($options.orderCount[item.pop]) > 0 ? {
        c: common_vendor.t($options.orderCount[item.pop])
      } : {}) : {}, {
        d: common_vendor.t(item.name),
        e: item.pop,
        f: common_vendor.o(($event) => $options.openLink(item.url), item.pop)
      });
    }),
    b: $options.orderCount,
    c: common_vendor.s($options.orderStyle),
    d: common_vendor.s($options.wrapStyle)
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-130d7d76"]]);
wx.createComponent(Component);
