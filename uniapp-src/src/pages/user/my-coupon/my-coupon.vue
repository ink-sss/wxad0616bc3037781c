<template>
  <view class="coupon-page" :data-theme="theme && theme()">
    <view class="tabs">
      <view :class="{ active: state_active === 0 }" @tap="stateFunc(0)">未使用</view>
      <view :class="{ active: state_active === 1 }" @tap="stateFunc(1)">已使用</view>
      <view :class="{ active: state_active === 2 }" @tap="stateFunc(2)">已过期</view>
    </view>

    <view v-for="group in supList" :key="group.name" class="group">
      <view v-if="group.name && group.list.length" class="group-title">{{ group.name }}</view>
      <view v-for="item in group.list" :key="item.user_coupon_id || item.coupon_id" class="coupon" :class="{ disabled: item.is_expire || item.is_use }">
        <view class="main">
          <view class="name">{{ item.name }}</view>
          <view class="time">{{ expireText(item) }}</view>
          <view class="limit">{{ Number(item.min_price) > 0 ? '满' + Number(item.min_price) + '元可用' : '无门槛' }}</view>
        </view>
        <view class="side">
          <view v-if="item.coupon_type && item.coupon_type.value === 10" class="amount">¥{{ Number(item.reduce_price) }}</view>
          <view v-else-if="item.coupon_type && item.coupon_type.value === 20" class="amount">{{ Number(item.discount) / 10 }}折</view>
          <button v-if="!item.is_expire && !item.is_use" class="use" @tap="useCoupon(item)">去使用</button>
        </view>
      </view>
    </view>

    <view v-if="DataList.length === 0 && !loading" class="empty">暂无相关优惠券</view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      state_active: 0,
      DataList: [],
      no_more: false,
      loading: false,
      data_type: 'not_use',
      supList: [],
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      this.loading = true
      uni.showLoading({ title: '加载中' })
      this._get(
        'user.coupon/lists',
        { data_type: this.data_type },
        (res) => {
          this.loading = false
          uni.hideLoading()
          this.DataList = res.data.list || []
          this.getSup()
        },
        false,
        () => uni.hideLoading(),
      )
    },
    getSup() {
      const supplierGroups = []
      const platform = { name: '平台优惠券', list: [] }
      this.DataList.forEach((item) => {
        if (!item.supplier) {
          platform.list.push(item)
          return
        }
        let group = supplierGroups.find((entry) => entry.name === item.supplier.name)
        if (!group) {
          group = { name: item.supplier.name, list: [] }
          supplierGroups.push(group)
        }
        group.list.push(item)
      })
      supplierGroups.push(platform)
      this.supList = supplierGroups
    },
    stateFunc(index) {
      if (this.state_active === index) return
      this.state_active = index
      this.data_type = index === 0 ? 'not_use' : index === 1 ? 'is_use' : 'is_expire'
      this.getData()
    },
    expireText(item) {
      if (item.expire_type === 10) return '领取后' + item.expire_day + '天内有效'
      if (item.start_time && item.end_time) return item.start_time.text + ' - ' + item.end_time.text
      return '长期有效'
    },
    useCoupon(item) {
      if (item.apply_range === 10) this.gotoPage('/pages/index/index')
      else this.gotoPage('/pages/coupon/detail?coupon_id=' + item.coupon_id + '&apply_range=' + item.apply_range)
    },
  },
}
</script>

<style scoped>
.coupon-page { min-height: 100vh; padding: 110rpx 24rpx 24rpx; background: #f5f5f5; box-sizing: border-box; }
.tabs { position: fixed; top: 0; left: 0; right: 0; z-index: 2; display: grid; grid-template-columns: repeat(3, 1fr); height: 96rpx; background: #fff; }
.tabs view { line-height: 96rpx; text-align: center; color: #777; font-size: 28rpx; }
.tabs .active { color: #19ad57; font-weight: 600; border-bottom: 4rpx solid #19ad57; }
.group-title { margin: 24rpx 4rpx 14rpx; color: #555; font-size: 26rpx; }
.coupon { display: flex; min-height: 170rpx; margin-bottom: 18rpx; padding: 24rpx; color: #fff; background: #e64340; border-radius: 8rpx; box-sizing: border-box; }
.coupon.disabled { background: #aaa; }
.main { flex: 1; min-width: 0; }
.name { font-size: 30rpx; font-weight: 600; }
.time, .limit { margin-top: 10rpx; font-size: 24rpx; opacity: .9; }
.side { width: 170rpx; text-align: right; }
.amount { font-size: 40rpx; font-weight: 700; }
.use { margin-top: 22rpx; height: 56rpx; line-height: 56rpx; color: #e64340; background: #fff; border-radius: 28rpx; font-size: 24rpx; }
.empty { padding: 160rpx 0; text-align: center; color: #999; font-size: 28rpx; }
</style>
