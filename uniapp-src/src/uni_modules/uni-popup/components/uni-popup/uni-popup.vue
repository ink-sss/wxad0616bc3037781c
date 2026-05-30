<template>
  <view v-if="visible" class="uni-popup" @tap="onMaskClick">
    <view class="uni-popup__mask" />
    <view :class="['uni-popup__content', 'uni-popup__content--' + type]" @tap.stop><slot /></view>
  </view>
</template>
<script>
export default {
  name: 'UniPopup',
  props: { type: { type: String, default: 'center' }, maskClick: { type: Boolean, default: true }, isMaskClick: { type: Boolean, default: true } },
  emits: ['change', 'maskClick'],
  data() { return { visible: false }; },
  methods: {
    open() { this.visible = true; this.$emit('change', { show: true, type: this.type }); },
    close() { this.visible = false; this.$emit('change', { show: false, type: this.type }); },
    onMaskClick() { if (this.maskClick || this.isMaskClick) { this.$emit('maskClick'); this.close(); } }
  }
};
</script>
<style scoped>
.uni-popup { position: fixed; inset: 0; z-index: 999; }
.uni-popup__mask { position: absolute; inset: 0; background: rgba(0,0,0,.45); }
.uni-popup__content { position: absolute; z-index: 1; box-sizing: border-box; }
.uni-popup__content--center { left: 50%; top: 50%; transform: translate(-50%, -50%); }
.uni-popup__content--bottom { left: 0; right: 0; bottom: 0; }
.uni-popup__content--top { left: 0; right: 0; top: 0; }
</style>
