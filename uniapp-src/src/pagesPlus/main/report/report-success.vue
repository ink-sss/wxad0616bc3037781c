<template>
  <view class="success-page">
    <view class="nav-bar">
      <text class="nav-back" @click="close">‹</text>
      <text class="nav-title">提交成功</text>
    </view>

    <view class="content">
      <view class="icon-wrap">
        <text class="success-check">✓</text>
      </view>
      <text class="title">提交成功</text>
      <text class="desc">您的投诉已提交，系统正在核实中</text>

      <view class="theme-primary-btn" @click="backToLive">
        返回直播
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

const fromPath = ref("");

function backToLive() {
  const pages = getCurrentPages();
  const liveIdx = (() => {
    for (let i = pages.length - 1; i >= 0; i--) {
      const r = (pages[i] && pages[i].route) || "";
      if (r === "pages/broadcast/entry" || r === "pages/broadcast/replay") return i;
    }
    return -1;
  })();

  if (liveIdx >= 0) {
    const delta = pages.length - 1 - liveIdx;
    if (delta > 0) {
      uni.navigateBack({
        delta,
        fail: () => {
          if (fromPath.value) {
            uni.reLaunch({ url: fromPath.value });
          } else {
            uni.reLaunch({ url: "/pages/broadcast/entry" });
          }
        },
      });
      return;
    }
  }

  if (fromPath.value) {
    uni.reLaunch({ url: fromPath.value });
  } else {
    uni.reLaunch({ url: "/pages/broadcast/entry" });
  }
}

function close() {
  backToLive();
}

onLoad((options) => {
  fromPath.value = options.fromPath || "";
});
</script>

<style lang="scss">
.success-page {
  width: 750rpx;
  min-height: 100vh;
  background: #fff;
}

.nav-bar {
  height: 88rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1rpx solid #f3f3f3;
  box-sizing: border-box;
}

.nav-back {
  position: absolute;
  left: 28rpx;
  top: 50%;
  transform: translateY(-50%);
  color: #222;
  font-size: 54rpx;
  line-height: 54rpx;
}

.nav-title {
  color: #222;
  font-size: 32rpx;
  font-weight: 600;
}

.content {
  padding-top: 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-wrap {
  width: 140rpx;
  height: 140rpx;
  border-radius: 70rpx;
  background: #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-check {
  color: #fff;
  font-size: 78rpx;
  line-height: 78rpx;
}

.title {
  margin-top: 26rpx;
  font-size: 34rpx;
  color: #000;
  font-weight: 600;
}

.desc {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: rgba(0, 0, 0, 0.45);
}

.theme-primary-btn {
  margin-top: 54rpx;
  width: 560rpx;
  height: 92rpx;
  border-radius: 46rpx;
  border: none;
  background: linear-gradient(90deg, #fd7e19 0%, #ff6b2e 100%);
  box-shadow: 0 18rpx 36rpx rgba(255, 107, 46, 0.24);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 600;
}
</style>
