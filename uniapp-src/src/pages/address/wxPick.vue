<template>
  <view class="wx-pick-page">
    <view class="pick-status">
      <view v-if="step !== 'error'" class="pick-loading">
        <text class="pick-text">{{ statusText }}</text>
      </view>
      <view v-else class="pick-error">
        <text class="pick-text">{{ errorMsg }}</text>
        <view class="pick-btn" @click="retryPick">重新导入</view>
        <view class="pick-btn pick-btn-secondary" @click="goBack">返回</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { importWxAddress } from "@/services/wechat-address";

const step = ref("loading");
const errorMsg = ref("");
const redirectUrl = ref("/pages/address/index");

const statusText = computed(() => {
  if (step.value === "picking") return "请在微信弹窗中选择收货地址";
  if (step.value === "saving") return "正在保存地址...";
  if (step.value === "success") return "地址导入成功，正在返回...";
  return "正在准备获取微信地址...";
});

function goBack() {
  uni.redirectTo({
    url: redirectUrl.value,
    fail: () => uni.navigateBack(),
  });
}

function retryPick() {
  startPick();
}

async function startPick() {
  try {
    step.value = "picking";
    const ok = await importWxAddress();
    if (!ok) {
      step.value = "error";
      errorMsg.value = "未导入微信地址";
      return;
    }
    step.value = "success";
    setTimeout(goBack, 500);
  } catch (error) {
    step.value = "error";
    errorMsg.value = error?.message || "导入微信地址失败";
  }
}

onLoad((options = {}) => {
  const from = options.from || options.redirect || "";
  if (from) redirectUrl.value = decodeURIComponent(from);
  startPick();
});
</script>

<style lang="scss" scoped>
.wx-pick-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.pick-status {
  text-align: center;
  padding: 60rpx 40rpx;
}

.pick-loading,
.pick-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30rpx;
}

.pick-text {
  font-size: 30rpx;
  color: #666;
  line-height: 1.6;
}

.pick-btn {
  margin-top: 20rpx;
  padding: 16rpx 60rpx;
  background: #07c160;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.pick-btn-secondary {
  background: #d9d9d9;
  color: #333;
}
</style>
