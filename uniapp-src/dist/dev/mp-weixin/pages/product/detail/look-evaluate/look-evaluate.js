"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      phoneHeight: 0,
      scrollviewHigh: 0,
      state_active: -1,
      product_id: 0,
      tableData: [],
      Total: {
        all: 0,
        negative: 0,
        praise: 0,
        review: 0
      },
      page: 1,
      list_rows: 15,
      no_more: false,
      loading: true,
      last_page: 0,
      popImg: "",
      isopenimg: false
    };
  },
  computed: {
    loadingType() {
      return this.loading ? 1 : this.tableData.length !== 0 && this.no_more ? 2 : 0;
    }
  },
  onLoad(query) {
    this.product_id = query.product_id;
  },
  mounted() {
    this.init();
    this.getData();
  },
  methods: {
    preview(images, current) {
      this.openImg(images, current);
    },
    openImg(images, current) {
      const urls = [];
      images.forEach((item) => {
        urls.push(item.file_path);
      });
      common_vendor.index.previewImage({
        urls,
        current,
        fail: (err) => {
          this.showError(err);
        }
      });
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
    getData() {
      this._get("product.comment/lists", {
        product_id: this.product_id,
        scoreType: this.state_active,
        page: this.page,
        list_rows: this.list_rows
      }, (res) => {
        this.loading = false;
        this.Total = res.data.total;
        this.tableData = this.tableData.concat(res.data.list.data);
        this.last_page = res.data.list.last_page;
        if (res.data.list.last_page <= 1)
          this.no_more = true;
      });
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
    stateFunc(state) {
      if (this.state_active !== state) {
        this.tableData = [];
        this.no_more = false;
        this.loading = true;
        this.state_active = state;
        this.page = 1;
        this.getData();
      }
    }
  }
};
if (!Array) {
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  _easycom_uni_load_more2();
}
const _easycom_uni_load_more = () => "../../../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  _easycom_uni_load_more();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.Total.all),
    b: common_vendor.n($data.state_active === -1 ? "tab-item active" : "tab-item"),
    c: common_vendor.o(($event) => $options.stateFunc(0), "f6"),
    d: common_vendor.t($data.Total.praise),
    e: common_vendor.n($data.state_active === 10 ? "tab-item active" : "tab-item"),
    f: common_vendor.o(($event) => $options.stateFunc(10), "1d"),
    g: common_vendor.t($data.Total.review),
    h: common_vendor.n($data.state_active === 20 ? "tab-item active" : "tab-item"),
    i: common_vendor.o(($event) => $options.stateFunc(20), "f5"),
    j: common_vendor.t($data.Total.negative),
    k: common_vendor.n($data.state_active === 30 ? "tab-item active" : "tab-item"),
    l: common_vendor.o(($event) => $options.stateFunc(30), "f1"),
    m: common_vendor.f($data.tableData, (item, index, i0) => {
      return common_vendor.e({
        a: item.users.avatarUrl,
        b: common_vendor.t(item.users.nickName),
        c: item.score === 10
      }, item.score === 10 ? {} : {}, {
        d: item.score === 20
      }, item.score === 20 ? {} : {}, {
        e: item.score === 30
      }, item.score === 30 ? {} : {}, {
        f: common_vendor.t(item.create_time),
        g: common_vendor.t(item.content),
        h: common_vendor.f(item.image, (img, imgIndex, i1) => {
          return {
            a: img.file_path,
            b: common_vendor.o(($event) => $options.preview(item.image, img.file_path), imgIndex),
            c: imgIndex
          };
        }),
        i: index
      });
    }),
    n: $data.tableData.length === 0 && !$data.loading
  }, $data.tableData.length === 0 && !$data.loading ? {
    o: _ctx.config.pic_url + "/static/live/none.png"
  } : {
    p: common_vendor.p({
      ["loading-type"]: $options.loadingType
    })
  }, {
    q: $data.scrollviewHigh + "px",
    r: common_vendor.o((...args) => $options.scrolltolowerFunc && $options.scrolltolowerFunc(...args), "d4"),
    s: $data.isopenimg
  }, $data.isopenimg ? {
    t: $data.popImg,
    v: common_vendor.o(($event) => $data.isopenimg = false, "bc")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c8576a24"]]);
wx.createPage(MiniProgramPage);
