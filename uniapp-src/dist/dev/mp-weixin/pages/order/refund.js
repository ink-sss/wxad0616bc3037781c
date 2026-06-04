"use strict";
const common_vendor = require("../../common/vendor.js");
const api_order = require("../../api/order.js");
const api_refund = require("../../api/refund.js");
const platform_weixin_file = require("../../platform/weixin/file.js");
if (!Math) {
  BottomSheetPopup();
}
const BottomSheetPopup = () => "../../components/bottom-sheet-popup.js";
const defaultImage = "https://man.lqjy.cc/static/remote-icons/figma-product-placeholder.png";
const _sfc_main = {
  __name: "refund",
  setup(__props) {
    const orderId = common_vendor.ref(0);
    const orderItemId = common_vendor.ref(0);
    const orderStatus = common_vendor.ref(0);
    const refundType = common_vendor.ref(1);
    const refundAmount = common_vendor.ref(0);
    const refundItem = common_vendor.ref({
      image: defaultImage,
      title: "",
      spec: "",
      quantity: 1,
      price: "0.00"
    });
    const description = common_vendor.ref("");
    const reasons = ["不想要了", "卖家发错货了", "质量问题", "商品破损", "其他"];
    const selectedReason = common_vendor.ref("");
    const tempReason = common_vendor.ref("");
    const showReasonPopup = common_vendor.ref(false);
    const refundImages = common_vendor.ref([]);
    const submitting = common_vendor.ref(false);
    const uploading = common_vendor.ref(false);
    function formatAmount(value) {
      return Number(value || 0).toFixed(2);
    }
    async function loadOrderInfo(id) {
      var _a, _b;
      try {
        const data = await api_order.getOrderDetail(id);
        if (!data)
          return;
        orderStatus.value = Number(data.orderStatus || 0);
        if (orderStatus.value >= 3) {
          refundType.value = 2;
        }
        refundAmount.value = data.payAmount || 0;
        if (((_a = data.items) == null ? void 0 : _a.length) > 0) {
          const item = data.items[0];
          orderItemId.value = item.id || 0;
          refundItem.value = {
            image: item.coverImage || defaultImage,
            title: item.productName || "",
            spec: item.skuText || "",
            quantity: item.quantity || 1,
            price: ((_b = item.price) == null ? void 0 : _b.toFixed(2)) || "0.00"
          };
        }
      } catch (err) {
        console.error("[Refund] loadOrderInfo fail:", err);
      }
    }
    common_vendor.onLoad((options) => {
      if (options == null ? void 0 : options.orderId) {
        orderId.value = Number(options.orderId);
        loadOrderInfo(orderId.value);
      } else if (options == null ? void 0 : options.payload) {
        const parsed = JSON.parse(decodeURIComponent(options.payload));
        refundItem.value = { ...refundItem.value, ...parsed };
        orderId.value = parsed.orderId || parsed.id || 0;
        refundAmount.value = Number(parsed.price || 0) * (parsed.quantity || 1);
      }
    });
    function confirmReason() {
      if (!tempReason.value)
        return;
      selectedReason.value = tempReason.value;
      showReasonPopup.value = false;
    }
    function onUpload() {
      if (uploading.value)
        return;
      if (!orderId.value) {
        common_vendor.index.showToast({ title: "订单信息异常", icon: "none" });
        return;
      }
      platform_weixin_file.chooseImage({ count: 3 - refundImages.value.length }).then((res) => uploadImages(res.tempFilePaths || [], res.tempFiles || [])).catch((error) => {
        if (!String((error == null ? void 0 : error.errMsg) || "").includes("cancel")) {
          common_vendor.index.showToast({ title: "选择图片失败", icon: "none" });
        }
      });
    }
    async function uploadImages(filePaths = [], tempFiles = []) {
      const maxCount = 3 - refundImages.value.length;
      const validPaths = Array.isArray(filePaths) ? filePaths.slice(0, maxCount) : [];
      if (!validPaths.length)
        return;
      await new Promise((r) => setTimeout(r, 300));
      uploading.value = true;
      const contentTypeMap = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
        bmp: "image/bmp"
      };
      try {
        for (let i = 0; i < validPaths.length; i++) {
          const filePath = validPaths[i];
          const fileObj = tempFiles[i] || null;
          const realName = (fileObj == null ? void 0 : fileObj.name) || "";
          const fileName = realName || filePath.split("/").pop() || `refund_${Date.now()}.jpg`;
          const ext = (fileName.split(".").pop() || "").toLowerCase();
          const contentType = (fileObj == null ? void 0 : fileObj.type) || contentTypeMap[ext] || "image/jpeg";
          const uploadId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          const tempItem = {
            id: uploadId,
            url: filePath,
            rawUrl: "",
            uploading: true
          };
          refundImages.value = [...refundImages.value, tempItem];
          try {
            const uploaded = await api_refund.uploadRefundImage({
              orderId: orderId.value,
              filePath,
              fileName,
              contentType: contentTypeMap[ext] || "image/jpeg"
            });
            refundImages.value = refundImages.value.map(
              (item) => (item == null ? void 0 : item.id) === uploadId ? {
                ...item,
                url: uploaded.url,
                rawUrl: uploaded.rawUrl,
                uploading: false
              } : item
            );
          } catch (error) {
            refundImages.value = refundImages.value.filter(
              (item) => (item == null ? void 0 : item.id) !== uploadId
            );
            common_vendor.index.showToast({
              title: (error == null ? void 0 : error.message) || "图片上传失败",
              icon: "none"
            });
          }
        }
      } finally {
        refundImages.value = refundImages.value.map(
          (item) => (item == null ? void 0 : item.uploading) && (item == null ? void 0 : item.rawUrl) ? { ...item, uploading: false } : item
        );
        uploading.value = false;
      }
    }
    function removeImage(index) {
      refundImages.value = refundImages.value.filter((_, i) => i !== index);
    }
    function previewImages(index) {
      var _a;
      const urls = refundImages.value.filter((item) => !item.uploading && item.url).map((item) => item.url);
      if (!urls.length)
        return;
      common_vendor.index.previewImage({
        urls,
        current: ((_a = refundImages.value[index]) == null ? void 0 : _a.url) || urls[0]
      });
    }
    async function onSubmit() {
      if (submitting.value)
        return;
      if (!selectedReason.value) {
        common_vendor.index.showToast({ title: "请选择退款原因", icon: "none" });
        return;
      }
      if (!orderId.value) {
        common_vendor.index.showToast({ title: "订单信息异常", icon: "none" });
        return;
      }
      if (uploading.value || refundImages.value.some((item) => item.uploading)) {
        common_vendor.index.showToast({ title: "图片上传中，请稍后提交", icon: "none" });
        return;
      }
      submitting.value = true;
      try {
        await api_refund.applyRefund({
          orderId: orderId.value,
          orderItemId: orderItemId.value,
          refundType: refundType.value,
          refundAmount: refundAmount.value,
          refundReason: selectedReason.value,
          refundDesc: description.value,
          refundImages: refundImages.value.map((item) => item.rawUrl || item.url).filter(Boolean)
        });
        common_vendor.index.showToast({ title: "提交成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.redirectTo({ url: "/pages/order/list?status=refund" });
        }, 1200);
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "提交失败", icon: "none" });
      } finally {
        submitting.value = false;
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: refundItem.value.image,
        b: common_vendor.t(refundItem.value.title),
        c: common_vendor.t(refundItem.value.spec),
        d: common_vendor.t(refundItem.value.quantity),
        e: common_vendor.t(refundItem.value.price),
        f: orderStatus.value >= 3
      }, orderStatus.value >= 3 ? {
        g: common_vendor.n(refundType.value === 1 ? "type-option-active" : ""),
        h: common_vendor.o(($event) => refundType.value = 1, "8c"),
        i: common_vendor.n(refundType.value === 2 ? "type-option-active" : ""),
        j: common_vendor.o(($event) => refundType.value = 2, "3c")
      } : {}, {
        k: common_vendor.t(selectedReason.value || "请选择"),
        l: common_vendor.n(selectedReason.value ? "row-value-selected" : ""),
        m: common_vendor.o(($event) => showReasonPopup.value = true, "ff"),
        n: common_vendor.t(formatAmount(refundAmount.value)),
        o: description.value,
        p: common_vendor.o(($event) => description.value = $event.detail.value, "c9"),
        q: common_vendor.f(refundImages.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.url,
            b: common_vendor.o(($event) => previewImages(index), item.url),
            c: common_vendor.o(($event) => removeImage(index), item.url),
            d: item.uploading
          }, item.uploading ? {} : {}, {
            e: item.url
          });
        }),
        r: refundImages.value.length < 3
      }, refundImages.value.length < 3 ? {
        s: common_vendor.o(onUpload, "75")
      } : {}, {
        t: !showReasonPopup.value
      }, !showReasonPopup.value ? {
        v: common_vendor.o(onSubmit, "d1")
      } : {}, {
        w: common_vendor.f(reasons, (reason, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(reason),
            b: tempReason.value === reason
          }, tempReason.value === reason ? {} : {}, {
            c: common_vendor.n(tempReason.value === reason ? "reason-radio-active" : ""),
            d: reason,
            e: common_vendor.o(($event) => tempReason.value = reason, reason)
          });
        }),
        x: common_vendor.o(confirmReason, "bc"),
        y: common_vendor.o(($event) => showReasonPopup.value = false, "a4"),
        z: common_vendor.p({
          visible: showReasonPopup.value,
          height: "780rpx",
          radius: "28rpx 28rpx 0 0",
          duration: 500,
          ["with-mask"]: true,
          ["mask-color"]: "rgba(0, 0, 0, 0.45)"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-44eb3592"]]);
wx.createPage(MiniProgramPage);
