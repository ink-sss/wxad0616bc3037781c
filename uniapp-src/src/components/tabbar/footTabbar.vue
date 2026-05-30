<template>
  <view @tap.stop>
    <view v-if="!isScroll" class="foot-bottom"></view>
    <view class="foot-tavbar-container" :style="{ background: detail.backgroundColor || '#fff' }">
      <view v-for="(item, index) in visibleTabs" :key="item.text || index" :class="['item', isActive(item) ? 'active' : '']" @tap="tabBarFunc(item)">
        <view class="inner">
          <image v-if="detail.type !== '2'" mode="aspectFill" lazy-load :src="isActive(item) ? item.selectedIconPath : item.iconPath"></image>
          <text v-if="detail.type !== '1'" class="text-name" :style="{ color: isActive(item) ? detail.textHoverColor : detail.textColor }">{{ item.text }}</text>
        </view>
      </view>
    </view>
    <!-- TODO:migration: bind-mobile popup lives in pages/login and is outside W4 scope. -->
  </view>
</template>
<script>
export default {
  name: 'FootTabbar',
  props: { isScroll: { type: Boolean, default: false } },
  data() { return { detail: { list: [] }, wx_phone_compulsory: false }; },
  computed: {
    visibleTabs() { return (this.detail.list || []).filter((item) => item.text !== '商户' || this.isMerchantVisible(item)); },
    currentRoute() { const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []; const current = pages[pages.length - 1]; return current ? '/' + current.route : ''; }
  },
  created() { this.getData(); },
  mounted() { this.wxPhone(); },
  methods: {
    wxPhone() { this.wx_phone_compulsory = !!uni.getStorageSync('wx_phone_compulsory'); if (uni.getStorageSync('get_phone')) uni.removeStorageSync('get_phone'); },
    defaultNav() { const theme = this.$store?.state?.theme || 'red'; return { backgroundColor: '#FFFFFF', is_auto: '0', textColor: '#000000', textHoverColor: typeof this.getThemeColor === 'function' ? this.getThemeColor() : '#f03b2f', type: '0', list: [ { iconPath: '/static/tabbar/home.png', link_url: '/pages/index/index', selectedIconPath: '/static/tabbar/home_' + theme + '.png', text: '首页' }, { iconPath: '/static/tabbar/category.png', link_url: '/pages/product/category', selectedIconPath: '/static/tabbar/category_' + theme + '.png', text: '分类' }, { iconPath: '/static/tabbar/shop.png', is_show: false, link_url: '/pages/shop/shop_list', selectedIconPath: '/static/tabbar/shop_' + theme + '.png', text: '商户' }, { iconPath: '/static/tabbar/cart.png', is_show: true, link_url: '/pages/cart/cart', selectedIconPath: '/static/tabbar/cart_' + theme + '.png', text: '购物车' }, { iconPath: '/static/tabbar/user.png', is_show: true, link_url: '/pages/user/index/index', selectedIconPath: '/static/tabbar/user_' + theme + '.png', text: '我的' } ] }; },
    isMerchantVisible(item) { return item.is_show === true || item.is_show === 1 || item.is_show === '1'; },
    shouldUseRemoteNav(remote) { return remote && String(remote.is_auto) !== '0'; },
    getData() { if (typeof this._get !== 'function') { this.detail = this.defaultNav(); return; } this._get('index/nav', {}, (res) => { const remote = res?.data?.vars?.data; this.detail = this.shouldUseRemoteNav(remote) ? remote : this.defaultNav(); uni.setStorageSync('TabBar', this.detail); }); },
    isActive(item) { return item.link_url === this.currentRoute; },
    tabBarFunc(item) { if (this.$store?.commit) this.$store.commit('changefootTab', item.text); if (typeof this.gotoPage === 'function') this.gotoPage(item.link_url); else uni.switchTab({ url: item.link_url }); }
  }
};
</script>
<style scoped>
.foot-bottom { height: calc(50px + env(safe-area-inset-bottom)); width: 100%; }
.foot-tavbar-container { position: fixed; left: 0; right: 0; bottom: 0; z-index: 90; display: flex; align-items: center; width: 100%; height: 50px; padding-bottom: env(safe-area-inset-bottom); box-sizing: content-box; box-shadow: 0 0 6rpx rgba(0,0,0,.3); }
.item { flex: 1; display: flex; align-items: center; justify-content: center; min-width: 0; height: 50px; box-sizing: border-box; }
.inner { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 50px; }
.inner image { width: 50rpx; height: 50rpx; }
.text-name { max-width: 100%; font-size: 24rpx; line-height: 1.2; white-space: nowrap; }
</style>
