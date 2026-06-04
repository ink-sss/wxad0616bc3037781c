<template>
  <view class="report-form">
    <view class="form-card" @click="goSelectType">
      <view class="form-row form-row-arrow">
        <text class="form-label">举报类型</text>
        <view class="form-value-wrap">
          <text :class="['form-value', typeLabel ? 'form-value-active' : '']">{{ typeLabel || "请选择" }}</text>
          <text class="form-arrow">›</text>
        </view>
      </view>
    </view>

    <view class="section-title">
      <text class="req">*</text>
      <text class="section-text">举报直播</text>
    </view>
    <view class="live-card">
      <image class="live-cover" :src="cover" mode="aspectFill" />
      <view class="live-meta">
        <text class="live-name">{{ liveName || "直播间名称" }}</text>
        <text class="live-id">直播间ID：{{ liveId || "-" }}</text>
      </view>
    </view>

    <view class="section-title">
      <text class="req">*</text>
      <text class="section-text">举报说明</text>
    </view>
    <view class="report-desc-wrap">
      <textarea
        v-model="desc"
        class="report-desc-textarea"
        placeholder="描述您要举报的具体情况，有助于客服更快的处理投诉（必填）"
        maxlength="500"
      />
    </view>

    <view class="form-card">
      <view class="form-row">
        <text class="form-label">联系电话</text>
        <input
          v-model="phone"
          class="form-input"
          type="number"
          maxlength="20"
          placeholder="请输入"
        />
      </view>
    </view>

    <view class="upload-title">上传凭证</view>
    <view class="upload-area">
      <view
        v-for="(item, idx) in images"
        :key="item.id"
        class="img-item"
        @click="preview(idx)"
      >
        <image class="img" :src="item.url" mode="aspectFill" />
        <view v-if="item.uploading" class="img-uploading">上传中</view>
        <view class="img-del" @click.stop="remove(idx)">
          <text class="img-del-text">×</text>
        </view>
      </view>

      <view v-if="images.length < 9" class="img-add" @click="chooseImage">
        <text class="img-add-icon">＋</text>
        <text class="add-text">上传图片凭证\n最多9张</text>
      </view>
    </view>

    <view class="submit-bar">
      <view class="theme-primary-btn submit-btn" @click="submit">
        提交
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { createComplaint, uploadComplaintImage } from "@/api/complaint";
import { chooseImage as chooseMpImage } from "@/platform/weixin/file";
import { loadLiveRoomContext } from "@/utils/live-room-context";
import { buildBroadcastReturnPath } from "@/pages/broadcast/utils/live-route-context.js";

// 前端类型 -> 后端 complaintType 映射（1-8独立编号）
const typeMap = {
  ad_fraud: 1,
  politics: 2,
  abuse: 3,
  infringement: 4,
  illegal: 5,
  porn: 6,
  violence: 7,
  other: 8,
};

const type = ref("");
const typeLabel = ref("");
const liveId = ref("");
const roomCode = ref("");
const tenantId = ref("");
const termId = ref("");
const customerId = ref("");
const replayVideoId = ref("");
const liveType = ref("");
const liveName = ref("");
const cover = ref("");
const fromPath = ref("");
const desc = ref("");
const phone = ref("");
const images = ref([]);
const submitting = ref(false);
const uploading = ref(false);
let uploadIdCounter = 0;

function appendQuery(params, key, value) {
  const text = value === undefined || value === null ? "" : String(value);
  if (text) params.push(key + "=" + encodeURIComponent(text));
}

