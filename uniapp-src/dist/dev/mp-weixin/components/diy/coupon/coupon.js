"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  name: "DiyCoupon",
  props: { itemData: { type: Object, default: () => ({}) } },
  data() {
    return { listData: [] };
  },
  computed: {
    styleConfig() {
      return this.itemData.style || {};
    },
    params() {
      return this.itemData.params || {};
    },
    wrapperStyle() {
      const s = this.styleConfig;
      return `background:${s.bgcolor || ""};padding-left:${this.toRpx(s.paddingLeft)};padding-right:${this.toRpx(s.paddingLeft)};padding-top:${this.toRpx(s.paddingTop)};padding-bottom:${this.toRpx(s.paddingBottom)};`;
    },
    radiusStyle() {
      const top = 2 * Number(this.styleConfig.topRadio || 0);
      const bottom = 2 * Number(this.styleConfig.bottomRadio || 0);
      return `border-top-left-radius:${top}rpx;border-top-right-radius:${top}rpx;border-bottom-left-radius:${bottom}rpx;border-bottom-right-radius:${bottom}rpx;`;
    },
    boxStyle() {
      return `background:${Number(this.styleConfig.bgtype) === 1 ? this.styleConfig.background : "none"};${this.radiusStyle}`;
    },
    buttonStyle() {
      const s = this.styleConfig;
      return `color:${s.btnTxtcolor || ""};border-radius:${s.btnRadio || 0}px;background-color:${s.btncolor || ""};`;
    }
  },
  created() {
    this.listData = Array.isArray(this.itemData.data) ? this.itemData.data : [];
  },
  methods: {
    toRpx(value) {
      return `${2 * Number(value || 0)}rpx`;
    },
    receiveCoupon(index) {
      const coupon = this.listData[index];
      if (!coupon || coupon.state && coupon.state.value === 0 || typeof this._post !== "function")
        return;
      this._post("user.coupon/receive", { coupon_id: coupon.coupon_id }, () => {
        common_vendor.index.showToast({ title: "领取成功", icon: "success", mask: true, duration: 2e3 });
        coupon.state.value = 0;
        coupon.state.text = "已领取";
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.listData.length
  }, $data.listData.length ? common_vendor.e({
    b: Number($options.styleConfig.bgtype) === 2
  }, Number($options.styleConfig.bgtype) === 2 ? {
    c: $options.styleConfig.bgimage,
    d: common_vendor.s($options.radiusStyle)
  } : {}, {
    e: common_vendor.f($data.listData, (coupon, index, i0) => {
      return common_vendor.e({
        a: coupon.coupon_type && coupon.coupon_type.value === 10
      }, coupon.coupon_type && coupon.coupon_type.value === 10 ? {
        b: common_vendor.t(Number(coupon.reduce_price || 0))
      } : {}, {
        c: coupon.coupon_type && coupon.coupon_type.value === 20
      }, coupon.coupon_type && coupon.coupon_type.value === 20 ? {
        d: common_vendor.t(coupon.discount)
      } : {}, {
        e: common_vendor.t(Number(coupon.min_price || 0) > 0 ? `满${Number(coupon.min_price)}元可用` : "无门槛"),
        f: coupon.apply_range === 10
      }, coupon.apply_range === 10 ? {} : {}, {
        g: coupon.apply_range === 20
      }, coupon.apply_range === 20 ? {} : {}, {
        h: coupon.apply_range === 30
      }, coupon.apply_range === 30 ? {} : {}, {
        i: coupon.state && coupon.state.value === 1
      }, coupon.state && coupon.state.value === 1 ? {
        j: common_vendor.t($options.params.btntext),
        k: common_vendor.s($options.buttonStyle),
        l: common_vendor.o(($event) => $options.receiveCoupon(index), coupon.coupon_id || index)
      } : {
        m: common_vendor.t(coupon.state && coupon.state.text),
        n: common_vendor.s($options.buttonStyle)
      }, {
        o: coupon.coupon_id || index
      });
    }),
    f: common_vendor.s(`color:${$options.styleConfig.pricecolor || ""};`),
    g: common_vendor.s(`color:${$options.styleConfig.cillcolor || ""};`),
    h: common_vendor.s(`color:${$options.styleConfig.descolor || ""};`),
    i: common_vendor.s(`height:78px;border-bottom:1px dashed;border-color:${$options.styleConfig.btncolor || ""};`),
    j: common_vendor.s($options.boxStyle),
    k: common_vendor.s($options.wrapperStyle)
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ad4f6648"]]);
wx.createComponent(Component);
