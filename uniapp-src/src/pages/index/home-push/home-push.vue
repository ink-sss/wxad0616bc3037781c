<template>
  <view v-if="visible" class="home-push-mask" @tap="close">
    <view class="home-push-card" @tap.stop>
      <image v-if="imageUrl" class="home-push-image" mode="aspectFill" :src="imageUrl" @tap="openLink" />
      <view class="home-push-title">{{ title }}</view>
      <view v-if="summary" class="home-push-summary">{{ summary }}</view>
      <button class="home-push-button" type="primary" @tap="openLink">立即查看</button>
      <text class="home-push-close" @tap="close">x</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'HomePush',
  props: {
    homepushData: {
      type: Object,
      default: () => ({})
    },
    homepush_data: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close'],
  data() {
    return {
      visible: true
    }
  },
  computed: {
    source() {
      return this.homepushData && Object.keys(this.homepushData).length ? this.homepushData : this.homepush_data
    },
    title() {
      return this.source.title || this.source.name || '活动提醒'
    },
    summary() {
      return this.source.summary || this.source.describe || this.source.content || ''
    },
    imageUrl() {
      return this.source.image || this.source.image_url || this.source.file_path || (this.source.imageFile && this.source.imageFile.file_path) || ''
    },
    linkUrl() {
      return this.source.link_url || this.source.linkUrl || this.source.url || ''
    }
  },
  methods: {
    close() {
      this.visible = false
      if (this.source.name) {
        uni.setStorageSync('homepush_name', this.source.name)
      }
      this.$emit('close')
    },
    openLink() {
      if (!this.linkUrl) {
        this.close()
        return
      }
      if (typeof this.gotoPage === 'function') {
        this.gotoPage(this.linkUrl)
      } else {
        uni.navigateTo({ url: this.linkUrl.startsWith('/') ? this.linkUrl : '/' + this.linkUrl })
      }
      this.close()
    }
  }
}
</script>

<style scoped>
.home-push-mask { position: fixed; inset: 0; z-index: 120; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.42); }
.home-push-card { position: relative; width: 600rpx; overflow: hidden; border-radius: 16rpx; background: #fff; text-align: center; }
.home-push-image { width: 600rpx; height: 420rpx; display: block; background: #f5f5f5; }
.home-push-title { padding: 28rpx 32rpx 8rpx; font-size: 32rpx; font-weight: 700; color: #222; }
.home-push-summary { padding: 0 32rpx 24rpx; font-size: 26rpx; line-height: 1.6; color: #666; }
.home-push-button { width: 420rpx; margin: 0 auto 32rpx; border-radius: 40rpx; background: #f03b2f; font-size: 28rpx; }
.home-push-close { position: absolute; right: 20rpx; top: 16rpx; width: 44rpx; height: 44rpx; border-radius: 50%; background: rgba(0,0,0,.45); color: #fff; line-height: 44rpx; text-align: center; }
</style>
