<template>
  <view>
    <view class="diy-navbar" :style="`background:${styleConfig.bgcolor};padding:${wrapperPadding};`">
      <view class="diy-navBar" :style="navStyle">
        <view v-for="(item, index) in dataList" :key="index" class="item" :style="`width:${itemWidth};`" @tap="gotoDetail(item)">
          <image lazy-load mode="widthFix" :src="item.imgUrl"></image>
          <text class="gray3" :style="`color:${item.color || ''};`">{{ item.text }}</text>
        </view>
      </view>
    </view>
    <view class="qrCode">
      <uni-popup ref="qrCodeRef" type="center" background-color="#fff" border-radius="20px 20px 20px 20px">
        <view class="qrpop">
          <image mode="aspectFill" :src="qrcode"></image>
          <view class="qr-pop-tip">{{ qrText }}</view>
        </view>
      </uni-popup>
    </view>
  </view>
</template>
<script>
export default {
  name: 'DiyNavBar',
  props: { itemData: { type: Object, default: () => ({}) } },
  data() {
    return {
      qrcode: '',
      qrText: ''
    }
  },
  computed: {
    dataList() { return Array.isArray(this.itemData.data) ? this.itemData.data : [] },
    styleConfig() { return this.itemData.style || {} },
    itemWidth() {
      const rows = Math.abs(Number(this.styleConfig.rowsNum || 4)) || 4
      return `${100 / rows}%`
    },
    wrapperPadding() {
      const s = this.styleConfig
      return `${this.toRpx(s.paddingTop)} ${this.toRpx(s.paddingLeft)} ${this.toRpx(s.paddingBottom)} ${this.toRpx(s.paddingLeft)}`
    },
    navStyle() {
      const s = this.styleConfig
      const top = 2 * Number(s.topRadio || 0)
      const bottom = 2 * Number(s.bottomRadio || 0)
      return `background:${s.background || ''};border-radius:${top}rpx ${top}rpx ${bottom}rpx ${bottom}rpx;`
    }
  },
  methods: {
    toRpx(value) { return `${2 * Number(value || 0)}rpx` },
    gotoDetail(item) {
      const text = item && item.text
      if (text === '提货码') return this.openCode('提货码', 'user.qrCode/getExtractGoodsCode', '/pages/branch/scanWrittenCode')
      if (text === '时长码') return this.openCode('时长码', 'user.qrCode/getWatchTimeCode', '/pages/branch/scanWrittenCode')
      if (text === '兑换码') return this.openCode('兑换码', 'user.qrCode/getRoomStoreCouponCode', '/pages/branch/welfareVoucher')
      if (text === '积分码') return this.openCode('积分码', 'user.qrCode/getPointCode', '/pages/branch/pointDetail')
      if (text === '红包码') return this.openCode('红包码', 'user.qrCode/getRedPackCode', '/pages/branch/moneyDetail')
      if (text === '门店管理') {
        this.gotoPage(uni.getStorageSync('branchToken') ? '/pages/branch/index' : '/pages/branch/login')
        return
      }
      if (item && item.linkUrl && typeof this.gotoPage === 'function') this.gotoPage(item.linkUrl)
    },
    openCode(text, endpoint, url) {
      if (typeof this._get !== 'function') return
      this.qrText = text
      this._get(endpoint, { url }, (res) => {
        if (res.code === 1) {
          this.qrcode = res.data.content
          this.$refs.qrCodeRef && this.$refs.qrCodeRef.open()
        }
      })
    }
  }
}
</script>
<style scoped>
.diy-navBar { display: flex; flex-wrap: wrap; justify-content: flex-start; }
.diy-navbar .item { align-items: center; display: flex; flex-direction: column; height: 140rpx; justify-content: center; margin-top: 20rpx; width: 120rpx; }
.diy-navbar .item image { height: 70rpx; width: 70rpx; }
.diy-navbar .item text { display: block; font-size: 24rpx; line-height: 66rpx; overflow: hidden; text-align: center; text-overflow: ellipsis; white-space: nowrap; width: 100%; }
.qrpop { align-items: center; display: flex; flex-direction: column; padding: 30rpx; width: 56vw; }
.qrpop image { height: 340rpx; width: 340rpx; }
.qr-pop-tip { color: #999; font-size: 24rpx; padding-top: 30rpx; text-align: center; }
</style>
