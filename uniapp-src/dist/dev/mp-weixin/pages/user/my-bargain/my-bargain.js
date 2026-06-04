"use strict";
const common_vendor = require("../../../common/vendor.js");
const UniLoadMore = () => "../../../components/uni-load-more.js";
const Countdown = () => "../../../components/countdown/countdown.js";
const _sfc_main = {
  components: { UniLoadMore, Countdown },
  data() {
    return {
      loading: true,
      phoneHeight: 0,
      scrollviewHigh: 0,
      status: 0,
      topRefresh: false,
      page: 1,
      list_rows: 20,
      listData: [],
      last_page: 0,
      no_more: false,
      countdownConfig: {
        startstamp: 0,
        endstamp: 0,
        type: "text",
        title: "剩余："
      }
    };
  },
  computed: {
    loadingType() {
      return this.loading ? 1 : this.listData.length !== 0 && this.no_more ? 2 : 0;
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
  mounted() {
    this.init();
    this.getData();
  },
  methods: {
    rturnObjec(item) {
      return {
        type: "text",
        startstamp: 0,
        endstamp: item.end_time,
        title: "剩余"
      };
    },
    progressReturn(item) {
      return item.is_floor === 1 ? 100 : item.bargain_rate;
    },
    init() {
      common_vendor.index.getSystemInfo({
        success: (res) => {
          this.phoneHeight = res.windowHeight;
          this.scrollviewHigh = Math.max(0, res.windowHeight - 96 - 128);
        }
      });
    },
    stateFunc(status) {
      if (this.status === status)
        return;
      this.listData = [];
      this.page = 1;
      this.no_more = false;
      this.status = status;
      this.getData();
    },
    getData() {
      this.loading = true;
      this._get(
        "user.bargain/lists",
        {
          page: this.page,
          list_rows: this.list_rows,
          status: this.status
        },
        (res) => {
          const list = res.data && res.data.list || {};
          this.loading = false;
          this.listData = this.listData.concat(list.data || []);
          this.last_page = list.last_page || 0;
          if ((list.last_page || 0) <= this.page)
            this.no_more = true;
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
    gotoDetail(id) {
      this.gotoPage("/pagesPlus/bargain/haggle/haggle?bargain_task_id=" + id);
    },
    goback() {
      common_vendor.index.navigateBack({});
    },
    gotoMore() {
      this.gotoPage("/pagesPlus/bargain/list/list");
    },
    returnValFunc(value, index) {
      console.log(value, index);
    }
  }
};
if (!Array) {
  const _easycom_countdown2 = common_vendor.resolveComponent("countdown");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_countdown2 + _easycom_uni_load_more2)();
}
const _easycom_countdown = () => "../../../components/countdown/countdown.js";
const _easycom_uni_load_more = () => "../../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_countdown + _easycom_uni_load_more)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.n($data.status === 0 ? "tab-item active" : "tab-item"),
    b: common_vendor.o(($event) => $options.stateFunc(0), "7b"),
    c: common_vendor.n($data.status === 1 ? "tab-item active" : "tab-item"),
    d: common_vendor.o(($event) => $options.stateFunc(1), "21"),
    e: common_vendor.n($data.status === 2 ? "tab-item active" : "tab-item"),
    f: common_vendor.o(($event) => $options.stateFunc(2), "86"),
    g: common_vendor.f($data.listData, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.create_time)
      }, $data.status === 0 ? {
        b: "638e48c3-0-" + i0,
        c: common_vendor.p({
          config: $options.rturnObjec(item)
        })
      } : {}, {
        d: item.file_path,
        e: common_vendor.t(item.product_name),
        f: common_vendor.t(item.bargain_price),
        g: common_vendor.t(item.product_price),
        h: $options.progressReturn(item) + "%",
        i: common_vendor.t($options.progressReturn(item)),
        j: index,
        k: common_vendor.o(($event) => $options.gotoDetail(item.bargain_task_id), index)
      });
    }),
    h: $data.status === 0,
    i: $data.listData.length === 0 && !$data.loading
  }, $data.listData.length === 0 && !$data.loading ? {
    j: _ctx.config.pic_url + "/list-null.png"
  } : {
    k: common_vendor.p({
      status: $options.loadMoreStatus
    })
  }, {
    l: $data.scrollviewHigh + "px",
    m: common_vendor.o((...args) => $options.scrolltolowerFunc && $options.scrolltolowerFunc(...args), "ee"),
    n: common_vendor.o((...args) => $options.gotoMore && $options.gotoMore(...args), "17"),
    o: common_vendor.n($options.themeClass),
    p: $options.themeName
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-638e48c3"]]);
wx.createPage(MiniProgramPage);
