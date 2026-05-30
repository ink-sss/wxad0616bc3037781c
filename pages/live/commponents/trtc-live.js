var e = require("../../../@babel/runtime/helpers/regeneratorRuntime"),
  n = require("../../../@babel/runtime/helpers/asyncToGenerator"),
  a = require("../../../common/vendor.js"),
  t = {
    __name: "trtc-live",
    props: {
      liveId: {
        type: [Number, String],
        default: ""
      }
    },
    emits: ["closeLm"],
    setup: function(t, u) {
      var o = u.expose,
        r = u.emit,
        l = a.getCurrentInstance(),
        i = a.ref(null),
        c = a.ref({
          enableCamera: !0,
          enableMic: !0,
          beautyLevel: 9
        }),
        s = t,
        v = r;
      a.onMounted((function() {
        c.value = {}, i.value = new a.TRTC(l.proxy.$parent), f(), O(), m()
      })), a.onBeforeUnmount((function() {}));
      var f = function() {
          c.value = i.value.createPusher()
        },
        p = a.ref(null),
        m = function() {
          l.proxy._post("live.trtc/getTrtcUserData", {
            live_id: s.liveId
          }, (function(e) {
            d.value = e.data.userId, g.value = e.data.sdkAppID, console.log("给sdkAppID复制"), console.log(g.value), E.value = e.data.userSigTencent, p.value = e.data.userAvatarUrl, I()
          }), (function(e) {
            console.log("errerrerrerrerr"), console.log(e)
          }))
        },
        d = a.ref(null),
        g = a.ref(null),
        E = a.ref(null),
        I = function() {
          c.value = i.value.enterRoom({
            userID: d.value,
            sdkAppID: g.value,
            userSig: E.value,
            strRoomID: s.liveId + "",
            enableMic: !0,
            enableCamera: !1,
            beautyLevel: 9,
            scene: "live"
          }), i.value.getPusherInstance().start()
        },
        _ = function() {
          h({
            enableCamera: !c.value.enableCamera
          })
        },
        D = a.ref(!1),
        b = function() {
          var a = n(e().mark((function n() {
            return e().wrap((function(e) {
              for (;;) switch (e.prev = e.next) {
                case 0:
                  i.value.getPusherInstance().switchCamera({
                    success: function(e) {
                      D.value = !D.value
                    }
                  });
                case 1:
                case "end":
                  return e.stop()
              }
            }), n)
          })));
          return function() {
            return a.apply(this, arguments)
          }
        }(),
        h = function(e) {
          c.value = i.value.setPusherAttributes(e)
        },
        y = function() {
          var e = !(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0];
          e ? a.index.showModal({
            content: "是否确认退出与主播的连麦！",
            success: function(e) {
              e.confirm ? l.proxy._post("live.trtc/userCloseLm", {
                live_id: s.liveId
              }, (function(e) {
                i.value.exitRoom(), setTimeout((function() {
                  v("closeLm")
                }), 500)
              }), (function(e) {
                console.log("errerrerrerrerr"), console.log(e)
              })) : e.cancel && console.log("用户点击取消")
            }
          }) : (a.index.showToast({
            title: "您已被主播踢出连麦！",
            icon: "none"
          }), i.value.exitRoom(), setTimeout((function() {
            v("closeLm")
          }), 500))
        },
        O = function() {
          var e = i.value.EVENT;
          i.value.on(e.LOCAL_JOIN, (function(e) {})), i.value.on(e.LOCAL_LEAVE, (function(e) {})), i.value.on(e.ERROR, (function(e) {
            console.log("这里有没有错误信息呢！！！！", e), 10002 == e.data.code && a.index.showToast({
              title: "您当前已禁用麦克风，无法进行连麦",
              icon: "none"
            })
          })), i.value.on(e.REMOTE_USER_JOIN, (function(e) {
            console.log("进房信息！！！！！！！！！！", e), e.data
          })), i.value.on(e.REMOTE_USER_LEAVE, (function(e) {
            var n = e.data,
              a = (n.userID, n.playerList);
            A.value = a
          })), i.value.on(e.REMOTE_VIDEO_ADD, (function(e) {
            var n = e.data.player;
            M(n, {
              muteVideo: !1
            })
          })), i.value.on(e.REMOTE_VIDEO_REMOVE, (function(e) {
            var n = e.data.player;
            M(n, {
              muteVideo: !0
            })
          })), i.value.on(e.REMOTE_AUDIO_ADD, (function(e) {
            var n = e.data.player;
            M(n, {
              muteAudio: !1
            })
          })), i.value.on(e.REMOTE_AUDIO_REMOVE, (function(e) {
            var n = e.data.player;
            M(n, {
              muteAudio: !0
            })
          })), i.value.on(e.REMOTE_AUDIO_VOLUME_UPDATE, (function(e) {
            var n = e.data.playerList;
            A.value = n
          })), i.value.on(e.LOCAL_AUDIO_VOLUME_UPDATE, (function(e) {
            e.data
          })), i.value.on(e.KICKED_OUT, (function(e) {
            y(!1)
          }))
        },
        A = a.ref([]),
        M = function(e, n) {
          A.value = i.value.setPlayerAttributes(e.streamID, n)
        },
        T = function(e) {
          i.value.pusherEventHandler(e)
        },
        C = function(e) {},
        R = function(e) {
          i.value.pusherErrorHandler(e)
        },
        L = function(e) {
          i.value.pusherBGMStartHandler(e)
        },
        x = function(e) {
          i.value.pusherBGMProgressHandler(e)
        },
        U = function(e) {
          i.value.pusherBGMCompleteHandler(e)
        },
        V = function(e) {
          i.value.pusherAudioVolumeNotify(e)
        },
        w = function(e) {
          i.value.playerEventHandler(e)
        },
        P = function(e) {
          i.value.playerFullscreenChange(e)
        },
        N = function(e) {},
        k = function(e) {
          i.value.playerAudioVolumeNotify(e)
        };
      return o({
          getTrtcData: m,
          closeLm: y
        }),
        function(e, n) {
          return a.e({
            a: a.f(A.value, (function(e, n, t) {
              return {
                a: e.streamID,
                b: e.userID,
                c: e.streamID,
                d: e.streamType,
                e: e.src,
                f: e.mode,
                g: e.autoplay,
                h: e.muteAudio,
                i: e.muteVideo,
                j: e.orientation,
                k: e.objectFit,
                l: e.enableBackgroundMute,
                m: e.minCache,
                n: e.maxCache,
                o: e.soundMode,
                p: e.enableRecvMessage,
                q: e.autoPauseIfNavigate,
                r: e.autoPauseIfOpenNative,
                s: e.debug,
                t: a.o(w, e.streamID),
                v: a.o(P, e.streamID),
                w: a.o(N, e.streamID),
                x: a.o(k, e.streamID),
                y: e.streamID
              }
            })),
            b: c.value.mode,
            c: c.value.autopush,
            d: c.value.url,
            e: c.value.enableMic,
            f: c.value.enableCamera,
            g: c.value.beautyLevel,
            h: a.o(T, "0c"),
            i: a.o(C, "77"),
            j: a.o(R, "e8"),
            k: a.o(L, "57"),
            l: a.o(x, "7a"),
            m: a.o(U, "94"),
            n: a.o(V, "b1"),
            o: !c.value.enableCamera
          }, c.value.enableCamera ? {} : {
            p: p.value
          }, {
            q: a.n(D.value ? "tone-painting-pic-sel" : "tone-painting-pic"),
            r: e.config.pic_url + "/static/live/flip.png",
            s: a.o(b, "ab"),
            t: a.n(c.value.enableCamera ? "tone-painting-pic" : "tone-painting-pic-sel"),
            v: e.config.pic_url + "/static/live/sxtfalse.png",
            w: a.o(_, "57"),
            x: e.config.pic_url + "/static/live/close_im.png",
            y: a.o(y, "87")
          })
        }
    }
  };
wx.createComponent(t);