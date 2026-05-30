<template>
  <view class="diy-window" :style="`background:${styleConfig.background || ''};padding:${wrapperPadding};`">
    <view v-if="Number(styleConfig.layout) > -1" :class="['data-list', `column__${styleConfig.layout}`]">
      <view v-for="(item, index) in dataList" :key="index" class="item" @tap="gotoPages(item)">
        <view class="item-image">
          <image lazy-load mode="aspectFill" :src="item.imgUrl || item.image"></image>
        </view>
      </view>
    </view>
    <view v-else class="display" :style="`padding:${Number(styleConfig.paddingTop || 0)}px ${Number(styleConfig.paddingLeft || 0)}px;`">
      <view class="img-box-wrap-1">
        <view class="img-box" @tap="gotoPages(dataList[0])">
          <image lazy-load mode="aspectFill" :src="dataList[0] && dataList[0].imgUrl"></image>
        </view>
      </view>
      <view class="percent-w50 d-s-c d-c">
        <view v-if="dataList.length >= 2" class="img-box-wrap-2">
          <view class="img-box" @tap="gotoPages(dataList[1])">
            <image lazy-load mode="aspectFill" :src="dataList[1].imgUrl"></image>
          </view>
        </view>
        <view class="d-s-c img-box-wrap-3">
          <view v-if="dataList.length >= 3" class="img-box-wrap-4">
            <view class="img-box" @tap="gotoPages(dataList[2])">
              <image lazy-load mode="aspectFill" :src="dataList[2].imgUrl"></image>
            </view>
          </view>
          <view v-if="dataList.length >= 4" class="img-box-wrap-4">
            <view class="img-box" @tap="gotoPages(dataList[3])">
              <image lazy-load mode="aspectFill" :src="dataList[3].imgUrl"></image>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  name: 'DiyWindow',
  props: { itemData: { type: Object, default: () => ({}) } },
  computed: {
    dataList() { return Array.isArray(this.itemData.data) ? this.itemData.data : [] },
    styleConfig() { return this.itemData.style || {} },
    wrapperPadding() {
      const s = this.styleConfig
      return `${this.toRpx(s.paddingTop)} ${this.toRpx(s.paddingLeft)} ${this.toRpx(s.paddingBottom)} ${this.toRpx(s.paddingLeft)}`
    }
  },
  methods: {
    toRpx(value) { return `${2 * Number(value || 0)}rpx` },
    gotoPages(item) { if (item && item.linkUrl && typeof this.gotoPage === 'function') this.gotoPage(item.linkUrl) }
  }
}
</script>
<style scoped>
.diy-window { overflow: hidden; }
.diy-window .data-list { display: flex; flex-wrap: wrap; }
.diy-window image { height: 100%; width: 100%; }
.data-list.column__2 .item { padding-top: 50%; position: relative; width: 50%; }
.data-list.column__3 .item { padding-top: 33.3333333%; position: relative; width: 33.333333333333%; }
.data-list.column__4 .item { padding-top: 25%; position: relative; width: 25%; }
.data-list .item .item-image,.display .img-box { box-sizing: border-box; height: 100%; left: 0; position: absolute; top: 0; width: 100%; }
.display { display: flex; }
.display .img-box-wrap-1 { padding-top: 50%; position: relative; width: 50%; }
.display .img-box-wrap-2 { height: 50%; position: relative; width: 100%; }
.display .percent-w50 { box-sizing: border-box; width: 50%; }
.display .img-box-wrap-3 { height: 50%; width: 100%; }
.display .img-box-wrap-4 { height: 100%; position: relative; width: 50%; }
</style>
