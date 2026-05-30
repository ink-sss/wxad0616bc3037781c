<template>
  <view class="drag optional pr">
    <view :class="['fixed-top', !params.topUp && 'close']" :style="fixedTopStyle">
      <view class="top_head pr">
        <view class="head_top" :style="headTopStyle"></view>
      </view>
      <view class="bg-topMerge" :style="fixedBackgroundStyle">
        <image
          v-for="(item, index) in images"
          :key="'fixed-bg-' + index"
          :class="[current === index && 'active', 'bgimg']"
          :src="item.imgUrl || ''"
        />
      </view>
      <view :class="['navigation', 'd-s-c', !params.showCategory && 'mb20']">
        <image class="logo-img" mode="aspectFill" :src="params.topLogo"></image>
        <view class="phone-top-search-box d-s-c" :style="`margin-right:${topBarRightSafe()};`" @tap="openSearch(true)">
          <text class="icon iconfont icon-sousuo1" :style="`color:${styleConfig.searchColor || '#999'};`"></text>
          {{ params.searchText }}
        </view>
      </view>
      <view v-if="params.showCategory" class="d-b-c">
        <view class="flex-1 o-h">
          <scroll-view scroll-x class="category-scroll">
            <view class="category-tabs">
              <view
                v-for="(item, index) in dataList"
                :key="item.category_id || index"
                :class="['category-tab', thisindex === index && 'active']"
                :style="`margin-right:${styleConfig.categoryPadding || 0}rpx;`"
                @tap="setIndex(index)"
              >
                {{ item.text || item.name || item.title }}
              </view>
            </view>
          </scroll-view>
        </view>
        <text class="icon iconfont icon-caidan" @tap="isCategotyPop = true"></text>
      </view>
    </view>

    <view class="bg-topMerge" :style="backgroundLayerStyle">
      <image
        v-for="(item, index) in images"
        :key="'bg-' + index"
        :class="[current === index && 'active', 'bgimg']"
        :src="item.imgUrl || ''"
      />
    </view>
    <view class="bg-topMerge-color" :style="`background-image:${backgroundGradient};`"></view>
    <view class="diy-TopMerge">
      <view v-if="params.topUp" :style="`height:${topHead(params.showCategory ? 168 : 102)}rpx;width:100%;`"></view>
      <swiper
        class="swiper"
        autoplay
        :duration="500"
        :interval="5000"
        :previous-margin="params.type === 1 ? '0' : '40rpx'"
        :next-margin="params.type === 1 ? '0' : '40rpx'"
        @change="changeSwiper"
      >
        <swiper-item v-for="(item, index) in images" :key="index" class="o-h" @tap="gotoPages(item)">
          <image
            lazy-load
            :class="['image', `imageType${params.type || 1}`, current === index && 'active']"
            mode="aspectFill"
            :src="item.imgUrl"
            :style="bannerRadius"
          />
        </swiper-item>
      </swiper>
    </view>
    <view :class="['dots', 'center', 'd-c-c', styleConfig.btnShape === 'left' && 'd-s-c', styleConfig.btnShape === 'center' && 'd-c-c', styleConfig.btnShape === 'right' && 'd-e-c']">
      <view
        v-for="(item, index) in images"
        :key="'dot-' + index"
        :class="[current === index && 'active', styleConfig.imgShape || 'round']"
        :style="`background:${current === index ? styleConfig.btnColor : styleConfig.btnOpColor};`"
      ></view>
    </view>
    <view v-if="isCategotyPop" class="pop-bg" @tap="isCategotyPop = false">
      <view class="categotyPopBox" @tap.stop>
        <view class="top_head pr">
          <view class="head_top" :style="`height:${topBarTopSafe()}px;min-height:20rpx;`"></view>
        </view>
        <view class="f32 gray3 tiltles">精选类目</view>
        <view class="categotyPop-list">
          <view
            v-for="(item, index) in dataList"
            :key="item.category_id || index"
            :class="['categotyPop-item', 'text-ellipsis', thisindex === index && 'active']"
            @tap="changeIndex(index)"
          >
            {{ item.text || item.name || item.title }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'DiyTopMerge',
  props: {
    itemData: { type: Object, default: () => ({}) },
    diytop: { type: [Number, String], default: 0 }
  },
  emits: ['setIndex', 'parentFunc'],
  data() {
    return {
      thisindex: 0,
      current: 0,
      category_id: '',
      op: 0,
      isCategotyPop: false,
      _wW: 1
    }
  },
  computed: {
    dataList() { return Array.isArray(this.itemData.data) ? this.itemData.data : [] },
    images() { return Array.isArray(this.itemData.images) ? this.itemData.images : [] },
    styleConfig() { return this.itemData.style || {} },
    params() { return this.itemData.params || {} },
    backgroundGradient() {
      return `linear-gradient(rgba(245, 245, 245, 0) 0%, rgba(245, 245, 245, 0) 50%, ${this.styleConfig.bgcolor_color1 || '#fff'} 100%)`
    },
    topMergeBackground() {
      const s = this.styleConfig
      if (s.background) return s.background
      if (s.backgroundColor) return s.backgroundColor
      if (s.bgcolor) return s.bgcolor
      if (s.bgcolor_color1 && s.bgcolor_color2) {
        return `linear-gradient(to right, ${s.bgcolor_color1}, ${s.bgcolor_color2})`
      }
      return s.bgcolor_color1 || s.bgcolorColor1 || s.bgcolor_color2 || '#fff'
    },
    fixedTopStyle() {
      return `background:${this.topMergeBackground};`
    },
    headTopStyle() {
      return `height:${this.topBarTopSafe()}px;background:${this.topMergeBackground};`
    },
    fixedBackgroundStyle() {
      return `height:${this.topHead(this.params.showCategory ? 508 : 442)}rpx;background:${this.topMergeBackground};`
    },
    backgroundLayerStyle() {
      return `background:${this.topMergeBackground};`
    },
    bannerRadius() {
      const top = 2 * Number(this.styleConfig.topRadio || 0)
      const bottom = 2 * Number(this.styleConfig.bottomRadio || 0)
      return `border-radius:${top}rpx ${top}rpx ${bottom}rpx ${bottom}rpx;`
    }
  },
  watch: {
    diytop(value, oldValue) {
      if (value !== oldValue) {
        const next = Number(value) * this._wW / (20 * this._wW)
        this.op = next >= 1 ? 1 : next
      }
    }
  },
  created() {
    uni.getSystemInfo({
      success: (res) => {
        this._wW = res.windowWidth / 750
      }
    })
  },
  methods: {
    topBarTopSafe() { return typeof this.topBarTop === 'function' ? this.topBarTop() : 0 },
    topBarRightSafe() { return typeof this.topBarRight === 'function' ? this.topBarRight() : '0rpx' },
    topHead(value) { return value + 2 * this.topBarTopSafe() },
    openSearch(value) { this.$emit('parentFunc', { name: 'openSearch', value }) },
    changeIndex(index) {
      this.setIndex(index)
      this.isCategotyPop = false
    },
    setIndex(index) {
      this.thisindex = index
      this.category_id = (this.dataList[index] && this.dataList[index].category_id) || ''
      this.$emit('setIndex', this.thisindex, this.category_id)
    },
    changeSwiper(event) { this.current = event.detail.current },
    gotoPages(item) {
      if (!item || !item.linkUrl) return
      if (typeof this.gotoPage === 'function') this.gotoPage(item.linkUrl)
      else uni.navigateTo({ url: item.linkUrl.startsWith('/') ? item.linkUrl : '/' + item.linkUrl })
    }
  }
}
</script>

