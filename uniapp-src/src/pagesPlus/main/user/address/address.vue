<template>
  <view class="address-page" :data-theme="theme && theme()">
    <view v-if="!loadding && listData.length" class="list">
      <view v-for="item in listData" :key="item.address_id" class="card">
        <view class="person">{{ item.name }} <text>{{ item.phone }}</text></view>
        <view class="detail">{{ regionText(item) }} {{ item.detail }}</view>
        <view class="ops">
          <radio :checked="default_id === String(item.address_id)" color="#19ad57" @tap="radioChange(item.address_id)" />
          <text class="default" @tap="radioChange(item.address_id)">默认地址</text>
          <view class="spacer"></view>
          <text @tap="editAddress(item.address_id)">编辑</text>
          <text class="delete" @tap="delAddress(item.address_id)">删除</text>
        </view>
      </view>
    </view>
    <view v-else-if="!loadding" class="empty">暂无收货地址</view>
    <button class="add-btn" @tap="addAddress">新增收货地址</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loadding: true,
      listData: [],
      default_id: '0',
      options: {},
    }
  },
  onLoad(query = {}) {
    this.options = query
  },
  onShow() {
    uni.showLoading({ title: '加载中' })
    this.getData()
  },
  methods: {
    regionText(item) {
      const region = item.region || {}
      return [region.province, region.city, region.region].filter(Boolean).join(' ')
    },
    getData() {
      this._get(
        'user.address/lists',
        {},
        (res) => {
          this.listData = res.data.list || []
          this.default_id = String(res.data.default_id || 0)
          this.loadding = false
          uni.hideLoading()
        },
        false,
        () => uni.hideLoading(),
      )
    },
    addAddress() {
      const delta = this.options.source === 'order' ? 2 : 1
      this.gotoPage('/pagesPlus/main/user/address/add/add?delta=' + delta)
    },
    radioChange(addressId) {
      this.default_id = String(addressId)
      this._post('user.address/setDefault', { address_id: addressId }, () => {
        if (this.options.source === 'order') uni.navigateBack()
      })
      return false
    },
    editAddress(addressId) {
      this.gotoPage('/pagesPlus/main/user/address/edit/edit?address_id=' + addressId)
    },
    delAddress(addressId) {
      uni.showModal({
        title: '提示',
        content: '您确定要移除当前收货地址吗?',
        success: (modal) => {
          if (modal.confirm) {
            this._get('user.address/delete', { address_id: addressId }, (res) => {
              if (res.code === 1) {
                uni.showToast({ title: '删除成功' })
                this.getData()
              }
            })
          }
        },
      })
    },
  },
}
</script>

<style scoped>
.address-page { min-height: 100vh; padding: 24rpx; padding-bottom: 130rpx; background: #f5f5f5; box-sizing: border-box; }
.card { margin-bottom: 22rpx; padding: 28rpx; background: #fff; border-radius: 8rpx; }
.person { color: #222; font-size: 30rpx; font-weight: 600; }
.person text { margin-left: 18rpx; font-weight: 400; color: #555; }
.detail { margin-top: 14rpx; color: #666; font-size: 26rpx; line-height: 40rpx; }
.ops { display: flex; align-items: center; gap: 22rpx; margin-top: 22rpx; padding-top: 20rpx; border-top: 1px solid #eee; color: #666; font-size: 26rpx; }
.default { color: #333; }
.spacer { flex: 1; }
.delete { color: #e64340; }
.empty { padding: 180rpx 0; color: #999; text-align: center; font-size: 28rpx; }
.add-btn { position: fixed; left: 24rpx; right: 24rpx; bottom: 28rpx; color: #fff; background: #19ad57; border-radius: 8rpx; }
</style>
