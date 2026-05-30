<template>
  <view class="policy-page">
    <rich-text :nodes="content || ''" />
  </view>
</template>

<script>
export default {
  data() {
    return {
      type: '',
      content: ''
    }
  },
  onLoad(query = {}) {
    this.type = query.type || 'privacy'
    const title = this.type === 'service' ? '用户协议' : '隐私协议'
    uni.setNavigationBarTitle({ title })
    this.getData()
  },
  methods: {
    getData() {
      if (typeof this._get !== 'function') {
        // TODO:migration: policy content needs shared _get runtime.
        return
      }
      this._get('user.userapple/policy', {}, (res) => {
        const data = res.data || {}
        this.content = this.type === 'service' ? data.service : data.privacy
      })
    }
  }
}
</script>

<style scoped>
.policy-page { min-height: 100vh; padding: 32rpx; background: #fff; color: #333; font-size: 28rpx; line-height: 1.8; box-sizing: border-box; }
</style>
