"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      order_no: 0,
      detail: {
        order_status: {},
        address: { region: [] },
        product: [],
        pay_type: {},
        delivery_type: {},
        pay_status: {},
        delivery_status: {}
      },
      extractStore: {},
      eventChannel: null
    };
  },
  computed: {
    storeAddress() {
      const region = this.extractStore.region || {};
      return `${region.province || ""}${region.city || ""}${region.region || ""}${this.extractStore.address || ""}`;
    },
    canExtract() {
      return this.detail.order_status && this.detail.order_status.value !== 20 && this.detail.pay_status && this.detail.pay_status.value === 20 && this.detail.delivery_type && this.detail.delivery_type.value === 20 && this.detail.delivery_status && this.detail.delivery_status.value === 10;
    }
  },
  onLoad(query = {}) {
    this.order_no = query.order_no || 0;
  },
  mounted() {
    this.getData();
    if (typeof this.getOpenerEventChannel === "function") {
      this.eventChannel = this.getOpenerEventChannel();
    }
  },
  methods: {
    getData() {
      if (typeof this._StorePost !== "function") {
        return;
      }
      common_vendor.index.showLoading({ title: "加载中" });
      this._StorePost("store.order/detail", { order_no: this.order_no }, (res) => {
        this.detail = res.data && res.data.order || this.detail;
        this.extractStore = this.detail.extractStore || {};
        common_vendor.index.hideLoading();
      });
    },
    onSubmitExtract(orderId) {
      if (typeof this._StorePost !== "function")
        return;
      common_vendor.index.showModal({
        title: "提示",
        content: "您确定要核销吗?",
        success: (modal) => {
          if (!modal.confirm)
            return;
          this._StorePost("store.order/extract", { order_id: orderId }, (res) => {
            common_vendor.index.showToast({ title: res.msg || "核销成功", duration: 2e3, icon: "success" });
            if (this.eventChannel && this.eventChannel.emit)
              this.eventChannel.emit("extractSuccess");
            setTimeout(() => this.getData(), 2e3);
          });
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.detail.state_text || "订单核销"),
    b: $data.detail.delivery_type && $data.detail.delivery_type.value === 20
  }, $data.detail.delivery_type && $data.detail.delivery_type.value === 20 ? {
    c: common_vendor.t($data.extractStore.store_name),
    d: common_vendor.t($data.extractStore.phone),
    e: common_vendor.t($options.storeAddress)
  } : {}, {
    f: common_vendor.f($data.detail.product, (item, k0, i0) => {
      return {
        a: item.image && item.image.file_path,
        b: common_vendor.t(item.product_name),
        c: common_vendor.t(item.product_price),
        d: common_vendor.t(item.total_num),
        e: item.order_product_id || item.product_id
      };
    }),
    g: common_vendor.t($data.detail.order_no),
    h: common_vendor.t($data.detail.create_time),
    i: common_vendor.t($data.detail.pay_type && $data.detail.pay_type.text),
    j: common_vendor.t($data.detail.delivery_type && $data.detail.delivery_type.text),
    k: common_vendor.t($data.detail.order_price),
    l: common_vendor.t($data.detail.express_price),
    m: $options.canExtract
  }, $options.canExtract ? {
    n: common_vendor.o(($event) => $options.onSubmitExtract($data.detail.order_id), "85")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-eaf72adf"]]);
wx.createPage(MiniProgramPage);
