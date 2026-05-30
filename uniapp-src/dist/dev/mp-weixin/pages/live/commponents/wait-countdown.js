"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  props: {
    endTime: { type: [Number, String], default: 0 }
  },
  emits: ["countdownEnd"],
  data() {
    return {
      left: 0,
      timer: null
    };
  },
  computed: {
    display() {
      const seconds = Math.max(0, this.left);
      const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
      const m = String(Math.floor(seconds % 3600 / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      return `${h}:${m}:${s}`;
    }
  },
  mounted() {
    this.start();
  },
  beforeUnmount() {
    this.destroyInterval();
  },
  methods: {
    start() {
      const target = Number(this.endTime || 0);
      this.left = target > 1e9 ? Math.floor(target - Date.now() / 1e3) : target;
      this.timer = setInterval(() => {
        this.left -= 1;
        if (this.left <= 0) {
          this.destroyInterval();
          this.$emit("countdownEnd");
        }
      }, 1e3);
    },
    destroyInterval() {
      if (this.timer)
        clearInterval(this.timer);
      this.timer = null;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($options.display)
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c3be43b4"]]);
wx.createComponent(Component);
