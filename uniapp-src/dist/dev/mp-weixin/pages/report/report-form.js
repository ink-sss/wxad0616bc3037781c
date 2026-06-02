"use strict";
const common_vendor = require("../../common/vendor.js");
const api_complaint = require("../../api/complaint.js");
const platform_weixin_file = require("../../platform/weixin/file.js");
const services_h5AuthContext = require("../../services/h5-auth-context.js");
const utils_liveRoomContext = require("../../utils/live-room-context.js");
const _sfc_main = {
  __name: "report-form",
  setup(__props) {
    const typeMap = {
      ad_fraud: 1,
      politics: 2,
      abuse: 3,
      infringement: 4,
      illegal: 5,
      porn: 6,
      violence: 7,
      other: 8
    };
    const type = common_vendor.ref("");
    const typeLabel = common_vendor.ref("");
    const liveId = common_vendor.ref("");
    const liveName = common_vendor.ref("");
    const cover = common_vendor.ref("");
    const fromPath = common_vendor.ref("");
    const desc = common_vendor.ref("");
    const phone = common_vendor.ref("");
    const images = common_vendor.ref([]);
    const submitting = common_vendor.ref(false);
    const uploading = common_vendor.ref(false);
    let uploadIdCounter = 0;
    function goSelectType() {
      const q = "liveId=" + encodeURIComponent(liveId.value || "") + "&liveName=" + encodeURIComponent(liveName.value || "") + "&cover=" + encodeURIComponent(cover.value || "") + "&from=form";
      common_vendor.index.navigateTo({
        url: "/pages/report/report-type?" + q,
        success: (res) => {
          if (res && res.eventChannel && res.eventChannel.on) {
            res.eventChannel.on("selectType", (data) => {
              type.value = data && data.type || "";
              typeLabel.value = data && data.typeLabel || "";
            });
          }
        }
      });
    }
    function chooseImage() {
      if (uploading.value)
        return;
      platform_weixin_file.chooseImage({ count: 9 - images.value.length }).then((res) => uploadImages(res.tempFilePaths || [])).catch((error) => {
        if (!String((error == null ? void 0 : error.errMsg) || "").includes("cancel")) {
          common_vendor.index.showToast({ title: "选择图片失败", icon: "none" });
        }
      });
    }
    async function uploadImages(filePaths = []) {
      const validPaths = Array.isArray(filePaths) ? filePaths.slice(0, 9 - images.value.length) : [];
      if (!validPaths.length)
        return;
      uploading.value = true;
      const contentTypeMap = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp"
      };
      try {
        for (const filePath of validPaths) {
          const uploadId = `upload_${++uploadIdCounter}`;
          const fileName = filePath.split("/").pop() || `complaint_${Date.now()}.jpg`;
          const ext = (fileName.split(".").pop() || "jpg").toLowerCase();
          const tempItem = {
            id: uploadId,
            url: filePath,
            rawUrl: "",
            uploading: true
          };
          images.value = [...images.value, tempItem];
          try {
            const uploaded = await api_complaint.uploadComplaintImage({
              filePath,
              fileName,
              contentType: contentTypeMap[ext] || "image/jpeg",
              roomId: Number(liveId.value) || 0
            });
            images.value = images.value.map(
              (item) => (item == null ? void 0 : item.id) === uploadId ? { ...item, url: uploaded.url, rawUrl: uploaded.rawUrl || uploaded.url, uploading: false } : item
            );
          } catch (error) {
            images.value = images.value.filter((item) => (item == null ? void 0 : item.id) !== uploadId);
            common_vendor.index.showToast({ title: "图片上传失败", icon: "none" });
          }
        }
      } finally {
        images.value = images.value.map(
          (item) => (item == null ? void 0 : item.uploading) && (item == null ? void 0 : item.rawUrl) ? { ...item, uploading: false } : item
        );
        uploading.value = false;
      }
    }
    function remove(idx) {
      images.value = images.value.filter((_, i) => i !== idx);
    }
    function preview(idx) {
      var _a;
      const urls = images.value.filter((item) => !item.uploading && item.url).map((item) => item.url);
      if (!urls.length)
        return;
      common_vendor.index.previewImage({
        current: ((_a = images.value[idx]) == null ? void 0 : _a.url) || urls[0],
        urls
      });
    }
    async function submit() {
      if (!typeLabel.value) {
        common_vendor.index.showToast({ title: "请选择举报类型", icon: "none" });
        return;
      }
      if (!String(desc.value || "").trim()) {
        common_vendor.index.showToast({ title: "请填写举报说明", icon: "none" });
        return;
      }
      if (!String(phone.value || "").trim()) {
        common_vendor.index.showToast({ title: "请填写联系电话", icon: "none" });
        return;
      }
      if (submitting.value)
        return;
      if (uploading.value || images.value.some((item) => item.uploading)) {
        common_vendor.index.showToast({ title: "图片上传中，请稍后提交", icon: "none" });
        return;
      }
      submitting.value = true;
      try {
        const uploadedUrls = images.value.map((item) => item.rawUrl || item.url).filter((url) => url && /^https?:\/\//i.test(url));
        await api_complaint.createComplaint({
          roomId: Number(liveId.value) || 0,
          complaintType: typeMap[type.value] || 5,
          content: desc.value.trim(),
          reporterPhone: phone.value.trim(),
          images: uploadedUrls
        });
        const q = fromPath.value ? "fromPath=" + encodeURIComponent(fromPath.value) : "";
        common_vendor.index.redirectTo({
          url: "/pages/report/report-success" + (q ? "?" + q : "")
        });
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "提交失败", icon: "none" });
      } finally {
        submitting.value = false;
      }
    }
    common_vendor.onLoad((options) => {
      if (!services_h5AuthContext.ensureH5PageAuth(options))
        return;
      type.value = options.type || "";
      typeLabel.value = options.typeLabel || "";
      liveId.value = options.liveId || "";
      liveName.value = options.liveName || "";
      cover.value = options.cover || "";
      if (!liveId.value) {
        try {
          const ctx = utils_liveRoomContext.loadLiveRoomContext();
          if (ctx && (ctx.liveId || ctx.roomId)) {
            liveId.value = ctx.liveId || ctx.roomId;
            liveName.value = liveName.value || ctx.liveName || "";
            cover.value = cover.value || ctx.cover || "";
          }
        } catch (_) {
        }
      }
      fromPath.value = options.fromPath || "";
      if (!fromPath.value) {
        const pages = getCurrentPages();
        const liveIdx = (() => {
          for (let i = pages.length - 1; i >= 0; i--) {
            const r = pages[i] && pages[i].route || "";
            if (r === "pages/broadcast/entry" || r === "pages/broadcast/replay")
              return i;
          }
          return -1;
        })();
        if (liveIdx >= 0) {
          fromPath.value = "/" + pages[liveIdx].route;
        }
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(typeLabel.value || "请选择"),
        b: common_vendor.n(typeLabel.value ? "form-value-active" : ""),
        c: common_vendor.o(goSelectType, "1f"),
        d: cover.value,
        e: common_vendor.t(liveName.value || "直播间名称"),
        f: common_vendor.t(liveId.value || "-"),
        g: desc.value,
        h: common_vendor.o(($event) => desc.value = $event.detail.value, "44"),
        i: phone.value,
        j: common_vendor.o(($event) => phone.value = $event.detail.value, "49"),
        k: common_vendor.f(images.value, (item, idx, i0) => {
          return common_vendor.e({
            a: item.url,
            b: item.uploading
          }, item.uploading ? {} : {}, {
            c: common_vendor.o(($event) => remove(idx), item.id),
            d: item.id,
            e: common_vendor.o(($event) => preview(idx), item.id)
          });
        }),
        l: images.value.length < 9
      }, images.value.length < 9 ? {
        m: common_vendor.o(chooseImage, "3a")
      } : {}, {
        n: common_vendor.o(submit, "e4")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8ec0269c"]]);
wx.createPage(MiniProgramPage);
