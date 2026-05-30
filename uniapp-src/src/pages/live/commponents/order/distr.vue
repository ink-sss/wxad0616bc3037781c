<template>
  <view class="distr">
    <label class="row"><radio :checked="value === 10" @tap="$emit('change', 10)" />快递配送</label>
    <label class="row"><radio :checked="value === 20" @tap="$emit('change', 20)" />到店自提</label>
  </view>
</template>

<script>
export default {
  props: {
    value: { type: Number, default: 10 },
  },
  emits: ['change'],
}
</script>

<style scoped>
.row { display: block; padding: 16rpx 0; color: #333; }
</style>
