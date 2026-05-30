"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  name: "DiyNavBar",
  props: { itemData: { type: Object, default: () => ({}) } },
  data() {
    return {
      qrcode: "",
      qrText: ""
    };
  },
  computed: {
    dataList() {
      return Array.isArray(this.itemData.data) ? this.itemData.data : [];
    },
    styleConfig() {
      return this.itemData.style || {};
    },
    itemWidth() {
      const rows = Math.abs(Number(this.styleConfig.rowsNum || 4)) || 4;
      return `${100 / rows}%`;
    },
    wrapperPadding() {
      const s = this.styleConfig;
      return `${this.toRpx(s.paddingTop)} ${this.toRpx(s.paddingLeft)} ${this.toRpx(s.paddingBottom)} ${this.toRpx(s.paddingLeft)}`;
    },
    navStyle() {
      const s = this.styleConfig;
      const top = 2 * Number(s.topRadio || 0);
      const bottom = 2 * Number(s.bottomRadio || 0);
      return `background:${s.background || ""};border-radius:${top}rpx ${top}rpx ${bottom}rpx ${bottom}rpx;`;
    }
  },
  methods: {
    toRpx(value) {
      return `${2 * Number(value || 0)}rpx`;
    },
    gotoDetail(item) {
      const text = item && item.text;
      if (text === "提货码")
        return this.openCode("提货码", "user.qrCode/getExtractGoodsCode", "/pages/branch/scanWrittenCode");
      if (text === "时长码")
        return this.openCode("时长码", "user.qrCode/getWatchTimeCode", "/pages/branch/scanWrittenCode");
      if (text === "兑换码")
        return this.openCode("兑换码", "user.qrCode/getRoomStoreCouponCode", "/pages/branch/welfareVoucher");
      if (text === "积分码")
        return this.openCode("积分码", "user.qrCode/getPointCode", "/pages/branch/pointDetail");
      if (text === "红包码")
        return this.openCode("红包码", "user.qrCode/getRedPackCode", "/pages/branch/moneyDetail");
      if (text === "门店管理") {
        this.gotoPage(common_vendor.index.getStorageSync("branchToken") ? "/pages/branch/index" : "/pages/branch/login");
        return;
      }
      if (item && item.linkUrl && typeof this.gotoPage === "function")
        this.gotoPage(item.linkUrl);
    },
    openCode(text, endpoint, url) {
      if (typeof this._get !== "function")
        return;
      this.qrText = text;
      this._get(endpoint, { url }, (res) => {
        if (res.code === 1) {
          this.qrcode = res.data.content;
          this.$refs.qrCodeRef && this.$refs.qrCodeRef.open();
        }
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  _easycom_uni_popup();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($options.dataList, (item, index, i0) => {
      return {
        a: item.imgUrl,
        b: common_vendor.t(item.text),
        c: common_vendor.s(`color:${item.color || ""};`),
        d: index,
        e: common_vendor.o(($event) => $options.gotoDetail(item), index)
      };
    }),
    b: common_vendor.s(`width:${$options.itemWidth};`),
    c: common_vendor.s($options.navStyle),
    d: common_vendor.s(`background:${$options.styleConfig.bgcolor};padding:${$options.wrapperPadding};`),
    e: $data.qrcode,
    f: common_vendor.t($data.qrText),
    g: common_vendor.sr("qrCodeRef", "f5977733-0"),
    h: common_vendor.p({
      type: "center",
      ["background-color"]: "#fff",
      ["border-radius"]: "20px 20px 20px 20px"
    })
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f5977733"]]);
wx.createComponent(Component);
