"use strict";
const common_vendor = require("../../../common/vendor.js");
const defaultTextColor = "rgba(255,255,255,1)";
const defaultBgColor = "rgba(240,74,98,.7)";
const _sfc_main = {
  __name: "LiveMarqueeAd",
  props: {
    roomSetting: {
      type: Object,
      default: () => ({})
    },
    variant: {
      type: String,
      default: "portrait"
    }
  },
  setup(__props) {
    const props = __props;
    const dismissed = common_vendor.ref(false);
    const text = common_vendor.computed(() => {
      var _a;
      return String(((_a = props.roomSetting) == null ? void 0 : _a.marqueeText) || "").trim();
    });
    const enabled = common_vendor.computed(() => {
      var _a;
      return Number((_a = props.roomSetting) == null ? void 0 : _a.marqueeEnabled) === 1;
    });
    const isLandscape = common_vendor.computed(() => props.variant === "landscape");
    const visible = common_vendor.computed(() => enabled.value && text.value && !dismissed.value);
    const positionClass = common_vendor.computed(() => {
      var _a;
      if (isLandscape.value)
        return "live-marquee-ad--landscape";
      const position = Number(((_a = props.roomSetting) == null ? void 0 : _a.marqueePosition) || 1);
      if (position === 2)
        return "live-marquee-ad--middle";
      if (position === 3)
        return "live-marquee-ad--bottom";
      return "live-marquee-ad--top";
    });
    const trackStyle = common_vendor.computed(() => {
      var _a, _b;
      return {
        color: ((_a = props.roomSetting) == null ? void 0 : _a.marqueeTextColor) || defaultTextColor,
        backgroundColor: ((_b = props.roomSetting) == null ? void 0 : _b.marqueeBgColor) || defaultBgColor
      };
    });
    const dismiss = () => {
      dismissed.value = true;
    };
    common_vendor.watch(
      () => {
        var _a, _b;
        return [(_a = props.roomSetting) == null ? void 0 : _a.marqueeEnabled, (_b = props.roomSetting) == null ? void 0 : _b.marqueeText];
      },
      () => {
        dismissed.value = false;
      }
    );
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: visible.value
      }, visible.value ? {
        b: common_vendor.t(text.value),
        c: common_vendor.o(dismiss, "35"),
        d: common_vendor.s(trackStyle.value),
        e: common_vendor.o(() => {
        }, "ad"),
        f: common_vendor.n(positionClass.value)
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b0332e4b"]]);
wx.createComponent(Component);
