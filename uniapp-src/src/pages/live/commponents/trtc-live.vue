<template>
  <view class="trtc-live">
    <view v-for="player in playerList" :key="player.streamID" class="remote-player">
      <live-player
        class="player-box"
        :id="player.streamID"
        :src="player.src"
        :mode="player.mode || 'RTC'"
        :autoplay="player.autoplay !== false"
        :mute-audio="player.muteAudio"
        :mute-video="player.muteVideo"
        :orientation="player.orientation"
        :object-fit="player.objectFit || 'fillCrop'"
        @statechange="playerEventHandler"
        @netstatus="playerNetStatus"
        @fullscreenchange="playerFullscreenChange"
        @audiovolumenotify="playerAudioVolumeNotify"
      />
    </view>
    <live-pusher
      class="player-box local-pusher"
      :url="pusher.url"
      :mode="pusher.mode || 'RTC'"
      :autopush="pusher.autopush"
      :enable-camera="pusher.enableCamera"
      :enable-mic="pusher.enableMic"
      :beauty="pusher.beautyLevel || pusher.beauty"
      @statechange="pusherEventHandler"
      @netstatus="pusherNetStatus"
      @error="pusherErrorHandler"
      @bgmstart="pusherBGMStartHandler"
      @bgmprogress="pusherBGMProgressHandler"
      @bgmcomplete="pusherBGMCompleteHandler"
      @audiovolumenotify="pusherAudioVolumeNotify"
    />
    <view class="tools">
      <button class="tool" size="mini" @tap="toggleCamera">{{ pusher.enableCamera ? '关摄像头' : '开摄像头' }}</button>
      <button class="tool" size="mini" @tap="switchCamera">切换镜头</button>
      <button class="tool warn" size="mini" @tap="closeLm(true)">退出连麦</button>
    </view>
  </view>
</template>

<script>
import { callTrtc, createLivePusherContext } from '../../../platform/weixin/live.js'
import { getWeixinApi } from '../../../platform/weixin/runtime.js'
import { requestWithVm } from '../page-tools.js'

