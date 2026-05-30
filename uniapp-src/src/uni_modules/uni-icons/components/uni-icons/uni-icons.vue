<template>
  <text class="uni-icons" :style="iconStyle" @tap="$emit('click', $event)">{{ glyph }}</text>
</template>
<script>
const ICONS = {
  right: '\ue470', left: '\ue471', up: '\ue472', down: '\ue473', close: '\ue460', checkmarkempty: '\ue472', search: '\ue466', clear: '\ue434', info: '\ue504'
};
export default {
  name: 'UniIcons',
  props: { type: { type: String, default: '' }, color: { type: String, default: '#333' }, size: { type: [Number, String], default: 24 }, customPrefix: { type: String, default: '' } },
  emits: ['click'],
  computed: {
    glyph() { return ICONS[this.type] || ''; },
    iconStyle() { return { color: this.color, fontSize: this.size + 'px' }; }
  }
};
</script>
<style scoped>
.uni-icons { display: inline-flex; align-items: center; justify-content: center; line-height: 1; }
</style>
