var e = require("./@babel/runtime/helpers/typeof"),
  i = require("./common/vendor.js"),
  o = {
    data: function() {
      return {
        imageList: []
      }
    },
    props: ["num", "isVideo"],
    onLoad: function() {},
    mounted: function() {
      this.chooseImageFunc()
    },
    methods: {
      chooseImageFunc: function() {
        var e = this;
        this.isVideo ? i.index.chooseVideo({
          maxDuration: 60,
          camera: "back",
          success: function(i) {
            if (console.log(i), i) {
              var o = [];
              o.push(i.tempFilePath), console.log(o), e.uploadFile(o)
            }
          },
          fail: function(i) {
            console.log(i), e.$emit("getImgs", null)
          }
        }) : i.index.chooseImage({
          count: e.num || 9,
          mediaType: ["image"],
          sizeType: ["original", "compressed"],
          sourceType: ["album", "camera"],
          success: function(i) {
            e.uploadFile(i.tempFilePaths)
          },
          fail: function(i) {
            e.$emit("getImgs", null)
          },
          complete: function(e) {}
        })
      },
      uploadFile: function(o) {
        var n = this,
          t = 0,
          a = o.length,
          s = {
            token: n.config.token,
            app_id: n.getAppId(),
            appid: n.config.appid,
            file_type: n.isVideo ? "video" : "image"
          };
        i.index.showLoading({
          title: "上传中"
        });
        var c = n.websiteUrl;
        o.forEach((function(o, u) {
          i.index.uploadFile({
            url: c + "/index.php?s=/api/file.upload/image",
            filePath: o,
            name: "iFile",
            formData: s,
            success: function(o) {
              var t = "object" == e(o.data) ? o.data : JSON.parse(o.data);
              if (-1 === t.code) return console.log("登录态失效, 重新登录"), void n.doLogin();
              1 === t.code ? n.imageList.push(t.data) : i.index.showModal({
                title: "提示",
                content: t.msg
              })
            },
            complete: function() {
              t++, a === t && (i.index.hideLoading(), n.$emit("getImgs", n.imageList))
            }
          })
        }))
      }
    }
  },
  n = i._export_sfc(o, [
    ["render", function(e, i, o, n, t, a) {
      return {}
    }]
  ]);
exports.MiniProgramPage = n;
