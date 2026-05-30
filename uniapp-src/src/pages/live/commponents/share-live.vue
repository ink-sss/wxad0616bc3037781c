<template>
  <view class="share-live">
    <button open-type="share" class="primary">分享直播间</button>
    <image v-if="poster" class="poster" :src="poster" mode="widthFix" />
  </view>
</template>
<script>
import { requestWithVm } from '../page-tools.js'
export default {
  props: { liveId: { type: [Number, String], default: '' } },
  data() { return { poster: '' } },
  methods: {
    loadPoster() {
      requestWithVm(this, '_get', 'live.qrcode/poster', { live_id: this.liveId }).then((res) => { this.poster = res.data && (res.data.url || res.data.poster) })
    },
  },
}
</script>
<style scoped>.share-live{padding:24rpx;background:#fff}.primary{color:#fff;background:#ff5704}.poster{width:520rpx;margin:24rpx auto 0;display:block}</style>
