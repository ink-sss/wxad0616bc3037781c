"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      dataList: [],
      balance: "",
      balance_open: 1,
      cash_open: 0,
      loading: true
    };
  },
  onShow() {
    this.getData();
  },
  methods: {
    getData() {
      common_vendor.index.showLoading({ title: "加载中..." });
      this.loading = true;
      this._get(
        "balance.log/index",
        {},
        (res) => {
          this.dataList = res.data.list || [];
          this.balance = res.data.balance;
          this.balance_open = res.data.balance_open;
          this.cash_open = res.data.cash_open;
          this.loading = false;
          common_vendor.index.hideLoading();
        },
        false,
        () => common_vendor.index.hideLoading()
      );
    },
    gotoList(type) {
      this.gotoPage("/pages/user/my-wallet/my-balance?type=" + type);
    },
    gotoPay() {
      this.gotoPage("/pages/order/recharge");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.balance || "0.00"),
    b: $data.cash_open
  }, $data.cash_open ? {
    c: common_vendor.o(($event) => _ctx.gotoPage("/pages/user/cash/apply"), "ee"),
    d: common_vendor.o(($event) => _ctx.gotoPage("/pages/user/cash/list"), "de")
  } : {}, {
    e: $data.balance_open
  }, $data.balance_open ? {
    f: common_vendor.o((...args) => $options.gotoPay && $options.gotoPay(...args), "87"),
    g: common_vendor.o(($event) => $options.gotoList("rechange"), "6c"),
    h: common_vendor.o(($event) => $options.gotoList("all"), "17")
  } : {}, {
    i: common_vendor.f($data.dataList, (item, index, i0) => {
      return {
        a: common_vendor.t(item.scene && item.scene.text),
        b: common_vendor.t(item.create_time),
        c: common_vendor.t(item.money),
        d: common_vendor.n(Number(item.money) > 0 ? "money plus" : "money"),
        e: index
      };
    }),
    j: !$data.loading && $data.dataList.length === 0
  }, !$data.loading && $data.dataList.length === 0 ? {} : {}, {
    k: _ctx.theme && _ctx.theme()
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-21a849ba"]]);
wx.createPage(MiniProgramPage);
