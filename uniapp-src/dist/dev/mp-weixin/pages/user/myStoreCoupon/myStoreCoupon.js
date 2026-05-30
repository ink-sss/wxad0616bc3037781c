"use strict";
const pages_user_pageTools = require("../page-tools.js");
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      activeTab: 0,
      page: 1,
      listRows: 20,
      lastPage: 1,
      hasMore: true,
      loading: false,
      loadingMore: false,
      listData: [],
      recordApi: "live.roomStoreCoupon/storeCouponRecord",
      qrcode: "",
      qrText: "兑换码"
    };
  },
  onLoad() {
    this.getList(true);
  },
  onReachBottom() {
    this.loadMore();
  },
  methods: {
    switchTab(tab) {
      if (this.activeTab !== tab) {
        this.activeTab = tab;
        this.getList(true);
      }
    },
    getListApi() {
      return this.activeTab === 2 ? this.recordApi : "live.roomStoreCoupon/userList";
    },
    getListParams() {
      const params = { page: this.page, list_rows: this.listRows };
      if (this.activeTab === 0)
        params.data_type = "not_use";
      if (this.activeTab === 1)
        params.data_type = "is_expire";
      if (this.activeTab === 2)
        params.data_type = "is_use";
      return params;
    },
    getList(reset = false) {
      if (reset) {
        this.page = 1;
        this.lastPage = 1;
        this.hasMore = true;
        this.listData = [];
      }
      if (!this.hasMore && !reset)
        return;
      const api = this.getListApi();
      this.loading = this.page === 1;
      this.loadingMore = this.page !== 1;
      this._post(api, this.getListParams(), (res) => {
        this.loading = false;
        this.loadingMore = false;
        const data = res.data || {};
        const rows = Array.isArray(data.data) ? data.data : [];
        this.listData = this.page === 1 ? rows : this.listData.concat(rows);
        const current = Number(data.current_page || this.page);
        const last = Number(data.last_page || 0);
        this.lastPage = last || current;
        this.hasMore = last > 0 ? current < last : rows.length >= this.listRows;
        this.page += 1;
      });
    },
    loadMore() {
      if (!this.loading && !this.loadingMore && this.hasMore)
        this.getList();
    },
    handleCouponAction() {
      this.getCouponCode();
    },
    getCouponCode() {
      this._get("user.qrCode/getRoomStoreCouponCode", { url: "/pages/branch/welfareVoucher" }, (res) => {
        if (res.code === 1) {
          this.qrcode = res.data.content;
          this.qrText = "兑换码";
        }
      });
    },
    toNumber(value) {
      const number = Number(value);
      return Number.isFinite(number) ? number : 0;
    },
    getCouponName(item) {
      return item.name || item.coupon_name || item.title || "福利券";
    },
    getCouponType(item) {
      return item.coupon_type_name || item.type_name || "福利券";
    },
    getCouponRemark(item) {
      return String(item.remark || item.coupon_remark || item.description || "").trim();
    },
    getDateRange(item) {
      const start = pages_user_pageTools.dateText(item.start_time || item.startTime || item.begin_time);
      const end = pages_user_pageTools.dateText(item.expire_time || item.end_time || item.invalid_time || item.endTime);
      if (start && end)
        return start + " - " + end;
      if (!start && end)
        return "到期：" + end;
      if (start && !end)
        return start + " - 长期有效";
      return "长期有效";
    },
    getBottomTimeText(item) {
      if (this.activeTab === 2) {
        const used = pages_user_pageTools.dateText(item.create_time);
        return used ? "使用时间：" + used : "使用时间：--";
      }
      return this.getDateRange(item);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.activeTab === 0 ? 1 : "",
    b: common_vendor.o(($event) => $options.switchTab(0), "32"),
    c: $data.activeTab === 1 ? 1 : "",
    d: common_vendor.o(($event) => $options.switchTab(1), "43"),
    e: $data.activeTab === 2 ? 1 : "",
    f: common_vendor.o(($event) => $options.switchTab(2), "63"),
    g: common_vendor.f($data.listData, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t($options.getCouponType(item)),
        b: common_vendor.t($options.getCouponName(item)),
        c: $options.getCouponRemark(item)
      }, $options.getCouponRemark(item) ? {
        d: common_vendor.t($options.getCouponRemark(item))
      } : {}, $data.activeTab !== 1 ? {
        e: common_vendor.t($options.toNumber(item.num))
      } : {}, $data.activeTab === 0 ? {
        f: common_vendor.o(($event) => $options.handleCouponAction(item), item.coupon_id || item.id)
      } : {}, {
        g: common_vendor.t($options.getBottomTimeText(item)),
        h: item.coupon_id || item.id
      });
    }),
    h: $data.activeTab !== 1,
    i: $data.activeTab === 0,
    j: !$data.loading && $data.listData.length === 0
  }, !$data.loading && $data.listData.length === 0 ? {} : {}, {
    k: $data.qrcode
  }, $data.qrcode ? {
    l: common_vendor.t($data.qrText),
    m: common_vendor.t($data.qrcode),
    n: common_vendor.o(($event) => $data.qrcode = "", "91")
  } : {}, {
    o: _ctx.theme && _ctx.theme()
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ade6d88a"]]);
wx.createPage(MiniProgramPage);
