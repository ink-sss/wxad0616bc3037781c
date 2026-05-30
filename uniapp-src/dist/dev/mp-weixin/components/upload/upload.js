"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "Upload",
  props: {
    num: { type: [Number, String], default: 9 },
    isVideo: { type: [Boolean, String], default: false }
  },
  emits: ["getImgs"],
  data() {
    return {
      imageList: []
    };
  },
  mounted() {
    this.chooseImageFunc();
  },
  methods: {
    chooseImageFunc() {
      if (this.isVideoMode) {
        common_vendor.index.chooseVideo({
          maxDuration: 60,
          camera: "back",
          success: (res) => {
            if (!res)
              return;
            this.uploadFile([res.tempFilePath]);
          },
          fail: () => {
            this.$emit("getImgs", null);
          }
        });
        return;
      }
      common_vendor.index.chooseImage({
        count: Number(this.num) || 9,
        mediaType: ["image"],
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.uploadFile(res.tempFilePaths || []);
        },
        fail: () => {
          this.$emit("getImgs", null);
        }
      });
    },
    uploadFile(paths) {
      let completed = 0;
      const total = paths.length;
      const formData = {
        token: this.config.token,
        app_id: this.getAppId(),
        appid: this.config.appid,
        file_type: this.isVideoMode ? "video" : "image"
      };
      if (!total) {
        this.$emit("getImgs", this.imageList);
        return;
      }
      common_vendor.index.showLoading({ title: "上传中" });
      const baseUrl = this.websiteUrl;
      paths.forEach((filePath) => {
        common_vendor.index.uploadFile({
          url: baseUrl + "/index.php?s=/api/file.upload/image",
          filePath,
          name: "iFile",
          formData,
          success: (res) => {
            const payload = typeof res.data === "object" ? res.data : JSON.parse(res.data);
            if (payload.code === -1) {
              console.log("登录态失效, 重新登录");
              this.doLogin();
              return;
            }
            if (payload.code === 1) {
              this.imageList.push(payload.data);
            } else {
              common_vendor.index.showModal({
                title: "提示",
                content: payload.msg
              });
            }
          },
          complete: () => {
            completed += 1;
            if (completed === total) {
              common_vendor.index.hideLoading();
              this.$emit("getImgs", this.imageList);
            }
          }
        });
      });
    }
  },
  computed: {
    isVideoMode() {
      return this.isVideo === true || this.isVideo === "true" || this.isVideo === 1 || this.isVideo === "1";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {};
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
