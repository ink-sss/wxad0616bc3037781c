<template>
  <view v-if="visible" class="shop-mask" @tap="close">
    <view class="shop-panel" @tap.stop>
      <view class="shop-head">
        <view class="title">直播商品</view>
        <button v-if="Number(isOrder) === 1" size="mini" @tap="$emit('openMyOrder')">我的订单</button>
      </view>
      <scroll-view class="shop-scroll" scroll-y @scrolltolower="loadMore">
        <view v-for="(item, index) in list" :key="item.product_id || index" class="product" @tap="goProduct(item)">
          <image class="product-img" :src="item.product_image" />
          <view class="product-info">
            <view class="product-name">{{ item.product_name || item.name }}</view>
            <view class="selling">{{ item.selling_point }}</view>
            <view class="price">￥{{ item.product_price || item.product_min_price || item.price || '0.00' }}</view>
          </view>
        </view>
        <view class="load-tip">{{ finished ? '已经到底了' : '上拉加载更多' }}</view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { requestWithVm } from '../page-tools.js'
import { navigateToMiniProgram } from '../../../platform/weixin/navigation.js'

export default {
  props: {
    liveId: { type: [Number, String], default: '' },
    isOrder: { type: [Number, String], default: 1 },
  },
  emits: ['openMyOrder', 'goShop'],
  data() {
    return {
      visible: false,
      list: [],
      page: 1,
      finished: false,
      loading: false,
    }
  },
  methods: {
    showShowList() {
      this.visible = true
      this.page = 1
      this.list = []
      this.finished = false
      this.loadMore()
    },
    close() {
      this.visible = false
    },
    loadMore() {
      if (this.loading || this.finished) return
      this.loading = true
      requestWithVm(this, '_get', 'live.RoomNewProduct/lists', {
        live_id: this.liveId,
        list_rows: 10,
        page: this.page,
      })
        .then((res) => {
          const rows = (((res.data || {}).list || {}).data || res.data || [])
          if (rows.length) {
            this.list = this.list.concat(rows)
            this.page += 1
          } else {
            this.finished = true
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    goProduct(item) {
      if (item.product_id > 0) {
        this.$emit('goShop', item.product_id, item.spec_sku_id)
      } else if (item.link_type === 1 && item.link_url) {
        uni.navigateTo({ url: `/pagesPlus/main/webview/webview?url=${encodeURIComponent(item.link_url)}` })
      } else if (item.link_url) {
        // TODO:migration Validate shortLink/appId route split for live external products.
        navigateToMiniProgram({
          shortLink: item.link_url,
          appId: item.wechat_app_id,
          path: `${item.link_url || ''}${item.scene || ''}`,
        })
      }
      this.close()
    },
  },
}
</script>

<style scoped>
.shop-mask { position: fixed; inset: 0; z-index: 180; display: flex; align-items: flex-end; background: rgba(0, 0, 0, .35); }
.shop-panel { width: 100%; max-height: 72vh; padding: 24rpx; border-radius: 20rpx 20rpx 0 0; background: #fff; color: #333; box-sizing: border-box; }
.shop-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx; }
.title { font-size: 32rpx; font-weight: 600; }
.shop-scroll { height: 58vh; }
.product { display: flex; padding: 18rpx 0; border-bottom: 1px solid #eee; }
.product-img { width: 150rpx; height: 150rpx; border-radius: 8rpx; background: #f2f2f2; }
.product-info { flex: 1; min-width: 0; margin-left: 18rpx; }
.product-name { font-size: 28rpx; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.selling { margin-top: 10rpx; color: #888; font-size: 24rpx; }
.price { margin-top: 18rpx; color: #ff5704; font-size: 30rpx; font-weight: 600; }
.load-tip { padding: 24rpx; color: #999; text-align: center; font-size: 24rpx; }
</style>
