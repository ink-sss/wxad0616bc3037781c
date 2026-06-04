<template>
  <view class="confirm-page">
    <view v-if="needAddress" class="address-card" @click="goAddress">
      <view v-if="address" class="address-content">
        <view class="address-row">
          <text class="address-label">收货人</text>
          <text class="address-value">{{
            address.receiverName || address.name || "--"
          }}</text>
        </view>
        <view class="address-row">
          <text class="address-label">手机号</text>
          <text class="address-value">{{
            address.receiverPhone || address.mobile || "--"
          }}</text>
        </view>
        <view class="address-block">
          <text class="address-title">收货地址</text>
          <text class="address-detail">{{
            address.fullAddress ||
            address.province +
              address.city +
              address.district +
              address.address ||
            "--"
          }}</text>
        </view>
      </view>
      <view v-else class="address-empty">
        <text class="address-empty-text">请选择收货地址 ›</text>
      </view>
    </view>

    <view class="goods-card">
      <image class="goods-image" :src="product.image" mode="aspectFill" />
      <view class="goods-info">
        <text class="goods-title">{{ product.title }}</text>
        <text class="goods-price">¥ {{ product.price }}</text>
      </view>
      <view class="qty-wrap">
        <view
          class="qty-btn"
          :class="{ 'qty-btn-disabled': quantity <= 1 }"
          @click="decreaseQty"
        >
          －
        </view>
        <text class="qty-num">{{ quantity }}</text>
        <view class="qty-btn qty-btn-add" @click="increaseQty">＋</view>
      </view>
    </view>

    <view class="remark-row">
      <text class="remark-label">买家留言</text>
      <input
        v-model="remark"
        class="remark-input"
        placeholder="建议与卖家协商一致后填写"
      />
    </view>

    <view class="price-row">
      <text class="price-label">商品总价</text>
      <text class="price-value">¥ {{ totalPrice }}</text>
    </view>
    <view v-if="needAddress" class="price-row">
      <text class="price-label">运费</text>
      <text class="price-value">¥ {{ shippingFee }}</text>
    </view>

    <view class="pay-bar">
      <view class="pay-left">
        <text class="pay-label">实付款</text>
        <text class="pay-price">¥ {{ totalPrice }}</text>
      </view>
      <view class="pay-btn" @click="onPay">立即支付</view>
    </view>

    <bottom-sheet-popup
      :visible="showAddressPopup"
      :height="addressList.length === 0 ? '66vh' : '78vh'"
      radius="24rpx 24rpx 0 0"
      :duration="500"
      :with-mask="true"
      mask-color="rgba(0, 0, 0, 0.35)"
      @close="showAddressPopup = false"
    >
      <address-list-panel
        :list="addressList"
        :selected-id="selectedAddressId"
        title="地址管理"
        button-text="确定"
        :show-default-row="false"
        :button-disabled="!selectedAddressId"
        @select="selectedAddressId = $event"
        @save="confirmAddressSelect"
        @edit="onEditAddress"
        @add="onAddAddress"
        @delete="onDeleteAddress"
        @import-wx="onImportWx"
      />
    </bottom-sheet-popup>

    <address-form-popup
      :visible="showAddressFormPopup"
      :edit-data="editAddressData"
      popup-height="78vh"
      @close="showAddressFormPopup = false"
      @saved="onAddressSaved"
    />
    <live-mini-window :room-code="liveRoomCode" :bottom-offset="180" />
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { confirmOrder, createOrder, getOrderDetail } from "@/api/order";
import { executeYeepayPayment } from "@/services/payment-action";
import { getAddressList, deleteAddress } from "@/api/address";
import { importWxAddress } from "@/services/wechat-address";
import { getSkuStock } from "@/api/product";
import { resolveLiveRoomCode } from "@/utils/live-room-context";
import BottomSheetPopup from "@/components/bottom-sheet-popup.vue";
import AddressListPanel from "@/components/address-list-panel.vue";
import AddressFormPopup from "@/components/address-form-popup.vue";
import LiveMiniWindow from "@/components/live-mini-window.vue";

const product = ref({
  image: "",
  title: "",
  price: "0.00",
});
const quantity = ref(1);
const remark = ref("");
const productId = ref(0);
const skuId = ref(0);
const liveRoomId = ref(0);
const liveTermId = ref(0);
const liveRoomCode = ref("");
const tenantId = ref(0);

