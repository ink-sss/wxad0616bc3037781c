"use strict";
const common_vendor = require("../../../../common/vendor.js");
if (!Math) {
  wdIcon();
}
const wdIcon = () => "../wd-icon/wd-icon.js";
const __default__ = {
  name: "wd-radio",
  options: {
    virtualHost: true,
    addGlobalClass: true,
    styleIsolation: "shared"
  }
};
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  ...__default__,
  props: common_vendor.radioProps,
  setup(__props) {
    const props = __props;
    const { parent: radioGroup } = common_vendor.useParent(common_vendor.RADIO_GROUP_KEY);
    const isChecked = common_vendor.computed(() => {
      if (radioGroup) {
        return props.value === radioGroup.props.modelValue;
      } else {
        return false;
      }
    });
    const shapeValue = common_vendor.computed(() => {
      return props.shape || common_vendor.getPropByPath(radioGroup, "props.shape");
    });
    const checkedColorValue = common_vendor.computed(() => {
      return props.checkedColor || common_vendor.getPropByPath(radioGroup, "props.checkedColor");
    });
    const disabledValue = common_vendor.computed(() => {
      if (common_vendor.isDef(props.disabled)) {
        return props.disabled;
      } else {
        return common_vendor.getPropByPath(radioGroup, "props.disabled");
      }
    });
    const inlineValue = common_vendor.computed(() => {
      if (common_vendor.isDef(props.inline)) {
        return props.inline;
      } else {
        return common_vendor.getPropByPath(radioGroup, "props.inline");
      }
    });
    const sizeValue = common_vendor.computed(() => {
      return props.size || common_vendor.getPropByPath(radioGroup, "props.size");
    });
    const cellValue = common_vendor.computed(() => {
      if (common_vendor.isDef(props.cell)) {
        return props.cell;
      } else {
        return common_vendor.getPropByPath(radioGroup, "props.cell");
      }
    });
    const iconPlacement = common_vendor.computed(() => {
      if (common_vendor.isDef(props.iconPlacement)) {
        return props.iconPlacement;
      } else {
        return common_vendor.getPropByPath(radioGroup, "props.iconPlacement");
      }
    });
    common_vendor.watch(
      () => props.shape,
      (newValue) => {
        const type = ["check", "dot", "button"];
        if (!newValue || type.indexOf(newValue) === -1)
          console.error(`shape must be one of ${type.toString()}`);
      }
    );
    function handleClick() {
      const { value } = props;
      if (!disabledValue.value && radioGroup && common_vendor.isDef(value)) {
        radioGroup.updateValue(value);
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.s(`${_ctx.maxWidth ? "max-width:" + _ctx.maxWidth : ""};  ${isChecked.value && shapeValue.value === "button" && !disabledValue.value ? "color :" + checkedColorValue.value : ""}`),
        b: shapeValue.value === "check"
      }, shapeValue.value === "check" ? {
        c: common_vendor.s(isChecked.value && !disabledValue.value ? "color: " + checkedColorValue.value : ""),
        d: common_vendor.p({
          name: "check"
        })
      } : {}, {
        e: common_vendor.s(isChecked.value && !disabledValue.value ? "color: " + checkedColorValue.value : ""),
        f: common_vendor.n(`wd-radio ${cellValue.value ? "is-cell-radio" : ""} ${cellValue.value && shapeValue.value == "button" ? "is-button-radio" : ""} ${sizeValue.value ? "is-" + sizeValue.value : ""} ${inlineValue.value ? "is-inline" : ""} ${isChecked.value ? "is-checked" : ""} ${shapeValue.value !== "check" ? "is-" + shapeValue.value : ""} ${disabledValue.value ? "is-disabled" : ""} icon-placement-${iconPlacement.value} ${_ctx.customClass}`),
        g: common_vendor.s(_ctx.customStyle),
        h: common_vendor.o(handleClick, "2d")
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2fd539cb"]]);
wx.createComponent(Component);
