<template>
  <view class="invitation-record-shell">
    <view class="search-bar">
      <view class="search-input-wrap">
        <input
          v-model="keyword"
          class="search-input"
          type="text"
          placeholder="请输入昵称"
          confirm-type="search"
          @confirm="onSearch"
        />
        <image
          class="search-icon"
          src="https://man.lqjy.cc/static/remote-icons/s-nuoyun-deepicon-search.svg"
          mode="aspectFit"
          @click="onSearch"
        />
      </view>
      <!-- <view class="status-filter" @click="toggleStatusMenu">
        <text class="status-text">{{ selectedStatusLabel }}</text>
        <text class="status-arrow" :class="{ active: statusMenuVisible }">▾</text>
      </view>
      <view v-if="statusMenuVisible" class="status-menu">
        <view
          v-for="option in statusOptions"
          :key="option.value"
          :class="['status-menu-item', selectedStatus === option.value ? 'active' : '']"
          @click="onStatusChange(option.value)"
        >
          {{ option.label }}
        </view>
      </view> -->
    </view>

    <scroll-view
      class="record-scroll"
      scroll-y
      lower-threshold="80"
      @scrolltolower="loadMore"
    >
     <view v-if="records.length" class="record-list">
        <view v-for="item in records" :key="item.customerId" class="record-item">
          <image class="avatar" :src="item.avatar || defaultAvatar" mode="aspectFill" />
          <view class="info">
            <view class="info-top">
              <text class="nickname">{{ item.nickname || "用户" }}</text>
              <view
                v-if="Number(item.currentStatus) === 1"
                class="status-badge online"
              >
                <text class="dot"></text>
                <text>在线</text>
              </view>
              <view
                v-else-if="Number(item.currentStatus) === 2"
                class="status-badge offline"
              >
                <text class="dot"></text>
                <text>离线</text>
              </view>
            </view>
            <text class="auth-time">授权：{{ item.authorizedAt || "-" }}</text>
          </view>
          <view class="watch-info">
            <text class="watch-label">观看时长</text>
            <text class="watch-value">{{ formatDuration(item.watchDuration) }}</text>
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="no-data">
        <image src="https://man.lqjy.cc/static/remote-icons/s-nuoyun-income-nodata.png" mode="aspectFit" />
        <text class="no-data-text">暂无邀请记录</text>
      </view>

      <view v-if="loading" class="loading-text">加载中...</view>
      <view v-else-if="finished && records.length" class="loading-text">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { checkCurrentDistributor, getDistributorInvitedUsers } from "@/api/live";
import { loadLiveRoomContext } from "@/utils/live-room-context";

const statusOptions = [
  { label: "全部", value: 0 },
  { label: "在线", value: 1 },
  { label: "离线", value: 2 },
];

const defaultAvatar = "https://man.lqjy.cc/static/remote-icons/s-nuoyun-avatar-default.png";
const pageSize = 10;
const retryTimes = 3;
const retryDelay = 500;