function numberOrZero(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function getComplaintRoomPayload() {
  const roomId = numberOrZero(liveId.value);
  const tenant = numberOrZero(tenantId.value);
  const term = numberOrZero(termId.value);
  const customer = numberOrZero(customerId.value);
  const video = numberOrZero(replayVideoId.value);
  const isReplay = liveType.value === "replay" || !!video;
  return {
    roomId,
    room_id: roomId,
    liveId: roomId,
    live_id: roomId,
    roomCode: roomCode.value || "",
    room_code: roomCode.value || "",
    tenantId: tenant,
    tenant_id: tenant,
    termId: term,
    term_id: term,
    liveTermId: term,
    live_term_id: term,
    customerId: customer,
    customer_id: customer,
    userId: customer,
    user_id: customer,
    isReplay,
    is_replay: isReplay,
    replay: isReplay,
    liveType: isReplay ? "replay" : (liveType.value || "live"),
    live_type: isReplay ? "replay" : (liveType.value || "live"),
    replayVideoId: video,
    replay_video_id: video,
    videoId: video,
    video_id: video,
    liveName: liveName.value || "",
    live_name: liveName.value || "",
    roomName: liveName.value || "",
    room_name: liveName.value || "",
    cover: cover.value || "",
    coverImage: cover.value || "",
    cover_image: cover.value || "",
    liveCover: cover.value || "",
    live_cover: cover.value || "",
    fromPath: fromPath.value || "",
    from_path: fromPath.value || "",
    sourcePath: fromPath.value || "",
    source_path: fromPath.value || "",
    returnPath: fromPath.value || "",
    return_path: fromPath.value || "",
  };
}

function goSelectType() {
  const params = [];
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
  appendQuery(params, "from", "form");
  appendQuery(params, "fromPath", fromPath.value);
  uni.navigateTo({
    url: "/pages/report/report-type?" + params.join("&"),
    success: (res) => {
      if (res && res.eventChannel && res.eventChannel.on) {
        res.eventChannel.on("selectType", (data) => {
          type.value = (data && data.type) || "";
          typeLabel.value = (data && data.typeLabel) || "";
        });
      }
    },
  });
}

function chooseImage() {
  if (uploading.value) return;
  chooseMpImage({ count: 9 - images.value.length })
    .then((res) => uploadImages(res.tempFilePaths || []))
    .catch((error) => {
      if (!String(error?.errMsg || "").includes("cancel")) {
        uni.showToast({ title: "选择图片失败", icon: "none" });
      }
    });
}

async function uploadImages(filePaths = []) {
  const validPaths = Array.isArray(filePaths)
    ? filePaths.slice(0, 9 - images.value.length)
    : [];
  if (!validPaths.length) return;

  uploading.value = true;
  const contentTypeMap = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };
  try {
    for (const filePath of validPaths) {
      const uploadId = `upload_${++uploadIdCounter}`;
      const fileName = filePath.split("/").pop() || `complaint_${Date.now()}.jpg`;
      const ext = (fileName.split(".").pop() || "jpg").toLowerCase();
      const tempItem = {
        id: uploadId,
        url: filePath,
        rawUrl: "",
        uploading: true,
      };
      images.value = [...images.value, tempItem];
      try {
        const uploaded = await uploadComplaintImage({
          ...getComplaintRoomPayload(),
          filePath,
          fileName,
          contentType: contentTypeMap[ext] || "image/jpeg",
        });
        images.value = images.value.map((item) =>
          item?.id === uploadId
            ? { ...item, url: uploaded.url, rawUrl: uploaded.rawUrl || uploaded.url, uploading: false }
            : item,
        );
      } catch (error) {
        images.value = images.value.filter((item) => item?.id !== uploadId);
        uni.showToast({ title: "图片上传失败", icon: "none" });
      }
    }
  } finally {
    images.value = images.value.map((item) =>
      item?.uploading && item?.rawUrl ? { ...item, uploading: false } : item,
    );
    uploading.value = false;
  }
}

function remove(idx) {
  images.value = images.value.filter((_, i) => i !== idx);
}

function preview(idx) {
  const urls = images.value
    .filter((item) => !item.uploading && item.url)
    .map((item) => item.url);
  if (!urls.length) return;
  uni.previewImage({
    current: images.value[idx]?.url || urls[0],
    urls,
  });
}

