"use strict";
const common_vendor = require("../../../../common/vendor.js");
if (!Math) {
  wdIcon();
}
const wdIcon = () => "../wd-icon/wd-icon.js";
const __default__ = {
  name: "wd-cell",
  options: {
    addGlobalClass: true,
    virtualHost: true,
    styleIsolation: "shared"
  }
};
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  ...__default__,
  props: common_vendor.cellProps,
  emits: ["click"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const slots = common_vendor.useSlots();
    const cell = common_vendor.useCell();
    const isBorder = common_vendor.computed(() => {
      return Boolean(common_vendor.isDef(props.border) ? props.border : cell.border.value);
    });
    const { parent: form } = common_vendor.useParent(common_vendor.FORM_KEY);
    const errorMessage = common_vendor.computed(() => {
      if (form && props.prop && form.errorMessages && form.errorMessages[props.prop]) {
        return form.errorMessages[props.prop];
      } else {
        return "";
      }
    });
    const isRequired = common_vendor.computed(() => {
      let formRequired = false;
      if (form && form.props.rules) {
        const rules = form.props.rules;
        for (const key in rules) {
          if (Object.prototype.hasOwnProperty.call(rules, key) && key === props.prop && Array.isArray(rules[key])) {
            formRequired = rules[key].some((rule) => rule.required);
          }
        }
      }
      return props.required || props.rules.some((rule) => rule.required) || formRequired;
    });
    const showLeft = common_vendor.computed(() => {
      const hasIcon = slots.icon || props.icon;
      const hasTitle = slots.title && props.useTitleSlot || props.title;
      const hasLabel = slots.label || props.label;
      return hasIcon || hasTitle || hasLabel;
    });
    function onClick() {
      const url = props.to;
      if (props.clickable || props.isLink) {
        emit("click");
      }
      if (url && props.isLink) {
        if (props.replace) {
          common_vendor.index.redirectTo({ url });
        } else {
          common_vendor.index.navigateTo({ url });
        }
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: showLeft.value
      }, showLeft.value ? common_vendor.e({
        b: isRequired.value && _ctx.markerSide === "before"
      }, isRequired.value && _ctx.markerSide === "before" ? {} : {}, {
        c: _ctx.icon
      }, _ctx.icon ? {
        d: common_vendor.p({
          name: _ctx.icon,
          size: _ctx.iconSize,
          ["custom-class"]: `wd-cell__icon  ${_ctx.customIconClass}`
        })
      } : {}, {
        e: _ctx.useTitleSlot && _ctx.$slots.title
      }, _ctx.useTitleSlot && _ctx.$slots.title ? {} : _ctx.title ? {
        g: common_vendor.t(_ctx.title),
        h: common_vendor.n(_ctx.customTitleClass)
      } : {}, {
        f: _ctx.title,
        i: _ctx.label
      }, _ctx.label ? {
        j: common_vendor.t(_ctx.label),
        k: common_vendor.n(`wd-cell__label ${_ctx.customLabelClass}`)
      } : {}, {
        l: isRequired.value && _ctx.markerSide === "after"
      }, isRequired.value && _ctx.markerSide === "after" ? {} : {}, {
        m: common_vendor.s(_ctx.titleWidth ? "min-width:" + _ctx.titleWidth + ";max-width:" + _ctx.titleWidth + ";" : "")
      }) : {}, {
        n: common_vendor.t(_ctx.value),
        o: common_vendor.n(`wd-cell__value ${_ctx.customValueClass} wd-cell__value--${_ctx.valueAlign} ${_ctx.ellipsis ? "wd-cell__value--ellipsis" : ""}`),
        p: _ctx.isLink
      }, _ctx.isLink ? {
        q: common_vendor.p({
          ["custom-class"]: "wd-cell__arrow-right",
          name: `arrow-${_ctx.arrowDirection || "right"}`
        })
      } : {}, {
        r: errorMessage.value
      }, errorMessage.value ? {
        s: common_vendor.t(errorMessage.value)
      } : {}, {
        t: common_vendor.n(_ctx.vertical ? "is-vertical" : ""),
        v: common_vendor.n(isBorder.value ? "is-border" : ""),
        w: common_vendor.n(_ctx.size ? "is-" + _ctx.size : ""),
        x: common_vendor.n(_ctx.center ? "is-center" : ""),
        y: common_vendor.n(_ctx.customClass),
        z: common_vendor.s(_ctx.customStyle),
        A: _ctx.isLink || _ctx.clickable ? "is-hover" : "none",
        B: common_vendor.o(onClick, "cf")
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a65b3963"]]);
wx.createComponent(Component);
