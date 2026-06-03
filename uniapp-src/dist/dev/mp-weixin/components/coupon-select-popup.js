"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  __name: "coupon-select-popup",
  props: {
    visible: { type: Boolean, default: false },
    usableCoupons: { type: Array, default: () => [] },
    unusableCoupons: { type: Array, default: () => [] },
    selectedCouponId: { type: Number, default: 0 },
    zIndex: { type: Number, default: 100000001 }
  },
  emits: ["close", "select-coupon"],
  setup(__props, { emit: __emit }) {
    common_vendor.useCssVars((_ctx) => ({
      "30449253": __props.zIndex
    }));
    const props = __props;
    const emit = __emit;
    const activeTab = common_vendor.ref("usable");
    const draftCouponId = common_vendor.ref(0);
    common_vendor.watch(
      () => props.visible,
      (visible) => {
        if (visible) {
          activeTab.value = props.usableCoupons.length > 0 || props.unusableCoupons.length === 0 ? "usable" : "unusable";
          draftCouponId.value = Number(props.selectedCouponId) || 0;
        }
      }
    );
    common_vendor.watch(
      () => props.selectedCouponId,
      (id) => {
        if (props.visible)
          draftCouponId.value = Number(id) || 0;
      }
    );
    const displayCoupons = common_vendor.computed(() => activeTab.value === "usable" ? props.usableCoupons : props.unusableCoupons);
    const bestCoupon = common_vendor.computed(() => {
      if (!props.usableCoupons.length)
        return null;
      return props.usableCoupons.reduce((best, coupon) => {
        const bestAmount = Number(best.previewDiscount || best.reduceAmount || 0);
        const amount = Number(coupon.previewDiscount || coupon.reduceAmount || 0);
        return amount > bestAmount ? coupon : best;
      }, props.usableCoupons[0]);
    });
    function couponKey(coupon, index) {
      return coupon.customerCouponId || coupon.couponId || coupon.id || `${coupon.couponName || "coupon"}-${index}`;
    }
    function formatAmount(value) {
      const amount = Number(value || 0);
      if (!Number.isFinite(amount))
        return "0.00";
      return amount.toFixed(2);
    }
    function amountParts(coupon) {
      const [integer, decimal = "00"] = formatAmount(coupon.previewDiscount || coupon.reduceAmount).split(".");
      return { integer, decimal };
    }
    function formatLimit(coupon) {
      const minAmount = Number(coupon.minAmount || 0);
      return minAmount > 0 ? `满${formatAmount(minAmount)}可用` : "无门槛";
    }
    function formatScope(coupon) {
      return coupon.scopeText || coupon.applicableText || coupon.useScope || "适用商品以结算页为准";
    }
    function formatValidity(coupon) {
      const start = coupon.startTime || coupon.validStartTime || coupon.effectiveAt || "";
      const end = coupon.endTime || coupon.validEndTime || coupon.expiredAt || "";
      if (start && end)
        return `${start} - ${end}`;
      if (end)
        return `有效期至 ${end}`;
      return "有效期以券包为准";
    }
    function isDraftSelected(coupon) {
      return Number(coupon.customerCouponId) === Number(draftCouponId.value);
    }
    function onCouponTap(coupon) {
      if (activeTab.value !== "usable")
        return;
      draftCouponId.value = Number(coupon.customerCouponId) || 0;
    }
    function selectBestCoupon() {
      if (!bestCoupon.value)
        return;
      activeTab.value = "usable";
      draftCouponId.value = Number(bestCoupon.value.customerCouponId) || 0;
    }
    function confirmSelection() {
      emit("select-coupon", Number(draftCouponId.value) || 0);
      emit("close");
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.visible
      }, __props.visible ? common_vendor.e({
        b: common_vendor.o(($event) => emit("close"), "ca"),
        c: bestCoupon.value
      }, bestCoupon.value ? {
        d: common_vendor.t(formatAmount(bestCoupon.value.previewDiscount || bestCoupon.value.reduceAmount)),
        e: common_vendor.o(selectBestCoupon, "9a")
      } : {}, {
        f: common_vendor.t(__props.usableCoupons.length),
        g: common_vendor.n(activeTab.value === "usable" ? "coupon-tab-active" : ""),
        h: common_vendor.o(($event) => activeTab.value = "usable", "6f"),
        i: common_vendor.t(__props.unusableCoupons.length),
        j: common_vendor.n(activeTab.value === "unusable" ? "coupon-tab-active" : ""),
        k: common_vendor.o(($event) => activeTab.value = "unusable", "6f"),
        l: activeTab.value === "usable"
      }, activeTab.value === "usable" ? common_vendor.e({
        m: draftCouponId.value === 0
      }, draftCouponId.value === 0 ? {} : {}, {
        n: common_vendor.n(draftCouponId.value === 0 ? "coupon-check-active" : ""),
        o: common_vendor.o(($event) => draftCouponId.value = 0, "a1")
      }) : {}, {
        p: displayCoupons.value.length
      }, displayCoupons.value.length ? {
        q: common_vendor.f(displayCoupons.value, (coupon, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(amountParts(coupon).integer),
            b: common_vendor.t(amountParts(coupon).decimal),
            c: common_vendor.t(formatLimit(coupon)),
            d: common_vendor.t(coupon.couponName || coupon.name || "优惠券"),
            e: common_vendor.t(formatScope(coupon)),
            f: common_vendor.t(formatValidity(coupon))
          }, activeTab.value === "unusable" ? {
            g: common_vendor.t(coupon.unusableReason || coupon.reason || "当前商品不可用")
          } : {}, activeTab.value === "usable" ? {
            h: common_vendor.t(isDraftSelected(coupon) ? "已选" : "使用"),
            i: common_vendor.n(isDraftSelected(coupon) ? "coupon-use-state-active" : "")
          } : {}, {
            j: couponKey(coupon, index),
            k: common_vendor.o(($event) => onCouponTap(coupon), couponKey(coupon, index))
          });
        }),
        r: activeTab.value === "unusable",
        s: activeTab.value === "usable",
        t: common_vendor.n(activeTab.value === "unusable" ? "coupon-card-disabled" : "")
      } : {
        v: common_vendor.t(activeTab.value === "usable" ? "暂无可用优惠券" : "暂无不可用优惠券")
      }, {
        w: activeTab.value === "usable"
      }, activeTab.value === "usable" ? {
        x: common_vendor.t(draftCouponId.value ? "已选择 1 张优惠券" : "暂不使用优惠券")
      } : {}, {
        y: common_vendor.o(confirmSelection, "96"),
        z: common_vendor.o(() => {
        }, "85"),
        A: common_vendor.o(($event) => emit("close"), "e2"),
        B: common_vendor.s(_ctx.__cssVars())
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-cdb6c322"]]);
wx.createComponent(Component);
