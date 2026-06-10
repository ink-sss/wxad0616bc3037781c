<template>
  <view class="refund-page">
    <view class="goods-card">
      <view class="goods-info">
        <image class="goods-image" :src="refundItem.image" mode="aspectFill" />
        <view class="goods-main">
          <text class="goods-title">{{ refundItem.title }}</text>
          <view class="goods-meta">
            <text class="goods-spec">{{ refundItem.spec }}</text>
            <text class="goods-count">x{{ refundItem.quantity }}</text>
          </view>
        </view>
      </view>
      <text class="goods-price">¥{{ refundItem.price }}</text>
    </view>

    <view v-if="orderStatus >= 3" class="form-card refund-type-row">
      <text class="row-label row-label-required">售后类型</text>
      <view class="type-options">
        <view
          :class="['type-option', refundType === 1 ? 'type-option-active' : '']"
          @click="refundType = 1"
        >
          <text>仅退款</text>
        </view>
        <view
          :class="['type-option', refundType === 2 ? 'type-option-active' : '']"
          @click="refundType = 2"
        >
          <text>退货退款</text>
        </view>
      </view>
    </view>

    <view class="form-card reason-row" @click="showReasonPopup = true">
      <text class="row-label row-label-required">退款原因</text>
      <view class="row-right">
        <text
          :class="['row-value', selectedReason ? 'row-value-selected' : '']"
          >{{ selectedReason || "请选择" }}</text
        >
        <text class="row-arrow">›</text>
      </view>
    </view>

    <view class="form-card amount-row">
      <text class="amount-label">退款金额</text>
      <view class="amount-right">
        <text class="amount-value">¥{{ formatAmount(refundAmount) }}</text>
      </view>
    </view>

    <view class="form-card evidence-card">
      <text class="block-title">补充描述与凭证</text>
      <textarea
        v-model="description"
        class="desc-input"
        maxlength="200"
        placeholder="补充描述，有助于商家更好的处理售后问题（选填）"
      />

      <text class="block-title upload-title">上传凭证</text>
      <view class="upload-list">
        <view
          v-for="(item, index) in refundImages"
          :key="item.url"
          class="upload-preview"
        >
          <image
            class="upload-preview-image"
            :src="item.url"
            mode="aspectFill"
            @click="previewImages(index)"
          />
          <view class="upload-delete" @click.stop="removeImage(index)">×</view>
          <view v-if="item.uploading" class="upload-mask">上传中</view>
        </view>
        <view
          v-if="refundImages.length < 3"
          class="upload-box"
          @click="onUpload"
        >
          <text class="upload-plus">＋</text>
          <text class="upload-text">上传图片凭证</text>
          <text class="upload-limit">最多3张</text>
        </view>
      </view>
    </view>

    <view v-if="!showReasonPopup" class="submit-bar">
      <view class="submit-btn" @click="onSubmit">提交</view>
    </view>

    <bottom-sheet-popup
      :visible="showReasonPopup"
      height="780rpx"
      radius="28rpx 28rpx 0 0"
      :duration="500"
      :with-mask="true"
      mask-color="rgba(0, 0, 0, 0.45)"
      @close="showReasonPopup = false"
    >
      <view class="reason-popup">
        <view class="reason-header">
          <text class="reason-title">退款原因</text>
        </view>
        <view
          v-for="reason in reasons"
          :key="reason"
          class="reason-item"
          @click="tempReason = reason"
        >
          <text class="reason-text">{{ reason }}</text>
          <view
            :class="[
              'reason-radio',
              tempReason === reason ? 'reason-radio-active' : '',
            ]"
          >
            <image
              v-if="tempReason === reason"
              class="reason-radio-icon"
              src="https://man.lqjy.cc/static/icons/check.svg"
              mode="aspectFit"
            />
          </view>
        </view>
        <view class="reason-footer">
          <view class="reason-confirm" @click="confirmReason">确认</view>
        </view>
      </view>
    </bottom-sheet-popup>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import BottomSheetPopup from "@/components/bottom-sheet-popup.vue";
