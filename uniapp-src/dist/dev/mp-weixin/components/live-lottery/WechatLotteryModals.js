"use strict";
const common_vendor = require("../../common/vendor.js");
const base = "https://nyfs-oss.bcvdata.com/Public/Home/Images";
const _sfc_main = {
  __name: "WechatLotteryModals",
  props: {
    activeModal: {
      type: String,
      required: true
    },
    winners: {
      type: Array,
      required: true
    },
    prize: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const image = {
      avatar: "/static/remote-icons/nyfs-oss-bcvdata-com-uploads-consolewechat-1681-rtf-20260430144045241662-91b0e034.jpg",
      redAnimation: `${base}/redRain/redAnimation.png`,
      rotate: `${base}/redRain/rotate.png`,
      circle: `${base}/redRain/circle.png`,
      light: `${base}/redRain/light.png`,
      effectTop: `${base}/Watch/luckydraw/effectViewTopBg.png`,
      scrollCover: `${base}/Watch/luckydraw/luckScrollImg.png`,
      floorClose: `${base}/Watch/luckydraw/floorClose.png`,
      element: "/static/remote-icons/nyfs-oss-bcvdata-com-public-pkenvelope-element3-b60b22b7.png"
    };
    const prizeName = common_vendor.computed(() => props.prize.name || props.prize.title || "抽奖奖品");
    const prizeTitle = common_vendor.computed(() => prizeName.value);
    const sourceUsers = common_vendor.computed(() => props.winners.length > 0 ? props.winners : [{ name: "山奈", phone: "781****1", photo: image.avatar }]);
    const rollingUsers = common_vendor.computed(() => {
      const users = sourceUsers.value.length > 0 ? sourceUsers.value : [{ name: "用户", photo: image.avatar }];
      const cycleSize = Math.max(users.length, 10);
      const cycle = Array.from({ length: cycleSize }, (_, index) => {
        const item = users[index % users.length];
        return {
          sourceKey: item.key || item.customerId || item.name || index,
          name: item.name || "用户",
          phone: item.phone || "",
          photo: item.photo || image.avatar
        };
      });
      return [...cycle, ...cycle].map((item, index) => ({
        ...item,
        key: `source-lottery-user-${index}-${item.sourceKey}`
      }));
    });
    const countdownNumber = common_vendor.ref(3);
    let countdownTimer = null;
    function stopCountdown() {
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
    }
    function startCountdown() {
      stopCountdown();
      countdownNumber.value = 3;
      countdownTimer = setInterval(() => {
        countdownNumber.value = countdownNumber.value === 1 ? 3 : countdownNumber.value - 1;
      }, 1e3);
    }
    common_vendor.watch(
      () => props.activeModal,
      (activeModal) => {
        if (activeModal === "wechatLotteryCountdown") {
          startCountdown();
          return;
        }
        stopCountdown();
      },
      { immediate: true }
    );
    common_vendor.onBeforeUnmount(stopCountdown);
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.activeModal === "wechatOpenPrizeConfirm"
      }, __props.activeModal === "wechatOpenPrizeConfirm" ? {
        b: common_vendor.o(($event) => emit("close"), "f5"),
        c: common_vendor.o(() => {
        }, "5a")
      } : {}, {
        d: __props.activeModal === "wechatLotteryCountdown"
      }, __props.activeModal === "wechatLotteryCountdown" ? {
        e: image.redAnimation,
        f: image.rotate,
        g: image.circle,
        h: image.light,
        i: countdownNumber.value,
        j: common_vendor.n(`active${countdownNumber.value}`)
      } : {}, {
        k: __props.activeModal === "wechatLotteryEffect"
      }, __props.activeModal === "wechatLotteryEffect" ? {
        l: image.effectTop,
        m: common_vendor.f(6, (index, k0, i0) => {
          return {
            a: index,
            b: common_vendor.n(`element${index}`)
          };
        }),
        n: image.element,
        o: common_vendor.t(prizeTitle.value),
        p: common_vendor.f(rollingUsers.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.photo,
            b: common_vendor.t(item.name),
            c: item.phone
          }, item.phone ? {
            d: common_vendor.t(item.phone)
          } : {}, {
            e: item.key,
            f: common_vendor.n(index === rollingUsers.value.length - 1 ? "luckliLast" : "")
          });
        }),
        q: image.scrollCover,
        r: image.floorClose,
        s: common_vendor.o(($event) => emit("close"), "fd")
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0ff19a37"]]);
wx.createComponent(Component);
