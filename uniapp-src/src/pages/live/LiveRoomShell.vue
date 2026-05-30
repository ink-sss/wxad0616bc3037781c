<template>
  <view v-if="pageReady" :class="isHorizontal ? 'look-box' : 'h5-live-container'">
    <template v-if="isHorizontal">
      <live-title :detail="liveDetail" />
      <view class="live-box">
        <view v-if="noticeText" class="marquee-tips" @tap="openNotice">
          <view class="tips-title">广播：</view>
          <view class="marquee-container">
            <uni-notice-bar
              class="marquee-text"
              color="#ffffff"
              background-color="transparent"
              :scrollable="true"
              :single="true"
              :text="noticeText"
            />
          </view>
          <view class="notice-more">&gt;</view>
        </view>
        <coupon-claim v-if="showCouponClaim" class="coupon-claim-horizontal" :coupon-id="liveDetail.coupon_id" />
        <view v-if="showPlayer" class="live-video">
          <live-player
            v-if="useLivePlayer"
            id="live-video"
            class="live-video"
            :src="streamUrl"
            autoplay
            controls
            object-fit="contain"
            mode="live"
            :min-cache="0.2"
            :max-cache="0.8"
            picture-in-picture-mode="push, pop"
            picture-in-picture-init-position="right,20"
            @statechange="onLiveStateChange"
            @netstatus="onNetStatus"
            @fullscreenchange="onFullscreenChange"
            @tap="toggleControls"
          >
            <view />
            <view v-if="showControls" class="live-utils">
              <view class="bottom-control">
                <view />
                <view :class="['utils-right', fullscreen ? 'bottom-h-qp' : 'bottom-h-bz']">
                  <image
                    v-if="!fullscreen"
                    class="full-screen"
                    mode="widthFix"
                    src="https://weilive.yukelive.com/static/live/full-screen.png"
                    @tap.stop="requestFullscreen"
                  />
                  <image
                    v-else
                    class="full-screen-qp"
                    mode="widthFix"
                    src="https://weilive.yukelive.com/static/live/full-screen-exit.png"
                    @tap.stop="exitFullscreen"
                  />
                </view>
              </view>
            </view>
          </live-player>
          <video
            v-else
            class="live-video"
            :src="streamUrl"
            autoplay
            controls
            :loop="true"
            object-fit="contain"
            :initial-time="replayInitialTime"
            :enable-progress-gesture="true"
            @ended="onVideoEnded"
            @timeupdate="onVideoTimeUpdate"
          />
        </view>
        <view v-else-if="coverImage" class="cover-img-view">
          <image class="cover-img" mode="heightFix" :src="coverImage" />
        </view>
        <subscribe ref="sbRef" />
        <wait-countdown
          v-if="isWaiting"
          :class="waitCountdownClass"
          :end-time="liveDetail.start_time || liveDetail.initial_time"
          @countdownEnd="refreshRoom"
        />
      </view>

      <view v-if="isEnded" class="live-end">
        <image class="live-end-img" src="https://weilive.yukelive.com/static/xiuxi (1).png" />
        <view class="live-end-text">本场次已结束</view>
        <bottom-option
          class="bottom-option"
          :live-id="liveId"
          @sendBarrage="sendBarrage"
          @clearScreen="clearScreen"
          @goShop="openShopList"
        />
      </view>
      <view v-else-if="noPermissionText" class="live-end">
        <people-number :live-id="liveId" :online-number="onlineNumber" @goShop="openShopList" />
        <image class="live-end-img" src="https://weilive.yukelive.com/static/xiuxi (1).png" />
        <view class="live-end-text">{{ noPermissionText }}</view>
      </view>
      <view v-if="showOverlay" class="content-box" :style="horizontalContentStyle">
        <people-number :live-id="liveId" :online-number="onlineNumber" @goShop="openShopList" @sendLbMsg="sendBarrage" />
        <manager-permission v-if="isAssistant" :live-id="liveId" />
        <barrage-list-horizontal
          ref="barrageList"
          class="barrage_list"
          :live-notice="noticeText"
          :is-anonymous="roomSetting.is_anonymous"
          :is-avatar-anonymous="roomSetting.is_avatar_anonymous"
          :is-creating-order="roomSetting.is_creating_order"
          :is-hot-sale="roomSetting.is_hot_sale"
          :is-grade="roomSetting.is_grade"
          :sales-one="liveDetail.sales_one"
          @goShop="openShopList"
          @endLive="markEnded"
          @goTrtc="openTrtc"
          @refresh="refreshRoom"
          @setAssistant="setAssistant"
        />
        <bottom-option
          ref="bottomOption"
          class="bottom-option"
          :live-id="liveId"
          :is-trtc-go="trtcReady ? 1 : 0"
          @sendBarrage="sendBarrage"
          @clearScreen="clearScreen"
          @goShop="openShopList"
        />
      </view>
      <sign-in
        v-if="showSignIn"
        ref="signInRef"
        :live-id="liveId"
        :app-id="liveDetail.app_id"
        :supplier-id="liveDetail.shop_supplier_id"
        :config="signInConfig"
        :chat-info="liveDetail"
        :is-login="isLogin"
        :type="2"
        @signinSuccess="onSigninSuccess"
        @signinFail="onSigninFail"
        @taskEnd="onTaskEnd"
        @manualEnd="onManualEnd"
      />
      <check-in v-if="showCheckIn" ref="checkInRef" :live-id="liveId" @callBMethod="refreshRoom" />
    </template>

    <template v-else>
      <view v-if="showPlayer" class="live-video">
        <live-player
          v-if="useLivePlayer"
          id="live-video"
          class="live-video"
          :src="streamUrl"
          mode="live"
          autoplay
          :controls="false"
          object-fit="fillCrop"
          :min-cache="0.2"
          :max-cache="0.8"
          picture-in-picture-mode="push, pop"
          picture-in-picture-init-position="right,20"
          @statechange="onLiveStateChange"
          @netstatus="onNetStatus"
        />
        <video
          v-else
          class="live-video"
          :src="streamUrl"
          autoplay
          :controls="false"
          :loop="!isHorizontal"
          object-fit="cover"
          :initial-time="replayInitialTime"
          :show-play-btn="false"
          :show-center-play-btn="false"
          :show-fullscreen-btn="false"
          :show-bottom-progress="false"
          @ended="onVideoEnded"
          @timeupdate="onVideoTimeUpdate"
        />
      </view>
      <view v-if="isEnded" class="live-end">
        <view class="live-title">
          <live-title :detail="liveDetail" />
          <end-topicon @goShop="openShopList" />
        </view>
        <image class="live-end-img" src="https://weilive.yukelive.com/static/xiuxi (1).png" />
        <view class="live-end-text">本场次已结束</view>
        <view class="bottom-option">
          <bottom-option :live-id="liveId" @clearScreen="clearScreen" @sendBarrage="sendBarrage" @goShop="openShopList" />
        </view>
      </view>
      <view v-else-if="noPermissionText" class="live-end">
        <view class="live-title">
          <live-title :detail="liveDetail" />
          <end-topicon @goShop="openShopList" />
        </view>
        <image class="live-end-img" src="https://weilive.yukelive.com/static/xiuxi (1).png" />
        <view class="live-end-text">{{ noPermissionText }}</view>
      </view>
      <view v-if="showOverlay" class="live-content">
        <dz-full-screen class="dz-screen" @clikeLike="sendLike" />
        <trtc-live v-if="showTrtc" ref="trtcLive" class="dz-screen trtcLiveSc" :live-id="liveId" @closeLm="closeTrtc" />
        <live-title :detail="liveDetail" />
        <view v-if="noticeText" class="comment-notice-view live-content-view">
          <uni-notice-bar
            color="#ffffff"
            background-color="rgba(0,0,0,.45)"
            :scrollable="true"
            :single="true"
            :text="noticeText"
          />
        </view>
        <people-number
          :live-id="liveId"
          :online-number="onlineNumber"
          @goShop="openShopList"
          @sendLbMsg="sendBarrage"
          @callBMethod="refreshRoom"
        />
        <manager-permission v-if="isAssistant" :live-id="liveId" />
        <view class="bottom-option live-content-view" :style="{ marginBottom: bottomSafeArea }">
          <barrage-list
            ref="barrageList"
            :live-notice="noticeText"
            :is-anonymous="roomSetting.is_anonymous"
            :is-avatar-anonymous="roomSetting.is_avatar_anonymous"
            :is-creating-order="roomSetting.is_creating_order"
            :is-hot-sale="roomSetting.is_hot_sale"
            :is-grade="roomSetting.is_grade"
            :sales-one="liveDetail.sales_one"
            @goShop="openShopList"
            @endLive="markEnded"
            @goTrtc="openTrtc"
            @refresh="refreshRoom"
            @setAssistant="setAssistant"
          />
          <bottom-option
            ref="bottomOption"
            :live-id="liveId"
            :is-trtc-go="trtcReady ? 1 : 0"
            @sendBarrage="sendBarrage"
            @clearScreen="clearScreen"
            @closeTrtc="closeTrtc"
            @goShop="openShopList"
          />
        </view>
        <full-screen-loading v-if="loading" class="dz-screen" />
      </view>
      <view v-if="isWaiting" class="live-video live-wait">
        <view v-if="coverImage" class="cover-img-view">
          <image class="cover-img" mode="widthFix" :src="coverImage" />
        </view>
        <subscribe ref="sbRef" class="sb-view" />
        <wait-countdown
          class="wait-countdown"
          :end-time="liveDetail.start_time || liveDetail.initial_time"
          @countdownEnd="refreshRoom"
        />
        <view class="bottom-option">
          <bottom-option :live-id="liveId" @clearScreen="clearScreen" @sendBarrage="sendBarrage" @closeTrtc="closeTrtc" />
        </view>
      </view>
    </template>

    <shop-list ref="shopList" :live-id="liveId" :is-order="roomSetting.is_order" @goShop="goShop" />
    <watch-type-verify ref="watchTypeVerifyRef" :live-id="liveId" @ok="onWatchVerifyOk" />
    <view v-if="screenRecording" class="onScreenRecord" />
  </view>
