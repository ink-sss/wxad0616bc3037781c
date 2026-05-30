"use strict";
const common_vendor = require("../../../common/vendor.js");
let messageSeed = 0;
const _sfc_main = {
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
    "setAssistant"
  ],
  data() {
    return {
      messages: [],
      explainData: null,
      topBa: null,
      scrollTop: 0,
      imChat: null,
      messageReceivedEvent: "",
      revokeEvent: "onMessageRevoked"
    };
  },
  computed: {
    isHiddenName() {
      return Number(this.isAnonymous) === 1;
    },
    isHiddenAvatar() {
      return Number(this.isAvatarAnonymous) === 1;
    }
  },
  mounted() {
    this.bindIm();
  },
  beforeUnmount() {
    this.offReceiveMessage();
    this.offRevokeMessage();
  },
  methods: {
    bindIm() {
      const app = getApp();
      const globalData = app && app.globalData || {};
      this.imChat = globalData.imChat;
      this.messageReceivedEvent = globalData.imMessageReceived || globalData.TIM && globalData.TIM.EVENT && globalData.TIM.EVENT.MESSAGE_RECEIVED || "";
      if (this.imChat && this.messageReceivedEvent && typeof this.imChat.on === "function") {
        this.imChat.on(this.messageReceivedEvent, this.onMessageReceived);
      }
      if (this.imChat && typeof this.imChat.on === "function") {
        this.imChat.on(this.revokeEvent, this.onMessageRevoked);
      }
    },
    offReceiveMessage() {
      if (this.imChat && this.messageReceivedEvent && typeof this.imChat.off === "function") {
        this.imChat.off(this.messageReceivedEvent, this.onMessageReceived);
      }
    },
    offRevokeMessage() {
      if (this.imChat && typeof this.imChat.off === "function") {
        this.imChat.off(this.revokeEvent, this.onMessageRevoked);
      }
    },
    onMessageReceived(event = {}) {
      const data = Array.isArray(event.data) ? event.data : [];
      data.forEach((message) => this.consumeMessage(message));
      this.trimMessages();
    },
    onMessageRevoked(event = {}) {
      const revoked = Array.isArray(event.data) ? event.data : [];
      const sequences = revoked.map((item) => item.sequence);
      this.messages = this.messages.filter((item) => !sequences.includes(item.sequence));
    },
    consumeMessage(message = {}) {
      const globalData = getApp() && getApp().globalData || {};
      if (message.type === globalData.msgGrpSysNotice || message.type === "TIMGroupTipElem") {
        this.consumeSystemNotice(message.payload && message.payload.userDefinedField);
        return;
      }
      if (message.type === globalData.msgText || message.type === "TIMTextElem") {
        if (message.from === "administrator" && message.conversationType === "C2C" && message.payload && message.payload.text === "go-trtc---------------") {
          this.$emit("goTrtc");
          return;
        }
        this.pushMessage({
          head: message.avatar,
          name: message.nick || message.from || "用户",
          text: message.payload && message.payload.text,
          msgType: "text",
          sequence: message.sequence
        });
      }
      if (message.type === globalData.msgImage || message.type === "TIMImageElem") {
        const imageInfo = message.payload && message.payload.imageInfoArray && message.payload.imageInfoArray[0];
        this.pushMessage({
          head: message.avatar,
          name: message.nick || message.from || "用户",
          text: imageInfo && imageInfo.url,
          msgType: "img",
          sequence: message.sequence
        });
      }
    },
    consumeSystemNotice(field = "") {
      if (!field)
        return;
      if (field.includes("@ExplainEdit---")) {
        const raw = field.replace("@ExplainEdit---", "");
        this.explainData = raw ? JSON.parse(raw) : null;
      } else if (field.includes("@ForbiddenBlock---")) {
        const [, value] = field.replace("@ForbiddenBlock---", "").split("-");
        if (Number(value) === 1)
          common_vendor.index.reLaunch({ url: "/pages/live/block" });
      } else if (field.includes("@ForbiddenIp---")) {
        common_vendor.index.reLaunch({ url: "/pages/live/block" });
      } else if (field.includes("@EndLive---")) {
        this.$emit("endLive");
      } else if (field.includes("@go-trtc")) {
        this.$emit("goTrtc");
      }
    },
    pushMessage(message) {
      if (!message.text)
        return;
      this.messages.push({
        id: ++messageSeed,
        ...message
      });
      this.scrollTop += 200;
    },
    trimMessages() {
      if (this.messages.length > 30) {
        this.messages.splice(0, this.messages.length - 30);
      }
    },
    imSendMsg(text) {
      if (!text)
        return;
      const app = getApp();
      const globalData = app && app.globalData || {};
      if (this.imChat && typeof this.imChat.createTextMessage === "function" && typeof this.imChat.sendMessage === "function") {
        const message = this.imChat.createTextMessage({
          to: String(this.$root && this.$root.liveId ? this.$root.liveId : ""),
          conversationType: globalData.TIM && globalData.TIM.TYPES && globalData.TIM.TYPES.CONV_GROUP,
          payload: { text }
        });
        this.imChat.sendMessage(message).catch((error) => console.warn("[live] IM send failed", error));
      }
      this.pushMessage({ name: "我", text, msgType: "text" });
    },
    setExplain(data) {
      this.explainData = data || null;
    },
    setTopBa(data) {
      this.topBa = data || null;
    },
    addZanNum() {
      this.pushMessage({ name: "系统", text: "点赞 +1", msgType: "text" });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.messages, (item, k0, i0) => {
      return common_vendor.e({
        a: item.head && !$options.isHiddenAvatar
      }, item.head && !$options.isHiddenAvatar ? {
        b: item.head
      } : {}, {
        c: common_vendor.t($options.isHiddenName ? "匿名用户" : item.name),
        d: item.msgType === "img"
      }, item.msgType === "img" ? {
        e: item.text
      } : {
        f: common_vendor.t(item.text)
      }, {
        g: item.sequence || item.id
      });
    }),
    b: $data.scrollTop,
    c: $data.explainData && $data.explainData.product_name
  }, $data.explainData && $data.explainData.product_name ? {
    d: common_vendor.t($data.explainData.product_name),
    e: common_vendor.o(($event) => _ctx.$emit("goShop", $data.explainData.product_id, $data.explainData.spec_sku_id), "4f")
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-285dceb3"]]);
wx.createComponent(Component);
