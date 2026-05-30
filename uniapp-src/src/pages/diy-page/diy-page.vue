<template>
  <view class="diy-page">
    <diy :diy-items="items" @scanQrcode="scanQrcode" />
    <mp-share :is-mp-share="isMpShare" @close="closeBottmpanel" />
    <app-share :is-app-share="isAppShare" :app-params="appParams" @close="closeAppShare" />
  </view>
</template>

<script>
import Diy from '../../components/diy/diy.vue'
import MpShare from '../../components/mp-share.vue'
import AppShare from '../../components/app-share.vue'
import { scanQrCode } from '../../platform/weixin/scan'

export default {
  components: {
    Diy,
    MpShare,
    AppShare
  },
  data() {
    return {
      page_id: null,
      items: [],
      page_info: { params: {}, style: {} },
      isMpShare: false,
      isAppShare: false,
      appParams: {
        title: '',
        summary: '',
        path: ''
      },
      url: ''
    }
  },
  onLoad(query = {}) {
    this.page_id = query.page_id
    this.getData()
  },
  onShareAppMessage() {
    return {
      title: (this.page_info.params && this.page_info.params.name) || '自定义页面',
      path: '/pages/diy-page/diy-page?' + this.shareParams({ page_id: this.page_id })
    }
  },
  methods: {
    shareParams(extra = {}) {
      if (typeof this.getShareUrlParams === 'function') return this.getShareUrlParams(extra)
      return Object.keys(extra).map((key) => `${key}=${extra[key]}`).join('&')
    },
    hasPage() {
      return typeof getCurrentPages === 'function' && getCurrentPages().length > 1
    },
    goback() {
      uni.navigateBack()
    },
    getData() {
      if (typeof this._get !== 'function') {
        // TODO:migration: DIY page needs shared _get runtime.
        return
      }
      this._get('index/diy', {
        page_id: this.page_id,
        url: this.url
      }, (res) => {
        const data = res.data || {}
        this.page_info = data.page || this.page_info
        this.items = data.items || []
        this.setPage(this.page_info)
      })
    },
    setPage(page) {
      const params = page.params || {}
      const style = page.style || {}
      uni.setNavigationBarTitle({ title: params.name || '自定义页面' })
      uni.setNavigationBarColor({
        frontColor: style.titleTextColor === 'white' ? '#ffffff' : '#000000',
        backgroundColor: style.titleBackgroundColor || '#ffffff'
      })
    },
    closeBottmpanel() {
      this.isMpShare = false
    },
    closeAppShare() {
      this.isAppShare = false
    },
    async scanQrcode() {
      try {
        const result = await scanQrCode()
        const url = '/pages/store/clerkorder?order_no=' + encodeURIComponent(result.result || '')
        if (typeof this.gotoPage === 'function') this.gotoPage(url)
        else uni.navigateTo({ url })
      } catch (error) {
        uni.showToast({ title: '扫码失败，请重试', icon: 'none' })
      }
    }
  }
}
</script>

<style scoped>
.diy-page { min-height: 100vh; background: #f5f5f5; }
</style>