import { getOrderDetail } from "@/api/order";
import { applyRefund, uploadRefundImage } from "@/api/refund";
import { chooseImage as chooseMpImage } from "@/platform/weixin/file";
import { loadLiveRoomContext } from "@/utils/live-room-context";

const defaultImage =
  "https://man.lqjy.cc/static/remote-icons/figma-product-placeholder.png";

const orderId = ref(0);
const orderItemId = ref(0);
const roomId = ref(0);
const orderStatus = ref(0);
const refundType = ref(1);
const refundAmount = ref(0);
const refundItem = ref({
  image: defaultImage,
  title: "",
  spec: "",
  quantity: 1,
  price: "0.00",
});
const description = ref("");
const reasons = ["不想要了", "卖家发错货了", "质量问题", "商品破损", "其他"];
const selectedReason = ref("");
const tempReason = ref("");
const showReasonPopup = ref(false);
const refundImages = ref([]);
const submitting = ref(false);
const uploading = ref(false);
let orderInfoPromise = null;

function formatAmount(value) {
  return Number(value || 0).toFixed(2);
}

function toPositiveNumber(value) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
}

function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function resolveRoomId(source = {}) {
  return toPositiveNumber(firstValue(
    source,
    "RoomId",
    "roomId",
    "room_id",
    "liveRoomId",
    "live_room_id",
    "liveId",
    "live_id",
  ));
}

function syncRoomId(source = {}) {
  const nextRoomId = resolveRoomId(source);
  if (nextRoomId) roomId.value = nextRoomId;
}

function getErrorMessage(error, fallback = "图片上传失败") {
  return error?.message || error?.errMsg || error?.msg || error?.code || error?.statusCode || fallback;
}

async function loadOrderInfo(id) {
  try {
    const data = await getOrderDetail(id);
    if (!data) return;
    syncRoomId(data);
    orderStatus.value = Number(data.orderStatus || 0);
    if (orderStatus.value >= 3) {
      refundType.value = 2;
    }
    refundAmount.value = data.payAmount || 0;
    if (data.items?.length > 0) {
      const item = data.items[0];
      orderItemId.value = item.id || 0;
      refundItem.value = {
        image: item.coverImage || defaultImage,
        title: item.productName || "",
        spec: item.skuText || "",
        quantity: item.quantity || 1,
        price: item.price?.toFixed(2) || "0.00",
      };
    }
  } catch (err) {
    console.error("[Refund] loadOrderInfo fail:", err);
  }
}

onLoad((options) => {
  syncRoomId(options || {});
  if (options?.orderId) {
    orderId.value = Number(options.orderId);
    orderInfoPromise = loadOrderInfo(orderId.value);
  } else if (options?.payload) {
    const parsed = JSON.parse(decodeURIComponent(options.payload));
    refundItem.value = { ...refundItem.value, ...parsed };
    orderId.value = parsed.orderId || parsed.id || 0;
    syncRoomId(parsed);
    refundAmount.value = Number(parsed.price || 0) * (parsed.quantity || 1);
  }
  if (!roomId.value) syncRoomId(loadLiveRoomContext() || {});
});

function confirmReason() {
  if (!tempReason.value) return;
  selectedReason.value = tempReason.value;
  showReasonPopup.value = false;
}

function onUpload() {
  if (uploading.value) return;
  if (!orderId.value) {
    uni.showToast({ title: "订单信息异常", icon: "none" });
    return;
  }
  Promise.resolve(orderInfoPromise)
    .then(() => {
      if (!roomId.value) throw new Error("直播间信息异常，无法上传凭证");
      return chooseMpImage({ count: 3 - refundImages.value.length });
    })
    .then((res) => uploadImages(res.tempFilePaths || [], res.tempFiles || []))
    .catch((error) => {
      if (!String(error?.errMsg || "").includes("cancel")) {
        uni.showToast({ title: error?.message || "选择图片失败", icon: "none" });
      }
    });
}

