<template>
  <view class="live-ks">
    <uni-notice-bar
      v-if="notice"
      color="#ffffff"
      background-color="rgba(1,1,1,0.75)"
      :speed="50"
      :scrollable="true"
      :single="true"
      :text="notice"
      more-color="#de8c17"
      more-text="查看更多"
      :show-icon="true"
      :show-close="true"
    />
    <view class="gap" />
    <notice-bar-nvue
      :text="notice"
      :speed="30"
      background-color="rgba(1,1,1,0.75)"
      color="#ffffff"
      :show-close="true"
    />
  </view>
</template>

<script>
import NoticeBarNvue from '../../components/notice-bar-nvue.vue'
import UniNoticeBar from '../../uni_modules/uni-notice-bar/components/uni-notice-bar/uni-notice-bar.vue'

export default {
  components: {
    NoticeBarNvue,
    UniNoticeBar,
  },
  data() {
    return {
      notice: '阿斯卡吉受打，生',
    }
  },
}
</script>

<style scoped>
@import './nvue.wxss';

.live-ks {
  padding-top: 200rpx;
}

.gap {
  height: 10rpx;
}
</style>