async function submit() {
  if (!typeLabel.value) {
    uni.showToast({ title: "请选择举报类型", icon: "none" });
    return;
  }
  if (!String(desc.value || "").trim()) {
    uni.showToast({ title: "请填写举报说明", icon: "none" });
    return;
  }
  if (!String(phone.value || "").trim()) {
    uni.showToast({ title: "请填写联系电话", icon: "none" });
    return;
  }
  if (submitting.value) return;
  if (uploading.value || images.value.some((item) => item.uploading)) {
    uni.showToast({ title: "图片上传中，请稍后提交", icon: "none" });
    return;
  }
  submitting.value = true;

  try {
    const uploadedUrls = images.value
      .map((item) => item.rawUrl || item.url)
      .filter((url) => url && /^https?:\/\//i.test(url));
    await createComplaint({
      ...getComplaintRoomPayload(),
      complaintType: typeMap[type.value] || 5,
      complaint_type: typeMap[type.value] || 5,
      content: desc.value.trim(),
      description: desc.value.trim(),
      reporterPhone: phone.value.trim(),
      reporter_phone: phone.value.trim(),
      phone: phone.value.trim(),
      images: uploadedUrls,
      imageUrls: uploadedUrls,
      image_urls: uploadedUrls,
    });
    const q = fromPath.value
      ? "fromPath=" + encodeURIComponent(fromPath.value)
      : "";
    uni.redirectTo({
      url: "/pages/report/report-success" + (q ? "?" + q : ""),
    });
  } catch (err) {
    uni.showToast({ title: err?.message || "提交失败", icon: "none" });
  } finally {
    submitting.value = false;
  }
}

onLoad((options) => {
  type.value = options.type || "";
  typeLabel.value = options.typeLabel || "";
  liveId.value = options.liveId || "";
  roomCode.value = options.roomCode || options.room_code || "";
  tenantId.value = options.tenantId || options.tenant_id || "";
  termId.value = options.termId || options.term_id || options.liveTermId || options.live_term_id || "";
  customerId.value = options.customerId || options.customer_id || options.userId || options.user_id || "";
  replayVideoId.value = options.replayVideoId || options.replay_video_id || options.videoId || options.video_id || "";
  liveType.value = options.liveType || options.live_type || (options.replay === "1" ? "replay" : "");
  liveName.value = options.liveName || "";
  cover.value = options.cover || "";
  fromPath.value = options.fromPath || "";

  // [2026-05-13] liveId / roomCode / fromPath 缺失时从 live_room_ctx_v1 缓存兜底
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
    const pages = getCurrentPages();
    const liveIdx = (() => {
      for (let i = pages.length - 1; i >= 0; i--) {
        const r = (pages[i] && pages[i].route) || "";
        if (r === "pages/broadcast/entry" || r === "pages/broadcast/replay") return i;
      }
      return -1;
    })();
    if (liveIdx >= 0) {
      fromPath.value = "/" + pages[liveIdx].route;
    }
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
.report-form {
  width: 750rpx;
  min-height: 100vh;
  background: #fff;
  padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
}

.form-card {
  background: #fff;
}

.form-row {
  min-height: 104rpx;
  padding: 0 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #f1f1f1;
  box-sizing: border-box;
}

.form-label {
  font-size: 30rpx;
  line-height: 42rpx;
  color: #222;
  font-weight: 500;
}

.form-value-wrap {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12rpx;
}

.form-value,
.form-input {
  font-size: 28rpx;
  line-height: 40rpx;
  color: rgba(0, 0, 0, 0.35);
  text-align: right;
}

.form-value-active {
  color: #333;
}

.form-input {
  flex: 1;
}

.form-arrow {
  color: #999;
  font-size: 40rpx;
  line-height: 40rpx;
}

.req {
  color: #ff3b30;
  font-size: 28rpx;
}

.section-title {
  padding: 24rpx 32rpx 14rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.section-text {
  font-size: 30rpx;
  color: #000;
}

.live-card {
  margin: 0 32rpx;
  margin-bottom: 24rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  border: 1rpx solid #f0f0f0;
}

.report-desc-wrap {
  margin: 0 32rpx 24rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  overflow: hidden;
}

.report-desc-textarea {
  width: 100%;
  min-height: 240rpx;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  box-sizing: border-box;
  color: #333;
  font-size: 28rpx;
  line-height: 40rpx;
}

.live-cover {
  width: 72rpx;
  height: 72rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.live-meta {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.live-name {
  font-size: 30rpx;
  color: #000;
  font-weight: 600;
}

.live-id {
  font-size: 24rpx;
  color: rgba(0, 0, 0, 0.55);
}

.upload-title {
  padding: 18rpx 32rpx 16rpx;
  font-size: 28rpx;
  color: rgba(0, 0, 0, 0.7);
}

.upload-area {
  padding: 0 32rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
}

.img-item {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  background: #f7f7f7;
}

.img {
  width: 200rpx;
  height: 200rpx;
}

.img-uploading {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.img-del {
  position: absolute;
  right: 8rpx;
  top: 8rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}

.img-del-text {
  color: #fff;
  font-size: 28rpx;
  line-height: 32rpx;
}

.img-add {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  background: #f7f7f7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.img-add-icon {
  color: rgba(0, 0, 0, 0.2);
  font-size: 52rpx;
  line-height: 52rpx;
}

.add-text {
  font-size: 22rpx;
  color: rgba(0, 0, 0, 0.35);
  text-align: center;
  line-height: 1.4;
  white-space: pre-line;
}

.submit-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-sizing: border-box;
}

.submit-btn {
  height: 92rpx;
  border-radius: 46rpx;
  border: none;
  background: linear-gradient(90deg, #fd7e19 0%, #ff6b2e 100%);
  box-shadow: 0 18rpx 36rpx rgba(255, 107, 46, 0.24);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 600;
}
</style>
