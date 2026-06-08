<template>
  <view class="article-detail-page">
    <view v-if="loadding" class="article-detail">
      <view class="title">{{ article.article_title }}</view>
      <view class="meta">{{ categoryName }} · {{ article.create_time }}</view>
      <button class="share-button" open-type="share" @tap="shareFunc">分享文章</button>
      <rich-text class="content" :nodes="article.article_content || ''" />
    </view>
    <view v-else class="empty">加载中...</view>
    <tab-bar />
    <app-share :is-app-share="isAppShare" :app-params="appParams" @close="closeAppShare" />
  </view>
</template>

<script>
import TabBar from '../../../../components/tabbar/footTabbar.vue'
import AppShare from '../../../../components/app-share.vue'
import { format_content } from '../../../../common/utils'

export default {
  components: {
    TabBar,
    AppShare
  },
  data() {
    return {
      loadding: false,
      article_id: 0,
      article: {
        image: {},
        category: {}
      },
      urldata: '',
      isAppShare: false,
      appParams: {
        title: '',
        summary: '',
        path: ''
      }
    }
  },
  computed: {
    categoryName() {
      return (this.article.category && this.article.category.name) || ''
    }
  },
  onLoad(query = {}) {
    this.article_id = query.article_id || 0
  },
  mounted() {
    this.getData()
  },
  onShareAppMessage() {
    this.taskFunc()
    return {
      title: this.article.article_title || '文章详情',
      path: '/pagesPlus/main/article/detail/detail?' + this.shareParams({ article_id: this.article_id })
    }
  },
  methods: {
    shareParams(extra = {}) {
      if (typeof this.getShareUrlParams === 'function') return this.getShareUrlParams(extra)
      return Object.keys(extra).map((key) => `${key}=${extra[key]}`).join('&')
    },
    taskFunc() {
      if (typeof this._post !== 'function') return
      this._post('plus.task.Task/dayTask', { task_type: 'article' }, () => {})
    },
    shareFunc() {
      this.taskFunc()
    },
    closeAppShare() {
      this.isAppShare = false
    },
    getData() {
      if (typeof this._get !== 'function') {
        this.loadding = true
        // TODO:migration: article detail needs shared _get runtime.
        return
      }
      uni.showLoading({ title: '加载中' })
      this._get('plus.article.article/detail', {
        article_id: this.article_id,
        url: this.urldata
      }, (res) => {
        const detail = (res.data && res.data.detail) || {}
        detail.article_content = format_content(detail.article_content || '')
        this.article = detail
        this.appParams = {
          title: detail.article_title || '',
          summary: detail.dec || '',
          path: '/pagesPlus/main/article/detail/detail?article_id=' + this.article_id
        }
        this.loadding = true
        uni.hideLoading()
      })
    }
  }
}
</script>

<style scoped>
.article-detail-page { min-height: 100vh; background: #fff; padding-bottom: 120rpx; }
.article-detail { padding: 32rpx; }
.title { color: #222; font-size: 38rpx; font-weight: 700; line-height: 1.45; }
.meta { margin-top: 18rpx; color: #999; font-size: 24rpx; }
.share-button { margin: 28rpx 0; height: 72rpx; border-radius: 36rpx; background: #f03b2f; color: #fff; font-size: 28rpx; line-height: 72rpx; }
.content { display: block; color: #333; font-size: 28rpx; line-height: 1.8; }
.empty { padding: 120rpx 0; text-align: center; color: #999; font-size: 26rpx; }
</style>