const records = ref([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);
const finished = ref(false);
const keyword = ref("");
const selectedStatus = ref(0);
const statusMenuVisible = ref(false);

const selectedStatusLabel = computed(() => {
  return statusOptions.find((item) => item.value === selectedStatus.value)?.label || "全部";
});

function toggleStatusMenu() {
  statusMenuVisible.value = !statusMenuVisible.value;
}

function onStatusChange(value) {
  selectedStatus.value = value;
  statusMenuVisible.value = false;
  loadRecords(true);
}

function onSearch() {
  loadRecords(true);
}

function formatDuration(sec) {
  const totalSec = Number(sec || 0);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}小时${m}分${s}秒`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchRecordsWithRetry(params) {
  let lastError = null;
  for (let attempt = 0; attempt <= retryTimes; attempt += 1) {
    try {
      const data = await getDistributorInvitedUsers(params);
      const list = Array.isArray(data?.list) ? data.list : [];
      if (list.length || attempt === retryTimes) {
        return { data, list };
      }
    } catch (err) {
      lastError = err;
      if (attempt === retryTimes) {
        throw err;
      }
    }
    await sleep(retryDelay);
  }
  if (lastError) throw lastError;
  return { data: null, list: [] };
}

async function loadRecords(reset = false) {
  if (loading.value) return;
  if (!reset && finished.value) return;
  if (reset) {
    page.value = 1;
    finished.value = false;
    records.value = [];
  }
  loading.value = true;
  const params = {
    page: page.value,
    pageSize,
    keyword: keyword.value.trim(),
    currentStatus: selectedStatus.value,
  };
  try {
    const { data, list } = await fetchRecordsWithRetry(params);
    const totalCount = Number(data?.total || 0);
    total.value = totalCount;
    records.value = reset ? list : records.value.concat(list);
    finished.value = records.value.length >= total.value || list.length < pageSize;
    if (!finished.value) {
      page.value += 1;
    }
  } catch (err) {
    uni.showToast({ title: err?.message || "获取邀请记录失败", icon: "none" });
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  loadRecords(false);
}

async function ensureDistributorAndLoad() {
  let ok = false;
  try {
    const result = await checkCurrentDistributor();
    ok = !!result?.isDistributor && Number(result?.status || 0) === 1;
  } catch (err) {
    const ctx = loadLiveRoomContext();
    ok = !!ctx?.invitationRecordVisible || (!!ctx?.isDistributor && Number(ctx?.distributorStatus || 0) === 1);
  }
  if (!ok) {
    uni.showToast({ title: "仅分销员可查看邀请记录", icon: "none" });
    setTimeout(() => uni.navigateBack(), 1000);
    return;
  }
  loadRecords(true);
}

onLoad(() => {
  ensureDistributorAndLoad();
});
</script>

<style lang="scss" scoped>
.invitation-record-shell {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f4f4f4;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  background-color: #f4f4f4;
}

.search-input-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  height: 72rpx;
  padding: 0 80rpx 0 28rpx;
  background-color: #fff;
  border-radius: 36rpx;
  box-sizing: border-box;
}

.search-input {
  flex: 1;
  height: 100%;
  font-size: 28rpx;
  color: #333;
  background: transparent;
}

.search-icon {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 36rpx;
  height: 36rpx;
}

.status-filter {
  display: flex;
  align-items: center;
  gap: 6rpx;
  height: 72rpx;
  padding: 0 24rpx;
  background-color: #fff;
  border-radius: 36rpx;
}

.status-text {
  font-size: 28rpx;
  color: #333;
}

.status-arrow {
  font-size: 24rpx;
  color: #999;
  transition: transform 0.2s ease;
}

.status-arrow.active {
  transform: rotate(180deg);
}

.status-menu {
  position: absolute;
  top: 100rpx;
  right: 24rpx;
  min-width: 160rpx;
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  z-index: 10;
  overflow: hidden;
}

.status-menu-item {
  padding: 20rpx 28rpx;
  font-size: 26rpx;
  color: #333;
  text-align: center;
  border-bottom: 1rpx solid #f5f5f5;
}

.status-menu-item:last-child {
  border-bottom: none;
}

.status-menu-item.active {
  color: #ff6b2e;
  font-weight: 500;
}

.record-scroll {
  flex: 1;
  width: 100%;
  height: 0;
  min-height: 0;
  box-sizing: border-box;
}

.record-list {
  padding: 0 24rpx 40rpx;
}

.record-item {
  display: flex;
  align-items: center;
  padding: 24rpx 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
  flex-shrink: 0;
}

.info {
  flex: 1;
  margin-left: 20rpx;
  min-width: 0;
  overflow: hidden;
}

.info-top {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.nickname {
  max-width: 280rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  line-height: 1;
}

.status-badge.online {
  color: #1bbf6c;
  background-color: rgba(27, 191, 108, 0.1);
}

.status-badge.offline {
  color: #999;
  background-color: rgba(153, 153, 153, 0.1);
}

.status-badge .dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: currentColor;
}

.phone {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #333;
}

.auth-time {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.watch-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 16rpx;
  flex-shrink: 0;
}

.watch-label {
  font-size: 24rpx;
  color: #999;
}

.watch-value {
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #333;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 160rpx;
}

.no-data image {
  width: 320rpx;
  height: 320rpx;
}

.no-data-text {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #999;
}

.loading-text {
  padding: 28rpx 0;
  color: #999;
  font-size: 24rpx;
  text-align: center;
}
</style>