const address = ref(null);
const confirmData = ref(null);
const needAddress = computed(() => confirmData.value?.requireAddress !== 2);
const loading = ref(false);
const pendingOrderId = ref(0);
const showAddressPopup = ref(false);
const showAddressFormPopup = ref(false);
const editAddressData = ref(null);
const addressList = ref([]);
const selectedAddressId = ref(null);

function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function toPositiveNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function applyOrderQuery(source = {}) {
  productId.value = toPositiveNumber(firstValue(source, "productId", "product_id", "goodsId", "goods_id"), productId.value);
  skuId.value = toPositiveNumber(firstValue(source, "skuId", "sku_id", "productSkuId", "product_sku_id", "specSkuId", "spec_sku_id"), skuId.value);
  quantity.value = toPositiveNumber(firstValue(source, "quantity", "product_num", "totalNum", "total_num"), quantity.value || 1);
  liveRoomId.value = toPositiveNumber(firstValue(source, "roomId", "room_id", "liveRoomId", "live_room_id", "liveId", "live_id"), liveRoomId.value);
  liveTermId.value = toPositiveNumber(firstValue(source, "termId", "term_id", "liveTermId", "live_term_id"), liveTermId.value);
  liveRoomCode.value = resolveLiveRoomCode(firstValue(source, "roomCode", "room_code") || liveRoomCode.value);
  tenantId.value = toPositiveNumber(firstValue(source, "tenantId", "tenant_id"), tenantId.value);
  if (source.addressId || source.address_id) {
    address.value = { id: toPositiveNumber(firstValue(source, "addressId", "address_id"), 0) };
  }
  if (source.title || source.productName || source.product_name) {
    product.value.title = firstValue(source, "title", "productName", "product_name");
  }
  if (source.image || source.productImage || source.product_image) {
    product.value.image = firstValue(source, "image", "productImage", "product_image");
  }
  if (source.price || source.productPrice || source.product_price) {
    product.value.price = String(firstValue(source, "price", "productPrice", "product_price"));
  }
}

const totalPrice = computed(() => {
  if (confirmData.value) return confirmData.value.payAmount || "0.00";
  const total = Number(product.value.price || 0) * quantity.value;
  return total.toFixed(2);
});

function getOrderListUrl(status) {
  const code = String(liveRoomCode.value || "").trim();
  return `/pages/order/list?status=${status}${code ? `&roomCode=${encodeURIComponent(code)}` : ""}`;
}

const shippingFee = computed(() => {
  if (confirmData.value) return confirmData.value.shippingFee || "0.00";
  return "0.00";
});

async function loadConfirm() {
  if (!productId.value) return;
  try {
    const data = await confirmOrder({
      tenantId: tenantId.value,
      items: [
        {
          productId: productId.value,
          skuId: skuId.value,
          quantity: quantity.value,
        },
      ],
      addressId: address.value?.id || 0,
      liveRoomId: liveRoomId.value,
      liveTermId: liveTermId.value,
    });
    if (data) {
      confirmData.value = data;
      if (data.address) {
        address.value = data.address;
      }
      if (data.items?.length > 0) {
        const item = data.items[0];
        product.value = {
          image: item.coverImage || product.value.image,
          title: item.productName || product.value.title,
          price: item.price?.toFixed(2) || product.value.price,
          spec: item.skuText || "",
        };
      }
    }
  } catch (err) {
    console.error("[Confirm] loadConfirm fail:", err);
  }
}

async function loadDefaultAddress() {
  try {
    const list = await getAddressList();
    if (Array.isArray(list) && list.length > 0) {
      const def = list.find((a) => a.isDefault === 1) || list[0];
      address.value = def;
    }
  } catch (err) {
    console.error("[Confirm] loadAddress fail:", err);
  }
}

onLoad((options) => {
  applyOrderQuery(options || {});
  if (options?.payload) {
    const parsed = JSON.parse(decodeURIComponent(options.payload));
    applyOrderQuery({ ...(options || {}), ...parsed });
  }
  // 从授权域名wxPick页回来，刷新地址列表获取新导入的地址
  if (options?.wxAddrDone === "1") {
    loadDefaultAddress().then(() => {
      uni.showToast({ title: "地址导入成功", icon: "success" });
      loadConfirm();
    });
    return;
  }

  loadDefaultAddress().then(() => loadConfirm()).then(() => {
    if (!needAddress.value) address.value = null;
  });
});

