<template>
  <view class="report-detail">
    <view v-if="loading" class="state">加载中...</view>
    <template v-else>
      <view class="report-card hero">
        <text class="title">{{ detail.statusText || detail.complaintStatusText || '投诉详情' }}</text>
        <text class="sub">投诉编号：{{ detail.complaintNo || detail.id || complaintId }}</text>
      </view>
      <view class="report-card">
        <view class="row"><text>投诉类型</text><text>{{ detail.complaintTypeText || detail.typeText || '-' }}</text></view>
        <view class="row"><text>提交时间</text><text>{{ detail.createdAt || detail.create_time || '-' }}</text></view>
        <text class="content">{{ detail.content || detail.description || '-' }}</text>
        <view v-if="images.length" class="images">
          <image v-for="(item, index) in images" :key="item || index" class="image" :src="item" mode="aspectFill" />
        </view>
      </view>
    </template>
  </view>
</template>

<script>
import { getComplaintDetail } from '@/api/complaint.js'

export default {
  data() {
    return {
      complaintId: '',
      detail: {},
      loading: false,
    }
  },
  computed: {
    images() {
      const list = this.detail.images || this.detail.imageList || []
      return Array.isArray(list) ? list : String(list || '').split(',').filter(Boolean)
    },
  },
  onLoad(query = {}) {
    this.complaintId = query.id || query.complaintId || query.complaint_id || ''
    this.loadDetail()
  },
  methods: {
    async loadDetail() {
      if (!this.complaintId) return
      this.loading = true
      try {
        this.detail = await getComplaintDetail(this.complaintId)
      } catch (error) {
        uni.showToast({ title: error?.msg || error?.message || '详情加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.report-detail {
  width: 750rpx;
  min-height: 100vh;
  padding: 24rpx 32rpx 60rpx;
  background: #fff;
  color: #222;
  box-sizing: border-box;
}

.state {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 28rpx;
}

.report-card {
  margin-top: 22rpx;
  padding: 24rpx 30rpx;
  border-radius: 16rpx;
  background: #f8f8f8;
}

.hero {
  margin-top: 0;
  background: linear-gradient(90deg, #fd7e19 0%, #ff6b2e 100%);
  color: #fff;
}

.title {
  display: block;
  font-size: 38rpx;
  line-height: 52rpx;
  font-weight: 700;
}

.sub {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  opacity: .88;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 18rpx;
  padding: 15rpx 0;
  color: #666;
  font-size: 26rpx;
}

.content {
  display: block;
  margin-top: 20rpx;
  color: #333;
  font-size: 28rpx;
  line-height: 42rpx;
}

.images {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 22rpx;
}

.image {
  width: 150rpx;
  height: 150rpx;
  border-radius: 12rpx;
  background: #eee;
}
</style>
