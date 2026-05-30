<template>
  <view v-if="show" class="uni-notice-bar" :style="barStyle" @tap="$emit('click')">
    <uni-icons v-if="showIcon" type="info" :color="color" :size="18" />
    <view class="uni-notice-bar__content"><text>{{ text }}</text><slot /></view>
    <uni-icons v-if="showClose" type="close" :color="color" :size="18" @click.stop="close" />
  </view>
</template>
<script>
import UniIcons from '../../../uni-icons/components/uni-icons/uni-icons.vue';
export default {
  name: 'UniNoticeBar',
  components: { UniIcons },
  props: { text: { type: String, default: '' }, color: { type: String, default: '#ed6a0c' }, backgroundColor: { type: String, default: '#fffbe8' }, showIcon: Boolean, showClose: Boolean, scrollable: Boolean, single: Boolean },
  emits: ['click', 'close'],
  data() { return { show: true }; },
  computed: { barStyle() { return { color: this.color, backgroundColor: this.backgroundColor }; } },
  methods: { close() { this.show = false; this.$emit('close'); } }
};
</script>
<style scoped>
.uni-notice-bar { min-height: 72rpx; padding: 0 24rpx; display: flex; align-items: center; gap: 12rpx; font-size: 26rpx; box-sizing: border-box; }
.uni-notice-bar__content { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
</style>
