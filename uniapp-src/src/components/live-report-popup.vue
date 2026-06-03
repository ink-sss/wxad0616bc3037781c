<template>
  <view>
    <wd-popup
      v-model="showTypePopup"
      position="bottom"
      :z-index="220"
      custom-style="height: auto; border-radius: 24rpx 24rpx 0 0; overflow: hidden;"
      @close="handleTypePopupClose"
    >
      <view class="complaint-popup complaint-popup--type">
        <view class="complaint-popup__header complaint-popup__header--center">
          <text class="complaint-popup__title">选择举报类型</text>
          <view class="complaint-popup__close" @click="handleTypePopupClose">
            <text class="complaint-popup__close-text">✕</text>
          </view>
        </view>
        <view class="complaint-type-grid">
          <view
            v-for="item in complaintTypes"
            :key="item.value"
            :class="[
              'complaint-type-chip',
              complaintType === item.value ? 'complaint-type-chip--active' : '',
            ]"
            @click="onSelectComplaintType(item)"
          >
            <text class="complaint-type-chip__label">{{ item.label }}</text>
          </view>
        </view>
      </view>
    </wd-popup>

    <wd-popup
      v-model="showFormPopup"
      position="bottom"
      :z-index="221"
      custom-style="height: 84vh; border-radius: 24rpx 24rpx 0 0; overflow: hidden;"
      @close="handleFormPopupClose"
    >
      <view class="complaint-popup complaint-popup--form">
        <view class="complaint-popup__header">
          <text class="complaint-popup__title">投诉举报</text>
          <view class="complaint-popup__close" @click="handleFormPopupClose">
            <text class="complaint-popup__close-text">✕</text>
          </view>
        </view>
        <scroll-view class="complaint-popup__scroll complaint-form-scroll" scroll-y>
          <view class="complaint-form-card">
            <wd-cell
              title="举报类型"
              :value="complaintTypeLabel || '请选择'"
              is-link
              required
              @click="openComplaintTypeFromForm"
            />
          </view>

          <view class="complaint-section-title">
            <text class="complaint-section-title__req">*</text>
            <text class="complaint-section-title__text">举报直播</text>
          </view>
          <view class="complaint-live-card">
            <image class="complaint-live-card__cover" :src="cover" mode="aspectFill" />
            <view class="complaint-live-card__meta">
              <text class="complaint-live-card__name">{{ liveName || '直播间名称' }}</text>
              <text class="complaint-live-card__id">直播间ID：{{ liveId || '-' }}</text>
            </view>
          </view>

          <view class="complaint-section-title">
            <text class="complaint-section-title__req">*</text>
            <text class="complaint-section-title__text">举报说明</text>
          </view>
          <view class="report-desc-wrap">
            <wd-textarea
              v-model="complaintDesc"
              placeholder="描述您要举报的具体情况，有助于客服更快的处理投诉（必填）"
              clearable
              :adjust-position="false"
              size="small"
              custom-class="report-desc-textarea"
              custom-style="margin: 0; height:200rpx;background:transparent;border-radius:16rpx"
              @input="descError = ''"
            />
          </view>
          <text v-if="descError" class="complaint-field-error">{{ descError }}</text>

          <view class="complaint-form-card">
            <wd-input
              v-model="complaintPhone"
              label="联系电话"
              type="number"
              :maxlength="20"
              placeholder="请输入"
              required
              @input="phoneError = ''"
            />
          </view>
          <text v-if="phoneError" class="complaint-field-error">{{ phoneError }}</text>

          <view class="complaint-upload-title">上传凭证</view>
          <view class="complaint-upload-area">
            <view
              v-for="(item, idx) in complaintImages"
              :key="item.id"
              class="complaint-img-item"
              @click="previewComplaintImage(idx)"
            >
              <image class="complaint-img-item__img" :src="item.url" mode="aspectFill" />
              <view v-if="item.uploading" class="complaint-img-item__uploading">上传中</view>
              <view class="complaint-img-item__del" @click.stop="removeComplaintImage(idx)">
                <wd-icon name="close" size="24rpx" color="#fff" />
              </view>
            </view>

            <view
              v-if="complaintImages.length < 9"
              class="complaint-img-add"
              @click="chooseComplaintImage"
            >
              <wd-icon name="add" size="48rpx" color="rgba(0,0,0,0.2)" />
              <text class="complaint-img-add__text">上传图片凭证\n最多9张</text>
            </view>
          </view>
        </scroll-view>
        <view class="complaint-submit-bar">
          <wd-button
            type="primary"
            block
            round
            size="large"
            custom-class="theme-primary-btn"
            :loading="complaintSubmitting"
            @click="submitComplaint"
          >
            提交
          </wd-button>
        </view>
      </view>
    </wd-popup>

    <wd-popup
      v-model="showSuccessPopup"
      position="bottom"
      :z-index="222"
      custom-style="height: 56vh; border-radius: 24rpx 24rpx 0 0; overflow: hidden;"
      @close="handleSuccessPopupClose"
    >
      <view class="complaint-popup complaint-popup--success">
        <view class="complaint-popup__header">
          <text class="complaint-popup__title">提交成功</text>
          <view class="complaint-popup__close" @click="handleSuccessPopupClose">
            <text class="complaint-popup__close-text">✕</text>
          </view>
        </view>
        <view class="complaint-success">
          <view class="complaint-success__icon-wrap">
            <wd-icon name="check-bold" size="72rpx" color="#fff" />
          </view>
          <text class="complaint-success__title">提交成功</text>
          <text class="complaint-success__desc">您的投诉已提交，系统正在核实中</text>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useToast } from 'wot-design-uni'
