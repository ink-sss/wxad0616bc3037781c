<template>
  <view class="migration-component guarantee">
    <!-- TODO:migration: Recovered from compiled guarantee.wxml/js; original template semantics need validation. -->
    <slot />
    <view v-if="itemData" class="migration-fallback">
      <image v-if="coverImage" class="migration-fallback__image" :src="coverImage" mode="aspectFill" lazy-load @tap="openLink(primaryLink)" />
      <view v-if="displayTitle" class="migration-fallback__title">{{ displayTitle }}</view>
      <view v-if="displayText" class="migration-fallback__text">{{ displayText }}</view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Guarantee',
  props: ["itemData","config","currentI","navList","color","activeText","optionType","activeColorF","activeColorS","defaultColor","marginRight","isAppShare","appParams","isMpShare","location","diyItems","userInfo","serviceUserId","diytop","storeInfo","isScroll","wxPhoneCompulsory"],
  emits: ['close', 'returnVal', 'setIndex', 'parentFunc', 'scanQrcode', 'onConfirm', 'onCancel', 'onChange', 'currentIndex', 'bg', 'stopPush', 'getData'],
  computed: {
    source() {
      return this.itemData || this.config || {};
    },
    displayTitle() {
      return this.source?.params?.title || this.source?.style?.title || this.source?.title || this.source?.name || '';
    },
    displayText() {
      return this.source?.params?.text || this.source?.text || this.source?.desc || '';
    },
    coverImage() {
      const data = Array.isArray(this.source?.data) ? this.source.data[0] : this.source?.data;
      return data?.imgUrl || data?.image || data?.imageUrl || data?.product_image || this.source?.imgUrl || this.source?.image || '';
    },
    primaryLink() {
      const data = Array.isArray(this.source?.data) ? this.source.data[0] : this.source?.data;
      return data?.linkUrl || data?.link_url || this.source?.linkUrl || this.source?.link_url || '';
    }
  },
  methods: {
    openLink(url) {
      if (!url) return;
      if (typeof this.gotoPage === 'function') this.gotoPage(url);
      else uni.navigateTo({ url: url.startsWith('/') ? url : '/' + url });
    }
  }
};
</script>

<style scoped>
.migration-component { width: 100%; box-sizing: border-box; }
.migration-fallback { width: 100%; box-sizing: border-box; }
.migration-fallback__image { width: 100%; height: 240rpx; display: block; }
.migration-fallback__title { padding: 16rpx 24rpx 0; font-size: 28rpx; color: #222; }
.migration-fallback__text { padding: 8rpx 24rpx 16rpx; font-size: 24rpx; color: #666; }
.bottom-panel .popup-bg {
    background: rgba(0,0,0,.6);
    bottom: 0;
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    z-index: 98
}

.bottom-panel .popup-bg .wechat-box {
    padding-top: var(--window-top)
}

.bottom-panel .popup-bg .wechat-box image {
    width: 100%
}

.bottom-panel .content {
    background-color: #fff;
    border-radius: 12rpx;
    left: 0;
    margin: auto;
    max-height: 900rpx;
    min-height: 200rpx;
    position: fixed;
    right: 0;
    top: 20vh;
    -webkit-transform: translate3d(0,1980rpx,0);
    transform: translate3d(0,1980rpx,0);
    transition: -webkit-transform .2s cubic-bezier(0,0,.25,1);
    transition: transform .2s cubic-bezier(0,0,.25,1);
    transition: transform .2s cubic-bezier(0,0,.25,1),-webkit-transform .2s cubic-bezier(0,0,.25,1);
    width: 80%;
    z-index: 99
}

.bottom-panel.open .content {
    -webkit-transform: translateZ(0);
    transform: translateZ(0)
}

.bottom-panel.close .popup-bg {
    display: none
}

.module-share .hd {
    font-size: 36rpx;
    height: 90rpx;
    line-height: 90rpx
}

.module-share .item button,.module-share .item button:after {
    background: none;
    border: none
}

.module-share .icon-box {
    background: #f6bd1d;
    border-radius: 50%;
    height: 100rpx;
    width: 100rpx
}

.module-share .icon-box .iconfont {
    color: #fff;
    font-size: 60rpx
}

.module-share .btns {
    margin-top: 30rpx
}

.module-share .btns button {
    border-radius: 0;
    border-top: 1px solid #eee;
    height: 90rpx;
    line-height: 90rpx
}

.module-share .btns button:after {
    border-radius: 0
}

.module-share .share-friend {
    background: #04be01
}

.icon-tijiaochenggong {
    border: 1rpx solid #f63;
    border-radius: 50%;
    color: #f63;
    -webkit-flex-shrink: initial;
    flex-shrink: 1;
    font-size: 20rpx;
    height: 28rpx;
    line-height: 28rpx;
    margin-top: 7rpx;
    text-align: center;
    width: 28rpx
}

.mb10 {
    margin-bottom: 10rpx
}

.iconfont.icon-guanbi {
    color: #999;
    font-size: 32rpx;
    position: absolute;
    right: 20rpx;
    top: 0
}
</style>
