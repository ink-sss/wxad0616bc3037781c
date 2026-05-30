<template>
  <view class="pb10 theme-bg app-header-spacer">
    <view class="status_bar"></view>
    <view class="top_view"></view>
  </view>
</template>
<script>
export default { name: 'Header' };
</script>
<style scoped>
.app-header-spacer { width: 100%; }
.status_bar { height: var(--status-bar-height); width: 100%; }
.top_view { height: 44px; width: 100%; }
</style>
