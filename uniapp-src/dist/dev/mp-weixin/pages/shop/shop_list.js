"use strict";
const common_vendor = require("../../common/vendor.js");
const UniLoadMore = () => "../../components/uni-load-more.js";
const TabBar = () => "../../components/tabbar/footTabbar.js";
const _sfc_main = {
  components: {
    UniLoadMore,
    TabBar
  },
  data() {
    return {
      triggered: true,
      phoneHeight: 0,
      scrollviewHigh: 0,
      no_more: false,
      loading: false,
      last_page: 0,
      page: 1,
      list_rows: 10,
      type_active: "all",
      shopData: [],
      searchtxt: "",
      keyWord: "",
      footerHeight: ""
    };
  },
  computed: {
    loadStatus() {
      return this.loading ? "loading" : this.shopData.length && this.no_more ? "noMore" : "more";
    },
    defaultLogo() {
      return (this.config && this.config.pic_url ? this.config.pic_url : "") + "/static/shop-default.png";
    }
  },
  onReady() {
    common_vendor.index.hideTabBar();
  },
  mounted() {
    this.init();
    this.restoreData();
    this.getData();
  },
  methods: {
    init() {
      common_vendor.index.getSystemInfo({
        success: (res) => {
          this.phoneHeight = res.windowHeight;
          common_vendor.index.createSelectorQuery().select(".top-box").boundingClientRect((rect) => {
            this.scrollviewHigh = this.phoneHeight - (rect && rect.height || 0) - 60;
          }).exec();
        }
      });
    },
    restoreData() {
      this.shopData = [];
      this.page = 1;
      this.no_more = false;
    },
    tabTypeFunc(type) {
      if (this.loading || type === this.type_active)
        return;
      this.type_active = type;
      this.restoreData();
      this.getData();
    },
    getData() {
      if (typeof this._post !== "function") {
        this.loading = false;
        return;
      }
      if (this.loading)
        return;
      this.loading = true;
      this._post("supplier.index/list", {
        page: this.page || 1,
        list_rows: this.list_rows,
        sortType: this.type_active,
        name: this.keyWord
      }, (res) => {
        const list = res.data && res.data.list || {};
        this.loading = false;
        this.last_page = list.last_page || 0;
        this.shopData = this.shopData.concat(list.data || []);
        this.no_more = this.last_page <= 1 || this.page >= this.last_page;
      });
    },
    onRefresh() {
      this.restoreData();
      this.getData();
      setTimeout(() => {
        this.triggered = false;
      }, 1e3);
    },
    onRestore() {
      this.triggered = false;
    },
    search() {
      this.keyWord = this.searchtxt;
      this.restoreData();
      this.getData();
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
    gotoShop(shopSupplierId) {
      const url = "/pages/shop/shop?shop_supplier_id=" + shopSupplierId;
      if (typeof this.gotoPage === "function")
        this.gotoPage(url);
      else
        common_vendor.index.navigateTo({ url });
    }
  }
};
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _component_tab_bar = common_vendor.resolveComponent("tab-bar");
  (_easycom_uni_load_more2 + _component_tab_bar)();
}
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  _easycom_uni_load_more();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.search && $options.search(...args), "de"),
    b: $data.searchtxt,
    c: common_vendor.o(($event) => $data.searchtxt = $event.detail.value, "09"),
    d: common_vendor.o((...args) => $options.search && $options.search(...args), "b3"),
    e: common_vendor.n($data.type_active === "all" ? "tab active" : "tab"),
    f: common_vendor.o(($event) => $options.tabTypeFunc("all"), "a4"),
    g: common_vendor.n($data.type_active === "sales" ? "tab active" : "tab"),
    h: common_vendor.o(($event) => $options.tabTypeFunc("sales"), "9b"),
    i: common_vendor.n($data.type_active === "score" ? "tab active" : "tab"),
    j: common_vendor.o(($event) => $options.tabTypeFunc("score"), "66"),
    k: common_vendor.f($data.shopData, (item, k0, i0) => {
      return {
        a: item.logos || $options.defaultLogo,
        b: common_vendor.t(item.store_name || item.name),
        c: common_vendor.t(item.server_score || 0),
        d: common_vendor.t(item.product_sales || 0),
        e: common_vendor.t(item.address || item.category_name),
        f: item.shop_supplier_id,
        g: common_vendor.o(($event) => $options.gotoShop(item.shop_supplier_id), item.shop_supplier_id)
      };
    }),
    l: $data.shopData.length === 0 && !$data.loading
  }, $data.shopData.length === 0 && !$data.loading ? {} : {
    m: common_vendor.p({
      status: $options.loadStatus
    })
  }, {
    n: $data.scrollviewHigh + "px",
    o: $data.triggered,
    p: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args), "a8"),
    q: common_vendor.o((...args) => $options.onRestore && $options.onRestore(...args), "03"),
    r: common_vendor.o((...args) => $options.scrolltolowerFunc && $options.scrolltolowerFunc(...args), "ed")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-cd209eea"]]);
wx.createPage(MiniProgramPage);
