<template>
  <scroll-view scroll-x class="ss-scroll-navbar">
    <view class="ss-scroll-navbar__inner">
      <view v-for="(item, index) in navArr" :key="item.id || item.value || item.name || index" :class="['ss-scroll-navbar__item', index === tabCurrentIndex ? 'active' : '']" :style="itemStyle(index)" @tap="$emit('navbarTap', index)">{{ item.name || item.title || item.text || item.label }}</view>
    </view>
  </scroll-view>
</template>
<script>
export default {
  name: 'SsScrollNavbar',
  props: ['tabCurrentIndex', 'scrollChangeIndex', 'navArr', 'color', 'activeText', 'optionType', 'activeColorF', 'activeColorS', 'defaultColor', 'marginRight'],
  emits: ['navbarTap'],
  methods: { itemStyle(index) { return { marginRight: (this.marginRight || 32) + 'rpx', color: index === this.tabCurrentIndex ? (this.activeText || this.activeColorF || this.color || '#222') : (this.defaultColor || '#666') }; } }
};
</script>
<style scoped>
.ss-scroll-navbar { width: 100%; white-space: nowrap; }
.ss-scroll-navbar__inner { display: flex; align-items: center; padding: 0 24rpx; }
.ss-scroll-navbar__item { flex: 0 0 auto; min-height: 72rpx; line-height: 72rpx; font-size: 28rpx; }
.ss-scroll-navbar__item.active { font-weight: 600; }
</style>
