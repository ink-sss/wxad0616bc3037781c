"use strict";
const common_vendor = require("../common/vendor.js");
if (!Math) {
  (CenterSectionCard + BottomSheetPopup)();
}
const BottomSheetPopup = () => "./bottom-sheet-popup.js";
const CenterSectionCard = () => "./center-section-card.js";
const _sfc_main = {
  __name: "center-popup",
  props: {
    visible: { type: Boolean, default: false },
    name: { type: String, default: "晴天" },
    avatar: { type: String, default: "" },
    orderStats: {
      type: Object,
      default: () => ({
        waitPay: 0,
        waitShip: 0,
        waitReceive: 0,
        refunding: 0
      })
    },
    isDistributor: { type: Boolean, default: false },
    distributorStatus: { type: Number, default: 0 },
    enableShare: { type: Number, default: 1 }
  },
  emits: ["close", "action"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const orderItems = common_vendor.computed(() => {
      var _a, _b, _c, _d;
      return [
        {
          key: "unpay",
          label: "待付款",
          icon: "https://man.lqjy.cc/static/icons/order_0.png",
          badge: Number(((_a = props.orderStats) == null ? void 0 : _a.waitPay) || 0)
        },
        {
          key: "unsend",
          label: "待发货",
          icon: "https://man.lqjy.cc/static/icons/order_1.png",
          badge: Number(((_b = props.orderStats) == null ? void 0 : _b.waitShip) || 0)
        },
        {
          key: "unreceive",
          label: "待收货",
          icon: "https://man.lqjy.cc/static/icons/order_2.png",
          badge: Number(((_c = props.orderStats) == null ? void 0 : _c.waitReceive) || 0)
        },
        { key: "finished", label: "已完成", icon: "https://man.lqjy.cc/static/icons/order_3.png" },
        {
          key: "refund",
          label: "退款/售后",
          icon: "https://man.lqjy.cc/static/icons/order_4.png",
          badge: Number(((_d = props.orderStats) == null ? void 0 : _d.refunding) || 0)
        }
      ];
    });
    const moreItems = common_vendor.computed(() => {
      const items = [
        { key: "prizeRecord", label: "中奖记录", icon: "https://man.lqjy.cc/static/icons/more1.png" }
      ];
      if (props.enableShare !== 0 && props.isDistributor && props.distributorStatus === 1) {
        items.push({ key: "invitationRecord", label: "邀请记录", icon: "https://man.lqjy.cc/static/icons/more2.png" });
      }
      items.push({ key: "address", label: "收货地址", icon: "https://man.lqjy.cc/static/icons/more3.png" });
      items.push({ key: "complaint", label: "投诉", icon: "https://man.lqjy.cc/static/icons/more4.png" });
      return items;
    });
    function onItemClick(item) {
      emit("action", item.key);
    }
    function onAction(type) {
      emit("action", type);
    }
    return (_ctx, _cache) => {
      return {
        a: __props.avatar,
        b: common_vendor.t(__props.name),
        c: common_vendor.o(($event) => onAction("profile"), "b3"),
        d: common_vendor.o(($event) => onAction("orders"), "d4"),
        e: common_vendor.o(onItemClick, "bb"),
        f: common_vendor.p({
          title: "我的订单",
          items: orderItems.value,
          mode: "grid",
          variant: "order",
          ["show-link"]: true
        }),
        g: common_vendor.o(onItemClick, "52"),
        h: common_vendor.p({
          title: "更多功能",
          items: moreItems.value,
          mode: "grid",
          variant: "more"
        }),
        i: common_vendor.o(($event) => emit("close"), "36"),
        j: common_vendor.p({
          visible: __props.visible,
          height: "760rpx",
          radius: "32rpx 32rpx 0 0",
          duration: 500,
          ["with-mask"]: true,
          ["mask-color"]: "rgba(0, 0, 0, 0.35)",
          ["allow-overflow"]: true,
          ["show-close"]: false
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-77414119"]]);
wx.createComponent(Component);
