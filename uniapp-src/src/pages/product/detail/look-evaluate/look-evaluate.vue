<template>
  <view class="look-evaluate">
    <view class="top-tabbar">
      <view :class="state_active === -1 ? 'tab-item active' : 'tab-item'" @tap="stateFunc(0)">全部({{ Total.all }})</view>
      <view :class="state_active === 10 ? 'tab-item active' : 'tab-item'" @tap="stateFunc(10)">
        <view class="d-c-c"><text class="icon iconfont icon-pingjiahaoping"></text><text class="ml10 gray9">好评({{ Total.praise }})</text></view>
      </view>
      <view :class="state_active === 20 ? 'tab-item active' : 'tab-item'" @tap="stateFunc(20)">
        <view class="d-c-c"><text class="icon iconfont icon-pingjiazhongping"></text><text class="ml10 gray9">中评({{ Total.review }})</text></view>
      </view>
      <view :class="state_active === 30 ? 'tab-item active' : 'tab-item'" @tap="stateFunc(30)">
        <view class="d-c-c"><text class="icon iconfont icon-pingjiachaping"></text><text class="ml10 gray9">差评({{ Total.negative }})</text></view>
      </view>
    </view>

    <scroll-view class="scroll-Y" scroll-y lower-threshold="50" :style="{ height: scrollviewHigh + 'px' }" @scrolltolower="scrolltolowerFunc">
      <view class="comment-list">
        <view v-for="(item, index) in tableData" :key="index" class="item">
          <view class="cmt-user">
            <view class="left">
              <image class="photo" mode="aspectFill" :src="item.users.avatarUrl" />
              <text class="name">{{ item.users.nickName }}</text>
            </view>
          </view>
          <view class="d-b-c p20">
            <view class="d-s-c">
              <view v-if="item.score === 10" class="d-c-c mr20"><text class="icon iconfont icon-pingjiahaoping"></text><text class="ml10 gray9">好评</text></view>
              <view v-if="item.score === 20" class="d-c-c mr20"><text class="icon iconfont icon-pingjiazhongping"></text><text class="ml10 gray9">中评</text></view>
              <view v-if="item.score === 30" class="d-c-c mr20"><text class="icon iconfont icon-pingjiachaping"></text><text class="ml10 gray9">差评</text></view>
            </view>
            <text class="datetime gray9">{{ item.create_time }}</text>
          </view>
          <view class="p-0-20 f24 gray3">{{ item.content }}</view>
          <view class="imgs d-s-c p-0-20">
            <view v-for="(img, imgIndex) in item.image" :key="imgIndex" class="box">
              <image mode="aspectFill" :src="img.file_path" @tap="preview(item.image, img.file_path)" />
            </view>
          </view>
        </view>

        <view v-if="tableData.length === 0 && !loading" class="d-c-c p30">
          <view class="none-data-box">
            <image mode="widthFix" :src="config.pic_url + '/live/none.png'" />
            <text>亲，暂无相关记录哦</text>
          </view>
        </view>
        <uni-load-more v-else :loading-type="loadingType" />
      </view>
    </scroll-view>

    <view v-if="isopenimg" class="popimg" @tap="isopenimg = false">
      <image mode="aspectFit" :src="popImg" />
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      phoneHeight: 0,
      scrollviewHigh: 0,
      state_active: -1,
      product_id: 0,
      tableData: [],
      Total: {
        all: 0,
        negative: 0,
        praise: 0,
        review: 0
      },
      page: 1,
      list_rows: 15,
      no_more: false,
      loading: true,
      last_page: 0,
      popImg: '',
      isopenimg: false
    }
  },
  computed: {
    loadingType() {
      return this.loading ? 1 : this.tableData.length !== 0 && this.no_more ? 2 : 0
    }
  },
  onLoad(query) {
    this.product_id = query.product_id
  },
  mounted() {
    this.init()
    this.getData()
  },
  methods: {
    preview(images, current) {
      this.openImg(images, current)
    },
    openImg(images, current) {
      const urls = []
      images.forEach((item) => {
        urls.push(item.file_path)
      })
      uni.previewImage({
        urls,
        current,
        fail: (err) => {
          this.showError(err)
        }
      })
    },
    init() {
      uni.getSystemInfo({
        success: (res) => {
          this.phoneHeight = res.windowHeight
          uni.createSelectorQuery().select('.top-tabbar').boundingClientRect((rect) => {
            this.scrollviewHigh = this.phoneHeight - ((rect && rect.height) || 0)
          }).exec()
        }
      })
    },
    getData() {
      this._get('product.comment/lists', {
        product_id: this.product_id,
        scoreType: this.state_active,
        page: this.page,
        list_rows: this.list_rows
      }, (res) => {
        this.loading = false
        this.Total = res.data.total
        this.tableData = this.tableData.concat(res.data.list.data)
        this.last_page = res.data.list.last_page
        if (res.data.list.last_page <= 1) this.no_more = true
      })
    },
    scrolltolowerFunc() {
      this.bottomRefresh = true
      this.page++
      this.loading = true
      if (this.page > this.last_page) {
        this.loading = false
        this.no_more = true
        return
      }
      this.getData()
    },
    stateFunc(state) {
      if (this.state_active !== state) {
        this.tableData = []
        this.no_more = false
        this.loading = true
        this.state_active = state
        this.page = 1
        this.getData()
      }
    }
  }
}
</script>

<style scoped>
.look-evaluate { min-height: 100vh; background: #f7f7f7; }
.top-tabbar { display: flex; align-items: center; min-height: 96rpx; background: #fff; border-bottom: 1rpx solid #f2f2f2; }
.tab-item { flex: 1; text-align: center; color: #666; font-size: 26rpx; }
.tab-item.active { color: #ff5704; font-weight: 700; }
.comment-list .item { margin-bottom: 20rpx; background: #fff; padding: 24rpx 0; }
.cmt-user { display: flex; justify-content: space-between; padding: 0 20rpx; }
.left { display: flex; align-items: center; }
.photo { width: 64rpx; height: 64rpx; border-radius: 50%; margin-right: 16rpx; }
.imgs { flex-wrap: wrap; gap: 12rpx; padding-top: 20rpx; }
.imgs .box image { width: 160rpx; height: 160rpx; border-radius: 8rpx; background: #f5f5f5; }
.none-data-box { display: flex; flex-direction: column; align-items: center; color: #999; font-size: 26rpx; }
.none-data-box image { width: 240rpx; margin-bottom: 20rpx; }
.popimg { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,.85); display: flex; align-items: center; justify-content: center; }
.popimg image { width: 100vw; height: 100vh; }
</style>
