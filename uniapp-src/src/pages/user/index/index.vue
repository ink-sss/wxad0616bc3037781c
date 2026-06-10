<template>
  <view :class="themeClass" :data-theme="themeClass">
    <view class="top-view" :style="`background:${bgColor};`"></view>
    <view class="profile-hero">
      <view class="profile-bg-base" :style="`background:${bgColor};`"></view>
      <view class="profile-hero-row" @tap="openProfileOrLogin">
        <image class="profile-hero-avatar" :src="profileAvatar" mode="aspectFill" />
        <view class="profile-hero-content">
          <view class="profile-hero-main">
            <view class="profile-name-line">
              <text class="profile-hero-name">{{ profileName }}</text>
            </view>
          </view>
          <text class="profile-hero-id">{{ profileSubtitle }}</text>
        </view>
      </view>
    </view>
    <view v-if="getPhone" class="bind_phone">
      <view class="bind_content">
        <view class="bind_txt">确保账户安全，请绑定手机号</view>
        <button v-if="wxBinding" class="bind_btn" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">去绑定</button>
        <button v-else class="bind_btn" @tap="bindMobile">去绑定</button>
      </view>
    </view>
    <view class="h5-center-modules">
      <view class="module-card">
        <view class="module-head">
          <text class="module-title">我的订单</text>
          <text class="module-more" @tap="gotoH5CenterModule('orders')">全部订单</text>
        </view>
        <view class="order-grid">
          <view v-for="item in h5OrderItems" :key="item.type" class="order-item" @tap="gotoH5CenterModule(item.type)">
            <image class="order-icon" :src="item.icon" mode="aspectFit" />
            <text class="order-text">{{ item.text }}</text>
            <text v-if="item.count" class="badge">{{ item.count }}</text>
          </view>
        </view>
      </view>

      <view class="module-card">
        <view class="module-head">
          <text class="module-title">更多功能</text>
        </view>
        <view class="service-list">
          <view v-for="item in h5ServiceItems" :key="item.type" class="service-item" @tap="gotoH5CenterModule(item.type)">
            <view class="service-left">
              <image class="service-icon" :src="item.icon" mode="aspectFit" />
              <text>{{ item.text }}</text>
            </view>
            <text class="service-arrow">›</text>
          </view>
        </view>
      </view>
    </view>
    <request-loading v-if="isloadding" :loadding="isloadding" />
    <live-mini-window :room-code="liveRoomCode" :bottom-offset="140" />
    <live-tab />
    <tab-bar />
  </view>
</template>

<script>
import { bindMiniProgramMobile } from '../page-tools.js'
import { getOrderUnreadStats } from '../../../api/order.js'
import { getRefundUnreadStats } from '../../../api/refund.js'
import { getCenter } from '../../../api/user.js'
import { checkCurrentDistributor } from '../../../api/live.js'
import { normalizeLiveRouteOptions } from '../../../utils/live-route.js'
import { appendLiveRoomQuery, loadLiveRoomContext, mergeLiveRoomContext, saveLiveRoomContext } from '../../../utils/live-room-context.js'
import RequestLoading from '../../../components/liveloading.vue'
import LiveTab from '../../../components/liveTab.vue'
import LiveMiniWindow from '../../../components/live-mini-window.vue'
import TabBar from '../../../components/tabbar/footTabbar.vue'


function defaultDetail() {
  return { balance: 0, points: 0, grade: { name: '' } }
}

function toNumber(value) {
  const number = Number(value || 0)
  return Number.isFinite(number) ? number : 0
}

function hasToken() {
  try {
    return !!(uni.getStorageSync('h5_token') || uni.getStorageSync('token'))
  } catch (error) {
    return false
  }
}

function readStorageObject(key) {
  try {
    const value = uni.getStorageSync(key)
    if (!value) return null
    if (typeof value === 'string') return JSON.parse(value)
    return typeof value === 'object' ? value : null
  } catch (error) {
    return null
  }
}

