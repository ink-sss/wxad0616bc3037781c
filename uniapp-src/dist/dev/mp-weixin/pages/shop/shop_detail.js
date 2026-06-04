"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      shop_supplier_id: "",
      shopData: {},
      isfollow: "",
      showModal: false
    };
  },
  computed: {
    defaultLogo() {
      return (this.config && this.config.pic_url ? this.config.pic_url : "") + "/shop-default.png";
    }
  },
  onLoad(query = {}) {
    this.shop_supplier_id = query.shop_supplier_id;
  },
  onShow() {
    this.getData();
  },
  methods: {
    openClick() {
      this.showModal = true;
    },
    cancelAction() {
      this.showModal = false;
    },
    guanzhu() {
      if (typeof this._post !== "function")
        return;
      this._post("user.Favorite/add", { pid: this.shop_supplier_id, type: 10 }, () => {
        this.isfollow = this.isfollow ? 0 : 1;
      });
    },
    clickFunc() {
      const url = "/pages/shop/shop?shop_supplier_id=" + this.shop_supplier_id;
      if (typeof this.gotoPage === "function")
        this.gotoPage(url);
      else
        common_vendor.index.navigateTo({ url });
    },
    getData() {
      if (typeof this._get !== "function") {
        return;
      }
      this._get("supplier.Index/detail", { shop_supplier_id: this.shop_supplier_id }, (res) => {
        this.shopData = res.data && res.data.detail || {};
        this.isfollow = this.shopData.isfollow;
      });
    },
    preview(url) {
      if (!url)
        return;
      common_vendor.index.previewImage({ urls: [url], current: url });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.shopData.logos || $options.defaultLogo,
    b: common_vendor.t($data.shopData.store_name),
    c: common_vendor.t($data.shopData.server_score || 0),
    d: common_vendor.t($data.shopData.fav_count || 0),
    e: common_vendor.t($data.isfollow ? "已关注" : "+关注"),
    f: common_vendor.o((...args) => $options.guanzhu && $options.guanzhu(...args), "95"),
    g: common_vendor.t($data.shopData.description || "暂无内容"),
    h: common_vendor.o((...args) => $options.openClick && $options.openClick(...args), "23"),
    i: common_vendor.t($data.shopData.address),
    j: common_vendor.t($data.shopData.create_time),
    k: common_vendor.t($data.shopData.status === 0 ? "营业中" : "休息中"),
    l: $data.shopData.business_image
  }, $data.shopData.business_image ? {
    m: $data.shopData.business_image,
    n: common_vendor.o(($event) => $options.preview($data.shopData.business_image), "00")
  } : {}, {
    o: common_vendor.o((...args) => $options.clickFunc && $options.clickFunc(...args), "be"),
    p: $data.showModal
  }, $data.showModal ? {
    q: common_vendor.t($data.shopData.description || "暂无内容"),
    r: common_vendor.o((...args) => $options.cancelAction && $options.cancelAction(...args), "d4"),
    s: common_vendor.o(() => {
    }, "7e"),
    t: common_vendor.o((...args) => $options.cancelAction && $options.cancelAction(...args), "ca")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d44e67ef"]]);
wx.createPage(MiniProgramPage);
