<template>
  <view class="drag optional diy-search-box" :style="wrapperStyle">
    <view class="top_head pr">
      <view class="head_top" :style="headTopStyle"></view>
    </view>
    <view class="diy-search navigation d-s-c" :style="navStyle">
      <image v-if="params.title_type === 'image'" class="logo-img" mode="aspectFill" :src="params.toplogo"></image>
      <view v-if="params.title_type === 'text'" class="f30" :style="`color:${styleConfig.titleTextColor};`">{{ params.title }}</view>
      <view class="phone-top-search-box d-s-c" :style="searchStyle" @tap="gotoSearch">
        <text class="icon iconfont icon-sousuo1" :style="`color:${styleConfig.searchColor || '#999'};`"></text>
        {{ params.searchText }}
      </view>
    </view>
  </view>
</template>
<script>
export default {
  name: 'DiySearch',
  props: { itemData: { type: Object, default: () => ({}) } },
  computed: {
    styleConfig() { return this.itemData.style || {} },
    params() { return this.itemData.params || {} },
    navBackground() {
      return this.resolveBackground(this.styleConfig, ['bgcolor', 'backgroundColor', 'background', 'bgcolor_color1', 'bgcolorColor1'])
    },
    wrapperBackground() {
      return this.resolveBackground(this.styleConfig, ['background', 'backgroundColor', 'bgcolor', 'bgcolor_color1', 'bgcolorColor1']) || this.navBackground
    },
    wrapperStyle() {
      const s = this.styleConfig
      return `background:${this.wrapperBackground};padding-left:${this.toRpx(s.paddingLeft)};padding-right:${this.toRpx(s.paddingLeft)};padding-top:${this.toRpx(s.paddingTop)};padding-bottom:${this.toRpx(s.paddingBottom)};`
    },
    navStyle() {
      const s = this.styleConfig
      const top = 2 * Number(s.topRadio || 0)
      const bottom = 2 * Number(s.bottomRadio || 0)
      return `background:${this.navBackground || this.wrapperBackground};border-top-left-radius:${top}rpx;border-top-right-radius:${top}rpx;border-bottom-left-radius:${bottom}rpx;border-bottom-right-radius:${bottom}rpx;`
    },
    headTopStyle() {
      return `height:${this.topBarTopSafe()}px;background:${this.wrapperBackground};`
    },
    searchStyle() {
      const s = this.styleConfig
      return `background:${s.searchBackGround || '#f5f5f5'};color:${s.searchColor || '#999'};margin-right:${this.topBarRightSafe()};`
    }
  },
  methods: {
    resolveBackground(style, keys) {
      for (const key of keys) {
        if (key === 'bgcolor_color1' && style && style.bgcolor_color1 && style.bgcolor_color2) {
          return `linear-gradient(to right, ${style.bgcolor_color1}, ${style.bgcolor_color2})`
        }
        const value = style && style[key]
        if (typeof value === 'string' && value.trim()) return value
      }
      return ''
    },
    toRpx(value) { return value === undefined || value === '' ? '' : `${2 * Number(value || 0)}rpx` },
    topBarTopSafe() { return typeof this.topBarTop === 'function' ? this.topBarTop() : 0 },
    topBarRightSafe() { return typeof this.topBarRight === 'function' ? this.topBarRight() : '0rpx' },
    gotoSearch() {
      if (typeof this.gotoPage === 'function') this.gotoPage('/pagesPlus/main/product/search/search')
    }
  }
}
</script>
<style scoped>
.diy-search {
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  padding: 0 24rpx 18rpx;
  width: 100%;
}
.diy-search .logo-img { display: block; flex-shrink: 0; height: 64rpx; width: 78rpx; }
.diy-search .f30 { flex-shrink: 0; }
.diy-search .phone-top-search-box {
  align-items: center;
  border-radius: 60rpx;
  color: #999;
  display: flex;
  flex: 1 1 auto;
  flex-direction: row;
  flex-wrap: nowrap;
  font-size: 26rpx;
  height: 60rpx;
  justify-content: flex-start;
  line-height: 60rpx;
  margin-left: 30rpx;
  min-width: 0;
  overflow: hidden;
  padding: 0 20rpx;
  white-space: nowrap;
}
.diy-search .icon-sousuo1 { flex-shrink: 0; font-size: 26rpx; margin-right: 20rpx; }
.diy-search-box { box-sizing: border-box; left: 0; position: sticky; top: 0; width: 100%; z-index: 100; }
.diy-search-box .top_head,
.diy-search-box .head_top { background: inherit; width: 100%; }
</style>
