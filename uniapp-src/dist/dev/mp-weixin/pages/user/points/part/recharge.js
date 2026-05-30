"use strict";
const common_assets = require("../../../../common/assets.js");
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "Recharge",
  props: {
    isPop: { type: Boolean, default: false },
    discountRatio: { type: [String, Number], default: "0" }
  },
  emits: ["close"],
  data() {
    return {
      input_len: 6,
      visible: false,
      value: "",
      is_send: false
    };
  },
  computed: {
    pointsTitle() {
      return typeof this.points_name === "function" ? this.points_name() : "积分";
    },
    clearIcon() {
      return common_assets._imports_0$18;
    }
  },
  watch: {
    isPop: {
      immediate: true,
      handler(value) {
        this.visible = value;
      }
    }
  },
  methods: {
    submit() {
      if (this.is_send)
        return;
      this.is_send = true;
      this._get(
        "user.User/transPoints",
        { points: this.value },
        (res) => {
          this.is_send = false;
          this.showSuccess(res.msg, () => {
            this.closePop(true);
          });
        },
        () => {
          this.is_send = false;
        }
      );
    },
    closePop(value) {
      this.$emit("close", value);
      this.value = "";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($options.pointsTitle),
    b: "请输入兑换" + $options.pointsTitle + "值",
    c: $data.value,
    d: common_vendor.o(($event) => $data.value = $event.detail.value, "d9"),
    e: $options.clearIcon,
    f: common_vendor.o(($event) => $data.value = "", "47"),
    g: common_vendor.t($options.pointsTitle),
    h: common_vendor.t($props.discountRatio),
    i: common_vendor.o((...args) => $options.submit && $options.submit(...args), "ae"),
    j: common_vendor.o(($event) => $options.closePop(null), "09"),
    k: common_vendor.o(() => {
    }, "84"),
    l: common_vendor.n($data.visible ? "pop-bg open" : "pop-bg close"),
    m: common_vendor.o(($event) => $options.closePop(null), "65")
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-08247d33"]]);
wx.createComponent(Component);
