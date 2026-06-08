<template>
  <view :class="themeClass" :data-theme="themeName">
    <view class="top-tabbar">
      <view :class="status === 0 ? 'tab-item active' : 'tab-item'" @tap="stateFunc(0)">进行中</view>
      <view :class="status === 1 ? 'tab-item active' : 'tab-item'" @tap="stateFunc(1)">砍价成功</view>
      <view :class="status === 2 ? 'tab-item active' : 'tab-item'" @tap="stateFunc(2)">砍价失败</view>
    </view>

    <scroll-view class="scroll-Y" scroll-y lower-threshold="50" :style="{ height: scrollviewHigh + 'px' }" @scrolltolower="scrolltolowerFunc">
      <view class="my-bargaing-list">
        <view v-for="(item, index) in listData" :key="index" class="item" @tap="gotoDetail(item.bargain_task_id)">
          <view class="datetime">
            <text class="time">{{ item.create_time }}</text>
            <view v-if="status === 0" class="surplus-time">
              <countdown :config="rturnObjec(item)" />
            </view>
          </view>
          <view class="product">
            <image class="cover" lazy-load mode="aspectFill" :src="item.file_path" />
            <view class="info">
              <text class="product-name">{{ item.product_name }}</text>
              <view class="price-line">
                <text class="theme-price small">砍到底价:</text>
                <text class="theme-price small">￥</text>
                <text class="theme-price price">{{ item.bargain_price }}</text>
                <text class="line-price">￥{{ item.product_price }}</text>
              </view>
              <view class="progress-line">
                <view class="progress-box">
                  <view class="progress-box-active" :style="{ width: progressReturn(item) + '%' }"></view>
                </view>
                <view class="progress-text">完成度:{{ progressReturn(item) }}%</view>
              </view>
            </view>
          </view>
        </view>

        <view v-if="listData.length === 0 && !loading" class="empty">
          <image class="list-null-image" lazy-load :src="config.pic_url + '/list-null.png'" />
          <text class="cont">暂无相关订单</text>
        </view>
        <uni-load-more v-else :status="loadMoreStatus" />
      </view>
    </scroll-view>

    <view class="more-bargaining">
      <button class="theme-btn" @tap="gotoMore">更多活动</button>
    </view>
  </view>
</template>

<script>
import UniLoadMore from '../../../../components/uni-load-more.vue'
import Countdown from '../../../../components/countdown/countdown.vue'

