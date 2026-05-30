<template>
  <view :class="['countdown', themeClass]" :data-theme="themeName">
    <block v-if="config && config.type == null">
      <text v-if="status === 0">{{ title }}</text><text v-else-if="status === 1">活动具体时间：</text><text v-else>活动结束时间：</text>
      <text class="box">{{ day }}</text><text class="p-0-10">天</text><text class="box">{{ hour }}</text><text class="p-0-10">:</text><text class="box">{{ minute }}</text><text class="p-0-10">:</text><text class="box">{{ second }}</text>
    </block>
    <text v-else-if="config && config.type === 'text'" :class="config.isWhite ? 'white' : 'dominant'">{{ title }}{{ totalHours }}:{{ minute }}:{{ second }}</text>
  </view>
</template>
<script>
export default {
  name: 'Countdown',
  props: { config: { type: Object, default: () => ({ type: 'all' }) } },
  emits: ['returnVal'],
  data() { return { status: 0, day: '0', hour: '0', minute: '0', second: '0', timer: null, totalSeconds: 0, title: '活动剩余：' }; },
  computed: { totalHours() { return Number(this.day) * 24 + Number(this.hour); }, themeName() { return typeof this.theme === 'function' ? this.theme() : ''; }, themeClass() { return this.themeName || ''; } },
  watch: { config: { deep: true, immediate: true, handler(value) { if (value && value.endstamp) { if (value.title) this.title = value.title; this.setTime(); } } } },
  beforeUnmount() { this.clear(); },
  unmounted() { this.clear(); },
  methods: {
    setTime() { this.clear(); this.init(); this.timer = setInterval(() => this.init(), 1000); },
    init() { const now = Date.now() / 1000; if (now < this.config.startstamp) this.status = 1; else if (now > this.config.endstamp) this.status = 2; else { this.totalSeconds = parseInt(this.config.endstamp - now, 10); this.status = 0; this.countDown(); } this.$emit('returnVal', this.status); },
    countDown() { const total = Math.max(0, this.totalSeconds); const d = Math.floor(total / 86400); let rest = total % 86400; const h = Math.floor(rest / 3600); rest %= 3600; const m = Math.floor(rest / 60); const s = rest % 60; this.day = this.two(d); this.hour = this.two(h); this.minute = this.two(m); this.second = this.two(s); },
    two(value) { return value < 10 ? '0' + value : String(value); },
    clear() { if (this.timer) clearInterval(this.timer); this.timer = null; }
  }
};
</script>
<style scoped>
.countdown { display: inline-flex; align-items: center; font-size: 24rpx; }
.box { min-width: 38rpx; height: 38rpx; line-height: 38rpx; text-align: center; border-radius: 4rpx; background: #333; color: #fff; margin: 0 4rpx; }
.white { color: #fff; }
.dominant { color: #333; }
</style>
