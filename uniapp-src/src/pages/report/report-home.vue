<template>
  <view class="report-home">
    <view class="report-card">
      <view class="report-card-inner" @click="goSelectType">
        <view class="report-card-head">
          <text class="report-card-title">直播内容举报</text>
          <view class="report-card-arrow" aria-hidden="true">
            <text class="report-card-arrow-svg">›</text>
          </view>
        </view>
        <text class="report-card-desc">
          若遇商家发布违规/不当内容或信息、涉及夸大宣传/广告欺诈/直播侵权等情况，可向平台举报。
        </text>
      </view>
    </view>

    <!-- <view class="back-wrap" @click="goBack">
      <view class="back-icon">
        <view class="back-icon-line"></view>
      </view>
      <text class="back-text">返回</text>
    </view> -->
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { ensureH5PageAuth } from "@/services/h5-auth-context";

const liveId = ref("");
const liveName = ref("");
const cover = ref("");
const fromPath = ref("");

function goBack() {
  uni.navigateBack({
    fail: () => uni.reLaunch({ url: "/pages/broadcast/entry" }),
  });
}

function goSelectType() {
  const q =
    "liveId=" +
    encodeURIComponent(liveId.value || "") +
    "&liveName=" +
    encodeURIComponent(liveName.value || "") +
    "&cover=" +
    encodeURIComponent(cover.value || "") +
    (fromPath.value ? "&fromPath=" + encodeURIComponent(fromPath.value) : "");
  uni.navigateTo({ url: "/pages/report/report-type?" + q });
}

onLoad((options) => {
  if (!ensureH5PageAuth(options)) return;
  liveId.value = options.liveId || "";
  liveName.value = options.liveName || "";
  cover.value = options.cover || "";
  fromPath.value = options.fromPath || "";
});
</script>

<style lang="scss">
.report-home {
  width: 750rpx;
  min-height: 100vh;
  background: #fff;
  padding: 16rpx 32rpx 160rpx;
  box-sizing: border-box;
  position: relative;
}

.page-title {
  font-size: 34rpx;
  line-height: 48rpx;
  color: #000;
  text-align: center;
  font-weight: 600;
  margin-bottom: 40rpx;
}

.report-card {
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 24rpx 30rpx;
}

.report-card-inner {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.report-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}

.report-card-title {
  font-size: 34rpx;
  line-height: 48rpx;
  color: #000;
  font-weight: 600;
}

.report-card-arrow {
  width: 32rpx;
  height: 32rpx;
  color: #868686;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.report-card-arrow-svg {
  font-size: 42rpx;
  line-height: 32rpx;
}

.report-card-desc {
  font-size: 26rpx;
  line-height: 36rpx;
  color: #7f7f7f;
}

.back-wrap {
  position: fixed;
  left: 32rpx;
  bottom: calc(356rpx + env(safe-area-inset-bottom));
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  padding: 20rpx 28rpx;
  background: #fff;
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.14);
}

.back-icon {
  width: 14rpx;
  height: 24rpx;
  position: relative;
  flex-shrink: 0;
}

.back-icon-line {
  position: absolute;
  left: 0;
  top: 50%;
  width: 14rpx;
  height: 14rpx;
  border-left: 3rpx solid #fd6119;
  border-bottom: 3rpx solid #fd6119;
  transform: translateY(-50%) rotate(45deg);
  box-sizing: border-box;
}

.back-text {
  font-size: 24rpx;
  line-height: 34rpx;
  color: #fd6119;
  font-weight: 500;
}
</style>
