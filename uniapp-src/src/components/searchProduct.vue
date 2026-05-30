<template>
  <view class="migration-component search-product">
    <!-- TODO:migration: Recovered from compiled searchProduct.wxml/js; original template semantics need validation. -->
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
  name: 'SearchProduct',
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
.search-wrap {
    background-color: #f5f5f5;
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 999
}

.search-wrap .index-search-box .search-box {
    background: #f5f5f5;
    border-radius: 50rpx;
    box-sizing: border-box;
    color: #999;
    font-size: 28rpx;
    height: 64rpx;
    line-height: 64rpx;
    overflow: hidden;
    padding: 0 20rpx
}

.search-wrap .index-search-box button {
    background: #fff;
    border: 1rpx solid #ccc;
    color: #333;
    height: 78rpx;
    line-height: 78rpx
}

.search-wrap .index-search-box {
    background-color: #f5f5f5;
    padding: 0 30rpx 30rpx
}

.before-search {
    -webkit-align-items: center;
    align-items: center;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-flow: wrap;
    flex-flow: wrap;
    -webkit-justify-content: flex-start;
    justify-content: flex-start
}

.before-search .item {
    background: #f0f2f5;
    border-radius: 8rpx;
    color: #686868;
    font-size: 24rpx;
    margin-bottom: 16rpx;
    margin-right: 16rpx;
    padding: 16rpx
}

.reg180 {
    -webkit-align-items: center;
    align-items: center;
    display: -webkit-flex;
    display: flex;
    -webkit-justify-content: flex-end;
    justify-content: flex-end;
    padding-left: 20rpx;
    text-align: center;
    -webkit-transform: rotateY(180deg);
    transform: rotateY(180deg)
}

.reg180 .icon-jiantou {
    color: #333;
    display: block;
    font-size: 36rpx;
    height: 44rpx;
    line-height: 44rpx;
    width: 44rpx
}
</style>