onShow(async () => {
  loadConfirm();
  // 支付完成后可能回退到此页面，检查待支付订单是否已完成
  if (pendingOrderId.value) {
    try {
      const detail = await getOrderDetail(pendingOrderId.value);
      const status = Number(detail?.orderStatus || 0);
      if (status >= 2) {
        pendingOrderId.value = 0;
        uni.showToast({ title: "支付成功", icon: "success" });
        setTimeout(() => {
          uni.redirectTo({ url: getOrderListUrl("unsend") });
        }, 1200);
        return;
      }
    } catch (e) {
      console.error("[Confirm] check pending order fail:", e);
    }
    pendingOrderId.value = 0;
  }
});

async function loadAddressById(addrId) {
  // 优先从已加载的列表里找
  const cached = addressList.value.find((a) => a.id === addrId);
  if (cached) {
    address.value = cached._raw || cached;
    loadConfirm();
    return;
  }
  // 列表里没有，重新请求
  try {
    const list = await getAddressList();
    if (Array.isArray(list)) {
      const found = list.find((a) => a.id === addrId);
      if (found) {
        address.value = found;
        loadConfirm();
      }
    }
  } catch (err) {
    console.error("[Confirm] loadAddressById fail:", err);
  }
}

async function increaseQty() {
  // 实时校验库存
  if (skuId.value) {
    try {
      const stockData = await getSkuStock(skuId.value);
      if (stockData && quantity.value + 1 > stockData.stock) {
        uni.showToast({
          title: `库存不足，最多可购买${stockData.stock}件`,
          icon: "none",
        });
        return;
      }
    } catch (err) {
      console.error("[Confirm] stock check fail:", err);
    }
  }
  quantity.value += 1;
  loadConfirm();
}

function decreaseQty() {
  if (quantity.value <= 1) return;
  quantity.value -= 1;
  loadConfirm();
}

function goAddress() {
  selectedAddressId.value = address.value?.id || null;
  loadAddressList();
  showAddressPopup.value = true;
}

async function loadAddressList() {
  try {
    const list = await getAddressList();
    if (Array.isArray(list)) {
      addressList.value = list.map((item) => ({
        id: item.id,
        name: item.receiverName,
        mobile: item.receiverPhone,
        tag: item.isDefault === 1 ? "默认" : "",
        fullAddress:
          item.fullAddress ||
          `${item.province || ""}${item.city || ""}${item.district || ""}${item.address || ""}`,
        receiverName: item.receiverName,
        receiverPhone: item.receiverPhone,
        province: item.province,
        city: item.city,
        district: item.district,
        address: item.address,
        isDefault: item.isDefault,
        _raw: item,
      }));
    }
  } catch (err) {
    console.error("[Confirm] loadAddressList fail:", err);
  }
}

function confirmAddressSelect() {
  if (!selectedAddressId.value) return;
  showAddressPopup.value = false;
  loadAddressById(selectedAddressId.value);
}

function onAddAddress() {
  editAddressData.value = null;
  showAddressFormPopup.value = true;
}

function onEditAddress(item) {
  editAddressData.value = item?._raw || item;
  showAddressFormPopup.value = true;
}

async function onAddressSaved() {
  showAddressFormPopup.value = false;
  await loadAddressList();
  // 如果之前没选地址，自动选第一个
  if (!address.value && addressList.value.length > 0) {
    const first = addressList.value[0];
    selectedAddressId.value = first.id;
    loadAddressById(first.id);
  }
}

async function onDeleteAddress(item) {
  try {
    await deleteAddress(item.id);
    uni.showToast({ title: "删除成功", icon: "success" });
    if (selectedAddressId.value === item.id) {
      selectedAddressId.value = null;
      address.value = null;
    }
    await loadAddressList();
  } catch (err) {
    console.error("[OrderConfirm] deleteAddress fail:", err);
    uni.showToast({ title: "删除失败", icon: "none" });
  }
}

async function onImportWx() {
  const ok = await importWxAddress();
  if (ok) await loadAddressList();
}

