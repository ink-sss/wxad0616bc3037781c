<template>
  <view :class="themeClass" :data-theme="themeClass">
    <view class="top-view" :style="`background:${bgColor};`"></view>
    <view class="h5-profile-card" @tap="openProfileOrLogin">
      <image class="h5-profile-avatar" :src="profileAvatar" mode="aspectFill" />
      <view class="h5-profile-main">
        <text class="h5-profile-name">{{ profileName }}</text>
        <text class="h5-profile-sub">{{ profileSubtitle }}</text>
      </view>
      <text class="h5-profile-action">{{ profileActionText }}</text>
    </view>
    <view v-if="getPhone" class="bind_phone">
      <view class="bind_content">
        <view class="bind_txt">确保账户安全，请绑定手机号</view>
        <button v-if="wxBinding" class="bind_btn" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">去绑定</button>
        <button v-else class="bind_btn" @tap="bindMobile">去绑定</button>
      </view>
    </view>
    <view class="h5-center-modules">
      <view v-if="liveRoomContext.roomCode || liveRoomContext.roomId" class="live-return-card" @tap="gotoH5CenterModule('returnLive')">
        <view>
          <text class="live-return-title">继续观看直播</text>
          <text class="live-return-sub">{{ liveRoomContext.liveName || '返回最近直播间' }}</text>
        </view>
        <text class="live-return-arrow">进入</text>
      </view>

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
          <text class="module-title">直播服务</text>
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
    <live-tab />
    <tab-bar />
  </view>
</template>

