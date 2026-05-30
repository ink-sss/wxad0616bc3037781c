"use strict";
const common_vendor = require("../../../common/vendor.js");
const UniLoadMore = () => "../../../components/uni-load-more.js";
const _sfc_main = {
  components: { UniLoadMore },
  data() {
    return {
      loading: true,
      no_more: false,
      scrollviewHigh: 0,
      product_list: [],
      page: 1,
      last_page: 0,
      isfollow: ""
    };
  },
  computed: {
    loadingType() {
      return this.loading ? 1 : this.product_list.length !== 0 && this.no_more ? 2 : 0;
    },
    loadMoreStatus() {
      if (this.loading)
        return "loading";
      return this.no_more ? "noMore" : "more";
    },
    themeName() {
      return typeof this.theme === "function" ? this.theme() : "";
    },
    themeClass() {
      return this.themeName || "";
    }
  },
  onShow() {
    this.init();
    this.getData();
  },
  methods: {
    init() {
      this.page = 1;
      this.product_list = [];
      this.no_more = false;
      common_vendor.index.getSystemInfo({
        success: (res) => {
          this.scrollviewHigh = res.windowHeight;
        }
      });
    },
    getData() {
      this.loading = true;
      this._post(
        "user.Favorite/list",
        {
          page: this.page,
          type: 20,
          list_rows: 15
        },
        (res) => {
          const list = res.data && res.data.list || {};
          this.loading = false;
          this.last_page = list.last_page || 0;
          this.product_list = this.product_list.concat(list.data || []);
          this.no_more = (list.last_page || 0) <= this.page;
        }
      );
    },
    scrolltolowerFunc() {
      if (this.no_more)
        return;
      this.page += 1;
      if (this.page <= this.last_page)
        this.getData();
      else
        this.no_more = true;
    },
    goto_product(productId) {
      this.gotoPage("/pages/product/detail/detail?product_id=" + productId);
    },
    guanzhu(productId) {
      this.page = 1;
      this.loading = true;
      this._post(
        "user.Favorite/add",
        {
          pid: productId,
          type: 20
        },
        () => {
          this._post(
            "user.Favorite/list",
            {
              page: this.page,
              type: 20,
              list_rows: 15
            },
            (res) => {
              const list = res.data && res.data.list || {};
              this.loading = false;
              this.product_list = list.data || [];
              this.last_page = list.last_page || 0;
              this.no_more = (list.last_page || 0) <= this.page;
            }
          );
        }
      );
    }
  }
};
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  _easycom_uni_load_more2();
}
const _easycom_uni_load_more = () => "../../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  _easycom_uni_load_more();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.product_list, (item, index, i0) => {
      return common_vendor.e({
        a: item.product_image,
        b: common_vendor.o(($event) => $options.goto_product(item.product_id), index),
        c: common_vendor.t(item.product_name),
        d: common_vendor.t(item.product_price),
        e: item.line_price
      }, item.line_price ? {
        f: common_vendor.t(item.line_price)
      } : {}, {
        g: common_vendor.o(($event) => $options.guanzhu(item.product_id), index),
        h: common_vendor.o(($event) => $options.goto_product(item.product_id), index),
        i: index
      });
    }),
    b: $data.product_list.length === 0 && !$data.loading
  }, $data.product_list.length === 0 && !$data.loading ? {} : {
    c: common_vendor.p({
      status: $options.loadMoreStatus
    })
  }, {
    d: $data.scrollviewHigh + "px",
    e: common_vendor.o((...args) => $options.scrolltolowerFunc && $options.scrolltolowerFunc(...args), "01"),
    f: common_vendor.n($options.themeClass),
    g: $options.themeName
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-acb40a20"]]);
wx.createPage(MiniProgramPage);
