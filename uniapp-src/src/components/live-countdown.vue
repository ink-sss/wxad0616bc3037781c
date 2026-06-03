<template>
  <!-- 竖屏：深色卡片翻页时分秒 + 开通提醒按钮 -->
  <view
    v-if="variant === 'portrait'"
    class="lc-portrait"
    :style="portraitStyle"
    @click.stop
  >
    <text class="lc-portrait__title">距离直播时间还有</text>
    <view class="lc-portrait__flip-row">
      <view v-for="(item, idx) in portraitParts" :key="idx" class="lc-portrait__cell">
        <view class="lc-portrait__flip">
          <text class="lc-portrait__flip-num">{{ item.num }}</text>
        </view>
        <text class="lc-portrait__label">{{ item.label }}</text>
      </view>
    </view>
    <view v-if="showSubscribe" class="lc-portrait__btn" @click="handleSubscribe">
      <image class="lc-portrait__btn-icon" src="./static/icons/heart.png" mode="aspectFit" />
      <text class="lc-portrait__btn-text">立即开通提醒</text>
    </view>
  </view>

  <!-- 横屏：浅色胶囊条 -->
  <view v-else class="lc-landscape" @click.stop>
    <text class="lc-landscape__label">距开播</text>
    <text class="lc-landscape__chip">{{ landscape.dd }}</text>
    <text class="lc-landscape__unit">天</text>
    <text class="lc-landscape__chip">{{ landscape.hh }}</text>
    <text class="lc-landscape__unit">时</text>
    <text class="lc-landscape__chip">{{ landscape.mm }}</text>
    <text class="lc-landscape__unit">分</text>
    <text class="lc-landscape__chip">{{ landscape.ss }}</text>
    <text class="lc-landscape__unit">秒</text>
  </view>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  /** portrait | landscape */
  variant: { type: String, default: "portrait" },
  /** { d,h,m,s, dd,hh,mm,ss } */
  countdown: {
    type: Object,
    default: () => ({ d: 0, h: 0, m: 0, s: 0, dd: "00", hh: "00", mm: "00", ss: "00" }),
  },
  /** 底部偏移(safe-area + bottom-bar 高度)，仅竖屏用 */
  bottomOffset: { type: [Number, String], default: 140 },
  /** 推送提前分钟数，仅用于文案占位 */
  pushTime: { type: Number, default: 0 },
  /** 订阅配置可用时展示提醒入口 */
  showSubscribe: { type: Boolean, default: true },
});

const emit = defineEmits(["subscribe"]);

const portraitStyle = computed(() => ({
  bottom: typeof props.bottomOffset === "number"
    ? props.bottomOffset + "rpx"
    : props.bottomOffset,
}));

// 竖屏显示时/分/秒；若有天数则把"时"合并为"天+时"
const portraitParts = computed(() => {
  const c = props.countdown || {};
  if ((c.d || 0) > 0) {
    return [
      { num: String(c.d ?? 0).padStart(2, "0"), label: "天" },
      { num: c.hh ?? "00", label: "时" },
      { num: c.mm ?? "00", label: "分" },
    ];
  }
  return [
    { num: c.hh ?? "00", label: "时" },
    { num: c.mm ?? "00", label: "分" },
    { num: c.ss ?? "00", label: "秒" },
  ];
});

const landscape = computed(() => ({
  dd: String(props.countdown?.d ?? 0).padStart(2, "0"),
  hh: props.countdown?.hh ?? "00",
  mm: props.countdown?.mm ?? "00",
  ss: props.countdown?.ss ?? "00",
}));

function handleSubscribe() {
  emit("subscribe", { pushTime: props.pushTime });
}
</script>

<style lang="scss" scoped>
/* ===== 竖屏样式 ===== */
.lc-portrait {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  z-index: 40;
  padding: 32rpx 24rpx 28rpx;
  border-radius: 24rpx;
  background: linear-gradient(180deg, rgba(28, 30, 46, 0.92) 0%, rgba(18, 20, 34, 0.96) 100%);
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: auto;
}

.lc-portrait__title {
  color: rgba(255, 255, 255, 0.86);
  font-size: 26rpx;
  line-height: 1.4;
  margin-bottom: 22rpx;
}

.lc-portrait__flip-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 28rpx;
}

.lc-portrait__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lc-portrait__flip {
  min-width: 104rpx;
  height: 104rpx;
  padding: 0 14rpx;
  border-radius: 14rpx;
  background: linear-gradient(180deg, #4a4e66 0%, #2f3346 100%);
  box-shadow: inset 0 -2rpx 0 rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.lc-portrait__flip::after {
  content: "";
  position: absolute;
  left: 6rpx;
  right: 6rpx;
  top: 50%;
  height: 2rpx;
  background: rgba(0, 0, 0, 0.35);
  transform: translateY(-50%);
}

.lc-portrait__flip-num {
  color: #ffffff;
  font-size: 52rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  line-height: 1;
}

.lc-portrait__label {
  margin-top: 12rpx;
  color: rgba(255, 255, 255, 0.7);
  font-size: 22rpx;
}

.lc-portrait__btn {
  width: 100%;
  height: 80rpx;
  border-radius: 40rpx;
  background: var(--wot-color-theme, #ff6a00);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  box-shadow: 0 6rpx 20rpx rgba(255, 106, 0, 0.35);
}

.lc-portrait__btn-icon {
  width: 28rpx;
  height: 28rpx;
}

.lc-portrait__btn-text {
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
}

.lc-portrait__tip {
  margin-top: 18rpx;
  color: rgba(255, 255, 255, 0.55);
  font-size: 22rpx;
  text-align: center;
}

/* ===== 横屏样式 ===== */
.lc-landscape {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 10rpx 18rpx;
  background: #ffffff;
  border-bottom: 1rpx solid #f0f0f4;
}

.lc-landscape__label {
  color: #1f2430;
  font-size: 24rpx;
  margin-right: 4rpx;
}

.lc-landscape__chip {
  min-width: 44rpx;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
  background: #ecf0ff;
  color: #2f6bff;
  font-size: 24rpx;
  font-weight: 600;
  text-align: center;
  letter-spacing: 1rpx;
}

.lc-landscape__unit {
  color: #1f2430;
  font-size: 24rpx;
  margin: 0 2rpx;
}
</style>
