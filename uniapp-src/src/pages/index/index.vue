<template>
  <view class="home-page" :class="themeClass" :data-theme="themeClass">
    <diy
      v-if="items"
      ref="diy"
      :diy-items="items"
      :diytop="diytop"
      @openSearch="openSearch"
      @stopPush="stopPush"
      @getData="getData"
      @scanQrcode="scanQrcode"
    />

    <view v-if="loading" class="home-state">加载中...</view>
    <view v-else-if="loadError" class="home-state home-state-error" @tap="getData">{{ loadError }}</view>

    <view v-if="is_collection" class="collection-box" :style="collectionTopStyle">
      <view class="inner">
        <text>点击“</text>
        <text class="point">.</text>
        <text class="point point-big">.</text>
        <text class="point">.</text>
        <text>”添加到我的小程序，微信首页下拉即可快速访问店铺</text>
      </view>
      <button class="close-btn" type="primary" @tap="is_collection = false">x</button>
    </view>

    <view v-if="is_follow === '1' || is_follow === 1" class="follow-gzh">
      <text class="icon iconfont icon-guanbi" @tap="is_follow = 0"></text>
      <official-account></official-account>
    </view>

    <home-push v-if="is_homepush" :homepush-data="homepush_data" @close="is_homepush = false" />
    <search-product v-if="showSearch" :is-show="showSearch" @close="closeSearch" />
    <live-tab />
    <tab-bar />
  </view>
</template>

<script>
import Diy from '../../components/diy/diy.vue'
import HomePush from './home-push/home-push.vue'
import SearchProduct from '../../components/searchProduct.vue'
import LiveTab from '../../components/liveTab.vue'
import TabBar from '../../components/tabbar/footTabbar.vue'
import { scanQrCode } from '../../platform/weixin/scan'
import { defaultHomeData, DEFAULT_THEME } from '../../utils/default-style-data.js'
function normalizeDiyItems(items) {
  if (Array.isArray(items)) return items
  if (!items || typeof items !== 'object') return []

  return Object.keys(items)
    .filter((key) => key !== 'page')
    .sort((left, right) => Number(left) - Number(right))
    .map((key) => items[key])
}

function hasDefaultProductStream(items) {
  return items.some((item) => item && item.type === 'product' && Array.isArray(item.data) && item.data.length === 0)
}

function ensureDefaultProductStream(items) {
  if (hasDefaultProductStream(items)) return items
  const defaultProduct = normalizeDiyItems(defaultHomeData().items).find((item) => item && item.type === 'product')
  return defaultProduct ? items.concat(defaultProduct) : items
}

