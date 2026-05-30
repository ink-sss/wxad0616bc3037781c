"use strict";
const common_vendor = require("../../../common/vendor.js");
const BarrageList = () => "./barrage-list.js";
const _sfc_main = {
  components: { BarrageList },
  props: {
    isAnonymous: { type: [Number, String], default: 0 },
    isAvatarAnonymous: { type: [Number, String], default: 0 },
    isCreatingOrder: { type: [Number, String], default: null },
    isHotSale: { type: [Number, String], default: null },
    salesOne: { type: [Number, String], default: 0 },
    isSubmitOrderSuccess: { type: [Number, String], default: 1 },
    isGrade: { type: [Number, String], default: 0 },
    liveNotice: { type: String, default: "" }
  },
  emits: [
    "goShop",
    "endLive",
    "cartChange",
    "goTrtc",
    "refresh",
    "hideLuckyBag",
    "showLuckyBag",
    "luckyBagResult",
    "authSuccess",
    "showCountdownPoints",
    "hideCountdownPoints",
    "showCountdownRedpack",
    "hideCountdownRedpack",
    "setAssistant",
    "swiperChange"
  ],
  methods: {
    imSendMsg(text) {
      this.$refs.inner && this.$refs.inner.imSendMsg(text);
    },
    setExplain(data) {
      this.$refs.inner && this.$refs.inner.setExplain(data);
    },
    setTopBa(data) {
      this.$refs.inner && this.$refs.inner.setTopBa(data);
    },
    offReceiveMessage() {
      this.$refs.inner && this.$refs.inner.offReceiveMessage();
    },
    offRevokeMessage() {
      this.$refs.inner && this.$refs.inner.offRevokeMessage();
    },
    addZanNum() {
      this.$refs.inner && this.$refs.inner.addZanNum();
    }
  }
};
if (!Array) {
  const _component_barrage_list = common_vendor.resolveComponent("barrage-list");
  _component_barrage_list();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.sr("inner", "5c2b4374-0"),
    b: common_vendor.o((...args) => _ctx.$emit("goShop", ...args), "22"),
    c: common_vendor.o(($event) => _ctx.$emit("endLive"), "a7"),
    d: common_vendor.o(($event) => _ctx.$emit("cartChange"), "8e"),
    e: common_vendor.o(($event) => _ctx.$emit("goTrtc"), "0f"),
    f: common_vendor.o(($event) => _ctx.$emit("refresh"), "41"),
    g: common_vendor.o(($event) => _ctx.$emit("hideLuckyBag"), "b7"),
    h: common_vendor.o(($event) => _ctx.$emit("showLuckyBag"), "5c"),
    i: common_vendor.o((...args) => _ctx.$emit("luckyBagResult", ...args), "ac"),
    j: common_vendor.o(($event) => _ctx.$emit("authSuccess"), "8b"),
    k: common_vendor.o(($event) => _ctx.$emit("showCountdownPoints"), "c2"),
    l: common_vendor.o(($event) => _ctx.$emit("hideCountdownPoints"), "7f"),
    m: common_vendor.o(($event) => _ctx.$emit("showCountdownRedpack"), "d6"),
    n: common_vendor.o(($event) => _ctx.$emit("hideCountdownRedpack"), "ed"),
    o: common_vendor.o((...args) => _ctx.$emit("setAssistant", ...args), "2c"),
    p: common_vendor.p({
      ..._ctx.$props
    })
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5c2b4374"]]);
wx.createComponent(Component);
