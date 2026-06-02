"use strict";
const common_vendor = require("../../common/vendor.js");
const api_refund = require("../../api/refund.js");
const services_h5AuthContext = require("../../services/h5-auth-context.js");
const _sfc_main = {
  __name: "refund-list",
  setup(__props) {
    const refundList = common_vendor.ref([]);
    function mapRefund(item) {
      const refundStatus = Number((item == null ? void 0 : item.refundStatus) || 0);
      const refundStatusTagMap = {
        1: { text: "待处理", tagClass: "refund-tag-processing" },
        2: { text: "待退货", tagClass: "refund-tag-processing" },
        3: { text: "待商家收货", tagClass: "refund-tag-processing" },
        4: { text: "退款成功", tagClass: "refund-tag-success" },
        5: { text: "退款关闭", tagClass: "refund-tag-closed" },
        6: { text: "退款中", tagClass: "refund-tag-processing" }
      };
      const tagMeta = refundStatusTagMap[refundStatus] || null;
      const priceStr = Number((item == null ? void 0 : item.refundAmount) || 0).toFixed(2);
      const [priceInt, priceDec = "00"] = priceStr.split(".");
      return {
        id: (item == null ? void 0 : item.id) || 0,
        refundNo: (item == null ? void 0 : item.refundNo) || "",
        orderId: (item == null ? void 0 : item.orderId) || 0,
        refundType: Number((item == null ? void 0 : item.refundType) || 0),
        refundTypeText: Number((item == null ? void 0 : item.refundType) || 0) === 2 ? "退货退款" : "仅退款",
        refundStatus,
        refundTag: (tagMeta == null ? void 0 : tagMeta.text) || "售后处理中",
        refundTagClass: (tagMeta == null ? void 0 : tagMeta.tagClass) || "refund-tag-processing",
        refundAmount: priceStr,
        priceInt,
        priceDec,
        refundReason: (item == null ? void 0 : item.refundReason) || "-",
        createdAt: (item == null ? void 0 : item.createdAt) || "-",
        productName: (item == null ? void 0 : item.productName) || "",
        coverImage: (item == null ? void 0 : item.coverImage) || "",
        skuText: (item == null ? void 0 : item.skuText) || "",
        price: (item == null ? void 0 : item.price) || 0,
        quantity: (item == null ? void 0 : item.quantity) || 1
      };
    }
    async function loadRefunds() {
      try {
        const data = await api_refund.getRefundList({
          page: 1,
          pageSize: 20,
          refundStatus: 0
        });
        const list = Array.isArray(data == null ? void 0 : data.list) ? data.list : [];
        refundList.value = list.map(mapRefund);
      } catch (err) {
        console.error("[RefundList] loadRefunds fail:", err);
      }
    }
    common_vendor.onLoad((options) => {
      if (!services_h5AuthContext.ensureH5PageAuth(options))
        return;
      loadRefunds();
    });
    common_vendor.onShow(() => {
      if (!services_h5AuthContext.ensureH5PageAuth())
        return;
      loadRefunds();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: refundList.value.length
      }, refundList.value.length ? {
        b: common_vendor.f(refundList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.refundNo),
            b: item.coverImage,
            c: common_vendor.t(item.productName),
            d: common_vendor.t(item.skuText),
            e: common_vendor.t(item.quantity),
            f: common_vendor.t(item.refundTag),
            g: common_vendor.n(item.refundTagClass),
            h: common_vendor.t(item.priceInt),
            i: common_vendor.t(item.priceDec),
            j: item.id
          };
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7adfef09"]]);
wx.createPage(MiniProgramPage);
