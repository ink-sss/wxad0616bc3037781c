"use strict";
const common_vendor = require("../../common/vendor.js");
const services_localCart = require("../../services/local-cart.js");
const RecommendProduct = () => "../../components/recommendProduct/recommendProduct.js";
const RequestLoading = () => "../../components/liveloading.js";
const TabBar = () => "../../components/tabbar/footTabbar.js";
const _sfc_main = {
  components: {
    RecommendProduct,
    RequestLoading,
    TabBar
  },
  data() {
    return {
      isloadding: true,
      loadding: true,
      isEdit: false,
      tableData: [],
      arrIds: [],
      checkedAll: false,
      totalPrice: 0,
      totalProduct: 0,
      store_open: 1,
      totalNum: 0
    };
  },
  onReady() {
    common_vendor.index.hideTabBar();
  },
  onShow() {
    this.getData();
  },
  methods: {
    getData() {
      this.isloadding = true;
      const summary = services_localCart.getLocalCartSummary();
      this.isloadding = false;
      this.tableData = summary.productList || [];
      this.store_open = 0;
      this.totalNum = summary.totalNum;
      this.tableData.forEach((supplier) => {
        supplier.checked = false;
      });
      this.loadding = false;
      this._initGoodsChecked();
    },
    _initGoodsChecked() {
      const checkedIds = this.getCheckedData();
      let count = 0;
      this.tableData.forEach((supplier, supplierIndex) => {
        supplier.productList.forEach((item) => {
          count++;
          item.checked = this.inArray(`${item.cart_id}`, checkedIds);
        });
        this.onUpsupChecked(this.tableData, supplierIndex);
      });
      this.totalProduct = count;
      this.isEdit = false;
      this.checkedAll = checkedIds.length === this.totalProduct;
      this.updateTotalPrice();
    },
    getCheckedData() {
      return common_vendor.index.getStorageSync("CheckedData") || [];
    },
    checkItem(item, supplierIndex, productIndex) {
      item.checked = !item.checked;
      this.tableData[supplierIndex].productList.splice(productIndex, 1, item);
      this.onUpsupChecked(this.tableData, supplierIndex);
      this.onUpdateChecked();
      this.updateTotalPrice();
      this.checkedAll = this.getCheckedData().length === this.totalProduct;
    },
    onUpsupChecked(tableData, supplierIndex) {
      let checked = true;
      for (let i = 0; i < tableData[supplierIndex].productList.length; i++) {
        if (!tableData[supplierIndex].productList[i].checked)
          checked = false;
      }
      tableData[supplierIndex].checked = checked;
    },
    onUpdateChecked() {
      const checkedIds = [];
      this.tableData.forEach((supplier) => {
        supplier.productList.forEach((item) => {
          if (item.checked === true)
            checkedIds.push(`${item.cart_id}`);
        });
      });
      common_vendor.index.setStorageSync("CheckedData", checkedIds);
    },
    checkStprItem(supplierItem) {
      supplierItem.checked = !supplierItem.checked;
      supplierItem.productList.forEach((item) => {
        item.checked = supplierItem.checked;
      });
      this.updateTotalPrice();
      this.onUpdateChecked();
      this.checkedAll = this.getCheckedData().length === this.totalProduct;
    },
    onCheckedAll() {
      this.checkedAll = !this.checkedAll;
      this.tableData.forEach((supplier) => {
        supplier.checked = this.checkedAll;
        supplier.productList.forEach((item) => {
          item.checked = this.checkedAll;
        });
      });
      this.updateTotalPrice();
      this.onUpdateChecked();
    },
    updateTotalPrice() {
      let total = 0;
      this.tableData.forEach((supplier) => {
        supplier.productList.forEach((item) => {
          if (item.checked === true)
            total += item.total_num * item.product_price;
        });
      });
      this.totalPrice = total.toFixed(2);
    },
    Submit() {
      common_vendor.index.showToast({ title: "购物车暂不支持结算", icon: "none" });
    },
    addFunc(item) {
      services_localCart.incrementLocalCartItem(item);
      this.getData();
    },
    reduceFunc(item) {
      if (item.total_num <= 1)
        return;
      services_localCart.decrementLocalCartItem(item);
      this.getData();
    },
    onDelete() {
      const ids = this.getCheckedIds();
      if (!ids.length) {
        this.showError("您还没有选择商品");
        return false;
      }
      common_vendor.index.showModal({
        title: "提示",
        content: "您确定要移除选择的商品吗?",
        success: (modal) => {
          if (modal.confirm) {
            services_localCart.removeLocalCartItems(ids);
            this.getData();
          }
        }
      });
    },
    getCheckedIds() {
      const ids = [];
      this.tableData.forEach((supplier) => {
        supplier.productList.forEach((item) => {
          if (item.checked === true)
            ids.push(`${item.cart_id}`);
        });
      });
      return ids;
    },
    onDeleteEvent(ids) {
      ids.forEach((id) => {
        this.tableData.forEach((supplier, supplierIndex) => {
          if (id === `${supplier.cart_id}`)
            this.tableData.splice(supplierIndex, 1);
        });
      });
      this.$nextTick(() => {
        this.onUpdateChecked();
      });
      return true;
    },
    inArray(value, list) {
      for (const index in list) {
        if (list[index] === value)
          return true;
      }
      return false;
    },
    gotoShop() {
      this.gotoPage("/pages/index/index");
    }
  }
};
if (!Array) {
  const _component_recommend_product = common_vendor.resolveComponent("recommend-product");
  const _component_request_loading = common_vendor.resolveComponent("request-loading");
  const _component_tab_bar = common_vendor.resolveComponent("tab-bar");
  (_component_recommend_product + _component_request_loading + _component_tab_bar)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$data.loadding
  }, !$data.loadding ? common_vendor.e({
    b: $data.totalNum > 0
  }, $data.totalNum > 0 ? common_vendor.e({
    c: common_vendor.t($data.totalNum || 0),
    d: $data.isEdit
  }, $data.isEdit ? {} : {}, {
    e: common_vendor.o(($event) => $data.isEdit = !$data.isEdit, "15"),
    f: common_vendor.f($data.tableData, (supplierItem, supplierIndex, i0) => {
      return common_vendor.e({
        a: supplierItem.checked,
        b: common_vendor.o(($event) => $options.checkStprItem(supplierItem, supplierIndex), supplierIndex)
      }, $data.store_open ? {
        c: common_vendor.t(supplierItem.supplier.name),
        d: common_vendor.o(($event) => _ctx.gotoPage("/pages/shop/shop?shop_supplier_id=" + supplierItem.supplier.shop_supplier_id), supplierIndex)
      } : {}, {
        e: common_vendor.f(supplierItem.productList, (item, productIndex, i1) => {
          return common_vendor.e({
            a: item.checked,
            b: common_vendor.o(($event) => $options.checkItem(item, supplierIndex, productIndex), item.cart_id || productIndex),
            c: item.product_image,
            d: common_vendor.o(($event) => _ctx.gotoPage("/pages/product/detail/detail?product_id=" + item.product_id), item.cart_id || productIndex),
            e: common_vendor.t(item.product_name),
            f: common_vendor.t(item.product_sku && item.product_sku.product_attr),
            g: common_vendor.t(item.product_price),
            h: item.total_num > 1
          }, item.total_num > 1 ? {} : {}, {
            i: common_vendor.o(($event) => $options.reduceFunc(item), item.cart_id || productIndex),
            j: common_vendor.t(item.total_num),
            k: item.product_sku && item.total_num < item.product_sku.stock_num
          }, item.product_sku && item.total_num < item.product_sku.stock_num ? {
            l: common_vendor.o(($event) => $options.addFunc(item), item.cart_id || productIndex)
          } : {}, {
            m: item.cart_id || productIndex
          });
        }),
        f: supplierIndex
      });
    }),
    g: $data.store_open
  }) : {
    h: _ctx.config.pic_url + "/list-null.png",
    i: common_vendor.o((...args) => $options.gotoShop && $options.gotoShop(...args), "b4")
  }, {
    j: $data.totalNum > 0
  }, $data.totalNum > 0 ? common_vendor.e({
    k: $data.checkedAll,
    l: common_vendor.o((...args) => $options.onCheckedAll && $options.onCheckedAll(...args), "af"),
    m: !$data.isEdit
  }, !$data.isEdit ? {
    n: common_vendor.t($data.totalPrice)
  } : {
    o: common_vendor.o((...args) => $options.onDelete && $options.onDelete(...args), "a4")
  }) : {}, {
    p: $data.totalNum > 0
  }, $data.totalNum > 0 ? {
    q: common_vendor.p({
      location: 10
    })
  } : {}, {
    r: $data.totalNum > 0 ? 1 : ""
  }) : {}, {
    s: $data.isloadding
  }, $data.isloadding ? {
    t: common_vendor.p({
      loadding: $data.isloadding
    })
  } : {}, {
    v: _ctx.theme && _ctx.theme()
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-fb6ea9e5"]]);
wx.createPage(MiniProgramPage);
