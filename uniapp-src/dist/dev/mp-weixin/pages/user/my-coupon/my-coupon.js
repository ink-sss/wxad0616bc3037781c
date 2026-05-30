"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      state_active: 0,
      DataList: [],
      no_more: false,
      loading: false,
      data_type: "not_use",
      supList: []
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      this.loading = true;
      common_vendor.index.showLoading({ title: "加载中" });
      this._get(
        "user.coupon/lists",
        { data_type: this.data_type },
        (res) => {
          this.loading = false;
          common_vendor.index.hideLoading();
          this.DataList = res.data.list || [];
          this.getSup();
        },
        false,
        () => common_vendor.index.hideLoading()
      );
    },
    getSup() {
      const supplierGroups = [];
      const platform = { name: "平台优惠券", list: [] };
      this.DataList.forEach((item) => {
        if (!item.supplier) {
          platform.list.push(item);
          return;
        }
        let group = supplierGroups.find((entry) => entry.name === item.supplier.name);
        if (!group) {
          group = { name: item.supplier.name, list: [] };
          supplierGroups.push(group);
        }
        group.list.push(item);
      });
      supplierGroups.push(platform);
      this.supList = supplierGroups;
    },
    stateFunc(index) {
      if (this.state_active === index)
        return;
      this.state_active = index;
      this.data_type = index === 0 ? "not_use" : index === 1 ? "is_use" : "is_expire";
      this.getData();
    },
    expireText(item) {
      if (item.expire_type === 10)
        return "领取后" + item.expire_day + "天内有效";
      if (item.start_time && item.end_time)
        return item.start_time.text + " - " + item.end_time.text;
      return "长期有效";
    },
    useCoupon(item) {
      if (item.apply_range === 10)
        this.gotoPage("/pages/index/index");
      else
        this.gotoPage("/pages/coupon/detail?coupon_id=" + item.coupon_id + "&apply_range=" + item.apply_range);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.state_active === 0 ? 1 : "",
    b: common_vendor.o(($event) => $options.stateFunc(0), "29"),
    c: $data.state_active === 1 ? 1 : "",
    d: common_vendor.o(($event) => $options.stateFunc(1), "98"),
    e: $data.state_active === 2 ? 1 : "",
    f: common_vendor.o(($event) => $options.stateFunc(2), "3a"),
    g: common_vendor.f($data.supList, (group, k0, i0) => {
      return common_vendor.e({
        a: group.name && group.list.length
      }, group.name && group.list.length ? {
        b: common_vendor.t(group.name)
      } : {}, {
        c: common_vendor.f(group.list, (item, k1, i1) => {
          return common_vendor.e({
            a: common_vendor.t(item.name),
            b: common_vendor.t($options.expireText(item)),
            c: common_vendor.t(Number(item.min_price) > 0 ? "满" + Number(item.min_price) + "元可用" : "无门槛"),
            d: item.coupon_type && item.coupon_type.value === 10
          }, item.coupon_type && item.coupon_type.value === 10 ? {
            e: common_vendor.t(Number(item.reduce_price))
          } : item.coupon_type && item.coupon_type.value === 20 ? {
            g: common_vendor.t(Number(item.discount) / 10)
          } : {}, {
            f: item.coupon_type && item.coupon_type.value === 20,
            h: !item.is_expire && !item.is_use
          }, !item.is_expire && !item.is_use ? {
            i: common_vendor.o(($event) => $options.useCoupon(item), item.user_coupon_id || item.coupon_id)
          } : {}, {
            j: item.user_coupon_id || item.coupon_id,
            k: item.is_expire || item.is_use ? 1 : ""
          });
        }),
        d: group.name
      });
    }),
    h: $data.DataList.length === 0 && !$data.loading
  }, $data.DataList.length === 0 && !$data.loading ? {} : {}, {
    i: _ctx.theme && _ctx.theme()
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0e5d7265"]]);
wx.createPage(MiniProgramPage);