function readCachedCustomer() {
  const keys = ['h5_user_info', 'h5Customer', 'customer', 'userInfo', 'user_info', 'user']
  for (const key of keys) {
    const value = readStorageObject(key)
    if (value) return value.customer || value.userInfo || value
  }
  return null
}

function normalizeCustomer(customer = {}) {
  const base = defaultDetail()
  if (!customer || typeof customer !== 'object') return base
  const name = customer.nickName || customer.nickname || customer.userName || customer.username || customer.name || customer.mobile || ''
  const avatar = customer.avatarUrl || customer.avatar || customer.headimgurl || customer.headImg || customer.head || ''
  const userId = customer.user_id || customer.userId || customer.customerId || customer.customer_id || customer.id || ''
  return {
    ...base,
    ...customer,
    nickName: name,
    nickname: customer.nickname || name,
    userName: customer.userName || customer.username || name,
    avatarUrl: avatar,
    avatar,
    user_id: userId,
    userId,
    mobile: customer.mobile || customer.phone || '',
    grade: customer.grade || { name: customer.gradeName || '' },
    balance: customer.balance || 0,
    points: customer.points || 0,
  }
}

function normalizeOrderCount(orderStats = {}, refundStats = {}) {
  const payment = toNumber(orderStats.payment ?? orderStats.unpay ?? orderStats.waitPay ?? orderStats.pendingPay)
  const delivery = toNumber(orderStats.delivery ?? orderStats.unsend ?? orderStats.waitShip ?? orderStats.waitDelivery)
  const received = toNumber(orderStats.received ?? orderStats.unreceive ?? orderStats.waitReceive)
  const finished = toNumber(orderStats.finished ?? orderStats.complete ?? orderStats.waitReview ?? orderStats.comment)
  const refund = toNumber(refundStats.refund ?? refundStats.refunding ?? refundStats.processing ?? refundStats.unread ?? refundStats.total ?? orderStats.refund)
  return {
    payment,
    unpay: payment,
    delivery,
    unsend: delivery,
    received,
    unreceive: received,
    finished,
    complete: finished,
    comment: finished,
    refund,
  }
}

