<template>
  <view class="diy-banner-box pr" :style="wrapperStyle">
    <view class="pr">
      <view :class="['swiper-dots', 'ww100', 'd-c-c', styleConfig.imgShape || 'round']">
        <view
          v-for="(item, index) in dataList"
          :key="'dot-' + index"
          :class="current === index ? 'swiper-dot active' : 'swiper-dot'"
          :style="`background-color:${indicatorActiveColor};`"
        ></view>
      </view>
      <swiper autoplay class="swiper" :duration="500" :interval="2000" :style="`height:${styleConfig.height || 240}rpx;`" @change="changeSwiper">
        <swiper-item v-for="(item, index) in dataList" :key="index" class="o-h" :style="`height:${styleConfig.height || 240}rpx;${radiusStyle}`" @tap="gotoPages(item)">
          <image lazy-load :src="item.imgUrl" :style="`height:${styleConfig.height || 240}rpx;${radiusStyle}`"></image>
        </swiper-item>
      </swiper>
    </view>
  </view>
</template>
<script>
export default {
  name: 'DiyBanner',
  props: { itemData: { type: Object, default: () => ({}) } },
  data() { return { current: 0 } },
  computed: {
    dataList() { return Array.isArray(this.itemData.data) ? this.itemData.data : [] },
    styleConfig() { return this.itemData.style || {} },
    indicatorActiveColor() { return this.styleConfig.btnColor || '#ffffff' },
    wrapperStyle() {
      const s = this.styleConfig
      return `background:${s.background || ''};padding-left:${this.toRpx(s.paddingLeft)};padding-right:${this.toRpx(s.paddingLeft)};padding-top:${this.toRpx(s.paddingTop)};padding-bottom:${this.toRpx(s.paddingBottom)};`
    },
    radiusStyle() {
      const top = 2 * Number(this.styleConfig.topRadio || 0)
      const bottom = 2 * Number(this.styleConfig.bottomRadio || 0)
      return `border-radius:${top}rpx ${top}rpx ${bottom}rpx ${bottom}rpx;`
    }
  },
  methods: {
    toRpx(value) { return `${2 * Number(value || 0)}rpx` },
    changeSwiper(event) { this.current = event.detail.current },
    gotoPages(item) { if (item && item.linkUrl && typeof this.gotoPage === 'function') this.gotoPage(item.linkUrl) }
  }
}
</script>
<style scoped>
.diy-banner-box { box-sizing: border-box; overflow: hidden; }
.diy-banner-box,.diy-banner-box .swiper,.diy-banner-box image { width: 100%; }
.swiper-dots { bottom: 20rpx; left: 0; margin: auto; position: absolute; right: 0; width: 100%; z-index: 2; }
.swiper-dots.round .swiper-dot,.swiper-dots.square .swiper-dot { background: #ebedf0; height: 14rpx; margin: 0 4rpx; opacity: .3; width: 14rpx; }
.swiper-dots.round .swiper-dot { border-radius: 50%; }
.swiper-dots.rectangle .swiper-dot { background: #ebedf0; border-radius: 4rpx; height: 6rpx; margin: 0 4rpx; opacity: .3; width: 40rpx; }
.swiper-dots .swiper-dot.active { opacity: 1; }
</style>
