"use strict";
const common_vendor = require("../../common/vendor.js");
const UniLoadMore = () => "../../components/uni-load-more.js";
const _sfc_main = {
  components: {
    UniLoadMore
  },
  data() {
    return {
      loading: true,
      coupon_id: 0,
      apply_range: 10,
      listData: [],
      last_page: 0,
      page: 1,
      no_more: false,
      detail: {
        state: { value: 0, text: "" },
        coupon_type: {},
        color: {}
      }
    };
  },
  computed: {
    loadStatus() {
      return this.loading ? "loading" : this.no_more ? "noMore" : "more";
    },
    defaultProductImage() {
      return (this.config && this.config.pic_url ? this.config.pic_url : "") + "/static/live/default_logo.jpeg";
    }
  },
  onLoad(query = {}) {
    this.coupon_id = query.coupon_id || 0;
    this.apply_range = query.apply_range || 10;
  },
  onShow() {
    this.page = 1;
    this.listData = [];
    this.getData();
  },
  methods: {
    expireText(item) {
      if (item.expire_type === 10)
        return `领取后${item.expire_day}天内有效`;
      if (item.expire_type === 20)
        return `${item.start_time && item.start_time.text} 至 ${item.end_time && item.end_time.text}`;
      return "长期有效";
    },
    valueText(item) {
      if (item.coupon_type && item.coupon_type.value === 20)
        return `${item.discount}折`;
      return `¥${Number(item.reduce_price || 0)}`;
    },
    getData() {
      if (typeof this._get !== "function") {
        this.loading = false;
        return;
      }
      this.loading = true;
      common_vendor.index.showLoading({ title: "加载中" });
      this._get("coupon.coupon/detail", { coupon_id: this.coupon_id }, (res) => {
        const data = res.data || {};
        this.detail = data.model || this.detail;
        if (this.apply_range == 20) {
          this.listData = this.detail.product || [];
          this.no_more = true;
        } else if (this.apply_range == 30 && data.product_list) {
          this.listData = this.listData.concat(data.product_list.data || []);
          this.last_page = data.product_list.last_page || 0;
          this.no_more = this.last_page <= 1;
        }
        this.loading = false;
        common_vendor.index.hideLoading();
      });
    },
    receiveCoupon() {
      if (this.detail.is_get === 1 || typeof this._post !== "function")
        return;
      this._post("user.coupon/receive", { coupon_id: this.detail.coupon_id }, () => {
        common_vendor.index.showToast({ title: "领取成功", icon: "success", mask: true, duration: 2e3 });
        this.detail.is_get = 1;
        this.detail.state = { ...this.detail.state || {}, text: "已领取" };
      }, () => {
        common_vendor.index.navigateBack();
      });
    },
    gotoProduct(productId) {
      const url = "/pages/product/detail/detail?product_id=" + productId;
      if (typeof this.gotoPage === "function")
        this.gotoPage(url);
      else
        common_vendor.index.navigateTo({ url });
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
    a: !$data.loading
  }, !$data.loading ? common_vendor.e({
    b: common_vendor.t($data.detail.supplier ? $data.detail.supplier.name : "平台通用"),
    c: common_vendor.t($data.detail.name),
    d: common_vendor.t($options.valueText($data.detail)),
    e: common_vendor.t($data.detail.min_price > 0 ? "满" + Number($data.detail.min_price) + "元可用" : "无门槛"),
    f: common_vendor.t($options.expireText($data.detail)),
    g: $data.detail.is_get === 0
  }, $data.detail.is_get === 0 ? {
    h: common_vendor.o((...args) => $options.receiveCoupon && $options.receiveCoupon(...args), "1b")
  } : {
    i: common_vendor.t($data.detail.state && $data.detail.state.text ? $data.detail.state.text : "已领取"),
    j: common_vendor.o((...args) => $options.receiveCoupon && $options.receiveCoupon(...args), "16")
  }, {
    k: $data.apply_range != 10
  }, $data.apply_range != 10 ? common_vendor.e({
    l: common_vendor.f($data.listData, (item, k0, i0) => {
      return {
        a: item.product_image || $options.defaultProductImage,
        b: common_vendor.t(item.product_name),
        c: common_vendor.t(item.product_sales || 0),
        d: common_vendor.t(item.product_price),
        e: item.product_id,
        f: common_vendor.o(($event) => $options.gotoProduct(item.product_id), item.product_id)
      };
    }),
    m: $data.listData.length === 0
  }, $data.listData.length === 0 ? {} : {
    n: common_vendor.p({
      status: $options.loadStatus
    })
  }) : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b19997f8"]]);
wx.createPage(MiniProgramPage);
