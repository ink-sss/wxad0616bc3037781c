var e = require("../../@babel/runtime/helpers/typeof"),
  o = require("../../common/vendor.js");
getApp();
var t = {
  components: {
    Upload: function() {
      return "../../components/upload/upload2.js"
    }
  },
  data: function() {
    return {
      imageList: [],
      isUpload: !1,
      userInfo: {
        nickName: "",
        avatarUrl: ""
      }
    }
  },
  methods: {
    showUserSetPop: function() {
      this.$refs.userSet.open("bottom")
    },
    closeUserSetPop: function() {
      this.$refs.userSet.close(), this.$emit("setOk")
    },
    onChooseAvatar: function(e) {
      console.log(e), this.uploadFile([e.detail.avatarUrl])
    },
    uploadFile: function(t) {
      var n = this;
      n.imageList = [];
      var a = 0,
        i = t.length,
        r = {
          token: n.config.token,
          app_id: n.getAppId(),
          appid: n.config.appid
        };
      o.index.showLoading({
        title: "图片上传中"
      }), t.forEach((function(t, s) {
        o.index.uploadFile({
          url: n.websiteUrl + "/index.php?s=/api/file.upload/image",
          filePath: t,
          name: "iFile",
          formData: r,
          success: function(o) {
            var t = "object" == e(o.data) ? o.data : JSON.parse(o.data);
            1 === t.code ? n.imageList.push(t.data) : n.showError(t.msg)
          },
          complete: function() {
            a++, i === a && (o.index.hideLoading(), n.getImgsFunc(n.imageList))
          }
        })
      }))
    },
    getImgsFunc: function(e) {
      if (e && void 0 !== e) {
        this.userInfo.avatarUrl = e[0].file_path, this.isUpload = !1
      }
    },
    update: function() {
      var e = this;
      if (!e.loading)
        if (o.index.showLoading({
            title: "加载中"
          }), "" != e.userInfo.nickName && "" != e.userInfo.avatarUrl) {
          var t = e.userInfo;
          e.loading = !0, e._post("user.user/updateInfo", t, (function(t) {
            e.showSuccess("设置成功", (function() {
              e.loading = !1, o.index.hideLoading(), e.closeUserSetPop()
            }), (function(t) {
              o.index.hideLoading(), e.loading = !1
            }))
          }))
        } else o.index.showToast({
          title: "请设置头像和昵称"
        })
    }
  }
};
Array || (o.resolveComponent("uni-popup") + o.resolveComponent("Upload"))(), Math;
var n = o._export_sfc(t, [
  ["render", function(e, t, n, a, i, r) {
    return o.e({
      a: o.o((function() {
        return r.closeUserSetPop && r.closeUserSetPop.apply(r, arguments)
      }), "b9"),
      b: "" == i.userInfo.avatarUrl ? e.config.pic_url + "/static/live/default_logo.jpeg" : i.userInfo.avatarUrl,
      c: o.o((function() {
        return r.onChooseAvatar && r.onChooseAvatar.apply(r, arguments)
      }), "7f"),
      d: i.userInfo.nickName,
      e: o.o((function(e) {
        return i.userInfo.nickName = e.detail.value
      }), "a0"),
      f: o.o((function() {
        return r.update && r.update.apply(r, arguments)
      }), "b6"),
      g: o.sr("userSet", "d54df80d-0"),
      h: o.p({
        "mask-click": !1,
        type: "bottom",
        "background-color": "#fff",
        "border-radius": "20px 20px 0 0"
      }),
      i: i.isUpload
    }, i.isUpload ? {
      j: o.o(r.getImgsFunc, "40"),
      k: o.p({
        num: 1
      })
    } : {})
  }],
  ["__scopeId", "data-v-d54df80d"]
]);
wx.createComponent(n);
