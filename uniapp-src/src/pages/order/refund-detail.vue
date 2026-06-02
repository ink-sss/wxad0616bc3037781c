<template>
  <view class="refund-detail-page" v-if="refundDetail">
    <view class="status-card">
      <view>
        <text class="status-title">{{ refundDetail.statusTitle }}</text>
        <text class="status-subtitle">{{ refundDetail.statusSubtitle }}</text>
      </view>
      <text :class="['status-tag', refundDetail.statusClass]">{{
        refundDetail.statusText
      }}</text>
    </view>

    <view
      v-if="refundDetail.returnAddress && refundDetail.refundType === 2 && refundDetail.refundStatus >= 2"
      class="section-card address-card"
    >
      <view class="address-header">
        <text class="address-title">退货地址</text>
        <view class="address-copy-btn" @click="copyReturnAddress">
          <text class="address-copy-text">复制</text>
        </view>
      </view>
      <view class="address-info">
        <view class="address-line">
          <text class="address-label">收件人</text>
          <text class="address-value">{{ refundDetail.returnAddress.receiverName }}</text>
        </view>
        <view class="address-line">
          <text class="address-label">联系方式</text>
          <text class="address-value">{{ refundDetail.returnAddress.phone }}</text>
        </view>
        <view class="address-line">
          <text class="address-label">详细地址</text>
          <text class="address-value">{{ refundDetail.returnAddress.province }}{{ refundDetail.returnAddress.city }}{{ refundDetail.returnAddress.district }}{{ refundDetail.returnAddress.address }}</text>
        </view>
      </view>
    </view>

    <view class="section-card goods-card">
      <view class="goods-row">
        <image
          class="goods-image"
          :src="refundDetail.coverImage"
          mode="aspectFill"
        />
        <view class="goods-content">
          <text class="goods-title">{{ refundDetail.productName }}</text>
          <text class="goods-spec">{{ refundDetail.skuText }}</text>
          <view class="goods-meta-row">
            <text class="goods-price"
              >退款金额：￥{{ refundDetail.refundAmount }}</text
            >
            <text class="goods-count">x{{ refundDetail.quantity }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section-card info-card">
      <view class="info-row">
        <text class="info-label">售后单号</text>
        <text class="info-value">{{ refundDetail.refundNo }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">退款类型</text>
        <text class="info-value">{{ refundDetail.refundTypeText }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">申请时间</text>
        <text class="info-value">{{ refundDetail.createdAt }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">退款原因</text>
        <text class="info-value">{{ refundDetail.refundReason }}</text>
      </view>
      <view class="info-row" v-if="refundDetail.refundDesc">
        <text class="info-label">退款说明</text>
        <text class="info-value">{{ refundDetail.refundDesc }}</text>
      </view>
      <view class="images-row" v-if="refundDetail.refundImages && refundDetail.refundImages.length">
        <text class="info-label">退款凭证</text>
        <view class="images-list">
          <image
            v-for="(img, idx) in refundDetail.refundImages"
            :key="idx"
            :src="img"
            class="evidence-image"
            mode="aspectFill"
            @click="previewImage(img)"
          />
        </view>
      </view>
      <view class="info-row" v-if="refundDetail.rejectReason">
        <text class="info-label">拒绝原因</text>
        <text class="info-value info-danger">{{
          refundDetail.rejectReason
        }}</text>
      </view>
      <view
        class="info-row"
        v-if="
          refundDetail.returnLogisticsCompany || refundDetail.returnTrackingNo
        "
      >
        <text class="info-label">退货物流</text>
        <text class="info-value"
          >{{ refundDetail.returnLogisticsCompany }}
          {{ refundDetail.returnTrackingNo }}</text
        >
      </view>
    </view>

    <view v-if="refundDetail.refundStatus === 2" class="bottom-bar">
      <view class="bottom-btn" @click="showLogisticsPopup = true">填写退货物流</view>
    </view>

    <bottom-sheet-popup
      :visible="showLogisticsPopup"
      height="600rpx"
      radius="28rpx 28rpx 0 0"
      :duration="500"
      :with-mask="true"
      mask-color="rgba(0, 0, 0, 0.45)"
      @close="showLogisticsPopup = false"
    >
      <view class="logistics-popup">
        <view class="logistics-header">
          <text class="logistics-title">填写退货物流</text>
        </view>
        <view class="logistics-form">
          <view class="logistics-field">
            <text class="logistics-label">物流公司</text>
            <input
              v-model="logisticsCompany"
              class="logistics-input"
              placeholder="请输入物流公司名称"
            />
          </view>
          <view class="logistics-field">
            <text class="logistics-label">物流单号</text>
            <input
              v-model="trackingNo"
              class="logistics-input"
              placeholder="请输入物流单号"
            />
          </view>
        </view>
        <view class="logistics-footer">
          <view class="logistics-submit-btn" @click="onSubmitLogistics">提交</view>
        </view>
      </view>
    </bottom-sheet-popup>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getRefundDetail, submitLogistics } from "@/api/refund";
import { ensureH5PageAuth } from "@/services/h5-auth-context";
import BottomSheetPopup from "@/components/bottom-sheet-popup.vue";

const refundDetail = ref(null);
const showLogisticsPopup = ref(false);
const logisticsCompany = ref("");
const trackingNo = ref("");
const logisticsSubmitting = ref(false);

const REFUND_STATUS_MAP = {
  1: {
    text: "待商家处理",
    title: "退款申请已提交",
    subtitle: "商家正在处理中，请耐心等待",
    className: "status-processing",
  },
  2: {
    text: "待买家退货",
    title: "请尽快退货",
    subtitle: "商家已同意退货退款，请按要求寄回商品",
    className: "status-processing",
  },
  3: {
    text: "待商家收货",
    title: "商家待收货",
    subtitle: "退货物流已提交，等待商家签收",
    className: "status-processing",
  },
  4: {
    text: "退款成功",
    title: "退款成功",
    subtitle: "退款金额已原路返回，请注意查收",
    className: "status-success",
  },
  5: {
    text: "退款关闭",
    title: "退款已关闭",
    subtitle: "当前售后流程已结束",
    className: "status-muted",
  },
  6: {
    text: "退款中",
    title: "退款处理中",
    subtitle: "平台正在处理退款，请稍后查看结果",
    className: "status-processing",
  },
};

function mapRefundDetail(data = {}) {
  const statusMeta = REFUND_STATUS_MAP[Number(data.refundStatus || 0)] || {
    text: "售后处理中",
    title: "售后处理中",
    subtitle: "请稍后查看最新状态",
    className: "status-processing",
  };
  return {
    id: Number(data.id || 0),
    refundNo: data.refundNo || "",
    orderId: Number(data.orderId || 0),
    refundType: Number(data.refundType || 0),
    refundTypeText: Number(data.refundType || 0) === 2 ? "退货退款" : "仅退款",
    refundStatus: Number(data.refundStatus || 0),
    refundAmount: Number(data.refundAmount || 0).toFixed(2),
    refundReason: data.refundReason || "-",
    refundDesc: data.refundDesc || "",
    refundImages: Array.isArray(data.refundImages) ? data.refundImages : [],
    rejectReason: data.rejectReason || "",
    returnLogisticsCompany: data.returnLogisticsCompany || "",
    returnTrackingNo: data.returnTrackingNo || "",
    returnAddress: data.returnAddress || null,
    createdAt: data.createdAt || "-",
    productName: data.productName || "商品信息加载中",
    coverImage: data.coverImage || "",
    skuText: data.skuText || "默认规格",
    quantity: Number(data.quantity || 1),
    statusText: statusMeta.text,
    statusTitle: statusMeta.title,
    statusSubtitle: statusMeta.subtitle,
    statusClass: statusMeta.className,
  };
}

async function loadRefundDetail(refundId) {
  const id = Number(refundId || 0);
  if (!id) {
    uni.showToast({ title: "退款参数错误", icon: "none" });
    return;
  }
  try {
    const data = await getRefundDetail(id);
    refundDetail.value = mapRefundDetail(data || {});
  } catch (err) {
    uni.showToast({ title: err?.message || "获取退款详情失败", icon: "none" });
  }
}

function goOrderDetail() {
  if (!refundDetail.value?.orderId) return;
  uni.navigateTo({
    url: `/pages/order/detail?id=${refundDetail.value.orderId}`,
  });
}

function previewImage(current) {
  uni.previewImage({
    current,
    urls: refundDetail.value?.refundImages || [current],
  });
}

function copyReturnAddress() {
  const addr = refundDetail.value?.returnAddress;
  if (!addr) return;
  const text = `收件人：${addr.receiverName}\n联系方式：${addr.phone}\n详细地址：${addr.province}${addr.city}${addr.district}${addr.address}`;
  uni.setClipboardData({
    data: text,
    success: () => uni.showToast({ title: "已复制退货地址", icon: "success" }),
  });
}

async function onSubmitLogistics() {
  if (logisticsSubmitting.value) return;
  if (!logisticsCompany.value.trim()) {
    uni.showToast({ title: "请输入物流公司", icon: "none" });
    return;
  }
  if (!trackingNo.value.trim()) {
    uni.showToast({ title: "请输入物流单号", icon: "none" });
    return;
  }
  logisticsSubmitting.value = true;
  try {
    await submitLogistics({
      refundId: refundDetail.value.id,
      returnLogisticsCompany: logisticsCompany.value.trim(),
      returnTrackingNo: trackingNo.value.trim(),
    });
    uni.showToast({ title: "提交成功", icon: "success" });
    showLogisticsPopup.value = false;
    await loadRefundDetail(refundDetail.value.id);
  } catch (err) {
    uni.showToast({ title: err?.message || "提交失败", icon: "none" });
  } finally {
    logisticsSubmitting.value = false;
  }
}

onLoad((options) => {
  if (!ensureH5PageAuth(options)) return;
  loadRefundDetail(options?.refundId);
});
</script>

<style lang="scss" scoped>
.refund-detail-page {
  min-height: 100vh;
  background: #f6f6f6;
  padding: 24rpx;
  box-sizing: border-box;
}

.status-card,
.section-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-sizing: border-box;
}

.status-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
}

.status-title {
  display: block;
  font-size: 36rpx;
  color: #1f1f1f;
  font-weight: 600;
}

.status-subtitle {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

.status-tag {
  flex-shrink: 0;
  font-size: 24rpx;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
}

.status-processing {
  color: #fd6119;
  background: rgba(253, 97, 25, 0.1);
}

.status-success {
  color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
}

.status-muted {
  color: #999;
  background: #f3f3f3;
}

.address-card {
  margin-top: 24rpx;
}

.address-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.address-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f1f1f;
}

.address-copy-btn {
  padding: 8rpx 24rpx;
  border-radius: 999rpx;
  border: 1rpx solid #fd6119;
}

.address-copy-text {
  font-size: 24rpx;
  color: #fd6119;
}

.address-info {
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 24rpx;
}

.address-line {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.address-line + .address-line {
  margin-top: 16rpx;
}

.address-label {
  width: 120rpx;
  flex-shrink: 0;
  font-size: 26rpx;
  color: #999;
}

.address-value {
  flex: 1;
  font-size: 26rpx;
  color: #1f1f1f;
  line-height: 1.5;
  word-break: break-all;
}

.goods-card,
.info-card {
  margin-top: 24rpx;
}

.goods-row {
  display: flex;
  gap: 20rpx;
}

.goods-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 20rpx;
  background: #f5f5f5;
  flex-shrink: 0;
}

.goods-content {
  flex: 1;
  min-width: 0;
}

.goods-title {
  display: block;
  font-size: 30rpx;
  color: #1f1f1f;
  font-weight: 500;
  line-height: 1.5;
}

.goods-spec {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #888;
}

.goods-meta-row {
  margin-top: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.goods-price {
  font-size: 28rpx;
  color: #1f1f1f;
  font-weight: 600;
}

.goods-count {
  font-size: 26rpx;
  color: #888;
}

.info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
}

.info-row + .info-row {
  margin-top: 24rpx;
}

.info-label {
  width: 140rpx;
  flex-shrink: 0;
  font-size: 26rpx;
  color: #888;
}

.info-value {
  flex: 1;
  text-align: right;
  font-size: 26rpx;
  color: #1f1f1f;
  line-height: 1.5;
  word-break: break-all;
}

.info-danger {
  color: #ff4d4f;
}

.images-row {
  margin-top: 24rpx;
}

.images-row .info-label {
  font-size: 26rpx;
  color: #888;
  margin-bottom: 16rpx;
}

.images-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 12rpx;
}

.evidence-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
}

.bottom-bar {
  padding: 32rpx 0 calc(32rpx + env(safe-area-inset-bottom));
}

.bottom-btn {
  height: 88rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #ff7a3d 0%, #ff5c23 100%);
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logistics-popup {
  width: 750rpx;
  height: 100%;
  background: #fff;
  border-radius: 28rpx 28rpx 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.logistics-header {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 110rpx;
  padding: 18rpx 28rpx 0;
}

.logistics-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1f1f1f;
}

.logistics-form {
  flex: 1;
  padding: 24rpx 32rpx;
}

.logistics-field {
  margin-bottom: 32rpx;
}

.logistics-label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.logistics-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  border-radius: 16rpx;
  background: #f7f7f7;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.logistics-footer {
  padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
}

.logistics-submit-btn {
  height: 88rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #ff7a3d 0%, #ff5c23 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
