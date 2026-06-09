<template>
  <view></view>
</template>

<script>
import { uploadFileWithComplaintUploadUrl } from '@/api/upload.js'

export default {
  name: 'Upload',
  props: {
    num: { type: [Number, String], default: 9 },
    isVideo: { type: [Boolean, String], default: false },
  },
  emits: ['getImgs'],
  data() {
    return {
      imageList: [],
    }
  },
  mounted() {
    this.chooseImageFunc()
  },
  methods: {
    chooseImageFunc() {
      if (this.isVideoMode) {
        uni.chooseVideo({
          maxDuration: 60,
          camera: 'back',
          success: (res) => {
            if (!res) return
            this.uploadFile([res.tempFilePath])
          },
          fail: () => {
            this.$emit('getImgs', null)
          },
        })
        return
      }

      uni.chooseImage({
        count: Number(this.num) || 9,
        mediaType: ['image'],
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.uploadFile(res.tempFilePaths || [])
        },
        fail: () => {
          this.$emit('getImgs', null)
        },
      })
    },
    async uploadFile(paths) {
      let completed = 0
      const total = paths.length
      if (!total) {
        this.$emit('getImgs', this.imageList)
        return
      }

      uni.showLoading({ title: '上传中' })
      await Promise.all(paths.map(async (filePath) => {
        try {
          const uploaded = await uploadFileWithComplaintUploadUrl({
            filePath,
            fileType: this.isVideoMode ? 'video' : 'image',
          })
          this.imageList.push(uploaded)
        } catch (error) {
          uni.showModal({
            title: '提示',
            content: error?.message || '上传失败',
          })
        } finally {
          completed += 1
        }
      }))
      uni.hideLoading()
      if (completed === total) this.$emit('getImgs', this.imageList)
    },
  },
  computed: {
    isVideoMode() {
      return this.isVideo === true || this.isVideo === 'true' || this.isVideo === 1 || this.isVideo === '1'
    },
  },
}
</script>
