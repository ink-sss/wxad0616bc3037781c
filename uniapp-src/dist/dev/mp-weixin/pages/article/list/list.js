"use strict";
const common_vendor = require("../../../common/vendor.js");
const UniLoadMore = () => "../../../components/uni-load-more.js";
const TabBar = () => "../../../components/tabbar/footTabbar.js";
const _sfc_main = {
  components: {
    UniLoadMore,
    TabBar
  },
  data() {
    return {
      loading: true,
      phoneHeight: 0,
      scrollviewHigh: 0,
      listData: [],
      no_more: false,
      list_rows: 10,
      page: 1,
      last_page: 0,
      categorys: [],
      category_id: 0
    };
  },
  computed: {
    loadStatus() {
      return this.loading ? "loading" : this.listData.length && this.no_more ? "noMore" : "more";
    }
  },
  onLoad(query = {}) {
    this.category_id = query.category_id || 0;
  },
  mounted() {
    this.init();
    this.getCategory();
    this.getData();
  },
  methods: {
    imageOf(image) {
      return typeof image === "string" ? image : image.file_path || image.url || "";
    },
    init() {
      common_vendor.index.getSystemInfo({
        success: (res) => {
          this.phoneHeight = res.windowHeight;
          common_vendor.index.createSelectorQuery().select(".top-tabbar").boundingClientRect((rect) => {
            this.scrollviewHigh = this.phoneHeight - (rect && rect.height || 0);
          }).exec();
        }
      });
    },
    getCategory() {
      if (typeof this._get !== "function")
        return;
      this._get("plus.article.article/category", {}, (res) => {
        this.categorys = res.data && res.data.category || [];
      });
    },
    tabTypeFunc(categoryId) {
      if (categoryId == this.category_id)
        return;
      this.category_id = categoryId;
      this.page = 1;
      this.listData = [];
      this.no_more = false;
      this.getData();
    },
    getData() {
      if (typeof this._get !== "function") {
        this.loading = false;
        return;
      }
      this.loading = true;
      common_vendor.index.showLoading({ title: "加载中" });
      this._get("plus.article.article/index", {
        page: this.page || 1,
        list_rows: this.list_rows,
        category_id: this.category_id
      }, (res) => {
        const list = res.data && res.data.list || {};
        this.listData = this.listData.concat(list.data || []);
        this.last_page = list.last_page || 0;
        this.no_more = this.last_page <= 1 || this.page >= this.last_page;
        this.loading = false;
        common_vendor.index.hideLoading();
      });
    },
    scrolltolowerFunc() {
      if (this.page >= this.last_page) {
        this.no_more = true;
        return;
      }
      this.page += 1;
      this.getData();
    },
    gotoDetail(articleId) {
      const url = "/pages/article/detail/detail?article_id=" + articleId;
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
const _easycom_uni_load_more = () => "../../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  _easycom_uni_load_more();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.n($data.category_id == 0 ? "tab-item active" : "tab-item"),
    b: common_vendor.o(($event) => $options.tabTypeFunc(0), "1d"),
    c: common_vendor.f($data.categorys, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: item.category_id,
        c: common_vendor.n($data.category_id == item.category_id ? "tab-item active" : "tab-item"),
        d: common_vendor.o(($event) => $options.tabTypeFunc(item.category_id), item.category_id)
      };
    }),
    d: common_vendor.f($data.listData, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.article_title),
        b: common_vendor.t(item.dec || item.describe || ""),
        c: common_vendor.t(item.create_time),
        d: common_vendor.t(item.actual_views || 0),
        e: item.image
      }, item.image ? {
        f: $options.imageOf(item.image)
      } : {}, {
        g: item.article_id,
        h: common_vendor.o(($event) => $options.gotoDetail(item.article_id), item.article_id)
      });
    }),
    e: $data.listData.length === 0 && !$data.loading
  }, $data.listData.length === 0 && !$data.loading ? {} : {
    f: common_vendor.p({
      status: $options.loadStatus
    })
  }, {
    g: $data.scrollviewHigh + "px",
    h: common_vendor.o((...args) => $options.scrolltolowerFunc && $options.scrolltolowerFunc(...args), "77")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7ce420c0"]]);
wx.createPage(MiniProgramPage);
