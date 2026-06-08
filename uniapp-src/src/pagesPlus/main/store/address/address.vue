<template>
  <view class="store-address-page">
    <view class="location-bar">
      <view class="location-text">当前位置：{{ latitude && longitude ? longitude + ', ' + latitude : '未获取' }}</view>
      <button class="location-btn" @tap="loadLocation">重新定位</button>
    </view>

    <view v-for="item in storeList" :key="item.store_id" class="store-card" @tap="onSelectedStore(item)">
      <view class="store-info">
        <view class="store-name">{{ item.store_name }}</view>
        <view class="store-phone">{{ item.phone }}</view>
        <view class="store-address">{{ regionText(item) }}{{ item.address }}</view>
        <view class="store-distance">{{ item.distance_unit }}</view>
      </view>
      <view v-if="item.store_id == selectedId" class="selected">已选</view>
    </view>

    <view v-if="!isLoading && !storeList.length" class="empty">暂无门店</view>
  </view>
</template>

<script>
import { ensureLocationAuthorized, getLocation } from '../../../../platform/weixin/location'

export default {
  data() {
    return {
      isLoading: true,
      storeList: [],
      longitude: '',
      latitude: '',
      selectedId: -1
    }
  },
  onLoad(query = {}) {
    this.selectedId = query.store_id || -1
    this.loadLocation()
  },
  methods: {
    regionText(item) {
      const region = item.region || {}
      return `${region.province || ''}${region.city || ''}${region.region || ''}`
    },
    async loadLocation() {
      try {
        await ensureLocationAuthorized()
        const location = await getLocation({ type: 'wgs84' })
        this.longitude = location.longitude
        this.latitude = location.latitude
      } catch (error) {
        uni.showToast({ title: '获取定位失败，请打开定位权限', icon: 'none', duration: 2000 })
      }
      this.getData()
    },
    getData() {
      if (typeof this._get !== 'function') {
        this.isLoading = false
        // TODO:migration: store address needs shared _get runtime.
        return
      }
      this.isLoading = true
      this._get('store.store/lists', {
        longitude: this.longitude,
        latitude: this.latitude
      }, (res) => {
        this.isLoading = false
        this.storeList = (res.data && res.data.list) || []
      })
    },
    onSelectedStore(item) {
      const storeId = item.store_id || item
      this.selectedId = storeId
      const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
      if (pages.length < 2) return
      uni.$emit('selectStoreId', storeId)
      if (this.$fire && this.$fire.fire) this.$fire.fire('selectStoreId', storeId)
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.store-address-page { min-height: 100vh; background: #f7f7f7; padding: 20rpx; box-sizing: border-box; }
.location-bar { display: flex; align-items: center; gap: 20rpx; padding: 20rpx; margin-bottom: 20rpx; border-radius: 12rpx; background: #fff; }
.location-text { flex: 1; min-width: 0; color: #666; font-size: 24rpx; }
.location-btn { width: 180rpx; height: 60rpx; border-radius: 30rpx; font-size: 24rpx; line-height: 60rpx; }
.store-card { display: flex; align-items: center; gap: 20rpx; padding: 26rpx; margin-bottom: 18rpx; border-radius: 12rpx; background: #fff; }
.store-info { flex: 1; min-width: 0; }
.store-name { color: #222; font-size: 30rpx; font-weight: 700; }
.store-phone, .store-address, .store-distance { margin-top: 10rpx; color: #777; font-size: 24rpx; line-height: 1.4; }
.selected { color: #f03b2f; font-size: 26rpx; }
.empty { padding: 120rpx 0; text-align: center; color: #999; font-size: 26rpx; }
</style>
