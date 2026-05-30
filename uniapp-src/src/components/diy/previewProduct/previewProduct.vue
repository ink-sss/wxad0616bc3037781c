<template><view class="diy-block" :style="boxStyle"><view class="diy-list"><view v-for="(item, index) in dataList" :key="item.id || item.product_id || index" class="diy-card" @tap="openLink(item.linkUrl || item.link_url)"><image v-if="item.imgUrl || item.image || item.product_image" class="diy-image" :src="item.imgUrl || item.image || item.product_image" mode="aspectFill" lazy-load /><view class="diy-title">{{ item.title || item.name || item.product_name }}</view><view v-if="item.desc || item.summary" class="diy-text">{{ item.desc || item.summary }}</view></view></view><view v-if="!dataList.length" class="diy-text"><!-- TODO:migration: DiyPreviewProduct data shape was compiled-only; validate with backend DIY payload. --></view></view></template>
<script>
export default {
  name: 'DiyPreviewProduct',
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
<style scoped>
.diy-block { width: 100%; box-sizing: border-box; overflow: hidden; }
.diy-list { display: flex; flex-wrap: wrap; gap: 16rpx; }
.diy-card { background: #fff; border-radius: 8rpx; overflow: hidden; }
.diy-image { width: 100%; display: block; }
.diy-title { font-size: 30rpx; color: #222; font-weight: 600; }
.diy-text { font-size: 26rpx; color: #666; line-height: 1.5; }
.diy-price { color: #f03b2f; font-weight: 700; }
</style>