export default {
  components: {
    Diy,
    HomePush,
    SearchProduct,
    LiveTab,
    TabBar
  },
  data() {
    return {
      loading: true,
      loadding: true,
      items: [],
      is_collection: false,
      is_follow: '0',
      is_homepush: false,
      homepush_data: {},
      homeShare: {},
      url: '',
      diytop: 0,
      showSearch: false,
      liveData: null,
      loadError: ''
    }
  },
  computed: {
    themeClass() {
      return typeof this.theme === 'function' ? this.theme() : ''
    },
    collectionTopStyle() {
      const top = typeof this.topBarTop === 'function' ? this.topBarTop() : 0
      const height = typeof this.topBarHeight === 'function' ? this.topBarHeight() : 0
      return `top:${top + height + 10}px;`
    }
  },
  onReady() {
    uni.hideTabBar()
  },
  onLoad(query = {}) {
    uni.removeStorageSync('me')
    if (query.invitation_id) uni.setStorageSync('invitation_id', query.invitation_id)
    if (query.referee_id) uni.setStorageSync('referee_id', query.referee_id)
    this.liveData = uni.getStorageSync('is_liveGo') || null
    this.getData()
  },
  onPullDownRefresh() {
    this.toggleInit()
  },
  onReachBottom() {
    if (this.$refs.diy && this.$refs.diy.scrolltolowerFunc) {
      this.$refs.diy.scrolltolowerFunc()
    }
  },
  onPageScroll(event) {
    this.diytop = event.scrollTop
  },
  onShareAppMessage() {
    return {
      title: this.homeShare.share_title || '首页',
      path: '/pages/index/index?' + this.shareParams(),
      imageUrl: this.homeShare.share_img || ''
    }
  },
  onShareTimeline() {
    return {
      title: this.homeShare.share_title || '首页',
      query: this.shareParams(),
      imageUrl: this.homeShare.share_img || ''
    }
  },
  methods: {
    shareParams(extra = {}) {
      if (typeof this.getShareUrlParams === 'function') return this.getShareUrlParams(extra)
      return Object.keys(extra).map((key) => `${key}=${extra[key]}`).join('&')
    },
    stopPush() {
      uni.stopPullDownRefresh()
    },
    openSearch(value) {
      if (value !== false) this.showSearch = true
    },
    closeSearch() {
      this.showSearch = false
    },
    finishLoading(errorMessage = '') {
      this.loading = false
      this.loadding = false
      if (errorMessage) this.loadError = errorMessage
      uni.hideLoading()
      uni.stopPullDownRefresh()
    },
    applyDefaultTheme() {
      uni.setStorageSync('theme', DEFAULT_THEME)
      if (this.$store?.commit) this.$store.commit('changeTheme', DEFAULT_THEME)
    },
    applyHomeData(data) {
      const nextData = data || defaultHomeData()
      const page = nextData.page || (nextData.items && nextData.items.page) || { params: { name: '首页' } }
      const setting = nextData.setting || {}
      const collection = setting.collection || {}
      const officia = setting.officia || {}
      const homepush = setting.homepush || {}

      this.items = ensureDefaultProductStream(normalizeDiyItems(nextData.items))
      this.homeShare = page.params || { share_title: '首页', share_img: '' }
      this.is_collection = collection.status === 1 || collection.status === '1'
      this.is_follow = officia.status || '0'
      this.is_homepush = homepush.is_open === 1 || homepush.is_open === '1'
      this.homepush_data = homepush
      this.setPage(page)
    },
    clickBtn() {
      const pageSpy = this.$pageSpy
      console.log('clickBtn', pageSpy)
      if (pageSpy && typeof pageSpy.showPanel === 'function') pageSpy.showPanel()
    },
    getData() {
      this.loadError = ''
      uni.showLoading({ title: '加载中' })
      this.applyDefaultTheme()
      if (typeof this._get !== 'function') {
        this.applyHomeData(defaultHomeData())
        this.finishLoading()
        return
      }

      this._get('index/index', { url: this.url }, (res) => {
        this.applyHomeData(res.data || defaultHomeData())
        this.finishLoading()
      }, () => {
        this.applyHomeData(defaultHomeData())
        this.finishLoading()
      })
    },
    setPage(page) {
      const params = page.params || {}
      const style = page.style || {}
      uni.setNavigationBarTitle({ title: params.name || '首页' })
      uni.setNavigationBarColor({
        frontColor: style.titleTextColor === 'white' ? '#ffffff' : '#000000',
        backgroundColor: style.titleBackgroundColor || '#fd642a'
      })
    },
    toggleInit() {
      if (this.$refs.diy && this.$refs.diy.pullDown) {
        this.$refs.diy.pullDown()
      } else {
        this.getData()
      }
    },
    async scanQrcode() {
      try {
        const result = await scanQrCode()
        if (result.errMsg === 'scanCode:ok' || result.result) {
          this.gotoWriteOff(result.result)
        }
      } catch (error) {
        uni.showToast({ title: '扫码失败，请重试', icon: 'none' })
      }
    },
    gotoWriteOff(orderNo) {
      const url = '/pagesPlus/main/store/clerkorder?order_no=' + encodeURIComponent(orderNo || '')
      if (typeof this.gotoPage === 'function') this.gotoPage(url)
      else uni.navigateTo({ url })
    },
    goLive(type) {
      const urls = ['/pages/live-push/live-list', '/pages/live-push/live-push', '/pages/broadcast/entry?liveId=7171']
      uni.navigateTo({ url: urls[type] || urls[0] })
    }
  }
}
</script>

<style scoped>
.home-page { min-height: 100vh; background: #f5f5f5; padding-bottom: 120rpx; }
.home-state { padding: 220rpx 40rpx 80rpx; color: #999; font-size: 26rpx; text-align: center; }
.home-state-error { color: #f02811; }
.collection-box { background: #fff; border: 1px solid #eee; border-radius: 16rpx; box-shadow: 0 0 6rpx rgba(0,0,0,.08); font-size: 24rpx; line-height: 40rpx; padding: 20rpx; position: fixed; right: 20rpx; width: 380rpx; z-index: 100; }
.collection-box:after { background: #fff; border-left: 1px solid #eee; border-top: 1px solid #eee; content: ""; display: block; height: 30rpx; position: absolute; right: 140rpx; top: -15rpx; transform: rotate(45deg); width: 30rpx; }
.collection-box .point { color: #666; font-size: 60rpx; height: 20rpx; line-height: 0; width: 20rpx; }
.collection-box .point-big { font-size: 80rpx; }
.close-btn { background: #fff; border-radius: 50%; color: #999; height: 40rpx; line-height: 30rpx; padding: 0; position: absolute; right: 10rpx; top: 10rpx; width: 40rpx; }
.follow-gzh { background: #fff; border-radius: 16rpx; bottom: calc(50px + env(safe-area-inset-bottom)); box-shadow: 0 0 20rpx rgba(0,0,0,.1); left: 0; position: fixed; right: 0; z-index: 10; }
.follow-gzh .icon-guanbi { display: block; position: absolute; right: 10rpx; top: 10rpx; z-index: 99; }
</style>
