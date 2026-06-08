<template>
  <view class="store-detail-page">
    <view v-if="!loading" class="detail">
      <image class="logo" mode="aspectFill" :src="storeDetail.logo && storeDetail.logo.file_path" />
      <view class="name">{{ storeDetail.store_name }}</view>
      <view class="line">营业时间：{{ storeDetail.shop_hours }}</view>
      <view class="line">联系电话：{{ storeDetail.phone }}</view>
      <button class="plain-btn" @tap="callPhone(storeDetail.phone)">拨打电话</button>
      <view class="line">联系人：{{ storeDetail.linkman }}</view>
      <view class="line">门店状态：{{ storeDetail.status && storeDetail.status.text }}</view>
      <view class="line">审核状态：{{ storeDetail.is_check && storeDetail.is_check.text }}</view>
      <view class="line">地址：{{ addressText }}</view>
      <view class="summary">{{ storeDetail.summary }}</view>
      <map
        v-if="storeDetail.latitude && storeDetail.longitude"
        id="storeMap"
        class="store-map"
        :latitude="storeDetail.latitude"
        :longitude="storeDetail.longitude"
        :markers="covers"
        @tap="openMap"
      />
    </view>
    <view v-else class="empty">加载中...</view>
  </view>
</template>

<script>
import { makePhoneCall } from '../../../../platform/weixin/navigation'
import { openLocation } from '../../../../platform/weixin/location'

export default {
  data() {
    return {
      loading: true,
      store_id: null,
      storeDetail: {},
      covers: []
    }
  },
  computed: {
    addressText() {
      const region = this.storeDetail.region || {}
      return `${region.province || ''}${region.city || ''}${region.region || ''}${this.storeDetail.address || ''}`
    }
  },
  onLoad(query = {}) {
    this.store_id = query.store_id
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      if (typeof this._get !== 'function') {
        this.loading = false
        // TODO:migration: store detail needs shared _get runtime.
        return
      }
      uni.showLoading({ title: '加载中' })
      this._get('store.store/detail', { store_id: this.store_id }, (res) => {
        this.storeDetail = (res.data && res.data.detail) || {}
        this.covers = [{
          id: 1,
          latitude: Number(this.storeDetail.latitude),
          longitude: Number(this.storeDetail.longitude),
          title: this.storeDetail.store_name || ''
        }]
        this.loading = false
        uni.hideLoading()
      })
    },
    async callPhone(phone) {
      if (!phone) return
      try {
        await makePhoneCall(phone)
      } catch (error) {
        uni.showToast({ title: '拨号失败', icon: 'none' })
      }
    },
    async openMap() {
      if (!this.storeDetail.latitude || !this.storeDetail.longitude) return
      try {
        await openLocation({
          latitude: Number(this.storeDetail.latitude),
          longitude: Number(this.storeDetail.longitude),
          name: this.storeDetail.store_name || '',
          address: this.addressText
        })
      } catch (error) {
        uni.showToast({ title: '打开地图失败', icon: 'none' })
      }
    }
  }
}
</script>

<style scoped>
.store-detail-page { min-height: 100vh; background: #f7f7f7; padding: 24rpx; box-sizing: border-box; }
.detail { padding: 28rpx; border-radius: 14rpx; background: #fff; }
.logo { width: 150rpx; height: 150rpx; border-radius: 12rpx; background: #eee; }
.name { margin-top: 20rpx; color: #222; font-size: 34rpx; font-weight: 700; }
.line { margin-top: 14rpx; color: #555; font-size: 26rpx; line-height: 1.5; }
.summary { margin-top: 22rpx; color: #777; font-size: 26rpx; line-height: 1.7; }
.plain-btn { margin: 20rpx 0 6rpx; height: 68rpx; border-radius: 34rpx; font-size: 26rpx; line-height: 68rpx; }
.store-map { width: 100%; height: 420rpx; margin-top: 28rpx; border-radius: 12rpx; overflow: hidden; }
.empty { padding: 120rpx 0; color: #999; text-align: center; font-size: 26rpx; }
</style>
