<template>
  <view class="search-wrap">
    <view id="searchBox" class="index-search-box d-b-c">
      <view class="index-search-cate flex-1 t-c" @tap="gotoSearch && gotoSearch()">
        <text class="icon iconfont icon-sousuo"></text>
        <input
          v-model="form.keyWord"
          class="flex-1 ml10 f24"
          confirm-type="search"
          placeholder="输入你要的商品"
          placeholder-class="f24 gray6"
          type="text"
          @confirm="search()"
        />
      </view>
    </view>
    <view class="p-0-20 bg-white">
      <view class="group-hd">
        <view class="left">
          <text class="min-name">最近搜索</text>
        </view>
        <view class="right">
          <text class="icon iconfont icon-lajitong" @tap="clearStorage"></text>
        </view>
      </view>
      <view class="before-search">
        <text v-for="(item, index) in arr" :key="index" class="item" @tap="search(item)">{{ item }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: {},
      arr: []
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      uni.getStorage({
        key: 'search_list',
        success: (res) => {
          if (res != null && res.data != null) this.arr = res.data
        }
      })
    },
    search(keyword) {
      let searchText = keyword || null
      if (searchText == null) {
        searchText = this.form.keyWord
        const history = this.arr
        if (searchText === undefined || searchText == null || searchText === '') {
          uni.showToast({ title: '请输入搜索的关键字', icon: 'none', duration: 2000 })
          return false
        }
        history.push(searchText)
        uni.setStorage({
          key: 'search_list',
          data: history
        })
      }
      this.gotoPage('/pages/product/list/list?search=' + searchText + '&category_id=0&sortType=all')
    },
    clearStorage() {
      uni.removeStorage({
        key: 'search_list',
        success: () => {
          this.arr = []
        }
      })
    }
  }
}
</script>

<style scoped>
.search-wrap { min-height: 100vh; background: #f7f7f7; }
.index-search-box { padding: 20rpx; background: #fff; }
.index-search-cate { display: flex; align-items: center; height: 68rpx; padding: 0 24rpx; border-radius: 34rpx; background: #f4f4f4; box-sizing: border-box; }
.index-search-cate input { flex: 1; text-align: left; }
.group-hd { display: flex; align-items: center; justify-content: space-between; min-height: 96rpx; }
.min-name { font-size: 30rpx; color: #333; font-weight: 700; }
.before-search { display: flex; flex-wrap: wrap; gap: 20rpx; padding: 0 0 30rpx; }
.before-search .item { max-width: 100%; padding: 12rpx 24rpx; border-radius: 30rpx; background: #f4f4f4; color: #666; font-size: 26rpx; }
</style>
