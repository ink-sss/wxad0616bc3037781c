"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_routeNavigation = require("../../utils/route-navigation.js");
const _sfc_main = {
  __name: "CommentLotteryResultModals",
  props: {
    activeModal: {
      type: String,
      required: true
    },
    prize: {
      type: Object,
      default: () => ({})
    },
    winRecord: {
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
    const image = {
      gift: "/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-sign-gift-5def5533.png",
      closeIcon: "/static/remote-icons/nyfs-oss-bcvdata-com-frontend-mobile-commons-close-icon-75e80e51.png",
      star: "/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-default-star-icon-288074ca.webp",
      winningAward: "/static/remote-icons/nyfs-oss-bcvdata-com-frontend-mobile-live-winning-award-d13632f4.png",
      pop: "/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-default-untitledanimation-25b60726.webp"
    };
    const prizeName = common_vendor.computed(() => {
      var _a, _b, _c;
      return ((_a = props.winRecord) == null ? void 0 : _a.rewardName) || ((_b = props.prize) == null ? void 0 : _b.prizeName) || ((_c = props.prize) == null ? void 0 : _c.productName) || "评论抽奖奖品";
    });
    const prizeImage = common_vendor.computed(() => {
      var _a, _b;
      return ((_a = props.winRecord) == null ? void 0 : _a.rewardImage) || ((_b = props.prize) == null ? void 0 : _b.productImage) || image.gift;
    });
    const prizeLevelText = common_vendor.computed(() => {
      var _a, _b, _c, _d, _e, _f;
      return ((_a = props.winRecord) == null ? void 0 : _a.levelText) || ((_b = props.winRecord) == null ? void 0 : _b.prizeLevelText) || ((_c = props.prize) == null ? void 0 : _c.levelText) || ((_d = props.prize) == null ? void 0 : _d.prizeLevelText) || ((_e = props.winRecord) == null ? void 0 : _e.prizeLevel) || ((_f = props.prize) == null ? void 0 : _f.prizeLevel) || "1";
    });
    function openPrizeRecord() {
      const route = utils_routeNavigation.normalizeAppRoute(props.recordUrl || "/pages/prize-record/index");
      if (!route) {
        common_vendor.index.showToast({ title: "暂无可查看内容", icon: "none" });
        return;
      }
      emit("close");
      utils_routeNavigation.navigateToPrizeRecord(route);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.activeModal === "commentLotteryWin"
      }, __props.activeModal === "commentLotteryWin" ? {
        b: image.star,
        c: image.winningAward,
        d: image.pop,
        e: prizeImage.value,
        f: common_vendor.t(prizeLevelText.value),
        g: common_vendor.t(prizeName.value),
        h: common_vendor.o(openPrizeRecord, "9a"),
        i: common_vendor.o(openPrizeRecord, "e9"),
        j: image.closeIcon,
        k: common_vendor.o(($event) => emit("close"), "fa")
      } : {}, {
        l: __props.activeModal === "commentLotteryLose"
      }, __props.activeModal === "commentLotteryLose" ? {
        m: common_vendor.o(openPrizeRecord, "83"),
        n: image.closeIcon,
        o: common_vendor.o(($event) => emit("close"), "86")
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-da59a754"]]);
wx.createComponent(Component);
