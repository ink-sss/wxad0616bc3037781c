"use strict";
const common_vendor = require("../common/vendor.js");
const DEFAULT_TIP_TEXT = "发送指定评论参与抽奖";
const _sfc_main = {
  __name: "comment-prize-rule-modal",
  props: {
    activeModal: {
      type: String,
      required: true
    },
    activity: {
      type: Object,
      default: () => ({})
    },
    prizes: {
      type: Array,
      default: () => []
    },
    tipText: {
      type: String,
      default: ""
    }
  },
  emits: ["close", "send-comment"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const showRulePanel = common_vendor.ref(false);
    const image = {
      lotteryClose: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-default-lottery-close-icon-0ad17f9d.png",
      commentHeader: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-frontend-mobile-live-lottery-comment-header-abb7423b.png",
      arrowLeft: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-frontend-mobile-commons-arrow-left-gray-f0a8573f.png",
      productOne: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-sign-gift-5def5533.png",
      productTwo: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-uploads-consolewechat-1681-rtf-20260430144045241662-91b0e034.jpg",
      productThree: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-frontend-mobile-live-prize-bg-7c92e47e.png"
    };
    const fallbackPrizeCards = [
      { id: "fallback-1", level: "1", name: "评论奖品", img: image.productOne, is_open_prize: 2, num: 1, person_count: 0, is_display_num: 1 },
      { id: "fallback-2", level: "2", name: "互动福利", img: image.productTwo, is_open_prize: 0, num: 1, person_count: 0, is_display_num: 1 },
      { id: "fallback-3", level: "3", name: "直播好礼", img: image.productThree, is_open_prize: 0, num: 1, person_count: 0, is_display_num: 1 }
    ];
    const displayPrizeCards = common_vendor.computed(() => {
      const source = props.prizes.length ? props.prizes : fallbackPrizeCards;
      const prizeListLength = source.length;
      return source.map((item, index) => {
        var _a;
        const status = getCompetitorPrizeStatus(item);
        const count = toNumber(item.num ?? item.winCount ?? item.rewardQuantity ?? item.quantity, 0);
        const participantCount = toNumber(item.person_count ?? item.participantCount, 0);
        const displayNum = Number(item.is_display_num ?? item.prizeQuantityDisplay ?? ((_a = props.activity) == null ? void 0 : _a.prizeQuantityDisplay) ?? 1) === 1;
        const cardSize = prizeListLength <= 3 ? prizeListLength : 3;
        return {
          key: item.prizeId || item.id || `${item.prizeName || item.name}-${index}`,
          level: item.level || item.prizeLevelText || item.levelText || item.prizeLevel || index + 1,
          name: item.name || item.prizeName || item.productName || "评论抽奖奖品",
          image: item.img || item.productImage || image.productOne,
          countText: formatCommentPrizeNum(count),
          participantText: formatCommentPrizeNum(participantCount, true),
          showCount: displayNum,
          showPrizeNum: prizeListLength < 3,
          isOnePrize: prizeListLength === 1,
          isDrawn: status === 1,
          cardClass: getPrizeCardClass(prizeListLength, status),
          badgeClass: `commentPrizeLiType${status}`,
          imageBoxClass: `commentPrizeLiImgBox${cardSize}`,
          numClass: `commentPrizeLiNum${cardSize}`,
          nameClass: `prizeNickone${cardSize}`
        };
      });
    });
    const isVisible = common_vendor.computed(() => ["commentPrizeRule", "commentLotteryList"].includes(props.activeModal));
    const hasVisiblePasswordText = common_vendor.computed(() => Boolean(props.tipText && props.tipText !== DEFAULT_TIP_TEXT));
    const showParticipateActions = common_vendor.computed(() => {
      var _a;
      return Number((_a = props.activity) == null ? void 0 : _a.status) === 1 && hasVisiblePasswordText.value;
    });
    const userStatusText = common_vendor.computed(() => {
      var _a, _b;
      const result = ((_b = (_a = props.activity) == null ? void 0 : _a.currentUser) == null ? void 0 : _b.result) || "none";
      if (result === "joined")
        return "已达成";
      if (result === "win")
        return "已中奖";
      if (result === "lose")
        return "未中奖";
      if (result === "not_participated")
        return "未参与本轮";
      return "未达成";
    });
    const conditionText = common_vendor.computed(() => props.tipText || "发送指定评论参与");
    const actionText = common_vendor.computed(() => hasVisiblePasswordText.value ? "一键发送评论" : "去评论区发送");
    const lotteryRules = [
      "1. 用户需要在聊天互动区域发送正确抽奖口令",
      "2. 抽奖口令由主播提供/直接显示口令",
      "3. 在主播开奖前发送正确抽奖口令即可获得抽奖资格",
      "4. 每轮抽奖后资格取消，需要重新发送口令"
    ];
    common_vendor.watch(
      () => props.activeModal,
      (activeModal) => {
        if (!["commentPrizeRule", "commentLotteryList"].includes(activeModal)) {
          showRulePanel.value = false;
        }
      }
    );
    function openRulePanel() {
      showRulePanel.value = true;
    }
    function closeRulePanel() {
      showRulePanel.value = false;
    }
    function handleClose() {
      showRulePanel.value = false;
      emit("close");
    }
    function handleSendComment() {
      showRulePanel.value = false;
      emit("send-comment", conditionText.value);
    }
    function toNumber(value, fallback = 0) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    }
    function getCompetitorPrizeStatus(item) {
      if (item.is_open_prize !== void 0)
        return toNumber(item.is_open_prize);
      const status = toNumber(item.status);
      if (status === 2)
        return 1;
      if (status === 1)
        return 2;
      return 0;
    }
    function getPrizeCardClass(length, status) {
      if (length === 1)
        return ["notStartBg", "commentPrizeLi"];
      if (length === 2)
        return ["haveInHandBg", "commentPrizeLi", status === 1 ? "hasBeenHandBg" : "orHandBg"];
      if (length === 3)
        return ["prizeEndBg", "commentPrizeLi", "threeOrHandBg"];
      return ["fourthBg", "commentPrizeLi", status === 1 ? "threeHasBeenBg" : "threeOrHandBg"];
    }
    function formatCommentPrizeNum(value, isLarge = false) {
      const num = toNumber(value);
      if (num > 99999)
        return "10w+";
      if (isLarge)
        return num;
      if (num > 9999)
        return "1w+";
      return num;
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isVisible.value
      }, isVisible.value ? common_vendor.e({
        b: common_vendor.o(handleClose, "56"),
        c: !showRulePanel.value
      }, !showRulePanel.value ? common_vendor.e({
        d: common_vendor.o(openRulePanel, "28"),
        e: image.lotteryClose,
        f: common_vendor.o(handleClose, "fb"),
        g: image.commentHeader,
        h: common_vendor.f(displayPrizeCards.value, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.n(item.badgeClass),
            b: common_vendor.n({
              forbidenForCommentPrizeShow: item.isDrawn
            }),
            c: item.image,
            d: common_vendor.t(item.level),
            e: common_vendor.n(item.numClass),
            f: common_vendor.t(item.name),
            g: common_vendor.n(item.nameClass),
            h: item.showPrizeNum
          }, item.showPrizeNum ? common_vendor.e({
            i: item.showCount
          }, item.showCount ? {
            j: common_vendor.t(item.countText)
          } : {}, {
            k: item.showCount
          }, item.showCount ? {} : {}, {
            l: common_vendor.t(item.participantText),
            m: common_vendor.n({
              prizeNumOne: item.isOnePrize
            })
          }) : {}, {
            n: common_vendor.n(item.imageBoxClass),
            o: item.key,
            p: common_vendor.n(item.cardClass),
            q: common_vendor.n(index === displayPrizeCards.value.length - 1 ? "commentPrizeCardLast" : "")
          });
        }),
        i: showParticipateActions.value
      }, showParticipateActions.value ? {
        j: common_vendor.t(userStatusText.value),
        k: common_vendor.t(conditionText.value),
        l: common_vendor.t(actionText.value),
        m: common_vendor.o(handleSendComment, "ab")
      } : {}) : {
        n: image.arrowLeft,
        o: common_vendor.o(closeRulePanel, "fc"),
        p: image.lotteryClose,
        q: common_vendor.o(handleClose, "f0"),
        r: common_vendor.f(lotteryRules, (rule, k0, i0) => {
          return {
            a: common_vendor.t(rule),
            b: rule
          };
        })
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b7f9e21f"]]);
wx.createComponent(Component);
