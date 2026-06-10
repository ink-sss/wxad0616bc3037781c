<template>
  <view class="prize-record-shell">
    <scroll-view class="prize-record-page" scroll-y lower-threshold="80" @scrolltolower="loadMore">
      <view class="record-hero">
        <view class="header-img"></view>
        <view class="record">
          <view class="sign-total">
            <text>中奖总数 (个)</text>
            <text class="total-count">{{ total }}</text>
          </view>
        </view>
      </view>

      <view class="record-header">
        <text>中奖记录</text>
        <view class="filter-summary">
          <text v-if="selectedMonthLabel !== '全部'" class="search-time">
            {{ selectedMonthLabel }}
          </text>
        </view>
        <view class="search-trigger" @click="openFilter">
          <text class="search-type">{{ selectedTypeLabel }}</text>
          <image class="search-ico" src="https://man.lqjy.cc/static/remote-icons/s-nuoyun-deepicon-filter.png" mode="aspectFit" />
        </view>
      </view>

      <view class="bc-f4"></view>

      <view v-if="records.length" class="record-ul">
        <view v-for="record in records" :key="record.recordId" class="record-list">
          <view class="list-title">
            <image class="list-type" :src="recordIcon(record)" mode="aspectFill" />
            <text class="title">{{ record.winTypeText }}-{{ record.rewardName }}</text>
          </view>
          <view class="room-msg">
            <text class="room-name">{{ record.roomName || "直播间" }}</text>
            <view class="list-bottom">
              <text class="list-time">{{ record.winTime }}</text>
              <view v-if="showRecordAction(record)" class="record-action" @click.stop="handleRecordAction(record)">
                {{ actionText(record) }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="!loading" class="no-data">
        <image src="https://man.lqjy.cc/static/remote-icons/s-nuoyun-income-nodata.png" mode="aspectFit" />
      </view>

      <view v-if="footerText" class="loading-text">{{ footerText }}</view>
    </scroll-view>

    <view v-if="filterVisible" class="search-box">
      <view class="search-box-bc" @click="filterVisible = false"></view>
      <view class="search-content">
        <view class="filter-top">
          <text>按时间</text>
          <view class="select_month">
            <picker
              mode="date"
              fields="month"
              start="2012-01"
              :end="currentMonth"
              :value="pendingMonth || currentMonth"
              @change="onMonthChange"
            >
              <text class="show-sel-time">{{ pendingMonthLabel }}</text>
            </picker>
            <text
              v-if="pendingMonth" class="month-clear" @click.stop="pendingMonth = ''"
            >
              全部
            </text>
          </view>
        </view>

        <view class="filter-bottom">
          <text>按类型</text>
          <view class="type-options">
            <view
              v-for="option in typeOptions" :key="option.value"
              :class="['type-option', pendingWinType === option.value ? 'checked' : '']" @click="pendingWinType = option.value"
            >
              {{ option.label }}
            </view>
          </view>
        </view>

        <view class="filter-button" @click="confirmFilter">确定</view>
      </view>
    </view>

    <view class="back-pill" @click="goBack">
      <text class="back-arrow">‹</text>
      <text class="back-text">返回</text>
    </view>
    <live-mini-window :room-code="liveRoomCode" :bottom-offset="140" />
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getPrizeRecordList } from "@/api/live";
import { resolveLiveRoomCode } from "@/utils/live-room-context";
import { returnToLiveRoom } from "@/utils/live-room-navigation";
import { navigateWithH5Fallback, normalizeAppRoute } from "@/utils/route-navigation";
import LiveMiniWindow from "@/components/live-mini-window.vue";

const typeOptions = [
  { label: "全部", value: 0 },
  { label: "观看奖励", value: 1 },
  { label: "抽奖", value: 2 },
  { label: "评论抽奖", value: 3 },
];

