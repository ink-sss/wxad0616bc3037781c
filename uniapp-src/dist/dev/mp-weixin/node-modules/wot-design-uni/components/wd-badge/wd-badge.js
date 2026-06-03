"use strict";
const common_vendor = require("../../../../common/vendor.js");
const __default__ = {
  name: "wd-badge",
  options: {
    addGlobalClass: true,
    virtualHost: true,
    styleIsolation: "shared"
  }
};
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  ...__default__,
  props: common_vendor.badgeProps,
  setup(__props) {
    const props = __props;
    const content = common_vendor.computed(() => {
      const { modelValue, max, isDot } = props;
      if (isDot)
        return "";
      let value = modelValue;
      if (value && max && common_vendor.isNumber(value) && !Number.isNaN(value) && !Number.isNaN(max)) {
        value = max < value ? `${max}+` : value;
      }
      return value;
    });
    const contentStyle = common_vendor.computed(() => {
      const style = {};
      if (common_vendor.isDef(props.bgColor)) {
        style.backgroundColor = props.bgColor;
      }
      if (common_vendor.isDef(props.top)) {
        style.top = common_vendor.addUnit(props.top);
      }
      if (common_vendor.isDef(props.right)) {
        style.right = common_vendor.addUnit(props.right);
      }
      return common_vendor.objToStyle(style);
    });
    const shouldShowBadge = common_vendor.computed(() => !props.hidden && (content.value || content.value === 0 && props.showZero || props.isDot));
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: shouldShowBadge.value
      }, shouldShowBadge.value ? {
        b: common_vendor.t(content.value),
        c: common_vendor.n(_ctx.type ? "wd-badge__content--" + _ctx.type : ""),
        d: common_vendor.n(_ctx.isDot ? "is-dot" : ""),
        e: common_vendor.s(contentStyle.value)
      } : {}, {
        f: common_vendor.n(_ctx.customClass),
        g: common_vendor.s(_ctx.customStyle)
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1eb01bf6"]]);
wx.createComponent(Component);
