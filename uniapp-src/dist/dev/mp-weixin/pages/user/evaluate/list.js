"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      loading: false,
      state_active: 0,
      list: [],
      last_page: 0,
      no_more: false,
      page: 1
    };
  },
  computed: {
    themeName() {
      return typeof this.theme === "function" ? this.theme() : "";
    },
    themeClass() {
      return this.themeName || "";
    }
  },
  onShow() {
    this.page = 1;
    this.list = [];
    this.no_more = false;
    common_vendor.index.showLoading({ title: "加载中" });
    this.getData();
  },
  onReachBottom() {
    if (this.no_more)
      return;
    this.page += 1;
    if (this.page <= this.last_page)
      this.getData();
    else
      this.no_more = true;
  },
  methods: {
    getData() {
      this.loading = true;
      this._post(
        "product.comment/userLists",
        {
          page: this.page,
          list_rows: 10
        },
        (res) => {
          common_vendor.index.hideLoading();
          const pageData = res.data && res.data.list || {};
          const rows = pageData.data || [];
          rows.forEach((item) => {
            const createTime = item.create_time || "";
            item.year = createTime.substr(0, 4);
            item.mouth = createTime.substr(5, 2);
            item.data = createTime.substr(8, 2);
          });
          this.list = this.list.concat(rows);
          this.last_page = res.data && res.data.lastPage ? res.data.lastPage : pageData.last_page || 0;
          this.loading = false;
          if (this.last_page <= this.page)
            this.no_more = true;
        }
      );
    },
    del(item, index) {
      common_vendor.index.showModal({
        title: "提示",
        content: "您确定删除该评论吗?",
        success: (res) => {
          if (!res.confirm)
            return;
          this._post("product.comment/delete", { comment_id: item.comment_id }, () => {
            common_vendor.index.showToast({
              title: "删除成功",
              duration: 1e3,
              icon: "none"
            });
            this.list.splice(index, 1);
          });
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.list, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.data),
        b: common_vendor.t(item.mouth),
        c: common_vendor.t(item.year),
        d: common_vendor.o(($event) => $options.del(item, index), index),
        e: common_vendor.t(item.content),
        f: common_vendor.f(item.image, (image, imageIndex, i1) => {
          return {
            a: imageIndex,
            b: image.file_path
          };
        }),
        g: item.OrderProduct
      }, item.OrderProduct ? common_vendor.e({
        h: item.OrderProduct.image
      }, item.OrderProduct.image ? {
        i: item.OrderProduct.image.file_path
      } : {}, {
        j: common_vendor.t(item.OrderProduct.product_name),
        k: common_vendor.t(item.OrderProduct.product_attr)
      }) : {}, {
        l: index
      });
    }),
    b: $data.list.length === 0 && !$data.loading
  }, $data.list.length === 0 && !$data.loading ? {} : {}, {
    c: common_vendor.n($options.themeClass),
    d: $options.themeName
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2b0ace16"]]);
wx.createPage(MiniProgramPage);
