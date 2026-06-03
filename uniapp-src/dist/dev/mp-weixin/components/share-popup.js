"use strict";
const common_vendor = require("../common/vendor.js");
const common_assets = require("../common/assets.js");
const services_liveShare = require("../services/live-share.js");
const services_h5AuthContext = require("../services/h5-auth-context.js");
const platform_weixin_file = require("../platform/weixin/file.js");
const _sfc_main = {
  __name: "share-popup",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    // [2026-05-21] 直播间 ID，用于拉取分销员专属分享链接
    roomId: {
      type: [Number, String],
      default: 0
    },
    roomCode: {
      type: String,
      default: ""
    },
    shareCode: {
      type: String,
      default: ""
    },
    bindId: {
      type: String,
      default: ""
    },
    tenantId: {
      type: [Number, String],
      default: 0
    },
    isDistributor: {
      type: Boolean,
      default: false
    },
    distributorStatus: {
      type: Number,
      default: 0
    },
    linkUrl: {
      type: String,
      default: ""
    },
    // [2026-05-21] 邀请函所需业务字段：主播昵称、头像、直播间名、开播时间(秒级时间戳)
    anchorName: {
      type: String,
      default: ""
    },
    anchorAvatar: {
      type: String,
      default: ""
    },
    liveName: {
      type: String,
      default: ""
    },
    // [2026-05-21] 微信分享卡片缩略图：优先 liveCover、降级 anchorAvatar
    liveCover: {
      type: String,
      default: ""
    },
    pushTime: {
      type: [Number, String],
      default: 0
    },
    scheduleTime: {
      type: String,
      default: ""
    },
    liveDate: {
      type: String,
      default: ""
    },
    isReplay: {
      type: Boolean,
      default: false
    },
    replayVideoId: {
      type: [Number, String],
      default: ""
    }
  },
  emits: ["close", "share"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const activePanel = common_vendor.ref("main");
    const linkType = common_vendor.ref("long");
    const currentLink = common_vendor.ref("");
    const loadedShareUrl = common_vendor.ref("");
    const loadedShareCode = common_vendor.ref("");
    const shareUrlLoading = common_vendor.ref(false);
    const miniProgramRoomLink = common_vendor.computed(() => {
      const params = [];
      if (props.roomCode)
        params.push(`roomCode=${encodeURIComponent(props.roomCode)}`);
      if (props.roomId)
        params.push(`liveId=${encodeURIComponent(props.roomId)}`);
      if (props.tenantId)
        params.push(`tenantId=${encodeURIComponent(props.tenantId)}`);
      const code = loadedShareCode.value || props.shareCode || "";
      if (code && code !== props.roomCode)
        params.push(`shareCode=${encodeURIComponent(code)}`);
      const bindId = props.bindId || services_h5AuthContext.readBindId();
      if (bindId)
        params.push(`bindId=${encodeURIComponent(bindId)}`);
      appendReplayParams(params, props.isReplay, props.replayVideoId);
      return `/pages/broadcast/entry${params.length ? `?${params.join("&")}` : ""}`;
    });
    const canUseDistributorShare = common_vendor.computed(() => {
      return props.isDistributor && Number(props.distributorStatus) === 1;
    });
    const resolvedLongLink = common_vendor.computed(() => {
      if (loadedShareUrl.value)
        return withReplayParams(loadedShareUrl.value);
      if (props.linkUrl)
        return withReplayParams(props.linkUrl);
      return miniProgramRoomLink.value;
    });
    const linkStatusText = common_vendor.computed(() => {
      return linkType.value === "short" ? "短链接已复制" : "生成链接";
    });
    const qrcodeSrc = common_vendor.ref("");
    common_vendor.watch(
      [() => currentLink.value, () => resolvedLongLink.value],
      async ([cur, long]) => {
        const text = cur || long;
        if (!text) {
          qrcodeSrc.value = "";
          return;
        }
        try {
          qrcodeSrc.value = await common_vendor.browser.toDataURL(text, {
            width: 360,
            margin: 1,
            color: { dark: "#000000", light: "#FFFFFF" }
          });
        } catch (e) {
          console.warn("[share-popup] QR generate fail:", e);
          qrcodeSrc.value = "";
        }
      },
      { immediate: true }
    );
    common_vendor.watch(
      () => props.visible,
      (val) => {
        if (val) {
          loadShareUrl();
        } else {
          activePanel.value = "main";
          linkType.value = "long";
          currentLink.value = "";
          loadedShareUrl.value = "";
          loadedShareCode.value = "";
        }
      }
    );
    async function loadShareUrl() {
      loadedShareUrl.value = "";
      loadedShareCode.value = "";
      if (!canUseDistributorShare.value)
        return;
      const rid = Number(props.roomId);
      if (!rid)
        return;
      shareUrlLoading.value = true;
      try {
        const res = await services_liveShare.getLiveDistributorShareUrl(rid);
        const data = (res == null ? void 0 : res.data) || res || {};
        const url = data.shareUrl || data.share_url || "";
        const code = data.shareCode || data.share_code || "";
        if (url)
          loadedShareUrl.value = url;
        if (code)
          loadedShareCode.value = code;
      } catch (e) {
        console.warn("[share-popup] getDistributorShareUrl fail:", e);
      } finally {
        shareUrlLoading.value = false;
      }
    }
    async function ensureShareUrlReady() {
      if (!shareUrlLoading.value)
        return;
      common_vendor.index.showLoading({ title: "正在生成分享链接..." });
      try {
        while (shareUrlLoading.value) {
          await new Promise((r) => setTimeout(r, 50));
        }
      } finally {
        common_vendor.index.hideLoading();
      }
    }
    function close() {
      emit("close");
    }
    function buildInvitationPayload() {
      const replayVideoId = normalizeReplayVideoId(props.replayVideoId);
      return {
        link: resolvedLongLink.value,
        miniProgramPath: miniProgramRoomLink.value,
        shareCode: loadedShareCode.value || props.shareCode || "",
        bindId: props.bindId || services_h5AuthContext.readBindId() || "",
        roomCode: props.roomCode || "",
        roomId: props.roomId || "",
        liveId: props.roomId || "",
        tenantId: props.tenantId || "",
        anchorName: props.anchorName,
        anchorAvatar: props.anchorAvatar,
        liveName: props.liveName,
        pushTime: Number(props.pushTime) || 0,
        scheduleTime: props.scheduleTime || "",
        liveDate: props.liveDate || "",
        isReplay: !!props.isReplay,
        replay: props.isReplay ? "1" : "",
        mode: props.isReplay ? "replay" : "",
        liveType: props.isReplay ? "replay" : "",
        videoId: replayVideoId,
        video_id: replayVideoId,
        replayVideoId,
        replay_video_id: replayVideoId
      };
    }
    function normalizeReplayVideoId(value) {
      const text = String(value || "").trim();
      return text && text !== "0" ? text : "";
    }
    function appendReplayParams(params, isReplay, replayVideoId) {
      if (!isReplay)
        return;
      params.push("mode=replay");
      params.push("replay=1");
      params.push("liveType=replay");
      const videoId = normalizeReplayVideoId(replayVideoId);
      if (!videoId)
        return;
      const encoded = encodeURIComponent(videoId);
      params.push(`videoId=${encoded}`);
      params.push(`video_id=${encoded}`);
      params.push(`replayVideoId=${encoded}`);
      params.push(`replay_video_id=${encoded}`);
    }
    function withReplayParams(url) {
      if (!props.isReplay || !url)
        return url;
      const [base, hash = ""] = String(url).split("#");
      const target = hash && hash.startsWith("/") ? hash : base;
      const [path, query = ""] = target.split("?");
      const params = query ? query.split("&").filter(Boolean) : [];
      const existingKeys = new Set(
        params.map((item) => item.split("=")[0]).filter(Boolean)
      );
      const pushIfMissing = (key, value) => {
        if (existingKeys.has(key))
          return;
        params.push(`${key}=${encodeURIComponent(value)}`);
        existingKeys.add(key);
      };
      pushIfMissing("mode", "replay");
      pushIfMissing("replay", "1");
      pushIfMissing("liveType", "replay");
      const videoId = normalizeReplayVideoId(props.replayVideoId);
      if (videoId) {
        pushIfMissing("videoId", videoId);
        pushIfMissing("video_id", videoId);
        pushIfMissing("replayVideoId", videoId);
        pushIfMissing("replay_video_id", videoId);
      }
      const next = `${path}${params.length ? `?${params.join("&")}` : ""}`;
      if (hash && hash.startsWith("/"))
        return `${base}#${next}`;
      return hash ? `${next}#${hash}` : next;
    }
    function navigateToInvitation() {
      common_vendor.index.navigateTo({
        url: "/pages/invitation/index",
        fail: () => {
          common_vendor.index.redirectTo({
            url: "/pages/invitation/index",
            fail: () => {
              common_vendor.index.showToast({ title: "邀请函打开失败", icon: "none" });
            }
          });
        }
      });
    }
    async function onShare(type) {
      await ensureShareUrlReady();
      emit("share", {
        type,
        shareCode: loadedShareCode.value || props.shareCode || "",
        shareUrl: resolvedLongLink.value || "",
        miniProgramPath: miniProgramRoomLink.value
      });
      if (type === "link") {
        activePanel.value = "link";
        linkType.value = "long";
        currentLink.value = resolvedLongLink.value;
        common_vendor.index.setClipboardData({
          data: currentLink.value,
          success: () => {
          },
          fail: () => {
            common_vendor.index.showToast({ title: "复制失败", icon: "none" });
          }
        });
        return;
      }
      if (type === "qrcode") {
        activePanel.value = "qrcode";
        linkType.value = "long";
        currentLink.value = resolvedLongLink.value;
        return;
      }
      if (type === "wechat") {
        onWechatShare();
        return;
      }
      if (type === "invitation") {
        try {
          common_vendor.index.setStorageSync("invitation_payload", buildInvitationPayload());
        } catch (_) {
        }
        close();
        navigateToInvitation();
        return;
      }
    }
    async function onMiniProgramWechatShare() {
      var _a, _b;
      await ensureShareUrlReady();
      emit("share", {
        type: "wechat",
        shareCode: loadedShareCode.value || props.shareCode || "",
        shareUrl: resolvedLongLink.value || "",
        miniProgramPath: miniProgramRoomLink.value
      });
      try {
        (_b = (_a = common_vendor.index).showShareMenu) == null ? void 0 : _b.call(_a, {
          withShareTicket: true,
          menus: ["shareAppMessage", "shareTimeline"]
        });
      } catch (e) {
      }
      close();
    }
    async function waitMiniProgramShareReady() {
      await ensureShareUrlReady();
      common_vendor.index.showToast({ title: "请再次点击分享", icon: "none" });
    }
    async function onWechatShare() {
      var _a, _b;
      await ensureShareUrlReady();
      if (!resolvedLongLink.value) {
        common_vendor.index.showToast({ title: "分享链接获取失败", icon: "none" });
        return;
      }
      try {
        (_b = (_a = common_vendor.index).showShareMenu) == null ? void 0 : _b.call(_a, {
          withShareTicket: true,
          menus: ["shareAppMessage", "shareTimeline"]
        });
      } catch (e) {
      }
      activePanel.value = "wechat-guide";
    }
    function copyCurrentLink() {
      const link = currentLink.value || resolvedLongLink.value;
      if (!link) {
        common_vendor.index.showToast({ title: "链接获取失败", icon: "none" });
        return;
      }
      common_vendor.index.setClipboardData({
        data: link,
        success: () => {
          common_vendor.index.showToast({ title: "链接已复制", icon: "success" });
        },
        fail: () => {
          common_vendor.index.showToast({ title: "复制失败", icon: "none" });
        }
      });
    }
    async function saveQrcode() {
      const url = qrcodeSrc.value;
      if (!url) {
        common_vendor.index.showToast({ title: "二维码生成失败", icon: "none" });
        return;
      }
      try {
        await platform_weixin_file.saveImageUrlToAlbum(url, `live-room-${props.roomId || Date.now()}.png`);
        common_vendor.index.showToast({ title: "已保存", icon: "success" });
      } catch (error) {
        console.warn("[share-popup] save qrcode fail:", error);
        common_vendor.index.showToast({ title: "请长按图片保存", icon: "none" });
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.visible
      }, __props.visible ? common_vendor.e({
        b: activePanel.value === "main"
      }, activePanel.value === "main" ? common_vendor.e({
        c: common_vendor.o(close, "b2"),
        d: common_assets._imports_0$15,
        e: common_vendor.o(($event) => onShare("invitation"), "ef"),
        f: !shareUrlLoading.value
      }, !shareUrlLoading.value ? {
        g: common_assets._imports_1$6,
        h: common_vendor.o(onMiniProgramWechatShare, "72")
      } : {
        i: common_assets._imports_1$6,
        j: common_vendor.o(waitMiniProgramShareReady, "b7")
      }, {
        k: common_assets._imports_2$4,
        l: common_vendor.o(($event) => onShare("link"), "74"),
        m: common_assets._imports_3$2,
        n: common_vendor.o(($event) => onShare("qrcode"), "b0"),
        o: common_vendor.o(() => {
        }, "52")
      }) : activePanel.value === "link" ? {
        q: common_vendor.t(linkStatusText.value),
        r: common_vendor.o(close, "88"),
        s: common_vendor.t(currentLink.value),
        t: common_vendor.o(copyCurrentLink, "0c"),
        v: common_vendor.o(() => {
        }, "88")
      } : activePanel.value === "qrcode" ? {
        x: common_vendor.o(close, "43"),
        y: qrcodeSrc.value,
        z: common_vendor.o(saveQrcode, "63"),
        A: common_vendor.o(saveQrcode, "06"),
        B: common_vendor.o(() => {
        }, "b3")
      } : activePanel.value === "wechat-guide" ? {
        D: common_vendor.o(close, "a3")
      } : {}, {
        p: activePanel.value === "link",
        w: activePanel.value === "qrcode",
        C: activePanel.value === "wechat-guide",
        E: common_vendor.n(activePanel.value === "qrcode" ? "mask-center" : ""),
        F: common_vendor.o(close, "cc")
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f0f8531d"]]);
wx.createComponent(Component);
