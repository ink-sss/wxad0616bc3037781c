"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_live = require("../../api/live.js");
const services_h5AuthContext = require("../../services/h5-auth-context.js");
const utils_liveRoomContext = require("../../utils/live-room-context.js");
const defaultAvatar = "/static/remote-icons/s-nuoyun-avatar-default.png";
const pageSize = 10;
const retryTimes = 3;
const retryDelay = 500;
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const statusOptions = [
      { label: "全部", value: 0 },
      { label: "在线", value: 1 },
      { label: "离线", value: 2 }
    ];
    const records = common_vendor.ref([]);
    const total = common_vendor.ref(0);
    const page = common_vendor.ref(1);
    const loading = common_vendor.ref(false);
    const finished = common_vendor.ref(false);
    const keyword = common_vendor.ref("");
    const selectedStatus = common_vendor.ref(0);
    common_vendor.ref(false);
    const roomId = common_vendor.ref(0);
    common_vendor.ref(true);
    common_vendor.computed(() => {
      var _a;
      return ((_a = statusOptions.find((item) => item.value === selectedStatus.value)) == null ? void 0 : _a.label) || "全部";
    });
    function onSearch() {
      loadRecords(true);
    }
    function formatDuration(sec) {
      const totalSec = Number(sec || 0);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor(totalSec % 3600 / 60);
      const s = totalSec % 60;
      return `${h}小时${m}分${s}秒`;
    }
    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async function fetchRecordsWithRetry(params) {
      let lastError = null;
      for (let attempt = 0; attempt <= retryTimes; attempt += 1) {
        try {
          const data = await api_live.getDistributorInvitedUsers(params);
          const list = Array.isArray(data == null ? void 0 : data.list) ? data.list : [];
          if (list.length || attempt === retryTimes) {
            return { data, list };
          }
        } catch (err) {
          lastError = err;
          if (attempt === retryTimes) {
            throw err;
          }
        }
        await sleep(retryDelay);
      }
      if (lastError)
        throw lastError;
      return { data: null, list: [] };
    }
    async function loadRecords(reset = false) {
      if (loading.value)
        return;
      if (!reset && finished.value)
        return;
      if (!roomId.value)
        return;
      if (reset) {
        page.value = 1;
        finished.value = false;
        records.value = [];
      }
      loading.value = true;
      const params = {
        roomId: roomId.value,
        page: page.value,
        pageSize,
        keyword: keyword.value.trim(),
        currentStatus: selectedStatus.value
      };
      try {
        const { data, list } = await fetchRecordsWithRetry(params);
        const totalCount = Number((data == null ? void 0 : data.total) || 0);
        total.value = totalCount;
        records.value = reset ? list : records.value.concat(list);
        finished.value = records.value.length >= total.value || list.length < pageSize;
        if (!finished.value) {
          page.value += 1;
        }
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "获取邀请记录失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    }
    function loadMore() {
      loadRecords(false);
    }
    async function ensureDistributorAndLoad() {
      if (!roomId.value) {
        common_vendor.index.showToast({ title: "请从直播间进入", icon: "none" });
        setTimeout(() => common_vendor.index.navigateBack(), 800);
        return;
      }
      const ctx = utils_liveRoomContext.loadLiveRoomContext();
      const ok = !!(ctx == null ? void 0 : ctx.isDistributor) && Number(ctx == null ? void 0 : ctx.distributorStatus) === 1;
      if (!ok) {
        common_vendor.index.showToast({ title: "仅分销员可查看邀请记录", icon: "none" });
        setTimeout(() => common_vendor.index.navigateBack(), 1e3);
        return;
      }
      loadRecords(true);
    }
    common_vendor.onLoad((options) => {
      if (!services_h5AuthContext.ensureH5PageAuth(options))
        return;
      const optionRoomId = Number((options == null ? void 0 : options.roomId) || 0);
      if (optionRoomId > 0) {
        roomId.value = optionRoomId;
      } else {
        const ctx = utils_liveRoomContext.loadLiveRoomContext();
        roomId.value = Number((ctx == null ? void 0 : ctx.liveId) || 0);
      }
      ensureDistributorAndLoad();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(onSearch, "7c"),
        b: keyword.value,
        c: common_vendor.o(($event) => keyword.value = $event.detail.value, "11"),
        d: common_assets._imports_0$2,
        e: common_vendor.o(onSearch, "67"),
        f: records.value.length
      }, records.value.length ? {
        g: common_vendor.f(records.value, (item, k0, i0) => {
          return common_vendor.e({
            a: item.avatar || defaultAvatar,
            b: common_vendor.t(item.nickname || "用户"),
            c: Number(item.currentStatus) === 1
          }, Number(item.currentStatus) === 1 ? {} : Number(item.currentStatus) === 2 ? {} : {}, {
            d: Number(item.currentStatus) === 2,
            e: common_vendor.t(item.authorizedAt || "-"),
            f: common_vendor.t(formatDuration(item.watchDuration)),
            g: item.customerId
          });
        })
      } : !loading.value ? {
        i: common_assets._imports_1$1
      } : {}, {
        h: !loading.value,
        j: loading.value
      }, loading.value ? {} : finished.value && records.value.length ? {} : {}, {
        k: finished.value && records.value.length,
        l: common_vendor.o(loadMore, "80")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-fcfc44b6"]]);
wx.createPage(MiniProgramPage);
