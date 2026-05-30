<template>
  <view class="migration-component mpvue-citypicker-mpvue-city-picker">
    <!-- TODO:migration: Recovered from compiled mpvue-citypicker/mpvueCityPicker.wxml/js; original template semantics need validation. -->
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
  name: 'MpvueCitypickerMpvueCityPicker',
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
.pickerMask {
    background: rgba(0,0,0,.6);
    bottom: 0;
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    z-index: 1000
}

.mpvue-picker-content {
    bottom: 0;
    left: 0;
    position: fixed;
    -webkit-transform: translateY(100%);
    transform: translateY(100%);
    transition: all .3s ease;
    width: 100%;
    z-index: 3000
}

.mpvue-picker-view-show {
    -webkit-transform: translateY(0);
    transform: translateY(0)
}

.mpvue-picker__hd {
    background-color: #fff;
    display: -webkit-flex;
    display: flex;
    font-size: 17px;
    padding: 9px 15px;
    position: relative;
    text-align: center
}

.mpvue-picker__hd:after {
    border-bottom: 1px solid #e5e5e5;
    bottom: 0;
    color: #e5e5e5;
    content: " ";
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
    -webkit-transform: scaleY(.5);
    transform: scaleY(.5);
    -webkit-transform-origin: 0 100%;
    transform-origin: 0 100%
}

.mpvue-picker__action {
    color: #1aad19;
    display: block;
    -webkit-flex: 1;
    flex: 1
}

.mpvue-picker__action:first-child {
    color: #888;
    text-align: left
}

.mpvue-picker__action:last-child {
    text-align: right
}

.picker-item {
    font-size: 16px;
    line-height: 40px;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap
}

.mpvue-picker-view {
    background-color: #fff;
    bottom: 0;
    height: 238px;
    left: 0;
    position: relative;
    width: 100%
}
</style>
