<template>
  <scroll-view class="viewer-list" scroll-y @scrolltolower="loadMore">
    <viewer-list-item v-for="item in list" :key="item.user_id" :item-data="item" :live-id="liveId" @refresh="refresh" />
  </scroll-view>
</template>
<script>
import { requestWithVm } from '../page-tools.js'
import ViewerListItem from './viewer-list-item.vue'
export default {
  components: { ViewerListItem },
  props: { liveId: { type: [Number, String], default: '' } },
  data() { return { list: [], page: 1, finished: false } },
  mounted() { this.loadMore() },
  methods: {
    refresh() { this.page = 1; this.list = []; this.finished = false; this.loadMore() },
    loadMore() {
      if (this.finished) return
      requestWithVm(this, '_post', 'live.roomNew/getLiveMembersList', { live_id: this.liveId, page: this.page }).then((res) => {
        const rows = (((res.data || {}).list || {}).data || res.data || [])
        this.list = this.list.concat(rows)
        this.page += 1
        if (!rows.length) this.finished = true
      }).catch(() => {})
    },
  },
}
</script>
<style scoped>.viewer-list{max-height:620rpx;background:#fff}</style>
