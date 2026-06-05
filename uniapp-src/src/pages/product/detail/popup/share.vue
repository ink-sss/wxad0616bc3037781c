<template>
  <view v-if="Visible" :class="['bottom-panel', Visible ? 'open' : 'close']" @tap="closePopup">
    <view class="popup-bg">
      <view v-if="wechat_share" class="wechat-box">
        <image mode="widthFix" :src="config.pic_url + '/share.png'" />
      </view>
    </view>
    <view class="content" @tap.stop>
      <view class="module-box module-share">
        <view class="hd d-c-c">分享</view>
        <view class="share-options">
          <view class="item">
            <view class="share-button-shell">
              <button class="share-button" open-type="share" @tap="share">
                <view class="icon-box share-friend"><text class="share-icon-text">友</text></view>
                <text class="share-label">分享好友</text>
              </button>
            </view>
          </view>
          <view class="item">
            <view class="share-button-shell">
              <button class="share-button" @tap="genePoster">
                <view class="icon-box share-poster"><text class="share-icon-text">报</text></view>
                <text class="share-label">生成海报</text>
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
.bottom-panel {
  position: fixed;
  inset: 0;
  z-index: 140;
  pointer-events: none;
  opacity: 0;
  transition: opacity .2s;
}
.bottom-panel.open {
  pointer-events: auto;
  opacity: 1;
}
.popup-bg {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,.45);
}
.content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  overflow: hidden;
}
.hd {
  height: 96rpx;
  border-bottom: 1rpx solid #f2f2f2;
  color: #222;
  font-size: 32rpx;
  font-weight: 700;
}
.share-options {
  display: flex;
  padding: 36rpx 0 30rpx;
}
.item {
  flex: 1;
}
.share-button-shell {
  display: flex;
  justify-content: center;
}
.share-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  background: transparent;
  border: 0;
  color: #333;
  line-height: 1;
}
.share-button:after,
.share-button::after,
.btns button:after,
.btns button::after {
  border: 0;
}
.icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
}
.share-friend {
  background: #18c45a;
}
.share-poster {
  background: #ff9600;
}
.share-icon-text {
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 1;
}
.share-label {
  margin-top: 18rpx;
  color: #333;
  font-size: 26rpx;
  line-height: 34rpx;
}
.btns {
  border-top: 12rpx solid #f6f6f6;
  padding: 16rpx 30rpx calc(20rpx + env(safe-area-inset-bottom));
}
.btns button {
  height: 88rpx;
  margin: 0;
  border-radius: 44rpx;
  background: #fff;
  color: #666;
  font-size: 28rpx;
  line-height: 88rpx;
}
.wechat-box {
  padding: 60rpx;
}
</style>