export default {
  props: {
    liveId: {
      type: [Number, String],
      default: '',
    },
  },
  emits: ['closeLm'],
  data() {
    return {
      trtc: null,
      pusherContext: null,
      playerList: [],
      pusher: {
        enableCamera: true,
        enableMic: true,
        beautyLevel: 9,
        autopush: true,
        mode: 'RTC',
      },
      trtcUser: {},
    }
  },
  mounted() {
    this.pusherContext = createLivePusherContext(this)
    this.createTrtcInstance()
    this.getTrtcData()
  },
  beforeUnmount() {
    this.exitRoom()
  },
  methods: {
    createTrtcInstance() {
      const app = getApp()
      const weixinApi = getWeixinApi()
      const TrtcCtor =
        (typeof TRTC !== 'undefined' && TRTC) ||
        (app && app.globalData && app.globalData.TRTC) ||
        (weixinApi && weixinApi.TRTC)
      if (!TrtcCtor) {
        // TODO:migration Wire the project TRTC SDK package once dependency ownership is finalized.
        return
      }
      this.trtc = new TrtcCtor(this)
      this.bindTrtcEvents()
      if (typeof this.trtc.createPusher === 'function') {
        this.pusher = { ...this.pusher, ...this.trtc.createPusher() }
      }
    },
    getTrtcData() {
      if (!this.liveId) return
      requestWithVm(this, '_post', 'live.trtc/getTrtcUserData', { live_id: this.liveId })
        .then((res) => {
          this.trtcUser = res.data || {}
          this.enterRoom()
        })
        .catch((error) => console.warn('[live] getTrtcUserData failed', error))
    },
    enterRoom() {
      if (!this.trtc) return
      const options = {
        userID: this.trtcUser.userId,
        sdkAppID: this.trtcUser.sdkAppID,
        userSig: this.trtcUser.userSigTencent,
        strRoomID: String(this.liveId),
        enableMic: true,
        enableCamera: false,
        beautyLevel: 9,
        scene: 'live',
      }
      const pusher = this.trtc.enterRoom(options)
      if (pusher) this.pusher = { ...this.pusher, ...pusher }
      const instance = this.trtc.getPusherInstance && this.trtc.getPusherInstance()
      if (instance && typeof instance.start === 'function') instance.start()
    },
    bindTrtcEvents() {
      if (!this.trtc || typeof this.trtc.on !== 'function') return
      const events = this.trtc.EVENT || {}
      this.trtc.on(events.REMOTE_USER_LEAVE, (event) => {
        this.playerList = (event.data && event.data.playerList) || []
      })
      this.trtc.on(events.REMOTE_VIDEO_ADD, (event) => this.setPlayerAttributes(event.data && event.data.player, { muteVideo: false }))
      this.trtc.on(events.REMOTE_VIDEO_REMOVE, (event) => this.setPlayerAttributes(event.data && event.data.player, { muteVideo: true }))
      this.trtc.on(events.REMOTE_AUDIO_ADD, (event) => this.setPlayerAttributes(event.data && event.data.player, { muteAudio: false }))
      this.trtc.on(events.REMOTE_AUDIO_REMOVE, (event) => this.setPlayerAttributes(event.data && event.data.player, { muteAudio: true }))
      this.trtc.on(events.REMOTE_AUDIO_VOLUME_UPDATE, (event) => {
        this.playerList = (event.data && event.data.playerList) || this.playerList
      })
      this.trtc.on(events.KICKED_OUT, () => this.closeLm(false))
      this.trtc.on(events.ERROR, (event) => {
        if (event.data && event.data.code === 10002) {
          uni.showToast({ title: '您当前已禁用麦克风，无法进行连麦', icon: 'none' })
        }
      })
    },
    setPlayerAttributes(player, attrs) {
      if (!player || !this.trtc) return
      const next = this.trtc.setPlayerAttributes(player.streamID, attrs)
      if (Array.isArray(next)) this.playerList = next
    },
    toggleCamera() {
      this.pusher = { ...this.pusher, enableCamera: !this.pusher.enableCamera }
      if (this.trtc && typeof this.trtc.setPusherAttributes === 'function') {
        this.pusher = { ...this.pusher, ...this.trtc.setPusherAttributes({ enableCamera: this.pusher.enableCamera }) }
      }
    },
    switchCamera() {
      const instance = this.trtc && this.trtc.getPusherInstance && this.trtc.getPusherInstance()
      if (instance && typeof instance.switchCamera === 'function') {
        instance.switchCamera({})
      }
    },
    closeLm(confirm = true) {
      const doClose = () => {
        requestWithVm(this, '_post', 'live.trtc/userCloseLm', { live_id: this.liveId }).catch(() => {})
        this.exitRoom()
        setTimeout(() => this.$emit('closeLm'), 500)
      }
      if (!confirm) {
        uni.showToast({ title: '您已被主播踢出连麦！', icon: 'none' })
        doClose()
        return
      }
      uni.showModal({
        content: '是否确认退出与主播的连麦！',
        success: (res) => {
          if (res.confirm) doClose()
        },
      })
    },
    exitRoom() {
      callTrtc(this.trtc, 'exitRoom').catch(() => {})
    },
    pusherEventHandler(event) {
      this.trtc && this.trtc.pusherEventHandler && this.trtc.pusherEventHandler(event)
    },
    pusherNetStatus(event) {
      this.trtc && this.trtc.pusherNetStatusHandler && this.trtc.pusherNetStatusHandler(event)
    },
    pusherErrorHandler(event) {
      this.trtc && this.trtc.pusherErrorHandler && this.trtc.pusherErrorHandler(event)
    },
    pusherBGMStartHandler(event) {
      this.trtc && this.trtc.pusherBGMStartHandler && this.trtc.pusherBGMStartHandler(event)
    },
    pusherBGMProgressHandler(event) {
      this.trtc && this.trtc.pusherBGMProgressHandler && this.trtc.pusherBGMProgressHandler(event)
    },
    pusherBGMCompleteHandler(event) {
      this.trtc && this.trtc.pusherBGMCompleteHandler && this.trtc.pusherBGMCompleteHandler(event)
    },
    pusherAudioVolumeNotify(event) {
      this.trtc && this.trtc.pusherAudioVolumeNotify && this.trtc.pusherAudioVolumeNotify(event)
    },
    playerEventHandler(event) {
      this.trtc && this.trtc.playerEventHandler && this.trtc.playerEventHandler(event)
    },
    playerFullscreenChange(event) {
      this.trtc && this.trtc.playerFullscreenChange && this.trtc.playerFullscreenChange(event)
    },
    playerNetStatus() {},
    playerAudioVolumeNotify(event) {
      this.trtc && this.trtc.playerAudioVolumeNotify && this.trtc.playerAudioVolumeNotify(event)
    },
  },
}
</script>

<style scoped>
.trtc-live { position: relative; width: 100%; height: 100%; background: rgba(0, 0, 0, .72); }
.remote-player { position: absolute; right: 20rpx; top: 120rpx; width: 220rpx; height: 300rpx; border-radius: 8rpx; overflow: hidden; background: #111; }
.player-box { width: 100%; height: 100%; }
.local-pusher { position: absolute; inset: 0; }
.tools { position: absolute; left: 20rpx; right: 20rpx; bottom: 140rpx; display: flex; justify-content: center; gap: 12rpx; }
.tool { color: #fff; background: rgba(0, 0, 0, .55); }
.warn { background: #e54d42; }
</style>
