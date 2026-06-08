<template>
  <view :style="wrapStyle">
    <view class="drag optional">
      <view class="bg-box">
        <view class="user-row">
          <image
            v-if="hasUser"
            class="item-image"
            mode="aspectFill"
            lazy-load
            :src="avatar"
            @tap="openProfile"
          />
          <image
            v-else
            class="item-image"
            mode="aspectFill"
            lazy-load
            :src="avatar"
            @tap="login"
          />
          <view class="user-content white">
            <view class="user-main">
              <view v-if="hasUser" class="name-line">
                <text class="name-text">{{ detail.nickName }}</text>
                <text v-if="Number(detail.grade_id || 0) > 0" class="grade">{{ detail.grade && detail.grade.name }}</text>
              </view>
              <text v-else class="name-text" @tap="login">点击登录</text>
              <view class="news"></view>
            </view>
            <view v-if="hasUser">ID:{{ detail.user_id }}</view>
          </view>
        </view>
        <view :class="['bg-base', 'bg-base-' + styleType]"></view>
        <view class="diy-Base" :style="baseStyle">
          <view class="list column-4">
            <view class="item" @tap="openLink('/pagesPlus/main/user/my-wallet/my-wallet')">
              <view class="item-text num">{{ hasUser ? detail.balance : 0 }}</view>
              <view class="item-text text-ellipsis">账户余额</view>
            </view>
            <view class="item item-center" @tap="openLink('/pagesPlus/main/user/points/points')">
              <view class="item-text num">{{ hasUser ? detail.points : 0 }}</view>
              <view class="item-text text-ellipsis">{{ pointsText }}</view>
            </view>
            <view class="item" @tap="openLink('/pagesPlus/main/user/my-coupon/my-coupon')">
              <view class="item-text num">{{ userInfo.coupon || 0 }}</view>
              <view class="item-text text-ellipsis">优惠券</view>
            </view>
            <view class="item" @tap="openLink('/pagesPlus/main/user/myStoreCoupon/myStoreCoupon')">
              <view class="item-text num">{{ userInfo.storeCouponCount || 0 }}</view>
              <view class="item-text text-ellipsis">福利券</view>
            </view>
          </view>
        </view>
      </view>
      <slot />
    </view>
  </view>
</template>

<script>
export default {
  name: 'DiyBase',
  props: {
    itemData: { type: Object, default: () => ({}) },
    userInfo: { type: Object, default: () => ({}) },
    storeInfo: { type: Object, default: () => ({}) },
  },
  emits: ['scanQrcode', 'bg'],
  computed: {
    rawDetail() {
      return this.userInfo ? this.userInfo.detail : null
    },
    detail() {
      return this.rawDetail || {}
    },
    hasUser() {
      return !!this.rawDetail
    },
    styleConfig() {
      return (this.itemData && this.itemData.style) || {}
    },
    styleType() {
      return this.styleConfig.type || 1
    },
    avatar() {
      return (this.detail && this.detail.avatarUrl) || 'https://man.lqjy.cc/static/login-default.png'
    },
    wrapStyle() {
      const style = this.styleConfig
      return [
        `background:${style.bgcolor || ''}`,
        `padding:${this.px(style.paddingTop)} ${this.px(style.paddingLeft)} ${this.px(style.paddingBottom)} ${this.px(style.paddingLeft)}`,
      ].join(';')
    },
    baseStyle() {
      return `background:${this.styleConfig.background || '#fff'}`
    },
    backgroundColor() {
      const colors = {
        1: '#ff5704',
        2: '#19ad57',
        3: '#ffcc00',
        4: '#33a7ff',
        5: '#e4e4e4',
        6: '#c8ba97',
        7: '#623ceb',
      }
      return colors[this.styleType] || '#ffffff'
    },
    pointsText() {
      return typeof this.points_name === 'function' ? this.points_name() : '积分'
    },
  },
  watch: {
    backgroundColor: {
      immediate: true,
      handler(value) {
        this.$emit('bg', value)
      },
    },
  },
  methods: {
    px(value) {
      const number = Number(value || 0)
      return `${Number.isNaN(number) ? 0 : number}px`
    },
    openLink(url) {
      if (typeof this.gotoPage === 'function') this.gotoPage(url)
      else uni.navigateTo({ url })
    },
    openProfile() {
      this.openLink('/pagesPlus/main/user/set/set')
    },
    login() {
      if (typeof this.doLogin === 'function') this.doLogin()
    },
    scanQrcode() {
      this.$emit('scanQrcode')
    },
  },
}
</script>

<style scoped>
.grade {
  background-color: rgba(0, 0, 0, .1);
  border-radius: 40rpx;
  color: #fff;
  display: block;
  font-size: 22rpx;
  line-height: 36rpx;
  margin-left: 20rpx;
  padding: 0 16rpx;
}

.diy-Base {
  border-radius: 16rpx;
  bottom: 0;
  box-sizing: border-box;
  left: 0;
  margin: auto;
  padding: 0 20rpx;
  position: absolute;
  right: 0;
  width: 710rpx;
}

.diy-Base .list {
  width: 100%;
}

.diy-Base .list,
.diy-Base .list .item {
  align-items: center;
  display: flex;
  justify-content: center;
}

.diy-Base .list .item {
  flex-direction: column;
  padding: 20rpx 0;
}

.diy-Base .list.column-3 .item,
.diy-Base .list.column-5 .item {
  width: 20%;
}

.diy-Base .list.column-4 .item {
  width: 25%;
}

.diy-Base .list .item-text {
  padding: 8rpx 0;
  text-align: center;
  width: 100%;
}

.diy-Base .list .num {
  color: #111;
  font-size: 32rpx;
  font-weight: 700;
}

.bg-box {
  height: 370rpx;
  overflow: hidden;
  position: relative;
}

.bg-box .news .chat {
  height: 40rpx;
  width: 40rpx;
}

.bg-box .news .icon {
  color: #fff;
  font-size: 40rpx;
  margin-left: 20rpx;
}

.bg-box .news_num {
  background: #f42a16;
  border-radius: 50%;
  height: 16rpx;
  position: absolute;
  right: -6rpx;
  text-align: center;
  top: 0;
  width: 16rpx;
  z-index: 100;
}

.bg-base {
  height: 330rpx;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
}

.bg-base-1 {
  background-color: #ff5704;
}

.bg-base-2 {
  background-color: #19ad57;
}

.bg-base-3 {
  background-color: #fc0;
}

.bg-base-4 {
  background-color: #33a7ff;
}

.bg-base-5 {
  background-color: #e4e4e4;
}

.bg-base-6 {
  background-color: #c8ba97;
}

.bg-base-7 {
  background-color: #623ceb;
}

.item-image {
  background-color: #fff;
  border-radius: 50%;
  display: block;
  flex-shrink: 0;
  height: 102rpx;
  margin-right: 20rpx;
  overflow: hidden;
  width: 102rpx;
}

.user-row {
  align-items: center;
  display: flex;
  margin-left: 20rpx;
  margin-right: 20rpx;
  margin-top: 80rpx;
  position: relative;
  z-index: 1;
}

.user-content {
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 102rpx;
  justify-content: space-between;
  min-width: 0;
}

.user-main {
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.name-line {
  align-items: center;
  display: flex;
  flex: 1;
  min-width: 0;
}

.name-text {
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
}

.white {
  color: #fff;
}

</style>
