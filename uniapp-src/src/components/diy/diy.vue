<template>
  <view class="diy-container">
    <block v-for="(item, index) in diyItems" :key="item.id || item.type || index">
      <diy-option v-if="item.type === 'option'" :item-data="item" @setIndex="setIndex" />
      <diy-top-merge v-else-if="item.type === 'topMerge'" :item-data="item" :diytop="diytop" @parentFunc="parentFunc" @setIndex="setIndex" />
        <diy-search v-else-if="item.type === 'search'" :item-data="item" :diytop="diytop" />
      <diy-surface v-else-if="item.type === 'surface'" :item-data="item" :diytop="diytop" />
    </block>

    <view v-if="thisindex === 0">
      <block v-for="(item, index) in diyItems" :key="'body-' + (item.id || item.type || index)">
        <diy-banner v-if="item.type === 'banner' && item.data" :item-data="item" />
        <diy-imagesingle v-else-if="item.type === 'imageSingle' && item.data" :item-data="item" />
        <diy-window v-else-if="item.type === 'window' && item.data" :item-data="item" />
        <diy-videos v-else-if="item.type === 'video'" :item-data="item" />
        <diy-article v-else-if="item.type === 'article' && item.data" :item-data="item" />
        <diy-special v-else-if="item.type === 'special' && item.data" :item-data="item" />
        <diy-notice v-else-if="item.type === 'notice' && item.data" :item-data="item" />
        <diy-title v-else-if="item.type === 'title' && item.data" :item-data="item" />
        <diy-nav-bar v-else-if="item.type === 'navBar' && item.data" :item-data="item" />
        <diy-product v-else-if="item.type === 'product' && item.data" :item-data="item" />
        <diy-coupon v-else-if="item.type === 'coupon' && item.data" :item-data="item" />
        <diy-service v-else-if="item.type === 'service' && item.data" :item-data="item" />
        <diy-shipin-live v-else-if="item.type === 'videoLive' || item.type === 'shipinLive'" ref="shipinLiveRef" :item-data="item" />
        <diy-rich-text v-else-if="item.type === 'richText'" :item-data="item" />
        <diy-blank v-else-if="item.type === 'blank'" :item-data="item" />
        <diy-guide v-else-if="item.type === 'guide'" :item-data="item" />
        <diy-seckill-product v-else-if="item.type === 'seckillProduct'" :item-data="item" />
        <diy-preview-product v-else-if="item.type === 'previewProduct'" :item-data="item" />
        <diy-assemble-product v-else-if="item.type === 'assembleProduct'" :item-data="item" />
        <diy-bargain-product v-else-if="item.type === 'bargainProduct'" :item-data="item" />
        <diy-live v-else-if="item.type === 'live'" :item-data="item" />
        <block v-else-if="item.type === 'base' || item.type === 'userBase'">
          <diy-base :item-data="item" :user-info="userInfo" @scanQrcode="scanQrcode" @bg="bg"><slot /></diy-base>
          <diy-store v-if="item.type === 'base' && storeInfo" :item-data="item" :store-info="storeInfo" />
        </block>
        <diy-store v-else-if="item.type === 'store' && storeInfo" :item-data="item" :store-info="storeInfo" />
        <diy-order v-else-if="item.type === 'order'" :item-data="item" :user-info="userInfo" />
        <view v-else-if="item.type" class="diy-unsupported"><!-- TODO:migration: unsupported DIY type {{ item.type }} requires product-specific source recovery. --></view>
      </block>
    </view>

    <view v-else class="nav-product">
      <diy-product v-if="listData.length" :item-data="defaultProductItem" />
      <view v-if="!listData.length && no_more" class="d-c-c p30"><text class="iconfont icon-wushuju"></text><text class="cont">亲，暂无相关记录哦</text></view>
      <uni-load-more v-else :status="loadingType === 1 ? 'loading' : loadingType === 2 ? 'noMore' : 'more'" />
    </view>
  </view>
</template>
<script>
import DiyArticle from './article/article.vue';
import DiyAssembleProduct from './assembleProduct/assembleProduct.vue';
import DiyBanner from './banner/banner.vue';
import DiyBargainProduct from './bargainProduct/bargainProduct.vue';
import DiyBase from './base/base.vue';
import DiyBlank from './blank/blank.vue';
import DiyCoupon from './coupon/coupon.vue';
import DiyGuide from './guide/guide.vue';
import DiyImagesingle from './imagesingle/imagesingle.vue';
import DiyLive from './live/live.vue';
import DiyNavBar from './navBar/navBar.vue';
import DiyNotice from './notice/notice.vue';
import DiyOption from './option/option.vue';
import DiyOrder from './order/order.vue';
import DiyPreviewProduct from './previewProduct/previewProduct.vue';
import DiyProduct from './product/product.vue';
import DiyRichText from './richText/richText.vue';
import DiySearch from './search/search.vue';
import DiySeckillProduct from './seckillProduct/seckillProduct.vue';
import DiyService from './service/service.vue';
import DiyShipinLive from './shipinLive/shipinLive.vue';
import DiySpecial from './special/special.vue';
import DiyStore from './store/store.vue';
import DiySurface from './surface/surface.vue';
import DiyTitle from './title/title.vue';
import DiyTopMerge from './topMerge/topMerge.vue';
import DiyVideos from './videos/videos.vue';
import DiyWindow from './window/window.vue';
import { fetchProducts, normalizeProductList } from '../../services/miniprogram-products.js';
import { defaultHomeData } from '../../utils/default-style-data.js';

