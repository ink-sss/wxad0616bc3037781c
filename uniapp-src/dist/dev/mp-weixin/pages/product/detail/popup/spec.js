"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("../../../../common/vendor.js");
const services_localCart = require("../../../../services/local-cart.js");
function cloneFallbackModel() {
  return {
    detail: { image: [{ file_path: "" }], product_stock: 0, product_price: 0, line_price: 0 },
    show_sku: { sku_image: "", sum: 1, stock_num: 0 },
    specData: null,
    productSpecArr: [],
    type: "",
    plus_sku: null,
    plus_name: ""
  };
}
const _sfc_main = {
  props: {
    isPopup: Boolean,
    productModel: {
      type: Object,
      default: cloneFallbackModel
    },
    room_id: {
      type: [String, Number],
      default: ""
    },
    roomCode: {
      type: [String, Number],
      default: ""
    },
    termId: {
      type: [String, Number],
      default: ""
    },
    tenantId: {
      type: [String, Number],
      default: ""
    },
    shareCode: {
      type: [String, Number],
      default: ""
    },
    specDisabled: Boolean,
    isCategory: Boolean
  },
  data() {
    return {
      Visible: false,
      form: cloneFallbackModel(),
      stock: 0,
      selectSpec: "",
      isOpenSpec: false,
      type: "",
      clock: false,
      isAll: false
    };
  },
  computed: {
    isadd() {
      return this.form.show_sku.sum >= this.stock || this.form.show_sku.sum >= this.form.detail.limit_num;
    },
    issub() {
      return this.form.show_sku.sum <= 1;
    }
  },
  watch: {
    isPopup(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.Visible = newValue;
        if (!this.isOpenSpec || this.isOpenSpec && this.isCategory) {
          this.form = this.productModel || cloneFallbackModel();
          this.isOpenSpec = true;
          this.initShowSku();
        }
        this.form.type = this.productModel.type;
      }
    },
    "form.specData": {
      handler(specData) {
        let unselected = "";
        let selected = "";
        this.isAll = true;
        if (specData) {
          for (let index = 0; index < specData.spec_attr.length; index++) {
            if (this.form.productSpecArr[index] == null) {
              this.isAll = false;
              unselected += specData.spec_attr[index].group_name + " ";
            } else {
              specData.spec_attr[index].spec_items.forEach((item) => {
                if (this.form.productSpecArr[index] === item.item_id)
                  selected += '"' + item.spec_value + '" ';
              });
            }
          }
          this.selectSpec = this.isAll ? "已选: " + selected : "请选择: " + unselected;
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    initShowSku() {
      this.form.show_sku.sku_image = this.form.detail.image[0].file_path;
      this.form.show_sku.product_price = this.form.detail.product_price;
      if (this.form.detail.spec_type === 20 && this.form.detail.product_price !== this.form.detail.product_max_price) {
        this.form.show_sku.product_price = this.form.detail.product_price + "-" + this.form.detail.product_max_price;
      }
      this.form.show_sku.spec_sku_id = 0;
      this.form.show_sku.line_price = this.form.detail.line_price;
      this.form.show_sku.stock_num = this.form.detail.product_stock;
      this.stock = this.form.detail.product_stock;
      if (this.form.plus_name === "advance") {
        this.form.show_sku.product_price = this.form.plus_sku[0].product_price;
        this.form.show_sku.line_price = "";
        this.form.show_sku.sku_image = this.form.plus_sku[0].productSku.image ? this.form.plus_sku[0].productSku.image.file_path : this.form.detail.image[0].file_path;
        this.form.show_sku.stock_num = this.form.plus_sku[0].advance_stock;
        this.stock = this.form.plus_sku[0].advance_stock;
      }
      if (this.form.plus_name === "seckill") {
        this.form.show_sku.product_price = this.form.plus_sku[0].seckill_price;
        this.form.show_sku.line_price = this.form.plus_sku[0].product_price;
        this.form.show_sku.sku_image = this.form.plus_sku[0].productSku.image ? this.form.plus_sku[0].productSku.image.file_path : this.form.detail.image[0].file_path;
        this.form.show_sku.stock_num = this.form.plus_sku[0].seckill_stock;
        this.stock = this.form.plus_sku[0].seckill_stock;
      }
    },
    selectAttr(attrIndex, itemIndex) {
      const items = this.form.specData.spec_attr[attrIndex].spec_items;
      const item = items[itemIndex];
      if (item.checked) {
        item.checked = false;
        this.form.productSpecArr[attrIndex] = null;
      } else {
        items.forEach((specItem) => {
          specItem.checked = false;
        });
        item.checked = true;
        this.form.productSpecArr[attrIndex] = item.item_id;
      }
      for (let i = 0; i < this.form.productSpecArr.length; i++) {
        if (this.form.productSpecArr[i] == null) {
          this.initShowSku();
          return;
        }
      }
      this.updateSpecProduct();
    },
    updateSpecProduct() {
      const specSkuId = this.form.productSpecArr.join("_");
      let specList = this.form.specData.spec_list;
      if (this.form.plus_sku != null)
        specList = this.form.plus_sku;
      const spec = specList.find((item) => this.form.plus_name ? item.productSku.spec_sku_id === specSkuId : item.spec_sku_id === specSkuId);
      if (!spec) {
        this.clock = true;
        this.initShowSku();
        return;
      }
      this.clock = false;
      if (this.form.plus_name && !spec.spec_form)
        spec.spec_form = spec.productSku;
      if (typeof spec === "object") {
        if (this.form.plus_name) {
          this.stock = spec[this.form.plus_name + "_stock"];
          if (this.form.show_sku.sum > this.stock)
            this.form.show_sku.sum = this.stock > 0 ? this.stock : 1;
        } else {
          this.stock = spec.spec_form.stock_num;
          if (this.form.show_sku.sum > this.stock)
            this.form.show_sku.sum = this.stock > 0 ? this.stock : 1;
        }
        this.form.show_sku.spec_sku_id = specSkuId;
        this.form.show_sku.product_price = spec.spec_form.product_price;
        this.form.show_sku.line_price = spec.spec_form.line_price;
        this.form.show_sku.product_weight = spec.spec_form.product_weight;
        this.form.show_sku.sku_image = spec.spec_form.image_id > 0 ? spec.spec_form.image_path : this.form.detail.image[0].file_path;
        this.form.show_sku.stock_num = spec.spec_form.stock_num;
        if (this.form.plus_name) {
          this.form.show_sku.product_price = spec.product_price;
          if (this.form.plus_name === "seckill")
            this.form.show_sku.product_price = spec.seckill_price;
          this.form.show_sku.stock_num = spec[this.form.plus_name + "_stock"];
          this.form.show_sku.line_price = "";
          this.form.show_sku.sku_image = spec.spec_form.image ? spec.spec_form.image.file_path : this.form.detail.image[0].file_path;
          this.form.show_sku.advance_product_id = spec.spec_form.image ? spec.spec_form.image.file_path : this.form.detail.image[0].file_path;
        }
      }
    },
    closePopup() {
      this.$emit("close", this.form.specData, null);
    },
    buildLiveQuery() {
      const params = [];
      if (this.room_id !== 0 && this.room_id !== "") {
        params.push(["roomId", this.room_id]);
        params.push(["room_id", this.room_id]);
        params.push(["liveRoomId", this.room_id]);
        params.push(["live_room_id", this.room_id]);
      }
      if (this.roomCode !== "") {
        params.push(["roomCode", this.roomCode]);
        params.push(["room_code", this.roomCode]);
      }
      if (this.termId !== 0 && this.termId !== "") {
        params.push(["termId", this.termId]);
        params.push(["term_id", this.termId]);
        params.push(["liveTermId", this.termId]);
        params.push(["live_term_id", this.termId]);
      }
      if (this.tenantId !== 0 && this.tenantId !== "") {
        params.push(["tenantId", this.tenantId]);
        params.push(["tenant_id", this.tenantId]);
      }
      if (this.shareCode !== "") {
        params.push(["shareCode", this.shareCode]);
        params.push(["share_code", this.shareCode]);
      }
      return params.filter(([, value]) => value !== void 0 && value !== null && value !== "").map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`).join("&");
    },
    confirmFunc() {
      if (this.form.specData != null) {
        for (let index = 0; index < this.form.productSpecArr.length; index++) {
          if (this.form.productSpecArr[index] == null) {
            common_vendor.index.showToast({ title: "请选择规格", icon: "none", duration: 2e3 });
            return;
          }
        }
      }
      if (this.form.type === "card")
        this.addCart();
      else
        this.createdOrder();
    },
    addCart() {
      const productId = this.form.detail.product_id;
      const totalNum = this.form.show_sku.sum;
      const specSkuId = this.form.show_sku.spec_sku_id;
      if (this.form.detail.spec_type === 20 && specSkuId === 0) {
        common_vendor.index.showToast({ title: "请选择属性", icon: "none", duration: 2e3 });
        return false;
      }
      const summary = services_localCart.addLocalCartItem({
        ...this.form.detail,
        product_id: productId,
        product_name: this.form.detail.product_name,
        product_image: this.form.show_sku.sku_image,
        product_price: this.form.show_sku.product_price,
        line_price: this.form.show_sku.line_price,
        stock_num: this.form.show_sku.stock_num,
        spec_sku_id: specSkuId,
        product_attr: this.selectSpec.replace(/^已选:\s*/, "")
      }, totalNum);
      common_vendor.index.showToast({ title: "已加入购物车", duration: 2e3 });
      this.$emit("close", null, summary.totalNum);
    },
    createdOrder() {
      const productId = this.form.detail.product_id;
      const totalNum = this.form.show_sku.sum;
      const specSkuId = this.form.show_sku.spec_sku_id;
      const liveQuery = this.buildLiveQuery();
      const livePart = liveQuery ? `&${liveQuery}` : "";
      let url = `/pages/order/confirm?product_id=${productId}&productId=${productId}&product_num=${totalNum}&quantity=${totalNum}&product_sku_id=${specSkuId}&skuId=${specSkuId}&order_type=buy${livePart}`;
      if (this.form.type === "deposit") {
        if (this.form.plus_name === "advance") {
          const advanceSku = this.form.detail.advance.sku.find((item) => item.productSku.spec_sku_id === specSkuId);
          url = `/pages/order/confirm?product_id=${productId}&productId=${productId}&product_num=${totalNum}&quantity=${totalNum}&product_sku_id=${specSkuId}&skuId=${specSkuId}&advance_product_sku_id=${advanceSku.advance_product_sku_id}&advance_product_id=${advanceSku.advance_product_id}&order_type=deposit${livePart}`;
        }
        if (this.form.plus_name === "seckill") {
          const seckillSku = this.form.plus_sku.find((item) => item.productSku.spec_sku_id === specSkuId);
          url = `/pages/order/confirm?seckill_product_id=${seckillSku.seckill_product_id}&product_num=${totalNum}&quantity=${totalNum}&time_id=${this.form.time_id}&product_sku_id=${seckillSku.productSku.spec_sku_id}&skuId=${seckillSku.productSku.spec_sku_id}&seckill_product_sku_id=${seckillSku.seckill_product_sku_id}&order_type=seckill${livePart}`;
        }
      }
      this.gotoPage(url);
    },
    add() {
      if (this.stock <= 0)
        return;
      if (this.form.plus_name === "seckill" && this.form.detail.single_num > 0 && this.form.show_sku.sum >= this.form.detail.single_num) {
        common_vendor.index.showToast({ title: "数量超过了限购数量", icon: "none", duration: 2e3 });
        return false;
      }
      if (this.form.show_sku.sum >= this.stock) {
        common_vendor.index.showToast({ title: "数量超过了库存", icon: "none", duration: 2e3 });
        return false;
      }
      if (this.form.detail.limit_num > 0 && this.form.show_sku.sum >= this.form.detail.limit_num) {
        common_vendor.index.showToast({ title: "数量超过了限购数量", icon: "none", duration: 2e3 });
        return false;
      }
      this.form.show_sku.sum++;
    },
    sub() {
      if (this.stock <= 0)
        return;
      if (this.form.plus_name !== "seckill" && this.form.detail.single_num > 0 && this.form.show_sku.sum <= this.form.detail.single_num) {
        common_vendor.index.showToast({ title: `该商品数量${this.form.detail.single_num}起购`, icon: "none", duration: 2e3 });
        return false;
      }
      if (this.form.show_sku.sum < 2) {
        common_vendor.index.showToast({ title: "商品数量至少为1", icon: "none", duration: 2e3 });
        return false;
      }
      this.form.show_sku.sum--;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.form.show_sku.sku_image,
    b: common_vendor.o(($event) => _ctx.yulan($data.form.show_sku.sku_image, 0), "3c"),
    c: common_vendor.t($data.form.show_sku.product_price),
    d: Number($data.form.show_sku.line_price) > 0
  }, Number($data.form.show_sku.line_price) > 0 ? {
    e: common_vendor.t($data.form.show_sku.line_price)
  } : {}, {
    f: common_vendor.t($data.form.show_sku.stock_num),
    g: common_vendor.t($data.selectSpec),
    h: $data.isAll && $data.form.show_sku.product_weight > 0
  }, $data.isAll && $data.form.show_sku.product_weight > 0 ? {
    i: common_vendor.t($data.form.show_sku.product_weight)
  } : {}, {
    j: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args), "d2"),
    k: $data.form.specData != null
  }, $data.form.specData != null ? {
    l: common_vendor.f($data.form.specData.spec_attr, (attr, attrIndex, i0) => {
      return {
        a: common_vendor.t(attr.group_name),
        b: common_vendor.f(attr.spec_items, (item, itemIndex, i1) => {
          return {
            a: common_vendor.t(item.spec_value),
            b: item.item_id || itemIndex,
            c: common_vendor.n(item.checked ? "btn-checked" : "btn-checke"),
            d: common_vendor.o(($event) => $options.selectAttr(attrIndex, itemIndex), item.item_id || itemIndex)
          };
        }),
        c: attrIndex
      };
    })
  } : {}, {
    m: $data.form.detail.single_num > 0
  }, $data.form.detail.single_num > 0 ? {
    n: common_vendor.t($data.form.detail.single_num),
    o: common_vendor.t($data.form.plus_name === "seckill" ? "限购" : "起售")
  } : {}, {
    p: $options.issub ? 1 : "",
    q: common_vendor.o((...args) => $options.sub && $options.sub(...args), "08"),
    r: $data.form.show_sku.sum,
    s: common_vendor.o(($event) => $data.form.show_sku.sum = $event.detail.value, "4a"),
    t: $options.isadd ? 1 : "",
    v: common_vendor.o((...args) => $options.add && $options.add(...args), "aa"),
    w: $props.specDisabled
  }, $props.specDisabled ? {} : !$data.clock ? {
    y: common_vendor.o((...args) => $options.confirmFunc && $options.confirmFunc(...args), "ab")
  } : {}, {
    x: !$data.clock,
    z: common_vendor.o(() => {
    }, "9c"),
    A: common_vendor.n($data.Visible ? "product-popup open" : "product-popup close"),
    B: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args), "da")
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b02e36fd"]]);
exports.default = Component;
