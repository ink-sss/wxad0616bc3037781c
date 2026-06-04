"use strict";
const common_vendor = require("../../common/vendor.js");
const api_refund = require("../../api/refund.js");
if (!Math) {
  BottomSheetPopup();
}
const BottomSheetPopup = () => "../../components/bottom-sheet-popup.js";
const _sfc_main = {
  __name: "refund-detail",
  setup(__props) {
    const refundDetail = common_vendor.ref(null);
    const showLogisticsPopup = common_vendor.ref(false);
    const logisticsCompany = common_vendor.ref("");
    const trackingNo = common_vendor.ref("");
    const logisticsSubmitting = common_vendor.ref(false);
    const REFUND_STATUS_MAP = {
      1: {
        text: "待商家处理",
        title: "退款申请已提交",
        subtitle: "商家正在处理中，请耐心等待",
        className: "status-processing"
      },
      2: {
        text: "待买家退货",
        title: "请尽快退货",
        subtitle: "商家已同意退货退款，请按要求寄回商品",
        className: "status-processing"
      },
      3: {
        text: "待商家收货",
        title: "商家待收货",
        subtitle: "退货物流已提交，等待商家签收",
        className: "status-processing"
      },
      4: {
        text: "退款成功",
        title: "退款成功",
        subtitle: "退款金额已原路返回，请注意查收",
        className: "status-success"
      },
      5: {
        text: "退款关闭",
        title: "退款已关闭",
        subtitle: "当前售后流程已结束",
        className: "status-muted"
      },
      6: {
        text: "退款中",
        title: "退款处理中",
        subtitle: "平台正在处理退款，请稍后查看结果",
        className: "status-processing"
      }
    };
    function mapRefundDetail(data = {}) {
      const statusMeta = REFUND_STATUS_MAP[Number(data.refundStatus || 0)] || {
        text: "售后处理中",
        title: "售后处理中",
        subtitle: "请稍后查看最新状态",
        className: "status-processing"
      };
      return {
        id: Number(data.id || 0),
        refundNo: data.refundNo || "",
        orderId: Number(data.orderId || 0),
        refundType: Number(data.refundType || 0),
        refundTypeText: Number(data.refundType || 0) === 2 ? "退货退款" : "仅退款",
        refundStatus: Number(data.refundStatus || 0),
        refundAmount: Number(data.refundAmount || 0).toFixed(2),
        refundReason: data.refundReason || "-",
        refundDesc: data.refundDesc || "",
        refundImages: Array.isArray(data.refundImages) ? data.refundImages : [],
        rejectReason: data.rejectReason || "",
        returnLogisticsCompany: data.returnLogisticsCompany || "",
        returnTrackingNo: data.returnTrackingNo || "",
        returnAddress: data.returnAddress || null,
        createdAt: data.createdAt || "-",
        productName: data.productName || "商品信息加载中",
        coverImage: data.coverImage || "",
        skuText: data.skuText || "默认规格",
        quantity: Number(data.quantity || 1),
        statusText: statusMeta.text,
        statusTitle: statusMeta.title,
        statusSubtitle: statusMeta.subtitle,
        statusClass: statusMeta.className
      };
    }
    async function loadRefundDetail(refundId) {
      const id = Number(refundId || 0);
      if (!id) {
        common_vendor.index.showToast({ title: "退款参数错误", icon: "none" });
        return;
      }
      try {
        const data = await api_refund.getRefundDetail(id);
        refundDetail.value = mapRefundDetail(data || {});
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "获取退款详情失败", icon: "none" });
      }
    }
    function previewImage(current) {
      var _a;
      common_vendor.index.previewImage({
        current,
        urls: ((_a = refundDetail.value) == null ? void 0 : _a.refundImages) || [current]
      });
    }
    function copyReturnAddress() {
      var _a;
      const addr = (_a = refundDetail.value) == null ? void 0 : _a.returnAddress;
      if (!addr)
        return;
      const text = `收件人：${addr.receiverName}
联系方式：${addr.phone}
详细地址：${addr.province}${addr.city}${addr.district}${addr.address}`;
      common_vendor.index.setClipboardData({
        data: text,
        success: () => common_vendor.index.showToast({ title: "已复制退货地址", icon: "success" })
      });
    }
    async function onSubmitLogistics() {
      if (logisticsSubmitting.value)
        return;
      if (!logisticsCompany.value.trim()) {
        common_vendor.index.showToast({ title: "请输入物流公司", icon: "none" });
        return;
      }
      if (!trackingNo.value.trim()) {
        common_vendor.index.showToast({ title: "请输入物流单号", icon: "none" });
        return;
      }
      logisticsSubmitting.value = true;
      try {
        await api_refund.submitLogistics({
          refundId: refundDetail.value.id,
          returnLogisticsCompany: logisticsCompany.value.trim(),
          returnTrackingNo: trackingNo.value.trim()
        });
        common_vendor.index.showToast({ title: "提交成功", icon: "success" });
        showLogisticsPopup.value = false;
        await loadRefundDetail(refundDetail.value.id);
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "提交失败", icon: "none" });
      } finally {
        logisticsSubmitting.value = false;
      }
    }
    common_vendor.onLoad((options) => {
      loadRefundDetail(options == null ? void 0 : options.refundId);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: refundDetail.value
      }, refundDetail.value ? common_vendor.e({
        b: common_vendor.t(refundDetail.value.statusTitle),
        c: common_vendor.t(refundDetail.value.statusSubtitle),
        d: common_vendor.t(refundDetail.value.statusText),
        e: common_vendor.n(refundDetail.value.statusClass),
        f: refundDetail.value.returnAddress && refundDetail.value.refundType === 2 && refundDetail.value.refundStatus >= 2
      }, refundDetail.value.returnAddress && refundDetail.value.refundType === 2 && refundDetail.value.refundStatus >= 2 ? {
        g: common_vendor.o(copyReturnAddress, "55"),
        h: common_vendor.t(refundDetail.value.returnAddress.receiverName),
        i: common_vendor.t(refundDetail.value.returnAddress.phone),
        j: common_vendor.t(refundDetail.value.returnAddress.province),
        k: common_vendor.t(refundDetail.value.returnAddress.city),
        l: common_vendor.t(refundDetail.value.returnAddress.district),
        m: common_vendor.t(refundDetail.value.returnAddress.address)
      } : {}, {
        n: refundDetail.value.coverImage,
        o: common_vendor.t(refundDetail.value.productName),
        p: common_vendor.t(refundDetail.value.skuText),
        q: common_vendor.t(refundDetail.value.refundAmount),
        r: common_vendor.t(refundDetail.value.quantity),
        s: common_vendor.t(refundDetail.value.refundNo),
        t: common_vendor.t(refundDetail.value.refundTypeText),
        v: common_vendor.t(refundDetail.value.createdAt),
        w: common_vendor.t(refundDetail.value.refundReason),
        x: refundDetail.value.refundDesc
      }, refundDetail.value.refundDesc ? {
        y: common_vendor.t(refundDetail.value.refundDesc)
      } : {}, {
        z: refundDetail.value.refundImages && refundDetail.value.refundImages.length
      }, refundDetail.value.refundImages && refundDetail.value.refundImages.length ? {
        A: common_vendor.f(refundDetail.value.refundImages, (img, idx, i0) => {
          return {
            a: idx,
            b: img,
            c: common_vendor.o(($event) => previewImage(img), idx)
          };
        })
      } : {}, {
        B: refundDetail.value.rejectReason
      }, refundDetail.value.rejectReason ? {
        C: common_vendor.t(refundDetail.value.rejectReason)
      } : {}, {
        D: refundDetail.value.returnLogisticsCompany || refundDetail.value.returnTrackingNo
      }, refundDetail.value.returnLogisticsCompany || refundDetail.value.returnTrackingNo ? {
        E: common_vendor.t(refundDetail.value.returnLogisticsCompany),
        F: common_vendor.t(refundDetail.value.returnTrackingNo)
      } : {}, {
        G: refundDetail.value.refundStatus === 2
      }, refundDetail.value.refundStatus === 2 ? {
        H: common_vendor.o(($event) => showLogisticsPopup.value = true, "49")
      } : {}, {
        I: logisticsCompany.value,
        J: common_vendor.o(($event) => logisticsCompany.value = $event.detail.value, "c9"),
        K: trackingNo.value,
        L: common_vendor.o(($event) => trackingNo.value = $event.detail.value, "c6"),
        M: common_vendor.o(onSubmitLogistics, "04"),
        N: common_vendor.o(($event) => showLogisticsPopup.value = false, "d3"),
        O: common_vendor.p({
          visible: showLogisticsPopup.value,
          height: "600rpx",
          radius: "28rpx 28rpx 0 0",
          duration: 500,
          ["with-mask"]: true,
          ["mask-color"]: "rgba(0, 0, 0, 0.45)"
        })
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5921307f"]]);
wx.createPage(MiniProgramPage);
