<template>
  <view class="uni-load-more"><text>{{ statusText }}</text></view>
</template>
<script>
export default {
  name: 'UniLoadMore',
  props: { status: { type: String, default: 'more' }, contentText: { type: Object, default: () => ({ contentdown: '上拉显示更多', contentrefresh: '正在加载...', contentnomore: '没有更多数据了' }) } },
  computed: { statusText() { return this.status === 'loading' ? this.contentText.contentrefresh : this.status === 'noMore' || this.status === 'nomore' ? this.contentText.contentnomore : this.contentText.contentdown; } }
};
</script>
<style scoped>
.uni-load-more { min-height: 80rpx; display: flex; align-items: center; justify-content: center; color: #999; font-size: 24rpx; }
</style>
