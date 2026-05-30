"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  props: {
    isCoupon: Boolean,
    couponList: {
      type: [Array, Object],
      default: () => []
    },
    discount: {
      type: Object,
      default: () => ({ product_reduce: [], give_points: 0, product_coupon: [] })
    }
  },
  data() {
    return {
      phoneHeight: 0,
      scrollviewHigh: 0,
      Visible: false,
      datalist: {},
      ratio: 1
    };
  },
  mounted() {
    this.init();
  },
  watch: {
    isCoupon(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.Visible = newValue;
        this.datalist = this.couponList;
        this.getHeight();
      }
    }
  },
  methods: {
    init() {
      common_vendor.index.getSystemInfo({
        success: (res) => {
          this.phoneHeight = res.windowHeight;
          this.ratio = res.windowWidth / 750;
          this.getHeight();
        }
      });
    },
    getHeight() {
      const count = Object.keys(this.couponList).length;
      if (count > 2)
        this.scrollviewHigh = 0.5 * this.phoneHeight;
      else if (count === 1)
        this.scrollviewHigh = 250 * this.ratio + 60;
      else if (count === 2)
        this.scrollviewHigh = 460 * this.ratio + 60;
    },
    selectCoupon(item, index) {
      common_vendor.index.showLoading({ title: "领取中" });
      this._post("user.coupon/receive", {
        coupon_id: item.coupon_id
      }, () => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "领取成功", duration: 2e3, icon: "success" });
        this.datalist[index].is_receive = true;
      });
    },
    closePopup() {
      this.$emit("close");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args), "6d"),
    b: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args), "8e"),
    c: $props.discount.product_reduce.length > 0
  }, $props.discount.product_reduce.length > 0 ? {
    d: common_vendor.f($props.discount.product_reduce, (item, index, i0) => {
      return common_vendor.e({
        a: item.full_type === 1
      }, item.full_type === 1 ? {
        b: common_vendor.t(item.full_value)
      } : {}, {
        c: item.full_type === 2
      }, item.full_type === 2 ? {
        d: common_vendor.t(item.full_value)
      } : {}, {
        e: item.reduce_type === 1
      }, item.reduce_type === 1 ? {
        f: common_vendor.t(item.reduce_value)
      } : {}, {
        g: item.reduce_type === 2
      }, item.reduce_type === 2 ? {
        h: common_vendor.t((100 - item.reduce_value) / 10)
      } : {}, {
        i: index
      });
    })
  } : {}, {
    e: $props.discount.give_points > 0
  }, $props.discount.give_points > 0 ? {
    f: common_vendor.t(_ctx.points_name()),
    g: common_vendor.t(_ctx.points_name()),
    h: common_vendor.t($props.discount.give_points),
    i: common_vendor.t(_ctx.points_name())
  } : {}, {
    j: common_vendor.f($data.datalist, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.name),
        b: item.expire_type === 10
      }, item.expire_type === 10 ? {
        c: common_vendor.t(item.expire_day)
      } : {}, {
        d: item.expire_type === 20
      }, item.expire_type === 20 ? {
        e: common_vendor.t(item.start_time.text),
        f: common_vendor.t(item.end_time.text)
      } : {}, {
        g: item.coupon_type.value === 20
      }, item.coupon_type.value === 20 ? {
        h: common_vendor.t(item.max_price > 0 ? "最多抵扣" + Number(item.max_price) + "元" : "无最高抵扣限制")
      } : {}, {
        i: item.coupon_type.value === 10
      }, item.coupon_type.value === 10 ? {
        j: common_vendor.t(Number(item.reduce_price))
      } : {}, {
        k: item.coupon_type.value === 20
      }, item.coupon_type.value === 20 ? {
        l: common_vendor.t(item.discount)
      } : {}, {
        m: common_vendor.t(item.min_price > 0 ? "满" + Number(item.min_price) + "元可用" : "无门槛"),
        n: !item.is_receive
      }, !item.is_receive ? {
        o: common_vendor.o(($event) => $options.selectCoupon(item, index), item.coupon_id || index)
      } : {}, {
        p: common_vendor.n(item.is_get ? "coupon-item coupon-item-gray" : "coupon-item coupon-item-" + item.color.text),
        q: item.apply_range === 20
      }, item.apply_range === 20 ? {
        r: common_vendor.o(($event) => _ctx.gotoPage("/pages/coupon/detail?coupon_id=" + item.coupon_id + "&apply_range=" + item.apply_range), item.coupon_id || index)
      } : item.apply_range === 30 ? {
        t: common_vendor.o(($event) => _ctx.gotoPage("/pages/coupon/detail?coupon_id=" + item.coupon_id + "&apply_range=" + item.apply_range), item.coupon_id || index)
      } : {}, {
        s: item.apply_range === 30,
        v: item.coupon_id || index
      });
    }),
    k: $data.scrollviewHigh + "px",
    l: common_vendor.o(() => {
    }, "32"),
    m: common_vendor.n($data.Visible ? "open" : "close")
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f7f34019"]]);
wx.createComponent(Component);
