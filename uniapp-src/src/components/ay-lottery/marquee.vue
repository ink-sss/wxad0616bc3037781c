<template>
  <view class="migration-component ay-lottery-marquee">
    <!-- TODO:migration: Recovered from compiled ay-lottery/marquee.wxml/js; original template semantics need validation. -->
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
  name: 'AyLotteryMarquee',
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
.box-ly-pm {
    border-radius: 25rpx;
    margin: 0 auto;
    position: relative
}

.box-in {
    background-repeat: no-repeat;
    background-size: 100% 100%;
    border-radius: 40rpx;
    bottom: 0;
    left: 0;
    margin: auto;
    right: 0;
    top: 0
}

.box-in,.dot {
    position: absolute
}

.dot {
    border-radius: 50%;
    display: block;
    height: 16rpx;
    width: 16rpx
}

.dot:nth-child(odd) {
    -webkit-animation: odd .5s linear infinite;
    animation: odd .5s linear infinite;
    background: #fff
}

.dot:nth-child(2n) {
    -webkit-animation: even .5s linear infinite;
    animation: even .5s linear infinite;
    background: #fdf1ae
}

.dot-1 {
    left: 43rpx;
    top: 9rpx
}

.dot-2 {
    left: 153rpx;
    top: 9rpx
}

.dot-3 {
    left: 262rpx;
    top: 9rpx
}

.dot-4 {
    left: 372rpx;
    top: 9rpx
}

.dot-5 {
    left: 481rpx;
    top: 9rpx
}

.dot-6 {
    left: 591rpx;
    top: 9rpx
}

.dot-7 {
    left: 642rpx;
    top: 76rpx
}

.dot-8 {
    left: 642rpx;
    top: 178rpx
}

.dot-9 {
    left: 642rpx;
    top: 280rpx
}

.dot-10 {
    left: 642rpx;
    top: 383rpx
}

.dot-11 {
    left: 642rpx;
    top: 485rpx
}

.dot-12 {
    left: 642rpx;
    top: 587rpx
}

.dot-13 {
    left: 591rpx;
    top: 651rpx
}

.dot-14 {
    left: 481rpx;
    top: 651rpx
}

.dot-15 {
    left: 372rpx;
    top: 651rpx
}

.dot-16 {
    left: 262rpx;
    top: 651rpx
}

.dot-17 {
    left: 153rpx;
    top: 651rpx
}

.dot-18 {
    left: 43rpx;
    top: 651rpx
}

.dot-19 {
    left: 6rpx;
    top: 588rpx
}

.dot-20 {
    left: 6rpx;
    top: 486rpx
}

.dot-21 {
    left: 6rpx;
    top: 383rpx
}

.dot-22 {
    left: 6rpx;
    top: 280rpx
}

.dot-23 {
    left: 6rpx;
    top: 178rpx
}

.dot-24 {
    left: 6rpx;
    top: 76rpx
}

@-webkit-keyframes odd {
    0% {
        background: #fff;
        box-shadow: 0 3rpx 7rpx rgba(195,117,41,.35),0 3rpx 7rpx hsla(24,69%,92%,.35)
    }

    to {
        background: #ffe211;
        box-shadow: 0 3rpx 7rpx hsla(27,74%,67%,.35),0 3rpx 7rpx rgba(255,226,17,.35)
    }
}

@keyframes odd {
    0% {
        background: #fff;
        box-shadow: 0 3rpx 7rpx rgba(195,117,41,.35),0 3rpx 7rpx hsla(24,69%,92%,.35)
    }

    to {
        background: #ffe211;
        box-shadow: 0 3rpx 7rpx hsla(27,74%,67%,.35),0 3rpx 7rpx rgba(255,226,17,.35)
    }
}

@-webkit-keyframes even {
    0% {
        background: #ffe211;
        box-shadow: 0 3rpx 7rpx hsla(27,74%,67%,.35),0 3rpx 7rpx rgba(255,226,17,.35)
    }

    to {
        background: #fff;
        box-shadow: 0 3rpx 7rpx rgba(195,117,41,.35),0 3rpx 7rpx hsla(24,69%,92%,.35)
    }
}

@keyframes even {
    0% {
        background: #ffe211;
        box-shadow: 0 3rpx 7rpx hsla(27,74%,67%,.35),0 3rpx 7rpx rgba(255,226,17,.35)
    }

    to {
        background: #fff;
        box-shadow: 0 3rpx 7rpx rgba(195,117,41,.35),0 3rpx 7rpx hsla(24,69%,92%,.35)
    }
}

.ct-out {
    background-color: #fff;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    border-radius: 35rpx;
    box-shadow: 0 14rpx #f0f0ee;
    box-sizing: border-box;
    height: 168rpx;
    padding: 0 15rpx;
    position: absolute;
    width: 182rpx
}

.award-1 {
    left: 18rpx;
    top: 19rpx
}

.award-2 {
    left: 212rpx;
    top: 19rpx
}

.award-3 {
    left: 408rpx;
    top: 19rpx
}

.award-4 {
    left: 408rpx;
    top: 212rpx
}

.award-5 {
    left: 408rpx;
    top: 404rpx
}

.award-6 {
    left: 212rpx;
    top: 404rpx
}

.award-7 {
    left: 18rpx;
    top: 404rpx
}

.award-8 {
    left: 18rpx;
    top: 212rpx
}

.btn-start {
    background-color: #f62e12;
    background: linear-gradient(0deg,#ff6c4b,#f93b24 53%,#fd645a 99%);
    border-radius: 35rpx;
    box-shadow: 0 14rpx #f62e12;
    color: #fff;
    font-size: 48rpx;
    font-weight: 700;
    height: 168rpx;
    left: 212rpx;
    line-height: 168rpx;
    position: absolute;
    text-align: center;
    top: 212rpx;
    width: 182rpx
}

.award-image {
    border-radius: 15rpx;
    height: 104rpx;
    width: 104rpx
}

.awardSelect {
    background-color: #ffffd9!important;
    box-shadow: 0 14rpx #f0b257!important
}
</style>
