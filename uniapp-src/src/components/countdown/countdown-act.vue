<template>
  <view class="migration-component countdown-countdown-act">
    <!-- TODO:migration: Recovered from compiled countdown/countdown-act.wxml/js; original template semantics need validation. -->
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
  name: 'CountdownCountdownAct',
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
.countdown {
    border: 1rpx solid #f4dacf;
    border-radius: 16rpx 0 16rpx 16rpx;
    padding: 2rpx 10rpx 2rpx 2rpx
}

[data-theme=theme0] .countdown {
    border-color: #f4dcd2!important
}

[data-theme=theme1] .countdown {
    border-color: rgba(255,76,1,.15)!important
}

[data-theme=theme2] .countdown {
    border-color: rgba(255,204,0,.15)!important
}

[data-theme=theme3] .countdown {
    border-color: rgba(23,116,255,.15)!important
}

[data-theme=theme4] .countdown {
    border-color: #fff!important
}

[data-theme=theme5] .countdown {
    border-color: #ebe8de!important
}

[data-theme=theme6] .countdown {
    border-color: rgba(98,60,235,.15)!important
}

.countdown .numbox {
    font-size: 22rpx
}

.countdown.noborder {
    border: none
}

.countdown .daybox {
    border-radius: 200rpx;
    font-size: 22rpx;
    margin-right: 7rpx;
    padding: 0 16rpx
}

.previewProduct text {
    font-size: 22rpx
}

.previewProduct .box {
    background: #fff;
    border-radius: 8rpx;
    color: #ff4c01;
    display: inline-block;
    font-size: 22rpx;
    height: 36rpx;
    line-height: 36rpx;
    padding: 0;
    text-align: center;
    width: 36rpx
}

.previewProduct .daybox {
    background: none;
    font-size: 22rpx;
    padding: 0
}

.previewProduct.countdown {
    border: none;
    font-size: 22rpx;
    padding: 0;
    white-space: nowrap
}

.diy-previewProduct text {
    font-size: 18rpx
}

.diy-previewProduct .box,.diy-previewProduct .daybox {
    background: none;
    font-size: 18rpx;
    padding: 0
}

.diy-previewProduct.countdown {
    border: none;
    font-size: 18rpx;
    padding: 0;
    white-space: nowrap
}
</style>
