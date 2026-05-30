"use strict";
const common_vendor = require("../../common/vendor.js");
const platform_weixin_live = require("../../platform/weixin/live.js");
const platform_weixin_capture = require("../../platform/weixin/capture.js");
const pages_live_pageTools = require("./page-tools.js");
const BarrageList = () => "./commponents/barrage-list.js";
const BarrageListHorizontal = () => "./commponents/barrage-list-horizontal.js";
const BottomOption = () => "./commponents/bottom-option.js";
const CheckIn = () => "./commponents/check-in.js";
const CouponClaim = () => "./commponents/coupon-claim.js";
const DzFullScreen = () => "./commponents/dz-full-screen.js";
const EndTopicon = () => "./commponents/end-topicon.js";
const FullScreenLoading = () => "./commponents/full-screen-loading.js";
const LiveTitle = () => "./commponents/live-title.js";
const ManagerPermission = () => "./commponents/manager-permission.js";
const PeopleNumber = () => "./commponents/people-number.js";
const ShopList = () => "./commponents/shop-list.js";
const SignIn = () => "./commponents/sign-in2.js";
const Subscribe = () => "./commponents/subscribe.js";
const TrtcLive = () => "./commponents/trtc-live.js";
const UniNoticeBar = () => "../../uni_modules/uni-notice-bar/components/uni-notice-bar/uni-notice-bar.js";
const WaitCountdown = () => "./commponents/wait-countdown.js";
const WatchTypeVerify = () => "./commponents/watch-type-verify.js";
const _sfc_main = {
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
    WatchTypeVerify
  },
  props: {
    orientation: {
      type: String,
      default: "vertical"
    }
  },
  provide() {
    return {
      roomId: () => this.liveId,
      is_showNotice: () => this.noticeText,
      self_group: () => this.roomSetting.self_group || 1,
      supplier_user_id: () => this.roomSetting.supplier_user_id || "",
      anchor_id: () => this.liveDetail.anchor_id || "",
      shop_supplier_id: () => this.liveDetail.shop_supplier_id || "",
      video_questions: () => this.liveDetail.questions || [],
      video_question_log: () => this.videoQuestionLog,
      look_finish_submit_question: () => !!(this.liveDetail.look_finish_submit_question && [2, 3].includes(Number(this.liveDetail.source)))
    };
  },
  data() {
    return {
      pageReady: false,
      liveId: "",
      storeId: "",
      liveDetail: { live_status: 101, questions: [] },
      roomSetting: {},
      liveNotice: {},
      videoQuestionLog: {},
      streamUrl: "",
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
      noPermissionText: "",
      screenRecordingHandler: null,
      bottomSafeArea: "0rpx"
    };
  },
  computed: {
    isHorizontal() {
      return this.orientation === "horizontal";
    },
    liveStatus() {
      return Number(this.liveDetail.live_status || 101);
    },
    isEnded() {
      return pages_live_pageTools.isEndedStatus(this.liveStatus);
    },
    isWaiting() {
      return pages_live_pageTools.isWaitingStatus(this.liveStatus);
    },
    showPlayer() {
      return !!this.streamUrl && !this.isEnded && !this.isWaiting && !this.noPermissionText;
    },
    showOverlay() {
      return this.showPlayer && this.showBarrage;
    },
    useLivePlayer() {
      return Number(this.liveDetail.source || 0) !== 3;
    },
    showTrtc() {
      return Number(this.liveDetail.is_trtc || 0) === 1 && this.trtcReady;
    },
    coverImage() {
      return this.liveDetail.share_img || this.liveDetail.cover_img || this.liveDetail.image || "";
    },
    noticeText() {
      return this.liveNotice.content || this.liveNotice.title || this.liveDetail.notice || "";
    },
    showCouponClaim() {
      return !!this.liveDetail.coupon_id;
    },
    showSignIn() {
      return this.isHorizontal && Number(this.roomSetting.is_check_open || this.liveDetail.is_check_open || 0) === 1;
    },
    showCheckIn() {
      return this.isHorizontal && Number(this.roomSetting.is_checkin || this.liveDetail.is_checkin || 0) === 1;
    },
    signInConfig() {
      return this.liveDetail.config || this.roomSetting.config || { pic_url: "https://weilive.yukelive.com" };
    },
    isLogin() {
      return common_vendor.index.getStorageSync("token") || common_vendor.index.getStorageSync("user_id") ? 1 : 0;
    },
    waitCountdownClass() {
      return this.coverImage ? "wait-countdown1" : "wait-countdown";
    },
    horizontalContentStyle() {
      const top = 482 + Number(this.navHeight || 0);
      return `height:calc(100vh - ${top}rpx);`;
    }
  },
  onLoad(query = {}) {
    const options = pages_live_pageTools.normalizeLiveOptions(query);
    this.liveId = options.live_id;
    this.storeId = options.store_id;
    if (options.referee_id)
      common_vendor.index.setStorageSync("referee_id", options.referee_id);
    if (options.uid)
      common_vendor.index.setStorageSync("referee_id", options.uid);
    common_vendor.index.hideShareMenu && common_vendor.index.hideShareMenu();
    this.installScreenRecordingGuard();
    this.rejectDesktopRuntime();
    this.readSystemLayout();
    this.pageReady = true;
    this.refreshRoom();
  },
  onReady() {
    this.livePlayerContext = platform_weixin_live.createLivePlayerContext("live-video", this);
    if (this.livePlayerContext) {
      platform_weixin_live.playLive(this.livePlayerContext).catch(() => {
      });
    }
  },
  onShow() {
    common_vendor.index.setKeepScreenOn && common_vendor.index.setKeepScreenOn({ keepScreenOn: true });
  },
  onUnload() {
    if (this.screenRecordingHandler) {
      platform_weixin_capture.offScreenRecordingStateChanged(this.screenRecordingHandler);
    }
    const app = getApp();
    if (app && typeof app.exitGroup === "function" && this.liveId) {
      app.exitGroup(this.liveId);
    }
  },
  onShareAppMessage() {
    return {
      title: this.liveDetail.share_text || this.liveDetail.name || "直播间",
      path: `/pages/live/${this.isHorizontal ? "live-horizontal" : "live-vertical"}?scene=live_id:${this.liveId}`,
      imageUrl: this.liveDetail.share_img
    };
  },
  onShareTimeline() {
    return {
      title: this.liveDetail.share_text || this.liveDetail.name || "直播间",
      query: `scene=live_id:${this.liveId}`,
      imageUrl: this.liveDetail.share_img
    };
  },
  methods: {
    refreshRoom() {
      if (!this.liveId) {
        this.loading = false;
        pages_live_pageTools.toast("缺少直播间参数");
        return;
      }
      this.loading = true;
      pages_live_pageTools.requestWithVm(this, "_post", "live.index/index", {
        live_id: this.liveId,
        referee_id: common_vendor.index.getStorageSync("referee_id"),
        store_id: this.storeId,
        pwd: common_vendor.index.getStorageSync(`room_verify_pwd_${this.liveId}`),
        mobile: common_vendor.index.getStorageSync(`room_verify_mobile_${this.liveId}`)
      }).then((res) => {
        const data = res.data || {};
        this.noPermissionText = "";
        this.liveDetail = data.live_detail || data.detail || data;
        this.roomSetting = data.room_setting || {};
        this.liveNotice = data.live_notice || {};
        this.videoQuestionLog = data.question_log || {};
        this.onlineNumber = data.online_number || this.liveDetail.online_number || 0;
        this.streamUrl = pages_live_pageTools.getLiveStream(this.liveDetail);
        this.trtcReady = Number(this.liveDetail.is_trtc || 0) === 1;
        this.checkAssistant();
        this.updateLiveMember();
        this.joinImGroup();
        if (this.liveDetail.name)
          common_vendor.index.setNavigationBarTitle({ title: this.liveDetail.name });
      }).catch((error) => {
        const data = error && error.data ? error.data : {};
        this.noPermissionText = data.msg || (error == null ? void 0 : error.msg) || "";
        console.warn("[live] refreshRoom failed", error);
      }).finally(() => {
        this.loading = false;
      });
    },
    updateLiveMember() {
      pages_live_pageTools.requestWithVm(this, "_post", "live.index/updateLiveMember", {
        live_id: this.liveId,
        referee_id: common_vendor.index.getStorageSync("referee_id"),
        store_id: this.storeId
      }).catch(() => {
      });
    },
    joinImGroup() {
      const app = getApp();
      if (app && typeof app.addGroup === "function" && this.liveId) {
        app.addGroup(this.liveId, () => {
          if (this.$refs.barrageList && this.$refs.barrageList.memberStart) {
            this.$refs.barrageList.memberStart();
          }
        });
      }
    },
    checkAssistant() {
      pages_live_pageTools.requestWithVm(this, "_post", "live.index/checkRoomAssistant", { live_id: this.liveId }).then((res) => {
        this.isAssistant = Number(res.data && res.data.is_assistant || res.data || 0) === 1;
      }).catch(() => {
        this.isAssistant = false;
      });
    },
    rejectDesktopRuntime() {
      common_vendor.index.getSystemInfo({
        success: (info) => {
          if (["windows", "mac", "ohos_pc"].includes(info.platform)) {
            pages_live_pageTools.toast("不支持电脑观看");
            setTimeout(() => common_vendor.index.reLaunch({ url: "/pages/index/index" }), 1500);
          }
        }
      });
    },
    readSystemLayout() {
      common_vendor.index.getSystemInfo({
        success: (info) => {
          this.bottomSafeArea = info.safeAreaInsets && info.safeAreaInsets.bottom ? `${info.safeAreaInsets.bottom}px` : "0rpx";
        }
      });
      if (typeof this.getNavHeight === "function") {
        const nav = this.getNavHeight();
        this.navHeight = nav && nav.navHeight > 0 ? nav.navHeight : 0;
      }
    },
    installScreenRecordingGuard() {
      this.screenRecordingHandler = (event) => {
        this.screenRecording = event && event.state === "start";
        if (this.screenRecording) {
          common_vendor.index.showModal({
            title: "提示",
            content: "检测到录屏，将退出小程序以确保内容安全。",
            showCancel: false,
            confirmText: "确定退出",
            success: () => common_vendor.index.exitMiniProgram && common_vendor.index.exitMiniProgram()
          });
        }
      };
      platform_weixin_capture.onScreenRecordingStateChanged(this.screenRecordingHandler);
    },
    onLiveStateChange(event) {
      const code = event.detail && event.detail.code;
      if ([2004, 2007].includes(code) && this.liveStatus === 102)
        this.liveDetail.live_status = 101;
      if (code === 2103 && [101, 108].includes(this.liveStatus))
        pages_live_pageTools.toast("主播网络不佳，正在努力恢复");
      if (code === -2301 || code === 102)
        this.markEnded();
    },
    onNetStatus(event) {
      this.onlineNumber = event.detail && event.detail.info && event.detail.info.netSpeed || this.onlineNumber;
    },
    onFullscreenChange(event) {
      this.fullscreen = !!(event.detail && event.detail.fullScreen);
    },
    onVideoTimeUpdate(event) {
      if (event.detail && event.detail.currentTime && Number(this.liveDetail.source) === 2) {
        common_vendor.index.setStorageSync(`time_hc_${this.liveId}`, event.detail.currentTime);
      }
    },
    onVideoEnded() {
      this.markEnded();
    },
    markEnded() {
      this.liveDetail = { ...this.liveDetail, live_status: 102 };
      pages_live_pageTools.requestWithVm(this, "_post", "live.index/membersLookEnd", { live_id: this.liveId }).catch(() => {
      });
    },
    openShopList(productId, skuId) {
      if (productId) {
        this.goShop(productId, skuId);
        return;
      }
      this.$refs.shopList && this.$refs.shopList.showShowList();
    },
    goShop(productId, skuId) {
      common_vendor.index.navigateTo({
        url: `/pages/product/detail/detail?product_id=${productId || ""}&product_sku_id=${skuId || ""}`
      });
    },
    openNotice() {
    },
    toggleControls() {
      this.showControls = !this.showControls;
    },
    requestFullscreen() {
      if (this.livePlayerContext && this.livePlayerContext.requestFullScreen) {
        this.livePlayerContext.requestFullScreen({ direction: 90 });
      }
    },
    exitFullscreen() {
      if (this.livePlayerContext && this.livePlayerContext.exitFullScreen) {
        this.livePlayerContext.exitFullScreen();
      }
    },
    openTrtc() {
      this.trtcReady = true;
    },
    closeTrtc() {
      this.trtcReady = false;
    },
    sendBarrage(text) {
      if (this.$refs.barrageList && this.$refs.barrageList.imSendMsg) {
        this.$refs.barrageList.imSendMsg(text);
      }
    },
    sendLike() {
      if (this.$refs.barrageList && this.$refs.barrageList.addZanNum) {
        this.$refs.barrageList.addZanNum();
      }
    },
    clearScreen(forceShow) {
      this.showBarrage = forceShow === 1 ? true : !this.showBarrage;
    },
    setAssistant(value) {
      this.isAssistant = !!value;
    },
    onSigninSuccess() {
      this.refreshRoom();
    },
    onSigninFail() {
    },
    onTaskEnd() {
    },
    onManualEnd() {
    },
    onWatchVerifyOk() {
      this.refreshRoom();
    }
  }
};
if (!Array) {
  const _component_live_title = common_vendor.resolveComponent("live-title");
  const _easycom_uni_notice_bar2 = common_vendor.resolveComponent("uni-notice-bar");
  const _component_coupon_claim = common_vendor.resolveComponent("coupon-claim");
  const _component_wait_countdown = common_vendor.resolveComponent("wait-countdown");
  const _component_bottom_option = common_vendor.resolveComponent("bottom-option");
  const _component_people_number = common_vendor.resolveComponent("people-number");
  const _component_manager_permission = common_vendor.resolveComponent("manager-permission");
  const _component_barrage_list_horizontal = common_vendor.resolveComponent("barrage-list-horizontal");
  const _component_sign_in = common_vendor.resolveComponent("sign-in");
  const _component_check_in = common_vendor.resolveComponent("check-in");
  const _component_end_topicon = common_vendor.resolveComponent("end-topicon");
  const _component_dz_full_screen = common_vendor.resolveComponent("dz-full-screen");
  const _component_trtc_live = common_vendor.resolveComponent("trtc-live");
  const _component_barrage_list = common_vendor.resolveComponent("barrage-list");
  const _component_full_screen_loading = common_vendor.resolveComponent("full-screen-loading");
  const _component_shop_list = common_vendor.resolveComponent("shop-list");
  const _component_watch_type_verify = common_vendor.resolveComponent("watch-type-verify");
  (_component_live_title + _easycom_uni_notice_bar2 + _component_coupon_claim + _component_wait_countdown + _component_bottom_option + _component_people_number + _component_manager_permission + _component_barrage_list_horizontal + _component_sign_in + _component_check_in + _component_end_topicon + _component_dz_full_screen + _component_trtc_live + _component_barrage_list + _component_full_screen_loading + _component_shop_list + _component_watch_type_verify)();
}
const _easycom_uni_notice_bar = () => "../../uni_modules/uni-notice-bar/components/uni-notice-bar/uni-notice-bar.js";
if (!Math) {
  _easycom_uni_notice_bar();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.pageReady
  }, $data.pageReady ? common_vendor.e({
    b: $options.isHorizontal
  }, $options.isHorizontal ? common_vendor.e({
    c: common_vendor.p({
      detail: $data.liveDetail
    }),
    d: $options.noticeText
  }, $options.noticeText ? {
    e: common_vendor.p({
      color: "#ffffff",
      ["background-color"]: "transparent",
      scrollable: true,
      single: true,
      text: $options.noticeText
    }),
    f: common_vendor.o((...args) => $options.openNotice && $options.openNotice(...args), "50")
  } : {}, {
    g: $options.showCouponClaim
  }, $options.showCouponClaim ? {
    h: common_vendor.p({
      ["coupon-id"]: $data.liveDetail.coupon_id
    })
  } : {}, {
    i: $options.showPlayer
  }, $options.showPlayer ? common_vendor.e({
    j: $options.useLivePlayer
  }, $options.useLivePlayer ? common_vendor.e({
    k: $data.showControls
  }, $data.showControls ? common_vendor.e({
    l: !$data.fullscreen
  }, !$data.fullscreen ? {
    m: common_vendor.o((...args) => $options.requestFullscreen && $options.requestFullscreen(...args), "b6")
  } : {
    n: common_vendor.o((...args) => $options.exitFullscreen && $options.exitFullscreen(...args), "84")
  }, {
    o: common_vendor.n($data.fullscreen ? "bottom-h-qp" : "bottom-h-bz")
  }) : {}, {
    p: $data.streamUrl,
    q: common_vendor.o((...args) => $options.onLiveStateChange && $options.onLiveStateChange(...args), "eb"),
    r: common_vendor.o((...args) => $options.onNetStatus && $options.onNetStatus(...args), "b5"),
    s: common_vendor.o((...args) => $options.onFullscreenChange && $options.onFullscreenChange(...args), "b3"),
    t: common_vendor.o((...args) => $options.toggleControls && $options.toggleControls(...args), "c3")
  }) : {
    v: $data.streamUrl,
    w: $data.replayInitialTime,
    x: common_vendor.o((...args) => $options.onVideoEnded && $options.onVideoEnded(...args), "50"),
    y: common_vendor.o((...args) => $options.onVideoTimeUpdate && $options.onVideoTimeUpdate(...args), "19")
  }) : $options.coverImage ? {
    A: $options.coverImage
  } : {}, {
    z: $options.coverImage,
    B: $options.isWaiting
  }, $options.isWaiting ? {
    C: common_vendor.n($options.waitCountdownClass),
    D: common_vendor.o($options.refreshRoom, "2f"),
    E: common_vendor.p({
      ["end-time"]: $data.liveDetail.start_time || $data.liveDetail.initial_time
    })
  } : {}, {
    F: $options.isEnded
  }, $options.isEnded ? {
    G: common_vendor.o($options.sendBarrage, "b0"),
    H: common_vendor.o($options.clearScreen, "a3"),
    I: common_vendor.o($options.openShopList, "9b"),
    J: common_vendor.p({
      ["live-id"]: $data.liveId
    })
  } : $data.noPermissionText ? {
    L: common_vendor.o($options.openShopList, "7f"),
    M: common_vendor.p({
      ["live-id"]: $data.liveId,
      ["online-number"]: $data.onlineNumber
    }),
    N: common_vendor.t($data.noPermissionText)
  } : {}, {
    K: $data.noPermissionText,
    O: $options.showOverlay
  }, $options.showOverlay ? common_vendor.e({
    P: common_vendor.o($options.openShopList, "aa"),
    Q: common_vendor.o($options.sendBarrage, "f6"),
    R: common_vendor.p({
      ["live-id"]: $data.liveId,
      ["online-number"]: $data.onlineNumber
    }),
    S: $data.isAssistant
  }, $data.isAssistant ? {
    T: common_vendor.p({
      ["live-id"]: $data.liveId
    })
  } : {}, {
    U: common_vendor.sr("barrageList", "3fb815e9-8"),
    V: common_vendor.o($options.openShopList, "ce"),
    W: common_vendor.o($options.markEnded, "84"),
    X: common_vendor.o($options.openTrtc, "26"),
    Y: common_vendor.o($options.refreshRoom, "5c"),
    Z: common_vendor.o($options.setAssistant, "7a"),
    aa: common_vendor.p({
      ["live-notice"]: $options.noticeText,
      ["is-anonymous"]: $data.roomSetting.is_anonymous,
      ["is-avatar-anonymous"]: $data.roomSetting.is_avatar_anonymous,
      ["is-creating-order"]: $data.roomSetting.is_creating_order,
      ["is-hot-sale"]: $data.roomSetting.is_hot_sale,
      ["is-grade"]: $data.roomSetting.is_grade,
      ["sales-one"]: $data.liveDetail.sales_one
    }),
    ab: common_vendor.sr("bottomOption", "3fb815e9-9"),
    ac: common_vendor.o($options.sendBarrage, "11"),
    ad: common_vendor.o($options.clearScreen, "46"),
    ae: common_vendor.o($options.openShopList, "83"),
    af: common_vendor.p({
      ["live-id"]: $data.liveId,
      ["is-trtc-go"]: $data.trtcReady ? 1 : 0
    }),
    ag: common_vendor.s($options.horizontalContentStyle)
  }) : {}, {
    ah: $options.showSignIn
  }, $options.showSignIn ? {
    ai: common_vendor.sr("signInRef", "3fb815e9-10"),
    aj: common_vendor.o($options.onSigninSuccess, "6d"),
    ak: common_vendor.o($options.onSigninFail, "f4"),
    al: common_vendor.o($options.onTaskEnd, "f4"),
    am: common_vendor.o($options.onManualEnd, "26"),
    an: common_vendor.p({
      ["live-id"]: $data.liveId,
      ["app-id"]: $data.liveDetail.app_id,
      ["supplier-id"]: $data.liveDetail.shop_supplier_id,
      config: $options.signInConfig,
      ["chat-info"]: $data.liveDetail,
      ["is-login"]: $options.isLogin,
      type: 2
    })
  } : {}, {
    ao: $options.showCheckIn
  }, $options.showCheckIn ? {
    ap: common_vendor.sr("checkInRef", "3fb815e9-11"),
    aq: common_vendor.o($options.refreshRoom, "6c"),
    ar: common_vendor.p({
      ["live-id"]: $data.liveId
    })
  } : {}) : common_vendor.e({
    as: $options.showPlayer
  }, $options.showPlayer ? common_vendor.e({
    at: $options.useLivePlayer
  }, $options.useLivePlayer ? {
    av: $data.streamUrl,
    aw: common_vendor.o((...args) => $options.onLiveStateChange && $options.onLiveStateChange(...args), "5b"),
    ax: common_vendor.o((...args) => $options.onNetStatus && $options.onNetStatus(...args), "ce")
  } : {
    ay: $data.streamUrl,
    az: !$options.isHorizontal,
    aA: $data.replayInitialTime,
    aB: common_vendor.o((...args) => $options.onVideoEnded && $options.onVideoEnded(...args), "6f"),
    aC: common_vendor.o((...args) => $options.onVideoTimeUpdate && $options.onVideoTimeUpdate(...args), "09")
  }) : {}, {
    aD: $options.isEnded
  }, $options.isEnded ? {
    aE: common_vendor.p({
      detail: $data.liveDetail
    }),
    aF: common_vendor.o($options.openShopList, "ea"),
    aG: common_vendor.o($options.clearScreen, "50"),
    aH: common_vendor.o($options.sendBarrage, "e0"),
    aI: common_vendor.o($options.openShopList, "38"),
    aJ: common_vendor.p({
      ["live-id"]: $data.liveId
    })
  } : $data.noPermissionText ? {
    aL: common_vendor.p({
      detail: $data.liveDetail
    }),
    aM: common_vendor.o($options.openShopList, "02"),
    aN: common_vendor.t($data.noPermissionText)
  } : {}, {
    aK: $data.noPermissionText,
    aO: $options.showOverlay
  }, $options.showOverlay ? common_vendor.e({
    aP: common_vendor.o($options.sendLike, "f8"),
    aQ: $options.showTrtc
  }, $options.showTrtc ? {
    aR: common_vendor.sr("trtcLive", "3fb815e9-18"),
    aS: common_vendor.o($options.closeTrtc, "12"),
    aT: common_vendor.p({
      ["live-id"]: $data.liveId
    })
  } : {}, {
    aU: common_vendor.p({
      detail: $data.liveDetail
    }),
    aV: $options.noticeText
  }, $options.noticeText ? {
    aW: common_vendor.p({
      color: "#ffffff",
      ["background-color"]: "rgba(0,0,0,.45)",
      scrollable: true,
      single: true,
      text: $options.noticeText
    })
  } : {}, {
    aX: common_vendor.o($options.openShopList, "08"),
    aY: common_vendor.o($options.sendBarrage, "6e"),
    aZ: common_vendor.o($options.refreshRoom, "df"),
    ba: common_vendor.p({
      ["live-id"]: $data.liveId,
      ["online-number"]: $data.onlineNumber
    }),
    bb: $data.isAssistant
  }, $data.isAssistant ? {
    bc: common_vendor.p({
      ["live-id"]: $data.liveId
    })
  } : {}, {
    bd: common_vendor.sr("barrageList", "3fb815e9-23"),
    be: common_vendor.o($options.openShopList, "f4"),
    bf: common_vendor.o($options.markEnded, "a0"),
    bg: common_vendor.o($options.openTrtc, "60"),
    bh: common_vendor.o($options.refreshRoom, "0e"),
    bi: common_vendor.o($options.setAssistant, "b5"),
    bj: common_vendor.p({
      ["live-notice"]: $options.noticeText,
      ["is-anonymous"]: $data.roomSetting.is_anonymous,
      ["is-avatar-anonymous"]: $data.roomSetting.is_avatar_anonymous,
      ["is-creating-order"]: $data.roomSetting.is_creating_order,
      ["is-hot-sale"]: $data.roomSetting.is_hot_sale,
      ["is-grade"]: $data.roomSetting.is_grade,
      ["sales-one"]: $data.liveDetail.sales_one
    }),
    bk: common_vendor.sr("bottomOption", "3fb815e9-24"),
    bl: common_vendor.o($options.sendBarrage, "05"),
    bm: common_vendor.o($options.clearScreen, "ef"),
    bn: common_vendor.o($options.closeTrtc, "5c"),
    bo: common_vendor.o($options.openShopList, "d1"),
    bp: common_vendor.p({
      ["live-id"]: $data.liveId,
      ["is-trtc-go"]: $data.trtcReady ? 1 : 0
    }),
    bq: $data.bottomSafeArea,
    br: $data.loading
  }, $data.loading ? {} : {}) : {}, {
    bs: $options.isWaiting
  }, $options.isWaiting ? common_vendor.e({
    bt: $options.coverImage
  }, $options.coverImage ? {
    bv: $options.coverImage
  } : {}, {
    bw: common_vendor.o($options.refreshRoom, "2a"),
    bx: common_vendor.p({
      ["end-time"]: $data.liveDetail.start_time || $data.liveDetail.initial_time
    }),
    by: common_vendor.o($options.clearScreen, "7c"),
    bz: common_vendor.o($options.sendBarrage, "30"),
    bA: common_vendor.o($options.closeTrtc, "9c"),
    bB: common_vendor.p({
      ["live-id"]: $data.liveId
    })
  }) : {}), {
    bC: common_vendor.sr("shopList", "3fb815e9-28"),
    bD: common_vendor.o($options.goShop, "a7"),
    bE: common_vendor.p({
      ["live-id"]: $data.liveId,
      ["is-order"]: $data.roomSetting.is_order
    }),
    bF: common_vendor.sr("watchTypeVerifyRef", "3fb815e9-29"),
    bG: common_vendor.o($options.onWatchVerifyOk, "0e"),
    bH: common_vendor.p({
      ["live-id"]: $data.liveId
    }),
    bI: $data.screenRecording
  }, $data.screenRecording ? {} : {}, {
    bJ: common_vendor.n($options.isHorizontal ? "look-box" : "h5-live-container")
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-3fb815e9"]]);
wx.createComponent(Component);