<script>
import { loginCode, phonePayload } from '../page-tools.js'
import { getOrderUnreadStats } from '../../../api/order.js'
import { getRefundUnreadStats } from '../../../api/refund.js'
import { getCenter } from '../../../api/user.js'
import { ensureH5PageAuth } from '../../../services/h5-auth-context.js'
import { buildBroadcastEntryUrl, normalizeLiveRouteOptions } from '../../../utils/live-route.js'
import { loadLiveRoomContext, saveLiveRoomContext } from '../../../utils/live-room-context.js'
import RequestLoading from '../../../components/liveloading.vue'
import LiveTab from '../../../components/liveTab.vue'
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
    TabBar
  },
  data() {
    return {
      isloadding: true,
      detail: defaultDetail(),
      orderCount: {},
      sessionKey: '',
      wxBinding: false,
      getPhone: false,
      isLoggedIn: false,
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
        { type: 'unpay', text: '待付款', count: this.orderCount?.unpay || 0, icon: '/static/icon/pay.png' },
        { type: 'unsend', text: '待发货', count: this.orderCount?.unsend || 0, icon: '/static/icon/daifahuo.png' },
        { type: 'unreceive', text: '待收货', count: this.orderCount?.unreceive || 0, icon: '/static/icon/daishouhuo.png' },
        { type: 'finished', text: '已完成', count: this.orderCount?.finished || 0, icon: '/static/order/1-3.png' },
        { type: 'refund', text: '退款/售后', count: this.orderCount?.refund || 0, icon: '/static/icon/icon-tuikuan.png' },
      ]
    },
    h5ServiceItems() {
      return [
        { type: 'prizeRecord', text: '中奖记录', icon: '/static/icon/lottery-points.png' },
        { type: 'invitationRecord', text: '邀请记录', icon: '/static/icon/icon-tuandui.png' },
        { type: 'complaint', text: '投诉', icon: '/static/icon/chat.png' },
        { type: 'address', text: '收货地址', icon: '/static/icon/address_icon.png' },
      ]
    },
    hasProfile() {
      return !!(this.detail && (this.detail.nickName || this.detail.nickname || this.detail.userName || this.detail.user_id || this.detail.userId))
    },
    profileAvatar() {
      return this.detail?.avatarUrl || this.detail?.avatar || '/static/login-default.png'
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
      return id ? `ID：${id}` : '已登录'
    },
    profileActionText() {
      return this.isLoggedIn ? '设置' : '登录'
    },
  },
  onReady() {
    uni.hideTabBar()
  },
  onLoad(query = {}) {
    this.wxBinding = uni.getStorageSync('wxBinding')
    if (query && query.referee_id) uni.setStorageSync('referee_id', query.referee_id)
    if (query?.roomCode || query?.roomId || query?.liveId) saveLiveRoomContext(normalizeLiveRouteOptions(query))
    if (!ensureH5PageAuth(query, '/pages/center/index')) {
      this.isloadding = false
      return
    }
    this.syncAuthFromStorage()
    this.applyCachedProfile()
    this.syncLiveContext()
    this.getSession()
    uni.setNavigationBarColor({ frontColor: '#ffffff', backgroundColor: '#ffffff' })
  },
  onShow() {
    if (!ensureH5PageAuth({}, '/pages/center/index')) {
      this.isloadding = false
      return
    }
    this.syncLiveContext()
    this.getData()
  },
  onPullDownRefresh() {
    this.getData()
  },
  methods: {
    getSession() {
      if (!this.isLoggedIn) return
      loginCode().then((code) => {
        this._post('user.user/getSession', { code }, (res) => {
          this.sessionKey = res.data.session_key
        })
      })
    },
    async getData() {
      this.isloadding = true
      uni.showLoading({ title: '加载中' })
      this.syncAuthFromStorage()
      this.applyCachedProfile()
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
        ensureH5PageAuth({}, '/pages/center/index')
        return
      }
      this.gotoPage('/pages/user/set/set')
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
    syncLiveContext() {
      this.liveRoomContext = loadLiveRoomContext()
    },
    liveQuery() {
      const context = this.liveRoomContext || {}
      const params = []
      if (context.roomCode) params.push(`roomCode=${encodeURIComponent(context.roomCode)}`)
      if (context.roomId || context.liveId) params.push(`roomId=${encodeURIComponent(context.roomId || context.liveId)}`)
      return params.length ? `?${params.join('&')}` : ''
    },
    gotoH5CenterModule(type) {
      const query = this.liveQuery()
      const roomId = this.liveRoomContext?.roomId || this.liveRoomContext?.liveId || ''
      const withLiveQuery = (url) => {
        if (!query) return url
        return `${url}${url.includes('?') ? '&' : '?'}${query.slice(1)}`
      }
      const routes = {
        orders: withLiveQuery('/pages/order/list?status=all'),
        unpay: withLiveQuery('/pages/order/list?status=unpay'),
        unsend: withLiveQuery('/pages/order/list?status=unsend'),
        unreceive: withLiveQuery('/pages/order/list?status=unreceive'),
        refund: withLiveQuery('/pages/order/refund-list'),
        prizeRecord: `/pages/prize-record/index${query}`,
        invitationRecord: withLiveQuery(`/pages/invitation-record/index?roomId=${encodeURIComponent(roomId)}`),
        complaint: withLiveQuery('/pages/report/report-type?fromPath=%2Fpages%2Fcenter%2Findex'),
        address: withLiveQuery('/pages/address/index'),
      }
      if (type === 'returnLive') {
        uni.navigateTo({ url: buildBroadcastEntryUrl(this.liveRoomContext || {}) })
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

.h5-profile-card {
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 28rpx rgba(0, 0, 0, .06);
  display: flex;
  margin: -66rpx 24rpx 20rpx;
  padding: 28rpx 26rpx;
  position: relative;
  z-index: 2;
}

.h5-profile-avatar {
  background: #f0f0f0;
  border-radius: 50%;
  height: 96rpx;
  width: 96rpx;
}

.h5-profile-main {
  flex: 1;
  margin-left: 22rpx;
  min-width: 0;
}

.h5-profile-name {
  color: #222;
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.h5-profile-sub {
  color: #888;
  display: block;
  font-size: 24rpx;
  margin-top: 8rpx;
}

.h5-profile-action {
  background: #fff1e8;
  border-radius: 999rpx;
  color: #f05a24;
  font-size: 24rpx;
  padding: 10rpx 20rpx;
}

.h5-center-modules {
  background: #f5f6f8;
  padding: 0 24rpx 160rpx;
}

.live-return-card,
.module-card {
  background: #fff;
  border-radius: 16rpx;
  margin-top: 20rpx;
}

.live-return-card {
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 26rpx 28rpx;
}

.live-return-title,
.module-title {
  color: #222;
  display: block;
  font-size: 30rpx;
  font-weight: 700;
}

.live-return-sub {
  color: #888;
  display: block;
  font-size: 24rpx;
  margin-top: 8rpx;
  max-width: 460rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.live-return-arrow {
  background: #f03b2f;
  border-radius: 28rpx;
  color: #fff;
  font-size: 24rpx;
  padding: 12rpx 24rpx;
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
