"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      loadding: true,
      DataList: [],
      page: 1,
      list_rows: 10
    };
  },
  onShow() {
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
        this.loadding = false;
        return;
      }
      common_vendor.index.showLoading({ title: "加载中" });
      this._get("coupon.coupon/lists", {
        page: this.page,
        list_rows: this.list_rows
      }, (res) => {
        this.DataList = res.data && res.data.list || [];
        this.loadding = false;
        common_vendor.index.hideLoading();
      });
    },
    lookRule(item) {
      item.rule = true;
    },
    closeRule(item) {
      item.rule = false;
    },
    receive(couponId) {
      if (typeof this._post !== "function")
        return;
      common_vendor.index.showLoading({ title: "领取中" });
      this._post("user.coupon/receive", { coupon_id: couponId }, () => {
        common_vendor.index.hideLoading();
        this.getData();
        common_vendor.index.showToast({ title: "领取成功", duration: 2e3, icon: "success" });
      }, () => {
        this.getData();
      });
    },
    gotoDetail(item) {
      const url = `/pages/coupon/detail?coupon_id=${item.coupon_id}&apply_range=${item.apply_range || ""}`;
      if (typeof this.gotoPage === "function")
        this.gotoPage(url);
      else
        common_vendor.index.navigateTo({ url });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$data.loadding
  }, !$data.loadding ? common_vendor.e({
    b: $data.DataList.length
  }, $data.DataList.length ? {
    c: common_vendor.f($data.DataList, (item, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.name),
        b: common_vendor.t($options.expireText(item)),
        c: common_vendor.o(($event) => $options.lookRule(item), item.coupon_id),
        d: common_vendor.t($options.valueText(item)),
        e: common_vendor.t(item.min_price > 0 ? "满" + Number(item.min_price) + "元可用" : "无门槛"),
        f: item.state && item.state.value > 0
      }, item.state && item.state.value > 0 ? {
        g: common_vendor.o(($event) => $options.receive(item.coupon_id), item.coupon_id)
      } : {
        h: common_vendor.t(item.state ? item.state.text : "不可领取")
      }, {
        i: item.rule
      }, item.rule ? {
        j: common_vendor.t(item.rule_text || item.describe || item.rule || "暂无规则说明"),
        k: common_vendor.o(($event) => $options.closeRule(item), item.coupon_id)
      } : {}, {
        l: common_vendor.o(($event) => $options.gotoDetail(item), item.coupon_id),
        m: item.coupon_id
      });
    })
  } : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e481f7b1"]]);
wx.createPage(MiniProgramPage);
