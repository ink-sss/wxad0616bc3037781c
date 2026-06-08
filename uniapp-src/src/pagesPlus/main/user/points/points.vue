<template>
  <view :class="themeClass" :data-theme="themeName">
    <view class="points-top theme-bg">
      <image class="bg-points" lazy-load :src="config.pic_url + '/20260406112403d4a588219.png'" />
      <view class="points-summary">
        <text class="points-name">{{ pointsTitle }}</text>
        <text class="points-value">{{ points }}</text>
        <text v-if="is_trans_balance" class="re-btn dominant" @tap="isPop = true">提现</text>
      </view>
      <button v-if="is_open" class="right-btn" @tap="gotoShop">
        {{ pointsTitle }}商城<text class="icon iconfont icon-sanjiao1 ml10"></text>
      </button>
    </view>

    <view class="points-list">
      <view v-for="(item, index) in tableData" :key="index" class="points-row">
        <view class="points-row-info">
          <text class="points-desc">{{ points_name(item.describe) }}</text>
          <text class="points-time">{{ item.create_time }}</text>
        </view>
        <view :class="Number(item.value) > 0 ? 'points-change plus' : 'points-change'">
          {{ Number(item.value) > 0 ? '+' : '' }}{{ item.value }}
        </view>
      </view>
    </view>

    <view v-if="tableData.length === 0 && !loading" class="empty">
      <text class="iconfont icon-wushuju"></text>
      <text class="cont">亲，暂无相关记录哦</text>
    </view>
    <uni-load-more v-else :status="loadMoreStatus" />

    <recharge :is-pop="isPop" :discount-ratio="discount_ratio" @close="closePop" />
  </view>
</template>

<script>
import UniLoadMore from '../../../../components/uni-load-more.vue'
import Recharge from './part/recharge.vue'

export default {
  components: { UniLoadMore, Recharge },
  data() {
    return {
      isPop: false,
      loadding: true,
      indicatorDots: true,
      autoplay: true,
      interval: 2000,
      duration: 500,
      topRefresh: false,
      phoneHeight: 0,
      scrollviewHigh: 0,
      tableData: [],
      last_page: 0,
      page: 1,
      list_rows: 20,
      no_more: false,
      loading: true,
      points: 0,
      is_open: false,
      discount_ratio: '0',
      is_trans_balance: false,
    }
  },
  computed: {
    loadingType() {
      return this.loading ? 1 : this.tableData.length !== 0 && this.no_more ? 2 : 0
    },
    loadMoreStatus() {
      if (this.loading) return 'loading'
      return this.no_more ? 'noMore' : 'more'
    },
    pointsTitle() {
      return typeof this.points_name === 'function' ? this.points_name() : '积分'
    },
    themeName() {
      return typeof this.theme === 'function' ? this.theme() : ''
    },
    themeClass() {
      return this.themeName || ''
    },
  },
  onReady() {
    uni.setNavigationBarTitle({ title: this.pointsTitle })
  },
  mounted() {
    this.getData()
  },
  onReachBottom() {
    if (this.page < this.last_page) {
      this.page += 1
      this.getData()
    } else {
      this.no_more = true
    }
  },
  methods: {
    closePop(needRefresh) {
      if (needRefresh != null) {
        this.page = 1
        this.tableData = []
        this.no_more = false
        this.getData()
      }
      this.isPop = false
    },
    getData() {
      this.loading = true
      this._get(
        'points.log/index',
        {
          page: this.page || 1,
          list_rows: this.list_rows,
        },
        (res) => {
          const data = res.data || {}
          const list = data.list || {}
          this.loading = false
          this.points = data.points
          this.discount_ratio = data.discount_ratio
          this.is_open = data.is_open
          this.is_trans_balance = data.is_trans_balance
          this.tableData = this.tableData.concat(list.data || [])
          this.last_page = list.last_page || 0
          if ((list.last_page || 0) <= this.page) this.no_more = true
        },
      )
    },
    gotoShop() {
      this.gotoPage('/pagesPlus/points/list/list')
    },
  },
}
</script>

<style scoped>
.points-top {
  box-sizing: border-box;
  color: #fff;
  height: 346rpx;
  padding: 0 30rpx;
  position: relative;
  z-index: 1;
}

.points-top .bg-points {
  height: 346rpx;
  left: 0;
  position: absolute;
  top: 0;
  width: 750rpx;
  z-index: 0;
}

.points-summary {
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  position: relative;
  width: 100%;
  z-index: 1;
}

.points-name {
  font-size: 28rpx;
  margin-bottom: 30rpx;
}

.points-value {
  font-size: 72rpx;
  font-weight: 700;
}

.re-btn {
  background-color: #fff;
  border-radius: 30rpx;
  font-size: 28rpx;
  height: 60rpx;
  line-height: 60rpx;
  margin-top: 46rpx;
  padding: 0 8rpx;
  text-align: center;
  width: 190rpx;
}

.right-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
  padding: 0;
  position: absolute;
  right: 21rpx;
  top: 12rpx;
  z-index: 2;
}

.right-btn::after {
  border: 0;
}

.right-btn .icon {
  color: #fff;
  font-size: 28rpx;
}

.points-list {
  background: #fff;
  padding: 0 30rpx;
}

.points-row {
  align-items: center;
  border-bottom: 1rpx solid #eee;
  display: flex;
  justify-content: space-between;
  padding: 30rpx 0;
}

.points-row-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.points-desc {
  color: #333;
  font-size: 28rpx;
  line-height: 40rpx;
}

.points-time {
  color: #999;
  font-size: 24rpx;
  line-height: 34rpx;
  padding-top: 10rpx;
}

.points-change {
  color: #e2231a;
  flex-shrink: 0;
  font-size: 28rpx;
  padding-left: 24rpx;
}

.empty {
  align-items: center;
  display: flex;
  justify-content: center;
  padding: 30rpx;
  color: #999;
  font-size: 28rpx;
}

.cont {
  margin-left: 8rpx;
}
</style>
