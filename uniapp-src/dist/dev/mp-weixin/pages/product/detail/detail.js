"use strict";
const common_vendor = require("../../../common/vendor.js");
const platform_weixin_navigation = require("../../../platform/weixin/navigation.js");
const common_assets = require("../../../common/assets.js");
const spec = () => "./popup/spec2.js";
const share = () => "./popup/share.js";
const coupon = () => "./popup/coupon.js";
const previewProduct = () => "./productinfo/previewProduct.js";
const countdown = () => "../../../components/countdown/countdown-presale.js";
function sceneDecode(scene) {
  if (scene === void 0)
    return {};
  const parts = decodeURIComponent(scene).split(",");
  const data = {};
  parts.forEach((part) => {
    const item = part.split(":");
    if (item.length > 0 && item[0])
      data[item[0]] = item[1] || null;
  });
  return data;
}
function getSceneData(query) {
  return query.scene ? sceneDecode(query.scene) : query;
}
function formatContent(content = "") {
  return content.replace(/\<img/gi, '<img style="display:block; margin:0 auto; max-width:100%;"').replace(/\<video/gi, '<video style="display:block; margin:0 auto; max-width:100%;"');
}
const _sfc_main = {
  components: {
    spec,
    share,
    coupon,
    countdown,
    previewProduct
  },
  data() {
    return {
      ispresale: false,
      statusBarHeight: 0,
      titleBarHeight: 0,
      store_open: 1,
      phoneHeight: 0,
      scrollviewHigh: 0,
      loadding: true,
      indicatorDots: true,
      autoplay: false,
      interval: 2e3,
      duration: 500,
      isPopup: false,
      product_id: null,
      detail: {
        product_sku: {},
        show_sku: { product_price: "", product_sku_id: 0, line_price: "", stock_num: 0, sku_image: "" },
        image: [],
        supplier: {},
        server: "",
        commentData: [],
        contentImage: []
      },
      specData: null,
      productModel: {},
      buyNow: false,
      url: "",
      productSpecArr: [],
      cart_total_num: 0,
      isbottmpanel: false,
      isguarantee: false,
      isCreatedImg: false,
      poster_img: "",
      alreadyChioce: "",
      shop_info: "",
      isfollow: "",
      shop_supplier_id: "",
      serverList: "",
      room_id: "",
      isAppShare: false,
      appParams: { title: "", summary: "", path: "" },
      service_type: 0,
      user_id: 0,
      is_virtual: 1,
      couponList: [],
      isCoupon: false,
      middle: 1,
      isVideoPlay: false,
      isContentVideoPlay: false,
      show_discount: "",
      discount: { product_coupon: [], product_reduce: [], give_points: "" },
      activeName: "",
      activePrice: "",
      activeText: "",
      skuName: "",
      is_preview: 0,
      sTop: 0,
      topId: "",
      scrollId: "",
      commentTop: 0,
      contentTop: 0,
      isMPH5: false,
      specDisabled: false,
      referee_id: "",
      is_fav: false,
      chatSetting: {},
      isKefuPop: false
    };
  },
  computed: {
    topHeaderStyle() {
      return this.topBarHeight && this.topBarHeight() === 0 ? "" : `height:${this.topBarHeight()}px;padding-top:${this.topBarTop()}px`;
    },
    topBackStyle() {
      return this.topBarHeight && this.topBarHeight() === 0 ? "" : `height:${this.topBarHeight()}px;`;
    }
  },
  onLoad(query) {
    this.GetStatusBarHeight();
    const sceneData = getSceneData(query);
    this.user_id = common_vendor.index.getStorageSync("user_id");
    this.room_id = query.room_id;
    this.product_id = query.product_id ? query.product_id : sceneData.gid;
    if (query.referee_id)
      common_vendor.index.setStorageSync("referee_id", query.referee_id);
    this.referee_id = common_vendor.index.getStorageSync("referee_id") || "";
  },
  onReady() {
    this.init();
    this.getData();
  },
  onShareAppMessage() {
    this.taskFunc();
    const params = this.getShareUrlParams({
      product_id: this.product_id,
      referee_id: this.getUserId()
    });
    return {
      title: this.detail.product_name,
      path: "/pages/product/detail/detail?" + params,
      imageUrl: this.detail.image ? this.detail.image[0].file_path : ""
    };
  },
  methods: {
    scrollFunc(event) {
      this.scrollId = event.detail.scrollTop.toFixed(1);
    },
    GetStatusBarHeight() {
      const rect = common_vendor.index.getMenuButtonBoundingClientRect ? common_vendor.index.getMenuButtonBoundingClientRect() : { top: 0, height: 0 };
      this.statusBarHeight = rect.top;
      this.titleBarHeight = rect.height;
    },
    init() {
      common_vendor.index.getSystemInfo({
        success: (res) => {
          this.phoneHeight = res.windowHeight;
          common_vendor.index.createSelectorQuery().select(".btns-wrap").boundingClientRect(() => {
            this.scrollviewHigh = this.phoneHeight;
          }).exec();
        }
      });
    },
    initScroll() {
      const offset = this.topBarHeight && this.topBarHeight() ? this.topBarHeight() + this.topBarTop() + 50 : 50;
      common_vendor.index.getSystemInfo({
        success: () => {
          common_vendor.index.createSelectorQuery().select("#product-comment").boundingClientRect((rect) => {
            if (rect)
              this.commentTop = rect.top - offset;
          }).exec();
          common_vendor.index.createSelectorQuery().select("#product-content").boundingClientRect((rect) => {
            if (rect)
              this.contentTop = rect.top - offset;
          }).exec();
        }
      });
    },
    getData() {
      common_vendor.index.showLoading({ title: "加载中" });
      this._get("product.product/detail", {
        product_id: this.product_id,
        url: this.url,
        visitcode: this.getVisitcode(),
        referee_id: this.referee_id
      }, (res) => {
        const data = res.data;
        this.service_type = data.mp_service == null ? 10 : data.mp_service.service_type;
        if (data.detail.is_preview === 1 && (/* @__PURE__ */ new Date()).valueOf() / 1e3 < data.detail.preview_time) {
          this.is_preview = data.detail.is_preview;
          this.activeText = "预告";
          this.activeName = "preview";
          this.activePrice = "preview_price";
          this.specDisabled = true;
          data.detail.preview = {
            start_time: (/* @__PURE__ */ new Date()).valueOf() / 1e3,
            end_time: data.detail.preview_time
          };
        } else if (data.detail.advance && data.detail.advance != null) {
          this.ispresale = true;
          this.activeName = "advance";
          this.activeText = "预售";
          this.activePrice = "advance_price";
          this.skuName = "sku";
        }
        if (data.detail.secKill)
          this.skuName = "seckill";
        this.shop_supplier_id = data.detail.supplier.shop_supplier_id;
        this.shop_info = data.detail.supplier;
        this.isfollow = data.detail.isfollow;
        this.is_virtual = data.detail.is_virtual;
        this.is_fav = data.is_fav;
        this.couponList = data.couponList;
        this.cart_total_num = data.cart_total_num;
        this.store_open = data.store_open;
        data.detail.content = formatContent(data.detail.content);
        if (this.activeName && this.activeName !== "advance" && this.activeName !== "preview") {
          if (data.detail[this.activeName].specData)
            this.initSpecData(data.detail[this.activeName].specData);
        } else if (data.detail.spec_type === 20) {
          this.initSpecData(data.specData);
        }
        this.detail = data.detail;
        this.show_discount = data.show_discount;
        this.discount = data.discount;
        this.getServer();
        this.getChatInfo();
        this.loadding = false;
        common_vendor.index.hideLoading();
        this.$nextTick(() => {
          this.initScroll();
        });
      });
    },
    getServer() {
      const list = [];
      if (this.detail && this.detail.server) {
        this.detail.server.forEach((item) => {
          list.push(item.name);
        });
      }
      this.serverList = list.join("·");
    },
    changeTopId(top) {
      const nextTop = Number(top) + (this.topId === top ? 1 : 0);
      this.topId = nextTop;
    },
    initSpecData(specData) {
      if (!specData)
        return;
      for (const index in specData.spec_attr) {
        for (const itemIndex in specData.spec_attr[index].spec_items) {
          specData.spec_attr[index].spec_items[itemIndex].checked = false;
        }
      }
      this.specData = specData;
      if (this.specData.spec_attr) {
        this.alreadyChioce = "";
        this.specData.spec_attr.forEach((item) => {
          this.alreadyChioce += item.group_name;
          this.alreadyChioce += " / ";
        });
        this.alreadyChioce = this.alreadyChioce.replace(/(\s\/\s)$/gi, "");
      }
    },
    openPopup(type) {
      const model = {
        specData: this.specData,
        detail: this.detail,
        productSpecArr: this.specData != null ? new Array(this.specData.spec_attr.length) : [],
        show_sku: {
          sku_image: "",
          price: 0,
          product_sku_id: 0,
          line_price: 0,
          stock: 0,
          sum: 1
        },
        plus_sku: null,
        type,
        plus_name: ""
      };
      if (this.detail.single_num > 0)
        model.show_sku.sum = this.detail.single_num;
      if (this.activeName === "advance") {
        model.plus_sku = this.detail.advance.sku;
        model.plus_name = "advance";
      }
      if (this.activeName === "secKill") {
        model.plus_sku = this.detail.secKill.seckillSku;
        model.plus_name = "seckill";
      }
      this.productModel = model;
      this.isPopup = true;
    },
    closePopup(specData, cartTotalNum) {
      this.isPopup = false;
      if (specData && specData.spec_attr) {
        this.alreadyChioce = "";
        let selectedText = "已选：";
        let unselectedText = "";
        specData.spec_attr.forEach((attr) => {
          if (attr.spec_items) {
            let valueText = "";
            for (let i = 0; i < attr.spec_items.length; i++) {
              const item = attr.spec_items[i];
              if (item.checked) {
                valueText = item.spec_value + " / ";
                break;
              }
            }
            if (valueText !== "")
              selectedText += valueText;
            else
              unselectedText += attr.group_name;
          }
        });
        if (unselectedText !== "")
          this.alreadyChioce = unselectedText;
        else {
          selectedText = selectedText.replace(/(\s\/\s)$/gi, "");
          this.alreadyChioce = selectedText;
        }
      }
      if (cartTotalNum)
        this.cart_total_num = cartTotalNum;
    },
    lookEvaluate(productId) {
      this.gotoPage("/pages/product/detail/look-evaluate/look-evaluate?product_id=" + productId);
    },
    goback() {
      const pages = getCurrentPages();
      if (pages.length <= 1)
        this.gotoPage("/pages/index/index");
      else
        common_vendor.index.navigateBack();
    },
    gotocart() {
      this.gotoPage("/pages/cart/cart");
    },
    closeBottmpanel(event) {
      this.isbottmpanel = false;
      if (event.type === 2) {
        this.poster_img = event.poster_img;
        this.isCreatedImg = true;
      }
    },
    closeGuarantee() {
      this.isguarantee = false;
    },
    showGuarantee() {
      this.isguarantee = true;
    },
    showShare() {
      this.isbottmpanel = true;
      this.taskFunc();
    },
    closeAppShare() {
      this.isAppShare = false;
    },
    hidePopupFunc() {
      this.isCreatedImg = false;
    },
    savePosterImg() {
      common_vendor.index.showLoading({ title: "加载中" });
      common_vendor.index.downloadFile({
        url: this.poster_img,
        success: (download) => {
          common_vendor.index.hideLoading();
          common_vendor.index.saveImageToPhotosAlbum({
            filePath: download.tempFilePath,
            success: () => {
              common_vendor.index.showToast({ title: "保存成功", icon: "success", duration: 2e3 });
              this.isCreatedImg = false;
            },
            fail: (err) => {
              if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
                common_vendor.index.showToast({ title: "请允许访问相册后重试", icon: "none", duration: 1e3 });
                setTimeout(() => {
                  common_vendor.index.openSetting();
                }, 1e3);
              }
            }
          });
        }
      });
    },
    openCoupon() {
      this.isCoupon = !this.isCoupon;
    },
    closeCouponFunc() {
      this.isCoupon = false;
    },
    goto_shop() {
      this.gotoPage("/pages/shop/shop?shop_supplier_id=" + this.shop_supplier_id);
    },
    favorite() {
      this._post("user.Favorite/add", {
        pid: this.product_id,
        type: 20
      }, () => {
        if (this.isfollow === 0) {
          common_vendor.index.showToast({ icon: "none", title: "收藏成功，请到“我的->我的收藏”查看和管理哦" });
          this.isfollow = 1;
        } else if (this.isfollow === 1) {
          this.isfollow = 0;
          common_vendor.index.showToast({ icon: "none", title: "取消成功" });
        }
      });
    },
    changeSwiper() {
      this.isVideoPlay = false;
    },
    returnValFunc() {
    },
    taskFunc() {
      this._post("plus.task.Task/dayTask", { task_type: "product" }, () => {
      });
    },
    sendFunc(type) {
      this[type]();
    },
    openVideo(type) {
      if (type === "video") {
        this.isVideoPlay = true;
        this.isContentVideoPlay = false;
      } else {
        this.isVideoPlay = false;
        this.isContentVideoPlay = true;
      }
    },
    getChatInfo() {
      this._post("live.roomNew/getChatSetting", {
        app_id: this.getAppId(),
        supplier_id: this.shop_supplier_id
      }, (res) => {
        if (res.code === 1)
          this.chatSetting = res.data;
      });
    },
    contackBack() {
    },
    onKefuClick() {
      common_vendor.index.navigateTo({ url: "/pages/webview/webview?url=" + encodeURIComponent(this.chatSetting.link) });
    },
    onWxKefuClick() {
      platform_weixin_navigation.openCustomerServiceChat({
        extInfo: { url: this.chatSetting.url },
        corpId: this.chatSetting.corpId
      }).catch(() => {
        common_vendor.index.showToast({ title: "暂时无法打开微信客服", icon: "none" });
      });
    },
    onCodeKefuClick() {
      this.isKefuPop = true;
    },
    hideKefuPop() {
      this.isKefuPop = false;
    }
  }
};
if (!Array) {
  const _component_preview_product = common_vendor.resolveComponent("preview-product");
  const _easycom_countdown2 = common_vendor.resolveComponent("countdown");
  const _component_spec = common_vendor.resolveComponent("spec");
  const _component_share = common_vendor.resolveComponent("share");
  const _component_guarantee = common_vendor.resolveComponent("guarantee");
  const _component_app_share = common_vendor.resolveComponent("app-share");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  const _component_coupon = common_vendor.resolveComponent("coupon");
  (_component_preview_product + _easycom_countdown2 + _component_spec + _component_share + _component_guarantee + _component_app_share + _easycom_uni_popup2 + _component_coupon)();
}
const _easycom_countdown = () => "../../../components/countdown/countdown.js";
const _easycom_uni_popup = () => "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_countdown + _easycom_uni_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: _ctx.config.pic_url + "/202604061206265273f3383.png",
    b: common_vendor.o((...args) => $options.goback && $options.goback(...args), "3d"),
    c: common_vendor.s($options.topBackStyle),
    d: common_vendor.s($options.topHeaderStyle),
    e: !$data.loadding
  }, !$data.loadding ? common_vendor.e({
    f: _ctx.config.pic_url + "/202604061206265273f3383.png",
    g: common_vendor.o((...args) => $options.goback && $options.goback(...args), "1f"),
    h: common_vendor.s($options.topBackStyle),
    i: Number($data.scrollId) + 1 < $data.commentTop ? 1 : "",
    j: common_vendor.o(($event) => $options.changeTopId(0), "ce"),
    k: Number($data.scrollId) + 1 < $data.contentTop && Number($data.scrollId) + 1 > $data.commentTop ? 1 : "",
    l: common_vendor.o(($event) => $options.changeTopId($data.commentTop), "b2"),
    m: Number($data.scrollId) + 1 > $data.contentTop ? 1 : "",
    n: common_vendor.o(($event) => $options.changeTopId($data.contentTop), "2d"),
    o: common_vendor.n($data.scrollId < 100 ? "close" : "open"),
    p: common_vendor.s(_ctx.topBarHeight && _ctx.topBarHeight() === 0 ? "" : "padding-top:" + _ctx.topBarTop() + "px"),
    q: $data.detail.video_link
  }, $data.detail.video_link ? common_vendor.e({
    r: !$data.isVideoPlay
  }, !$data.isVideoPlay ? {
    s: common_vendor.o(($event) => $options.openVideo("video"), "37")
  } : {}, {
    t: !$data.isVideoPlay
  }, !$data.isVideoPlay ? {
    v: $data.detail.poster ? $data.detail.poster.file_path : $data.detail.image[0].file_path,
    w: common_vendor.o(($event) => $options.openVideo("video"), "f2")
  } : {
    x: $data.detail.video_link,
    y: $data.isMPH5,
    z: $data.isMPH5,
    A: $data.isMPH5,
    B: common_vendor.o(($event) => $data.isVideoPlay = false, "07")
  }) : {}, {
    C: common_vendor.f($data.detail.image, (image, index, i0) => {
      return {
        a: image.file_path,
        b: common_vendor.o(($event) => _ctx.yulan($data.detail.image, index), index),
        c: index
      };
    }),
    D: $data.indicatorDots,
    E: $data.autoplay,
    F: $data.interval,
    G: $data.duration,
    H: common_vendor.o((...args) => $options.changeSwiper && $options.changeSwiper(...args), "b1"),
    I: $data.is_preview === 1
  }, $data.is_preview === 1 ? {
    J: common_vendor.o($options.sendFunc, "87"),
    K: common_vendor.p({
      detail: $data.detail,
      is_fav: $data.is_fav
    })
  } : {}, {
    L: $data.ispresale
  }, $data.ispresale ? common_vendor.e({
    M: $data.activeName === "advance"
  }, $data.activeName === "advance" ? {
    N: common_vendor.t(_ctx.subPrice($data.detail[$data.activeName][$data.skuName][0].product_price, "1")),
    O: common_vendor.t(_ctx.subPrice($data.detail[$data.activeName][$data.skuName][0].product_price, "2"))
  } : {
    P: common_vendor.t(_ctx.subPrice($data.detail[$data.activeName][$data.skuName][0][$data.activePrice], "1")),
    Q: common_vendor.t(_ctx.subPrice($data.detail[$data.activeName][$data.skuName][0][$data.activePrice], "2"))
  }, {
    R: $data.activeName === "advance"
  }, $data.activeName === "advance" ? {
    S: common_vendor.t((Number($data.detail[$data.activeName][$data.skuName][0].product_price) - Number($data.detail[$data.activeName][$data.skuName][0][$data.activePrice]) + Number($data.detail[$data.activeName].money)).toFixed(2))
  } : {}, {
    T: $data.activeName === "advance"
  }, $data.activeName === "advance" ? {
    U: common_vendor.t($data.detail[$data.activeName].money),
    V: common_vendor.t($data.detail[$data.activeName][$data.skuName][0][$data.activePrice])
  } : {}, {
    W: common_vendor.t($data.activeText),
    X: common_assets._imports_0$1,
    Y: common_vendor.sr("countdown", "489b8bc3-1"),
    Z: common_vendor.o($options.returnValFunc, "e0"),
    aa: common_vendor.p({
      config: {
        startstamp: $data.detail[$data.activeName].start_time,
        endstamp: $data.detail[$data.activeName].end_time
      }
    }),
    ab: $data.discount.give_points > 0
  }, $data.discount.give_points > 0 ? {
    ac: common_vendor.t(_ctx.points_name()),
    ad: common_vendor.t(_ctx.points_name()),
    ae: common_vendor.t($data.discount.give_points),
    af: common_vendor.t(_ctx.points_name())
  } : {}, {
    ag: $data.discount.product_reduce.length > 0
  }, $data.discount.product_reduce.length > 0 ? {
    ah: common_vendor.f($data.discount.product_reduce, (item, index, i0) => {
      return common_vendor.e({
        a: item.full_type === 1
      }, item.full_type === 1 ? {
        b: common_vendor.t(item.full_value),
        c: common_vendor.t(item.reduce_value)
      } : {}, {
        d: item.full_type === 2
      }, item.full_type === 2 ? {
        e: common_vendor.t(item.full_value),
        f: common_vendor.t((100 - item.reduce_value) / 10)
      } : {}, {
        g: index
      });
    })
  } : {}, {
    ai: $data.discount.product_coupon.length > 0
  }, $data.discount.product_coupon.length > 0 ? {
    aj: common_vendor.o((...args) => $options.openCoupon && $options.openCoupon(...args), "a1")
  } : {}, {
    ak: common_vendor.t($data.detail.product_name),
    al: $data.detail.selling_point
  }, $data.detail.selling_point ? {
    am: common_vendor.t($data.detail.selling_point)
  } : {}, {
    an: $data.activeName === "advance"
  }, $data.activeName === "advance" ? {
    ao: common_vendor.t((Number($data.detail[$data.activeName][$data.skuName][0].product_price) - Number($data.detail[$data.activeName][$data.skuName][0][$data.activePrice])).toFixed(2)),
    ap: common_vendor.t($data.detail[$data.activeName].active_time[0]),
    aq: common_vendor.t($data.detail[$data.activeName].active_time[1])
  } : {}) : {}, {
    ar: !$data.ispresale && $data.is_preview !== 1
  }, !$data.ispresale && $data.is_preview !== 1 ? common_vendor.e({
    as: $data.detail.is_user_grade
  }, $data.detail.is_user_grade ? {} : {}, {
    at: common_vendor.t($data.detail.product_sku.product_price),
    av: $data.detail.spec_type === 20 && $data.detail.product_sku.product_price !== $data.detail.product_max_price
  }, $data.detail.spec_type === 20 && $data.detail.product_sku.product_price !== $data.detail.product_max_price ? {
    aw: common_vendor.t($data.detail.product_max_price)
  } : {}, {
    ax: common_assets._imports_1$1,
    ay: common_vendor.o((...args) => $options.showShare && $options.showShare(...args), "ea"),
    az: !$data.is_fav ? 1 : "",
    aA: common_assets._imports_2$1,
    aB: common_vendor.o((...args) => $options.favorite && $options.favorite(...args), "5f"),
    aC: $data.detail.product_sku && $data.detail.product_sku.line_price > 0
  }, $data.detail.product_sku && $data.detail.product_sku.line_price > 0 ? {
    aD: common_vendor.t($data.detail.product_sku.line_price)
  } : {}, {
    aE: common_vendor.t($data.detail.product_sales),
    aF: $data.show_discount
  }, $data.show_discount ? common_vendor.e({
    aG: $data.discount.give_points > 0
  }, $data.discount.give_points > 0 ? {
    aH: common_vendor.t(_ctx.points_name()),
    aI: common_vendor.t(_ctx.points_name()),
    aJ: common_vendor.t($data.discount.give_points),
    aK: common_vendor.t(_ctx.points_name())
  } : {}, {
    aL: $data.discount.product_reduce.length > 0
  }, $data.discount.product_reduce.length > 0 ? {
    aM: common_vendor.f($data.discount.product_reduce, (item, index, i0) => {
      return common_vendor.e({
        a: item.full_type === 1
      }, item.full_type === 1 ? {
        b: common_vendor.t(item.full_value)
      } : {}, {
        c: item.full_type === 2
      }, item.full_type === 2 ? {
        d: common_vendor.t(item.full_value)
      } : {}, {
        e: item.reduce_type === 1
      }, item.reduce_type === 1 ? {
        f: common_vendor.t(item.reduce_value)
      } : {}, {
        g: item.reduce_type === 2
      }, item.reduce_type === 2 ? {
        h: common_vendor.t((100 - item.reduce_value) / 10)
      } : {}, {
        i: index
      });
    })
  } : {}, {
    aN: $data.discount.product_coupon.length > 0
  }, $data.discount.product_coupon.length > 0 ? {
    aO: common_vendor.o((...args) => $options.openCoupon && $options.openCoupon(...args), "b7")
  } : {}) : {}, {
    aP: $data.detail.supplier && $data.detail.supplier.store_type === 20
  }, $data.detail.supplier && $data.detail.supplier.store_type === 20 ? {} : {}, {
    aQ: common_vendor.t($data.detail.product_name),
    aR: $data.detail.selling_point
  }, $data.detail.selling_point ? {
    aS: common_vendor.t($data.detail.selling_point)
  } : {}) : {}, {
    aT: $data.detail.spec_type === 20 || $data.detail.server || $data.detail.secKill
  }, $data.detail.spec_type === 20 || $data.detail.server || $data.detail.secKill ? common_vendor.e({
    aU: $data.detail.secKill
  }, $data.detail.secKill ? {
    aV: common_vendor.o(($event) => _ctx.gotoPage("/pagesPlus/seckill/detail/detail?seckill_product_id=" + $data.detail.secKill.seckill_product_id + "&time_id=" + $data.detail.secKill.time_id), "e5")
  } : {}, {
    aW: $data.detail.spec_type === 20
  }, $data.detail.spec_type === 20 ? {
    aX: common_vendor.t($data.alreadyChioce),
    aY: $data.detail.server !== "" ? 1 : "",
    aZ: common_vendor.o(($event) => $options.openPopup($data.ispresale ? "deposit" : "order"), "6c")
  } : {}, {
    ba: $data.detail.server !== ""
  }, $data.detail.server !== "" ? {
    bb: common_vendor.t($data.serverList),
    bc: common_vendor.o((...args) => $options.showGuarantee && $options.showGuarantee(...args), "73")
  } : {}) : {}, {
    bd: common_vendor.t($data.detail.comment_data_count),
    be: common_vendor.o(($event) => $options.lookEvaluate($data.detail.product_id), "dc"),
    bf: $data.detail.comment_data_count > 0
  }, $data.detail.comment_data_count > 0 ? {
    bg: common_vendor.f($data.detail.commentData, (item, index, i0) => {
      return {
        a: item.user.avatarUrl,
        b: common_vendor.t(item.user.nickName),
        c: common_vendor.t(item.create_time),
        d: common_vendor.t(item.content),
        e: index <= 1,
        f: index
      };
    })
  } : {}, {
    bh: $data.store_open
  }, $data.store_open ? {
    bi: $data.shop_info.logos,
    bj: common_vendor.t($data.shop_info.name),
    bk: common_vendor.t($data.shop_info.category_name),
    bl: common_vendor.t($data.shop_info.product_sales),
    bm: common_vendor.t($data.shop_info.server_score),
    bn: common_vendor.o((...args) => $options.goto_shop && $options.goto_shop(...args), "ef")
  } : {}, {
    bo: $data.detail.video_link_detail
  }, $data.detail.video_link_detail ? common_vendor.e({
    bp: !$data.isContentVideoPlay
  }, !$data.isContentVideoPlay ? {
    bq: common_vendor.o(($event) => $options.openVideo("content-video"), "2e")
  } : {}, {
    br: !$data.isContentVideoPlay
  }, !$data.isContentVideoPlay ? {
    bs: $data.detail.contentPoster ? $data.detail.contentPoster.file_path : "",
    bt: common_vendor.o(($event) => $options.openVideo("content-video"), "93")
  } : {
    bv: $data.detail.video_link_detail,
    bw: $data.isMPH5,
    bx: $data.isMPH5,
    by: $data.isMPH5,
    bz: common_vendor.o(($event) => $data.isContentVideoPlay = false, "fe")
  }) : {}, {
    bA: $data.detail.is_picture === 0
  }, $data.detail.is_picture === 0 ? {
    bB: $data.detail.content
  } : {}, {
    bC: $data.detail.is_picture === 1
  }, $data.detail.is_picture === 1 ? {
    bD: common_vendor.f($data.detail.contentImage, (item, index, i0) => {
      return {
        a: index,
        b: item.file_path
      };
    })
  } : {}, {
    bE: $data.topId,
    bF: $data.scrollviewHigh + "px",
    bG: common_vendor.o((...args) => $options.scrollFunc && $options.scrollFunc(...args), "13")
  }) : {}, {
    bH: common_vendor.o(($event) => _ctx.gotoPage("/pages/index/index"), "ba"),
    bI: $data.cart_total_num > 0
  }, $data.cart_total_num > 0 ? {
    bJ: common_vendor.t($data.cart_total_num)
  } : {}, {
    bK: common_vendor.o((...args) => $options.gotocart && $options.gotocart(...args), "78"),
    bL: $data.chatSetting !== null && $data.chatSetting.type === 10
  }, $data.chatSetting !== null && $data.chatSetting.type === 10 ? common_vendor.e({
    bM: $data.chatSetting.type === 10
  }, $data.chatSetting.type === 10 ? {
    bN: common_vendor.o((...args) => $options.contackBack && $options.contackBack(...args), "80")
  } : {}) : {}, {
    bO: $data.chatSetting !== null && $data.chatSetting.type === 20 && $data.chatSetting.link
  }, $data.chatSetting !== null && $data.chatSetting.type === 20 && $data.chatSetting.link ? {
    bP: common_vendor.o((...args) => $options.onKefuClick && $options.onKefuClick(...args), "4e")
  } : {}, {
    bQ: $data.chatSetting !== null && $data.chatSetting.type === 30 && $data.chatSetting.url && $data.chatSetting.corpId
  }, $data.chatSetting !== null && $data.chatSetting.type === 30 && $data.chatSetting.url && $data.chatSetting.corpId ? {
    bR: common_vendor.o((...args) => $options.onWxKefuClick && $options.onWxKefuClick(...args), "63")
  } : {}, {
    bS: $data.chatSetting !== null && $data.chatSetting.type === 40 && $data.chatSetting.pic
  }, $data.chatSetting !== null && $data.chatSetting.type === 40 && $data.chatSetting.pic ? {
    bT: common_vendor.o((...args) => $options.onCodeKefuClick && $options.onCodeKefuClick(...args), "dc")
  } : {}, {
    bU: $data.is_preview === 1
  }, $data.is_preview === 1 ? {} : common_vendor.e({
    bV: !$data.room_id && !$data.is_virtual && !$data.ispresale && !$data.detail.custom_form
  }, !$data.room_id && !$data.is_virtual && !$data.ispresale && !$data.detail.custom_form ? {
    bW: common_vendor.o(($event) => $options.openPopup("card"), "17")
  } : {}, {
    bX: !$data.ispresale
  }, !$data.ispresale ? {
    bY: common_vendor.o(($event) => $options.openPopup("order"), "3e")
  } : common_vendor.e({
    bZ: $data.activeName === "advance"
  }, $data.activeName === "advance" ? {
    ca: common_vendor.t($data.detail[$data.activeName].money)
  } : {}, {
    cb: common_vendor.o(($event) => $options.openPopup("deposit"), "f8")
  })), {
    cc: common_vendor.o($options.closePopup, "10"),
    cd: common_vendor.p({
      ["spec-disabled"]: $data.specDisabled,
      ["is-popup"]: $data.isPopup,
      ["product-model"]: $data.productModel,
      room_id: $data.room_id
    }),
    ce: common_vendor.o($options.closeBottmpanel, "ec"),
    cf: common_vendor.p({
      isbottmpanel: $data.isbottmpanel,
      product_id: $data.product_id
    }),
    cg: common_vendor.o($options.closeGuarantee, "1b"),
    ch: common_vendor.p({
      isguarantee: $data.isguarantee,
      server: $data.detail.server
    }),
    ci: common_vendor.o($options.closeAppShare, "b1"),
    cj: common_vendor.p({
      ["is-app-share"]: $data.isAppShare,
      ["app-params"]: $data.appParams
    }),
    ck: $data.poster_img,
    cl: common_vendor.o((...args) => $options.savePosterImg && $options.savePosterImg(...args), "89"),
    cm: common_vendor.o($options.hidePopupFunc, "e3"),
    cn: common_vendor.p({
      show: $data.isCreatedImg,
      type: "middle",
      height: "auto"
    }),
    co: common_vendor.o($options.closeCouponFunc, "4f"),
    cp: common_vendor.p({
      ["is-coupon"]: $data.isCoupon,
      discount: $data.discount,
      ["coupon-list"]: $data.discount.product_coupon
    }),
    cq: $data.chatSetting !== null
  }, $data.chatSetting !== null ? {
    cr: $data.chatSetting.pic,
    cs: common_vendor.o($options.hideKefuPop, "4e"),
    ct: common_vendor.p({
      show: $data.isKefuPop,
      type: "middle"
    })
  } : {}, {
    cv: _ctx.theme && _ctx.theme()
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-489b8bc3"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
