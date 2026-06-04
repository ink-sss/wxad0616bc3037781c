"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "CommentSlotLotteryModals",
  props: {
    activeModal: {
      type: String,
      required: true
    },
    winners: {
      type: Array,
      required: true
    },
    participants: {
      type: Array,
      default: () => []
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
    const isRolling = common_vendor.computed(() => props.activeModal === "commentLotteryRunning" || props.activeModal === "commentLotterySlotRolling");
    const image = {
      avatar: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-uploads-consolewechat-1681-rtf-20260430144045241662-91b0e034.jpg",
      close: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-default-icon-close-0cb4224d.png",
      gift: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-sign-gift-5def5533.png"
    };
    const columnClasses = ["lotteryFirst", "lotterySecond", "lotteryThird", "lotteryFourth"];
    const fallbackRollingUsers = [
      { key: "comment-slot-fallback-1", name: "直播间观众", photo: image.avatar },
      { key: "comment-slot-fallback-2", name: "互动用户", photo: image.avatar },
      { key: "comment-slot-fallback-3", name: "幸运用户", photo: image.avatar },
      { key: "comment-slot-fallback-4", name: "热心观众", photo: image.avatar }
    ];
    const displayUsers = common_vendor.computed(() => props.participants.length > 0 ? props.participants : props.winners);
    const resultWinners = common_vendor.computed(() => props.winners.slice(0, 20));
    const prizeName = common_vendor.computed(() => props.prize.prizeName || props.prize.productName || props.prize.rewardName || "评论抽奖奖品");
    const prizeImage = common_vendor.computed(() => props.prize.productImage || props.prize.rewardImage || image.gift);
    const prizeLevelText = common_vendor.computed(() => props.prize.levelText || props.prize.prizeLevel || "一等奖");
    const prizeCount = common_vendor.computed(() => props.prize.winCount || props.prize.quantity || Math.max(props.winners.length, 1));
    const rollingSourceUsers = common_vendor.computed(() => displayUsers.value.length > 0 ? displayUsers.value : fallbackRollingUsers);
    function buildRollingUsers(columnIndex) {
      const source = rollingSourceUsers.value;
      const base = Array.from({ length: Math.max(source.length, 12) }).map((_, index) => {
        const winner = source[(index + columnIndex) % source.length];
        return {
          ...winner,
          key: `base-${columnIndex}-${index}-${winner.key || winner.phone || winner.name}`,
          name: winner.name,
          photo: winner.photo || image.avatar
        };
      });
      return [...base, ...base].map((winner, index) => ({
        ...winner,
        key: `roll-${columnIndex}-${index}-${winner.key}`,
        photo: winner.photo || image.avatar
      }));
    }
    const rollingColumns = common_vendor.computed(() => columnClasses.map((className, columnIndex) => ({
      className,
      users: buildRollingUsers(columnIndex)
    })));
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isRolling.value || __props.activeModal === "commentLotterySlotResult"
      }, isRolling.value || __props.activeModal === "commentLotterySlotResult" ? common_vendor.e({
        b: isRolling.value
      }, isRolling.value ? {
        c: common_vendor.f(rollingColumns.value, (column, k0, i0) => {
          return {
            a: common_vendor.f(column.users, (user, k1, i1) => {
              return {
                a: user.photo,
                b: common_vendor.t(user.name),
                c: user.key
              };
            }),
            b: column.className,
            c: common_vendor.n(column.className)
          };
        }),
        d: common_vendor.t(displayUsers.value.length),
        e: prizeImage.value,
        f: common_vendor.t(prizeLevelText.value),
        g: common_vendor.t(prizeLevelText.value),
        h: common_vendor.t(prizeName.value),
        i: common_vendor.t(prizeCount.value),
        j: image.close,
        k: common_vendor.o(($event) => emit("close"), "e7")
      } : {}, {
        l: __props.activeModal === "commentLotterySlotResult"
      }, __props.activeModal === "commentLotterySlotResult" ? {
        m: common_vendor.f(resultWinners.value, (winner, k0, i0) => {
          return {
            a: winner.photo || image.avatar,
            b: common_vendor.t(winner.name),
            c: winner.phone
          };
        }),
        n: image.close,
        o: common_vendor.o(($event) => emit("close"), "e3")
      } : {}) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-22a47a02"]]);
wx.createComponent(Component);
