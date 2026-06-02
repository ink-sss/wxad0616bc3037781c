"use strict";
const common_vendor = require("../../common/vendor.js");
const api_complaint = require("../../api/complaint.js");
const services_h5AuthContext = require("../../services/h5-auth-context.js");
const _sfc_main = {
  data() {
    return {
      complaintId: "",
      detail: {},
      loading: false
    };
  },
  computed: {
    images() {
      const list = this.detail.images || this.detail.imageList || [];
      return Array.isArray(list) ? list : String(list || "").split(",").filter(Boolean);
    }
  },
  onLoad(query = {}) {
    if (!services_h5AuthContext.ensureH5PageAuth(query))
      return;
    this.complaintId = query.id || query.complaintId || query.complaint_id || "";
    this.loadDetail();
  },
  methods: {
    async loadDetail() {
      if (!this.complaintId)
        return;
      this.loading = true;
      try {
        this.detail = await api_complaint.getComplaintDetail(this.complaintId);
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.msg) || (error == null ? void 0 : error.message) || "详情加载失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.loading
  }, $data.loading ? {} : common_vendor.e({
    b: common_vendor.t($data.detail.statusText || $data.detail.complaintStatusText || "投诉详情"),
    c: common_vendor.t($data.detail.complaintNo || $data.detail.id || $data.complaintId),
    d: common_vendor.t($data.detail.complaintTypeText || $data.detail.typeText || "-"),
    e: common_vendor.t($data.detail.createdAt || $data.detail.create_time || "-"),
    f: common_vendor.t($data.detail.content || $data.detail.description || "-"),
    g: $options.images.length
  }, $options.images.length ? {
    h: common_vendor.f($options.images, (item, index, i0) => {
      return {
        a: item || index,
        b: item
      };
    })
  } : {}));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8643dc0a"]]);
wx.createPage(MiniProgramPage);
