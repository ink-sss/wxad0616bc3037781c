"use strict";
const common_vendor = require("../../../common/vendor.js");
const pages_user_pageTools = require("../page-tools.js");
const _sfc_main = {
  data() {
    return {
      loadding: true,
      withdraw_type: 10,
      payType: [],
      money: "",
      clock: false,
      cash_ratio: 0,
      overMoney: "0.00",
      balance: "",
      form: {},
      min_money: ""
    };
  },
  watch: {
    money() {
      this.overMoney = this.overprice();
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    payTypeText(type) {
      return { 10: "微信", 20: "支付宝", 30: "银行卡", 40: "微信零钱" }[type] || "提现";
    },
    typeFunc(type) {
      this.withdraw_type = type;
    },
    getData() {
      common_vendor.index.showLoading({ title: "加载中" });
      this.loadding = true;
      this._get(
        "user.cash/index",
        { platform: this.getPlatform() },
        (res) => {
          const bankInfo = res.data.bankInfo;
          if (bankInfo) {
            this.form.bank_account = bankInfo.bank_account;
            this.form.bank_card = bankInfo.bank_card;
            this.form.bank_name = bankInfo.bank_name;
          }
          this.min_money = res.data.min_money;
          this.balance = res.data.balance;
          this.cash_ratio = res.data.cash_ratio;
          this.payType = res.data.pay_type || [];
          this.withdraw_type = this.payType[0] || 10;
          this.loadding = false;
          common_vendor.index.hideLoading();
        },
        false,
        () => common_vendor.index.hideLoading()
      );
    },
    getAll() {
      this.money = this.balance;
    },
    overprice() {
      const fee = Number(this.money || 0) * Number(this.cash_ratio || 0) / 100;
      return fee.toFixed(2);
    },
    formSubmit() {
      if (this.clock)
        return;
      this.clock = true;
      const form = Object.assign({}, this.form, {
        pay_type: this.withdraw_type,
        money: this.money,
        source: this.getPlatform()
      });
      common_vendor.index.showLoading({ title: "正在提交", mask: true });
      this._post(
        "user.cash/submit",
        { data: JSON.stringify(form) },
        (res) => {
          common_vendor.index.hideLoading();
          if (res.code === 1 && res.data && res.data.package_info) {
            pages_user_pageTools.requestTransfer({
              mchId: res.data.mchid,
              appId: res.data.wx_app_id,
              package: res.data.package_info
            }).then(() => this.submitResult(res.data.out_bill_no, 40)).catch(() => this.submitResult(res.data.out_bill_no, 60));
          } else {
            common_vendor.index.showModal({
              title: "提示",
              content: res.msg,
              showCancel: false,
              success: () => common_vendor.index.navigateBack()
            });
          }
        },
        () => {
          this.clock = false;
          common_vendor.index.hideLoading();
        }
      );
    },
    submitResult(outBillNo, status) {
      this._post("user.cash/submitResult", { out_bill_no: outBillNo, apply_status: status }, () => {
        this.clock = false;
        this.getData();
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.balance || "0.00"),
    b: $data.payType.length > 1
  }, $data.payType.length > 1 ? {
    c: common_vendor.f($data.payType, (type, k0, i0) => {
      return {
        a: common_vendor.t($options.payTypeText(type)),
        b: type,
        c: $data.withdraw_type === type ? 1 : "",
        d: common_vendor.o(($event) => $options.typeFunc(type), type)
      };
    })
  } : {}, {
    d: "最低提现￥" + $data.min_money,
    e: $data.money,
    f: common_vendor.o(($event) => $data.money = $event.detail.value, "15"),
    g: common_vendor.o((...args) => $options.getAll && $options.getAll(...args), "c7"),
    h: $data.withdraw_type === 20
  }, $data.withdraw_type === 20 ? {
    i: $data.form.alipay_name,
    j: common_vendor.o(($event) => $data.form.alipay_name = $event.detail.value, "d7"),
    k: $data.form.alipay_account,
    l: common_vendor.o(($event) => $data.form.alipay_account = $event.detail.value, "fa")
  } : {}, {
    m: $data.withdraw_type === 30
  }, $data.withdraw_type === 30 ? {
    n: $data.form.bank_account,
    o: common_vendor.o(($event) => $data.form.bank_account = $event.detail.value, "09"),
    p: $data.form.bank_card,
    q: common_vendor.o(($event) => $data.form.bank_card = $event.detail.value, "06"),
    r: $data.form.bank_name,
    s: common_vendor.o(($event) => $data.form.bank_name = $event.detail.value, "ec")
  } : {}, {
    t: common_vendor.t($data.balance || "0.00"),
    v: common_vendor.t($data.cash_ratio),
    w: common_vendor.t($data.overMoney),
    x: $data.clock,
    y: common_vendor.o((...args) => $options.formSubmit && $options.formSubmit(...args), "88"),
    z: _ctx.theme && _ctx.theme()
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c9b5b53e"]]);
wx.createPage(MiniProgramPage);
