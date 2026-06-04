"use strict";
const common_vendor = require("../../../common/vendor.js");
const pages_broadcast_utils_entryFormat = require("../utils/entry-format.js");
if (!Array) {
  const _easycom_wd_icon2 = common_vendor.resolveComponent("wd-icon");
  _easycom_wd_icon2();
}
const _easycom_wd_icon = () => "../../../node-modules/wot-design-uni/components/wd-icon/wd-icon.js";
if (!Math) {
  _easycom_wd_icon();
}
const QUICK_REPLY_TRUNCATE_LEN = 6;
const POPOVER_EDGE_PADDING_RPX = 24;
const TOUCH_CLICK_SUPPRESS_MS = 500;
const _sfc_main = {
  __name: "LiveChatBar",
  props: {
    variant: {
      type: String,
      default: "portrait"
    },
    visible: {
      type: Boolean,
      default: true
    },
    show: {
      type: Boolean,
      default: true
    },
    focused: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: String,
      default: ""
    },
    disabledText: {
      type: String,
      default: ""
    },
    bottomStyle: {
      type: Object,
      default: () => ({})
    },
    roomSetting: {
      type: Object,
      default: () => ({})
    },
    hearts: {
      type: Array,
      default: () => []
    },
    quickReplies: {
      type: Array,
      default: () => []
    },
    productCount: {
      type: Number,
      default: 0
    },
    likeCount: {
      type: [Number, String],
      default: 0
    },
    liveToolbar: {
      type: Boolean,
      default: false
    },
    // [2026-05-21] 分销员状态：仅 isDistributor && distributorStatus===1 才展示分享邀请 icon
    isDistributor: {
      type: Boolean,
      default: false
    },
    distributorStatus: {
      type: Number,
      default: 0
    }
  },
  emits: [
    "update:modelValue",
    "request-focus",
    "focus",
    "confirm",
    "blur",
    "send",
    "center",
    "product",
    "like",
    "heart-animation-end",
    "quick-reply",
    "share"
  ],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const barRef = common_vendor.ref(null);
    const inputRef = common_vendor.ref(null);
    common_vendor.ref(null);
    const componentInstance = common_vendor.getCurrentInstance();
    const placeholderStyle = common_vendor.computed(() => {
      if (props.variant === "portrait") {
        return props.focused ? "color:#bcbcc0;" : "color:rgba(255,255,255,0.7);";
      }
      return "color:#bcbcc0;";
    });
    const useLiveToolbar = common_vendor.computed(() => props.liveToolbar);
    const productCountText = common_vendor.computed(() => {
      const count = Number(props.productCount || 0);
      if (count > 99)
        return "99+";
      return String(count);
    });
    const likeCountText = common_vendor.computed(() => pages_broadcast_utils_entryFormat.formatLikeCount(props.likeCount));
    const expandedId = common_vendor.ref(null);
    const popoverArrowLeft = common_vendor.ref("50%");
    const popoverLeft = common_vendor.ref("24rpx");
    let lastTouchSendAt = 0;
    const expandedQuickReply = common_vendor.computed(() => {
      if (expandedId.value == null)
        return null;
      return props.quickReplies.find((item) => item.id === expandedId.value) || null;
    });
    function needTruncate(text) {
      return !!text && [...text].length > QUICK_REPLY_TRUNCATE_LEN;
    }
    function truncateText(text) {
      if (!text)
        return "";
      const chars = [...text];
      if (chars.length > QUICK_REPLY_TRUNCATE_LEN) {
        return chars.slice(0, QUICK_REPLY_TRUNCATE_LEN).join("") + "...";
      }
      return text;
    }
    function createComponentSelectorQuery() {
      const query = common_vendor.index.createSelectorQuery();
      if ((componentInstance == null ? void 0 : componentInstance.proxy) && typeof query.in === "function") {
        return query.in(componentInstance.proxy);
      }
      return query;
    }
    function queryQuickReplyPopoverRects() {
      return new Promise((resolve) => {
        const query = createComponentSelectorQuery();
        query.select(".quick-reply-eye--active").boundingClientRect();
        query.select(".bottom-bar").boundingClientRect();
        query.select(".quick-reply-popover").boundingClientRect();
        query.exec((rects = []) => resolve(rects));
      });
    }
    function resetQuickReplyPopoverPosition() {
      popoverLeft.value = `${POPOVER_EDGE_PADDING_RPX}rpx`;
      popoverArrowLeft.value = "50%";
    }
    async function updateQuickReplyPopoverPosition() {
      await common_vendor.nextTick$1();
      const [eyeRect, barRect, popoverRect] = await queryQuickReplyPopoverRects();
      if (!eyeRect || !barRect || !popoverRect) {
        resetQuickReplyPopoverPosition();
        return;
      }
      const barWidth = Number(barRect.width || 0);
      const popoverWidth = Number(popoverRect.width || 0);
      if (!barWidth || !popoverWidth) {
        resetQuickReplyPopoverPosition();
        return;
      }
      const rpx = barWidth / 750;
      const edge = POPOVER_EDGE_PADDING_RPX * rpx;
      const eyeCenter = Number(eyeRect.left || 0) + Number(eyeRect.width || 0) / 2 - Number(barRect.left || 0);
      const idealLeft = eyeCenter - popoverWidth / 2;
      const maxLeft = Math.max(edge, barWidth - popoverWidth - edge);
      const finalLeft = Math.min(Math.max(idealLeft, edge), maxLeft);
      popoverLeft.value = `${finalLeft}px`;
      popoverArrowLeft.value = `${eyeCenter - finalLeft}px`;
    }
    function toggleExpand(id) {
      expandedId.value = expandedId.value === id ? null : id;
      if (expandedId.value != null) {
        updateQuickReplyPopoverPosition();
      }
    }
    function onQuickReply(text) {
      expandedId.value = null;
      emit("quick-reply", text);
    }
    function onSendTouchEnd() {
      lastTouchSendAt = Date.now();
      emit("send");
    }
    function onSendClick() {
      if (Date.now() - lastTouchSendAt < TOUCH_CLICK_SUPPRESS_MS)
        return;
      emit("send");
    }
    function onInput(event) {
      var _a, _b;
      emit(
        "update:modelValue",
        ((_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.value) ?? ((_b = event == null ? void 0 : event.target) == null ? void 0 : _b.value) ?? event
      );
    }
    __expose({
      focus: () => {
        var _a, _b;
        return (_b = (_a = inputRef.value) == null ? void 0 : _a.focus) == null ? void 0 : _b.call(_a);
      },
      blur: () => {
        var _a, _b;
        return (_b = (_a = inputRef.value) == null ? void 0 : _a.blur) == null ? void 0 : _b.call(_a);
      },
      barRef
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.visible
      }, __props.visible ? common_vendor.e({
        b: expandedQuickReply.value
      }, expandedQuickReply.value ? {
        c: common_vendor.t(expandedQuickReply.value.content),
        d: popoverLeft.value,
        e: popoverArrowLeft.value,
        f: common_vendor.o(($event) => onQuickReply(expandedQuickReply.value.content), "00")
      } : {}, {
        g: __props.quickReplies.length > 0 && !__props.focused
      }, __props.quickReplies.length > 0 && !__props.focused ? {
        h: common_vendor.f(__props.quickReplies, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(truncateText(item.content)),
            b: needTruncate(item.content)
          }, needTruncate(item.content) ? {
            c: "ec9f674a-0-" + i0,
            d: common_vendor.p({
              name: "view",
              size: "22px",
              color: __props.variant === "portrait" ? "#fff" : "#666"
            }),
            e: expandedId.value === item.id ? 1 : "",
            f: item.id,
            g: common_vendor.o(($event) => toggleExpand(item.id), item.id)
          } : {}, {
            h: item.id,
            i: common_vendor.o(($event) => onQuickReply(item.content), item.id)
          });
        })
      } : {}, {
        i: useLiveToolbar.value && __props.variant === "portrait" && __props.roomSetting.showProduct !== 0 && !__props.focused
      }, useLiveToolbar.value && __props.variant === "portrait" && __props.roomSetting.showProduct !== 0 && !__props.focused ? {
        j: common_vendor.t(productCountText.value),
        k: common_vendor.o(($event) => emit("product"), "36")
      } : {}, {
        l: __props.modelValue,
        m: __props.disabledText || "说点什么吧~",
        n: placeholderStyle.value,
        o: !!__props.disabledText,
        p: common_vendor.o(onInput, "96"),
        q: common_vendor.o(($event) => emit("focus", $event), "b8"),
        r: common_vendor.o(($event) => emit("confirm", $event), "93"),
        s: common_vendor.o(($event) => emit("blur", $event), "90"),
        t: __props.disabledText ? 1 : "",
        v: common_vendor.o(($event) => emit("request-focus"), "2f"),
        w: common_vendor.o(($event) => emit("request-focus"), "42"),
        x: __props.focused
      }, __props.focused ? {
        y: common_vendor.o(() => {
        }, "75"),
        z: common_vendor.o(onSendTouchEnd, "03"),
        A: common_vendor.o(onSendClick, "0c")
      } : common_vendor.e({
        B: __props.roomSetting.showUserCenter !== 0
      }, __props.roomSetting.showUserCenter !== 0 ? {
        C: common_vendor.o(($event) => emit("center"), "d6")
      } : {}, {
        D: !useLiveToolbar.value && __props.variant === "portrait" && __props.roomSetting.showProduct !== 0
      }, !useLiveToolbar.value && __props.variant === "portrait" && __props.roomSetting.showProduct !== 0 ? {
        E: common_vendor.o(($event) => emit("product"), "13")
      } : {}, {
        F: useLiveToolbar.value && __props.roomSetting.enableShare !== 0 && __props.isDistributor && __props.distributorStatus === 1
      }, useLiveToolbar.value && __props.roomSetting.enableShare !== 0 && __props.isDistributor && __props.distributorStatus === 1 ? {
        G: common_vendor.o(($event) => emit("share"), "d1")
      } : {}, {
        H: __props.roomSetting.enableLike !== 0
      }, __props.roomSetting.enableLike !== 0 ? common_vendor.e({
        I: common_vendor.f(__props.hearts, (heart, k0, i0) => {
          return {
            a: heart.img,
            b: heart.slotId + "-" + heart.runId,
            c: heart.x + "rpx",
            d: heart.dur + "s",
            e: common_vendor.o(($event) => emit("heart-animation-end", heart.slotId, heart.runId), heart.slotId + "-" + heart.runId)
          };
        }),
        J: useLiveToolbar.value
      }, useLiveToolbar.value ? {
        K: common_vendor.t(likeCountText.value),
        L: common_vendor.o(($event) => emit("like"), "f0")
      } : common_vendor.e({
        M: __props.variant === "landscape"
      }, __props.variant === "landscape" ? {
        N: common_vendor.t(likeCountText.value)
      } : {}, {
        O: common_vendor.o(($event) => emit("like"), "50")
      })) : {}), {
        P: __props.show,
        Q: common_vendor.n({
          "bottom-bar--focused": __props.focused
        }),
        R: common_vendor.n(__props.variant === "landscape" ? "bottom-bar--landscape" : "bottom-bar--portrait"),
        S: common_vendor.s(__props.bottomStyle)
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ec9f674a"]]);
wx.createComponent(Component);
