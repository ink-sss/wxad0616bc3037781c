"use strict";
const common_vendor = require("../../common/vendor.js");
const NoticeBarNvue = () => "../../components/notice-bar-nvue.js";
const UniNoticeBar = () => "../../uni_modules/uni-notice-bar/components/uni-notice-bar/uni-notice-bar.js";
const _sfc_main = {
  components: {
    NoticeBarNvue,
    UniNoticeBar
  },
  data() {
    return {
      notice: "阿斯卡吉受打，生"
    };
  }
};
if (!Array) {
  const _easycom_uni_notice_bar2 = common_vendor.resolveComponent("uni-notice-bar");
  const _component_notice_bar_nvue = common_vendor.resolveComponent("notice-bar-nvue");
  (_easycom_uni_notice_bar2 + _component_notice_bar_nvue)();
}
const _easycom_uni_notice_bar = () => "../../uni_modules/uni-notice-bar/components/uni-notice-bar/uni-notice-bar.js";
if (!Math) {
  _easycom_uni_notice_bar();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.notice
  }, $data.notice ? {
    b: common_vendor.p({
      color: "#ffffff",
      ["background-color"]: "rgba(1,1,1,0.75)",
      speed: 50,
      scrollable: true,
      single: true,
      text: $data.notice,
      ["more-color"]: "#de8c17",
      ["more-text"]: "查看更多",
      ["show-icon"]: true,
      ["show-close"]: true
    })
  } : {}, {
    c: common_vendor.p({
      text: $data.notice,
      speed: 30,
      ["background-color"]: "rgba(1,1,1,0.75)",
      color: "#ffffff",
      ["show-close"]: true
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d65e5c9c"]]);
wx.createPage(MiniProgramPage);
