<template>
  <view :class="themeClass" :data-theme="themeClass">
    <view class="top-view" :style="`background:${bgColor};`"></view>
    <diy
      v-if="items"
      style="position:relative"
      :diy-items="items"
      :store-info="storeInfo"
      :user-info="userInfo"
      @scanQrcode="scanQrcode"
      @bg="bg"
    >
      <view v-if="getPhone" class="bind_phone">
        <view class="bind_content">
          <view class="bind_txt">确保账户安全，请绑定手机号</view>
          <button v-if="wxBinding" class="bind_btn" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">去绑定</button>
          <button v-else class="bind_btn" @tap="bindMobile">去绑定</button>
        </view>
      </view>
    </diy>
    <request-loading v-if="isloadding" :loadding="isloadding" />
    <live-tab />
    <tab-bar />
  </view>
</template>

<script>
import { loginCode, phonePayload, toast } from '../page-tools.js'
import { scanCode } from '../../../platform/weixin/index.js'
import Diy from '../../../components/diy/diy.vue'
import RequestLoading from '../../../components/liveloading.vue'
import LiveTab from '../../../components/liveTab.vue'
import TabBar from '../../../components/tabbar/footTabbar.vue'

export default {
  components: {
    Diy,
    RequestLoading,
    LiveTab,
    TabBar
  },
  data() {
    return {
      items: [],
      isloadding: true,
      loadding: true,
      detail: { balance: 0, points: 0, grade: { name: '' } },
      storeInfo: {},
      orderCount: {},
      coupon: 0,
      storeCouponCount: 0,
      user_type: '',
      msgcount: 0,
      sessionKey: '',
      wxBinding: false,
      getPhone: false,
      urls: '',
      jweixin: null,
      bgColor: '',
      liveData: null,
      version: '',
    }
  },
  computed: {
    themeClass() {
      return typeof this.theme === 'function' ? this.theme() : ''
    },
    userInfo() {
      return {
        detail: this.detail,
        coupon: this.coupon,
        storeCouponCount: this.storeCouponCount,
        orderCount: this.orderCount,
        msgcount: this.msgcount,
        getPhone: this.getPhone,
      }
    },
  },
  onReady() {
    uni.hideTabBar()
  },
  onLoad(query = {}) {
    this.wxBinding = uni.getStorageSync('wxBinding')
    if (query && query.referee_id) uni.setStorageSync('referee_id', query.referee_id)
    this.getSession()
    uni.setNavigationBarColor({ frontColor: '#ffffff', backgroundColor: '#ffffff' })
  },
  onShow() {
    this.getData()
  },
  onPullDownRefresh() {
    this.getData()
  },
  methods: {
    getSession() {
      loginCode().then((code) => {
        this._post('user.user/getSession', { code }, (res) => {
          this.sessionKey = res.data.session_key
        })
      })
    },
    scanQrcode() {
      scanCode({ onlyFromCamera: true })
        .then((res) => {
          if (res.errMsg === 'scanCode:ok') this.gotoPage('/pages/store/clerkorder?order_no=' + res.result)
          else toast('扫码失败，请重试')
        })
        .catch(() => toast('扫码失败，请重试'))
    },
    getData() {
      this.isloadding = true
      uni.showLoading({ title: '加载中' })
      this._get(
        'user.index/center',
        { url: this.urls, source: this.getPlatform() },
        (res) => {
          const data = res.data || {}
          const page = data.page || {}
          this.detail = data.userInfo
          this.storeInfo = data.storeInfo || {}
          this.coupon = data.coupon || 0
          this.storeCouponCount = data.storeCouponCount || 0
          this.orderCount = data.orderCount || {}
          this.msgcount = data.msgcount || 0
          this.getPhone = data.getPhone
          this.loadding = false
          this.items = page.items || []
          this.setPage(page.page || {})
          this.loadding = false
          uni.stopPullDownRefresh()
          uni.hideLoading()
          this.isloadding = false
        },
        false,
        () => {
          uni.stopPullDownRefresh()
          uni.hideLoading()
          this.isloadding = false
        },
      )
    },
    setPage(page = {}) {
      if (page.params && page.params.name) {
        uni.setNavigationBarTitle({ title: page.params.name })
      }
    },
    bindMobile() {
      this.gotoPage('/pages/user/modify-phone/modify-phone')
    },
    getPhoneNumber(event) {
      if (event?.detail?.errMsg && event.detail.errMsg !== 'getPhoneNumber:ok') return false
      let detail
      try {
        detail = phonePayload(event)
      } catch (error) {
        return false
      }
      uni.showLoading({ title: '加载中' })
      this._post(
        'user.user/bindMobile',
        {
          session_key: this.sessionKey,
          encrypted_data: detail.encrypted_data,
          iv: detail.iv,
        },
        (res) => {
          uni.showToast({ title: '绑定成功' })
          this.detail.mobile = res.data.mobile
        },
        false,
        () => uni.hideLoading(),
      )
    },
    bg(value) {
      this.bgColor = value
    },
  },
}
</script>

<style scoped>
.bind_phone {
  box-sizing: border-box;
  height: 80rpx;
  margin-top: 20rpx;
  padding: 0 20rpx;
  width: 100%;
}

.bind_content {
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  display: flex;
  height: 100%;
  justify-content: space-between;
  padding: 0 20rpx;
}

.bind_btn {
  background-color: #e2231a;
  border-radius: 25rpx;
  color: #fff;
  font-size: 22rpx;
  height: 50rpx;
  line-height: 50rpx;
  text-align: center;
  width: 134rpx;
}

.top-view {
  height: 140rpx;
  width: 100%;
}

.version {
  background-color: #f2f2f2;
  color: #666;
  font-size: 28rpx;
  padding: 20rpx;
  text-align: center;
}
</style>