async function uploadImages(filePaths = [], tempFiles = []) {
  const maxCount = 3 - refundImages.value.length;
  const validPaths = Array.isArray(filePaths)
    ? filePaths.slice(0, maxCount)
    : [];
  if (!validPaths.length) return;

  // 等待300ms让网络栈从文件选择器挂起中恢复（iOS/微信H5）
  await new Promise((r) => setTimeout(r, 300));

  uploading.value = true;
  const contentTypeMap = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp",
  };
  try {
    for (let i = 0; i < validPaths.length; i++) {
      const filePath = validPaths[i];
      const fileObj = tempFiles[i] || null;
      const rawFile = fileObj?.file || fileObj;
      const realName = rawFile?.name || fileObj?.name || "";
      const fileName = realName || filePath.split("/").pop() || `refund_${Date.now()}.jpg`;
      const ext = (fileName.split(".").pop() || "").toLowerCase();
      const contentType = rawFile?.type || fileObj?.type || contentTypeMap[ext] || "image/jpeg";
      const uploadId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const tempItem = {
        id: uploadId,
        url: filePath,
        rawUrl: "",
        uploading: true,
      };
      refundImages.value = [...refundImages.value, tempItem];

      try {
        const uploaded = await uploadRefundImage({
          orderId: orderId.value,
          roomId: roomId.value,
          filePath,
          file: rawFile,
          fileName,
          contentType,
        });
        refundImages.value = refundImages.value.map((item) =>
          item?.id === uploadId
            ? {
                ...item,
                url: uploaded.url,
                rawUrl: uploaded.rawUrl,
                uploading: false,
              }
            : item,
        );
      } catch (error) {
        refundImages.value = refundImages.value.filter(
          (item) => item?.id !== uploadId,
        );
        uni.showToast({
          title: String(getErrorMessage(error)),
          icon: "none",
        });
      }
    }
  } finally {
    refundImages.value = refundImages.value.map((item) =>
      item?.uploading && item?.rawUrl ? { ...item, uploading: false } : item,
    );
    uploading.value = false;
  }
}

function removeImage(index) {
  refundImages.value = refundImages.value.filter((_, i) => i !== index);
}

function previewImages(index) {
  const urls = refundImages.value
    .filter((item) => !item.uploading && item.url)
    .map((item) => item.url);

  if (!urls.length) return;

  uni.previewImage({
    urls,
    current: refundImages.value[index]?.url || urls[0],
  });
}

