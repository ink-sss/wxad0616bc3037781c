var a = require("../../../common/vendor.js"),
  t = {
    data: function() {
      return {}
    },
    created: function() {
      console.log(this.itemData.params)
    },
    props: ["itemData"],
    methods: {
      callPhone: function() {
        a.index.makePhoneCall({
          phoneNumber: this.itemData.params.phone_num
        })
      },
      gotoService: function() {
        this.getUserId() ? this.gotoPage("/pagesPlus/chat/chat?chat_user_id=" + this.itemData.data + "&nickName=平台客服") : this.doLogin()
      }
    }
  },
  e = a._export_sfc(t, [
    ["render", function(t, e, i, m, o, r) {
      return a.e({
        a: "phone" == i.itemData.params.type
      }, "phone" == i.itemData.params.type ? {
        b: i.itemData.params.image,
        c: a.o((function() {
          return r.callPhone && r.callPhone.apply(r, arguments)
        }), "0f")
      } : {}, {
        d: "wx" == i.itemData.params.type
      }, "wx" == i.itemData.params.type ? {
        e: i.itemData.params.image
      } : {}, {
        f: "chat" == i.itemData.params.type && i.itemData.data
      }, "chat" == i.itemData.params.type && i.itemData.data ? {
        g: i.itemData.params.image,
        h: a.o((function() {
          return r.gotoService && r.gotoService.apply(r, arguments)
        }), "a1")
      } : {}, {
        i: i.itemData.style.right + "%",
        j: i.itemData.style.bottom + "%",
        k: i.itemData.style.opacity / 100
      })
    }]
  ]);
wx.createComponent(e);