<template>
  <view :class="['acttention', themeClass]" :data-theme="themeName">
    <scroll-view class="scroll-Y" scroll-y lower-threshold="50" :style="{ height: scrollviewHigh + 'px' }" @scrolltolower="scrolltolowerFunc">
      <view v-for="(item, index) in product_list" :key="index" class="acttention-item">
        <image class="item-image" lazy-load :src="item.product_image" @tap="goto_product(item.product_id)" />
        <view class="item-info" @tap="goto_product(item.product_id)">
          <view class="item-title">{{ item.product_name }}</view>
          <view class="item-price">
            <view class="theme-price sale-price">¥<text class="price-num">{{ item.product_price }}</text></view>
            <view v-if="item.line_price" class="huaxianjia">¥<text>{{ item.line_price }}</text></view>
            <button class="theme-btn item-btn" @tap.stop="guanzhu(item.product_id)">取消收藏</button>
          </view>
        </view>
      </view>

      <view v-if="product_list.length === 0 && !loading" class="empty">
        <text class="iconfont icon-wushuju"></text>
        <text class="cont">亲，暂无相关记录哦</text>
      </view>
      <uni-load-more v-else :status="loadMoreStatus" />
    </scroll-view>
  </view>
</template>

<script>
import UniLoadMore from '../../../components/uni-load-more.vue'

export default {
  components: { UniLoadMore },
  data() {
    return {
      loading: true,
      no_more: false,
      scrollviewHigh: 0,
      product_list: [],
      page: 1,
      last_page: 0,
      isfollow: '',
    }
  },
  computed: {
    loadingType() {
      return this.loading ? 1 : this.product_list.length !== 0 && this.no_more ? 2 : 0
    },
    loadMoreStatus() {
      if (this.loading) return 'loading'
      return this.no_more ? 'noMore' : 'more'
    },
    themeName() {
      return typeof this.theme === 'function' ? this.theme() : ''
    },
    themeClass() {
      return this.themeName || ''
    },
  },
  onShow() {
    this.init()
    this.getData()
  },
  methods: {
    init() {
      this.page = 1
      this.product_list = []
      this.no_more = false
      uni.getSystemInfo({
        success: (res) => {
          this.scrollviewHigh = res.windowHeight
        },
      })
    },
    getData() {
      this.loading = true
      this._post(
        'user.Favorite/list',
        {
          page: this.page,
          type: 20,
          list_rows: 15,
        },
        (res) => {
          const list = (res.data && res.data.list) || {}
          this.loading = false
          this.last_page = list.last_page || 0
          this.product_list = this.product_list.concat(list.data || [])
          this.no_more = (list.last_page || 0) <= this.page
        },
      )
    },
    scrolltolowerFunc() {
      if (this.no_more) return
      this.page += 1
      if (this.page <= this.last_page) this.getData()
      else this.no_more = true
    },
    goto_product(productId) {
      this.gotoPage('/pages/product/detail/detail?product_id=' + productId)
    },
    guanzhu(productId) {
      this.page = 1
      this.loading = true
      this._post(
        'user.Favorite/add',
        {
          pid: productId,
          type: 20,
        },
        () => {
          this._post(
            'user.Favorite/list',
            {
              page: this.page,
              type: 20,
              list_rows: 15,
            },
            (res) => {
              const list = (res.data && res.data.list) || {}
              this.loading = false
              this.product_list = list.data || []
              this.last_page = list.last_page || 0
              this.no_more = (list.last_page || 0) <= this.page
            },
          )
        },
      )
    },
  },
}
</script>

<style scoped>
.acttention {
  background-color: #f2f2f2;
  min-height: 100vh;
  width: 100%;
}

.acttention-item {
  align-items: center;
  background-color: #fff;
  border-radius: 15rpx;
  box-sizing: border-box;
  display: flex;
  margin: 24rpx 20rpx 20rpx;
  padding: 24rpx;
  position: relative;
}

.acttention-item .item-image {
  display: block;
  flex-shrink: 0;
  height: 152rpx;
  margin-right: 17rpx;
  width: 152rpx;
}

.item-info {
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 152rpx;
  justify-content: space-between;
  min-width: 0;
}

.item-title {
  color: #333;
  display: -webkit-box;
  font-size: 28rpx;
  line-height: 40rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.item-price {
  align-items: flex-end;
  display: flex;
  justify-content: flex-end;
}

.sale-price {
  font-size: 24rpx;
}

.price-num {
  font-size: 36rpx;
  font-weight: 700;
}

.huaxianjia {
  color: #585858;
  flex: 1;
  font-size: 24rpx;
  margin-left: 5rpx;
  text-decoration: line-through;
}

.acttention-item .item-btn {
  align-items: center;
  border-radius: 56rpx;
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  font-size: 28rpx;
  height: 56rpx;
  justify-content: center;
  line-height: 56rpx;
  padding: 0;
  width: 182rpx;
}

.empty {
  align-items: center;
  color: #999;
  display: flex;
  justify-content: center;
  padding: 30rpx;
}

.cont {
  margin-left: 8rpx;
}
</style>
