"use strict";
const common_vendor = require("../../common/vendor.js");
const api_complaint = require("../../api/complaint.js");
const _sfc_main = {
  data() {
    return {
      list: [],
      page: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      finished: false
    };
  },
  onLoad(query = {}) {
    this.loadList(true);
  },
  methods: {
    async loadList(reset = false) {
      if (this.loading || !reset && this.finished)
        return;
      if (reset) {
        this.page = 1;
        this.list = [];
        this.finished = false;
      }
      this.loading = true;
      try {
        const data = await api_complaint.getComplaintList({ page: this.page, pageSize: this.pageSize });
        const rows = Array.isArray(data) ? data : (data == null ? void 0 : data.list) || (data == null ? void 0 : data.data) || [];
        this.total = Number((data == null ? void 0 : data.total) || rows.length || 0);
        this.list = reset ? rows : this.list.concat(rows);
        this.finished = rows.length < this.pageSize || this.total > 0 && this.list.length >= this.total;
        if (!this.finished)
          this.page += 1;
      } catch (error) {
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.msg) || (error == null ? void 0 : error.message) || "加载失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    loadMore() {
      this.loadList(false);
    },
    openDetail(item = {}) {
      const id = item.complaintId || item.id;
      if (id)
        common_vendor.index.navigateTo({ url: `/pages/report/report-detail?id=${id}` });
    },
    createReport() {
      common_vendor.index.navigateTo({ url: "/pages/report/report-type" });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.createReport && $options.createReport(...args), "5a"),
    b: common_vendor.f($data.list, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.complaintTypeText || item.typeText || "直播投诉"),
        b: common_vendor.t(item.statusText || item.complaintStatusText || "已提交"),
        c: common_vendor.t(item.content || item.description || "-"),
        d: common_vendor.t(item.createdAt || item.create_time || "-"),
        e: item.complaintId || item.id,
        f: common_vendor.o(($event) => $options.openDetail(item), item.complaintId || item.id)
      };
    }),
    c: $data.loading
  }, $data.loading ? {} : !$data.list.length ? {} : $data.finished ? {} : {}, {
    d: !$data.list.length,
    e: $data.finished,
    f: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args), "76")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-20ee2924"]]);
wx.createPage(MiniProgramPage);
