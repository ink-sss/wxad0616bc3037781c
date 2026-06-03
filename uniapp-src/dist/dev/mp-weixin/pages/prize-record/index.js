"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_live = require("../../api/live.js");
const services_h5AuthContext = require("../../services/h5-auth-context.js");
const utils_liveRoomContext = require("../../utils/live-room-context.js");
const utils_liveRoomNavigation = require("../../utils/live-room-navigation.js");
const utils_routeNavigation = require("../../utils/route-navigation.js");
if (!Math) {
  LiveMiniWindow();
}
const LiveMiniWindow = () => "../../components/live-mini-window.js";
const pageSize = 10;
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const typeOptions = [
      { label: "全部", value: 0 },
      { label: "观看奖励", value: 1 },
      { label: "抽奖", value: 2 },
      { label: "评论抽奖", value: 3 }
    ];
    const records = common_vendor.ref([]);
    const total = common_vendor.ref(0);
    const page = common_vendor.ref(1);
    const loading = common_vendor.ref(false);
    const finished = common_vendor.ref(false);
    const filterVisible = common_vendor.ref(false);
    const selectedMonth = common_vendor.ref("");
    const pendingMonth = common_vendor.ref("");
    const selectedWinType = common_vendor.ref(0);
    const pendingWinType = common_vendor.ref(0);
    const liveRoomCode = common_vendor.ref("");
    const recordIconMap = {
      1: "/static/remote-icons/s-nuoyun-income-prize-1.png",
      2: "/static/remote-icons/s-nuoyun-income-prize-2.png",
      3: "/static/remote-icons/s-nuoyun-income-prize-3.png",
      4: "/static/remote-icons/s-nuoyun-income-prize-4.png"
    };
    const currentMonth = common_vendor.computed(() => {
      const now = /* @__PURE__ */ new Date();
      const month = `${now.getMonth() + 1}`.padStart(2, "0");
      return `${now.getFullYear()}-${month}`;
    });
    const selectedMonthLabel = common_vendor.computed(() => formatMonthLabel(selectedMonth.value));
    const pendingMonthLabel = common_vendor.computed(() => formatMonthLabel(pendingMonth.value));
    const selectedTypeLabel = common_vendor.computed(() => {
      var _a;
      return ((_a = typeOptions.find((item) => item.value === selectedWinType.value)) == null ? void 0 : _a.label) || "全部";
    });
    function formatMonthLabel(value) {
      if (!value)
        return "全部";
      const parts = String(value).split("-");
      if (parts.length !== 2)
        return "全部";
      return `${parts[0]}年${parts[1]}月`;
    }
    function firstValue(source = {}, ...keys) {
      for (const key of keys) {
        const value = source == null ? void 0 : source[key];
        if (value !== void 0 && value !== null && value !== "")
          return value;
      }
      return void 0;
    }
    function toNumber(value, fallback = 0) {
      const n = Number(value);
      return Number.isFinite(n) ? n : fallback;
    }
    function toFlag(value) {
      if (value === true || value === 1 || value === "1" || value === "true")
        return true;
      return false;
    }
    function appendQuery(route, params = {}) {
      const entries = Object.entries(params).filter(([, value]) => value !== void 0 && value !== null && value !== "");
      if (!route || !entries.length)
        return route;
      const query = entries.filter(([key]) => !new RegExp(`[?&]${key}=`).test(route)).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&");
      if (!query)
        return route;
      return `${route}${route.includes("?") ? "&" : "?"}${query}`;
    }
    function normalizePrizeRecord(record = {}, index = 0) {
      var _a;
      const orderId = firstValue(record, "orderId", "order_id");
      const orderNo = firstValue(record, "orderNo", "order_no", "outTradeNo", "out_trade_no");
      const roomCode = firstValue(record, "roomCode", "room_code", "liveRoomCode", "live_room_code", "_roomCode");
      const rewardName = firstValue(record, "rewardName", "reward_name", "prizeName", "prize_name", "productName", "product_name", "name");
      const winType = toNumber(firstValue(record, "winType", "win_type", "activityType", "activity_type"), 1);
      const rewardType = toNumber(firstValue(record, "rewardType", "reward_type"));
      return {
        ...record,
        recordId: firstValue(record, "recordId", "record_id", "winnerRecordId", "winner_record_id", "id") || `record-${index}`,
        winType,
        winTypeText: firstValue(record, "winTypeText", "win_type_text", "activityTypeText", "activity_type_text") || ((_a = typeOptions.find((item) => item.value === winType)) == null ? void 0 : _a.label) || "中奖",
        rewardType,
        rewardName: rewardName || "奖品",
        roomName: firstValue(record, "roomName", "room_name", "liveRoomName", "live_room_name") || "",
        winTime: firstValue(record, "winTime", "win_time", "createdAt", "created_at", "createTime", "create_time") || "",
        roomEnded: toFlag(firstValue(record, "roomEnded", "room_ended", "isRoomEnded", "is_room_ended")),
        orderId,
        orderNo,
        orderDetailUrl: firstValue(record, "orderDetailUrl", "order_detail_url", "orderUrl", "order_url", "detailUrl", "detail_url"),
        roomCode
      };
    }
    function recordIcon(record) {
      const iconType = Number(record == null ? void 0 : record.winType) === 3 ? 4 : Number((record == null ? void 0 : record.winType) || 1);
      return recordIconMap[iconType] || recordIconMap[1];
    }
    function getOrderTarget(record) {
      const roomCode = (record == null ? void 0 : record.roomCode) || liveRoomCode.value;
      const rawDetailUrl = (record == null ? void 0 : record.orderDetailUrl) || "";
      if (rawDetailUrl) {
        const detailUrl = utils_routeNavigation.normalizeAppRoute(rawDetailUrl);
        if (!/^https?:\/\//i.test(detailUrl)) {
          return appendQuery(detailUrl, { roomCode });
        }
        if (!(record == null ? void 0 : record.orderId) && !(record == null ? void 0 : record.orderNo))
          return detailUrl;
      }
      if (record == null ? void 0 : record.orderId) {
        return appendQuery("/pages/order/detail", { id: record.orderId, roomCode });
      }
      if (record == null ? void 0 : record.orderNo) {
        return appendQuery("/pages/order/list", { orderNo: record.orderNo, roomCode });
      }
      return "";
    }
    function showRecordAction(record) {
      if (Number(record == null ? void 0 : record.rewardType) === 1 || getOrderTarget(record))
        return true;
      return Number(record == null ? void 0 : record.rewardType) === 2 && !(record == null ? void 0 : record.roomEnded);
    }
    function actionText(record) {
      return Number(record == null ? void 0 : record.rewardType) === 1 || getOrderTarget(record) ? "查看详情" : "立即使用";
    }
    async function loadRecords(reset = false) {
      if (loading.value)
        return;
      if (!reset && finished.value)
        return;
      if (reset) {
        page.value = 1;
        finished.value = false;
        records.value = [];
      }
      loading.value = true;
      try {
        const data = await api_live.getPrizeRecordList({
          page: page.value,
          pageSize,
          winType: selectedWinType.value,
          month: selectedMonth.value
        });
        const rawList = firstValue(data, "list", "records", "recordList", "record_list") || [];
        const list = Array.isArray(rawList) ? rawList.map(normalizePrizeRecord) : [];
        total.value = Number(firstValue(data, "total", "totalCount", "total_count", "count") || 0);
        records.value = reset ? list : records.value.concat(list);
        finished.value = records.value.length >= total.value || list.length < pageSize;
        if (!finished.value) {
          page.value += 1;
        }
      } catch (err) {
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || "获取中奖记录失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    }
    function loadMore() {
      loadRecords(false);
    }
    function openFilter() {
      pendingMonth.value = selectedMonth.value;
      pendingWinType.value = selectedWinType.value;
      filterVisible.value = true;
    }
    function onMonthChange(event) {
      var _a;
      pendingMonth.value = ((_a = event == null ? void 0 : event.detail) == null ? void 0 : _a.value) || "";
    }
    function confirmFilter() {
      selectedMonth.value = pendingMonth.value;
      selectedWinType.value = pendingWinType.value;
      filterVisible.value = false;
      loadRecords(true);
    }
    function handleRecordAction(record) {
      const orderTarget = getOrderTarget(record);
      if (Number(record == null ? void 0 : record.rewardType) === 1 || orderTarget) {
        if (!orderTarget) {
          common_vendor.index.showToast({ title: "暂无关联订单", icon: "none" });
          return;
        }
        utils_routeNavigation.navigateWithH5Fallback(orderTarget);
        return;
      }
      const roomCode = (record == null ? void 0 : record.roomCode) || liveRoomCode.value;
      if (!roomCode) {
        common_vendor.index.showToast({ title: "直播间信息缺失", icon: "none" });
        return;
      }
      utils_liveRoomNavigation.returnToLiveRoom(roomCode);
    }
    common_vendor.onLoad((options) => {
      liveRoomCode.value = utils_liveRoomContext.resolveLiveRoomCode((options == null ? void 0 : options.roomCode) || (options == null ? void 0 : options.room_code));
      if (!services_h5AuthContext.ensureH5PageAuth(options))
        return;
      loadRecords(true);
    });
    function goBack() {
      if (liveRoomCode.value) {
        utils_liveRoomNavigation.returnToLiveRoom(liveRoomCode.value);
        return;
      }
      common_vendor.index.navigateBack({
        fail: () => common_vendor.index.reLaunch({ url: "/pages/broadcast/entry" })
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(total.value),
        b: selectedMonthLabel.value !== "全部"
      }, selectedMonthLabel.value !== "全部" ? {
        c: common_vendor.t(selectedMonthLabel.value)
      } : {}, {
        d: common_vendor.t(selectedTypeLabel.value),
        e: common_assets._imports_0$1,
        f: common_vendor.o(openFilter, "78"),
        g: records.value.length
      }, records.value.length ? {
        h: common_vendor.f(records.value, (record, k0, i0) => {
          return common_vendor.e({
            a: recordIcon(record),
            b: common_vendor.t(record.winTypeText),
            c: common_vendor.t(record.rewardName),
            d: common_vendor.t(record.roomName || "直播间"),
            e: common_vendor.t(record.winTime),
            f: showRecordAction(record)
          }, showRecordAction(record) ? {
            g: common_vendor.t(actionText(record)),
            h: common_vendor.o(($event) => handleRecordAction(record), record.recordId)
          } : {}, {
            i: record.recordId
          });
        })
      } : !loading.value ? {
        j: common_assets._imports_1$1
      } : {}, {
        i: !loading.value,
        k: loading.value
      }, loading.value ? {} : finished.value && records.value.length ? {} : {}, {
        l: finished.value && records.value.length,
        m: common_vendor.o(loadMore, "f3"),
        n: filterVisible.value
      }, filterVisible.value ? common_vendor.e({
        o: common_vendor.o(($event) => filterVisible.value = false, "4f"),
        p: common_vendor.t(pendingMonthLabel.value),
        q: currentMonth.value,
        r: pendingMonth.value || currentMonth.value,
        s: common_vendor.o(onMonthChange, "07"),
        t: pendingMonth.value
      }, pendingMonth.value ? {
        v: common_vendor.o(($event) => pendingMonth.value = "", "11")
      } : {}, {
        w: common_vendor.f(typeOptions, (option, k0, i0) => {
          return {
            a: common_vendor.t(option.label),
            b: option.value,
            c: common_vendor.n(pendingWinType.value === option.value ? "checked" : ""),
            d: common_vendor.o(($event) => pendingWinType.value = option.value, option.value)
          };
        }),
        x: common_vendor.o(confirmFilter, "41")
      }) : {}, {
        y: common_vendor.o(goBack, "b2"),
        z: common_vendor.p({
          ["room-code"]: liveRoomCode.value,
          ["bottom-offset"]: 140
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b5391521"]]);
wx.createPage(MiniProgramPage);
