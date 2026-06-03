"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "SlotLotteryModals",
  props: {
    activeModal: {
      type: String,
      required: true
    },
    winners: {
      type: Array,
      required: true
    },
    resultWinners: {
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
    const image = {
      avatar: "/static/remote-icons/nyfs-oss-bcvdata-com-uploads-consolewechat-1681-rtf-20260430144045241662-91b0e034.jpg",
      close: "/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-watch-luckydraw-floorclose-c8b795b1.png",
      gift: "/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-sign-gift-5def5533.png"
    };
    const prizeName = common_vendor.computed(() => props.prize.name || props.prize.title || "抽奖奖品");
    const prizeQuantity = common_vendor.computed(() => Number(props.prize.quantity || 1) || 1);
    const prizeImage = common_vendor.computed(() => props.prize.image || image.gift);
    const prizeLevelNumber = common_vendor.computed(() => {
      const text = String(props.prize.level || "一等奖");
      const match = text.match(/\d+/);
      return match ? match[0] : "1";
    });
    const displayResultWinners = common_vendor.computed(() => props.resultWinners.length > 0 ? props.resultWinners : props.winners);
    const slotSourceUsers = common_vendor.computed(() => props.winners.length > 0 ? props.winners : [{ name: "山奈", phone: "781****1", photo: image.avatar }]);
    const slotColumns = common_vendor.computed(() => Array.from({ length: 4 }).map((_, columnIndex) => ({
      key: `slot-column-${columnIndex}`,
      index: columnIndex,
      users: Array.from({ length: 8 }).flatMap((_2, groupIndex) => slotSourceUsers.value.map((item, index) => ({
        ...item,
        name: slotSourceUsers.value[(index + columnIndex) % slotSourceUsers.value.length].name,
        key: `slot-${columnIndex}-${groupIndex}-${index}-${item.phone || item.name}`,
        photo: item.photo || image.avatar
      })))
    })));
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.activeModal === "wechatSlotRolling" || __props.activeModal === "wechatSlotResult"
      }, __props.activeModal === "wechatSlotRolling" || __props.activeModal === "wechatSlotResult" ? common_vendor.e({
        b: __props.activeModal === "wechatSlotRolling"
      }, __props.activeModal === "wechatSlotRolling" ? {
        c: common_vendor.t(prizeName.value),
        d: common_vendor.f(slotColumns.value, (column, k0, i0) => {
          return {
            a: common_vendor.f(column.users, (user, k1, i1) => {
              return {
                a: user.photo,
                b: common_vendor.t(user.name),
                c: user.key
              };
            }),
            b: common_vendor.n(`slot-reel-track-${column.index}`),
            c: column.key
          };
        }),
        e: prizeImage.value,
        f: common_vendor.t(prizeLevelNumber.value),
        g: common_vendor.t(prizeName.value),
        h: common_vendor.t(prizeQuantity.value),
        i: image.close,
        j: common_vendor.o(($event) => emit("close"), "21")
      } : {}, {
        k: __props.activeModal === "wechatSlotResult"
      }, __props.activeModal === "wechatSlotResult" ? {
        l: common_vendor.t(prizeName.value),
        m: common_vendor.f(displayResultWinners.value, (winner, k0, i0) => {
          return {
            a: winner.photo || image.avatar,
            b: common_vendor.t(winner.name),
            c: common_vendor.t(winner.phone),
            d: winner.key || winner.phone || winner.name
          };
        }),
        n: common_vendor.t(prizeName.value),
        o: image.close,
        p: common_vendor.o(($event) => emit("close"), "13")
      } : {}) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a69ec30f"]]);
wx.createComponent(Component);
