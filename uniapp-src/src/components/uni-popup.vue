<template>
  <view v-if="isVisible" class="uni-popup" @tap="onMaskClick">
    <view class="uni-mask"></view>
    <view :class="contentClass" :style="contentStyle" @tap.stop>
      <slot />
      <view v-if="itemData" class="migration-fallback">
        <image v-if="coverImage" class="migration-fallback__image" :src="coverImage" mode="aspectFill" lazy-load @tap="openLink(primaryLink)" />
        <view v-if="displayTitle" class="migration-fallback__title">{{ displayTitle }}</view>
        <view v-if="displayText" class="migration-fallback__text">{{ displayText }}</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'UniPopup',
  props: [
    'show',
    'visible',
    'type',
    'height',
    'maskClick',
    'isMaskClick',
    'backgroundColor',
    'borderRadius',
    'itemData',
    'config',
    'currentI',
    'navList',
    'color',
    'activeText',
    'optionType',
    'activeColorF',
    'activeColorS',
    'defaultColor',
    'marginRight',
    'isAppShare',
    'appParams',
    'isMpShare',
    'location',
    'diyItems',
    'userInfo',
    'serviceUserId',
    'diytop',
    'storeInfo',
    'isScroll',
    'wxPhoneCompulsory'
  ],
  emits: [
    'open',
    'close',
    'change',
    'hidePopup',
    'maskClick',
    'returnVal',
    'setIndex',
    'parentFunc',
    'scanQrcode',
    'onConfirm',
    'onCancel',
    'onChange',
    'currentIndex',
    'bg',
    'stopPush',
    'getData'
  ],
  data() {
    return {
      innerVisible: false
    }
  },
  computed: {
    popupType() {
      return this.type || 'middle';
    },
    isVisible() {
      return this.innerVisible || this.isTruthy(this.show) || this.isTruthy(this.visible);
    },
    contentClass() {
      return ['uni-popup__content', `uni-popup__content--${this.popupType}`];
    },
    contentStyle() {
      const styles = [];
      if (this.height) styles.push(`height:${typeof this.height === 'number' ? `${this.height}px` : this.height}`);
      if (this.backgroundColor) styles.push(`background:${this.backgroundColor}`);
      if (this.borderRadius) styles.push(`border-radius:${this.borderRadius}`);
      return styles.join(';');
    },
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
    isTruthy(value) {
      return value === true || value === 'true' || value === 1 || value === '1';
    },
    emitChange(show) {
      this.$emit('change', { show, type: this.popupType });
    },
    open() {
      this.innerVisible = true;
      this.$emit('open');
      this.emitChange(true);
    },
    close() {
      this.innerVisible = false;
      this.$emit('hidePopup');
      this.$emit('close');
      this.emitChange(false);
    },
    onMaskClick() {
      this.$emit('maskClick');
      if (this.maskClick === false || this.isMaskClick === false) return;
      this.close();
    },
    openLink(url) {
      if (!url) return;
      if (typeof this.gotoPage === 'function') this.gotoPage(url);
      else uni.navigateTo({ url: url.startsWith('/') ? url : '/' + url });
    }
  }
};
</script>

<style scoped>
.migration-fallback { width: 100%; box-sizing: border-box; }
.migration-fallback__image { width: 100%; height: 240rpx; display: block; }
.migration-fallback__title { padding: 16rpx 24rpx 0; font-size: 28rpx; color: #222; }
.migration-fallback__text { padding: 8rpx 24rpx 16rpx; font-size: 24rpx; color: #666; }
.uni-mask {
    background-color: rgba(0,0,0,.3);
    bottom: 0;
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    z-index: 0
}

.uni-popup {
    bottom: 0;
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    z-index: 999
}

.uni-popup__content {
    background: #fff;
    box-sizing: border-box;
    position: absolute;
    z-index: 1
}

.uni-popup__content--center,
.uni-popup__content--middle {
    -webkit-align-items: flex-start;
    align-items: flex-start;
    border-radius: 10rpx;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: column;
    flex-direction: column;
    -webkit-justify-content: flex-start;
    justify-content: flex-start;
    left: 50%;
    overflow: auto;
    padding: 30rpx;
    top: 50%;
    -webkit-transform: translate(-50%,-50%);
    transform: translate(-50%,-50%);
    width: 600rpx
}

.popup-head {
    box-sizing: border-box;
    font-size: 30rpx;
    font-weight: 700;
    padding-bottom: 40rpx;
    width: 100%
}

.uni-popup__content--top {
    height: 100rpx;
    line-height: 100rpx;
    top: 0
}

.uni-popup__content--bottom,.uni-popup__content--top {
    left: 0;
    text-align: center;
    width: 100%
}

.uni-popup__content--bottom {
    bottom: 0
}
</style>
