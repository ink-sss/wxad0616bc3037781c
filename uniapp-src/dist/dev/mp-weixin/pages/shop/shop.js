"use strict";
const common_vendor = require("../../common/vendor.js");
const UniLoadMore = () => "../../components/uni-load-more.js";
const _sfc_main = {
  components: {
    UniLoadMore
  },
  data() {
    return {
      isLieBiao: true,
      shop_info: {},
      product_list: [],
      shop_supplier_id: "",
      isfollow: "",
      loading: true,
      no_more: false,
      type_active: "all",
      page: 1,
      search: "",
      last_page: 0,
      is_open: 0,
      is_record: 0,
      liveList: [],
      dataModel: { qq: "", wechat: "", phone: "" },
      service_type: 0,
      service_open: 0,
      category_id: 0,
      sortPrice: 0,
      adList: [],
      swiperCurrent: 0
    };
  },
  computed: {
    loadStatus() {
      return this.loading ? "loading" : this.product_list.length && this.no_more ? "noMore" : "more";
    },
    defaultLogo() {
      return (this.config && this.config.pic_url ? this.config.pic_url : "") + "/shop-default.png";
    }
  },
  onLoad(query = {}) {
    this.shop_supplier_id = query.shop_supplier_id;
  },
  onShow() {
    this.getData();
  },
  mounted() {
    this.getProduct(this.type_active);
  },
  onPullDownRefresh() {
    this.restoreData();
    this.getData();
    this.getProduct(this.type_active);
  },
  onReachBottom() {
    this.scrolltolowerFunc();
  },
  methods: {
    changeSwiper(event) {
      this.swiperCurrent = event.detail.current;
    },
    getScore(value, type) {
      const score = Number(value);
      if (score <= 0 || !score)
        return 0;
      const decimal = score % 1;
      if (type === 1)
        return score - decimal;
      if (type === 2)
        return decimal === 0 ? 0 : 1;
      return 0;
    },
    getVisitcode() {
      return typeof this.$getVisitcode === "function" ? this.$getVisitcode() : common_vendor.index.getStorageSync("visitcode") || "";
    },
    restoreData() {
      this.product_list = [];
      this.page = 1;
      this.category_id = 0;
      this.search = "";
      this.no_more = false;
      this.sortPrice = 0;
    },
    tabTypeFunc(type) {
      if (type === this.type_active)
        return;
      this.product_list = [];
      this.page = 1;
      this.no_more = false;
      this.loading = true;
      this.type_active = type;
      this.getProduct(type);
    },
    getProduct(type) {
      if (typeof this._get !== "function") {
        this.loading = false;
        return;
      }
      this.loading = true;
      this._get("product.product/lists", {
        page: this.page || 1,
        sortType: type,
        sortPrice: this.sortPrice,
        shop_supplier_id: this.shop_supplier_id,
        search: this.search
      }, (res) => {
        const list = res.data && res.data.list || {};
        this.loading = false;
        this.product_list = this.product_list.concat(list.data || []);
        this.last_page = list.last_page || 0;
        this.no_more = this.last_page <= 1 || this.page >= this.last_page;
        common_vendor.index.stopPullDownRefresh();
      });
    },
    getData() {
      if (typeof this._post !== "function") {
        this.loading = false;
        return;
      }
      common_vendor.index.showLoading({ title: "加载中...." });
      this._post("supplier.index/index", {
        shop_supplier_id: this.shop_supplier_id,
        visitcode: this.getVisitcode()
      }, (res) => {
        const data = res.data || {};
        this.shop_info = data.detail || {};
        this.adList = data.adList || [];
        this.isfollow = this.shop_info.isfollow;
        this.is_record = data.liv_status ? data.liv_status.is_record : 0;
        this.is_open = data.liv_status ? data.liv_status.is_open : 0;
        this.liveList = data.liveList ? data.liveList.data || [] : [];
        this.service_open = data.service_open || 0;
        this.service_type = data.mp_service ? data.mp_service.service_type : 10;
        common_vendor.index.hideLoading();
        this.getservice();
      });
    },
    getservice() {
      if (typeof this._get !== "function")
        return;
      this._get("index/mpService", { shop_supplier_id: this.shop_supplier_id }, (res) => {
        this.dataModel = res.data && res.data.mp_service || this.dataModel;
      });
    },
    select_type() {
      this.isLieBiao = !this.isLieBiao;
    },
    goto_product(productId) {
      const url = "/pages/product/detail/detail?product_id=" + productId;
      if (typeof this.gotoPage === "function")
        this.gotoPage(url);
      else
        common_vendor.index.navigateTo({ url });
    },
    gotoDetail() {
      const url = "/pages/shop/shop_detail?shop_supplier_id=" + this.shop_supplier_id;
      if (typeof this.gotoPage === "function")
        this.gotoPage(url);
      else
        common_vendor.index.navigateTo({ url });
    },
    guanzhu() {
      if (typeof this._post !== "function")
        return;
      this._post("user.Favorite/add", { pid: this.shop_supplier_id, type: 10 }, () => {
        this.isfollow = this.isfollow ? 0 : 1;
      });
    },
    scrolltolowerFunc() {
      this.page += 1;
      if (this.page > this.last_page) {
        this.loading = false;
        this.no_more = true;
        return;
      }
      this.getProduct(this.type_active);
    }
  }
};
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  _easycom_uni_load_more2();
}
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  _easycom_uni_load_more();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.shop_info.back_image
  }, $data.shop_info.back_image ? {
    b: $data.shop_info.back_image
  } : {}, {
    c: $data.shop_info.logos || $options.defaultLogo,
    d: common_vendor.t($data.shop_info.store_name || ""),
    e: common_vendor.t($data.shop_info.server_score || 0),
    f: common_vendor.t($data.shop_info.category_name || ""),
    g: common_vendor.t($data.shop_info.product_sales || 0),
    h: common_vendor.t($data.shop_info.fav_count || 0),
    i: common_vendor.t($data.isfollow ? "已关注" : "+关注"),
    j: common_vendor.o((...args) => $options.guanzhu && $options.guanzhu(...args), "44"),
    k: common_vendor.o((...args) => $options.gotoDetail && $options.gotoDetail(...args), "23"),
    l: $data.service_open
  }, $data.service_open ? {} : {}, {
    m: $data.adList && $data.adList.length
  }, $data.adList && $data.adList.length ? {
    n: common_vendor.f($data.adList, (item, k0, i0) => {
      return {
        a: item.image && item.image.file_path,
        b: item.id || item.image.file_path
      };
    }),
    o: common_vendor.o((...args) => $options.changeSwiper && $options.changeSwiper(...args), "ce")
  } : {}, {
    p: common_vendor.n($data.type_active === "all" ? "tab active" : "tab"),
    q: common_vendor.o(($event) => $options.tabTypeFunc("all"), "d8"),
    r: common_vendor.n($data.type_active === "sales" ? "tab active" : "tab"),
    s: common_vendor.o(($event) => $options.tabTypeFunc("sales"), "ef"),
    t: common_vendor.n($data.type_active === "price" ? "tab active" : "tab"),
    v: common_vendor.o(($event) => $options.tabTypeFunc("price"), "70"),
    w: common_vendor.t($data.isLieBiao ? "列表" : "宫格"),
    x: common_vendor.o((...args) => $options.select_type && $options.select_type(...args), "a3"),
    y: common_vendor.f($data.product_list, (item, k0, i0) => {
      return {
        a: item.product_image,
        b: common_vendor.t(item.product_name),
        c: common_vendor.t(item.product_sales || 0),
        d: common_vendor.t(item.product_price),
        e: item.product_id,
        f: common_vendor.o(($event) => $options.goto_product(item.product_id), item.product_id)
      };
    }),
    z: common_vendor.n($data.isLieBiao ? "product-list" : "product-grid"),
    A: $data.product_list.length === 0 && !$data.loading
  }, $data.product_list.length === 0 && !$data.loading ? {} : {
    B: common_vendor.p({
      status: $options.loadStatus
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-111bd4f2"]]);
wx.createPage(MiniProgramPage);
