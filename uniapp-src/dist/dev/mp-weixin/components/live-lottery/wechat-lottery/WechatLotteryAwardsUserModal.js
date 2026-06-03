"use strict";
const common_vendor = require("../../../common/vendor.js");
const base = "https://nyfs-oss.bcvdata.com/Public/Home/Images";
const _sfc_main = {
  __name: "WechatLotteryAwardsUserModal",
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
      awardsTitle: `${base}/Watch/luckydraw/luckydrawAwards2.png`,
      lotteryTop: `${base}/Watch/luckydraw/lotteryTop3.png`,
      lotteryFloor: `${base}/Watch/luckydraw/lotteryFloor.png`,
      lotteryLine: `${base}/Watch/luckydraw/lotteryFloorLine.png`,
      floorClose: `${base}/Watch/luckydraw/floorClose.png`,
      element: "/static/remote-icons/nyfs-oss-bcvdata-com-public-pkenvelope-element3-b60b22b7.png"
    };
    const isVisible = common_vendor.computed(() => props.activeModal === "wechatLotteryAwards" || props.activeModal === "wechatLotteryAwardsUser");
    const prizeName = common_vendor.computed(() => props.prize.name || props.prize.title || "抽奖奖品");
    const prizeTitle = common_vendor.computed(() => prizeName.value);
    const displayWinners = common_vendor.computed(() => {
      if (!props.winners.length) {
        return [{ key: "source-award-empty", name: "暂无中奖用户", phone: "", photo: image.avatar }];
      }
      return props.winners.map((winner, index) => ({
        key: winner.key || winner.recordId || winner.customerId || `source-award-user-${index}`,
        name: winner.name || winner.nickname || `用户${index + 1}`,
        phone: winner.phone || winner.mobile || "已中奖",
        photo: winner.photo || winner.avatar || image.avatar
      }));
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isVisible.value
      }, isVisible.value ? {
        b: common_vendor.f(6, (index, k0, i0) => {
          return {
            a: index,
            b: common_vendor.n(`element${index}`)
          };
        }),
        c: image.element,
        d: image.awardsTitle,
        e: image.lotteryTop,
        f: image.lotteryFloor,
        g: image.lotteryLine,
        h: common_vendor.t(prizeTitle.value),
        i: common_vendor.f(displayWinners.value, (winner, index, i0) => {
          return common_vendor.e({
            a: winner.photo,
            b: common_vendor.t(winner.name),
            c: winner.phone
          }, winner.phone ? {
            d: common_vendor.t(winner.phone)
          } : {}, {
            e: winner.key,
            f: common_vendor.n(index === displayWinners.value.length - 1 ? "awardsLiLast" : "")
          });
        }),
        j: image.floorClose,
        k: common_vendor.o(($event) => emit("close"), "86")
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-83c90864"]]);
wx.createComponent(Component);
