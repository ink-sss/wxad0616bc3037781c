Object.defineProperty(exports, Symbol.toStringTag, {
  value: "Module"
});
var t = require("./common/vendor.js"),
  a = require("./common/utils.js"),
  e = require("./env/config.js"),
  i = require("./common/onfire.js"),
  n = require("./common/gotopage.js"),
  o = require("./utils/request.js"),
  r = require("./utils/validator.js"),
  s = require("./store/index.js");
Math;
var l = {
    globalData: {
      appThis: !1,
      is_login: !1,
      SDKAppID: 0,
      imChat: null,
      imIsReady: !1,
      imIsLoggingIn: !1,
      imLoginRetryCount: 0,
      imLoginRetryTimer: null,
      imMaxLoginRetry: 5,
      imManualLogout: !1,
      imUserId: null,
      imUserSig: null,
      imPrefix: "gk_",
      group_id: "",
      waitGoGroupId: "",
      waitGroupCallback: "",
      imMessageReceived: t.TencentCloudChat.EVENT.MESSAGE_RECEIVED,
      conversationType: t.TencentCloudChat.TYPES.CONV_GROUP,
      msgText: t.TencentCloudChat.TYPES.MSG_TEXT,
      msgImage: t.TencentCloudChat.TYPES.MSG_IMAGE,
      msgGrpSysNotice: t.TencentCloudChat.TYPES.MSG_GRP_SYS_NOTICE,
      live_id: 0,
      shop_supplier_id: 0,
      app_id: "",
      live_page: "1",
      $post: null
    },
    onLaunch: function(t) {
      this.globalData.appThis = this, this.globalData.app_id = e.config.app_id, this.updateManager(), this.onStartupScene(t.query), this.getNav()
    },
    onShow: function() {},
    onHide: function() {
      var a = t.index.getStorageSync("exitGroup");
      a && "no" == a || this.exitGroup(this.globalData.group_id.substr(3))
    },
    methods: {
      createIm: function() {
        this.clearImLoginRetryTimer(), this.globalData.imLoginRetryCount = 0, this.globalData.imManualLogout = !1, this.globalData.imChat = t.TencentCloudChat.create({
          SDKAppID: this.globalData.SDKAppID
        }), this.globalData.imChat.setLogLevel(1), this.globalData.imChat.registerPlugin({
          "tim-upload-plugin": t.TIMUploadPlugin
        }), this.globalData.imChat.on(t.TencentCloudChat.EVENT.SDK_READY, this.imReday), this.imLogin()
      },
      imReday: function(t) {
        this.globalData.imIsReady = !0, this.globalData.imIsLoggingIn = !1, this.globalData.imLoginRetryCount = 0, this.clearImLoginRetryTimer(), "" != this.globalData.waitGoGroupId && this.addGroup(this.globalData.waitGoGroupId, this.globalData.waitGroupCallback)
      },
      clearImLoginRetryTimer: function() {
        this.globalData.imLoginRetryTimer && (clearTimeout(this.globalData.imLoginRetryTimer), this.globalData.imLoginRetryTimer = null)
      },
      scheduleImLoginRetry: function() {
        var t = this,
          a = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "";
        if (!this.globalData.imManualLogout)
          if (this.globalData.imLoginRetryCount >= this.globalData.imMaxLoginRetry) console.error("[IM] 登录重试已达上限，停止重连", a);
          else {
            this.clearImLoginRetryTimer();
            var e = this.globalData.imLoginRetryCount + 1,
              i = [1e3, 2e3, 4e3, 8e3, 12e3],
              n = i[Math.min(e - 1, i.length - 1)];
            this.globalData.imLoginRetryCount = e, console.warn("[IM] 登录失败，".concat(n, "ms 后进行第 ").concat(e, " 次重试"), a), this.globalData.imLoginRetryTimer = setTimeout((function() {
              t.globalData.imLoginRetryTimer = null, t.imLogin()
            }), n)
          }
      },
      imLogout: function(t) {
        this.globalData.imManualLogout = !0, this.globalData.imIsLoggingIn = !1, this.globalData.imLoginRetryCount = 0, this.clearImLoginRetryTimer(), this.globalData.imIsReady ? (this.globalData.is_login = !1, this.globalData.imIsReady = !1, this.globalData.imChat.logout().then((function(a) {
          "function" == typeof t && t()
        })).catch((function(t) {
          console.warn("logout error:", t)
        }))) : "function" == typeof t && t()
      },
      imLogin: function() {
        var t = this;
        if (this.globalData.imChat) {
          if (!this.globalData.imIsLoggingIn)
            if (this.globalData.SDKAppID && this.globalData.imUserId && this.globalData.imUserSig) {
              this.globalData.imManualLogout = !1, this.globalData.imIsLoggingIn = !0;
              var a = function() {
                return t.globalData.imChat.login({
                  userID: t.globalData.imUserId,
                  userSig: t.globalData.imUserSig
                })
              };
              (this.globalData.imIsReady ? this.globalData.imChat.logout().catch((function(t) {
                console.warn("[IM] 重登前logout失败，继续login", t)
              })).then((function() {
                return a()
              })) : a()).then((function() {
                t.globalData.imLoginRetryCount = 0, t.clearImLoginRetryTimer()
              })).catch((function(a) {
                t.globalData.imIsReady = !1, console.error("[IM] 登录失败", a), t.scheduleImLoginRetry(a)
              })).finally((function() {
                t.globalData.imIsLoggingIn = !1
              }))
            } else console.warn("[IM] 登录跳过：缺少必要参数", {
              SDKAppID: this.globalData.SDKAppID,
              imUserId: this.globalData.imUserId
            })
        } else console.warn("[IM] 登录跳过：IM实例未初始化")
      },
      addGroup: function(a, e) {
        var i = this;
        if (!this.globalData.imIsReady) return this.globalData.waitGoGroupId = a, void(this.globalData.waitGroupCallback = e);
        this.globalData.group_id = this.globalData.imPrefix + a, this.globalData.imChat.joinGroup({
          groupID: this.globalData.imPrefix + a,
          type: t.TencentCloudChat.TYPES.GRP_AVCHATROOM
        }).then((function(a) {
          switch (i.globalData.waitGoGroupId = "", i.globalData.waitGroupCallback = "", a.data.status) {
            case t.TencentCloudChat.TYPES.JOIN_STATUS_WAIT_APPROVAL:
              break;
            case t.TencentCloudChat.TYPES.JOIN_STATUS_SUCCESS:
            case t.TencentCloudChat.TYPES.JOIN_STATUS_ALREADY_IN_GROUP:
              "function" == typeof e && e()
          }
        })).catch((function(t) {
          console.error("加群失败了------------------"), console.error(t)
        }))
      },
      exitGroup: function() {
        var a = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "",
          e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
        if ("" != this.globalData.group_id) {
          "" == a && (a = this.globalData.group_id.substr(3));
          var i = t.index.getStorageSync("exitImGroup");
          if (i && "no" == i) return;
          var n = this;
          this.globalData.imChat.quitGroup(this.globalData.imPrefix + a).then((function(a) {
            t.index.setStorageSync("exitImGroup", (new Date).getTime()), n.globalData.group_id = "", "function" == typeof e && e()
          })).catch((function(t) {
            console.warn("quitGroup error:", t)
          }))
        }
      },
      getWxopen: function() {
        var a = this,
          e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0],
          i = this,
          n = this.config.app_url;
        t.index.request({
          url: n + "/index.php/api/Index/loginSetting",
          data: {
            app_id: this.config.app_id,
            appid: this.config.appid,
            token: this.config.token
          },
          success: function(n) {
            1 == n.data.code && (i.globalData.SDKAppID = n.data.data.im_setting.im_sdk_appid, i.globalData.imUserId = n.data.data.im_setting.im_user_id, i.globalData.imUserSig = n.data.data.im_setting.im_user_sig, i.createIm(), i.globalData.is_login = n.data.data.setting.is_login, i.globalData.live_page = n.data.data.setting.live_page, t.index.setStorageSync("mpState", n.data.data.setting.mp_open), t.index.setStorageSync("wxOpen", n.data.data.setting.wx_open), t.index.setStorageSync("wxBinding", n.data.data.setting.wx_phone), t.index.setStorageSync("smsOpen", n.data.data.setting.h5_sms_open), t.index.setStorageSync("setting_" + a.config.app_id, n.data.data.setting), a.updateVersion(n.data.data.appVersion), "function" == typeof e && e())
          }
        })
      },
      isFirstEnter: function() {
        var a = t.index.getStorageSync("firstEnter");
        t.index.getSystemInfo({
          success: function(e) {
            "ios" != e.platform || a || t.index.navigateTo({
              url: "/pages/privacy/privacy"
            })
          }
        })
      },
      updateManager: function() {
        var a = t.index.getUpdateManager();
        a.onCheckForUpdate((function(e) {
          e.hasUpdate && a.onUpdateReady((function(e) {
            t.index.showModal({
              title: "更新提示",
              content: "新版本已经准备好，即将重启应用",
              showCancel: !1,
              success: function(t) {
                t.confirm && a.applyUpdate()
              }
            })
          }))
        })), a.onUpdateFailed((function(a) {
          t.index.showModal({
            title: "更新提示",
            content: "检查到有新版本，但下载失败，请检查网络设置",
            showCancel: !1
          })
        }))
      },
      onStartupScene: function(e) {
        var i = a.utils.getSceneData(e),
          n = e.referee_id;
        n > 0 && t.index.setStorageSync("referee_id", n);
        var o = i.uid;
        o > 0 && t.index.setStorageSync("referee_id", o), null != i.live_id && null != i.live_id && i.live_id > 0 && (this.globalData.live_id = i.live_id), i.shop_supplier_id && (this.globalData.shop_supplier_id = i.shop_supplier_id), i.me || t.index.removeStorageSync("me")
      },
      getNav: function() {
        var a = this,
          e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
        this.getWxopen();
        var i = this.config.app_url;
        t.index.request({
          url: i + "/index.php/api/index/nav",
          data: {
            app_id: this.config.app_id,
            appid: this.config.appid
          },
          success: function(i) {
            var n = i.data.data.vars.data,
              o = i.data.data.theme.theme,
              r = i.data.data.points_name;
            a.$store.commit("changeTheme", o), a.$store.commit("changePoints", r), t.index.setStorageSync("theme", o), t.index.setStorageSync("TabBar", n), t.index.setStorageSync("tabInited", n.is_auto), t.index.setStorageSync("client_ip", i.data.data.client_ip), a.setTabBarLinks(n, o), "function" == typeof e && e()
          }
        })
      },
      updateWgt: function(a) {
        t.index.showModal({
          title: "版本更新",
          content: "检查到有新版本，请点击更新",
          confirmText: "更新",
          showCancel: !1,
          success: function(e) {
            if (e.confirm) {
              var i = plus.downloader.createDownload(a, {}, (function(a, e) {
                t.index.showToast({
                  title: "下载完成",
                  mask: !1,
                  duration: 1e3
                }), 200 == e ? plus.runtime.install(a.filename, {
                  force: !0
                }, (function() {
                  plus.nativeUI.alert("已更新至最新版本，确定后将重启应用", (function() {
                    plus.runtime.restart()
                  }), "更新提示", "确定")
                }), (function(a) {
                  t.index.showToast({
                    title: "安装失败-01",
                    mask: !1,
                    duration: 1500
                  })
                })) : t.index.showToast({
                  title: "更新失败-02",
                  mask: !1,
                  duration: 1500
                })
              }));
              try {
                i.start();
                var n = 0,
                  o = plus.nativeUI.showWaiting("正在下载");
                i.addEventListener("statechanged", (function(t, a) {
                  switch (t.state) {
                    case 1:
                      o.setTitle("正在下载");
                      break;
                    case 2:
                      o.setTitle("已连接到服务器");
                      break;
                    case 3:
                      n = parseInt(parseFloat(t.downloadedSize) / parseFloat(t.totalSize) * 100), o.setTitle("  正在下载" + n + "%  ");
                      break;
                    case 4:
                      plus.nativeUI.closeWaiting()
                  }
                }))
              } catch (a) {
                plus.nativeUI.closeWaiting(), t.index.showToast({
                  title: "更新失败-03",
                  mask: !1,
                  duration: 1500
                })
              }
            }
          }
        })
      },
      updateVersion: function(a) {
        var e = "",
          i = t.index.getAccountInfoSync();
        a ? i.miniProgram.version && i.miniProgram.version != a && (e = i.miniProgram.version) : i.miniProgram.version && (e = i.miniProgram.version), e && t.index.request({
          url: this.config.app_url + "/index.php/api/index/updateVersion",
          data: {
            app_id: this.config.app_id,
            appid: this.config.appid,
            version: e
          },
          success: function(t) {}
        })
      }
    }
  },
  g = function() {
    return "./components/header.js"
  },
  c = function() {
    return "./components/liveloading.js"
  },
  u = function() {
    return "./components/tabbar/footTabbar.js"
  };