export default {
  components: {
    RequestLoading,
    LiveTab,
    LiveMiniWindow,
    TabBar
  },
  data() {
    return {
      isloadding: true,
      detail: defaultDetail(),
      orderCount: {},
      wxBinding: false,
      getPhone: false,
      isLoggedIn: false,
      isDistributor: false,
      distributorStatus: 0,
      enableShare: 1,
      bgColor: '#ff5704',
      liveRoomContext: {},
    }
  },
  computed: {
    themeClass() {
      return typeof this.theme === 'function' ? this.theme() : ''
    },
    h5OrderItems() {
      return [
        { type: 'unpay', text: '待付款', count: this.orderCount?.unpay || 0, icon: 'https://man.lqjy.cc/static/icon/pay.png' },
        { type: 'unsend', text: '待发货', count: this.orderCount?.unsend || 0, icon: 'https://man.lqjy.cc/static/icon/daifahuo.png' },
        { type: 'unreceive', text: '待收货', count: this.orderCount?.unreceive || 0, icon: 'https://man.lqjy.cc/static/icon/daishouhuo.png' },
        { type: 'finished', text: '已完成', count: this.orderCount?.finished || 0, icon: 'https://man.lqjy.cc/static/order/1-3.png' },
        { type: 'refund', text: '退款/售后', count: this.orderCount?.refund || 0, icon: 'https://man.lqjy.cc/static/icon/icon-tuikuan.png' },
      ]
    },
    h5ServiceItems() {
      const items = [
        { type: 'prizeRecord', text: '中奖记录', icon: 'https://man.lqjy.cc/static/icon/lottery-points.png' },
      ]
      if (this.enableShare !== 0 && this.isDistributor && this.distributorStatus === 1) {
        items.push({ type: 'invitationRecord', text: '邀请记录', icon: 'https://man.lqjy.cc/static/icons/more2.png' })
      }
      items.push({ type: 'address', text: '收货地址', icon: 'https://man.lqjy.cc/static/icon/address_icon.png' })
      items.push({ type: 'complaint', text: '投诉', icon: 'https://man.lqjy.cc/static/icons/more4.png' })
      return items
    },
    hasProfile() {
      return !!(this.detail && (this.detail.nickName || this.detail.nickname || this.detail.userName || this.detail.user_id || this.detail.userId))
    },
    profileAvatar() {
      return this.detail?.avatarUrl || this.detail?.avatar || 'https://man.lqjy.cc/static/login-default.png'
    },
    profileName() {
      if (this.hasProfile) {
        return this.detail.nickName || this.detail.nickname || this.detail.userName || this.detail.mobile || '用户'
      }
      return this.isLoggedIn ? '用户' : '点击登录'
    },
    profileSubtitle() {
      if (!this.isLoggedIn) return '未登录，点击登录'
      const id = this.detail?.user_id || this.detail?.userId
      return id ? `ID:${id}` : 'ID:--'
    },
    liveRoomCode() {
      return this.liveRoomContext?.roomCode || ''
    },
    liveRoomId() {
      return Number(this.liveRoomContext?.liveId || this.liveRoomContext?.roomId || 0)
    },
  },
  onReady() {
    uni.hideTabBar()
  },
  onLoad(query = {}) {
    this.wxBinding = uni.getStorageSync('wxBinding')
    if (query && query.referee_id) uni.setStorageSync('referee_id', query.referee_id)
    if (query?.roomCode || query?.roomId || query?.liveId) saveLiveRoomContext(normalizeLiveRouteOptions(query))
    this.syncAuthFromStorage()
    this.applyCachedProfile()
    this.syncLiveContext()
    uni.setNavigationBarColor({ frontColor: '#ffffff', backgroundColor: '#ffffff' })
  },
  onShow() {
    this.syncLiveContext()
    this.refreshDistributorStatus()
    this.getData()
  },
  onPullDownRefresh() {
    this.getData()
  },
  methods: {
    async getData() {
      this.isloadding = true
      uni.showLoading({ title: '加载中' })
      this.syncAuthFromStorage()
      this.applyCachedProfile()
      this.refreshDistributorStatus()
      try {
        await this.loadH5CenterData()
      } catch (error) {
        uni.showToast({ title: error?.msg || error?.message || '个人中心加载失败', icon: 'none' })
      } finally {
        uni.stopPullDownRefresh()
        uni.hideLoading()
        this.isloadding = false
      }
    },
    async loadH5CenterData() {
      const [centerResult, orderResult, refundResult] = await Promise.allSettled([
        getCenter(),
        getOrderUnreadStats(),
        getRefundUnreadStats(),
      ])
      let loaded = false
      let centerData = {}
      if (centerResult.status === 'fulfilled') {
        centerData = centerResult.value || {}
        const customer = centerData.customer || centerData.customerInfo || centerData.userInfo || centerData.user || centerData.profile
        if (customer) this.applyProfile(customer, { cache: true, h5: true })
        this.getPhone = !!(centerData.getPhone || centerData.needBindPhone || centerData.needBindMobile || customer?.needBindPhone)
        this.enableShare = Number(centerData.enableShare ?? centerData.enable_share ?? this.enableShare)
        loaded = true
      }
      if (orderResult.status === 'fulfilled' || refundResult.status === 'fulfilled') {
        this.orderCount = normalizeOrderCount(
          orderResult.status === 'fulfilled' ? orderResult.value : {},
          refundResult.status === 'fulfilled' ? refundResult.value : {},
        )
        loaded = true
      } else if (centerResult.status === 'fulfilled') {
        this.orderCount = normalizeOrderCount(centerData.orderStats || centerData.orderCount || {}, centerData.refundStats || {})
      }
      if (!loaded) throw centerResult.reason || orderResult.reason || refundResult.reason || new Error('H5个人中心加载失败')
    },
    async refreshDistributorStatus() {
      try {
        const result = await checkCurrentDistributor()
        const nextIsDistributor = !!result?.isDistributor
        const nextDistributorStatus = Number(result?.status || 0)
        const nextInvitationRecordVisible = nextIsDistributor && nextDistributorStatus === 1
        this.isDistributor = nextIsDistributor
        this.distributorStatus = nextDistributorStatus
        saveLiveRoomContext({
          roomCode: this.liveRoomCode || this.liveRoomContext?.roomCode || '',
          liveId: this.liveRoomId || '',
          roomId: this.liveRoomId || '',
          isDistributor: nextIsDistributor,
          distributorStatus: nextDistributorStatus,
          invitationRecordVisible: nextInvitationRecordVisible,
        })
      } catch (error) {
        console.warn('[UserCenter] checkDistributor fail:', error)
      }
    },
    applyProfile(customer = {}, options = {}) {
      const normalized = normalizeCustomer(customer)
      this.detail = {
        ...defaultDetail(),
        ...this.detail,
        ...normalized,
        grade: normalized.grade || this.detail.grade || { name: '' },
      }
      if (options.h5) this.isLoggedIn = true
      if (options.cache && (normalized.user_id || normalized.nickName || normalized.avatarUrl)) {
        uni.setStorageSync('h5_user_info', normalized)
      }
    },
    applyCachedProfile() {
      const cached = readCachedCustomer()
      if (cached) this.applyProfile(cached, { cache: false, h5: false })
    },
    syncAuthFromStorage() {
      this.isLoggedIn = hasToken()
    },
    openProfileOrLogin() {
      if (!this.isLoggedIn) {
        if (typeof this.doLogin === 'function') this.doLogin()
        return
      }
      this.gotoPage('/pagesPlus/main/user/set/set')
    },
    bindMobile() {
      this.gotoPage('/pagesPlus/main/user/modify-phone/modify-phone')
    },
    getPhoneNumber(event) {
      if (event?.detail?.errMsg && event.detail.errMsg !== 'getPhoneNumber:ok') return false
      uni.showLoading({ title: '加载中' })
      const userId = this.detail?.user_id || this.detail?.userId || uni.getStorageSync('user_id')
      bindMiniProgramMobile(userId, event)
        .then((data = {}) => {
          uni.showToast({ title: '绑定成功' })
          this.detail.mobile = data.mobile
          if (data.user_id) uni.setStorageSync('user_id', data.user_id)
        })
        .catch((error) => {
          uni.showToast({ title: error?.message || error?.msg || '授权失败，请重新授权', icon: 'none' })
        })
        .finally(() => uni.hideLoading())
    },
    syncLiveContext() {
      this.liveRoomContext = mergeLiveRoomContext(loadLiveRoomContext() || {})
      const context = this.liveRoomContext || {}
      this.isDistributor = !!context.invitationRecordVisible || (!!context.isDistributor && Number(context.distributorStatus || 0) === 1)
      this.distributorStatus = Number(context.distributorStatus || (this.isDistributor ? 1 : 0) || 0)
      this.enableShare = Number(context.enableShare ?? context.enable_share ?? this.enableShare)
    },
    withLiveQuery(url) {
      return appendLiveRoomQuery(url, this.liveRoomContext || {})
    },
    gotoH5CenterModule(type) {
      const routes = {
        orders: this.withLiveQuery('/pages/order/list?status=all'),
        unpay: this.withLiveQuery('/pages/order/list?status=unpay'),
        unsend: this.withLiveQuery('/pages/order/list?status=unsend'),
        unreceive: this.withLiveQuery('/pages/order/list?status=unreceive'),
        refund: this.withLiveQuery('/pages/order/refund-list'),
        prizeRecord: this.withLiveQuery('/pagesPlus/main/prize-record/index'),
        complaint: this.withLiveQuery('/pagesPlus/main/report/report-type?fromPath=%2Fpages%2Fcenter%2Findex'),
        address: this.withLiveQuery('/pagesPlus/main/address/index'),
      }
      if (type === 'invitationRecord') {
        uni.navigateTo({ url: '/pagesPlus/main/invitation-record/index' })
        return
      }
      const url = routes[type]
      if (url) uni.navigateTo({ url })
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

.profile-hero {
  box-sizing: border-box;
  height: 370rpx;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.profile-bg-base {
  height: 330rpx;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
}

.profile-hero-row {
  align-items: center;
  display: flex;
  margin-left: 20rpx;
  margin-right: 20rpx;
  margin-top: 80rpx;
  position: relative;
  z-index: 1;
  width: 100%;
}

.profile-hero-avatar {
  background: #fff;
  border-radius: 50%;
  display: block;
  flex-shrink: 0;
  height: 102rpx;
  margin-right: 20rpx;
  overflow: hidden;
  width: 102rpx;
}

.profile-hero-content {
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 102rpx;
  justify-content: space-between;
  min-width: 0;
}

.profile-hero-main {
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: space-between;
  width: 100%;
}

.profile-name-line {
  align-items: center;
  display: flex;
  flex: 1;
  min-width: 0;
}

.profile-hero-name {
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-hero-id {
  color: #fff;
  display: block;
  font-size: 28rpx;
  line-height: 36rpx;
}

.h5-center-modules {
  background: linear-gradient(to bottom, #ff5704 0, #ff5704 130rpx, #f5f6f8 130rpx, #f5f6f8 100%);
  margin-top: -170rpx;
  padding: 0 24rpx 160rpx;
}

.module-card {
  background: #fff;
  border-radius: 16rpx;
  margin-top: 20rpx;
  position: relative;
}

.module-title {
  color: #222;
  display: block;
  font-size: 30rpx;
  font-weight: 700;
}

.module-card {
  padding: 0 24rpx;
}

.module-head {
  align-items: center;
  border-bottom: 1rpx solid #f2f2f2;
  display: flex;
  height: 88rpx;
  justify-content: space-between;
}

.module-more {
  color: #999;
  font-size: 24rpx;
}

.order-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 26rpx 0 24rpx;
}

.order-item {
  align-items: center;
  display: flex;
  flex-direction: column;
  position: relative;
}

.order-icon {
  height: 48rpx;
  width: 48rpx;
}

.order-text {
  color: #333;
  font-size: 24rpx;
  margin-top: 12rpx;
}

.badge {
  align-items: center;
  background: #f03b2f;
  border-radius: 999rpx;
  color: #fff;
  display: flex;
  font-size: 20rpx;
  height: 30rpx;
  justify-content: center;
  min-width: 30rpx;
  padding: 0 8rpx;
  position: absolute;
  right: 28rpx;
  top: -8rpx;
}

.service-list {
  padding-bottom: 8rpx;
}

.service-item {
  align-items: center;
  border-bottom: 1rpx solid #f5f5f5;
  display: flex;
  height: 92rpx;
  justify-content: space-between;
}

.service-item:last-child {
  border-bottom: 0;
}

.service-left {
  align-items: center;
  color: #333;
  display: flex;
  font-size: 27rpx;
}

.service-icon {
  height: 42rpx;
  margin-right: 18rpx;
  width: 42rpx;
}

.service-arrow {
  color: #bbb;
  font-size: 42rpx;
  line-height: 1;
}

.version {
  background-color: #f2f2f2;
  color: #666;
  font-size: 28rpx;
  padding: 20rpx;
  text-align: center;
}
</style>
