<template>
  <view :class="themeClass" :data-theme="themeName">
    <view class="list">
      <view v-for="(item, index) in list" :key="index" class="listItem">
        <view class="timeBox">
          <view class="time">
            <text class="data">{{ item.data }}</text>
            <text class="line"></text>
            <text class="mouth">{{ item.mouth }}<text class="unit">月</text></text>
            <text class="line"></text>
            <text class="year">{{ item.year }}<text class="unit">年</text></text>
          </view>
          <view class="delTxt" @tap="del(item, index)">删除</view>
        </view>
        <view class="con">
          <view>{{ item.content }}</view>
          <image v-for="(image, imageIndex) in item.image" :key="imageIndex" class="img" lazy-load mode="aspectFit" :src="image.file_path" />
        </view>
        <view v-if="item.OrderProduct" class="prodcut">
          <image v-if="item.OrderProduct.image" mode="aspectFit" lazy-load :src="item.OrderProduct.image.file_path" />
          <view class="r">
            <view class="title">{{ item.OrderProduct.product_name }}</view>
            <view class="spec">{{ item.OrderProduct.product_attr }}</view>
          </view>
        </view>
      </view>
    </view>
    <view v-if="list.length === 0 && !loading" class="empty">
      <text class="iconfont icon-wushuju"></text>
      <text class="cont">亲，暂无相关记录哦</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      state_active: 0,
      list: [],
      last_page: 0,
      no_more: false,
      page: 1,
    }
  },
  computed: {
    themeName() {
      return typeof this.theme === 'function' ? this.theme() : ''
    },
    themeClass() {
      return this.themeName || ''
    },
  },
  onShow() {
    this.page = 1
    this.list = []
    this.no_more = false
    uni.showLoading({ title: '加载中' })
    this.getData()
  },
  onReachBottom() {
    if (this.no_more) return
    this.page += 1
    if (this.page <= this.last_page) this.getData()
    else this.no_more = true
  },
  methods: {
    getData() {
      this.loading = true
      this._post(
        'product.comment/userLists',
        {
          page: this.page,
          list_rows: 10,
        },
        (res) => {
          uni.hideLoading()
          const pageData = (res.data && res.data.list) || {}
          const rows = pageData.data || []
          rows.forEach((item) => {
            const createTime = item.create_time || ''
            item.year = createTime.substr(0, 4)
            item.mouth = createTime.substr(5, 2)
            item.data = createTime.substr(8, 2)
          })
          this.list = this.list.concat(rows)
          this.last_page = res.data && res.data.lastPage ? res.data.lastPage : pageData.last_page || 0
          this.loading = false
          if (this.last_page <= this.page) this.no_more = true
        },
      )
    },
    del(item, index) {
      uni.showModal({
        title: '提示',
        content: '您确定删除该评论吗?',
        success: (res) => {
          if (!res.confirm) return
          this._post('product.comment/delete', { comment_id: item.comment_id }, () => {
            uni.showToast({
              title: '删除成功',
              duration: 1000,
              icon: 'none',
            })
            this.list.splice(index, 1)
          })
        },
      })
    },
  },
}
</script>

<style scoped>
.list,
.listItem {
  padding: 20rpx;
}

.listItem {
  background-color: #fff;
  margin-bottom: 20rpx;
}

.listItem .timeBox {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.listItem .delTxt {
  color: #fd6a03;
}

.listItem .time .unit {
  color: rgba(0, 0, 0, 0.9);
  font-weight: 400;
}

.listItem .time text {
  color: #000;
  font-size: 26rpx;
  font-weight: 800;
}

.listItem .time .data {
  font-size: 38rpx;
}

.listItem .time .line {
  background-color: #fd6a03;
  display: inline-block;
  height: 22rpx;
  margin: 0 6rpx;
  transform: rotate(18deg);
  width: 4rpx;
}

.listItem .con {
  letter-spacing: 1rpx;
  line-height: 42rpx;
  margin: 60rpx 0 30rpx;
}

.listItem .con .img {
  display: inline-block;
  height: 200rpx;
  margin-right: 20rpx;
  width: 200rpx;
}

.listItem .prodcut {
  align-items: center;
  background: hsla(0, 0%, 92%, 0.8);
  display: flex;
  font-size: 26rpx;
}

.listItem .prodcut image {
  border-radius: 6rpx;
  height: 90rpx;
  margin-right: 6rpx;
  width: 90rpx;
}

.listItem .prodcut .spec {
  color: #959595;
  font-size: 24rpx;
  margin-top: 6rpx;
}

.r {
  flex: 1;
  min-width: 0;
}

.title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
