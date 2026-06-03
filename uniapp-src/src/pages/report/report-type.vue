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
import { buildBroadcastReturnPath } from "@/pages/broadcast/utils/live-route-context.js";

const liveId = ref("");
const roomCode = ref("");
const tenantId = ref("");
const termId = ref("");
const customerId = ref("");
const replayVideoId = ref("");
const liveType = ref("");
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

function appendQuery(params, key, value) {
  const text = value === undefined || value === null ? "" : String(value);
  if (text) params.push(key + "=" + encodeURIComponent(text));
}

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

  const params = [];
  appendQuery(params, "type", item.value);
  appendQuery(params, "typeLabel", item.label);
  appendQuery(params, "liveId", liveId.value);
  appendQuery(params, "roomCode", roomCode.value);
  appendQuery(params, "tenantId", tenantId.value);
  appendQuery(params, "termId", termId.value);
  appendQuery(params, "customerId", customerId.value);
  appendQuery(params, "replayVideoId", replayVideoId.value);
  appendQuery(params, "videoId", replayVideoId.value);
  appendQuery(params, "liveType", liveType.value);
  appendQuery(params, "liveName", liveName.value);
  appendQuery(params, "cover", cover.value);
  appendQuery(params, "fromPath", fromPath.value);
  uni.navigateTo({ url: "/pages/report/report-form?" + params.join("&") });
}

onLoad((options) => {
  if (!ensureH5PageAuth(options)) return;
  liveId.value = options.liveId || "";
  roomCode.value = options.roomCode || options.room_code || "";
  tenantId.value = options.tenantId || options.tenant_id || "";
  termId.value = options.termId || options.term_id || options.liveTermId || options.live_term_id || "";
  customerId.value = options.customerId || options.customer_id || options.userId || options.user_id || "";
  replayVideoId.value = options.replayVideoId || options.replay_video_id || options.videoId || options.video_id || "";
  liveType.value = options.liveType || options.live_type || (options.replay === "1" ? "replay" : "");
  liveName.value = options.liveName || "";
  cover.value = options.cover || "";
  from.value = options.from || "";
  fromPath.value = options.fromPath || "";

  // [2026-05-13] 个人中心入口缺少直播间或返回参数时，从 live_room_ctx_v1 缓存兜底
  if (!liveId.value || !roomCode.value || !fromPath.value) {
    try {
      const ctx = loadLiveRoomContext();
      if (ctx && (ctx.liveId || ctx.roomId)) {
        liveId.value = ctx.liveId || ctx.roomId;
        roomCode.value = roomCode.value || ctx.roomCode || "";
        tenantId.value = tenantId.value || ctx.tenantId || ctx.tenant_id || "";
        termId.value = termId.value || ctx.termId || ctx.term_id || ctx.liveTermId || ctx.live_term_id || "";
        customerId.value = customerId.value || ctx.customerId || ctx.customer_id || ctx.userId || ctx.user_id || "";
        replayVideoId.value = replayVideoId.value || ctx.replayVideoId || ctx.replay_video_id || ctx.videoId || ctx.video_id || "";
        liveType.value = liveType.value || ctx.liveType || ctx.live_type || (ctx.replay === "1" ? "replay" : "");
        liveName.value = liveName.value || ctx.liveName || "";
        cover.value = cover.value || ctx.cover || "";
        fromPath.value = fromPath.value || buildBroadcastReturnPath(ctx);
      }
    } catch (_) {}
  }
  if (!fromPath.value) {
    fromPath.value = buildBroadcastReturnPath({
      roomCode: roomCode.value,
      liveId: liveId.value,
      tenantId: tenantId.value,
      termId: termId.value,
      customerId: customerId.value,
      videoId: replayVideoId.value,
      liveType: liveType.value,
      liveName: liveName.value,
      cover: cover.value,
    });
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
