<template>
  <view class="article-list-page">
    <view class="top-tabbar">
      <scroll-view scroll-x class="tabs">
        <view :class="category_id == 0 ? 'tab-item active' : 'tab-item'" @tap="tabTypeFunc(0)">全部</view>
        <view
          v-for="item in categorys"
          :key="item.category_id"
          :class="category_id == item.category_id ? 'tab-item active' : 'tab-item'"
          @tap="tabTypeFunc(item.category_id)"
        >
          {{ item.name }}
        </view>
      </scroll-view>
    </view>

    <scroll-view class="article-scroll" scroll-y :style="{ height: scrollviewHigh + 'px' }" @scrolltolower="scrolltolowerFunc">
      <view v-for="item in listData" :key="item.article_id" class="article-card" @tap="gotoDetail(item.article_id)">
        <view class="article-main">
          <view class="article-title">{{ item.article_title }}</view>
          <view class="article-desc">{{ item.dec || item.describe || '' }}</view>
          <view class="article-meta">{{ item.create_time }} · {{ item.actual_views || 0 }}浏览</view>
        </view>
        <image v-if="item.image" class="article-image" mode="aspectFill" :src="imageOf(item.image)" />
      </view>
      <view v-if="listData.length === 0 && !loading" class="empty">亲，暂无相关文章哦</view>
      <uni-load-more v-else :status="loadStatus" />
    </scroll-view>
    <tab-bar />
  </view>
</template>

<script>
import UniLoadMore from '../../../../components/uni-load-more.vue'
import TabBar from '../../../../components/tabbar/footTabbar.vue'

export default {
  components: {
    UniLoadMore,
    TabBar
  },
  data() {
    return {
      loading: true,
      phoneHeight: 0,
      scrollviewHigh: 0,
      listData: [],
      no_more: false,
      list_rows: 10,
      page: 1,
      last_page: 0,
      categorys: [],
      category_id: 0
    }
  },
  computed: {
    loadStatus() {
      return this.loading ? 'loading' : this.listData.length && this.no_more ? 'noMore' : 'more'
    }
  },
  onLoad(query = {}) {
    this.category_id = query.category_id || 0
  },
  mounted() {
    this.init()
    this.getCategory()
    this.getData()
  },
  methods: {
    imageOf(image) {
      return typeof image === 'string' ? image : image.file_path || image.url || ''
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
    getCategory() {
      if (typeof this._get !== 'function') return
      this._get('plus.article.article/category', {}, (res) => {
        this.categorys = (res.data && res.data.category) || []
      })
    },
    tabTypeFunc(categoryId) {
      if (categoryId == this.category_id) return
      this.category_id = categoryId
      this.page = 1
      this.listData = []
      this.no_more = false
      this.getData()
    },
    getData() {
      if (typeof this._get !== 'function') {
        this.loading = false
        // TODO:migration: article list needs shared _get runtime.
        return
      }
      this.loading = true
      uni.showLoading({ title: '加载中' })
      this._get('plus.article.article/index', {
        page: this.page || 1,
        list_rows: this.list_rows,
        category_id: this.category_id
      }, (res) => {
        const list = (res.data && res.data.list) || {}
        this.listData = this.listData.concat(list.data || [])
        this.last_page = list.last_page || 0
        this.no_more = this.last_page <= 1 || this.page >= this.last_page
        this.loading = false
        uni.hideLoading()
      })
    },
    scrolltolowerFunc() {
      if (this.page >= this.last_page) {
        this.no_more = true
        return
      }
      this.page += 1
      this.getData()
    },
    gotoDetail(articleId) {
      const url = '/pagesPlus/main/article/detail/detail?article_id=' + articleId
      if (typeof this.gotoPage === 'function') this.gotoPage(url)
      else uni.navigateTo({ url })
    }
  }
}
</script>

<style scoped>
.article-list-page { min-height: 100vh; background: #f7f7f7; padding-bottom: 120rpx; }
.top-tabbar { background: #fff; border-bottom: 1rpx solid #eee; }
.tabs { white-space: nowrap; height: 92rpx; }
.tab-item { display: inline-flex; align-items: center; justify-content: center; height: 92rpx; padding: 0 28rpx; color: #666; font-size: 28rpx; }
.tab-item.active { color: #f03b2f; font-weight: 700; }
.article-scroll { box-sizing: border-box; }
.article-card { display: flex; gap: 20rpx; padding: 28rpx; margin: 20rpx; border-radius: 12rpx; background: #fff; }
.article-main { flex: 1; min-width: 0; }
.article-title { font-size: 30rpx; font-weight: 700; color: #222; line-height: 1.45; }
.article-desc { margin-top: 12rpx; color: #777; font-size: 24rpx; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.article-meta { margin-top: 16rpx; color: #999; font-size: 22rpx; }
.article-image { width: 180rpx; height: 140rpx; border-radius: 8rpx; background: #eee; }
.empty { padding: 80rpx 0; text-align: center; color: #999; font-size: 26rpx; }
</style>
