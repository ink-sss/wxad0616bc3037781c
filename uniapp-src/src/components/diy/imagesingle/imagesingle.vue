<template>
  <view class="diy-imageSingle" :style="wrapperStyle">
    <view v-for="(item, index) in dataList" :key="index" class="d-c-c o-h" :style="radiusStyle" @tap="gotoPages(item)">
      <image lazy-load mode="widthFix" :src="item.imgUrl || item.image"></image>
    </view>
  </view>
</template>
<script>
export default {
  name: 'DiyImagesingle',
  props: { itemData: { type: Object, default: () => ({}) } },
  computed: {
    dataList() { return Array.isArray(this.itemData.data) ? this.itemData.data : [] },
    styleConfig() { return this.itemData.style || {} },
    wrapperStyle() {
      const s = this.styleConfig
      return `padding-top:${this.toRpx(s.paddingTop)};padding-bottom:${this.toRpx(s.paddingTop)};padding-left:${this.toRpx(s.paddingLeft)};padding-right:${this.toRpx(s.paddingLeft)};background:${s.background || ''};`
    },
    radiusStyle() {
      const top = 2 * Number(this.styleConfig.topRadio || 0)
      const bottom = 2 * Number(this.styleConfig.bottomRadio || 0)
      return `border-top-left-radius:${top}rpx;border-top-right-radius:${top}rpx;border-bottom-left-radius:${bottom}rpx;border-bottom-right-radius:${bottom}rpx;`
    }
  },
  methods: {
    toRpx(value) { return `${2 * Number(value || 0)}rpx` },
    gotoPages(item) { if (item && item.linkUrl && typeof this.gotoPage === 'function') this.gotoPage(item.linkUrl) }
  }
}
</script>
<style scoped>
.diy-imageSingle image { width: 100%; }
</style>
