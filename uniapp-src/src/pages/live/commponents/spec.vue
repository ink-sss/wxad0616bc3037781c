<template>
  <view v-if="visible" class="spec-mask" @tap="close">
    <view class="panel" @tap.stop>
      <view class="title">{{ product.product_name || product.name || '选择规格' }}</view>
      <button class="primary" @tap="confirm">确定</button>
    </view>
  </view>
</template>
<script>
export default {
  props: { product: { type: Object, default: () => ({}) } },
  emits: ['confirm', 'close'],
  data() { return { visible: false } },
  methods: { open() { this.visible = true }, close() { this.visible = false; this.$emit('close') }, confirm() { this.$emit('confirm', this.product); this.close() } },
}
</script>
<style scoped>.spec-mask{position:fixed;inset:0;z-index:220;display:flex;align-items:flex-end;background:rgba(0,0,0,.4)}.panel{width:100%;padding:28rpx;border-radius:20rpx 20rpx 0 0;background:#fff;color:#333}.title{font-size:30rpx;font-weight:600}.primary{margin-top:24rpx;color:#fff;background:#ff5704}</style>
