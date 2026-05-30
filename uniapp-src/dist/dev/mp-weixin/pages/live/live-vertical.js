"use strict";
const common_vendor = require("../../common/vendor.js");
const LiveRoomShell = () => "./LiveRoomShell.js";
const _sfc_main = {
  components: {
    LiveRoomShell
  }
};
if (!Array) {
  const _component_live_room_shell = common_vendor.resolveComponent("live-room-shell");
  _component_live_room_shell();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      orientation: "vertical"
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
