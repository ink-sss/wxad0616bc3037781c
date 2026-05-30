"use strict";
const common_vendor = require("../../../common/vendor.js");
const pages_user_pageTools = require("../page-tools.js");
const _sfc_main = {
  data() {
    return {
      tableData: [],
      no_more: false,
      loading: true,
      last_page: 0,
      page: 1,
      list_rows: 20,
      configData: { appid: "", mchid: "" }
    };
  },
  mounted() {
    this.getData();
  },
  onReachBottom() {
    if (this.page < this.last_page) {
      this.page += 1;
      this.getData();
    } else {
      this.no_more = true;
    }
  },
  methods: {
    receiptWx(item) {
      pages_user_pageTools.requestTransfer({
        mchId: this.configData.mchid,
        appId: this.configData.appid,
        package: item.package_info
      }).then(() => {
        this._post("user.cash/receipt", { id: item.id }, () => {
          this.tableData = [];
          this.page = 1;
          this.getData();
        });
      }).catch(() => {
        common_vendor.index.showModal({ content: "微信转账收款失败，请稍后重试。", showCancel: false });
      });
    },
    getData() {
      this.loading = true;
      this._get(
        "user.cash/lists",
        { status: -1, page: this.page || 1, list_rows: this.list_rows, source: this.getPlatform() },
        (res) => {
          this.loading = false;
          this.configData = res.data.config || {};
          const page = pages_user_pageTools.normalizeListPage(res.data);
          this.tableData = this.tableData.concat(page.rows);
          this.last_page = page.lastPage;
          if (page.lastPage <= this.page)
            this.no_more = true;
        }
      );
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.tableData, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.create_time),
        b: common_vendor.t(item.apply_status && item.apply_status.text),
        c: item.apply_status && item.apply_status.text === "审核通过" ? 1 : "",
        d: common_vendor.t(item.money),
        e: item.apply_status && item.apply_status.value === 50
      }, item.apply_status && item.apply_status.value === 50 ? {
        f: common_vendor.o(($event) => $options.receiptWx(item), item.id)
      } : {}, {
        g: item.id
      });
    }),
    b: $data.tableData.length === 0 && !$data.loading
  }, $data.tableData.length === 0 && !$data.loading ? {} : {
    c: common_vendor.t($data.loading ? "加载中..." : $data.no_more ? "没有更多了" : "上拉加载更多")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-53325514"]]);
wx.createPage(MiniProgramPage);