import { createComplaint, uploadComplaintImage } from '@/services/live-report'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  liveId: {
    type: [String, Number],
    default: '',
  },
  roomCode: {
    type: String,
    default: '',
  },
  tenantId: {
    type: [String, Number],
    default: '',
  },
  termId: {
    type: [String, Number],
    default: '',
  },
  customerId: {
    type: [String, Number],
    default: '',
  },
  userId: {
    type: [String, Number],
    default: '',
  },
  isReplay: {
    type: Boolean,
    default: false,
  },
  replayVideoId: {
    type: [String, Number],
    default: '',
  },
  liveName: {
    type: String,
    default: '',
  },
  cover: {
    type: String,
    default: '',
  },
  fromPath: {
    type: String,
    default: '/pages/broadcast/entry',
  },
})

const emit = defineEmits(['update:visible'])
const toast = useToast()

const complaintTypeMap = {
  ad_fraud: 1,
  politics: 2,
  abuse: 3,
  infringement: 4,
  illegal: 5,
  porn: 6,
  violence: 7,
  other: 8,
}

const complaintTypes = [
  { label: '广告欺诈', value: 'ad_fraud' },
  { label: '政治敏感', value: 'politics' },
  { label: '侮辱谩骂', value: 'abuse' },
  { label: '直播侵权', value: 'infringement' },
  { label: '违法违规', value: 'illegal' },
  { label: '色情低俗', value: 'porn' },
  { label: '血腥暴力', value: 'violence' },
  { label: '其他问题', value: 'other' },
]

const showTypePopup = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})
const showFormPopup = ref(false)
const showSuccessPopup = ref(false)
const complaintType = ref('')
const complaintTypeLabel = ref('')
const complaintDesc = ref('')
const complaintPhone = ref('')
const complaintImages = ref([])
const complaintSubmitting = ref(false)
const complaintUploading = ref(false)
const descError = ref('')
const phoneError = ref('')
let complaintUploadIdCounter = 0

function resetComplaintForm() {
  showFormPopup.value = false
  showSuccessPopup.value = false
  complaintType.value = ''
  complaintTypeLabel.value = ''
  complaintDesc.value = ''
  complaintPhone.value = ''
  complaintImages.value = []
  complaintSubmitting.value = false
  complaintUploading.value = false
  descError.value = ''
  phoneError.value = ''
}

function handleTypePopupClose() {
  showTypePopup.value = false
}

function handleFormPopupClose() {
  showFormPopup.value = false
  emit('update:visible', false)
  resetComplaintForm()
}

function handleSuccessPopupClose() {
  showSuccessPopup.value = false
  emit('update:visible', false)
  resetComplaintForm()
}

function onSelectComplaintType(item) {
  complaintType.value = item.value
  complaintTypeLabel.value = item.label
  showTypePopup.value = false
  showFormPopup.value = true
}

function openComplaintTypeFromForm() {
  showFormPopup.value = false
  showTypePopup.value = true
}

function numberOrZero(value) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

