<template>
  <view class="report-list">
    <view class="report-list-head">
      <text class="page-title">投诉记录</text>
      <view class="new-btn" @tap="createReport">新增投诉</view>
    </view>
    <scroll-view class="list" scroll-y lower-threshold="80" @scrolltolower="loadMore">
      <view v-for="item in list" :key="item.complaintId || item.id" class="report-card" @tap="openDetail(item)">
        <view class="card-head">
          <text class="card-title">{{ item.complaintTypeText || item.typeText || '直播投诉' }}</text>
          <text class="status">{{ item.statusText || item.complaintStatusText || '已提交' }}</text>
        </view>
        <text class="content">{{ item.content || item.description || '-' }}</text>
        <text class="time">{{ item.createdAt || item.create_time || '-' }}</text>
      </view>
      <view v-if="loading" class="state">加载中...</view>
      <view v-else-if="!list.length" class="state">暂无投诉记录</view>
      <view v-else-if="finished" class="state">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script>
import { getComplaintList } from '../../api/complaint.js'
import { ensureH5PageAuth } from '../../services/h5-auth-context.js'

export default {
  data() {
    return {
      list: [],
      page: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      finished: false,
    }
  },
  onLoad(query = {}) {
    if (!ensureH5PageAuth(query)) return
    this.loadList(true)
  },
  methods: {
    async loadList(reset = false) {
      if (this.loading || (!reset && this.finished)) return
      if (reset) {
        this.page = 1
        this.list = []
        this.finished = false
      }
      this.loading = true
      try {
        const data = await getComplaintList({ page: this.page, pageSize: this.pageSize })
        const rows = Array.isArray(data) ? data : data?.list || data?.data || []
        this.total = Number(data?.total || rows.length || 0)
        this.list = reset ? rows : this.list.concat(rows)
        this.finished = rows.length < this.pageSize || (this.total > 0 && this.list.length >= this.total)
        if (!this.finished) this.page += 1
      } catch (error) {
        uni.showToast({ title: error?.msg || error?.message || '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    loadMore() {
      this.loadList(false)
    },
    openDetail(item = {}) {
      const id = item.complaintId || item.id
      if (id) uni.navigateTo({ url: `/pages/report/report-detail?id=${id}` })
    },
    createReport() {
      uni.navigateTo({ url: '/pages/report/report-type' })
    },
  },
}
</script>

<style scoped>
.report-list {
  width: 750rpx;
  min-height: 100vh;
  background: #fff;
  color: #222;
}

.report-list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx 18rpx;
  background: #fff;
}

.page-title {
  font-size: 34rpx;
  line-height: 48rpx;
  color: #000;
  font-weight: 600;
}

.new-btn {
  height: 58rpx;
  padding: 0 24rpx;
  border-radius: 29rpx;
  background: linear-gradient(90deg, #fd7e19 0%, #ff6b2e 100%);
  color: #fff;
  font-size: 25rpx;
  line-height: 58rpx;
}

.list {
  height: calc(100vh - 104rpx);
  padding: 10rpx 32rpx 40rpx;
  box-sizing: border-box;
}

.report-card {
  margin-bottom: 20rpx;
  padding: 24rpx 30rpx;
  border-radius: 16rpx;
  background: #f8f8f8;
}

.card-head {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.card-title {
  color: #000;
  font-size: 30rpx;
  line-height: 42rpx;
  font-weight: 600;
}

.status {
  color: #fd6119;
  font-size: 24rpx;
  line-height: 42rpx;
}

.content {
  display: block;
  margin-top: 16rpx;
  color: #7f7f7f;
  font-size: 26rpx;
  line-height: 36rpx;
}

.time {
  display: block;
  margin-top: 12rpx;
  color: #999;
  font-size: 23rpx;
}

.state {
  padding: 58rpx 0;
  color: #999;
  font-size: 26rpx;
  text-align: center;
}
</style>
