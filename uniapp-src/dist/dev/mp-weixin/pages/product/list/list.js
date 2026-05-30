"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      isLieBiao: true,
      phoneHeight: 0,
      scrollviewHigh: 0,
      topRefresh: false,
      loading: true,
      no_more: false,
      type_active: 0,
      price_top: false,
      listData: [],
      page: 1,
      category_id: 0,
      search: "",
      sortType: "",
      sortPrice: 0,
      list_rows: 10,
      last_page: 0
    };
  },
  computed: {
    loadingType() {
      return this.loading ? 1 : this.listData.length !== 0 && this.no_more ? 2 : 0;
    }
  },
  onLoad(query) {
    this.category_id = query.category_id || 0;
    if (query.search)
      this.search = query.search;
    if (query.sortType)
      this.sortType = query.sortType;
    if (query.sortPrice)
      this.sortPrice = query.sortPrice;
  },
  mounted() {
    this.init();
    this.getData();
  },
  onPullDownRefresh() {
    this.restoreData();
    this.getData();
  },
  onShareAppMessage() {
    return {
      title: "全部分类",
      path: "/pages/product/category?" + this.getShareUrlParams()
    };
  },
  methods: {
    searchFunc() {
      this.listData = [];
      this.page = 1;
      this.getData();
    },
    init() {
      common_vendor.index.getSystemInfo({
        success: (res) => {
          this.phoneHeight = res.windowHeight;
          common_vendor.index.createSelectorQuery().select(".top-box").boundingClientRect((rect) => {
            this.scrollviewHigh = this.phoneHeight - (rect && rect.height || 0);
          }).exec();
        }
      });
    },
    restoreData() {
      this.listData = [];
      this.category_id = 0;
      this.search = "";
      this.sortType = "";
      this.sortPrice = 0;
    },
    tabTypeFunc(type) {
      this.listData = [];
      this.page = 1;
      this.no_more = false;
      this.loading = true;
      if (type === 2) {
        this.price_top = !this.price_top;
        this.sortPrice = this.price_top === true ? 0 : 1;
        this.sortType = "price";
      } else if (type === 1) {
        this.price_top = !this.price_top;
        this.sortType = "sales";
      }
      this.type_active = type;
      this.getData();
    },
    getData() {
      this.loading = true;
      this._get("product.product/lists", {
        page: this.page || 1,
        category_id: this.category_id,
        search: this.search,
        sortType: this.sortType,
        sortPrice: this.sortPrice,
        list_rows: this.list_rows
      }, (res) => {
        this.loading = false;
        this.listData = this.listData.concat(res.data.list.data);
        this.last_page = res.data.list.last_page;
        if (res.data.list.last_page <= 1)
          this.no_more = true;
      });
    },
    gotoList(productId) {
      this.gotoPage("pages/product/detail/detail?product_id=" + productId);
    },
    gotoSearch() {
      this.gotoPage("/pages/product/search/search");
    },
    scrolltolowerFunc() {
      this.bottomRefresh = true;
      this.page++;
      this.loading = true;
      if (this.page > this.last_page) {
        this.loading = false;
        this.no_more = true;
        return;
      }
      this.getData();
    },
    select_type() {
      this.isLieBiao = !this.isLieBiao;
    },
    goback() {
      const pages = getCurrentPages();
      if (pages.length <= 1)
        this.gotoPage("/pages/index/index");
      else
        common_vendor.index.navigateBack();
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
    a: common_vendor.o((...args) => $options.searchFunc && $options.searchFunc(...args), "1d"),
    b: $data.search,
    c: common_vendor.o(($event) => $data.search = $event.detail.value, "f5"),
    d: common_vendor.n($data.type_active === 0 ? "item active" : "item"),
    e: common_vendor.o(($event) => $options.tabTypeFunc(0), "bd"),
    f: common_vendor.n($data.type_active === 1 ? "item active" : "item"),
    g: common_vendor.o(($event) => $options.tabTypeFunc(1), "23"),
    h: common_vendor.n($data.price_top && $data.type_active === 2 ? "arrow active" : "arrow"),
    i: common_vendor.n($data.price_top || $data.type_active !== 2 ? "arrow" : "arrow active"),
    j: common_vendor.n($data.type_active === 2 ? "item active" : "item"),
    k: common_vendor.o(($event) => $options.tabTypeFunc(2), "c5"),
    l: _ctx.config.pic_url + ($data.isLieBiao ? "/202604061216345ffa53811.png" : "/20260406121801e30e33517.png"),
    m: common_vendor.o((...args) => $options.select_type && $options.select_type(...args), "99"),
    n: common_vendor.f(3, (_, index, i0) => {
      return {
        a: index
      };
    }),
    o: common_vendor.n($data.topRefresh ? "top-refresh open" : "top-refresh"),
    p: $data.isLieBiao
  }, $data.isLieBiao ? {
    q: common_vendor.f($data.listData, (item, index, i0) => {
      return common_vendor.e({
        a: item.product_stock <= 0
      }, item.product_stock <= 0 ? {} : {}, {
        b: item.product_image,
        c: common_vendor.t(item.product_name),
        d: common_vendor.t(item.product_price),
        e: common_vendor.t(item.product_sales),
        f: item.product_id || index,
        g: index === $data.listData.length - 1 ? 1 : "",
        h: common_vendor.o(($event) => $options.gotoList(item.product_id), item.product_id || index)
      });
    })
  } : {
    r: common_vendor.f($data.listData, (item, index, i0) => {
      return common_vendor.e({
        a: item.product_stock <= 0
      }, item.product_stock <= 0 ? {} : {}, {
        b: item.product_image,
        c: common_vendor.t(item.product_name),
        d: common_vendor.t(item.product_sales),
        e: common_vendor.t(item.product_price),
        f: item.product_id || index,
        g: common_vendor.n(index % 2 === 0 ? "ml20 mr20" : "mr20"),
        h: common_vendor.o(($event) => $options.gotoList(item.product_id), item.product_id || index)
      });
    })
  }, {
    s: $data.listData.length === 0 && !$data.loading
  }, $data.listData.length === 0 && !$data.loading ? {} : {
    t: common_vendor.p({
      ["loading-type"]: $options.loadingType
    })
  }, {
    v: $data.scrollviewHigh + "px",
    w: common_vendor.o((...args) => $options.scrolltolowerFunc && $options.scrolltolowerFunc(...args), "91"),
    x: _ctx.theme && _ctx.theme()
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4ed0375a"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
