"use strict";
const common_vendor = require("../../../common/vendor.js");
const platform_weixin_live = require("../../../platform/weixin/live.js");
const platform_weixin_runtime = require("../../../platform/weixin/runtime.js");
const pages_live_pageTools = require("../page-tools.js");
const _sfc_main = {
  props: {
    liveId: {
      type: [Number, String],
      default: ""
    }
  },
  emits: ["closeLm"],
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
        mode: "RTC"
      },
      trtcUser: {}
    };
  },
  mounted() {
    this.pusherContext = platform_weixin_live.createLivePusherContext(this);
    this.createTrtcInstance();
    this.getTrtcData();
  },
  beforeUnmount() {
    this.exitRoom();
  },
  methods: {
    createTrtcInstance() {
      const app = getApp();
      const weixinApi = platform_weixin_runtime.getWeixinApi();
      const TrtcCtor = typeof TRTC !== "undefined" && TRTC || app && app.globalData && app.globalData.TRTC || weixinApi && weixinApi.TRTC;
      if (!TrtcCtor) {
        return;
      }
      this.trtc = new TrtcCtor(this);
      this.bindTrtcEvents();
      if (typeof this.trtc.createPusher === "function") {
        this.pusher = { ...this.pusher, ...this.trtc.createPusher() };
      }
    },
    getTrtcData() {
      if (!this.liveId)
        return;
      pages_live_pageTools.requestWithVm(this, "_post", "live.trtc/getTrtcUserData", { live_id: this.liveId }).then((res) => {
        this.trtcUser = res.data || {};
        this.enterRoom();
      }).catch((error) => console.warn("[live] getTrtcUserData failed", error));
    },
    enterRoom() {
      if (!this.trtc)
        return;
      const options = {
        userID: this.trtcUser.userId,
        sdkAppID: this.trtcUser.sdkAppID,
        userSig: this.trtcUser.userSigTencent,
        strRoomID: String(this.liveId),
        enableMic: true,
        enableCamera: false,
        beautyLevel: 9,
        scene: "live"
      };
      const pusher = this.trtc.enterRoom(options);
      if (pusher)
        this.pusher = { ...this.pusher, ...pusher };
      const instance = this.trtc.getPusherInstance && this.trtc.getPusherInstance();
      if (instance && typeof instance.start === "function")
        instance.start();
    },
    bindTrtcEvents() {
      if (!this.trtc || typeof this.trtc.on !== "function")
        return;
      const events = this.trtc.EVENT || {};
      this.trtc.on(events.REMOTE_USER_LEAVE, (event) => {
        this.playerList = event.data && event.data.playerList || [];
      });
      this.trtc.on(events.REMOTE_VIDEO_ADD, (event) => this.setPlayerAttributes(event.data && event.data.player, { muteVideo: false }));
      this.trtc.on(events.REMOTE_VIDEO_REMOVE, (event) => this.setPlayerAttributes(event.data && event.data.player, { muteVideo: true }));
      this.trtc.on(events.REMOTE_AUDIO_ADD, (event) => this.setPlayerAttributes(event.data && event.data.player, { muteAudio: false }));
      this.trtc.on(events.REMOTE_AUDIO_REMOVE, (event) => this.setPlayerAttributes(event.data && event.data.player, { muteAudio: true }));
      this.trtc.on(events.REMOTE_AUDIO_VOLUME_UPDATE, (event) => {
        this.playerList = event.data && event.data.playerList || this.playerList;
      });
      this.trtc.on(events.KICKED_OUT, () => this.closeLm(false));
      this.trtc.on(events.ERROR, (event) => {
        if (event.data && event.data.code === 10002) {
          common_vendor.index.showToast({ title: "您当前已禁用麦克风，无法进行连麦", icon: "none" });
        }
      });
    },
    setPlayerAttributes(player, attrs) {
      if (!player || !this.trtc)
        return;
      const next = this.trtc.setPlayerAttributes(player.streamID, attrs);
      if (Array.isArray(next))
        this.playerList = next;
    },
    toggleCamera() {
      this.pusher = { ...this.pusher, enableCamera: !this.pusher.enableCamera };
      if (this.trtc && typeof this.trtc.setPusherAttributes === "function") {
        this.pusher = { ...this.pusher, ...this.trtc.setPusherAttributes({ enableCamera: this.pusher.enableCamera }) };
      }
    },
    switchCamera() {
      const instance = this.trtc && this.trtc.getPusherInstance && this.trtc.getPusherInstance();
      if (instance && typeof instance.switchCamera === "function") {
        instance.switchCamera({});
      }
    },
    closeLm(confirm = true) {
      const doClose = () => {
        pages_live_pageTools.requestWithVm(this, "_post", "live.trtc/userCloseLm", { live_id: this.liveId }).catch(() => {
        });
        this.exitRoom();
        setTimeout(() => this.$emit("closeLm"), 500);
      };
      if (!confirm) {
        common_vendor.index.showToast({ title: "您已被主播踢出连麦！", icon: "none" });
        doClose();
        return;
      }
      common_vendor.index.showModal({
        content: "是否确认退出与主播的连麦！",
        success: (res) => {
          if (res.confirm)
            doClose();
        }
      });
    },
    exitRoom() {
      platform_weixin_live.callTrtc(this.trtc, "exitRoom").catch(() => {
      });
    },
    pusherEventHandler(event) {
      this.trtc && this.trtc.pusherEventHandler && this.trtc.pusherEventHandler(event);
    },
    pusherNetStatus(event) {
      this.trtc && this.trtc.pusherNetStatusHandler && this.trtc.pusherNetStatusHandler(event);
    },
    pusherErrorHandler(event) {
      this.trtc && this.trtc.pusherErrorHandler && this.trtc.pusherErrorHandler(event);
    },
    pusherBGMStartHandler(event) {
      this.trtc && this.trtc.pusherBGMStartHandler && this.trtc.pusherBGMStartHandler(event);
    },
    pusherBGMProgressHandler(event) {
      this.trtc && this.trtc.pusherBGMProgressHandler && this.trtc.pusherBGMProgressHandler(event);
    },
    pusherBGMCompleteHandler(event) {
      this.trtc && this.trtc.pusherBGMCompleteHandler && this.trtc.pusherBGMCompleteHandler(event);
    },
    pusherAudioVolumeNotify(event) {
      this.trtc && this.trtc.pusherAudioVolumeNotify && this.trtc.pusherAudioVolumeNotify(event);
    },
    playerEventHandler(event) {
      this.trtc && this.trtc.playerEventHandler && this.trtc.playerEventHandler(event);
    },
    playerFullscreenChange(event) {
      this.trtc && this.trtc.playerFullscreenChange && this.trtc.playerFullscreenChange(event);
    },
    playerNetStatus() {
    },
    playerAudioVolumeNotify(event) {
      this.trtc && this.trtc.playerAudioVolumeNotify && this.trtc.playerAudioVolumeNotify(event);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.playerList, (player, k0, i0) => {
      return {
        a: player.streamID,
        b: player.src,
        c: player.mode || "RTC",
        d: player.autoplay !== false,
        e: player.muteAudio,
        f: player.muteVideo,
        g: player.orientation,
        h: player.objectFit || "fillCrop",
        i: common_vendor.o((...args) => $options.playerEventHandler && $options.playerEventHandler(...args), player.streamID),
        j: common_vendor.o((...args) => $options.playerNetStatus && $options.playerNetStatus(...args), player.streamID),
        k: common_vendor.o((...args) => $options.playerFullscreenChange && $options.playerFullscreenChange(...args), player.streamID),
        l: common_vendor.o((...args) => $options.playerAudioVolumeNotify && $options.playerAudioVolumeNotify(...args), player.streamID),
        m: player.streamID
      };
    }),
    b: $data.pusher.url,
    c: $data.pusher.mode || "RTC",
    d: $data.pusher.autopush,
    e: $data.pusher.enableCamera,
    f: $data.pusher.enableMic,
    g: $data.pusher.beautyLevel || $data.pusher.beauty,
    h: common_vendor.o((...args) => $options.pusherEventHandler && $options.pusherEventHandler(...args), "83"),
    i: common_vendor.o((...args) => $options.pusherNetStatus && $options.pusherNetStatus(...args), "38"),
    j: common_vendor.o((...args) => $options.pusherErrorHandler && $options.pusherErrorHandler(...args), "2a"),
    k: common_vendor.o((...args) => $options.pusherBGMStartHandler && $options.pusherBGMStartHandler(...args), "2e"),
    l: common_vendor.o((...args) => $options.pusherBGMProgressHandler && $options.pusherBGMProgressHandler(...args), "25"),
    m: common_vendor.o((...args) => $options.pusherBGMCompleteHandler && $options.pusherBGMCompleteHandler(...args), "be"),
    n: common_vendor.o((...args) => $options.pusherAudioVolumeNotify && $options.pusherAudioVolumeNotify(...args), "76"),
    o: common_vendor.t($data.pusher.enableCamera ? "关摄像头" : "开摄像头"),
    p: common_vendor.o((...args) => $options.toggleCamera && $options.toggleCamera(...args), "e1"),
    q: common_vendor.o((...args) => $options.switchCamera && $options.switchCamera(...args), "bf"),
    r: common_vendor.o(($event) => $options.closeLm(true), "de")
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5efee04a"]]);
wx.createComponent(Component);