export default {
  components: { UniLoadMore, Countdown },
  data() {
    return {
      loading: true,
      phoneHeight: 0,
      scrollviewHigh: 0,
      status: 0,
      topRefresh: false,
      page: 1,
      list_rows: 20,
      listData: [],
      last_page: 0,
      no_more: false,
      countdownConfig: {
        startstamp: 0,
        endstamp: 0,
        type: 'text',
        title: '剩余：',
      },
    }
  },
  computed: {
    loadingType() {
      return this.loading ? 1 : this.listData.length !== 0 && this.no_more ? 2 : 0
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
  mounted() {
    this.init()
    this.getData()
  },
  methods: {
    rturnObjec(item) {
      return {
        type: 'text',
        startstamp: 0,
        endstamp: item.end_time,
        title: '剩余',
      }
    },
    progressReturn(item) {
      return item.is_floor === 1 ? 100 : item.bargain_rate
    },
    init() {
      uni.getSystemInfo({
        success: (res) => {
          this.phoneHeight = res.windowHeight
          this.scrollviewHigh = Math.max(0, res.windowHeight - 96 - 128)
        },
      })
    },
    stateFunc(status) {
      if (this.status === status) return
      this.listData = []
      this.page = 1
      this.no_more = false
      this.status = status
      this.getData()
    },
    getData() {
      this.loading = true
      this._get(
        'user.bargain/lists',
        {
          page: this.page,
          list_rows: this.list_rows,
          status: this.status,
        },
        (res) => {
          const list = (res.data && res.data.list) || {}
          this.loading = false
          this.listData = this.listData.concat(list.data || [])
          this.last_page = list.last_page || 0
          if ((list.last_page || 0) <= this.page) this.no_more = true
        },
      )
    },
    scrolltolowerFunc() {
      if (this.no_more) return
      this.page += 1
      if (this.page <= this.last_page) this.getData()
      else this.no_more = true
    },
    gotoDetail(id) {
      this.gotoPage('/pagesPlus/bargain/haggle/haggle?bargain_task_id=' + id)
    },
    goback() {
      uni.navigateBack({})
    },
    gotoMore() {
      this.gotoPage('/pagesPlus/bargain/list/list')
    },
    returnValFunc(value, index) {
      console.log(value, index)
    },
  },
}
</script>

<style scoped>
.top-tabbar {
  align-items: center;
  background: #fff;
  display: flex;
  height: 96rpx;
  justify-content: space-around;
}

.tab-item {
  align-items: center;
  color: #666;
  display: flex;
  flex: 1;
  font-size: 28rpx;
  height: 96rpx;
  justify-content: center;
  position: relative;
}

.tab-item.active {
  color: #e2231a;
  font-weight: 700;
}

.tab-item.active::after {
  background: currentColor;
  border-radius: 4rpx;
  bottom: 0;
  content: '';
  height: 4rpx;
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
  width: 60rpx;
}

.more-bargaining {
  background-color: #fff;
  bottom: 0;
  left: 0;
  padding: 20rpx;
  position: fixed;
  right: 0;
}

.more-bargaining .theme-btn {
  border: none;
  border-radius: 88rpx;
  color: #fff;
  font-size: 30rpx;
  height: 88rpx;
  line-height: 88rpx;
}

.progress-box {
  background: #eee;
  border-radius: 6rpx;
  height: 12rpx;
  overflow: hidden;
  width: 342rpx;
}

.progress-box-active {
  border-radius: 6rpx;
  height: 12rpx;
}

[data-theme='theme0'] .progress-box-active,
[data-theme='theme0'] .more-bargaining .theme-btn {
  background-color: #ff5704 !important;
}

[data-theme='theme1'] .progress-box-active,
[data-theme='theme1'] .more-bargaining .theme-btn {
  background-color: #19ad57 !important;
}

[data-theme='theme2'] .progress-box-active,
[data-theme='theme2'] .more-bargaining .theme-btn {
  background-color: #fc0 !important;
}

[data-theme='theme3'] .progress-box-active,
[data-theme='theme3'] .more-bargaining .theme-btn {
  background-color: #33a7ff !important;
}

[data-theme='theme4'] .progress-box-active,
[data-theme='theme4'] .more-bargaining .theme-btn {
  background-color: #e4e4e4 !important;
}

[data-theme='theme5'] .progress-box-active,
[data-theme='theme5'] .more-bargaining .theme-btn {
  background-color: #c8ba97 !important;
}

[data-theme='theme6'] .progress-box-active,
[data-theme='theme6'] .more-bargaining .theme-btn {
  background-color: #623ceb !important;
}

.my-bargaing-list {
  margin: 0 20rpx;
  padding-bottom: 200rpx;
}

.my-bargaing-list .item {
  background: #fff;
  border-radius: 15rpx;
  margin-top: 24rpx;
  padding: 24rpx;
}

.datetime {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.time {
  color: #999;
  font-size: 28rpx;
}

.product {
  align-items: flex-start;
  display: flex;
  margin-top: 30rpx;
}

.cover {
  border-radius: 15rpx;
  display: block;
  flex-shrink: 0;
  height: 160rpx;
  margin-right: 16rpx;
  width: 160rpx;
}

.info {
  flex: 1;
  min-width: 0;
}

.product-name {
  color: #333;
  display: -webkit-box;
  font-size: 28rpx;
  line-height: 40rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.price-line {
  align-items: baseline;
  display: flex;
  margin-top: 20rpx;
}

.small {
  font-size: 24rpx;
}

.price {
  font-size: 32rpx;
  font-weight: 700;
}

.line-price {
  color: #999;
  font-size: 24rpx;
  margin-left: 10rpx;
  text-decoration: line-through;
}

.progress-line {
  align-items: center;
  display: flex;
  font-size: 24rpx;
  justify-content: space-between;
  margin-top: 10rpx;
}

.progress-text {
  color: #999;
  flex-shrink: 0;
  margin-left: 12rpx;
  white-space: nowrap;
}

.surplus-time {
  background: #fff;
  border-radius: 4rpx;
  color: #333;
  font-size: 26rpx;
  padding: 4rpx 16rpx;
}

.empty {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 30rpx;
}

.list-null-image {
  height: 240rpx;
  width: 240rpx;
}

.cont {
  color: #999;
  font-size: 32rpx;
  margin-top: 16rpx;
}
</style>
