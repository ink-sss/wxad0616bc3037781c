"use strict";
const common_vendor = require("../../../common/vendor.js");
const UniLoadMore = () => "../../../components/uni-load-more.js";
const _sfc_main = {
  components: { UniLoadMore },
  data() {
    return {
      shop_list: [],
      loading: true,
      no_more: false,
      scrollviewHigh: 0,
      page: 1,
      last_page: 0,
      isfollow: ""
    };
  },
  computed: {
    loadingType() {
      return this.loading ? 1 : this.shop_list.length !== 0 && this.no_more ? 2 : 0;
    },
    loadMoreStatus() {
      if (this.loading)
        return "loading";
      return this.no_more ? "noMore" : "more";
    }
  },
  onShow() {
    this.init();
    this.getData();
  },
  methods: {
    init() {
      this.shop_list = [];
      this.page = 1;
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
          type: 10,
          list_rows: 15
        },
        (res) => {
          const list = res.data && res.data.list || {};
          this.loading = false;
          this.shop_list = this.shop_list.concat(list.data || []);
          this.last_page = list.last_page || 0;
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
    goto_shop(shopSupplierId) {
      this.gotoPage("/pages/shop/shop?shop_supplier_id=" + shopSupplierId);
    },
    goto_product(productId) {
      this.gotoPage("/pages/product/detail/detail?product_id=" + productId);
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
    a: common_vendor.f($data.shop_list, (shop, index, i0) => {
      return common_vendor.e({
        a: shop.logo,
        b: common_vendor.t(shop.store_name),
        c: common_vendor.t(shop.categoryName),
        d: common_vendor.t(shop.product_sales),
        e: common_vendor.t(shop.fav_count),
        f: common_vendor.t(shop.score),
        g: common_vendor.o(($event) => $options.goto_shop(shop.shop_supplier_id), index),
        h: shop.productList && shop.productList.length > 0
      }, shop.productList && shop.productList.length > 0 ? {
        i: common_vendor.f(shop.productList, (product, productIndex, i1) => {
          return common_vendor.e({
            a: product.logo,
            b: common_vendor.t(product.product_price > 1e3 ? Number(product.product_price) : product.product_price),
            c: product.line_price
          }, product.line_price ? {
            d: common_vendor.t(product.line_price > 1e3 ? Number(product.line_price) : product.line_price)
          } : {}, {
            e: productIndex,
            f: common_vendor.o(($event) => $options.goto_product(product.product_id), productIndex)
          });
        }),
        j: common_vendor.n(shop.productList.length < 3 ? "shop_list_body_item_product2" : "shop_list_body_item_product")
      } : {}, {
        k: index
      });
    }),
    b: $data.shop_list.length === 0 && !$data.loading
  }, $data.shop_list.length === 0 && !$data.loading ? {} : {
    c: common_vendor.p({
      status: $options.loadMoreStatus
    })
  }, {
    d: $data.scrollviewHigh + "px",
    e: common_vendor.o((...args) => $options.scrolltolowerFunc && $options.scrolltolowerFunc(...args), "1e")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9f33fcbc"]]);
wx.createPage(MiniProgramPage);