async function onSubmit() {
  if (submitting.value) return;
  if (!selectedReason.value) {
    uni.showToast({ title: "请选择退款原因", icon: "none" });
    return;
  }
  if (!orderId.value) {
    uni.showToast({ title: "订单信息异常", icon: "none" });
    return;
  }
  if (uploading.value || refundImages.value.some((item) => item.uploading)) {
    uni.showToast({ title: "图片上传中，请稍后提交", icon: "none" });
    return;
  }
  submitting.value = true;
  try {
    await applyRefund({
      orderId: orderId.value,
      orderItemId: orderItemId.value,
      refundType: refundType.value,
      refundAmount: refundAmount.value,
      refundReason: selectedReason.value,
      refundDesc: description.value,
      refundImages: refundImages.value
        .map((item) => item.rawUrl || item.url)
        .filter(Boolean),
    });
    uni.showToast({ title: "提交成功", icon: "success" });
    setTimeout(() => {
      uni.redirectTo({ url: "/pages/order/list?status=refund" });
    }, 1200);
  } catch (err) {
    uni.showToast({ title: err?.message || "提交失败", icon: "none" });
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.refund-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(148rpx + env(safe-area-inset-bottom));
}

.goods-card,
.form-card {
  background: #fff;
}

.goods-card {
  padding: 32rpx;
}

.goods-info {
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.goods-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 30rpx;
  background: #f5f5f5;
  flex-shrink: 0;
}

.goods-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.goods-title {
  font-size: 30rpx;
  color: #000;
  line-height: 42rpx;
  font-weight: 500;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goods-meta {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24rpx;
}

.goods-spec {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  color: #888;
  line-height: 40rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goods-count {
  flex-shrink: 0;
  font-size: 28rpx;
  color: #888;
  line-height: 40rpx;
}

.goods-price {
  display: block;
  margin-top: 20rpx;
  text-align: right;
  font-size: 30rpx;
  color: #1a1a1a;
  line-height: 42rpx;
  font-weight: 600;
}

.refund-type-row {
  margin-top: 14rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.type-options {
  display: flex;
  gap: 20rpx;
}

.type-option {
  min-width: 160rpx;
  height: 64rpx;
  padding: 0 24rpx;
  border-radius: 32rpx;
  border: 2rpx solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #666;
  box-sizing: border-box;
}

.type-option-active {
  border-color: #ff7a1a;
  color: #ff7a1a;
  background: rgba(255, 122, 26, 0.06);
}

.reason-row,
.amount-row {
  min-height: 92rpx;
  margin-top: 14rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.row-label,
.amount-label,
.block-title {
  font-size: 30rpx;
  color: #666;
}

.row-label-required::before {
  content: "*";
  color: #ff6f32;
  margin-right: 4rpx;
}

.row-right,
.amount-right {
  display: flex;
  align-items: center;
}

.row-value {
  font-size: 32rpx;
  color: #222;
}

.row-value-selected {
  font-weight: 500;
}

.row-arrow {
  margin-left: 8rpx;
  font-size: 34rpx;
  color: #9a9a9a;
}

.amount-origin {
  font-size: 30rpx;
  color: #9b9b9b;
  margin-right: 18rpx;
}

.amount-value {
  font-size: 36rpx;
  color: #ff1f16;
  font-weight: 500;
}

.evidence-card {
  margin-top: 14rpx;
  padding: 28rpx 24rpx 36rpx;
}

.desc-input {
  width: 100%;
  height: 204rpx;
  margin-top: 20rpx;
  padding: 24rpx 22rpx;
  border-radius: 16rpx;
  background: #f7f7f7;
  box-sizing: border-box;
  font-size: 28rpx;
  color: #333;
}

.upload-title {
  display: block;
  margin-top: 56rpx;
}

.upload-box {
  width: 208rpx;
  height: 208rpx;
  border-radius: 16rpx;
  background: #f7f7f7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 22rpx;
}

.upload-preview {
  width: 208rpx;
  height: 208rpx;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  background: #f7f7f7;
  flex-shrink: 0;
}

.upload-preview-image {
  width: 100%;
  height: 100%;
}

.upload-delete {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36rpx;
  height: 36rpx;
  border-radius: 18rpx;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 24rpx;
  z-index: 2;
}

.upload-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-plus {
  font-size: 52rpx;
  color: #d0d0d0;
  line-height: 1;
}

.upload-text,
.upload-limit {
  font-size: 28rpx;
  color: #c4c4c4;
  line-height: 1.5;
}

.submit-bar {
  position: fixed;
  left: 18rpx;
  right: 18rpx;
  bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.submit-btn {
  height: 92rpx;
  border-radius: 46rpx;
  background: linear-gradient(90deg, #ff8b21 0%, #ff671b 100%);
  color: #fff;
  font-size: 36rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reason-popup {
  width: 750rpx;
  height: 100%;
  background: #fff;
  border-radius: 28rpx 28rpx 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.reason-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120rpx;
  padding: 18rpx 28rpx 16rpx;
  box-sizing: border-box;
}

.reason-title {
  font-size: 40rpx;
  color: #111;
  font-weight: 600;
}

.reason-item {
  min-height: 94rpx;
  padding: 0 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1rpx solid #f1f1f1;
}

.reason-text {
  font-size: 32rpx;
  color: #444;
}

.reason-radio {
  width: 38rpx;
  height: 38rpx;
  border-radius: 50%;
  border: 2rpx solid #d7d7d7;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.reason-radio-active {
  border-color: #ff7a1a;
  background: #ff7a1a;
}

.reason-radio-icon {
  width: 20rpx;
  height: 20rpx;
}

.reason-footer {
  margin-top: auto;
  padding: 24rpx 28rpx calc(28rpx + env(safe-area-inset-bottom));
  background: #fff;
}

.reason-confirm {
  height: 92rpx;
  border-radius: 46rpx;
  background: linear-gradient(90deg, #ff8b21 0%, #ff671b 100%);
  color: #fff;
  font-size: 36rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
