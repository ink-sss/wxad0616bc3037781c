<template>
  <view :class="['section-card', variantClass]">
    <view class="section-head">
      <text class="section-title">{{ title }}</text>
      <view v-if="showLink" class="section-link" @click="emit('link')">
        <text class="section-link-text">{{ linkText }}</text>
        <text class="section-link-arrow">&gt;</text>
      </view>
    </view>

    <view v-if="mode === 'grid'" class="section-grid">
      <view
        v-for="item in items"
        :key="item.key"
        class="grid-item"
        @click="emit('item-click', item)"
      >
        <wd-badge :model-value="item.badge || ''" custom-class="grid-badge">
          <view class="grid-icon-wrap">
            <image class="grid-icon" :src="item.icon" mode="aspectFit" />
          </view>
        </wd-badge>
        <text class="grid-text">{{ item.label }}</text>
      </view>
    </view>

    <view v-else class="section-list">
      <view
        v-for="(item, index) in items"
        :key="item.key"
        :class="['list-item', index > 0 ? 'list-item-border' : '']"
        @click="emit('item-click', item)"
      >
        <view class="list-left">
          <image class="list-icon" :src="item.icon" mode="aspectFit" />
          <text class="list-text">{{ item.label }}</text>
        </view>
        <image
          class="list-arrow"
          src="https://man.lqjy.cc/static/icons/right.svg"
          mode="aspectFit"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  title: { type: String, default: "" },
  items: { type: Array, default: () => [] },
  mode: { type: String, default: "grid" },
  showLink: { type: Boolean, default: false },
  linkText: { type: String, default: "查看全部" },
  variant: { type: String, default: "order" },
});

const emit = defineEmits(["link", "item-click"]);

const variantClass = computed(() => {
  return props.variant === "more" ? "section-card-more" : "section-card-order";
});
</script>

<style lang="scss" scoped>
.section-card {
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 18rpx rgba(0, 0, 0, 0.04);
}

.section-card-order {
  padding: 28rpx 24rpx 26rpx;
}

.section-card-more {
  padding: 28rpx 24rpx 10rpx;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 34rpx;
  color: #1f1f1f;
  font-weight: 600;
}

.section-link {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.section-link-text,
.section-link-arrow {
  font-size: 26rpx;
  color: #333937;
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12rpx;
  margin-top: 26rpx;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.grid-badge {
  display: flex;
}

.grid-icon-wrap {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-icon {
  width: 42rpx;
  height: 42rpx;
}

.grid-text {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #333937;
  text-align: center;
  line-height: 36rpx;
}

/* 更多功能区：4 列 + 大图标 */
.section-card-more .section-grid {
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx 12rpx;
  margin-top: 30rpx;
}

.section-card-more .grid-icon-wrap {
  width: 80rpx;
  height: 80rpx;
}

.section-card-more .grid-icon {
  width: 42rpx;
  height: 42rpx;
}

.section-card-more .grid-text {
  margin-top: 14rpx;
  font-size: 24rpx;
  color: #333937;
}

.section-list {
  margin-top: 18rpx;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 4rpx;
}

.list-item-border {
  border-top: 1rpx solid #f3f3f3;
}

.list-left {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.list-icon {
  width: 32rpx;
  height: 32rpx;
}

.list-text {
  font-size: 30rpx;
  color: #4a4a4a;
}

.list-arrow {
  width: 24rpx;
  height: 24rpx;
}
</style>
