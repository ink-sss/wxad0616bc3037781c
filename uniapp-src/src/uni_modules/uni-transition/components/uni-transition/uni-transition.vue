<template>
  <view v-show="show" :class="['uni-transition', customClass]" :style="styles"><slot /></view>
</template>
<script>
export default {
  name: 'UniTransition',
  props: { show: { type: Boolean, default: false }, modeClass: { type: [String, Array], default: '' }, customClass: { type: String, default: '' }, styles: { type: [String, Object], default: '' }, duration: { type: Number, default: 300 } },
  emits: ['click', 'change']
};
</script>
<style scoped>
.uni-transition { transition-property: opacity, transform; transition-duration: .3s; }
</style>
