"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "LiveExternalLotteryTools",
  props: {
    keyword: {
      type: String,
      default: "发送指定评论"
    },
    commentLotteryVisible: {
      type: Boolean,
      default: false
    },
    bubbleVisible: {
      type: Boolean,
      default: true
    },
    luckyBagLabel: {
      type: String,
      default: "领取"
    },
    watchRewardVisible: {
      type: Boolean,
      default: false
    },
    watchRewardLabel: {
      type: String,
      default: "领取"
    }
  },
  emits: ["open-comment-lottery", "open-watch-reward"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const showCommentLotteryBubble = common_vendor.ref(true);
    const showCommentLotteryEntry = common_vendor.ref(true);
    const displayLuckyBagLabel = common_vendor.computed(() => props.watchRewardLabel.trim() || props.luckyBagLabel.trim() || "领取");
    common_vendor.watch(
      () => [props.commentLotteryVisible, props.keyword, props.bubbleVisible],
      ([visible, , bubbleVisible]) => {
        if (visible) {
          showCommentLotteryEntry.value = true;
          showCommentLotteryBubble.value = bubbleVisible !== false;
          return;
        }
        showCommentLotteryBubble.value = false;
        showCommentLotteryEntry.value = false;
      }
    );
    const assets = {
      commentLottery: "https://man.lqjy.cc/static/remote-icons/comment-lotterys-new.png",
      close: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-close4-7fa83bca.png",
      tooltipClose: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-tooltipboxclose-e39b3a0d.png",
      tooltipArrow: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-arrowtooltips-0dd003f2.png",
      luckyBag: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-watch-rewardnone-new-ecf31362.png"
    };
    function hideCommentLotteryBubble() {
      showCommentLotteryBubble.value = false;
    }
    function hideCommentLotteryEntry() {
      showCommentLotteryBubble.value = false;
      showCommentLotteryEntry.value = false;
    }
    function openCommentLottery() {
      emit("open-comment-lottery");
    }
    function openWatchReward() {
      emit("open-watch-reward");
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.commentLotteryVisible && showCommentLotteryEntry.value
      }, __props.commentLotteryVisible && showCommentLotteryEntry.value ? common_vendor.e({
        b: showCommentLotteryBubble.value
      }, showCommentLotteryBubble.value ? {
        c: common_vendor.t(__props.keyword),
        d: assets.tooltipClose,
        e: common_vendor.o(hideCommentLotteryBubble, "20"),
        f: assets.tooltipArrow,
        g: common_vendor.o(openCommentLottery, "dc")
      } : {}, {
        h: assets.close,
        i: common_vendor.o(hideCommentLotteryEntry, "5b"),
        j: assets.commentLottery,
        k: common_vendor.o(openCommentLottery, "9b")
      }) : {}, {
        l: __props.watchRewardVisible
      }, __props.watchRewardVisible ? {
        m: assets.luckyBag,
        n: common_vendor.t(displayLuckyBagLabel.value),
        o: common_vendor.o(openWatchReward, "b4")
      } : {}, {
        p: common_vendor.o(() => {
        }, "4b")
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-dd297cce"]]);
wx.createComponent(Component);