<style scoped>
.optional { padding-bottom: 22rpx; }
.bg-topMerge-color { height: 100%; left: 0; overflow: hidden; position: absolute; top: 0; width: 100%; z-index: 1; }
.bg-topMerge { filter: blur(0); height: 100%; overflow: hidden; position: absolute; top: 0; width: 100%; z-index: 0; }
.bg-topMerge .bgimg { display: none; filter: blur(30rpx); height: 100%; transform: scale(1.5); transition: all .5s ease; width: 100%; }
.bg-topMerge .active { animation: changeBaner 1s forwards; display: block; }
@keyframes changeBaner { 0% { opacity: .6; } 20% { opacity: .8; } 75% { opacity: 1; } }
.diy-TopMerge { position: relative; z-index: 1; }
.navigation {
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  padding: 0 24rpx;
  position: relative;
  z-index: 1;
}
.navigation .logo-img { display: block; flex-shrink: 0; height: 64rpx; position: relative; width: 78rpx; z-index: 1; }
.navigation .phone-top-search-box {
  align-items: center;
  background-color: #fff;
  border-radius: 60rpx;
  color: #999;
  display: flex;
  flex: 1 1 auto;
  flex-direction: row;
  flex-wrap: nowrap;
  font-size: 26rpx;
  height: 60rpx;
  justify-content: flex-start;
  line-height: 30rpx;
  margin-left: 30rpx;
  min-width: 0;
  overflow: hidden;
  padding: 0 20rpx;
  position: relative;
  white-space: nowrap;
  z-index: 1;
}
.navigation .phone-top-search-box .icon-sousuo1 { font-size: 26rpx; margin-right: 12rpx; }
.swiper { height: 318rpx; }
.swiper .image { display: block; margin: 0 auto; transform: scale(1); }
.swiper .imageType1.image { height: 318rpx; width: 710rpx; }
.swiper .imageType2.image { height: 318rpx; transform: scale(.94); transition: transform .5s ease; width: 670rpx; }
.swiper .imageType2.image.active { transform: scale(1); }
.dots { bottom: 40rpx; box-sizing: border-box; left: 0; margin: 0 auto; padding: 0 40rpx; position: absolute; right: 0; width: 100%; z-index: 1; }
.dots .round,.dots .square { background: #ebedf0; height: 14rpx; margin: 0 4rpx; opacity: .3; width: 14rpx; }
.dots .round { border-radius: 50%; }
.dots .rectangle { background: #ebedf0; border-radius: 4rpx; height: 6rpx; margin: 0 4rpx; opacity: .3; width: 40rpx; }
.dots .active { opacity: 1; }
.fixed-top.close { position: relative; }
.fixed-top { left: 0; overflow: hidden; position: fixed; top: 0; width: 100%; z-index: 100; }
.fixed-top .top_head,
.fixed-top .head_top { background: inherit; width: 100%; }
.fixed-top .d-b-c { align-items: center; display: flex; justify-content: space-between; position: relative; z-index: 1; }
.fixed-top .icon-caidan { color: #fff; font-size: 30rpx; margin-left: 20rpx; margin-right: 20rpx; position: relative; z-index: 1; }
.fixed-top .phone-top-search-box { background: #f5f5f5; line-height: 30rpx; }
.category-scroll { position: relative; z-index: 1; white-space: nowrap; width: 100%; }
.category-tabs { align-items: center; display: flex; flex-wrap: nowrap; padding: 18rpx 24rpx; }
.category-tab { color: #fff; flex-shrink: 0; font-size: 28rpx; line-height: 48rpx; padding: 0 8rpx; position: relative; }
.category-tab.active { font-size: 32rpx; font-weight: 700; }
.pop-bg { background-color: rgba(0,0,0,.7); bottom: 0; left: 0; position: fixed; right: 0; top: 0; z-index: 1000; }
.pop-bg .categotyPopBox { background-color: #fff; border-radius: 0 0 25rpx 25rpx; padding: 0 20rpx 32rpx; }
.tiltles { height: 60rpx; line-height: 60rpx; margin-bottom: 22rpx; }
.categotyPop-list { align-items: center; display: flex; flex-wrap: wrap; justify-content: flex-start; }
.categotyPop-item { background: #f7f7f7; border: 1px solid #f7f7f7; border-radius: 32rpx; box-sizing: border-box; height: 64rpx; line-height: 64rpx; margin-bottom: 20rpx; margin-right: 20rpx; padding: 0 20rpx; text-align: center; white-space: nowrap; width: 162rpx; }
.categotyPop-item:nth-child(4n) { margin-right: 0; }
.categotyPop-item.active { background-color: #fdeeee; border-color: #ee252a; color: #f02811; }
</style>