</template>

<script>
import { createLivePlayerContext, playLive } from '../../platform/weixin/live.js'
import { onScreenRecordingStateChanged, offScreenRecordingStateChanged } from '../../platform/weixin/capture.js'
import { getLiveStream, isEndedStatus, isWaitingStatus, normalizeLiveOptions, requestWithVm, toast } from './page-tools.js'
import BarrageList from './commponents/barrage-list.vue'
import BarrageListHorizontal from './commponents/barrage-list-horizontal.vue'
import BottomOption from './commponents/bottom-option.vue'
import CheckIn from './commponents/check-in.vue'
import CouponClaim from './commponents/coupon-claim.vue'
import DzFullScreen from './commponents/dz-full-screen.vue'
import EndTopicon from './commponents/end-topicon.vue'
import FullScreenLoading from './commponents/full-screen-loading.vue'
import LiveTitle from './commponents/live-title.vue'
import ManagerPermission from './commponents/manager-permission.vue'
import PeopleNumber from './commponents/people-number.vue'
import ShopList from './commponents/shop-list.vue'
import SignIn from './commponents/sign-in.vue'
import Subscribe from './commponents/subscribe.vue'
import TrtcLive from './commponents/trtc-live.vue'
import UniNoticeBar from '../../uni_modules/uni-notice-bar/components/uni-notice-bar/uni-notice-bar.vue'
import WaitCountdown from './commponents/wait-countdown.vue'
import WatchTypeVerify from './commponents/watch-type-verify.vue'

