<template>
  <view v-if="visible" :class="['bottom-panel', visible ? 'open' : 'close']" @tap="closePopup">
    <view class="popup-bg"></view>
    <view class="content" @tap.stop>
      <view class="module-box module-share">
        <view class="hd d-c-c">
          <text>基础服务</text>
          <text class="iconfont icon-guanbi" @tap.stop="closePopup"></text>
        </view>
        <scroll-view scroll-y style="height:600rpx;min-height:300rpx">
          <view v-for="(item, index) in serviceList" :key="index" class="service-item">
            <view class="d-s-s">
              <view><view class="icon iconfont icon-tijiaochenggong"></view></view>
              <view class="ml30 flex-1">
                <view class="f26 gray3 mb10">{{ item.name }}</view>
                <view class="f22 gray9">{{ item.describe }}</view>
              </view>
            </view>
          </view>
          <view v-if="serviceList.length === 0" class="empty-service">暂无服务说明</view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Guarantee',
  props: {
    isguarantee: {
      type: Boolean,
      default: false
    },
    server: {
      type: [Array, String],
      default: () => []
    }
  },
  emits: ['close'],
  data() {
    return {
      visible: false
    }
  },
  computed: {
    serviceList() {
      return Array.isArray(this.server) ? this.server : []
    }
  },
  watch: {
    isguarantee: {
      immediate: true,
      handler(value) {
        this.visible = !!value
      }
    }
  },
  methods: {
    closePopup() {
      this.visible = false
      this.$emit('close', { type: 1 })
    }
  }
}
</script>

<style scoped>
.bottom-panel { position: fixed; inset: 0; z-index: 82; pointer-events: none; opacity: 0; transition: opacity .2s; }
.bottom-panel.open { pointer-events: auto; opacity: 1; }
.bottom-panel.close .popup-bg { display: none; }
.popup-bg { position: absolute; inset: 0; background: rgba(0,0,0,.6); }
.content { position: absolute; left: 50%; top: 20vh; width: 80%; max-height: 900rpx; min-height: 200rpx; transform: translate(-50%, 1980rpx); transition: transform .2s cubic-bezier(0,0,.25,1); border-radius: 12rpx; background: #fff; overflow: hidden; }
.bottom-panel.open .content { transform: translate(-50%, 0); }
.hd { position: relative; height: 90rpx; font-size: 36rpx; line-height: 90rpx; font-weight: 700; }
.d-c-c { display: flex; align-items: center; justify-content: center; }
.d-s-s { display: flex; align-items: flex-start; justify-content: flex-start; }
.flex-1 { flex: 1; min-width: 0; }
.service-item { padding: 30rpx; box-sizing: border-box; }
.ml30 { margin-left: 30rpx; }
.mb10 { margin-bottom: 10rpx; }
.f26 { font-size: 26rpx; }
.f22 { font-size: 22rpx; }
.gray3 { color: #333; }
.gray9 { color: #999; }
.icon-tijiaochenggong { border: 1rpx solid #f63; border-radius: 50%; color: #f63; flex-shrink: 0; font-size: 20rpx; height: 28rpx; line-height: 28rpx; margin-top: 7rpx; text-align: center; width: 28rpx; }
.iconfont.icon-guanbi { position: absolute; right: 20rpx; top: 0; color: #999; font-size: 32rpx; }
.empty-service { padding: 80rpx 30rpx; color: #999; font-size: 26rpx; text-align: center; }
</style>
