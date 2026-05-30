<template>
  <view :class="['diy-surface', 'drag', 'optional', 'drag__nomove', shouldHide && 'close']" :style="surfaceStyle">
    <view class="surface-icon" @tap="toLink">
      <image lazy-load mode="aspectFill" :src="params.image"></image>
    </view>
  </view>
</template>
<script>
export default {
  name: 'DiySurface',
  props: {
    itemData: { type: Object, default: () => ({}) },
    diytop: { type: [Number, String], default: 0 }
  },
  computed: {
    params() { return this.itemData.params || {} },
    styleConfig() { return this.itemData.style || {} },
    shouldHide() { return Number(this.params.showType) === 2 && Number(this.diytop || 0) < 50 },
    surfaceStyle() {
      const s = this.styleConfig
      return `right:${s.right || 0}%;bottom:${s.bottom || 0}%;opacity:${Number(s.opacity || 100) / 100};`
    }
  },
  methods: {
    toLink() {
      if (Number(this.params.type) === 2 && this.params.link && this.params.link.linkUrl) {
        if (typeof this.gotoPage === 'function') this.gotoPage(this.params.link.linkUrl)
        return
      }
      uni.pageScrollTo({ scrollTop: 0, duration: 300 })
    }
  }
}
</script>
<style scoped>
.diy-surface { bottom: 0; display: block; height: 120rpx; position: fixed; right: 0; transition: all .5s; width: 120rpx; z-index: 99; }
.diy-surface.close { display: none; }
.diy-surface .surface-icon { height: 120rpx; width: 120rpx; }
.diy-surface .surface-icon image { height: 100%; width: 100%; }
</style>
