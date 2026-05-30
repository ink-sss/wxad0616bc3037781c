<template>
  <scroll-view class="invite-record" scroll-y @scrolltolower="loadMore">
    <view v-for="item in list" :key="item.id || item.user_id" class="row">{{ item.nickname || item.name || item.user_id }}</view>
  </scroll-view>
</template>
<script>
import { requestWithVm } from '../page-tools.js'
export default {
  props: { liveId: { type: [Number, String], default: '' } },
  data() { return { list: [], page: 1, finished: false } },
  mounted() { this.loadMore() },
  methods: {
    loadMore() {
      if (this.finished) return
      requestWithVm(this, '_post', 'live.liveMember/lists', { live_id: this.liveId, page: this.page }).then((res) => {
        const rows = (((res.data || {}).list || {}).data || res.data || [])
        this.list = this.list.concat(rows)
        this.page += 1
        if (!rows.length) this.finished = true
      }).catch(() => {})
    },
  },
}
</script>
<style scoped>.invite-record{max-height:520rpx;background:#fff;color:#333}.row{padding:18rpx;border-bottom:1px solid #eee;font-size:26rpx}</style>
