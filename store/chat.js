var t = require("../common/vendor.js").defineStore("chat", {
  state: function() {
    return {
      chat: {},
      liveInfo: {}
    }
  },
  actions: {
    setChatSetting: function(t) {
      this.chat = t
    },
    setLiveInfo: function(t) {
      this.liveInfo = t
    }
  }
});
exports.useChatStore = t;