export default {
  components: {
    BarrageList,
    BarrageListHorizontal,
    BottomOption,
    CheckIn,
    CouponClaim,
    DzFullScreen,
    EndTopicon,
    FullScreenLoading,
    LiveTitle,
    ManagerPermission,
    PeopleNumber,
    ShopList,
    SignIn,
    Subscribe,
    TrtcLive,
    UniNoticeBar,
    WaitCountdown,
    WatchTypeVerify,
  },
  props: {
    orientation: {
      type: String,
      default: 'vertical',
    },
  },
  provide() {
    return {
      roomId: () => this.liveId,
      is_showNotice: () => this.noticeText,
      self_group: () => this.roomSetting.self_group || 1,
      supplier_user_id: () => this.roomSetting.supplier_user_id || '',
      anchor_id: () => this.liveDetail.anchor_id || '',
      shop_supplier_id: () => this.liveDetail.shop_supplier_id || '',
      video_questions: () => this.liveDetail.questions || [],
      video_question_log: () => this.videoQuestionLog,
      look_finish_submit_question: () => !!(this.liveDetail.look_finish_submit_question && [2, 3].includes(Number(this.liveDetail.source))),
    }
  },
  data() {
    return {
      pageReady: false,
      liveId: '',
      storeId: '',
      liveDetail: { live_status: 101, questions: [] },
      roomSetting: {},
      liveNotice: {},
      videoQuestionLog: {},
      streamUrl: '',
      livePlayerContext: null,
      loading: true,
      screenRecording: false,
      onlineNumber: 0,
      isAssistant: false,
      trtcReady: false,
      showBarrage: true,
      showControls: true,
      fullscreen: false,
      navHeight: 0,
      replayInitialTime: 0,
      noPermissionText: '',
      screenRecordingHandler: null,
      bottomSafeArea: '0rpx',
    }
  },
  computed: {
    isHorizontal() {
      return this.orientation === 'horizontal'
    },
    liveStatus() {
      return Number(this.liveDetail.live_status || 101)
    },
    isEnded() {
      return isEndedStatus(this.liveStatus)
    },
    isWaiting() {
      return isWaitingStatus(this.liveStatus)
    },
    showPlayer() {
      return !!this.streamUrl && !this.isEnded && !this.isWaiting && !this.noPermissionText
    },
    showOverlay() {
      return this.showPlayer && this.showBarrage
    },
    useLivePlayer() {
      return Number(this.liveDetail.source || 0) !== 3
    },
    showTrtc() {
      return Number(this.liveDetail.is_trtc || 0) === 1 && this.trtcReady
    },
    coverImage() {
      return this.liveDetail.share_img || this.liveDetail.cover_img || this.liveDetail.image || ''
    },
    noticeText() {
      return this.liveNotice.content || this.liveNotice.title || this.liveDetail.notice || ''
    },
    showCouponClaim() {
      return !!this.liveDetail.coupon_id
    },
    showSignIn() {
      return this.isHorizontal && Number(this.roomSetting.is_check_open || this.liveDetail.is_check_open || 0) === 1
    },
    showCheckIn() {
      return this.isHorizontal && Number(this.roomSetting.is_checkin || this.liveDetail.is_checkin || 0) === 1
    },
    signInConfig() {
      return this.liveDetail.config || this.roomSetting.config || { pic_url: 'https://weilive.yukelive.com' }
    },
    isLogin() {
      return uni.getStorageSync('token') || uni.getStorageSync('user_id') ? 1 : 0
    },
    waitCountdownClass() {
      return this.coverImage ? 'wait-countdown1' : 'wait-countdown'
    },
    horizontalContentStyle() {
      const top = 482 + Number(this.navHeight || 0)
      return `height:calc(100vh - ${top}rpx);`
    },
  },
  onLoad(query = {}) {
    const options = normalizeLiveOptions(query)
    this.liveId = options.live_id
    this.storeId = options.store_id
    if (options.referee_id) uni.setStorageSync('referee_id', options.referee_id)
    if (options.uid) uni.setStorageSync('referee_id', options.uid)
    uni.hideShareMenu && uni.hideShareMenu()
    this.installScreenRecordingGuard()
    this.rejectDesktopRuntime()
    this.readSystemLayout()
    this.pageReady = true
    this.refreshRoom()
  },
  onReady() {
    this.livePlayerContext = createLivePlayerContext('live-video', this)
    if (this.livePlayerContext) {
      playLive(this.livePlayerContext).catch(() => {})
    }
  },
  onShow() {
    uni.setKeepScreenOn && uni.setKeepScreenOn({ keepScreenOn: true })
  },
  onUnload() {
    if (this.screenRecordingHandler) {
      offScreenRecordingStateChanged(this.screenRecordingHandler)
    }
    const app = getApp()
    if (app && typeof app.exitGroup === 'function' && this.liveId) {
      app.exitGroup(this.liveId)
    }
  },
  onShareAppMessage() {
    return {
      title: this.liveDetail.share_text || this.liveDetail.name || '直播间',
      path: `/pages/live/${this.isHorizontal ? 'live-horizontal' : 'live-vertical'}?scene=live_id:${this.liveId}`,
      imageUrl: this.liveDetail.share_img,
    }
  },
  onShareTimeline() {
    return {
      title: this.liveDetail.share_text || this.liveDetail.name || '直播间',
      query: `scene=live_id:${this.liveId}`,
      imageUrl: this.liveDetail.share_img,
    }
  },
  methods: {
    refreshRoom() {
      if (!this.liveId) {
        this.loading = false
        toast('缺少直播间参数')
        return
      }

      this.loading = true
      requestWithVm(this, '_post', 'live.index/index', {
        live_id: this.liveId,
        referee_id: uni.getStorageSync('referee_id'),
        store_id: this.storeId,
        pwd: uni.getStorageSync(`room_verify_pwd_${this.liveId}`),
        mobile: uni.getStorageSync(`room_verify_mobile_${this.liveId}`),
      })
        .then((res) => {
          const data = res.data || {}
          this.noPermissionText = ''
          this.liveDetail = data.live_detail || data.detail || data
          this.roomSetting = data.room_setting || {}
          this.liveNotice = data.live_notice || {}
          this.videoQuestionLog = data.question_log || {}
          this.onlineNumber = data.online_number || this.liveDetail.online_number || 0
          this.streamUrl = getLiveStream(this.liveDetail)
          this.trtcReady = Number(this.liveDetail.is_trtc || 0) === 1
          this.checkAssistant()
          this.updateLiveMember()
          this.joinImGroup()
          if (this.liveDetail.name) uni.setNavigationBarTitle({ title: this.liveDetail.name })
        })
        .catch((error) => {
          const data = error && error.data ? error.data : {}
          this.noPermissionText = data.msg || error?.msg || ''
          console.warn('[live] refreshRoom failed', error)
          // TODO:migration Confirm live.index/index error response shape against production API.
        })
        .finally(() => {
          this.loading = false
        })
    },
    updateLiveMember() {
      requestWithVm(this, '_post', 'live.index/updateLiveMember', {
        live_id: this.liveId,
        referee_id: uni.getStorageSync('referee_id'),
        store_id: this.storeId,
      }).catch(() => {})
    },
    joinImGroup() {
      const app = getApp()
      if (app && typeof app.addGroup === 'function' && this.liveId) {
        app.addGroup(this.liveId, () => {
          if (this.$refs.barrageList && this.$refs.barrageList.memberStart) {
            this.$refs.barrageList.memberStart()
          }
        })
      }
    },
    checkAssistant() {
      requestWithVm(this, '_post', 'live.index/checkRoomAssistant', { live_id: this.liveId })
        .then((res) => {
          this.isAssistant = Number((res.data && res.data.is_assistant) || res.data || 0) === 1
        })
        .catch(() => {
          this.isAssistant = false
        })
    },
    rejectDesktopRuntime() {
      uni.getSystemInfo({
        success: (info) => {
          if (['windows', 'mac', 'ohos_pc'].includes(info.platform)) {
            toast('不支持电脑观看')
            setTimeout(() => uni.reLaunch({ url: '/pages/index/index' }), 1500)
          }
        },
      })
    },
    readSystemLayout() {
      uni.getSystemInfo({
        success: (info) => {
          this.bottomSafeArea = info.safeAreaInsets && info.safeAreaInsets.bottom ? `${info.safeAreaInsets.bottom}px` : '0rpx'
        },
      })
      if (typeof this.getNavHeight === 'function') {
        const nav = this.getNavHeight()
        this.navHeight = nav && nav.navHeight > 0 ? nav.navHeight : 0
      }
    },
    installScreenRecordingGuard() {
      this.screenRecordingHandler = (event) => {
        this.screenRecording = event && event.state === 'start'
        if (this.screenRecording) {
          uni.showModal({
            title: '提示',
            content: '检测到录屏，将退出小程序以确保内容安全。',
            showCancel: false,
            confirmText: '确定退出',
            success: () => uni.exitMiniProgram && uni.exitMiniProgram(),
          })
        }
      }
      onScreenRecordingStateChanged(this.screenRecordingHandler)
    },
    onLiveStateChange(event) {
      const code = event.detail && event.detail.code
      if ([2004, 2007].includes(code) && this.liveStatus === 102) this.liveDetail.live_status = 101
      if (code === 2103 && [101, 108].includes(this.liveStatus)) toast('主播网络不佳，正在努力恢复')
      if (code === -2301 || code === 102) this.markEnded()
    },
    onNetStatus(event) {
      this.onlineNumber = (event.detail && event.detail.info && event.detail.info.netSpeed) || this.onlineNumber
    },
    onFullscreenChange(event) {
      this.fullscreen = !!(event.detail && event.detail.fullScreen)
    },
    onVideoTimeUpdate(event) {
      if (event.detail && event.detail.currentTime && Number(this.liveDetail.source) === 2) {
        uni.setStorageSync(`time_hc_${this.liveId}`, event.detail.currentTime)
      }
    },
    onVideoEnded() {
      this.markEnded()
    },
    markEnded() {
      this.liveDetail = { ...this.liveDetail, live_status: 102 }
      requestWithVm(this, '_post', 'live.index/membersLookEnd', { live_id: this.liveId }).catch(() => {})
    },
    openShopList(productId, skuId) {
      if (productId) {
        this.goShop(productId, skuId)
        return
      }
      this.$refs.shopList && this.$refs.shopList.showShowList()
    },
    goShop(productId, skuId) {
      uni.navigateTo({
        url: `/pages/product/detail/detail?product_id=${productId || ''}&product_sku_id=${skuId || ''}`,
      })
    },
    openNotice() {},
    toggleControls() {
      this.showControls = !this.showControls
    },
    requestFullscreen() {
      if (this.livePlayerContext && this.livePlayerContext.requestFullScreen) {
        this.livePlayerContext.requestFullScreen({ direction: 90 })
      }
    },
    exitFullscreen() {
      if (this.livePlayerContext && this.livePlayerContext.exitFullScreen) {
        this.livePlayerContext.exitFullScreen()
      }
    },
    openTrtc() {
      this.trtcReady = true
    },
    closeTrtc() {
      this.trtcReady = false
    },
    sendBarrage(text) {
      if (this.$refs.barrageList && this.$refs.barrageList.imSendMsg) {
        this.$refs.barrageList.imSendMsg(text)
      }
    },
    sendLike() {
      if (this.$refs.barrageList && this.$refs.barrageList.addZanNum) {
        this.$refs.barrageList.addZanNum()
      }
    },
    clearScreen(forceShow) {
      this.showBarrage = forceShow === 1 ? true : !this.showBarrage
    },
    setAssistant(value) {
      this.isAssistant = !!value
    },
    onSigninSuccess() {
      this.refreshRoom()
    },
    onSigninFail() {},
    onTaskEnd() {},
    onManualEnd() {},
    onWatchVerifyOk() {
      this.refreshRoom()
    },
  },
}
</script>

