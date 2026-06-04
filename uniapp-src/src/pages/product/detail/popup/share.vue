<template>
  <view :class="['bottom-panel', Visible ? 'open' : 'close']" @tap="closePopup">
    <view class="popup-bg">
      <view v-if="wechat_share" class="wechat-box">
        <image mode="widthFix" :src="config.pic_url + '/share.png'" />
      </view>
    </view>
    <view class="content" @tap.stop>
      <view class="module-box module-share">
        <view class="hd d-c-c">分享</view>
        <view class="p30 box-s-b">
          <view class="d-c-c">
            <view class="item flex-1 d-c-c d-c">
              <button class="d-c d-c-c" open-type="share" @tap="share">
                <view class="icon-box d-c-c share-friend"><text class="iconfont icon-fenxiang"></text></view>
                <text class="pt20">分享好友</text>
              </button>
            </view>
            <view class="item flex-1 d-c-c d-c">
              <button class="d-c d-c-c" @tap="genePoster">
                <view class="icon-box d-c-c"><text class="iconfont icon-edit"></text></view>
                <text class="pt20">生成海报</text>
              </button>
            </view>
          </view>
        </view>
        <view class="btns"><button @tap="closePopup(1)">取消</button></view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    isbottmpanel: Boolean,
    product_id: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      Visible: false,
      poster_img: '',
      wechat_share: false
    }
  },
  watch: {
    isbottmpanel(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.wechat_share = false
        this.Visible = newValue
      }
    }
  },
  methods: {
    closePopup(type) {
      this.$emit('close', {
        type,
        poster_img: this.poster_img
      })
    },
    share() {},
    genePoster() {
      uni.showLoading({ title: '加载中' })
      this._get('product.product/poster', {
        product_id: this.product_id,
        source: 'wx'
      }, (res) => {
        this.poster_img = res.data.qrcode
        this.closePopup(2)
      }, null, () => {
        uni.hideLoading()
      })
    }
  }
}
</script>

<style scoped>
.bottom-panel { position: fixed; inset: 0; z-index: 80; pointer-events: none; opacity: 0; transition: opacity .2s; }
.bottom-panel.open { pointer-events: auto; opacity: 1; }
.popup-bg { position: absolute; inset: 0; background: rgba(0,0,0,.45); }
.content { position: absolute; left: 0; right: 0; bottom: 0; border-radius: 24rpx 24rpx 0 0; background: #fff; overflow: hidden; }
.hd { height: 96rpx; font-size: 32rpx; font-weight: 700; border-bottom: 1rpx solid #f2f2f2; }
.item button { background: transparent; color: #333; font-size: 26rpx; line-height: 1.4; }
.icon-box { width: 96rpx; height: 96rpx; border-radius: 50%; background: #f5f5f5; font-size: 44rpx; color: #ff5704; }
.btns button { height: 92rpx; color: #666; font-size: 28rpx; background: #fff; border-top: 1rpx solid #f2f2f2; }
.wechat-box { padding: 60rpx; }
</style>
