"use strict";
const common_vendor = require("../../../../common/vendor.js");
const __default__ = {
  name: "wd-radio-group",
  options: {
    virtualHost: true,
    addGlobalClass: true,
    styleIsolation: "shared"
  }
};
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  ...__default__,
  props: common_vendor.radioGroupProps,
  emits: ["change", "update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { linkChildren } = common_vendor.useChildren(common_vendor.RADIO_GROUP_KEY);
    linkChildren({ props, updateValue });
    common_vendor.watch(
      () => props.shape,
      (newValue) => {
        const type = ["check", "dot", "button"];
        if (type.indexOf(newValue) === -1)
          console.error(`shape must be one of ${type.toString()}`);
      },
      { deep: true, immediate: true }
    );
    function updateValue(value) {
      emit("update:modelValue", value);
      emit("change", {
        value
      });
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.n(`wd-radio-group  ${_ctx.customClass} ${_ctx.cell && _ctx.shape === "button" ? "is-button" : ""}`),
        b: common_vendor.s(_ctx.customStyle)
      };
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a6e3f5b0"]]);
wx.createComponent(Component);
