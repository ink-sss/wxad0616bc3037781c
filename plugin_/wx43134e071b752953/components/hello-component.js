// plugin/components/hello-component.js
Component({
  properties: {
    bottomText: {
      type: String,
      value: "授权登录"
    },
    styleCon: {
      type: String,
      value: ""
    }
  },

  data: {
    items: []
  },

  methods: {
    loginSuccess(e) {
      console.log("loginSuccessloginSuccessloginSuccess")
      console.log(e)
      this.triggerEvent("loginSuccess", e);
    },
    loginFail(e) {
      console.log("loginFailloginFailloginFailloginFail")
      console.log(e)
      this.triggerEvent("loginFail");
    },
    loginCancel(e) {
      console.log("loginCancelloginCancelloginCancelloginCancel")
      console.log(e)
      this.triggerEvent("loginCancel");
    }
  }
})