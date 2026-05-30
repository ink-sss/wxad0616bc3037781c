<template>
  <view v-if="visible" class="modal-mask">
    <view class="modal">
      <view class="title">{{ title }}</view>
      <input v-model="value" class="input" :placeholder="placeholder" />
      <view class="actions">
        <button size="mini" @tap="cancel">取消</button>
        <button size="mini" class="primary" @tap="confirm">确认</button>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  props: { title: { type: String, default: '请输入' }, placeholder: { type: String, default: '' } },
  emits: ['confirm', 'cancel'],
  data() { return { visible: false, value: '' } },
  methods: {
    open(value = '') { this.value = value; this.visible = true },
    close() { this.visible = false },
    confirm() { this.$emit('confirm', this.value); this.close() },
    cancel() { this.$emit('cancel'); this.close() },
  },
}
</script>
<style scoped>.modal-mask{position:fixed;inset:0;z-index:260;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45)}.modal{width:600rpx;padding:28rpx;border-radius:12rpx;background:#fff;color:#333}.title{font-size:30rpx;font-weight:600;text-align:center}.input{height:74rpx;margin:24rpx 0;padding:0 18rpx;border:1px solid #ddd;border-radius:8rpx}.actions{display:flex;gap:16rpx}.actions button{flex:1}.primary{color:#fff;background:#ff5704}</style>
