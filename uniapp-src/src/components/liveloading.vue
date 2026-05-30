<template>
  <view class="migration-component liveloading">
    <!-- TODO:migration: Recovered from compiled liveloading.wxml/js; original template semantics need validation. -->
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
  name: 'Liveloading',
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
.request-loading-view {
    background-color: transparent;
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 999
}

.loading-view,.request-loading-view {
    -webkit-align-items: center;
    align-items: center;
    display: -webkit-flex;
    display: flex;
    -webkit-justify-content: center;
    justify-content: center
}

.loading-view {
    border-radius: 20rpx;
    height: 160rpx;
    width: 160rpx
}

.loading {
    -webkit-animation: spin-437f31b2 1.4s linear infinite;
    animation: spin-437f31b2 1.4s linear infinite;
    border: 10rpx solid #666;
    border-left-color: rgba(0,0,0,.01);
    border-radius: 50%;
    height: 60rpx;
    width: 60rpx
}

.loading-img {
    height: 60rpx;
    width: 60rpx
}

@-webkit-keyframes spin-437f31b2 {
    0% {
        -webkit-transform: rotate(0);
        transform: rotate(0)
    }

    to {
        -webkit-transform: rotate(1turn);
        transform: rotate(1turn)
    }
}

@keyframes spin-437f31b2 {
    0% {
        -webkit-transform: rotate(0);
        transform: rotate(0)
    }

    to {
        -webkit-transform: rotate(1turn);
        transform: rotate(1turn)
    }
}
</style>
