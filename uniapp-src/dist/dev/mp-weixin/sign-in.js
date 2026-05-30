"use strict";
const common_vendor = require("./common/vendor.js");
const pages_live_pageTools = require("./pages/live/page-tools.js");
const UniPopup = () => "./uni_modules/uni-popup/components/uni-popup/uni-popup.js";
const _sfc_main = {
  components: { UniPopup },
  props: {
    liveId: { type: [Number, String], default: "" },
    appId: { type: [Number, String], default: "" },
    supplierId: { type: [Number, String], default: "" },
    allowManualEnd: { type: Boolean, default: true },
    type: { type: [Number, String], default: 1 },
    config: { type: Object, default: () => ({}) },
    chatInfo: { type: Object, default: () => ({}) },
    isLogin: {
      type: Number,
      default: 0,
      validator(value) {
        return [0, 1].includes(value);
      }
    }
  },
  emits: ["taskEnd", "signinSuccess", "signinFail", "manualEnd"],
  data() {
    return {
      disabled: false,
      tasks: [],
      userId: 0,
      taskId: 0,
      currentTask: {},
      countdown: 0,
      isPopOpen: false,
      visible: false,
      mountedReady: false,
      submitting: false,
      clickLocked: false,
      submitLocked: false,
      countdownTimer: null,
      cacheTimer: null,
      delayedOpenTimer: null,
      checkId: ""
    };
  },
  computed: {
    requestParams() {
      var _a, _b;
      return {
        app_id: ((_a = this.chatInfo) == null ? void 0 : _a.app_id) || this.appId,
        supplier_id: ((_b = this.chatInfo) == null ? void 0 : _b.shop_supplier_id) || this.supplierId,
        live_id: this.liveId
      };
    },
    canRequest() {
      return Boolean(this.requestParams.live_id && this.requestParams.app_id && this.requestParams.supplier_id);
    },
    signIcon() {
      var _a;
      const base = ((_a = this.config) == null ? void 0 : _a.pic_url) || "https://weilive.yukelive.com";
      return `${base}/202512081258135e2e81819.png`;
    },
    cacheKey() {
      return `sign_task_${this.liveId}_${this.requestParams.app_id || ""}_${this.checkId || ""}`;
    }
  },
  watch: {
    isLogin() {
      this.loadCheckId();
    },
    liveId() {
      this.loadCheckId();
    },
    "chatInfo.app_id"() {
      this.loadCheckId();
    },
    "chatInfo.shop_supplier_id"() {
      this.loadCheckId();
    }
  },
  mounted() {
    this.cleanExpiredCache();
    this.userId = common_vendor.index.getStorageSync("user_id");
    this.mountedReady = true;
    this.loadCheckId();
  },
  beforeUnmount() {
    this.clearAllTimers();
    this.closeModal(false);
    if (this.delayedOpenTimer)
      clearTimeout(this.delayedOpenTimer);
  },
  methods: {
    refreshTasks() {
      return this.loadTasks();
    },
    loadCheckId() {
      if (!this.canRequest)
        return;
      pages_live_pageTools.requestWithVm(this, "_post", "live.roomNew/getCheckid", this.requestParams).then((res) => {
        if (!res.data) {
          this.resetTasks();
          return;
        }
        this.checkId = res.data;
        this.restoreCache();
      }).catch(() => {
        this.resetTasks();
      });
    },
    restoreCache() {
      const cached = this.readCache();
      if (cached && this.checkId === cached.tasksId) {
        this.tasks = cached.signTasks || [];
        this.currentTask = cached.currentTask || {};
        this.countdown = cached.countdown || 0;
        this.taskId = cached.tasksId || 0;
        this.isPopOpen = !!cached.isSigninPopOpen;
        this.visible = !this.disabled && (this.tasks.length > 0 || !!this.currentTask.id);
        if (!this.disabled && this.countdown > 0 && this.currentTask.id)
          this.startCountdown();
        else if (!this.disabled && this.countdown <= 0 && this.currentTask.id) {
          this.isPopOpen ? this.openModal() : this.showModalWhenReady();
        } else if (!this.disabled)
          this.nextTask();
        return;
      }
      if (!this.disabled)
        this.loadTasks();
    },
    loadTasks() {
      if (this.disabled || !this.canRequest) {
        this.visible = false;
        return Promise.resolve();
      }
      return pages_live_pageTools.requestWithVm(this, "_post", "live.roomNew/getCheckList", this.requestParams).then((res) => {
        this.tasks = res.data && res.data.checkin_config || [];
        this.taskId = res.data && res.data.taskId || 0;
        this.visible = true;
        this.clearAllTimers();
        this.nextTask();
      }).catch(() => {
        this.tasks = [];
        this.visible = false;
        this.clearCache();
      });
    },
    nextTask() {
      if (this.disabled) {
        this.visible = false;
        this.$emit("taskEnd", "打卡临时关闭，任务暂停");
        return;
      }
      this.clearAllTimers();
      if (!this.tasks.length) {
        this.currentTask = {};
        this.countdown = 0;
        this.visible = false;
        this.clearCache();
        this.$emit("taskEnd", "所有签到任务已完成");
        return;
      }
      this.currentTask = this.tasks.shift();
      this.countdown = Number(this.currentTask.watchTime || 0);
      this.visible = true;
      this.saveCache();
      if (this.countdown > 0)
        this.startCountdown();
      else
        this.showModalWhenReady();
    },
    startCountdown() {
      this.clearAllTimers();
      let tickCount = 0;
      this.countdownTimer = setInterval(() => {
        if (this.disabled) {
          this.clearAllTimers();
          return;
        }
        if (this.countdown > 0) {
          this.countdown -= 1;
          tickCount += 1;
          if (tickCount >= 5) {
            this.saveCache();
            tickCount = 0;
          }
          if (this.countdown <= 0) {
            this.clearAllTimers();
            this.showModalWhenReady();
          }
        }
      }, 1e3);
    },
    showModalWhenReady() {
      if (this.disabled || this.isPopOpen)
        return;
      this.isPopOpen = true;
      this.saveCache();
      this.openModal();
    },
    openModal() {
      this.$nextTick(() => {
        this.delayedOpenTimer = setTimeout(() => {
          this.$refs.signinPop && this.$refs.signinPop.open();
        }, 50);
      });
    },
    closeModal(advance = true) {
      this.isPopOpen = false;
      this.saveCache();
      this.$refs.signinPop && this.$refs.signinPop.close();
      if (advance) {
        setTimeout(() => this.nextTask(), 300);
      }
    },
    submit() {
      var _a, _b;
      if (this.submitting || this.submitLocked || !this.currentTask.id || this.disabled)
        return;
      this.submitting = true;
      this.submitLocked = true;
      pages_live_pageTools.requestWithVm(this, "_post", "live.roomNew/doSignin", {
        app_id: ((_a = this.chatInfo) == null ? void 0 : _a.app_id) || this.appId,
        room_id: this.liveId,
        red_id: this.taskId,
        shop_supplier_id: ((_b = this.chatInfo) == null ? void 0 : _b.shop_supplier_id) || this.supplierId,
        watch_time: this.currentTask.watchTime,
        set_content: this.currentTask,
        user_id: this.userId
      }).then((res) => {
        if (res.code === 1) {
          common_vendor.index.showToast({ title: res.msg || "签到成功", icon: "success", duration: 4e3 });
          this.$emit("signinSuccess", {
            taskId: this.currentTask.id,
            reward: this.currentTask.reward
          });
          this.closeModal(true);
        } else {
          common_vendor.index.showToast({ title: res.msg || "签到失败", icon: "none", duration: 1500 });
          this.$emit("signinFail", res.msg || "签到失败");
        }
      }).catch(() => {
        common_vendor.index.showToast({ title: "网络异常，签到失败", icon: "none", duration: 1500 });
        this.$emit("signinFail", "网络异常，签到失败");
      }).finally(() => {
        setTimeout(() => {
          this.submitting = false;
          this.submitLocked = false;
        }, 1500);
      });
    },
    handleClick() {
      if (this.clickLocked)
        return;
      this.clickLocked = true;
      setTimeout(() => {
        this.clickLocked = false;
      }, 500);
      if (this.disabled) {
        common_vendor.index.showToast({ title: "当前打卡已关闭，暂无法签到", icon: "none", duration: 1500 });
        return;
      }
      if (this.countdown > 0) {
        common_vendor.index.showToast({ title: `请观看${this.formatTime(this.countdown)}后签到`, icon: "none", duration: 1500 });
        return;
      }
      if (!this.currentTask.id) {
        common_vendor.index.showToast({ title: "暂无签到任务", icon: "none", duration: 1500 });
        return;
      }
      if (this.delayedOpenTimer)
        clearTimeout(this.delayedOpenTimer);
      this.delayedOpenTimer = setTimeout(() => {
        this.showModalWhenReady();
        this.delayedOpenTimer = null;
      }, 300);
    },
    formatTime(value) {
      if (value <= 0)
        return "00:00";
      const seconds = value % 60;
      return `${Math.floor(value / 60).toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    },
    clearAllTimers() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      }
      if (this.cacheTimer) {
        clearInterval(this.cacheTimer);
        this.cacheTimer = null;
      }
    },
    saveCache() {
      try {
        if (!this.cacheKey)
          return;
        common_vendor.index.setStorageSync(this.cacheKey, JSON.stringify({
          signTasks: this.tasks,
          currentTask: this.currentTask,
          countdown: this.countdown,
          tasksId: this.checkId,
          isSigninPopOpen: this.isPopOpen,
          expireTime: Date.now() + 864e5
        }));
      } catch (error) {
        console.error("保存签到缓存失败:", error);
      }
    },
    readCache() {
      try {
        const raw = common_vendor.index.getStorageSync(this.cacheKey);
        if (!raw)
          return null;
        const data = JSON.parse(raw);
        if (data.expireTime && Date.now() > data.expireTime || !data.currentTask) {
          common_vendor.index.removeStorageSync(this.cacheKey);
          return null;
        }
        return data;
      } catch (error) {
        console.error("读取签到缓存失败:", error);
        common_vendor.index.removeStorageSync(this.cacheKey);
        return null;
      }
    },
    clearCache() {
      if (this.cacheKey)
        common_vendor.index.removeStorageSync(this.cacheKey);
      if (this.taskId)
        common_vendor.index.setStorageSync("last_check_id", this.taskId);
      this.visible = this.tasks.length > 0 || !!this.currentTask.id;
    },
    resetTasks() {
      this.clearAllTimers();
      this.tasks = [];
      this.currentTask = {};
      this.countdown = 0;
      this.taskId = 0;
      this.isPopOpen = false;
      this.visible = false;
      this.clearCache();
    },
    cleanExpiredCache() {
      try {
        const info = common_vendor.index.getStorageInfoSync();
        if (!info || !info.keys)
          return;
        info.keys.forEach((key) => {
          if (!key.startsWith("sign_task_"))
            return;
          try {
            const data = JSON.parse(common_vendor.index.getStorageSync(key));
            if (!data || data.expireTime && Date.now() > data.expireTime)
              common_vendor.index.removeStorageSync(key);
          } catch (error) {
            common_vendor.index.removeStorageSync(key);
          }
        });
      } catch (error) {
        console.error("清除sign_task_缓存失败：", error);
      }
    },
    manualEndAllTasks() {
      if (!this.allowManualEnd) {
        common_vendor.index.showToast({ title: "当前不允许结束任务", icon: "none" });
        return;
      }
      this.resetTasks();
      this.$emit("manualEnd", {
        taskId: null,
        remainingTasks: 0,
        isAllEnd: true
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "./uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  _easycom_uni_popup();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.visible && Number($props.type) === 1
  }, $data.visible && Number($props.type) === 1 ? common_vendor.e({
    b: $options.signIcon,
    c: $data.countdown > 0
  }, $data.countdown > 0 ? {
    d: common_vendor.t($options.formatTime($data.countdown))
  } : {}, {
    e: common_vendor.o((...args) => $options.handleClick && $options.handleClick(...args), "3f")
  }) : {}, {
    f: $data.visible && Number($props.type) === 2
  }, $data.visible && Number($props.type) === 2 ? common_vendor.e({
    g: $options.signIcon,
    h: $data.countdown > 0
  }, $data.countdown > 0 ? {
    i: common_vendor.t($options.formatTime($data.countdown))
  } : {}, {
    j: common_vendor.o((...args) => $options.handleClick && $options.handleClick(...args), "fb")
  }) : {}, {
    k: common_vendor.t($data.currentTask.name || "签到"),
    l: common_vendor.t($data.currentTask.title || "00:00"),
    m: common_vendor.t($data.currentTask.title || "00:00"),
    n: common_vendor.t($data.currentTask.id || 0),
    o: common_vendor.t($data.currentTask.num || 0),
    p: common_vendor.t($data.submitting ? "签到中..." : "签到"),
    q: $data.submitting || $data.submitLocked,
    r: common_vendor.o((...args) => $options.submit && $options.submit(...args), "a4"),
    s: common_vendor.t($data.currentTask.reward || ""),
    t: common_vendor.sr("signinPop", "f6b669af-0"),
    v: common_vendor.p({
      type: "center",
      ["background-color"]: "#fff",
      ["border-radius"]: "20rpx",
      ["mask-click"]: false,
      ["is-mask-click"]: false
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f6b669af"]]);
exports.MiniProgramPage = MiniProgramPage;
