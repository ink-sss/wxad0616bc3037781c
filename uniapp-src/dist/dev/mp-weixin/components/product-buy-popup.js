"use strict";
const common_vendor = require("../common/vendor.js");
const common_assets = require("../common/assets.js");
if (!Array) {
  const _easycom_wd_popup2 = common_vendor.resolveComponent("wd-popup");
  _easycom_wd_popup2();
}
const _easycom_wd_popup = () => "../node-modules/wot-design-uni/components/wd-popup/wd-popup.js";
if (!Math) {
  (_easycom_wd_popup + CouponSelectPopup)();
}
const CouponSelectPopup = () => "./coupon-select-popup.js";
const _sfc_main = {
  __name: "product-buy-popup",
  props: {
    visible: { type: Boolean, default: false },
    product: { type: Object, default: () => ({}) },
    addressText: { type: String, default: "" },
    addressDetail: { type: Object, default: () => ({}) },
    shippingFee: { type: String, default: "0.00" },
    goodsAmount: { type: String, default: "0.00" },
    totalPrice: { type: String, default: "0.00" },
    discountAmount: { type: String, default: "0.00" },
    remark: { type: String, default: "" },
    loading: { type: Boolean, default: false },
    requireAddress: { type: Number, default: 1 },
    usableCoupons: { type: Array, default: () => [] },
    unusableCoupons: { type: Array, default: () => [] },
    selectedCouponId: { type: Number, default: 0 },
    couponLoading: { type: Boolean, default: false },
    zIndex: { type: Number, default: 1e8 },
    couponZIndex: { type: Number, default: 100000001 }
  },
  emits: [
    "close",
    "confirm",
    "select-address",
    "update:remark",
    "update:quantity",
    "update:sku",
    "select-coupon"
  ],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const popupVisible = common_vendor.computed({
      get: () => props.visible,
      set: (val) => {
        if (!val)
          emit("close");
      }
    });
    const quantity = common_vendor.ref(1);
    const selectedSpecValues = common_vendor.ref({});
    const couponPopupVisible = common_vendor.ref(false);
    const specs = common_vendor.computed(() => props.product.specs || []);
    const skus = common_vendor.computed(() => props.product.skus || []);
    const isMultiSpec = common_vendor.computed(() => props.product.isMultiSpec || 0);
    const currentSku = common_vendor.computed(() => {
      if (!isMultiSpec.value || skus.value.length === 0) {
        return skus.value.length === 1 ? skus.value[0] : null;
      }
      const selectedVals = selectedSpecValues.value;
      if (Object.keys(selectedVals).length < specs.value.length)
        return null;
      const selectedIds = Object.values(selectedVals).map((val) => {
        for (const spec of specs.value) {
          const found = (spec.values || []).find((sv) => sv.value === val);
          if (found)
            return found.id;
        }
        return null;
      }).filter(Boolean).sort((a, b) => a - b);
      if (selectedIds.length > 0) {
        const key = selectedIds.join(",");
        const matched = skus.value.find(
          (s) => s.specValueIds && String(s.specValueIds) === key
        );
        if (matched)
          return matched;
      }
      const selectedTexts = specs.value.map((g) => selectedVals[g.name]).filter(Boolean);
      if (selectedTexts.length === specs.value.length) {
        const textKey = selectedTexts.join(",");
        const matched = skus.value.find(
          (s) => s.specText && s.specText === textKey
        );
        if (matched)
          return matched;
        const textKey2 = selectedTexts.join(" ");
        const matched2 = skus.value.find(
          (s) => s.specText && s.specText === textKey2
        );
        if (matched2)
          return matched2;
      }
      return null;
    });
    const displayPrice = common_vendor.computed(() => {
      var _a;
      if (currentSku.value)
        return (_a = currentSku.value.salePrice) == null ? void 0 : _a.toFixed(2);
      if (isMultiSpec.value && skus.value.length > 0) {
        const prices = skus.value.map((s) => s.salePrice).filter((p) => p > 0);
        if (prices.length > 0)
          return Math.min(...prices).toFixed(2);
      }
      return props.product.priceMin ? Number(props.product.priceMin).toFixed(2) : props.product.price || "0.00";
    });
    const showPriceRange = common_vendor.computed(() => {
      if (currentSku.value)
        return false;
      if (!isMultiSpec.value || skus.value.length <= 1)
        return false;
      const prices = skus.value.map((s) => s.salePrice).filter((p) => p > 0);
      if (prices.length < 2)
        return false;
      return Math.min(...prices) !== Math.max(...prices);
    });
    const displayStock = common_vendor.computed(() => {
      if (currentSku.value)
        return currentSku.value.stock;
      return props.product.stock || 0;
    });
    const isSoldOut = common_vendor.computed(
      () => props.product.soldOut === true || props.product.isSoldOut === true || props.product.isSoldOut === 1 || Number(displayStock.value || 0) <= 0
    );
    function isSpecValueSoldOut(specName, specValue) {
      if (skus.value.length === 0)
        return false;
      const matched = skus.value.filter((sku) => {
        const texts = (sku.specText || "").split(",").map((s) => s.trim());
        return texts.includes(specValue);
      });
      if (matched.length === 0)
        return false;
      return matched.every((sku) => sku.stock <= 0);
    }
    const selectedSpecText = common_vendor.computed(() => {
      if (!isMultiSpec.value)
        return "默认";
      const vals = Object.values(selectedSpecValues.value);
      return vals.length > 0 ? vals.join(" / ") : "请选择规格";
    });
    const addressDisplay = common_vendor.computed(() => {
      const detail = props.addressDetail || {};
      const raw = String(props.addressText || "").trim();
      const address = String(
        detail.fullAddress || detail.addressText || detail.address || raw
      ).trim();
      const name = String(detail.receiverName || detail.name || "").trim();
      const phone = String(detail.receiverPhone || detail.mobile || "").trim();
      const contact = [name, phone].filter(Boolean).join(" ");
      return {
        address,
        contact
      };
    });
    const selectedCoupon = common_vendor.computed(() => {
      const id = Number(props.selectedCouponId) || 0;
      if (!id)
        return null;
      return props.usableCoupons.find((coupon) => Number(coupon.customerCouponId) === id) || null;
    });
    const couponDisplayText = common_vendor.computed(() => {
      if (props.couponLoading)
        return "加载中";
      if (selectedCoupon.value)
        return `已减 ¥${formatAmount(selectedCoupon.value.previewDiscount || selectedCoupon.value.reduceAmount)}`;
      const count = props.usableCoupons.length;
      return count > 0 ? `${count} 张可用` : "暂无可用";
    });
    const showCouponDiscount = common_vendor.computed(() => Number(props.discountAmount || 0) > 0);
    common_vendor.watch(
      () => props.visible,
      (val) => {
        if (val) {
          quantity.value = 1;
          selectedSpecValues.value = {};
          if (isMultiSpec.value && skus.value.length > 0 && specs.value.length > 0) {
            const inStock = skus.value.filter((s) => s.stock > 0);
            const candidates = inStock.length > 0 ? inStock : skus.value;
            const cheapest = candidates.reduce(
              (min, s) => s.salePrice < min.salePrice ? s : min
            );
            if (cheapest && cheapest.specText) {
              const parts = cheapest.specText.split(",").map((s) => s.trim());
              const newSelected = {};
              specs.value.forEach((group, idx) => {
                if (parts[idx]) {
                  newSelected[group.name] = parts[idx];
                }
              });
              selectedSpecValues.value = newSelected;
            }
          }
        }
      }
    );
    common_vendor.watch(
      () => {
        var _a;
        return props.visible ? ((_a = currentSku.value) == null ? void 0 : _a.id) || 0 : 0;
      },
      (skuId) => {
        emit("update:sku", skuId || 0);
      },
      { immediate: true }
    );
    function selectSpec(specName, value) {
      if (isSpecValueSoldOut(specName, value)) {
        common_vendor.index.showToast({ title: "该规格已售罄", icon: "none" });
        return;
      }
      selectedSpecValues.value = { ...selectedSpecValues.value, [specName]: value };
    }
    function changeQty(delta) {
      const stock = displayStock.value;
      const next = quantity.value + delta;
      if (next >= 1 && next <= stock) {
        quantity.value = next;
        emit("update:quantity", next);
      }
    }
    function onRemarkInput(event) {
      var _a;
      emit("update:remark", ((_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.value) || "");
    }
    function formatAmount(value) {
      const amount = Number(value || 0);
      if (!Number.isFinite(amount))
        return "0.00";
      return amount.toFixed(2);
    }
    function openCouponSelector() {
      if (props.couponLoading)
        return;
      couponPopupVisible.value = true;
    }
    function handleCouponSelect(customerCouponId) {
      emit("select-coupon", Number(customerCouponId) || 0);
    }
    function onConfirm() {
      var _a;
      if (props.loading)
        return;
      if (isMultiSpec.value && !currentSku.value) {
        common_vendor.index.showToast({ title: "请选择规格", icon: "none" });
        return;
      }
      if (props.requireAddress !== 2 && !props.addressText) {
        common_vendor.index.showToast({ title: "请选择收货地址", icon: "none" });
        return;
      }
      if (displayStock.value <= 0) {
        common_vendor.index.showToast({ title: "库存不足", icon: "none" });
        return;
      }
      const resolvedSkuId = ((_a = currentSku.value) == null ? void 0 : _a.id) || (skus.value.length === 1 ? skus.value[0].id : 0) || props.product.defaultSkuId || 0;
      if (isMultiSpec.value && !resolvedSkuId) {
        common_vendor.index.showToast({ title: "商品规格异常，请重试", icon: "none" });
        return;
      }
      emit("confirm", {
        product: props.product,
        quantity: quantity.value,
        skuId: resolvedSkuId,
        selectedSpecText: selectedSpecText.value
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.product.image,
        b: common_vendor.t(__props.product.title),
        c: common_vendor.t(displayPrice.value),
        d: showPriceRange.value
      }, showPriceRange.value ? {} : {}, {
        e: common_vendor.t(selectedSpecText.value),
        f: props.requireAddress !== 2
      }, props.requireAddress !== 2 ? common_vendor.e({
        g: common_assets._imports_0$17,
        h: common_vendor.t(addressDisplay.value.address || "请选择收货地址"),
        i: !__props.addressText ? 1 : "",
        j: addressDisplay.value.contact
      }, addressDisplay.value.contact ? {
        k: common_vendor.t(addressDisplay.value.contact)
      } : {}, {
        l: common_assets._imports_1$3,
        m: common_vendor.o(($event) => emit("select-address"), "a4")
      }) : {}, {
        n: isMultiSpec.value
      }, isMultiSpec.value ? {
        o: common_vendor.f(specs.value, (specGroup, k0, i0) => {
          return {
            a: common_vendor.t(specGroup.name),
            b: common_vendor.f(specGroup.values, (sv, k1, i1) => {
              return {
                a: common_vendor.t(sv.value),
                b: common_vendor.n(selectedSpecValues.value[specGroup.name] === sv.value ? "spec-text-active" : ""),
                c: common_vendor.n(isSpecValueSoldOut(specGroup.name, sv.value) ? "spec-text-soldout" : ""),
                d: sv.id,
                e: common_vendor.n(selectedSpecValues.value[specGroup.name] === sv.value ? "spec-active" : ""),
                f: common_vendor.n(isSpecValueSoldOut(specGroup.name, sv.value) ? "spec-soldout" : ""),
                g: common_vendor.o(($event) => selectSpec(specGroup.name, sv.value), sv.id)
              };
            }),
            c: specGroup.id
          };
        })
      } : {}, {
        p: common_vendor.t(displayStock.value),
        q: common_assets._imports_2$5,
        r: quantity.value <= 1 ? 1 : "",
        s: common_vendor.o(($event) => changeQty(-1), "82"),
        t: common_vendor.t(quantity.value),
        v: common_assets._imports_3$3,
        w: quantity.value >= displayStock.value ? 1 : "",
        x: common_vendor.o(($event) => changeQty(1), "75"),
        y: __props.remark,
        z: common_vendor.o(onRemarkInput, "e2"),
        A: __props.usableCoupons.length > 0 && !selectedCoupon.value
      }, __props.usableCoupons.length > 0 && !selectedCoupon.value ? {
        B: common_vendor.t(__props.usableCoupons.length)
      } : {}, {
        C: common_vendor.t(couponDisplayText.value),
        D: !selectedCoupon.value ? 1 : "",
        E: common_assets._imports_1$3,
        F: common_vendor.o(openCouponSelector, "a4"),
        G: common_vendor.t(__props.goodsAmount),
        H: showCouponDiscount.value
      }, showCouponDiscount.value ? {
        I: common_vendor.t(__props.discountAmount)
      } : {}, {
        J: common_vendor.t(__props.shippingFee),
        K: common_vendor.t(__props.totalPrice),
        L: common_vendor.t(isSoldOut.value ? "已售罄" : __props.loading ? "提交中..." : "立即购买"),
        M: common_vendor.n(isSoldOut.value ? "confirm-btn-disabled" : ""),
        N: common_vendor.o(($event) => !isSoldOut.value && onConfirm(), "be"),
        O: common_vendor.o(($event) => emit("close"), "dd"),
        P: common_vendor.o(($event) => popupVisible.value = $event, "31"),
        Q: common_vendor.p({
          position: "bottom",
          ["z-index"]: __props.zIndex,
          ["custom-style"]: "height: 84vh; border-radius: 24rpx 24rpx 0 0; overflow: hidden;",
          modelValue: popupVisible.value
        }),
        R: couponPopupVisible.value
      }, couponPopupVisible.value ? {
        S: common_vendor.o(($event) => couponPopupVisible.value = false, "20"),
        T: common_vendor.o(handleCouponSelect, "bf"),
        U: common_vendor.p({
          visible: couponPopupVisible.value,
          ["usable-coupons"]: __props.usableCoupons,
          ["unusable-coupons"]: __props.unusableCoupons,
          ["selected-coupon-id"]: __props.selectedCouponId,
          ["z-index"]: __props.couponZIndex
        })
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b467b6d1"]]);
wx.createComponent(Component);
