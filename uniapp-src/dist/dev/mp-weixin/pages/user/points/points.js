"use strict";
const common_vendor = require("../../../common/vendor.js");
const UniLoadMore = () => "../../../components/uni-load-more.js";
const Recharge = () => "./part/recharge.js";
const _sfc_main = {
  components: { UniLoadMore, Recharge },
  data() {
    return {
      isPop: false,
      loadding: true,
      indicatorDots: true,
      autoplay: true,
      interval: 2e3,
      duration: 500,
      topRefresh: false,
      phoneHeight: 0,
      scrollviewHigh: 0,
      tableData: [],
      last_page: 0,
      page: 1,
      list_rows: 20,
      no_more: false,
      loading: true,
      points: 0,
      is_open: false,
      discount_ratio: "0",
      is_trans_balance: false
    };
  },
  computed: {
    loadingType() {
      return this.loading ? 1 : this.tableData.length !== 0 && this.no_more ? 2 : 0;
    },
    loadMoreStatus() {
      if (this.loading)
        return "loading";
      return this.no_more ? "noMore" : "more";
    },
    pointsTitle() {
      return typeof this.points_name === "function" ? this.points_name() : "积分";
    },
    themeName() {
      return typeof this.theme === "function" ? this.theme() : "";
    },
    themeClass() {
      return this.themeName || "";
    }
  },
  onReady() {
    common_vendor.index.setNavigationBarTitle({ title: this.pointsTitle });
  },
  mounted() {
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
    closePop(needRefresh) {
      if (needRefresh != null) {
        this.page = 1;
        this.tableData = [];
        this.no_more = false;
        this.getData();
      }
      this.isPop = false;
    },
    getData() {
      this.loading = true;
      this._get(
        "points.log/index",
        {
          page: this.page || 1,
          list_rows: this.list_rows
        },
        (res) => {
          const data = res.data || {};
          const list = data.list || {};
          this.loading = false;
          this.points = data.points;
          this.discount_ratio = data.discount_ratio;
          this.is_open = data.is_open;
          this.is_trans_balance = data.is_trans_balance;
          this.tableData = this.tableData.concat(list.data || []);
          this.last_page = list.last_page || 0;
          if ((list.last_page || 0) <= this.page)
            this.no_more = true;
        }
      );
    },
    gotoShop() {
      this.gotoPage("/pagesPlus/points/list/list");
    }
  }
};
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _component_recharge = common_vendor.resolveComponent("recharge");
  (_easycom_uni_load_more2 + _component_recharge)();
}
const _easycom_uni_load_more = () => "../../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  _easycom_uni_load_more();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: _ctx.config.pic_url + "/20260406112403d4a588219.png",
    b: common_vendor.t($options.pointsTitle),
    c: common_vendor.t($data.points),
    d: $data.is_trans_balance
  }, $data.is_trans_balance ? {
    e: common_vendor.o(($event) => $data.isPop = true, "f0")
  } : {}, {
    f: $data.is_open
  }, $data.is_open ? {
    g: common_vendor.t($options.pointsTitle),
    h: common_vendor.o((...args) => $options.gotoShop && $options.gotoShop(...args), "3d")
  } : {}, {
    i: common_vendor.f($data.tableData, (item, index, i0) => {
      return {
        a: common_vendor.t(_ctx.points_name(item.describe)),
        b: common_vendor.t(item.create_time),
        c: common_vendor.t(Number(item.value) > 0 ? "+" : ""),
        d: common_vendor.t(item.value),
        e: common_vendor.n(Number(item.value) > 0 ? "points-change plus" : "points-change"),
        f: index
      };
    }),
    j: $data.tableData.length === 0 && !$data.loading
  }, $data.tableData.length === 0 && !$data.loading ? {} : {
    k: common_vendor.p({
      status: $options.loadMoreStatus
    })
  }, {
    l: common_vendor.o($options.closePop, "55"),
    m: common_vendor.p({
      ["is-pop"]: $data.isPop,
      ["discount-ratio"]: $data.discount_ratio
    }),
    n: common_vendor.n($options.themeClass),
    o: $options.themeName
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6107f381"]]);
wx.createPage(MiniProgramPage);