function getDefaultProductItem() {
  const items = defaultHomeData().items || {}
  return Object.keys(items)
    .map((key) => items[key])
    .find((item) => item && item.type === 'product') || { type: 'product', data: [] }
}

export default {
  name: 'Diy',
  components: { DiyArticle, DiyAssembleProduct, DiyBanner, DiyBargainProduct, DiyBase, DiyBlank, DiyCoupon, DiyGuide, DiyImagesingle, DiyLive, DiyNavBar, DiyNotice, DiyOption, DiyOrder, DiyPreviewProduct, DiyProduct, DiyRichText, DiySearch, DiySeckillProduct, DiyService, DiyShipinLive, DiySpecial, DiyStore, DiySurface, DiyTitle, DiyTopMerge, DiyVideos, DiyWindow },
  props: ['diyItems', 'userInfo', 'serviceUserId', 'diytop', 'storeInfo'],
  emits: ['scanQrcode', 'stopPush', 'getData', 'bg', 'openSearch'],
  data() { return { thisindex: 0, category_id: '', listData: [], page: 1, last_page: 0, no_more: false, loading: true, defaultProductsLoaded: false }; },
  computed: {
    loadingType() { return this.loading ? 1 : this.listData.length && this.no_more ? 2 : 0; },
    scrolltop() { const value = 80 - 2 * (this.diytop || 0); return value <= 0 ? 0 : value; },
    defaultProductItem() {
      return {
        ...getDefaultProductItem(),
        data: this.listData
      }
    }
  },
  watch: {
    diyItems: {
      handler() {
        this.loadDefaultProducts();
      },
      immediate: true
    }
  },
  methods: {
    scanQrcode() { this.$emit('scanQrcode'); },
    loadinData() { this.$nextTick(() => { const ref = Array.isArray(this.$refs.shipinLiveRef) ? this.$refs.shipinLiveRef[0] : this.$refs.shipinLiveRef; if (ref?.getData) ref.getData(); }); },
    parentFunc(payload) { if (payload?.name) this.$emit(payload.name, payload.value); },
    setIndex(index, categoryId) { this.thisindex = index; const next = categoryId || 0; if (this.category_id !== next) { this.category_id = next; this.initProduct(); } },
    shouldLoadDefaultProducts() { return !this.defaultProductsLoaded && this.thisindex === 0 && Array.isArray(this.diyItems) && this.diyItems.some((item) => item && item.type === 'product' && Array.isArray(item.data) && item.data.length === 0); },
    loadDefaultProducts() { if (!this.shouldLoadDefaultProducts()) return; this.defaultProductsLoaded = true; this.thisindex = 1; this.initProduct(); },
    getProduct() { this.loading = true; fetchProducts({ page: this.page || 1, categoryId: this.category_id || '', search: '', sortType: 'all', sortPrice: 0, pageSize: 20 }).then((data) => { const list = normalizeProductList(data || {}, 20); this.listData = this.listData.concat(list.data || []); this.last_page = list.last_page || 0; if (this.last_page <= 1 || this.page >= 9 || this.page >= this.last_page) this.no_more = true; }).catch(() => { this.no_more = true; }).finally(() => { this.loading = false; this.$emit('stopPush'); }); },
    pullDown() { if (this.thisindex !== 0) this.initProduct(); else this.$emit('getData'); },
    initProduct() { if (this.thisindex === 0) return; this.listData = []; this.page = 1; this.no_more = false; this.getProduct(); },
    scrolltolowerFunc() { if (this.thisindex === 0 || this.no_more) return; if (this.page < this.last_page) { this.page += 1; this.getProduct(); return; } this.no_more = true; },
    bg(value) { this.$emit('bg', value); },
    gotoProduct(productId) { if (typeof this.gotoPage === 'function') this.gotoPage('pages/product/detail/detail?product_id=' + productId); }
  }
};
</script>
<style scoped>
.diy-container { width: 100%; }
.nav-product { width: 750rpx; }
.diy-unsupported { display: none; }
</style>
