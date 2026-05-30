<template>
  <view class="migration-component mpservice-mpservice">
    <!-- TODO:migration: Recovered from compiled mpservice/Mpservice.wxml/js; original template semantics need validation. -->
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
  name: 'MpserviceMpservice',
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
.imgIcon {
    width: 80rpx
}

.txt {
    background: #d9b47f;
    border-radius: 30rpx;
    color: #fff;
    font-size: 24rpx;
    height: 60rpx;
    line-height: 60rpx;
    text-align: center;
    width: 140rpx
}

.desc {
    color: #666;
    font-size: 28rpx;
    letter-spacing: 1rpx
}

.mpservice-wrap {
    box-sizing: border-box;
    width: 100%
}

.mpservice-wrap .mp-image {
    margin-top: 40rpx;
    width: 560rpx
}

.mpservice-wrap .mp-image image {
    width: 100%
}

.icon-qq {
    color: #1296db;
    font-size: 64rpx
}

.icon-weixin {
    color: #1afa29;
    font-size: 64rpx
}

.icon-guanbi {
    font-size: 26rpx
}

.icon-002dianhua {
    color: #1296db;
    font-size: 52rpx
}

.kf-close {
    -webkit-justify-content: flex-end;
    justify-content: flex-end
}

.noDatamodel {
    color: #929292;
    font-size: 30rpx;
    height: 200rpx;
    line-height: 128rpx;
    text-align: center;
    width: 100%
}
</style>
