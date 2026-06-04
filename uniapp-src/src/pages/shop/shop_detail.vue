<template>
  <view class="shop-detail-page">
    <view class="header">
      <image class="logo" mode="aspectFill" :src="shopData.logos || defaultLogo" />
      <view class="main">
        <view class="name">{{ shopData.store_name }}</view>
        <view class="score">评分 {{ shopData.server_score || 0 }} · 关注 {{ shopData.fav_count || 0 }}</view>
      </view>
      <button class="follow" @tap="guanzhu">{{ isfollow ? '已关注' : '+关注' }}</button>
    </view>

    <view class="section">
      <view class="section-title">商户介绍</view>
      <view class="desc">{{ shopData.description || '暂无内容' }}</view>
      <button class="plain" @tap="openClick">查看完整介绍</button>
    </view>

    <view class="section">
      <view class="row"><text>地址</text><text>{{ shopData.address }}</text></view>
      <view class="row"><text>入驻时间</text><text>{{ shopData.create_time }}</text></view>
      <view class="row"><text>营业状态</text><text>{{ shopData.status === 0 ? '营业中' : '休息中' }}</text></view>
      <image v-if="shopData.business_image" class="business-image" mode="widthFix" :src="shopData.business_image" @tap="preview(shopData.business_image)" />
    </view>

    <view class="actions">
      <button class="action" @tap="clickFunc">进入店铺</button>
      <button class="action" open-type="contact">联系客服</button>
    </view>

    <view v-if="showModal" class="modal" @tap="cancelAction">
      <view class="modal-card" @tap.stop>
        <view class="section-title">商户介绍</view>
        <scroll-view scroll-y class="modal-content">{{ shopData.description || '暂无内容' }}</scroll-view>
        <button class="plain" @tap="cancelAction">关闭</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      shop_supplier_id: '',
      shopData: {},
      isfollow: '',
      showModal: false
    }
  },
  computed: {
    defaultLogo() {
      return (this.config && this.config.pic_url ? this.config.pic_url : '') + '/shop-default.png'
    }
  },
  onLoad(query = {}) {
    this.shop_supplier_id = query.shop_supplier_id
  },
  onShow() {
    this.getData()
  },
  methods: {
    openClick() {
      this.showModal = true
    },
    cancelAction() {
      this.showModal = false
    },
    guanzhu() {
      if (typeof this._post !== 'function') return
      this._post('user.Favorite/add', { pid: this.shop_supplier_id, type: 10 }, () => {
        this.isfollow = this.isfollow ? 0 : 1
      })
    },
    clickFunc() {
      const url = '/pages/shop/shop?shop_supplier_id=' + this.shop_supplier_id
      if (typeof this.gotoPage === 'function') this.gotoPage(url)
      else uni.navigateTo({ url })
    },
    getData() {
      if (typeof this._get !== 'function') {
        // TODO:migration: shop detail needs shared _get runtime.
        return
      }
      this._get('supplier.Index/detail', { shop_supplier_id: this.shop_supplier_id }, (res) => {
        this.shopData = (res.data && res.data.detail) || {}
        this.isfollow = this.shopData.isfollow
      })
    },
    preview(url) {
      if (!url) return
      uni.previewImage({ urls: [url], current: url })
    }
  }
}
</script>

<style scoped>
.shop-detail-page { min-height: 100vh; background: #f7f7f7; padding: 24rpx; box-sizing: border-box; }
.header, .section { padding: 26rpx; margin-bottom: 20rpx; border-radius: 14rpx; background: #fff; }
.header { display: flex; align-items: center; gap: 20rpx; }
.logo { width: 140rpx; height: 140rpx; border-radius: 16rpx; background: #eee; }
.main { flex: 1; min-width: 0; }
.name { color: #222; font-size: 32rpx; font-weight: 700; }
.score { margin-top: 12rpx; color: #777; font-size: 24rpx; }
.follow { width: 130rpx; height: 58rpx; border-radius: 29rpx; background: #f03b2f; color: #fff; font-size: 24rpx; line-height: 58rpx; }
.section-title { color: #222; font-size: 30rpx; font-weight: 700; }
.desc { margin-top: 18rpx; color: #666; font-size: 26rpx; line-height: 1.7; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.plain { margin-top: 18rpx; height: 64rpx; border-radius: 32rpx; font-size: 26rpx; line-height: 64rpx; }
.row { display: flex; justify-content: space-between; gap: 24rpx; padding: 12rpx 0; color: #555; font-size: 26rpx; }
.business-image { width: 100%; margin-top: 20rpx; border-radius: 12rpx; }
.actions { display: flex; gap: 20rpx; }
.action { flex: 1; height: 78rpx; border-radius: 39rpx; background: #f03b2f; color: #fff; line-height: 78rpx; font-size: 28rpx; }
.modal { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 50rpx; background: rgba(0,0,0,.45); box-sizing: border-box; }
.modal-card { width: 100%; padding: 28rpx; border-radius: 16rpx; background: #fff; box-sizing: border-box; }
.modal-content { max-height: 520rpx; margin-top: 20rpx; color: #555; font-size: 26rpx; line-height: 1.7; }
</style>
