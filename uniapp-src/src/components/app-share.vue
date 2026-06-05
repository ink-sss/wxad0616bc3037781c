<template>
  <view v-if="visible" :class="['bottom-panel', visible ? 'open' : 'close']" @tap="closePopup">
    <view class="content" @tap.stop>
      <view class="module-box module-share">
        <view class="hd d-c-c">分享</view>
        <view class="p30 box-s-b">
          <view class="d-c-c">
            <view class="item flex-1 d-c-c d-c">
              <button open-type="share" @tap="share(0, 'WXSceneSession')">
                <view class="icon-box d-c-c share-friend"><text class="iconfont icon-fenxiang"></text></view>
                <text class="pt20">微信好友</text>
              </button>
            </view>
            <view class="item flex-1 d-c-c d-c">
              <button @tap="share(0, 'WXSenceTimeline')">
                <view class="icon-box d-c-c"><text class="iconfont icon-edit"></text></view>
                <text class="pt20">微信朋友圈</text>
              </button>
            </view>
          </view>
        </view>
        <view class="btns"><button type="default" @tap="closePopup">取消</button></view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  name: 'AppShare',
  props: { isAppShare: Boolean, appParams: { type: Object, default: () => ({}) } },
  emits: ['close'],
  data() { return { visible: false, shareConfig: {}, logo: '' }; },
  watch: { isAppShare: { immediate: true, handler(value) { this.visible = !!value; } } },
  created() { this.getData(); },
  methods: {
    getData() {
      if (typeof this._get !== 'function') return;
      this._get('settings/appShare', {}, (res) => {
        this.shareConfig = res?.data?.appshare || {};
        this.logo = res?.data?.logo || '';
      });
    },
    closePopup() { this.visible = false; this.$emit('close'); },
    share(type, scene) {
      const params = this.appParams || {};
      const config = this.shareConfig || {};
      const payload = { provider: 'weixin', scene, type, title: params.title || '', summary: params.summary || '', imageUrl: params.image || this.logo };
      if (config.type === 2) {
        payload.scene = 'WXSceneSession';
        payload.type = 5;
        payload.miniProgram = { id: config.gh_id, path: params.path || '', webUrl: config.web_url, type: 0 };
      } else if (config.type === 1 && config.open_site) {
        payload.href = config.open_site + (params.path || '');
      } else if (config.down_url) {
        payload.href = config.down_url;
      }
      if (typeof uni.share === 'function') uni.share(payload);
      else this.$emit('close');
    }
  }
};
</script>
<style scoped>
.bottom-panel { position: fixed; inset: 0; z-index: 102; pointer-events: none; }
.bottom-panel::before { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,.6); display: none; }
.bottom-panel.open { pointer-events: auto; }
.bottom-panel.open::before { display: block; }
.content { background-color: #fff; border-radius: 25rpx 25rpx 0 0; bottom: env(safe-area-inset-bottom); min-height: 200rpx; position: fixed; transform: translate3d(0,980rpx,0); transition: transform .2s cubic-bezier(0,0,.25,1); width: 100%; z-index: 103; }
.bottom-panel.open .content { transform: translateZ(0); }
.module-share .hd { font-size: 36rpx; height: 90rpx; line-height: 90rpx; }
.module-share .item button, .module-share .item button::after { background: none; border: none; line-height: 1; padding: 0; }
.icon-box { background: #f6bd1d; border-radius: 50%; height: 104rpx; width: 104rpx; }
.icon-box .iconfont { color: #fff; font-size: 42rpx; }
.share-friend { background: #04be01; }
.btns { margin-top: 30rpx; }
.btns button { background: #f2f2f2; border-radius: 88rpx; font-size: 28rpx; height: 88rpx; line-height: 88rpx; margin: 0 auto 30rpx; width: 674rpx; }
</style>