function getComplaintRoomPayload() {
  const roomId = numberOrZero(props.liveId)
  const tenantId = numberOrZero(props.tenantId)
  const termId = numberOrZero(props.termId)
  const customerId = numberOrZero(props.customerId || props.userId)
  const replayVideoId = numberOrZero(props.replayVideoId)
  const liveType = props.isReplay ? 'replay' : 'live'
  return {
    roomId,
    room_id: roomId,
    liveId: roomId,
    live_id: roomId,
    roomCode: props.roomCode || '',
    room_code: props.roomCode || '',
    tenantId,
    tenant_id: tenantId,
    termId,
    term_id: termId,
    liveTermId: termId,
    live_term_id: termId,
    customerId,
    customer_id: customerId,
    userId: customerId,
    user_id: customerId,
    isReplay: props.isReplay,
    is_replay: props.isReplay,
    replay: props.isReplay,
    liveType,
    live_type: liveType,
    replayVideoId,
    replay_video_id: replayVideoId,
    videoId: replayVideoId,
    video_id: replayVideoId,
    liveName: props.liveName || '',
    live_name: props.liveName || '',
    roomName: props.liveName || '',
    room_name: props.liveName || '',
    cover: props.cover || '',
    coverImage: props.cover || '',
    cover_image: props.cover || '',
    liveCover: props.cover || '',
    live_cover: props.cover || '',
    fromPath: props.fromPath || '',
    from_path: props.fromPath || '',
    sourcePath: props.fromPath || '',
    source_path: props.fromPath || '',
    returnPath: props.fromPath || '',
    return_path: props.fromPath || '',
  }
}

function chooseComplaintImage() {
  if (complaintUploading.value) return
  uni.chooseImage({
    count: 9 - complaintImages.value.length,
    sizeType: ['compressed'],
    success: (res) => {
      uploadComplaintImages(res.tempFilePaths || [])
    },
  })
}

async function uploadComplaintImages(filePaths = []) {
  const validPaths = Array.isArray(filePaths)
    ? filePaths.slice(0, 9 - complaintImages.value.length)
    : []
  if (!validPaths.length) return

  complaintUploading.value = true
  const contentTypeMap = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  }
  try {
    for (const filePath of validPaths) {
      const uploadId = `complaint_upload_${++complaintUploadIdCounter}`
      const fileName = filePath.split('/').pop() || `complaint_${Date.now()}.jpg`
      const ext = (fileName.split('.').pop() || 'jpg').toLowerCase()
      const tempItem = {
        id: uploadId,
        url: filePath,
        rawUrl: '',
        uploading: true,
      }
      complaintImages.value = [...complaintImages.value, tempItem]
      try {
        const uploaded = await uploadComplaintImage({
          ...getComplaintRoomPayload(),
          filePath,
          fileName,
          contentType: contentTypeMap[ext] || 'image/jpeg',
        })
        complaintImages.value = complaintImages.value.map((item) =>
          item?.id === uploadId
            ? {
                ...item,
                url: uploaded.url,
                rawUrl: uploaded.rawUrl || uploaded.url,
                uploading: false,
              }
            : item,
        )
      } catch (error) {
        complaintImages.value = complaintImages.value.filter((item) => item?.id !== uploadId)
        uni.showToast({ title: '图片上传失败', icon: 'none' })
      }
    }
  } finally {
    complaintImages.value = complaintImages.value.map((item) =>
      item?.uploading && item?.rawUrl ? { ...item, uploading: false } : item,
    )
    complaintUploading.value = false
  }
}

function removeComplaintImage(idx) {
  complaintImages.value = complaintImages.value.filter((_, i) => i !== idx)
}

function previewComplaintImage(idx) {
  const urls = complaintImages.value
    .filter((item) => !item.uploading && item.url)
    .map((item) => item.url)
  if (!urls.length) return
  uni.previewImage({
    current: complaintImages.value[idx]?.url || urls[0],
    urls,
  })
}

