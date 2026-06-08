<template>
  <view class="webview-page">
    <web-view v-if="url" :src="webViewOptions.src" :progressbar-color="webViewOptions.progressbarColor" />
    <view v-else class="empty">缺少链接地址</view>
  </view>
</template>

<script>
import { webViewProps } from '../../../platform/weixin/navigation'

export default {
  data() {
    return {
      url: ''
    }
  },
  computed: {
    webViewOptions() {
      return webViewProps(this.url, { progressbarColor: '#f03b2f' })
    }
  },
  onLoad(query = {}) {
    this.url = query.url ? decodeURIComponent(query.url) : ''
  }
}
</script>

<style scoped>
.webview-page { width: 100%; min-height: 100vh; background: #fff; }
.empty { padding-top: 160rpx; color: #999; text-align: center; font-size: 26rpx; }
</style>
