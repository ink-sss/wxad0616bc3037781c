"use strict";
const pages_live_pageTools = require("../page-tools.js");
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  props: {
    liveId: { type: [Number, String], default: "" }
  },
  emits: ["callBMethod"],
  data() {
    return {
      visible: false,
      list: []
    };
  },
  methods: {
    open() {
      this.visible = true;
      this.load();
    },
    load() {
      pages_live_pageTools.requestWithVm(this, "_post", "live.roomNew/getCheckInListnew", { room_id: this.liveId }).then((res) => {
        this.list = res.data || [];
      }).catch(() => {
      });
    },
    doCheck(item) {
      pages_live_pageTools.requestWithVm(this, "_post", "live.roomNew/doSignincheckNew", {
        room_id: this.liveId,
        task_id: item.id
      }).then(() => {
        this.$emit("callBMethod");
        this.load();
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.visible
  }, $data.visible ? {
    b: common_vendor.f($data.list, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.name || item.title || "签到奖励"),
        b: common_vendor.o(($event) => $options.doCheck(item), item.id),
        c: item.id
      };
    })
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f3fcd964"]]);
wx.createComponent(Component);
