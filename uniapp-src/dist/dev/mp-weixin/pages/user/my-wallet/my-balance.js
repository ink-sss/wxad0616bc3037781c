"use strict";
const pages_user_pageTools = require("../page-tools.js");
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      loading: true,
      tableData: [],
      last_page: 0,
      page: 1,
      list_rows: 20,
      no_more: false,
      type: "all"
    };
  },
  onLoad(query = {}) {
    this.type = query.type || "all";
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
    getData() {
      this.loading = true;
      this._get("balance.log/lists", { page: this.page || 1, list_rows: this.list_rows, type: this.type }, (res) => {
        const page = pages_user_pageTools.normalizeListPage(res.data);
        this.loading = false;
        this.tableData = this.tableData.concat(page.rows);
        this.last_page = page.lastPage;
        if (page.lastPage <= this.page)
          this.no_more = true;
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.tableData, (item, index, i0) => {
      return {
        a: common_vendor.t(item.scene && item.scene.text),
        b: common_vendor.t(item.create_time),
        c: common_vendor.t(item.money),
        d: common_vendor.n(Number(item.money) > 0 ? "money plus" : "money"),
        e: index
      };
    }),
    b: $data.tableData.length === 0 && !$data.loading
  }, $data.tableData.length === 0 && !$data.loading ? {} : {
    c: common_vendor.t($data.loading ? "加载中..." : $data.no_more ? "没有更多了" : "上拉加载更多")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-3da4d2ab"]]);
wx.createPage(MiniProgramPage);
