"use strict";
const common_vendor = require("../common/vendor.js");
const api_complaint = require("../api/complaint.js");
if (!Array) {
  const _easycom_wd_popup2 = common_vendor.resolveComponent("wd-popup");
  const _easycom_wd_cell2 = common_vendor.resolveComponent("wd-cell");
  const _easycom_wd_textarea2 = common_vendor.resolveComponent("wd-textarea");
  const _easycom_wd_input2 = common_vendor.resolveComponent("wd-input");
  const _easycom_wd_icon2 = common_vendor.resolveComponent("wd-icon");
  const _easycom_wd_button2 = common_vendor.resolveComponent("wd-button");
  (_easycom_wd_popup2 + _easycom_wd_cell2 + _easycom_wd_textarea2 + _easycom_wd_input2 + _easycom_wd_icon2 + _easycom_wd_button2)();
}
const _easycom_wd_popup = () => "../node-modules/wot-design-uni/components/wd-popup/wd-popup.js";
const _easycom_wd_cell = () => "../node-modules/wot-design-uni/components/wd-cell/wd-cell.js";
const _easycom_wd_textarea = () => "../node-modules/wot-design-uni/components/wd-textarea/wd-textarea.js";
const _easycom_wd_input = () => "../node-modules/wot-design-uni/components/wd-input/wd-input.js";
const _easycom_wd_icon = () => "../node-modules/wot-design-uni/components/wd-icon/wd-icon.js";
const _easycom_wd_button = () => "../node-modules/wot-design-uni/components/wd-button/wd-button.js";
if (!Math) {
  (_easycom_wd_popup + _easycom_wd_cell + _easycom_wd_textarea + _easycom_wd_input + _easycom_wd_icon + _easycom_wd_button)();
}
const _sfc_main = {
  __name: "live-report-popup",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    liveId: {
      type: [String, Number],
      default: ""
    },
    roomCode: {
      type: String,
      default: ""
    },
    tenantId: {
      type: [String, Number],
      default: ""
    },
    termId: {
      type: [String, Number],
      default: ""
    },
    customerId: {
      type: [String, Number],
      default: ""
    },
    userId: {
      type: [String, Number],
      default: ""
    },
    isReplay: {
      type: Boolean,
      default: false
    },
    replayVideoId: {
      type: [String, Number],
      default: ""
    },
    liveName: {
      type: String,
      default: ""
    },
    cover: {
      type: String,
      default: ""
    },
    fromPath: {
      type: String,
      default: "/pages/broadcast/entry"
    }
  },
  emits: ["update:visible"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    common_vendor.useToast();
    const complaintTypeMap = {
      ad_fraud: 1,
      politics: 2,
      abuse: 3,
      infringement: 4,
      illegal: 5,
      porn: 6,
      violence: 7,
      other: 8
    };
    const complaintTypes = [
      { label: "广告欺诈", value: "ad_fraud" },
      { label: "政治敏感", value: "politics" },
      { label: "侮辱谩骂", value: "abuse" },
      { label: "直播侵权", value: "infringement" },
      { label: "违法违规", value: "illegal" },
      { label: "色情低俗", value: "porn" },
      { label: "血腥暴力", value: "violence" },
      { label: "其他问题", value: "other" }
    ];
    const showTypePopup = common_vendor.computed({
      get: () => props.visible,
      set: (value) => emit("update:visible", value)
    });
    const showFormPopup = common_vendor.ref(false);
    const showSuccessPopup = common_vendor.ref(false);
    const complaintType = common_vendor.ref("");
    const complaintTypeLabel = common_vendor.ref("");
    const complaintDesc = common_vendor.ref("");
    const complaintPhone = common_vendor.ref("");
    const complaintImages = common_vendor.ref([]);
    const complaintSubmitting = common_vendor.ref(false);
    const complaintUploading = common_vendor.ref(false);
    const descError = common_vendor.ref("");
    const phoneError = common_vendor.ref("");
    let complaintUploadIdCounter = 0;
    function resetComplaintForm() {
      showFormPopup.value = false;
      showSuccessPopup.value = false;
      complaintType.value = "";
      complaintTypeLabel.value = "";
      complaintDesc.value = "";
      complaintPhone.value = "";
      complaintImages.value = [];
      complaintSubmitting.value = false;
      complaintUploading.value = false;
      descError.value = "";
      phoneError.value = "";
    }
    function handleTypePopupClose() {
      showTypePopup.value = false;
    }
    function handleFormPopupClose() {
      showFormPopup.value = false;
      emit("update:visible", false);
      resetComplaintForm();
    }
    function handleSuccessPopupClose() {
      showSuccessPopup.value = false;
      emit("update:visible", false);
      resetComplaintForm();
    }
    function onSelectComplaintType(item) {
      complaintType.value = item.value;
      complaintTypeLabel.value = item.label;
      showTypePopup.value = false;
      showFormPopup.value = true;
    }
    function openComplaintTypeFromForm() {
      showFormPopup.value = false;
      showTypePopup.value = true;
    }
    function numberOrZero(value) {
      const numberValue = Number(value);
      return Number.isFinite(numberValue) ? numberValue : 0;
    }
    function getComplaintRoomPayload() {
      const roomId = numberOrZero(props.liveId);
      const tenantId = numberOrZero(props.tenantId);
      const termId = numberOrZero(props.termId);
      const customerId = numberOrZero(props.customerId || props.userId);
      const replayVideoId = numberOrZero(props.replayVideoId);
      const liveType = props.isReplay ? "replay" : "live";
      return {
        roomId,
        room_id: roomId,
        liveId: roomId,
        live_id: roomId,
        roomCode: props.roomCode || "",
        room_code: props.roomCode || "",
        tenantId,
        tenant_id: tenantId,
        termId,
        term_id: termId,
        liveTermId: termId,
        live_term_id: termId,
        customerId,
        customer_id: customerId,
        userId: customerId,
        user_id: customerId,
        isReplay: props.isReplay,
        is_replay: props.isReplay,
        replay: props.isReplay,
        liveType,
        live_type: liveType,
        replayVideoId,
        replay_video_id: replayVideoId,
        videoId: replayVideoId,
        video_id: replayVideoId,
        liveName: props.liveName || "",
        live_name: props.liveName || "",
        roomName: props.liveName || "",
        room_name: props.liveName || "",
        cover: props.cover || "",
        coverImage: props.cover || "",
        cover_image: props.cover || "",
        liveCover: props.cover || "",
        live_cover: props.cover || "",
        fromPath: props.fromPath || "",
        from_path: props.fromPath || "",
        sourcePath: props.fromPath || "",
        source_path: props.fromPath || "",
        returnPath: props.fromPath || "",
        return_path: props.fromPath || ""
      };
    }
    function chooseComplaintImage() {
      if (complaintUploading.value)
        return;
      common_vendor.index.chooseImage({
        count: 9 - complaintImages.value.length,
        sizeType: ["compressed"],
        success: (res) => {
          uploadComplaintImages(res.tempFilePaths || []);
        }
      });
    }
    async function uploadComplaintImages(filePaths = []) {
      const validPaths = Array.isArray(filePaths) ? filePaths.slice(0, 9 - complaintImages.value.length) : [];
      if (!validPaths.length)
        return;
      complaintUploading.value = true;
      const contentTypeMap = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp"
      };
      try {
        for (const filePath of validPaths) {
          const uploadId = `complaint_upload_${++complaintUploadIdCounter}`;
          const fileName = filePath.split("/").pop() || `complaint_${Date.now()}.jpg`;
          const ext = (fileName.split(".").pop() || "jpg").toLowerCase();
          const tempItem = {
            id: uploadId,
            url: filePath,
            rawUrl: "",
            uploading: true
          };
          complaintImages.value = [...complaintImages.value, tempItem];
          try {
            const uploaded = await api_complaint.uploadComplaintImage({
              ...getComplaintRoomPayload(),
              filePath,
              fileName,
              contentType: contentTypeMap[ext] || "image/jpeg"
            });
            complaintImages.value = complaintImages.value.map(
              (item) => (item == null ? void 0 : item.id) === uploadId ? {
                ...item,
                url: uploaded.url,
                rawUrl: uploaded.rawUrl || uploaded.url,
                uploading: false
              } : item
            );
          } catch (error) {
            complaintImages.value = complaintImages.value.filter((item) => (item == null ? void 0 : item.id) !== uploadId);
            common_vendor.index.showToast({ title: "图片上传失败", icon: "none" });
          }
        }
      } finally {
        complaintImages.value = complaintImages.value.map(
          (item) => (item == null ? void 0 : item.uploading) && (item == null ? void 0 : item.rawUrl) ? { ...item, uploading: false } : item
        );
        complaintUploading.value = false;
      }
    }
    function removeComplaintImage(idx) {
      complaintImages.value = complaintImages.value.filter((_, i) => i !== idx);
    }
    function previewComplaintImage(idx) {
      var _a;
      const urls = complaintImages.value.filter((item) => !item.uploading && item.url).map((item) => item.url);
      if (!urls.length)
        return;
      common_vendor.index.previewImage({
        current: ((_a = complaintImages.value[idx]) == null ? void 0 : _a.url) || urls[0],
        urls
      });
    }
    async function submitComplaint() {
      let hasError = false;
      if (!complaintTypeLabel.value) {
        common_vendor.index.showToast({ title: "请选择举报类型", icon: "none" });
        return;
      }
      descError.value = "";
      phoneError.value = "";
      if (!String(complaintDesc.value || "").trim()) {
        descError.value = "请填写举报说明";
        hasError = true;
      }
      if (!String(complaintPhone.value || "").trim()) {
        phoneError.value = "请填写联系电话";
        hasError = true;
      }
      if (hasError)
        return;
      if (complaintSubmitting.value)
        return;
      if (complaintUploading.value || complaintImages.value.some((item) => item.uploading)) {
        common_vendor.index.showToast({ title: "图片上传中，请稍后提交", icon: "none" });
        return;
      }
      complaintSubmitting.value = true;
      try {
        const uploadedUrls = complaintImages.value.map((item) => item.rawUrl || item.url).filter((url) => url && /^https?:\/\//i.test(url));
        await api_complaint.createComplaint({
          ...getComplaintRoomPayload(),
          complaintType: complaintTypeMap[complaintType.value] || 5,
          complaint_type: complaintTypeMap[complaintType.value] || 5,
          content: complaintDesc.value.trim(),
          description: complaintDesc.value.trim(),
          reporterPhone: complaintPhone.value.trim(),
          reporter_phone: complaintPhone.value.trim(),
          phone: complaintPhone.value.trim(),
          images: uploadedUrls,
          imageUrls: uploadedUrls,
          image_urls: uploadedUrls
        });
        showFormPopup.value = false;
        showSuccessPopup.value = true;
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "提交失败", icon: "none" });
      } finally {
        complaintSubmitting.value = false;
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleTypePopupClose, "cd"),
        b: common_vendor.f(complaintTypes, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: item.value,
            c: common_vendor.n(complaintType.value === item.value ? "complaint-type-chip--active" : ""),
            d: common_vendor.o(($event) => onSelectComplaintType(item), item.value)
          };
        }),
        c: common_vendor.o(handleTypePopupClose, "03"),
        d: common_vendor.o(($event) => showTypePopup.value = $event, "15"),
        e: common_vendor.p({
          position: "bottom",
          ["z-index"]: 220,
          ["custom-style"]: "height: auto; border-radius: 24rpx 24rpx 0 0; overflow: hidden;",
          modelValue: showTypePopup.value
        }),
        f: common_vendor.o(handleFormPopupClose, "29"),
        g: common_vendor.o(openComplaintTypeFromForm, "80"),
        h: common_vendor.p({
          title: "举报类型",
          value: complaintTypeLabel.value || "请选择",
          ["is-link"]: true,
          required: true
        }),
        i: __props.cover,
        j: common_vendor.t(__props.liveName || "直播间名称"),
        k: common_vendor.t(__props.liveId || "-"),
        l: common_vendor.o(($event) => descError.value = "", "0d"),
        m: common_vendor.o(($event) => complaintDesc.value = $event, "cb"),
        n: common_vendor.p({
          placeholder: "描述您要举报的具体情况，有助于客服更快的处理投诉（必填）",
          clearable: true,
          ["adjust-position"]: false,
          size: "small",
          ["custom-class"]: "report-desc-textarea",
          ["custom-style"]: "margin: 0; height:200rpx;background:transparent;border-radius:16rpx",
          modelValue: complaintDesc.value
        }),
        o: descError.value
      }, descError.value ? {
        p: common_vendor.t(descError.value)
      } : {}, {
        q: common_vendor.o(($event) => phoneError.value = "", "d4"),
        r: common_vendor.o(($event) => complaintPhone.value = $event, "24"),
        s: common_vendor.p({
          label: "联系电话",
          type: "number",
          maxlength: 20,
          placeholder: "请输入",
          required: true,
          modelValue: complaintPhone.value
        }),
        t: phoneError.value
      }, phoneError.value ? {
        v: common_vendor.t(phoneError.value)
      } : {}, {
        w: common_vendor.f(complaintImages.value, (item, idx, i0) => {
          return common_vendor.e({
            a: item.url,
            b: item.uploading
          }, item.uploading ? {} : {}, {
            c: "1070d14d-5-" + i0 + ",1070d14d-1",
            d: common_vendor.o(($event) => removeComplaintImage(idx), item.id),
            e: item.id,
            f: common_vendor.o(($event) => previewComplaintImage(idx), item.id)
          });
        }),
        x: common_vendor.p({
          name: "close",
          size: "24rpx",
          color: "#fff"
        }),
        y: complaintImages.value.length < 9
      }, complaintImages.value.length < 9 ? {
        z: common_vendor.p({
          name: "add",
          size: "48rpx",
          color: "rgba(0,0,0,0.2)"
        }),
        A: common_vendor.o(chooseComplaintImage, "a4")
      } : {}, {
        B: common_vendor.o(submitComplaint, "9d"),
        C: common_vendor.p({
          type: "primary",
          block: true,
          round: true,
          size: "large",
          ["custom-class"]: "theme-primary-btn",
          loading: complaintSubmitting.value
        }),
        D: common_vendor.o(handleFormPopupClose, "e7"),
        E: common_vendor.o(($event) => showFormPopup.value = $event, "ef"),
        F: common_vendor.p({
          position: "bottom",
          ["z-index"]: 221,
          ["custom-style"]: "height: 84vh; border-radius: 24rpx 24rpx 0 0; overflow: hidden;",
          modelValue: showFormPopup.value
        }),
        G: common_vendor.o(handleSuccessPopupClose, "f8"),
        H: common_vendor.p({
          name: "check-bold",
          size: "72rpx",
          color: "#fff"
        }),
        I: common_vendor.o(handleSuccessPopupClose, "b5"),
        J: common_vendor.o(($event) => showSuccessPopup.value = $event, "f9"),
        K: common_vendor.p({
          position: "bottom",
          ["z-index"]: 222,
          ["custom-style"]: "height: 56vh; border-radius: 24rpx 24rpx 0 0; overflow: hidden;",
          modelValue: showSuccessPopup.value
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1070d14d"]]);
wx.createComponent(Component);
