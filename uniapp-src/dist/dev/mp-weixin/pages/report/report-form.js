"use strict";
const common_vendor = require("../../common/vendor.js");
const api_complaint = require("../../api/complaint.js");
const platform_weixin_file = require("../../platform/weixin/file.js");
const utils_liveRoomContext = require("../../utils/live-room-context.js");
const pages_broadcast_utils_liveRouteContext = require("../broadcast/utils/live-route-context.js");
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
    const roomCode = common_vendor.ref("");
    const tenantId = common_vendor.ref("");
    const termId = common_vendor.ref("");
    const customerId = common_vendor.ref("");
    const replayVideoId = common_vendor.ref("");
    const liveType = common_vendor.ref("");
    const liveName = common_vendor.ref("");
    const cover = common_vendor.ref("");
    const fromPath = common_vendor.ref("");
    const desc = common_vendor.ref("");
    const phone = common_vendor.ref("");
    const images = common_vendor.ref([]);
    const submitting = common_vendor.ref(false);
    const uploading = common_vendor.ref(false);
    let uploadIdCounter = 0;
    function appendQuery(params, key, value) {
      const text = value === void 0 || value === null ? "" : String(value);
      if (text)
        params.push(key + "=" + encodeURIComponent(text));
    }
    function numberOrZero(value) {
      const numberValue = Number(value);
      return Number.isFinite(numberValue) ? numberValue : 0;
    }
    function getComplaintRoomPayload() {
      const roomId = numberOrZero(liveId.value);
      const tenant = numberOrZero(tenantId.value);
      const term = numberOrZero(termId.value);
      const customer = numberOrZero(customerId.value);
      const video = numberOrZero(replayVideoId.value);
      const isReplay = liveType.value === "replay" || !!video;
      return {
        roomId,
        room_id: roomId,
        liveId: roomId,
        live_id: roomId,
        roomCode: roomCode.value || "",
        room_code: roomCode.value || "",
        tenantId: tenant,
        tenant_id: tenant,
        termId: term,
        term_id: term,
        liveTermId: term,
        live_term_id: term,
        customerId: customer,
        customer_id: customer,
        userId: customer,
        user_id: customer,
        isReplay,
        is_replay: isReplay,
        replay: isReplay,
        liveType: isReplay ? "replay" : liveType.value || "live",
        live_type: isReplay ? "replay" : liveType.value || "live",
        replayVideoId: video,
        replay_video_id: video,
        videoId: video,
        video_id: video,
        liveName: liveName.value || "",
        live_name: liveName.value || "",
        roomName: liveName.value || "",
        room_name: liveName.value || "",
        cover: cover.value || "",
        coverImage: cover.value || "",
        cover_image: cover.value || "",
        liveCover: cover.value || "",
        live_cover: cover.value || "",
        fromPath: fromPath.value || "",
        from_path: fromPath.value || "",
        sourcePath: fromPath.value || "",
        source_path: fromPath.value || "",
        returnPath: fromPath.value || "",
        return_path: fromPath.value || ""
      };
    }
    function goSelectType() {
      const params = [];
      appendQuery(params, "liveId", liveId.value);
      appendQuery(params, "roomCode", roomCode.value);
      appendQuery(params, "tenantId", tenantId.value);
      appendQuery(params, "termId", termId.value);
      appendQuery(params, "customerId", customerId.value);
      appendQuery(params, "replayVideoId", replayVideoId.value);
      appendQuery(params, "videoId", replayVideoId.value);
      appendQuery(params, "liveType", liveType.value);
      appendQuery(params, "liveName", liveName.value);
      appendQuery(params, "cover", cover.value);
      appendQuery(params, "from", "form");
      appendQuery(params, "fromPath", fromPath.value);
      common_vendor.index.navigateTo({
        url: "/pages/report/report-type?" + params.join("&"),
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
              ...getComplaintRoomPayload(),
              filePath,
              fileName,
              contentType: contentTypeMap[ext] || "image/jpeg"
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
          ...getComplaintRoomPayload(),
          complaintType: typeMap[type.value] || 5,
          complaint_type: typeMap[type.value] || 5,
          content: desc.value.trim(),
          description: desc.value.trim(),
          reporterPhone: phone.value.trim(),
          reporter_phone: phone.value.trim(),
          phone: phone.value.trim(),
          images: uploadedUrls,
          imageUrls: uploadedUrls,
          image_urls: uploadedUrls
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
      type.value = options.type || "";
      typeLabel.value = options.typeLabel || "";
      liveId.value = options.liveId || "";
      roomCode.value = options.roomCode || options.room_code || "";
      tenantId.value = options.tenantId || options.tenant_id || "";
      termId.value = options.termId || options.term_id || options.liveTermId || options.live_term_id || "";
      customerId.value = options.customerId || options.customer_id || options.userId || options.user_id || "";
      replayVideoId.value = options.replayVideoId || options.replay_video_id || options.videoId || options.video_id || "";
      liveType.value = options.liveType || options.live_type || (options.replay === "1" ? "replay" : "");
      liveName.value = options.liveName || "";
      cover.value = options.cover || "";
      fromPath.value = options.fromPath || "";
      if (!liveId.value || !roomCode.value || !fromPath.value) {
        try {
          const ctx = utils_liveRoomContext.loadLiveRoomContext();
          if (ctx && (ctx.liveId || ctx.roomId)) {
            liveId.value = ctx.liveId || ctx.roomId;
            roomCode.value = roomCode.value || ctx.roomCode || "";
            tenantId.value = tenantId.value || ctx.tenantId || ctx.tenant_id || "";
            termId.value = termId.value || ctx.termId || ctx.term_id || ctx.liveTermId || ctx.live_term_id || "";
            customerId.value = customerId.value || ctx.customerId || ctx.customer_id || ctx.userId || ctx.user_id || "";
            replayVideoId.value = replayVideoId.value || ctx.replayVideoId || ctx.replay_video_id || ctx.videoId || ctx.video_id || "";
            liveType.value = liveType.value || ctx.liveType || ctx.live_type || (ctx.replay === "1" ? "replay" : "");
            liveName.value = liveName.value || ctx.liveName || "";
            cover.value = cover.value || ctx.cover || "";
            fromPath.value = fromPath.value || pages_broadcast_utils_liveRouteContext.buildBroadcastReturnPath(ctx);
          }
        } catch (_) {
        }
      }
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
      if (!fromPath.value) {
        fromPath.value = pages_broadcast_utils_liveRouteContext.buildBroadcastReturnPath({
          roomCode: roomCode.value,
          liveId: liveId.value,
          tenantId: tenantId.value,
          termId: termId.value,
          customerId: customerId.value,
          videoId: replayVideoId.value,
          liveType: liveType.value,
          liveName: liveName.value,
          cover: cover.value
        });
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
        h: common_vendor.o(($event) => desc.value = $event.detail.value, "c8"),
        i: phone.value,
        j: common_vendor.o(($event) => phone.value = $event.detail.value, "33"),
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
        m: common_vendor.o(chooseImage, "3d")
      } : {}, {
        n: common_vendor.o(submit, "77")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8ec0269c"]]);
wx.createPage(MiniProgramPage);
