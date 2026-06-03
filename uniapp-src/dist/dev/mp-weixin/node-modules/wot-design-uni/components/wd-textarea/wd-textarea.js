"use strict";
const common_vendor = require("../../../../common/vendor.js");
if (!Math) {
  wdIcon();
}
const wdIcon = () => "../wd-icon/wd-icon.js";
const __default__ = {
  name: "wd-textarea",
  options: {
    virtualHost: true,
    addGlobalClass: true,
    styleIsolation: "shared"
  }
};
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  ...__default__,
  props: common_vendor.textareaProps,
  emits: [
    "update:modelValue",
    "clear",
    "blur",
    "focus",
    "input",
    "keyboardheightchange",
    "confirm",
    "linechange",
    "clickprefixicon",
    "click"
  ],
  setup(__props, { emit: __emit }) {
    const { translate } = common_vendor.useTranslate("textarea");
    const props = __props;
    const emit = __emit;
    const slots = common_vendor.useSlots();
    const placeholderValue = common_vendor.computed(() => {
      return common_vendor.isDef(props.placeholder) ? props.placeholder : translate("placeholder");
    });
    const clearing = common_vendor.ref(false);
    const focused = common_vendor.ref(false);
    const focusing = common_vendor.ref(false);
    const inputValue = common_vendor.ref("");
    const cell = common_vendor.useCell();
    common_vendor.watch(
      () => props.focus,
      (newValue) => {
        focused.value = newValue;
      },
      { immediate: true, deep: true }
    );
    common_vendor.watch(
      () => props.modelValue,
      (newValue) => {
        inputValue.value = common_vendor.isDef(newValue) ? String(newValue) : "";
      },
      { immediate: true, deep: true }
    );
    const { parent: form } = common_vendor.useParent(common_vendor.FORM_KEY);
    const showClear = common_vendor.computed(() => {
      const { disabled, readonly, clearable, clearTrigger } = props;
      if (clearable && !readonly && !disabled && inputValue.value && (clearTrigger === "always" || props.clearTrigger === "focus" && focusing.value)) {
        return true;
      } else {
        return false;
      }
    });
    const showWordCount = common_vendor.computed(() => {
      const { disabled, readonly, maxlength, showWordLimit } = props;
      return Boolean(!disabled && !readonly && common_vendor.isDef(maxlength) && maxlength > -1 && showWordLimit);
    });
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
    const currentLength = common_vendor.computed(() => {
      return Array.from(String(formatValue(props.modelValue))).length;
    });
    const rootClass = common_vendor.computed(() => {
      return `wd-textarea   ${props.label || slots.label ? "is-cell" : ""} ${props.center ? "is-center" : ""} ${cell.border.value ? "is-border" : ""} ${props.size ? "is-" + props.size : ""} ${props.error ? "is-error" : ""} ${props.disabled ? "is-disabled" : ""} ${props.autoHeight ? "is-auto-height" : ""} ${currentLength.value > 0 ? "is-not-empty" : ""}  ${props.noBorder ? "is-no-border" : ""} ${props.customClass}`;
    });
    common_vendor.computed(() => {
      return `wd-textarea__label ${props.customLabelClass}`;
    });
    const inputPlaceholderClass = common_vendor.computed(() => {
      return `wd-textarea__placeholder  ${props.placeholderClass}`;
    });
    const countClass = common_vendor.computed(() => {
      return `${currentLength.value > 0 ? "wd-textarea__count-current" : ""} ${currentLength.value > props.maxlength ? "is-error" : ""}`;
    });
    const labelStyle = common_vendor.computed(() => {
      return props.labelWidth ? common_vendor.objToStyle({
        "min-width": props.labelWidth,
        "max-width": props.labelWidth
      }) : "";
    });
    common_vendor.onBeforeMount(() => {
      initState();
    });
    function initState() {
      inputValue.value = formatValue(inputValue.value);
      emit("update:modelValue", inputValue.value);
    }
    function formatValue(value) {
      if (value === null || value === void 0)
        return "";
      const { maxlength, showWordLimit } = props;
      if (showWordLimit && maxlength !== -1 && String(value).length > maxlength) {
        return value.toString().substring(0, maxlength);
      }
      return `${value}`;
    }
    async function handleClear() {
      focusing.value = false;
      inputValue.value = "";
      if (props.focusWhenClear) {
        clearing.value = true;
        focused.value = false;
      }
      await common_vendor.pause();
      if (props.focusWhenClear) {
        focused.value = true;
        focusing.value = true;
      }
      emit("update:modelValue", inputValue.value);
      emit("clear");
    }
    async function handleBlur({ detail }) {
      await common_vendor.pause(150);
      if (clearing.value) {
        clearing.value = false;
        return;
      }
      focusing.value = false;
      emit("blur", {
        value: inputValue.value,
        cursor: detail.cursor ? detail.cursor : null
      });
    }
    function handleFocus({ detail }) {
      focusing.value = true;
      emit("focus", detail);
    }
    function handleInput({ detail }) {
      inputValue.value = formatValue(inputValue.value);
      emit("update:modelValue", inputValue.value);
      emit("input", detail);
    }
    function handleKeyboardheightchange({ detail }) {
      emit("keyboardheightchange", detail);
    }
    function handleConfirm({ detail }) {
      emit("confirm", detail);
    }
    function handleLineChange({ detail }) {
      emit("linechange", detail);
    }
    function onClickPrefixIcon() {
      emit("clickprefixicon");
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: _ctx.label || _ctx.$slots.label
      }, _ctx.label || _ctx.$slots.label ? common_vendor.e({
        b: isRequired.value && _ctx.markerSide === "before"
      }, isRequired.value && _ctx.markerSide === "before" ? {} : {}, {
        c: _ctx.prefixIcon || _ctx.$slots.prefix
      }, _ctx.prefixIcon || _ctx.$slots.prefix ? common_vendor.e({
        d: _ctx.prefixIcon && !_ctx.$slots.prefix
      }, _ctx.prefixIcon && !_ctx.$slots.prefix ? {
        e: common_vendor.o(onClickPrefixIcon, "a6"),
        f: common_vendor.p({
          ["custom-class"]: "wd-textarea__icon",
          name: _ctx.prefixIcon
        })
      } : {}) : {}, {
        g: _ctx.label && !_ctx.$slots.label
      }, _ctx.label && !_ctx.$slots.label ? {
        h: common_vendor.t(_ctx.label)
      } : _ctx.$slots.label ? {} : {}, {
        i: _ctx.$slots.label,
        j: isRequired.value && _ctx.markerSide === "after"
      }, isRequired.value && _ctx.markerSide === "after" ? {} : {}, {
        k: common_vendor.s(labelStyle.value)
      }) : {}, {
        l: common_vendor.n(`wd-textarea__inner ${_ctx.customTextareaClass}`),
        m: placeholderValue.value,
        n: _ctx.disabled || _ctx.readonly,
        o: _ctx.enableNative,
        p: _ctx.maxlength,
        q: focused.value,
        r: _ctx.autoFocus,
        s: _ctx.placeholderStyle,
        t: inputPlaceholderClass.value,
        v: _ctx.autoHeight,
        w: _ctx.cursorSpacing,
        x: _ctx.fixed,
        y: _ctx.cursor,
        z: _ctx.showConfirmBar,
        A: _ctx.selectionStart,
        B: _ctx.selectionEnd,
        C: _ctx.adjustPosition,
        D: _ctx.holdKeyboard,
        E: _ctx.confirmType,
        F: _ctx.confirmHold,
        G: _ctx.disableDefaultPadding,
        H: _ctx.ignoreCompositionEvent,
        I: _ctx.inputmode,
        J: common_vendor.o([($event) => inputValue.value = $event.detail.value, handleInput], "c4"),
        K: common_vendor.o(handleFocus, "91"),
        L: common_vendor.o(handleBlur, "fc"),
        M: common_vendor.o(handleConfirm, "bf"),
        N: common_vendor.o(handleLineChange, "83"),
        O: common_vendor.o(handleKeyboardheightchange, "80"),
        P: inputValue.value,
        Q: errorMessage.value
      }, errorMessage.value ? {
        R: common_vendor.t(errorMessage.value)
      } : {}, {
        S: props.readonly
      }, props.readonly ? {} : {}, {
        T: showClear.value
      }, showClear.value ? {
        U: common_vendor.o(handleClear, "db"),
        V: common_vendor.p({
          ["custom-class"]: "wd-textarea__clear",
          name: "error-fill"
        })
      } : {}, {
        W: showWordCount.value
      }, showWordCount.value ? {
        X: common_vendor.t(currentLength.value),
        Y: common_vendor.n(countClass.value),
        Z: common_vendor.t(_ctx.maxlength)
      } : {}, {
        aa: common_vendor.n(`wd-textarea__value ${showClear.value ? "is-suffix" : ""} ${_ctx.customTextareaContainerClass} ${showWordCount.value ? "is-show-limit" : ""}`),
        ab: common_vendor.n(rootClass.value),
        ac: common_vendor.s(_ctx.customStyle)
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-324b46d3"]]);
wx.createComponent(Component);
