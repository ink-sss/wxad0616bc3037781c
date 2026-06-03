"use strict";
const common_vendor = require("../../common/vendor.js");
const pages_invitation_templates = require("./templates.js");
const api_user = require("../../api/user.js");
const stores_user = require("../../stores/user.js");
const platform_weixin_file = require("../../platform/weixin/file.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const payload = common_vendor.ref({
      link: "",
      miniProgramPath: "",
      roomCode: "",
      roomId: "",
      liveId: "",
      tenantId: "",
      shareCode: "",
      bindId: "",
      anchorName: "",
      anchorAvatar: "",
      liveName: "",
      pushTime: 0,
      scheduleTime: "",
      liveDate: "",
      inviterName: "",
      isReplay: false,
      replay: "",
      mode: "",
      liveType: "",
      videoId: "",
      video_id: "",
      replayVideoId: "",
      replay_video_id: ""
    });
    const activeIdx = common_vendor.ref(0);
    const qrcodeSrc = common_vendor.ref("");
    const navDomain = common_vendor.ref("小程序");
    const activeTemplate = common_vendor.computed(() => pages_invitation_templates.templates[activeIdx.value] || pages_invitation_templates.templates[0]);
    const displayTime = common_vendor.computed(() => {
      const schedule = payload.value.scheduleTime || payload.value.liveDate || "";
      if (schedule)
        return schedule.replace(/-/g, ".").replace(" ", "  ");
      return formatTime(payload.value.pushTime);
    });
    const avatarStyle = common_vendor.computed(() => {
      var _a, _b;
      const slot = ((_b = (_a = activeTemplate.value) == null ? void 0 : _a.slots) == null ? void 0 : _b.avatar) || {};
      const size = `${Number(slot.r || 0) * 200}%`;
      return {
        left: `${Number(slot.cx || 0) * 100}%`,
        top: `${Number(slot.cy || 0) * 100}%`,
        width: size,
        height: size,
        marginLeft: `-${Number(slot.r || 0) * 100}%`,
        marginTop: `-${Number(slot.r || 0) * 100}%`
      };
    });
    const qrcodeStyle = common_vendor.computed(() => {
      var _a, _b;
      const slot = ((_b = (_a = activeTemplate.value) == null ? void 0 : _a.slots) == null ? void 0 : _b.qrcode) || {};
      const size = `${Number(slot.size || 0) * 100}%`;
      return {
        left: `${Number(slot.cx || 0) * 100}%`,
        top: `${Number(slot.cy || 0) * 100}%`,
        width: size,
        height: size,
        marginLeft: `-${Number(slot.size || 0) * 50}%`,
        marginTop: `-${Number(slot.size || 0) * 50}%`
      };
    });
    common_vendor.onMounted(async () => {
      let data = {};
      try {
        data = common_vendor.index.getStorageSync("invitation_payload") || {};
      } catch (_) {
      }
      const inviter = await resolveInviterProfile();
      payload.value = {
        link: data.link || "/pages/broadcast/entry",
        miniProgramPath: data.miniProgramPath || buildMiniProgramPath(data),
        roomCode: data.roomCode || "",
        roomId: data.roomId || "",
        liveId: data.liveId || data.roomId || "",
        tenantId: data.tenantId || "",
        shareCode: data.shareCode || data.share_code || "",
        bindId: data.bindId || data.bind_id || "",
        anchorName: data.anchorName || "",
        anchorAvatar: inviter.avatar || data.anchorAvatar || "/static/icons/default.png",
        liveName: data.liveName || "",
        pushTime: Number(data.pushTime) || 0,
        scheduleTime: data.scheduleTime || "",
        liveDate: data.liveDate || "",
        inviterName: inviter.nick || data.anchorName || "游客",
        isReplay: isReplayPayload(data),
        replay: data.replay || "",
        mode: data.mode || "",
        liveType: data.liveType || data.live_type || "",
        videoId: data.videoId || data.video_id || data.replayVideoId || data.replay_video_id || "",
        video_id: data.video_id || data.videoId || data.replayVideoId || data.replay_video_id || "",
        replayVideoId: data.replayVideoId || data.videoId || data.video_id || data.replay_video_id || "",
        replay_video_id: data.replay_video_id || data.replayVideoId || data.videoId || data.video_id || ""
      };
      navDomain.value = normalizeNavDomain(data);
      await renderQrcode();
    });
    common_vendor.onShareAppMessage(() => {
      var _a;
      return {
        title: payload.value.liveName || "直播邀请",
        path: shareMiniProgramPath.value,
        imageUrl: ((_a = activeTemplate.value) == null ? void 0 : _a.bgImg) || ""
      };
    });
    common_vendor.onShareTimeline(() => {
      var _a;
      const path = shareMiniProgramPath.value;
      return {
        title: payload.value.liveName || "直播邀请",
        query: path.includes("?") ? path.split("?")[1] : "",
        imageUrl: ((_a = activeTemplate.value) == null ? void 0 : _a.bgImg) || ""
      };
    });
    const shareMiniProgramPath = common_vendor.computed(() => {
      return payload.value.miniProgramPath || buildMiniProgramPath(payload.value) || "/pages/broadcast/entry";
    });
    async function resolveInviterProfile() {
      let avatar = "";
      let nick = "";
      try {
        const userStore = stores_user.useUserStore();
        let userInfo = userStore.userInfo || {};
        const hasName = userInfo.nickname || userInfo.nickName || userInfo.name;
        if (userStore.token && (!userInfo.avatar || !hasName)) {
          try {
            const profile = await api_user.getProfile();
            if (profile) {
              userInfo = { ...userInfo, ...profile };
              userStore.setUserInfo(userInfo);
            }
          } catch (_) {
          }
        }
        avatar = userInfo.avatar || userInfo.headimgurl || userInfo.headImg || "";
        nick = userInfo.nickname || userInfo.nickName || userInfo.name || "";
      } catch (_) {
      }
      return { avatar, nick };
    }
    async function renderQrcode() {
      const text = payload.value.link || "/pages/broadcast/entry";
      try {
        qrcodeSrc.value = await common_vendor.browser.toDataURL(text, {
          width: 360,
          margin: 1,
          color: { dark: "#000000", light: "#FFFFFF" }
        });
      } catch (error) {
        console.warn("[Invitation] QR generate fail:", error);
        qrcodeSrc.value = "";
      }
    }
    function selectTemplate(idx) {
      activeIdx.value = idx;
    }
    function formatTime(ts) {
      if (!ts)
        return "";
      const d = new Date(Number(ts) * 1e3);
      if (Number.isNaN(d.getTime()))
        return "";
      const pad = (n) => n < 10 ? `0${n}` : `${n}`;
      return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}  ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
    function slotText(text, slot = {}, defaultMax = 10) {
      const value = String(text || "");
      const max = Number(slot.maxLen || defaultMax);
      return value.length > max ? `${value.slice(0, Math.max(max - 1, 1))}...` : value;
    }
    function slotTextStyle(slot = {}) {
      if (!slot)
        return {};
      const style = {
        color: slot.color || "#FFFFFF",
        fontSize: `${Math.round(Number(slot.fontPct || 0.02) * 1e3)}rpx`,
        textAlign: slot.cx != null ? "center" : "left"
      };
      if (slot.cx != null) {
        style.left = `${Number(slot.cx) * 100}%`;
        style.top = `${Number(slot.cy || 0) * 100}%`;
        style.transform = "translate(-50%, -50%)";
      } else {
        style.left = `${Number(slot.x || 0) * 100}%`;
        style.top = `${Number(slot.y || 0) * 100}%`;
        style.transform = "translateY(-50%)";
      }
      return style;
    }
    function copyLink() {
      const link = payload.value.link || "/pages/broadcast/entry";
      common_vendor.index.setClipboardData({
        data: link,
        success: () => common_vendor.index.showToast({ title: "链接已复制", icon: "success" }),
        fail: () => common_vendor.index.showToast({ title: "复制失败", icon: "none" })
      });
    }
    async function saveQrcode() {
      if (!qrcodeSrc.value) {
        common_vendor.index.showToast({ title: "二维码生成失败", icon: "none" });
        return;
      }
      try {
        await platform_weixin_file.saveImageUrlToAlbum(qrcodeSrc.value, `live-invitation-${Date.now()}.png`);
        common_vendor.index.showToast({ title: "已保存", icon: "success" });
      } catch (error) {
        console.warn("[Invitation] save qrcode fail:", error);
        common_vendor.index.showToast({ title: "请长按二维码保存", icon: "none" });
      }
    }
    function normalizeNavDomain(data = {}) {
      const raw = data.navDomain || data.domain || data.host || data.tenantName || data.liveName || "小程序";
      return String(raw).replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    }
    function buildMiniProgramPath(data = {}) {
      const params = [];
      const roomCode = data.roomCode || "";
      const liveId = data.liveId || data.roomId || "";
      const tenantId = data.tenantId || "";
      const shareCode = data.shareCode || data.share_code || "";
      const bindId = data.bindId || data.bind_id || "";
      const replayVideoId = data.replayVideoId || data.replay_video_id || data.videoId || data.video_id || "";
      if (roomCode)
        params.push(`roomCode=${encodeURIComponent(roomCode)}`);
      if (liveId)
        params.push(`liveId=${encodeURIComponent(liveId)}`);
      if (tenantId)
        params.push(`tenantId=${encodeURIComponent(tenantId)}`);
      if (shareCode && shareCode !== roomCode)
        params.push(`shareCode=${encodeURIComponent(shareCode)}`);
      if (bindId)
        params.push(`bindId=${encodeURIComponent(bindId)}`);
      appendReplayParams(params, isReplayPayload(data), replayVideoId);
      return `/pages/broadcast/entry${params.length ? `?${params.join("&")}` : ""}`;
    }
    function isReplayPayload(data = {}) {
      return data.isReplay === true || String(data.replay || "") === "1" || String(data.mode || "").toLowerCase() === "replay" || String(data.liveType || data.live_type || "").toLowerCase() === "replay";
    }
    function appendReplayParams(params, isReplay, replayVideoId) {
      if (!isReplay)
        return;
      params.push("mode=replay");
      params.push("replay=1");
      params.push("liveType=replay");
      const videoId = String(replayVideoId || "").trim();
      if (!videoId || videoId === "0")
        return;
      const encoded = encodeURIComponent(videoId);
      params.push(`videoId=${encoded}`);
      params.push(`video_id=${encoded}`);
      params.push(`replayVideoId=${encoded}`);
      params.push(`replay_video_id=${encoded}`);
    }
    function goBack() {
      common_vendor.index.navigateBack({
        fail: () => {
          common_vendor.index.redirectTo({ url: shareMiniProgramPath.value });
        }
      });
    }
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
      return common_vendor.e({
        a: common_vendor.o(goBack, "b1"),
        b: common_vendor.t(navDomain.value),
        c: activeTemplate.value
      }, activeTemplate.value ? common_vendor.e({
        d: activeTemplate.value.bgImg,
        e: payload.value.anchorAvatar
      }, payload.value.anchorAvatar ? {
        f: payload.value.anchorAvatar,
        g: common_vendor.s(avatarStyle.value)
      } : {}, {
        h: payload.value.inviterName
      }, payload.value.inviterName ? {
        i: common_vendor.t(slotText(payload.value.inviterName, (_a = activeTemplate.value.slots) == null ? void 0 : _a.inviterName, 8)),
        j: ((_c = (_b = activeTemplate.value.slots) == null ? void 0 : _b.inviterName) == null ? void 0 : _c.bold) ? 1 : "",
        k: common_vendor.s(slotTextStyle((_d = activeTemplate.value.slots) == null ? void 0 : _d.inviterName))
      } : {}, {
        l: common_vendor.t(slotText(payload.value.liveName || "精彩直播", (_e = activeTemplate.value.slots) == null ? void 0 : _e.liveName, 12)),
        m: ((_g = (_f = activeTemplate.value.slots) == null ? void 0 : _f.liveName) == null ? void 0 : _g.bold) ? 1 : "",
        n: common_vendor.s(slotTextStyle((_h = activeTemplate.value.slots) == null ? void 0 : _h.liveName)),
        o: common_vendor.t(displayTime.value || "敬请期待"),
        p: ((_j = (_i = activeTemplate.value.slots) == null ? void 0 : _i.time) == null ? void 0 : _j.bold) ? 1 : "",
        q: common_vendor.s(slotTextStyle((_k = activeTemplate.value.slots) == null ? void 0 : _k.time)),
        r: qrcodeSrc.value
      }, qrcodeSrc.value ? {
        s: qrcodeSrc.value,
        t: common_vendor.s(qrcodeStyle.value),
        v: common_vendor.o(saveQrcode, "5b")
      } : {}, {
        w: `${activeTemplate.value.aspectRatio || 750 / 1334}`
      }) : {}, {
        x: common_vendor.o(copyLink, "ad"),
        y: common_vendor.o(saveQrcode, "82"),
        z: common_vendor.f(common_vendor.unref(pages_invitation_templates.templates), (tpl, idx, i0) => {
          return common_vendor.e({
            a: tpl.bgImg,
            b: idx === activeIdx.value
          }, idx === activeIdx.value ? {} : {}, {
            c: tpl.id,
            d: idx === activeIdx.value ? 1 : "",
            e: common_vendor.o(($event) => selectTemplate(idx), tpl.id)
          });
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-97fad488"]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