const pageSize = 10;
const records = ref([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);
const finished = ref(false);
const filterVisible = ref(false);
const selectedMonth = ref("");
const pendingMonth = ref("");
const selectedWinType = ref(0);
const pendingWinType = ref(0);
const liveRoomCode = ref("");
const recordIconMap = {
  1: "https://man.lqjy.cc/static/remote-icons/s-nuoyun-income-prize-1.png",
  2: "https://man.lqjy.cc/static/remote-icons/s-nuoyun-income-prize-2.png",
  3: "https://man.lqjy.cc/static/remote-icons/s-nuoyun-income-prize-3.png",
  4: "https://man.lqjy.cc/static/remote-icons/s-nuoyun-income-prize-4.png",
};

const currentMonth = computed(() => {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
});

const selectedMonthLabel = computed(() => formatMonthLabel(selectedMonth.value));
const pendingMonthLabel = computed(() => formatMonthLabel(pendingMonth.value));
const selectedTypeLabel = computed(() => {
  return typeOptions.find((item) => item.value === selectedWinType.value)?.label || "全部";
});
const footerText = computed(() => {
  if (finished.value && records.value.length) return "没有更多了";
  if (loading.value) return "加载中...";
  return "";
});

function formatMonthLabel(value) {
  if (!value) return "全部";
  const parts = String(value).split("-");
  if (parts.length !== 2) return "全部";
  return `${parts[0]}年${parts[1]}月`;
}

function firstValue(source = {}, ...keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toFlag(value) {
  if (value === true || value === 1 || value === "1" || value === "true") return true;
  return false;
}

function toFalseFlag(value) {
  if (value === false || value === 0 || value === "0" || value === "false") return true;
  return false;
}

function resolveFinishedState(data = {}, list = []) {
  const pageInfo = firstValue(data, "pagination", "pageInfo", "page_info") || data;
  const noMore = firstValue(pageInfo, "noMore", "no_more", "finished", "isEnd", "is_end", "isLast", "is_last", "isLastPage", "is_last_page");
  const hasMore = firstValue(pageInfo, "hasMore", "has_more");
  if (toFlag(noMore) || toFalseFlag(hasMore)) return true;

  const currentPage = toNumber(firstValue(pageInfo, "currentPage", "current_page", "page"), page.value);
  const lastPage = toNumber(firstValue(pageInfo, "lastPage", "last_page", "totalPage", "total_page", "pages", "pageCount", "page_count"));
  if (lastPage > 0) return currentPage >= lastPage;

  if (total.value > 0) return records.value.length >= total.value;
  return list.length < pageSize;
}

function appendQuery(route, params = {}) {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "");
  if (!route || !entries.length) return route;
  const query = entries
    .filter(([key]) => !new RegExp(`[?&]${key}=`).test(route))
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  if (!query) return route;
  return `${route}${route.includes("?") ? "&" : "?"}${query}`;
}

function normalizePrizeRecord(record = {}, index = 0) {
  const orderId = firstValue(record, "orderId", "order_id");
  const orderNo = firstValue(record, "orderNo", "order_no", "outTradeNo", "out_trade_no");
  const roomCode = firstValue(record, "roomCode", "room_code", "liveRoomCode", "live_room_code", "_roomCode");
  const rewardName = firstValue(record, "rewardName", "reward_name", "prizeName", "prize_name", "productName", "product_name", "name");
  const winType = toNumber(firstValue(record, "winType", "win_type", "activityType", "activity_type"), 1);
  const rewardType = toNumber(firstValue(record, "rewardType", "reward_type"));
  return {
    ...record,
    recordId: firstValue(record, "recordId", "record_id", "winnerRecordId", "winner_record_id", "id") || `record-${index}`,
    winType,
    winTypeText: firstValue(record, "winTypeText", "win_type_text", "activityTypeText", "activity_type_text") || typeOptions.find((item) => item.value === winType)?.label || "中奖",
    rewardType,
    rewardName: rewardName || "奖品",
    roomName: firstValue(record, "roomName", "room_name", "liveRoomName", "live_room_name") || "",
    winTime: firstValue(record, "winTime", "win_time", "createdAt", "created_at", "createTime", "create_time") || "",
    roomEnded: toFlag(firstValue(record, "roomEnded", "room_ended", "isRoomEnded", "is_room_ended")),
    orderId,
    orderNo,
    orderDetailUrl: firstValue(record, "orderDetailUrl", "order_detail_url", "orderUrl", "order_url", "detailUrl", "detail_url"),
    roomCode,
  };
}

function recordIcon(record) {
  const iconType = Number(record?.winType) === 3 ? 4 : Number(record?.winType || 1);
  return recordIconMap[iconType] || recordIconMap[1];
}

function getOrderTarget(record) {
  const roomCode = record?.roomCode || liveRoomCode.value;
  const rawDetailUrl = record?.orderDetailUrl || "";
  if (rawDetailUrl) {
    const detailUrl = normalizeAppRoute(rawDetailUrl);
    if (!/^https?:\/\//i.test(detailUrl)) {
      return appendQuery(detailUrl, { roomCode });
    }
    if (!record?.orderId && !record?.orderNo) return detailUrl;
  }
  if (record?.orderId) {
    return appendQuery("/pages/order/detail", { id: record.orderId, roomCode });
  }
  if (record?.orderNo) {
    return appendQuery("/pages/order/list", { orderNo: record.orderNo, roomCode });
  }
  return "";
}

function showRecordAction(record) {
  if (Number(record?.rewardType) === 1 || getOrderTarget(record)) return true;
  return Number(record?.rewardType) === 2 && !record?.roomEnded;
}

function actionText(record) {
  return Number(record?.rewardType) === 1 || getOrderTarget(record) ? "查看详情" : "立即使用";
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
  try {
    const data = await getPrizeRecordList({
      page: page.value,
      pageSize,
      winType: selectedWinType.value,
      month: selectedMonth.value,
    });
    const pageInfo = firstValue(data, "pagination", "pageInfo", "page_info") || data || {};
    const rawList = firstValue(data, "list", "records", "recordList", "record_list", "items", "data") || [];
    const list = Array.isArray(rawList) ? rawList.map(normalizePrizeRecord) : [];
    total.value = toNumber(firstValue(data, "total", "totalCount", "total_count", "count") || firstValue(pageInfo, "total", "totalCount", "total_count", "count"), 0);
    records.value = reset ? list : records.value.concat(list);
    finished.value = resolveFinishedState(pageInfo, list);
    if (!finished.value) {
      page.value += 1;
    }
  } catch (err) {
    uni.showToast({ title: err?.message || "获取中奖记录失败", icon: "none" });
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  loadRecords(false);
}

function openFilter() {
  pendingMonth.value = selectedMonth.value;
  pendingWinType.value = selectedWinType.value;
  filterVisible.value = true;
}

function onMonthChange(event) {
  pendingMonth.value = event?.detail?.value || "";
}

function confirmFilter() {
  selectedMonth.value = pendingMonth.value;
  selectedWinType.value = pendingWinType.value;
  filterVisible.value = false;
  loadRecords(true);
}

function handleRecordAction(record) {
  const orderTarget = getOrderTarget(record);
  if (Number(record?.rewardType) === 1 || orderTarget) {
    if (!orderTarget) {
      uni.showToast({ title: "暂无关联订单", icon: "none" });
      return;
    }
    navigateWithH5Fallback(orderTarget);
    return;
  }

  const roomCode = record?.roomCode || liveRoomCode.value;
  if (!roomCode) {
    uni.showToast({ title: "直播间信息缺失", icon: "none" });
    return;
  }
  returnToLiveRoom(roomCode);
}

onLoad((options) => {
  liveRoomCode.value = resolveLiveRoomCode(options?.roomCode || options?.room_code);
  loadRecords(true);
});

function goBack() {
  if (liveRoomCode.value) {
    returnToLiveRoom(liveRoomCode.value);
    return;
  }
  uni.navigateBack({
    fail: () => uni.reLaunch({ url: "/pages/broadcast/entry" }),
  });
}
</script>

<style lang="scss" scoped>
.prize-record-shell {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: #f4f4f4;
}

.back-pill {
  position: absolute;
  left: 0;
  bottom: 120rpx;
  width: 120rpx;
  height: 64rpx;
  border-radius: 0 32rpx 32rpx 0;
  background: #fff;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  z-index: 100;
}

.back-arrow,
.back-text {
  font-size: 24rpx;
  color: #ff6b2e;
}

.prize-record-page {
  width: 100%;
  height: 100%;
  background-color: #f4f4f4;
}

.record-hero {
  position: relative;
  width: 100%;
  height: 180rpx;
  background: linear-gradient(to right, #3a8af7, #3a53ec);
  color: #fff;
}

.header-img {
  position: absolute;
  top: 0;
  right: 0;
  width: 180rpx;
  height: 180rpx;
  background-image: url("https://man.lqjy.cc/static/remote-icons/s-nuoyun-luckydraw-header-img.png");
  background-repeat: no-repeat;
  background-size: contain;
}

.record {
  position: relative;
  height: 40rpx;
  line-height: 40rpx;
}

.sign-total {
  padding: 50rpx 40rpx 0;
  color: #b1cbf6;
  font-size: 34rpx;
}

.total-count {
  display: block;
  margin-top: 8rpx;
  font-size: 58rpx;
  line-height: 66rpx;
  color: #fff;
  font-weight: 400;
}

.record-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100rpx;
  padding: 0 20rpx;
  color: #333;
  background-color: #fff;
  box-sizing: border-box;
}

.record-header > text {
  font-size: 28rpx;
  font-weight: 500;
}

.filter-summary {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
  display: flex;
  flex-direction: column;
}

.search-time,
.search-type {
  color: #333;
  font-size: 24rpx;
  line-height: 32rpx;
}

.search-trigger {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.search-ico { width: 38rpx; height: 34rpx; }

.bc-f4 { height: 20rpx; background-color: #f4f4f4; }

.record-ul { padding: 0 20rpx; background-color: #fff; }

.record-list {
  position: relative;
  padding: 20rpx 0 26rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.list-title { display: flex; align-items: center; }

.list-type {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #333;
  font-size: 28rpx;
}

.room-msg { position: relative; padding-left: 100rpx; }

.room-name {
  display: block;
  color: #333;
  font-size: 28rpx;
  line-height: 40rpx;
}

.list-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
  min-height: 48rpx;
}

.list-time {
  font-size: 24rpx;
  color: #999;
  line-height: 24rpx;
}

.record-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 140rpx;
  height: 48rpx;
  border-radius: 24rpx;
  background: linear-gradient(90deg, #f1322b, #f0501e);
  color: #fff;
  font-size: 24rpx;
}

.no-data { width: 356rpx; height: 398rpx; margin: 120rpx auto 0; }

.no-data image { width: 100%; height: 100%; }

.loading-text {
  padding: 28rpx 0;
  color: #999;
  font-size: 24rpx;
  text-align: center;
}

.search-box {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
}

.search-box-bc { width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.3); }

.search-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  z-index: 1;
}

.filter-top {
  height: 150rpx;
  border-bottom: 1rpx solid #f6f6f6;
  padding-top: 30rpx;
  margin: 0 20rpx;
  box-sizing: border-box;
}

.filter-top > text,
.filter-bottom > text {
  color: #333;
  font-size: 32rpx;
  line-height: 34rpx;
}

.select_month {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  margin-top: 24rpx;
}

.show-sel-time { color: #333; font-size: 30rpx; }

.month-clear { color: #1890ff; font-size: 26rpx; }

.filter-bottom { padding-top: 30rpx; margin: 0 20rpx; }

.type-options {
  display: flex;
  flex-wrap: wrap;
  padding: 30rpx 36rpx 0;
}

.type-option {
  margin: 0 48rpx 30rpx 0;
  padding: 14rpx 36rpx;
  border: 1rpx solid #cecece;
  border-radius: 10rpx;
  color: #343434;
  font-size: 30rpx;
  line-height: 30rpx;
  text-align: center;
  box-sizing: border-box;
}

.type-option.checked {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

.filter-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 88rpx;
  color: #fff;
  background-color: #1890ff;
  font-size: 32rpx;
}
</style>
