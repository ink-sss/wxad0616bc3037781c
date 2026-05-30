"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "Countdown",
  props: { config: { type: Object, default: () => ({ type: "all" }) } },
  emits: ["returnVal"],
  data() {
    return { status: 0, day: "0", hour: "0", minute: "0", second: "0", timer: null, totalSeconds: 0, title: "活动剩余：" };
  },
  computed: { totalHours() {
    return Number(this.day) * 24 + Number(this.hour);
  }, themeName() {
    return typeof this.theme === "function" ? this.theme() : "";
  }, themeClass() {
    return this.themeName || "";
  } },
  watch: { config: { deep: true, immediate: true, handler(value) {
    if (value && value.endstamp) {
      if (value.title)
        this.title = value.title;
      this.setTime();
    }
  } } },
  beforeUnmount() {
    this.clear();
  },
  unmounted() {
    this.clear();
  },
  methods: {
    setTime() {
      this.clear();
      this.init();
      this.timer = setInterval(() => this.init(), 1e3);
    },
    init() {
      const now = Date.now() / 1e3;
      if (now < this.config.startstamp)
        this.status = 1;
      else if (now > this.config.endstamp)
        this.status = 2;
      else {
        this.totalSeconds = parseInt(this.config.endstamp - now, 10);
        this.status = 0;
        this.countDown();
      }
      this.$emit("returnVal", this.status);
    },
    countDown() {
      const total = Math.max(0, this.totalSeconds);
      const d = Math.floor(total / 86400);
      let rest = total % 86400;
      const h = Math.floor(rest / 3600);
      rest %= 3600;
      const m = Math.floor(rest / 60);
      const s = rest % 60;
      this.day = this.two(d);
      this.hour = this.two(h);
      this.minute = this.two(m);
      this.second = this.two(s);
    },
    two(value) {
      return value < 10 ? "0" + value : String(value);
    },
    clear() {
      if (this.timer)
        clearInterval(this.timer);
      this.timer = null;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.config && $props.config.type == null
  }, $props.config && $props.config.type == null ? common_vendor.e({
    b: $data.status === 0
  }, $data.status === 0 ? {
    c: common_vendor.t($data.title)
  } : $data.status === 1 ? {} : {}, {
    d: $data.status === 1,
    e: common_vendor.t($data.day),
    f: common_vendor.t($data.hour),
    g: common_vendor.t($data.minute),
    h: common_vendor.t($data.second)
  }) : $props.config && $props.config.type === "text" ? {
    j: common_vendor.t($data.title),
    k: common_vendor.t($options.totalHours),
    l: common_vendor.t($data.minute),
    m: common_vendor.t($data.second),
    n: common_vendor.n($props.config.isWhite ? "white" : "dominant")
  } : {}, {
    i: $props.config && $props.config.type === "text",
    o: common_vendor.n($options.themeClass),
    p: $options.themeName
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-33beca22"]]);
wx.createComponent(Component);
