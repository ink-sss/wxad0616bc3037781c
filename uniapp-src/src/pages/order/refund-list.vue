<template>
  <view class="refund-list-page">
    <view v-if="refundList.length" class="refund-list">
      <view v-for="item in refundList" :key="item.id" class="refund-card">
        <view class="refund-head">
          <text class="refund-no">售后单号：{{ item.refundNo }}</text>
          <text class="refund-status status-muted">退款/售后</text>
        </view>

        <view class="goods-row">
          <image class="goods-image" :src="item.coverImage" mode="aspectFill" />
          <view class="goods-content">
            <text class="goods-title">{{ item.productName }}</text>
            <view class="goods-meta-row">
              <text class="goods-spec">{{ item.skuText }}</text>
              <text class="goods-count">x{{ item.quantity }}</text>
            </view>
            <view :class="['refund-tag', item.refundTagClass]">{{
              item.refundTag
            }}</view>
          </view>
        </view>

        <view class="goods-price-row">
          <text class="goods-price">
            <text class="price-label">退款金额：</text>
            <text class="price-symbol">￥</text>
            <text class="price-int">{{ item.priceInt }}</text>
            <text class="price-dec">.{{ item.priceDec }}</text>
          </text>
        </view>
      </view>
    </view>
    <view v-else class="refund-empty">
      <text class="refund-empty-text">暂无退款/售后记录</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { getRefundList } from "@/api/refund";
import { ensureH5PageAuth } from "@/services/h5-auth-context";

const refundList = ref([]);

function mapRefund(item) {
  const refundStatus = Number(item?.refundStatus || 0);
  const refundStatusTagMap = {
    1: { text: "待处理", tagClass: "refund-tag-processing" },
    2: { text: "待退货", tagClass: "refund-tag-processing" },
    3: { text: "待商家收货", tagClass: "refund-tag-processing" },
    4: { text: "退款成功", tagClass: "refund-tag-success" },
    5: { text: "退款关闭", tagClass: "refund-tag-closed" },
    6: { text: "退款中", tagClass: "refund-tag-processing" },
  };
  const tagMeta = refundStatusTagMap[refundStatus] || null;
  const priceStr = Number(item?.refundAmount || 0).toFixed(2);
  const [priceInt, priceDec = "00"] = priceStr.split(".");
  return {
    id: item?.id || 0,
    refundNo: item?.refundNo || "",
    orderId: item?.orderId || 0,
    refundType: Number(item?.refundType || 0),
    refundTypeText: Number(item?.refundType || 0) === 2 ? "退货退款" : "仅退款",
    refundStatus,
    refundTag: tagMeta?.text || "售后处理中",
    refundTagClass: tagMeta?.tagClass || "refund-tag-processing",
    refundAmount: priceStr,
    priceInt,
    priceDec,
    refundReason: item?.refundReason || "-",
    createdAt: item?.createdAt || "-",
    productName: item?.productName || "",
    coverImage: item?.coverImage || "",
    skuText: item?.skuText || "",
    price: item?.price || 0,
    quantity: item?.quantity || 1,
  };
}

async function loadRefunds() {
  try {
    const data = await getRefundList({
      page: 1,
      pageSize: 20,
      refundStatus: 0,
    });
    const list = Array.isArray(data?.list) ? data.list : [];
    refundList.value = list.map(mapRefund);
  } catch (err) {
    console.error("[RefundList] loadRefunds fail:", err);
  }
}

onLoad((options) => {
  if (!ensureH5PageAuth(options)) return;
  loadRefunds();
});

onShow(() => {
  if (!ensureH5PageAuth()) return;
  loadRefunds();
});
</script>

<style lang="scss" scoped>
.refund-list-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 24rpx;
  box-sizing: border-box;
}

.refund-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.refund-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-sizing: border-box;
}

.refund-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.refund-no {
  font-size: 24rpx;
  color: #666;
}

.refund-status {
  font-size: 24rpx;
  font-weight: 500;
}

.status-muted {
  color: #999;
}

.goods-row {
  margin-top: 20rpx;
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}

.goods-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  background: #f5f5f5;
}

.goods-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.goods-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #000;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.4;
}

.goods-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.goods-spec {
  font-size: 28rpx;
  color: #888;
}

.goods-count {
  font-size: 28rpx;
  color: #888;
}

.goods-price-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 10rpx;
}

.refund-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8rpx 12rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  background: #fff;
  white-space: nowrap;
  line-height: 1;
  align-self: flex-start;
}

.refund-tag-processing {
  color: #fd6119;
  border: 1rpx solid #fd6119;
}

.refund-tag-success {
  color: #52c41a;
  border: 1rpx solid #52c41a;
}

.refund-tag-failed {
  color: #ff4d4f;
  border: 1rpx solid #ff4d4f;
}

.refund-tag-closed {
  color: #999;
  border: 1rpx solid #999;
}

.goods-price {
  font-size: 30rpx;
  color: #1a1a1a;
  font-weight: 600;
}

.price-label {
  font-size: 26rpx;
  color: #666;
  font-weight: 400;
}

.price-symbol {
  font-size: 24rpx;
}

.price-int {
  font-size: 30rpx;
}

.price-dec {
  font-size: 24rpx;
}

.refund-empty {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refund-empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>