function d() {
  var a = t.createSSRApp(l);
  a.component("header-bar", g), a.component("request-loading", c), a.component("tabBar", u), a.use(s.store);
  var d = t.createPinia();
  return a.use(d), a.config.globalProperties.$store = s.store, a.config.globalProperties.footTabberData = {
    active: "home"
  }, a.config.globalProperties.$fire = new i.OnFire, a.config.globalProperties.config = e.config, a.config.globalProperties.websiteUrl = e.config.app_url, a.config.globalProperties.app_id = e.config.app_id, a.config.globalProperties.gotoPage = n.gotopage, a.config.globalProperties.font_url = e.config.font_url, a.config.globalProperties.points_name = function(t) {
    if (t) {
      var a = new RegExp("积分", "g");
      return t.replace(a, s.store.state.points_name)
    }
    return s.store.state.points_name
  }, o.requestFun(a), r.validator(a), a.config.globalProperties.theme = function() {
    return "theme" + this.$store.state.theme || ""
  }, a.config.globalProperties.getTabBarLinks = function() {
    var a = this,
      e = t.index.getStorageSync("TabBar"),
      i = t.index.getStorageSync("tabInited"),
      n = t.index.getStorageSync("theme");
    null != e && "" != e && "undefined" != i ? this.setTabBarLinks(e, n) : t.index.request({
      url: this.config.app_url + "/index.php/api/index/nav",
      data: {
        app_id: this.config.app_id,
        appid: this.config.appid
      },
      success: function(e) {
        var i = e.data.data.vars.data,
          n = e.data.data.theme.theme;
        a.$store.commit("changeTheme", n), t.index.setStorageSync("theme", n), t.index.setStorageSync("TabBar", i), t.index.setStorageSync("tabInited", i.is_auto), a.setTabBarLinks(i, n)
      }
    })
  }, a.config.globalProperties.setTabBarLinks = function(t, a) {
    t.list = []
  }, a.config.globalProperties.tabInited = function() {
    return t.index.getStorageSync("tabInited")
  }, a.config.globalProperties.getThemeColor = function() {
    return ["#ff5704", "#19ad57", "#ffcc00", "#33a7ff", "#e4e4e4", "#c8ba97", "#623ceb"][this.$store.state.theme]
  }, a.config.globalProperties.navBack = function() {
    try {
      t.index.navigateBack({
        fail: function() {
          t.index.switchTab({
            url: "/pages/index/index"
          })
        }
      })
    } catch (a) {
      t.index.switchTab({
        url: "/pages/index/index"
      })
    }
  }, {
    app: a,
    Pinia: t.Pinia
  }
}
d().app.mount("#app"), exports.createApp = d;
