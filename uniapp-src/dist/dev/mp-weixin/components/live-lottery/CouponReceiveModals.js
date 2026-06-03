"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_routeNavigation = require("../../utils/route-navigation.js");
const AUTO_CLOSE_SECONDS = 8;
const _sfc_main = {
  __name: "CouponReceiveModals",
  props: {
    activeModal: {
      type: String,
      required: true
    },
    assets: {
      type: Object,
      required: true
    },
    coupon: {
      type: Object,
      default: null
    },
    recordUrl: {
      type: String,
      default: "/pages/prize-record/index"
    }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const closeCountdown = common_vendor.ref(AUTO_CLOSE_SECONDS);
    let closeTimer = null;
    const image = {
      tip: "/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-goods-refund-tip-5eba5241.png",
      add: "/static/remote-icons/nyfs-oss-bcvdata-com-public-mobile-images-add-icon-58e6dd01.png"
    };
    const isCenterCouponModal = common_vendor.computed(() => {
      return props.activeModal === "couponReceive" || props.activeModal === "couponReceiveSuccess";
    });
    const isSuccess = common_vendor.computed(() => props.activeModal === "couponReceiveSuccess");
    const couponQuantity = common_vendor.computed(() => {
      var _a;
      return Number(((_a = props.coupon) == null ? void 0 : _a.rewardQuantity) || 1) || 1;
    });
    const couponAmount = common_vendor.computed(() => {
      var _a, _b;
      const amount = ((_a = props.coupon) == null ? void 0 : _a.couponAmount) || ((_b = props.coupon) == null ? void 0 : _b.amount) || "";
      return amount ? String(amount) : "40.05";
    });
    const couponAmountParts = common_vendor.computed(() => {
      const [integer, decimal = ""] = couponAmount.value.split(".");
      return { integer: integer || "0", decimal: decimal ? `.${decimal}` : "" };
    });
    const couponAmountInteger = common_vendor.computed(() => couponAmountParts.value.integer);
    const couponAmountDecimal = common_vendor.computed(() => couponAmountParts.value.decimal);
    const couponLimitText = common_vendor.computed(() => {
      var _a, _b;
      const minAmount = ((_a = props.coupon) == null ? void 0 : _a.couponMinAmount) || ((_b = props.coupon) == null ? void 0 : _b.minAmount) || "";
      if (minAmount)
        return `满${minAmount}可用`;
      return props.coupon ? "无门槛" : "满100可用";
    });
    const couponName = common_vendor.computed(() => {
      var _a, _b;
      return ((_a = props.coupon) == null ? void 0 : _a.rewardName) || ((_b = props.coupon) == null ? void 0 : _b.couponName) || "优惠券名称优惠券名...";
    });
    const couponDesc = common_vendor.computed(() => {
      var _a, _b;
      return ((_a = props.coupon) == null ? void 0 : _a.couponDesc) || ((_b = props.coupon) == null ? void 0 : _b.description) || "全部商品可用，允许与折后或秒杀优惠等营销活...";
    });
    const couponValidity = common_vendor.computed(() => {
      var _a, _b, _c;
      if (((_a = props.coupon) == null ? void 0 : _a.couponStartTime) && ((_b = props.coupon) == null ? void 0 : _b.couponEndTime)) {
        return `${props.coupon.couponStartTime} 至 ${props.coupon.couponEndTime}`;
      }
      return ((_c = props.coupon) == null ? void 0 : _c.validityText) || (props.coupon ? "有效期以券包为准" : "领取当日2天内可用");
    });
    common_vendor.watch(
      () => props.activeModal,
      (modal) => {
        if (modal === "couponReceiveSuccess") {
          startAutoCloseCountdown();
          return;
        }
        stopAutoCloseCountdown();
        closeCountdown.value = AUTO_CLOSE_SECONDS;
      },
      { immediate: true }
    );
    function startAutoCloseCountdown() {
      stopAutoCloseCountdown();
      closeCountdown.value = AUTO_CLOSE_SECONDS;
      closeTimer = setInterval(() => {
        const next = closeCountdown.value - 1;
        if (next <= 0) {
          closeCountdown.value = 0;
          closeModal();
          return;
        }
        closeCountdown.value = next;
      }, 1e3);
    }
    function stopAutoCloseCountdown() {
      if (!closeTimer)
        return;
      clearInterval(closeTimer);
      closeTimer = null;
    }
    function closeModal() {
      stopAutoCloseCountdown();
      emit("close");
    }
    function openPrizeRecord() {
      utils_routeNavigation.navigateToPrizeRecord(props.recordUrl);
    }
    common_vendor.onBeforeUnmount(stopAutoCloseCountdown);
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isCenterCouponModal.value
      }, isCenterCouponModal.value ? common_vendor.e({
        b: !isSuccess.value
      }, !isSuccess.value ? {
        c: common_vendor.t(couponQuantity.value)
      } : {}, {
        d: common_vendor.t(couponAmountInteger.value),
        e: common_vendor.t(couponAmountDecimal.value),
        f: common_vendor.t(couponLimitText.value),
        g: common_vendor.t(couponName.value),
        h: common_vendor.t(couponDesc.value),
        i: common_vendor.t(couponValidity.value),
        j: isSuccess.value
      }, isSuccess.value ? {
        k: common_vendor.o(openPrizeRecord, "e2"),
        l: common_vendor.t(closeCountdown.value)
      } : {}, {
        m: isSuccess.value ? 1 : "",
        n: common_vendor.o(closeModal, "a1"),
        o: common_vendor.n(isSuccess.value ? "have-received" : "enable-receive"),
        p: common_vendor.o(closeModal, "4b")
      }) : {}, {
        q: __props.activeModal === "couponBindPhone"
      }, __props.activeModal === "couponBindPhone" ? {
        r: common_vendor.o(closeModal, "68"),
        s: image.tip,
        t: image.add,
        v: common_vendor.o(closeModal, "73")
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d77263d0"]]);
wx.createComponent(Component);
