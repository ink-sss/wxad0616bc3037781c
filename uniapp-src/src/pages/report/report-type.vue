<template>
  <view class="report-type">
    <view class="title">选择举报类型</view>

    <view class="type-card">
      <view
        v-for="item in types"
        :key="item.value"
        class="type-row"
        @click="goForm(item)"
      >
        <text class="type-label">{{ item.label }}</text>
        <text class="type-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, getCurrentInstance } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { ensureH5PageAuth } from "@/services/h5-auth-context";
import { loadLiveRoomContext } from "@/utils/live-room-context";

const liveId = ref("");
const liveName = ref("");
const cover = ref("");
const from = ref("");
const fromPath = ref("");
const types = ref([
  { label: "广告欺诈", value: "ad_fraud" },
  { label: "政治敏感", value: "politics" },
  { label: "侮辱谩骂", value: "abuse" },
  { label: "直播侵权", value: "infringement" },
  { label: "违法违规", value: "illegal" },
  { label: "色情低俗", value: "porn" },
  { label: "血腥暴力", value: "violence" },
  { label: "其他问题", value: "other" },
]);

const instance = getCurrentInstance();

function goForm(item) {
  if (from.value === "form") {
    const channel =
      instance.proxy.getOpenerEventChannel &&
      instance.proxy.getOpenerEventChannel();
    if (channel && channel.emit) {
      channel.emit("selectType", {
        type: item.value,
        typeLabel: item.label,
      });
    }
    uni.navigateBack();
    return;
  }

  const q =
    "type=" +
    encodeURIComponent(item.value) +
    "&typeLabel=" +
    encodeURIComponent(item.label) +
    "&liveId=" +
    encodeURIComponent(liveId.value || "") +
    "&liveName=" +
    encodeURIComponent(liveName.value || "") +
    "&cover=" +
    encodeURIComponent(cover.value || "") +
    (fromPath.value ? "&fromPath=" + encodeURIComponent(fromPath.value) : "");
  uni.navigateTo({ url: "/pages/report/report-form?" + q });
}

onLoad((options) => {
  if (!ensureH5PageAuth(options)) return;
  liveId.value = options.liveId || "";
  liveName.value = options.liveName || "";
  cover.value = options.cover || "";
  from.value = options.from || "";
  fromPath.value = options.fromPath || "";

  // [2026-05-13] 个人中心入口无直播间参数时，从 live_room_ctx_v1 缓存兜底
  if (!liveId.value) {
    try {
      const ctx = loadLiveRoomContext();
      if (ctx && (ctx.liveId || ctx.roomId)) {
        liveId.value = ctx.liveId || ctx.roomId;
        liveName.value = liveName.value || ctx.liveName || "";
        cover.value = cover.value || ctx.cover || "";
      }
    } catch (_) {}
  }
});
</script>

<style lang="scss" scoped>
.report-type {
  width: 750rpx;
  min-height: 100vh;
  background: #fff;
  padding: 24rpx 32rpx;
  box-sizing: border-box;
}

.type-card {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

.title {
  font-size: 34rpx;
  color: rgba(0, 0, 0, 0.6);
  margin: 12rpx 0 20rpx;
}

.type-row {
  background: #f8f8f8 !important;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  min-height: 92rpx;
  padding: 0 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.type-label {
  font-size: 30rpx;
  line-height: 42rpx;
  color: #222;
}

.type-arrow {
  font-size: 42rpx;
  line-height: 42rpx;
  color: #999;
}
</style>
