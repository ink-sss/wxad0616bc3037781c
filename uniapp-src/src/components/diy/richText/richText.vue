<template><view class="diy-block" :style="boxStyle"><rich-text :nodes="params.content || itemData.content || ''" /></view></template>
<script>
export default {
  name: 'DiyRichText',
  props: { itemData: { type: Object, default: () => ({}) }, userInfo: { type: Object, default: () => ({}) }, storeInfo: { type: Object, default: () => ({}) }, diytop: { type: [Number, String], default: 0 } },
  emits: ['setIndex', 'parentFunc', 'scanQrcode', 'bg'],
  computed: {
    dataList() { return Array.isArray(this.itemData.data) ? this.itemData.data : (this.itemData.data ? [this.itemData.data] : []); },
    styleConfig() { return this.itemData.style || {}; },
    params() { return this.itemData.params || {}; },
    boxStyle() { const s = this.styleConfig; return { background: s.background || s.bgcolor || '', paddingTop: this.toRpx(s.paddingTop), paddingBottom: this.toRpx(s.paddingBottom), paddingLeft: this.toRpx(s.paddingLeft), paddingRight: this.toRpx(s.paddingLeft) }; }
  },
  methods: { toRpx(v) { return v === undefined || v === '' ? '' : (String(v).includes('rpx') || String(v).includes('px') ? String(v) : (Number(v) * 2 || 0) + 'rpx'); }, openLink(url) { if (!url) return; if (typeof this.gotoPage === 'function') this.gotoPage(url); else uni.navigateTo({ url: url.startsWith('/') ? url : '/' + url }); } }
};
</script>