async function submitComplaint() {
  let hasError = false
  if (!complaintTypeLabel.value) {
    uni.showToast({ title: '请选择举报类型', icon: 'none' })
    return
  }
  descError.value = ''
  phoneError.value = ''
  if (!String(complaintDesc.value || '').trim()) {
    descError.value = '请填写举报说明'
    hasError = true
  }
  if (!String(complaintPhone.value || '').trim()) {
    phoneError.value = '请填写联系电话'
    hasError = true
  }
  if (hasError) return
  if (complaintSubmitting.value) return
  if (complaintUploading.value || complaintImages.value.some((item) => item.uploading)) {
    uni.showToast({ title: '图片上传中，请稍后提交', icon: 'none' })
    return
  }
  complaintSubmitting.value = true
  try {
    const uploadedUrls = complaintImages.value
      .map((item) => item.rawUrl || item.url)
      .filter((url) => url && /^https?:\/\//i.test(url))
    await createComplaint({
      ...getComplaintRoomPayload(),
      complaintType: complaintTypeMap[complaintType.value] || 5,
      complaint_type: complaintTypeMap[complaintType.value] || 5,
      content: complaintDesc.value.trim(),
      description: complaintDesc.value.trim(),
      reporterPhone: complaintPhone.value.trim(),
      reporter_phone: complaintPhone.value.trim(),
      phone: complaintPhone.value.trim(),
      images: uploadedUrls,
      imageUrls: uploadedUrls,
      image_urls: uploadedUrls,
    })
    showFormPopup.value = false
    showSuccessPopup.value = true
  } catch (err) {
    uni.showToast({ title: err?.message || '提交失败', icon: 'none' })
  } finally {
    complaintSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.complaint-popup {
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.complaint-popup--type {
  height: auto;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.complaint-popup__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx 20rpx;
  flex-shrink: 0;
}

.complaint-popup__header--center {
  justify-content: center;
  position: relative;
  padding-bottom: 28rpx;
}

.complaint-popup__title {
  font-size: 34rpx;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
}

.complaint-popup__close {
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.complaint-popup__header--center .complaint-popup__close {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
}

.complaint-popup__close-text {
  font-size: 32rpx;
  color: rgba(0, 0, 0, 0.38);
}

.complaint-popup__scroll {
  flex: 1;
  min-height: 0;
}

.complaint-type-grid {
  padding: 0 24rpx;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20rpx 18rpx;
}

.complaint-type-chip {
  min-height: 68rpx;
  border-radius: 12rpx;
  border: 2rpx solid #ececec;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12rpx;
  box-sizing: border-box;
}

.complaint-type-chip--active {
  border-color: var(--wot-color-theme, #ff8a1f);
  background: rgba(255, 138, 31, 0.08);
}

.complaint-type-chip__label {
  text-align: center;
  font-size: 25rpx;
  line-height: 1.35;
  color: #333;
}

.complaint-popup--form {
  position: relative;
}

.complaint-popup--success {
  justify-content: flex-start;
}

.complaint-form-scroll {
  box-sizing: border-box;
}

.complaint-form-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.complaint-section-title {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 32rpx 16rpx;
}

.complaint-section-title__req {
  color: #ff4d4f;
  font-size: 28rpx;
}

.complaint-section-title__text {
  font-size: 28rpx;
  color: rgba(0, 0, 0, 0.88);
}

.complaint-live-card {
  margin: 0 32rpx 24rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.complaint-live-card__cover {
  width: 112rpx;
  height: 112rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  background: #ececec;
}

.complaint-live-card__meta {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  min-width: 0;
}

.complaint-live-card__name {
  font-size: 30rpx;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
}

.complaint-live-card__id {
  font-size: 24rpx;
  color: rgba(0, 0, 0, 0.45);
}

.report-desc-wrap {
  margin: 0 32rpx 24rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  overflow: hidden;
}

.report-desc-textarea {
  padding: 0 !important;
  margin: 0 !important;
  box-shadow: none !important;
  border: none !important;
  background: #f8f8f8 !important;
}

.complaint-field-error {
  display: block;
  padding: 0rpx 32rpx 12rpx 24rpx;
  font-size: 24rpx;
  color: #ff4d4f;
}

.complaint-upload-title {
  padding: 4rpx 32rpx 16rpx;
  font-size: 28rpx;
  color: rgba(0, 0, 0, 0.88);
}

.complaint-upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  padding: 0 32rpx 32rpx;
}

.complaint-img-item,
.complaint-img-add {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  background: #f7f7f7;
}

.complaint-img-item__img {
  width: 100%;
  height: 100%;
}

.complaint-img-item__uploading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.42);
  color: #fff;
  font-size: 24rpx;
}

.complaint-img-item__del {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.complaint-img-add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.complaint-img-add__text {
  white-space: pre-line;
  text-align: center;
  font-size: 22rpx;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.28);
}

.complaint-submit-bar {
  padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
}

.complaint-success {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx 32rpx calc(40rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.complaint-success__icon-wrap {
  width: 140rpx;
  height: 140rpx;
  border-radius: 70rpx;
  background: #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.complaint-success__title {
  margin-top: 26rpx;
  font-size: 34rpx;
  color: #000;
  font-weight: 600;
}

.complaint-success__desc {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: rgba(0, 0, 0, 0.45);
}
</style>