<style scoped>
.h5-live-container,
.look-box {
  min-height: 100vh;
  background: #111;
  color: #fff;
  overflow: hidden;
}

.live-video {
  width: 100vw;
  height: 100vh;
  position: relative;
}

.live-wait {
  background: linear-gradient(135deg, #355df6, #7574f6, #7eade9);
  left: 0;
  position: absolute;
  top: 0;
}

.live-wait .wait-countdown {
  height: 200rpx;
  margin: 450rpx 100rpx 0;
}

.live-wait .bottom-option {
  bottom: 0;
  left: 0;
  position: absolute;
}

.live-content {
  display: inline-block;
  height: 100vh;
  left: 0;
  position: fixed;
  top: 0;
  width: 100vw;
}

.live-content-view {
  display: inline-block;
}

.dz-screen {
  height: 100vh;
  left: 0;
  position: absolute;
  top: 0;
  width: 100vw;
}

.bottom-option {
  bottom: 0;
  left: 0;
  position: absolute;
  width: 100%;
}

.live-end {
  background-color: #222;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  width: 100%;
}

.live-end .live-title {
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}

.live-end-img {
  height: 120rpx;
  margin: 0 auto;
  width: 120rpx;
}

.live-end-text {
  color: #fffbee;
  font-size: 40rpx;
  font-weight: 400;
  margin-top: 40rpx;
  text-align: center;
}

.comment-notice-view {
  padding-top: 4rpx;
  width: 100vw;
}

.cover-img-view {
  bottom: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  position: absolute;
  top: 0;
  width: 100%;
}

.cover-img {
  height: 100%;
  max-height: 100vh;
  width: 100%;
}

.sb-view {
  left: 20rpx;
  position: absolute;
  top: 110rpx;
}

.onScreenRecord {
  background: #000;
  height: 100vh;
  left: 0;
  position: absolute;
  top: 0;
  width: 100vw;
  z-index: 999;
}

.look-box .live-box,
.look-box .live-video {
  height: 482rpx;
  position: relative;
  width: 100vw;
}

.coupon-claim-horizontal {
  left: 20rpx;
  position: absolute;
  top: 70rpx;
  z-index: 20;
}

.wait-countdown {
  background: linear-gradient(135deg, #355df6, #7574f6, #7eade9);
}

.look-box .wait-countdown,
.look-box .wait-countdown1 {
  height: 100%;
  position: absolute;
  width: 100%;
}

.live-utils {
  background: linear-gradient(0deg, rgba(0, 0, 0, .7), transparent);
  bottom: 0;
  left: 0;
  position: absolute;
  width: 750rpx;
}

.live-utils .bottom-control {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 25rpx;
  width: 100%;
}

.live-utils .bottom-h-bz {
  height: 50rpx;
}

.live-utils .bottom-h-qp {
  height: 35rpx;
}

.live-utils .full-screen {
  height: 30rpx;
  width: 30rpx;
}

.live-utils .full-screen-qp {
  height: 20rpx;
  width: 20rpx;
}

.live-utils .utils-right {
  align-items: center;
  display: flex;
  flex-direction: row;
}

.content-box {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
  width: 100vw;
  background: #f5f5f5;
  color: #333;
}

.content-box .barrage_list {
  height: 100%;
}

.marquee-tips {
  align-items: center;
  background-color: hsla(0, 0%, 60%, .7);
  border-radius: 10rpx;
  display: flex;
  flex-direction: row;
  margin: 0 50rpx;
  padding: 10rpx 20rpx;
  position: relative;
  z-index: 30;
}

.tips-title {
  color: #fff;
  font-size: 28rpx;
}

.marquee-container {
  overflow: hidden;
  white-space: nowrap;
  width: 300rpx;
}

.marquee-text {
  color: #fff;
  display: inline-block;
  font-size: 28rpx;
}

.notice-more {
  color: #fff;
  font-size: 36rpx;
  line-height: 1;
  margin-left: auto;
}

.look-box .live-end {
  left: 0;
  position: fixed;
  top: 0;
  width: 100vw;
}

.look-box .cover-img-view {
  display: flex;
  flex-direction: row;
  height: 100%;
  justify-content: center;
  position: absolute;
  width: 100%;
}

.look-box .cover-img {
  max-height: 482rpx;
  width: 100%;
}
</style>
