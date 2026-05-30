<template>
  <view v-if="visible" class="question">
    <view class="title">{{ question.title || question.name || '答题' }}</view>
    <view v-for="item in options" :key="item.value || item.id" class="option" @tap="submit(item)">{{ item.text || item.name }}</view>
  </view>
</template>
<script>
import { requestWithVm } from '../page-tools.js'
export default {
  props: { question: { type: Object, default: () => ({}) }, liveId: { type: [Number, String], default: '' } },
  data() { return { visible: true } },
  computed: { options() { return this.question.options || this.question.answer || [] } },
  methods: {
    submit(item) {
      requestWithVm(this, '_post', 'live.question/submit', { live_id: this.liveId, question_id: this.question.id, answer: item.value || item.id }).then(() => { this.visible = false })
    },
  },
}
</script>
<style scoped>.question{padding:24rpx;border-radius:12rpx;background:#fff;color:#333}.title{font-weight:600}.option{margin-top:16rpx;padding:16rpx;border-radius:8rpx;background:#f5f5f5}</style>
