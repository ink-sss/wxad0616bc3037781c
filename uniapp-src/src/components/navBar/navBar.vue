<template>
  <view><scroll-view scroll-y class="scroll" @scroll="scrollChnage"><view :class="['navbar-section', isFixed ? 'navbar-fixed-section' : '']"><ss-scroll-navbar :tab-current-index="currentIndex" :scroll-change-index="currentI" :nav-arr="navList" :color="color" :active-text="activeText" :option-type="optionType" :active-color-f="activeColorF" :active-color-s="activeColorS" :default-color="defaultColor" :margin-right="marginRight" @navbarTap="navbarTapHandler" /></view></scroll-view></view>
</template>
<script>
import SsScrollNavbar from './scroll-navbar.vue';
export default {
  name: 'NavBar',
  components: { SsScrollNavbar },
  props: ['currentI', 'navList', 'color', 'activeText', 'optionType', 'activeColorF', 'activeColorS', 'defaultColor', 'marginRight'],
  emits: ['currentIndex'],
  data() { return { currentIndex: 0, isFixed: false, topHeight: 0 }; },
  watch: { currentI(value) { this.navbarTapHandler(value); } },
  mounted() { this.calculateTopSectionHeight(); },
  methods: { navbarTapHandler(index) { this.currentIndex = index || 0; this.$emit('currentIndex', this.currentIndex); }, scrollChnage(e) { this.isFixed = (e?.detail?.scrollTop || 0) >= this.topHeight; }, calculateTopSectionHeight() { uni.createSelectorQuery().in(this).select('.top-section').fields({ size: true }, (res) => { this.topHeight = res?.height || 0; }).exec(); } }
};
</script>
<style scoped>
.scroll { width: 100%; }
.navbar-fixed-section { position: sticky; top: 0; z-index: 20; background: #fff; }
</style>