async function onPay() {
  if (loading.value) return;
  if (needAddress.value && !address.value?.id) {
    uni.showToast({ title: "请选择收货地址", icon: "none" });
    return;
  }
  if (!productId.value) {
    uni.showToast({ title: "商品信息异常", icon: "none" });
    return;
  }
  loading.value = true;
  try {
    const orderRes = await createOrder({
      tenantId: tenantId.value,
      items: [
        {
          productId: productId.value,
          skuId: skuId.value,
          quantity: quantity.value,
        },
      ],
      addressId: needAddress.value ? address.value?.id || 0 : 0,
      liveRoomId: liveRoomId.value,
      liveTermId: liveTermId.value,
      buyerRemark: remark.value,
      source: liveRoomId.value ? 2 : 1,
    });
    if (!orderRes?.orderNo) {
      uni.showToast({ title: "创建订单失败", icon: "none" });
      return;
    }
    // 防重复下单：后端检测到已有相同待付款订单，直接复用
    if (orderRes.isDuplicate) {
      console.log("[OrderConfirm] 命中防重复下单，复用已有订单:", orderRes.orderNo);
      uni.showToast({ title: "已有待付款订单，正在跳转支付", icon: "none", duration: 1500 });
    }
    // 记录待支付订单ID，防止支付回调丢失
    pendingOrderId.value = orderRes.orderId || orderRes.ID || 0;
    const payMode = await executeYeepayPayment(orderRes.orderNo, {
      roomCode: liveRoomCode.value,
    });
    if (payMode === "jsapi") {
      pendingOrderId.value = 0;
    }
  } catch (err) {
    uni.showToast({ title: err?.message || "下单失败", icon: "none" });
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.confirm-page {
  min-height: 100vh;
  background: #fff;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.address-card,
.goods-card,
.remark-row,
.price-row {
  background: #fff;
}

.address-card {
  padding: 0 30rpx;
}

.address-row {
  min-height: 92rpx;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #efefef;
}

.address-label,
.address-title,
.remark-label,
.price-label {
  font-family: "PingFang SC";
  font-size: 30rpx;
  color: #4a4a4a;
}

.address-label {
  width: 130rpx;
}

.address-value {
  font-size: 30rpx;
  color: #666;
}

.address-block {
  padding: 26rpx 0 30rpx;
}

.address-detail {
  margin-top: 16rpx;
  margin-left: 12rpx;
  font-size: 30rpx;
  color: #666;
  line-height: 1.5;
}

.address-empty {
  padding: 40rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.address-empty-text {
  font-size: 30rpx;
  color: #ff6b2e;
}

.goods-card {
  border-top: 20rpx solid #f8f8f8;
  padding: 26rpx 24rpx;
  display: flex;
  align-items: center;
}

.goods-image {
  width: 156rpx;
  height: 156rpx;
  border-radius: 10rpx;
  background: #f1f1f1;
  flex-shrink: 0;
}

.goods-info {
  flex: 1;
  min-width: 0;
  margin-left: 20rpx;
}

.goods-title {
  font-size: 34rpx;
  color: #222;
  line-height: 1.45;
  font-weight: 600;
  line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.goods-price {
  display: block;
  margin-top: 18rpx;
  font-size: 42rpx;
  color: #ff2a1f;
  font-weight: 600;
}

.qty-wrap {
  margin-left: 18rpx;
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.qty-btn {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
}

.qty-btn-disabled {
  background: #d8d8d8;
  color: #fff;
}

.qty-btn-add {
  background: #ff7a1a;
  color: #fff;
}

.qty-num {
  font-size: 34rpx;
  color: #333;
}

.remark-row,
.price-row {
  min-height: 100rpx;
  padding: 0 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1rpx solid #efefef;
}

.remark-input {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: #b9b9b9;
  margin-left: 24rpx;
}

.price-value {
  font-size: 40rpx;
  color: #111;
}

.pay-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(136rpx + env(safe-area-inset-bottom));
  padding: 0 30rpx env(safe-area-inset-bottom);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.pay-left {
  display: flex;
  align-items: baseline;
}

.pay-label {
  font-size: 32rpx;
  color: #555;
}

.pay-price {
  font-family: "PingFang SC";
  margin-left: 14rpx;
  font-size: 54rpx;
  color: #ff180e;
  font-weight: 600;
}

.pay-btn {
  width: 260rpx;
  height: 92rpx;
  border-radius: 46rpx;
  background: linear-gradient(90deg, #ff8a1d 0%, #ff7215 100%);
  color: #fff;
  font-size: 34rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
