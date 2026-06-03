"use strict";
const common_vendor = require("../common/vendor.js");
const composables_useLiveMiniWindow = require("../composables/useLiveMiniWindow.js");
const _sfc_main = {
  __name: "live-mini-window",
  props: {
    roomCode: {
      type: [String, Number],
      default: ""
    },
    enabled: {
      type: Boolean,
      default: true
    },
    bottomOffset: {
      type: Number,
      default: 190
    },
    returnOrigin: {
      type: String,
      default: ""
    }
  },
  setup(__props) {
    const props = __props;
    const {
      visible,
      poster,
      playUrl,
      hasPlayableSource,
      muted,
      isPlaying,
      miniStyle,
      closeMini,
      restoreLive,
      playMini,
      onDragStart,
      onDragMove,
      onDragEnd
    } = composables_useLiveMiniWindow.useLiveMiniWindow(props);
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(visible)
      }, common_vendor.unref(visible) ? common_vendor.e({
        b: common_vendor.unref(hasPlayableSource)
      }, common_vendor.unref(hasPlayableSource) ? {
        c: common_vendor.unref(playUrl),
        d: common_vendor.unref(poster),
        e: common_vendor.unref(muted),
        f: common_vendor.o(($event) => isPlaying.value = true, "cd"),
        g: common_vendor.o(($event) => isPlaying.value = false, "1b")
      } : {}, {
        h: common_vendor.unref(hasPlayableSource) && common_vendor.unref(poster) && !common_vendor.unref(isPlaying)
      }, common_vendor.unref(hasPlayableSource) && common_vendor.unref(poster) && !common_vendor.unref(isPlaying) ? {
        i: common_vendor.unref(poster)
      } : common_vendor.unref(poster) ? {
        k: common_vendor.unref(poster)
      } : {}, {
        j: common_vendor.unref(poster),
        l: common_vendor.o((...args) => common_vendor.unref(restoreLive) && common_vendor.unref(restoreLive)(...args), "58"),
        m: common_vendor.o((...args) => common_vendor.unref(closeMini) && common_vendor.unref(closeMini)(...args), "76"),
        n: common_vendor.unref(hasPlayableSource) && !common_vendor.unref(isPlaying)
      }, common_vendor.unref(hasPlayableSource) && !common_vendor.unref(isPlaying) ? {
        o: common_vendor.o((...args) => common_vendor.unref(playMini) && common_vendor.unref(playMini)(...args), "f4")
      } : {}, {
        p: common_vendor.o((...args) => common_vendor.unref(restoreLive) && common_vendor.unref(restoreLive)(...args), "0a"),
        q: common_vendor.s(common_vendor.unref(miniStyle)),
        r: common_vendor.o((...args) => common_vendor.unref(onDragStart) && common_vendor.unref(onDragStart)(...args), "25"),
        s: common_vendor.o((...args) => common_vendor.unref(onDragMove) && common_vendor.unref(onDragMove)(...args), "1c"),
        t: common_vendor.o((...args) => common_vendor.unref(onDragEnd) && common_vendor.unref(onDragEnd)(...args), "37")
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-84a35452"]]);
wx.createComponent(Component);
