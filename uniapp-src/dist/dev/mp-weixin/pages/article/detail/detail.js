"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_utils = require("../../../common/utils.js");
const TabBar = () => "../../../components/tabbar/footTabbar.js";
const AppShare = () => "../../../components/app-share.js";
const _sfc_main = {
  components: {
    TabBar,
    AppShare
  },
  data() {
    return {
      loadding: false,
      article_id: 0,
      article: {
        image: {},
        category: {}
      },
      urldata: "",
      isAppShare: false,
      appParams: {
        title: "",
        summary: "",
        path: ""
      }
    };
  },
  computed: {
    categoryName() {
      return this.article.category && this.article.category.name || "";
    }
  },
  onLoad(query = {}) {
    this.article_id = query.article_id || 0;
  },
  mounted() {
    this.getData();
  },
  onShareAppMessage() {
    this.taskFunc();
    return {
      title: this.article.article_title || "文章详情",
      path: "/pages/article/detail/detail?" + this.shareParams({ article_id: this.article_id })
    };
  },
  methods: {
    shareParams(extra = {}) {
      if (typeof this.getShareUrlParams === "function")
        return this.getShareUrlParams(extra);
      return Object.keys(extra).map((key) => `${key}=${extra[key]}`).join("&");
    },
    taskFunc() {
      if (typeof this._post !== "function")
        return;
      this._post("plus.task.Task/dayTask", { task_type: "article" }, () => {
      });
    },
    shareFunc() {
      this.taskFunc();
    },
    closeAppShare() {
      this.isAppShare = false;
    },
    getData() {
      if (typeof this._get !== "function") {
        this.loadding = true;
        return;
      }
      common_vendor.index.showLoading({ title: "加载中" });
      this._get("plus.article.article/detail", {
        article_id: this.article_id,
        url: this.urldata
      }, (res) => {
        const detail = res.data && res.data.detail || {};
        detail.article_content = common_utils.format_content(detail.article_content || "");
        this.article = detail;
        this.appParams = {
          title: detail.article_title || "",
          summary: detail.dec || "",
          path: "/pages/article/detail/detail?article_id=" + this.article_id
        };
        this.loadding = true;
        common_vendor.index.hideLoading();
      });
    }
  }
};
if (!Array) {
  const _component_tab_bar = common_vendor.resolveComponent("tab-bar");
  const _component_app_share = common_vendor.resolveComponent("app-share");
  (_component_tab_bar + _component_app_share)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.loadding
  }, $data.loadding ? {
    b: common_vendor.t($data.article.article_title),
    c: common_vendor.t($options.categoryName),
    d: common_vendor.t($data.article.create_time),
    e: common_vendor.o((...args) => $options.shareFunc && $options.shareFunc(...args), "98"),
    f: $data.article.article_content || ""
  } : {}, {
    g: common_vendor.o($options.closeAppShare, "7e"),
    h: common_vendor.p({
      ["is-app-share"]: $data.isAppShare,
      ["app-params"]: $data.appParams
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e4f06389"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
