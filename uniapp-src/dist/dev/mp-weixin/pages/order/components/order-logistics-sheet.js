"use strict";
const common_vendor = require("../../../common/vendor.js");
const _sfc_main = {
  __name: "order-logistics-sheet",
  props: {
    logisticsData: {
      type: Object,
      default: null
    },
    logisticsStatusLabel: {
      type: String,
      default: "查询中"
    },
    logisticsStatusClass: {
      type: String,
      default: "tag-default"
    }
  },
  emits: ["close", "copy"],
  setup(__props) {
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => _ctx.$emit("close"), "fb"),
        b: __props.logisticsData
      }, __props.logisticsData ? {
        c: common_vendor.t(__props.logisticsData.logisticsCompany || "物流公司"),
        d: common_vendor.t(__props.logisticsStatusLabel),
        e: common_vendor.n(__props.logisticsStatusClass),
        f: common_vendor.t(__props.logisticsData.trackingNo || "--"),
        g: common_vendor.o(($event) => _ctx.$emit("copy"), "8e")
      } : {}, {
        h: !__props.logisticsData || !__props.logisticsData.traces || __props.logisticsData.traces.length === 0
      }, !__props.logisticsData || !__props.logisticsData.traces || __props.logisticsData.traces.length === 0 ? {} : {
        i: common_vendor.f(__props.logisticsData.traces, (trace, idx, i0) => {
          return common_vendor.e({
            a: idx === 0 ? 1 : "",
            b: idx < __props.logisticsData.traces.length - 1
          }, idx < __props.logisticsData.traces.length - 1 ? {} : {}, {
            c: common_vendor.t(trace.content),
            d: idx === 0 ? 1 : "",
            e: common_vendor.t(trace.time),
            f: idx,
            g: idx === 0 ? 1 : ""
          });
        })
      }, {
        j: common_vendor.o(() => {
        }, "bc"),
        k: common_vendor.o(($event) => _ctx.$emit("close"), "06")
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b323d6de"]]);
wx.createComponent(Component);
