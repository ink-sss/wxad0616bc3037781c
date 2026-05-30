<template>
  <view :class="['bottom-panel', visible ? 'open' : 'close']" @tap="closePopup">
    <view class="popup-bg">
      <view class="wechat-box"><image mode="widthFix" lazy-load :src="shareImage"></image></view>
    </view>
  </view>
</template>
<script>
export default {
  name: 'MpShare',
  props: { isMpShare: Boolean },
  emits: ['close'],
  data() { return { visible: false }; },
  computed: { shareImage() { return (this.config?.pic_url || '') + '/static/share.png'; } },
  watch: { isMpShare: { immediate: true, handler(value) { this.visible = !!value; } } },
  methods: { closePopup() { this.visible = false; this.$emit('close'); } }
};
</script>
<style scoped>
.bottom-panel { display: none; }
.bottom-panel.open { display: block; }
.popup-bg { background: rgba(0,0,0,.6); bottom: 0; left: 0; position: fixed; right: 0; top: 0; z-index: 98; }
.wechat-box { padding-top: var(--window-top); }
.wechat-box image { width: 100%; }
</style>
