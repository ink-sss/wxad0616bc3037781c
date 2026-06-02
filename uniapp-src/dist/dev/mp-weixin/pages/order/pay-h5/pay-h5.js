"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  onLoad(query = {}) {
    const orderNo = query.orderNo || query.order_no || "";
    const orderId = query.id || query.orderId || query.order_id || "";
    const amount = query.amount || query.payAmount || "";
    common_vendor.index.redirectTo({ url: `/pages/order/pay?orderNo=${encodeURIComponent(orderNo)}&id=${encodeURIComponent(orderId)}&amount=${encodeURIComponent(amount)}` });
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {};
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-14cac7e2"]]);
wx.createPage(MiniProgramPage);
