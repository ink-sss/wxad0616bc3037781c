"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_routeNavigation = require("../../utils/route-navigation.js");
const ARROW_DOWN_ICON = "";
const _sfc_main = {
  __name: "WatchDurationRewardModal",
  props: {
    activeModal: {
      type: String,
      required: true
    },
    assets: {
      type: Object,
      required: true
    },
    watchRewards: {
      type: Array,
      default: () => []
    },
    openKey: {
      type: Number,
      default: 0
    },
    rewardResult: {
      type: Object,
      default: null
    },
    recordUrl: {
      type: String,
      default: "/pages/prize-record/index"
    }
  },
  emits: ["close", "claim"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const hiddenWatchDurationReward = common_vendor.ref(false);
    const fallbackRewards = [
      {
        activityId: "preview-coupon",
        duration: 1,
        thresholdSec: 60,
        watchedSec: 60,
        claimStatus: 1,
        rewardType: 2,
        rewardName: "测试",
        rewardQuantity: 1,
        couponAmount: "",
        couponMinAmount: "1.00",
        couponDesc: "全部商品可用，不允许与折扣价或秒杀优惠等营销活动使用，优惠券不可叠加使用",
        validityText: "领取当日1天内可用"
      },
      {
        activityId: "preview-goods",
        duration: 1,
        thresholdSec: 60,
        watchedSec: 60,
        claimStatus: 1,
        rewardType: 1,
        rewardName: "测试商品",
        rewardImage: props.assets.watchRewardGoodsProduct,
        rewardQuantity: 1,
        remainingStock: 98
      }
    ];
    const collapsedMap = common_vendor.reactive({});
    const displayRewards = common_vendor.computed(() => {
      return props.watchRewards.length ? props.watchRewards : fallbackRewards;
    });
    const isWatchDurationRewardVisible = common_vendor.computed(() => props.activeModal === "watchDurationReward" && !hiddenWatchDurationReward.value);
    const goodsReward = common_vendor.computed(() => props.rewardResult || fallbackRewards[1]);
    const goodsRewardQuantity = common_vendor.computed(() => Number(goodsReward.value.rewardQuantity || 1) || 1);
    const goodsRewardName = common_vendor.computed(() => formatRewardName(goodsReward.value) || "大米");
    const goodsRewardImage = common_vendor.computed(() => getRewardImage(goodsReward.value));
    const goodsRewardStockText = common_vendor.computed(() => {
      var _a;
      if ((_a = props.rewardResult) == null ? void 0 : _a.needReceiver)
        return "请在订单中补充收货信息";
      if (props.rewardResult)
        return "领取成功，请在订单中查看";
      return "库存: 1斤";
    });
    const goodsRewardButtonText = common_vendor.computed(() => props.rewardResult ? "我知道了" : "立即领取");
    function getRewardKey(reward, index) {
      return reward.activityId || `${reward.rewardType}-${index}`;
    }
    function toNumber(value, fallback = 0) {
      const n = Number(value);
      return Number.isFinite(n) ? n : fallback;
    }
    function isCollapsed(reward) {
      return Boolean(collapsedMap[getRewardKey(reward, 0)]);
    }
    function toggleCollapse(reward) {
      const key = getRewardKey(reward, 0);
      collapsedMap[key] = !collapsedMap[key];
    }
    function getRewardIcon(reward) {
      return Number(reward.rewardType) === 1 ? props.assets.watchRewardGoodsIcon : props.assets.watchRewardCouponIcon;
    }
    function getRewardImage(reward) {
      return reward.rewardImage || reward.productImage || props.assets.watchRewardGoodsProduct;
    }
    function formatRewardName(reward) {
      return reward.rewardName || reward.productName || reward.couponName || "观看奖励";
    }
    function formatRewardLabel(reward) {
      const quantity = toNumber(reward.rewardQuantity, 1) || 1;
      return Number(reward.rewardType) === 1 ? `商品${quantity}件` : `优惠券${quantity}张`;
    }
    function formatProgress(reward) {
      const duration = toNumber(reward.duration, Math.ceil(toNumber(reward.thresholdSec) / 60)) || 0;
      const watchedMin = Math.min(Math.floor(toNumber(reward.watchedSec) / 60), duration);
      return `${watchedMin}/${duration}`;
    }
    function getActionText(reward) {
      const status = Number(reward.claimStatus);
      if (status === 3)
        return "已领取";
      if (status === 5)
        return "已抢光";
      if (status === 2)
        return "领取中";
      if (status === 1)
        return "立即领取";
      const remaining = toNumber(reward.remainingSec);
      return remaining > 0 && remaining < 60 ? `${remaining}s` : "去观看";
    }
    function isActionDisabled(reward) {
      return Number(reward.claimStatus) !== 1;
    }
    function handleRewardAction(reward) {
      if (Number(reward.claimStatus) === 1) {
        emit("claim", reward);
        return;
      }
      if (Number(reward.claimStatus) === 0) {
        emit("close");
      }
    }
    function closeModal() {
      hiddenWatchDurationReward.value = true;
      emit("close");
    }
    function openPrizeRecord() {
      utils_routeNavigation.navigateToPrizeRecord(props.recordUrl);
    }
    common_vendor.watch(
      () => props.activeModal,
      (activeModal, oldActiveModal) => {
        if (activeModal === "watchDurationReward" && oldActiveModal !== "watchDurationReward") {
          hiddenWatchDurationReward.value = false;
        }
        if (activeModal !== "watchDurationReward") {
          hiddenWatchDurationReward.value = false;
        }
      }
    );
    common_vendor.watch(
      () => props.openKey,
      () => {
        if (props.activeModal === "watchDurationReward") {
          hiddenWatchDurationReward.value = false;
        }
      }
    );
    function formatCouponAmount(reward) {
      return reward.couponAmount ? `¥${reward.couponAmount}` : "随机立减";
    }
    function formatCouponLimit(reward) {
      return reward.couponMinAmount ? `满${reward.couponMinAmount}元可用` : "无门槛";
    }
    function formatCouponDesc(reward) {
      return reward.couponDesc || reward.description || "领取后可在我的优惠券查看适用范围";
    }
    function formatCouponValidity(reward) {
      if (reward.couponStartTime && reward.couponEndTime) {
        return `${reward.couponStartTime} 至 ${reward.couponEndTime}`;
      }
      return reward.validityText || "有效期以券包为准";
    }
    function formatStock(reward) {
      if (Number(reward.claimStatus) === 5 || reward.stockExhausted) {
        return "已抢光";
      }
      if (reward.remainingStock !== void 0 && reward.remainingStock !== null) {
        return `库存：${reward.remainingStock}份`;
      }
      return "数量有限，先到先得";
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.activeModal === "watchGoodsReward"
      }, __props.activeModal === "watchGoodsReward" ? common_vendor.e({
        b: common_vendor.t(goodsRewardQuantity.value),
        c: goodsRewardImage.value,
        d: common_vendor.t(goodsRewardName.value),
        e: common_vendor.t(goodsRewardStockText.value),
        f: common_vendor.t(goodsRewardButtonText.value),
        g: common_vendor.o(($event) => emit("close"), "3c"),
        h: __props.rewardResult
      }, __props.rewardResult ? {
        i: common_vendor.o(openPrizeRecord, "c9")
      } : {}, {
        j: common_vendor.o(($event) => emit("close"), "68"),
        k: common_vendor.o(($event) => emit("close"), "08")
      }) : {}, {
        l: isWatchDurationRewardVisible.value
      }, isWatchDurationRewardVisible.value ? {
        m: common_vendor.o(closeModal, "f0"),
        n: common_vendor.o(closeModal, "cd"),
        o: __props.assets.watchRewardPopupBg,
        p: __props.assets.watchRewardCloseIcon,
        q: common_vendor.o(closeModal, "56"),
        r: common_vendor.o(closeModal, "ce"),
        s: common_vendor.f(displayRewards.value, (reward, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(formatProgress(reward)),
            b: getRewardIcon(reward),
            c: common_vendor.t(formatRewardLabel(reward)),
            d: isCollapsed(reward) ? 1 : "",
            e: common_vendor.o(($event) => toggleCollapse(reward), getRewardKey(reward, index)),
            f: common_vendor.t(getActionText(reward)),
            g: isActionDisabled(reward) ? 1 : "",
            h: Number(reward.claimStatus) === 3 ? 1 : "",
            i: common_vendor.o(($event) => handleRewardAction(reward), getRewardKey(reward, index)),
            j: common_vendor.o(($event) => handleRewardAction(reward), getRewardKey(reward, index)),
            k: Number(reward.rewardType) === 2
          }, Number(reward.rewardType) === 2 ? {
            l: common_vendor.t(formatCouponAmount(reward)),
            m: common_vendor.t(formatCouponLimit(reward)),
            n: common_vendor.t(formatRewardName(reward)),
            o: common_vendor.t(formatCouponDesc(reward)),
            p: common_vendor.t(formatCouponValidity(reward)),
            q: isCollapsed(reward) ? 1 : "",
            r: `url(${__props.assets.watchRewardCouponBg})`
          } : {
            s: getRewardImage(reward),
            t: common_vendor.t(formatRewardName(reward)),
            v: common_vendor.t(formatStock(reward)),
            w: isCollapsed(reward) ? 1 : ""
          }, {
            x: getRewardKey(reward, index)
          });
        }),
        t: __props.assets.watchRewardBottomIcon,
        v: common_vendor.t(ARROW_DOWN_ICON)
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4d8a88eb"]]);
wx.createComponent(Component);
