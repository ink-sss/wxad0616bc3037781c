"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  props: {
    isbottmpanel: Boolean,
    product_id: {
      type: [String, Number],
      default: ""
    }
  },
  data() {
    return {
      Visible: false,
      poster_img: "",
      wechat_share: false
    };
  },
  watch: {
    isbottmpanel(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.wechat_share = false;
        this.Visible = newValue;
      }
    }
  },
  methods: {
    closePopup(type) {
      this.$emit("close", {
        type,
        poster_img: this.poster_img
      });
    },
    share() {
    },
    genePoster() {
      common_vendor.index.showLoading({ title: "加载中" });
      this._get("product.product/poster", {
        product_id: this.product_id,
        source: "wx"
      }, (res) => {
        this.poster_img = res.data.qrcode;
        this.closePopup(2);
      }, null, () => {
        common_vendor.index.hideLoading();
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.wechat_share
  }, $data.wechat_share ? {
    b: _ctx.config.pic_url + "/share.png"
  } : {}, {
    c: common_vendor.o((...args) => $options.share && $options.share(...args), "90"),
    d: common_vendor.o((...args) => $options.genePoster && $options.genePoster(...args), "79"),
    e: common_vendor.o(($event) => $options.closePopup(1), "e8"),
    f: common_vendor.o(() => {
    }, "40"),
    g: common_vendor.n($data.Visible ? "open" : "close"),
    h: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args), "09")
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f1611c4d"]]);
wx.createComponent(Component);
