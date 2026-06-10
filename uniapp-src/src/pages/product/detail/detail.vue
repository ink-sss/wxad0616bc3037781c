<template>
  <view class="product-detail pr" :data-theme="theme && theme()">
    <view class="tc header" :style="topHeaderStyle">
      <view class="reg180" :style="topBackStyle">
        <image mode="aspectFit" :src="config.pic_url + '/202604061206265273f3383.png'" @tap="goback" />
      </view>
    </view>

    <scroll-view
      v-if="!loadding"
      class="scroll-Y scroll-box"
      scroll-y
      scroll-with-animation
      :scroll-top="topId"
      :style="{ height: scrollviewHigh + 'px' }"
      @scroll="scrollFunc"
    >
      <view
        :class="['top-scroll-nav', scrollId < 100 ? 'close' : 'open']"
        :style="topBarHeight && topBarHeight() === 0 ? '' : 'padding-top:' + topBarTop() + 'px'"
      >
        <view class="pr d-c-c">
          <view class="reg180" :style="topBackStyle">
            <image mode="aspectFit" :src="config.pic_url + '/202604061206265273f3383.png'" @tap="goback" />
          </view>
          <view class="top-title f30">商品详情</view>
        </view>
        <view class="d-b-c" style="height:80rpx">
          <view class="flex-1 tc f30 gray3 top-scroll-nav-item" :class="{ active: Number(scrollId) + 1 < commentTop }" @tap="changeTopId(0)">商品</view>
          <view
            v-if="showComments"
            class="flex-1 tc f30 gray3 top-scroll-nav-item"
            :class="{ active: Number(scrollId) + 1 < contentTop && Number(scrollId) + 1 > commentTop }"
            @tap="changeTopId(commentTop)"
          >
            评价
          </view>
          <view class="flex-1 tc f30 gray3 top-scroll-nav-item" :class="{ active: Number(scrollId) + 1 > contentTop }" @tap="changeTopId(contentTop)">详情</view>
        </view>
      </view>

      <view class="product-pic" id="product-pic">
        <swiper class="swiper" :indicator-dots="indicatorDots" :autoplay="autoplay" :interval="interval" :duration="duration" indicator-color="rgba(255,255,255,.3)" indicator-active-color="#ffffff" @change="changeSwiper">
          <swiper-item v-if="detail.video_link">
            <view v-if="!isVideoPlay" class="icon iconfont icon-bofang play-icon" @tap.stop="openVideo('video')"></view>
            <image v-if="!isVideoPlay" mode="aspectFill" :src="detail.poster ? detail.poster.file_path : detail.image[0].file_path" @tap.stop="openVideo('video')" />
            <video v-else class="video" autoplay :src="detail.video_link" :controls="isMPH5" :show-center-play-btn="isMPH5" :show-play-btn="isMPH5" :enable-progress-gesture="false" @tap="isVideoPlay = false" />
          </swiper-item>
          <swiper-item v-for="(image, index) in detail.image" :key="index">
            <image mode="aspectFill" :src="image.file_path" @tap="yulan(detail.image, index)" />
          </swiper-item>
        </swiper>
      </view>

      <preview-product v-if="is_preview === 1" :detail="detail" :is_fav="is_fav" @send="sendFunc" />

      <block v-if="ispresale">
        <view class="limited-spike">
          <view class="d-s-c mb16">
            <view v-if="activeName === 'advance'" class="f32">
              ¥<text class="f42 fb">{{ subPrice(detail[activeName][skuName][0].product_price, '1') }}.</text>
              <text class="f24 fb">{{ subPrice(detail[activeName][skuName][0].product_price, '2') }}</text>
            </view>
            <view v-else class="f32">
              ¥<text class="f42 fb">{{ subPrice(detail[activeName][skuName][0][activePrice], '1') }}.</text>
              <text class="f24 fb">{{ subPrice(detail[activeName][skuName][0][activePrice], '2') }}</text>
            </view>
            <view v-if="activeName === 'advance'" class="tips-box">
              预估到手价￥{{ (Number(detail[activeName][skuName][0].product_price) - Number(detail[activeName][skuName][0][activePrice]) + Number(detail[activeName].money)).toFixed(2) }}
            </view>
          </view>
          <text v-if="activeName === 'advance'" class="left-name">
            定金¥{{ detail[activeName].money }} (尾款立减¥{{ detail[activeName][skuName][0][activePrice] }})
          </text>
          <view class="right-time">
            <view class="d-e-c mb16">
              {{ activeText }}<image class="jiantou" mode="aspectFit" src="https://man.lqjy.cc/static/icon/jiantou-white.png" />
            </view>
            <countdown
              ref="countdown"
              :config="{ startstamp: detail[activeName].start_time, endstamp: detail[activeName].end_time }"
              @returnVal="returnValFunc"
            />
          </view>
        </view>
        <view class="bg-white mb20 p20 mt-down-box">
          <view class="d-e-c">
            <view class="flex-1">
              <view v-if="discount.give_points > 0" class="p-10-0 line-h-50 f22 gray9 text-ellipsis">
                <text class="text-box">返{{ points_name() }}</text>商城购物返{{ points_name() }}，订单完成后最高返{{ discount.give_points }}{{ points_name() }}
              </view>
              <view v-if="discount.product_reduce.length > 0" class="f26 gray3 line-h-50">
                <text v-for="(item, index) in discount.product_reduce" :key="index" class="manjian-box">
                  <block v-if="item.full_type === 1">满{{ item.full_value }}元 减{{ item.reduce_value }}元</block>
                  <block v-if="item.full_type === 2">满{{ item.full_value }}件 {{ (100 - item.reduce_value) / 10 }}折</block>
                </text>
              </view>
            </view>
            <view v-if="discount.product_coupon.length > 0">
              <view class="text-box-coupon" @tap="openCoupon">
                <text>领券</text>
                <text class="icon iconfont icon-you"></text>
              </view>
            </view>
          </view>
          <view class="f30 gray3 fb">{{ detail.product_name }}</view>
          <view v-if="detail.selling_point" class="product-describe">{{ detail.selling_point }}</view>
          <view v-if="activeName === 'advance'" class="product-presale">
            <view class="d-b-s">
              <view class="gray3 f24" style="width:100rpx">尾款：</view>
              <view class="flex-1">
                <view class="f24 redF11">
                  ￥{{ (Number(detail[activeName][skuName][0].product_price) - Number(detail[activeName][skuName][0][activePrice])).toFixed(2) }}
                </view>
                <view class="gray9 f26">({{ detail[activeName].active_time[0] }}-{{ detail[activeName].active_time[1] }})</view>
              </view>
            </view>
            <view class="d-b-s">
              <view class="gray3 f24" style="width:100rpx">流程：</view>
              <view class="flex-1 gray6 f24">1.付定金-2.付尾款-3.发货</view>
            </view>
          </view>
        </view>
      </block>

      <view v-if="!ispresale && is_preview !== 1" class="bg-white p30 product-info mb22">
        <view class="price-wrap">
          <view class="d-s-s d-c ww100">
            <view class="d-s-c pr ww100 mb16">
              <view class="new-price theme-price">
                <text v-if="detail.is_user_grade" class="fn mr10 fb">会员价</text>
                <text>¥</text>
                <text class="num">{{ detail.product_sku.product_price }}</text>
                <text v-if="detail.spec_type === 20 && detail.product_sku.product_price !== detail.product_max_price" class="num"> - {{ detail.product_max_price }}</text>
              </view>
              <!-- <view class="share-box">
                <button class="d-c d-c-c" @tap="showShare">
                  <image class="share_img" mode="aspectFit" src="https://man.lqjy.cc/static/icon/fx.png" />
                </button>
              </view> -->
              <view v-if="showFavorite" class="sc-box">
                <button class="d-c d-c-c" @tap="favorite">
                  <image class="share_img" :class="{ img_gray: !is_fav }" mode="aspectFit" src="https://man.lqjy.cc/static/icon/sc.png" />
                </button>
              </view>
            </view>
            <view class="d-s-c">
              <view v-if="detail.product_sku && detail.product_sku.line_price > 0" class="gray9 f22">
                原价<text class="old-price">¥{{ detail.product_sku.line_price }}</text><text class="mr10 ml10">|</text>
              </view>
              <text class="already-sale">已售{{ detail.product_sales }}件</text>
            </view>
          </view>
        </view>

        <view v-if="show_discount" class="d-e-c">
          <view class="flex-1">
            <view v-if="discount.give_points > 0" class="p-10-0 line-h-50 f22 gray9 text-ellipsis">
              <text class="text-box">返{{ points_name() }}</text>商城购物返{{ points_name() }}，订单完成后最高返{{ discount.give_points }}{{ points_name() }}
            </view>
            <view v-if="discount.product_reduce.length > 0" class="f26 gray3 line-h-50">
              <text v-for="(item, index) in discount.product_reduce" :key="index" class="manjian-box">
                <block v-if="item.full_type === 1">满{{ item.full_value }}元</block>
                <block v-if="item.full_type === 2">满{{ item.full_value }}件</block>
                <block v-if="item.reduce_type === 1">减{{ item.reduce_value }}元</block>
                <block v-if="item.reduce_type === 2">{{ (100 - item.reduce_value) / 10 }}折</block>
              </text>
            </view>
          </view>
          <view v-if="discount.product_coupon.length > 0">
            <view class="text-box-coupon" @tap="openCoupon">
              <text>领券</text>
              <text class="icon iconfont icon-you"></text>
            </view>
          </view>
        </view>

        <view class="product-name text-ellipsis-2">
          <view v-if="detail.supplier && detail.supplier.store_type === 20" class="store_type">自营</view>
          {{ detail.product_name }}
        </view>
        <view v-if="detail.selling_point" class="product-describe">{{ detail.selling_point }}</view>
      </view>

      <view v-if="detail.spec_type === 20 || detail.server || detail.secKill" class="bg-white mb21 product-comment">
        <view v-if="detail.secKill" class="already-choice">
          <view class="group-hd">
            <view class="left"><text class="f28 gray9">活动 </text></view>
            <view class="d-s-c flex-1 p-0-20">
              <view class="seckill-tips" @tap="gotoPage('/pagesPlus/seckill/detail/detail?seckill_product_id=' + detail.secKill.seckill_product_id + '&time_id=' + detail.secKill.time_id)">
                <text class="icon iconfont icon-yushouxiangmu"></text>限时秒杀
              </view>
            </view>
          </view>
        </view>
        <view v-if="detail.spec_type === 20" class="already-choice d-b-c" :class="{ 'border-b-d9': detail.server !== '' }" @tap="openPopup(ispresale ? 'deposit' : 'order')">
          <view class="group-hd">
            <view class="left"><text class="f28 gray9">选择</text></view>
            <view class="flex-1 p-0-20 center-content f26 text-ellipsis o-h">{{ alreadyChioce }}</view>
          </view>
          <view class="right"><text class="icon iconfont icon-jiantou1 ml10"></text></view>
        </view>
        <view v-if="detail.server !== ''" class="already-choice d-b-c" @tap="showGuarantee">
          <view class="group-hd">
            <view class="left"><text class="f28 gray9">服务</text></view>
            <view class="flex-1 p-0-20 center-content f26 text-ellipsis o-h">{{ serverList }}</view>
          </view>
          <view class="right"><text class="icon iconfont icon-jiantou1 ml10"></text></view>
        </view>
      </view>

      <view v-if="showComments" id="product-comment" class="product-comment">
        <view class="p-0-30 d-b-c">
          <view class="group-hd left"><text class="min-name f28">评价({{ detail.comment_data_count }})</text></view>
          <view class="right d-c-c" @tap="lookEvaluate(detail.product_id)"><text class="more mr10">查看全部</text><text class="icon iconfont icon-jiantou1"></text></view>
        </view>
        <view v-if="detail.comment_data_count > 0" class="comment-list">
          <view v-for="(item, index) in detail.commentData" v-show="index <= 1" :key="index" class="item">
            <view class="cmt-user">
              <view class="left"><image class="photo" mode="aspectFill" :src="item.user.avatarUrl" /><text class="name">{{ item.user.nickName }}</text></view>
              <text class="datetime">{{ item.create_time }}</text>
            </view>
            <view class="mt20 lh150 f24">{{ item.content }}</view>
          </view>
        </view>
      </view>

      <view v-if="store_open" class="shop_head_info product-comment">
        <view class="shop-box">
          <view class="shop-logo"><image :src="shop_info.logos" /></view>
          <view class="shop-box-info flex-1">
            <view class="f32 title fb">{{ shop_info.name }}</view>
            <view class="f26 brand gray9">主营品牌： {{ shop_info.category_name }}</view>
            <view class="f26 sales gray9">销量：{{ shop_info.product_sales }}件</view>
          </view>
          <view class="shop-infobox">
            <view class="f26 dominant">商户评分：<text class="fb">{{ shop_info.server_score }}</text></view>
            <button class="theme-borderbtn" @tap="goto_shop">进店看看</button>
          </view>
        </view>
      </view>

      <view id="product-content" class="product-content">
        <view class="p-0-30 border-b-e"><view class="group-hd d-s-c"><text class="min-name f28">商品介绍</text></view></view>
        <view class="content-box">
          <view v-if="detail.video_link_detail" class="contentVideo">
            <view v-if="!isContentVideoPlay" class="icon iconfont icon-bofang play-icon" @tap.stop="openVideo('content-video')"></view>
            <image v-if="!isContentVideoPlay" :src="detail.contentPoster ? detail.contentPoster.file_path : ''" @tap.stop="openVideo('content-video')" />
            <video v-else class="video" autoplay :src="detail.video_link_detail" :controls="isMPH5" :show-center-play-btn="isMPH5" :show-play-btn="isMPH5" :enable-progress-gesture="false" @tap="isContentVideoPlay = false" />
          </view>
          <rich-text v-if="detail.is_picture === 0" :nodes="detail.content" />
          <view v-if="detail.is_picture === 1">
            <image v-for="(item, index) in detail.contentImage" :key="index" class="ww100" mode="widthFix" :src="item.file_path" />
          </view>
        </view>
      </view>
      <view class="sage-bottom"></view>
    </scroll-view>

    <view class="btns-wrap">
      <view class="icon-box d-c-c">
        <button class="d-c-c d-c bg-white" @tap="gotoPage('/pages/index/index')">
          <image class="detail-tab-icon" mode="aspectFit" src="/static/icon/detail-home.png" />
          <text class="detail-tab-text f22 gray3">首页</text>
        </button>
      </view>
      <view class="icon-box d-c-c">
        <button class="pr d-c-c d-c bg-white" @tap="gotocart">
          <image class="detail-tab-icon" mode="aspectFit" src="/static/icon/detail-cart.png" />
          <text class="detail-tab-text f22 gray3">购物车</text>
          <text v-if="cart_total_num > 0" class="cart_num">{{ cart_total_num }}</text>
        </button>
      </view>
      <view v-if="chatSetting !== null && chatSetting.type === 10" class="icon-box d-c-c">
        <button v-if="chatSetting.type === 10" class="d-c-c d-c bg-white" open-type="contact" @contact="contackBack">
          <text class="icon iconfont icon-kefu3 gray3" style="height:50rpx;line-height:60rpx"></text>
          <text class="f22 gray3" style="height:50rpx;line-height:40rpx">客服</text>
        </button>
      </view>
      <view v-if="chatSetting !== null && chatSetting.type === 20 && chatSetting.link" class="icon-box d-c-c">
        <button class="d-c-c d-c bg-white" @tap="onKefuClick">
          <text class="icon iconfont icon-kefu3 gray3" style="height:50rpx;line-height:60rpx"></text>
          <text class="f22 gray3" style="height:50rpx;line-height:40rpx">客服</text>
        </button>
      </view>
      <view v-if="chatSetting !== null && chatSetting.type === 30 && chatSetting.url && chatSetting.corpId" class="icon-box d-c-c">
        <button class="d-c-c d-c bg-white" @tap="onWxKefuClick">
          <text class="icon iconfont icon-kefu3 gray3" style="height:50rpx;line-height:60rpx"></text>
          <text class="f22 gray3" style="height:50rpx;line-height:40rpx">客服</text>
        </button>
      </view>
      <view v-if="chatSetting !== null && chatSetting.type === 40 && chatSetting.pic" class="icon-box d-c-c">
        <button class="d-c-c d-c bg-white" @tap="onCodeKefuClick">
          <text class="icon iconfont icon-kefu3 gray3" style="height:50rpx;line-height:60rpx"></text>
          <text class="f22 gray3" style="height:50rpx;line-height:40rpx">客服</text>
        </button>
      </view>
      <button v-if="is_preview === 1" class="add-cart-no">暂未开始售卖</button>
      <block v-else>
        <button v-if="!ispresale && !detail.custom_form" class="add-cart" @tap="handleAddCartClick">加入购物车</button>
        <button v-else class="add-cart-no" @tap="handleAddCartClick">加入购物车</button>
        <button v-if="!ispresale" class="buy" @tap="handleBuyNowClick">立即购买</button>
        <button v-else class="buy ispresale" @tap="handleBuyNowClick">
          <block v-if="activeName === 'advance'"><view class="f28">支付定金</view><view class="f22">￥{{ detail[activeName].money }}</view></block>
          <block v-else>立即购买</block>
        </button>
      </block>
    </view>

    <spec
      :spec-disabled="specDisabled"
      :is-popup="isPopup"
      :product-model="productModel"
      :room_id="room_id"
      :room-code="room_code"
      :term-id="term_id"
      :tenant-id="tenant_id"
      :share-code="share_code"
      @close="closePopup"
    />
    <share :isbottmpanel="isbottmpanel" :product_id="product_id" @close="closeBottmpanel" />
    <guarantee :isguarantee="isguarantee" :server="detail.server" @close="closeGuarantee" />
    <app-share :is-app-share="isAppShare" :app-params="appParams" @close="closeAppShare" />
    <uni-popup :show="isCreatedImg" type="middle" height="auto" @hidePopup="hidePopupFunc">
      <view class="d-c-c d-c create-img">
        <image mode="widthFix" :src="poster_img" />
        <button class="btn-red mt20" type="default" @tap="savePosterImg">保存图片</button>
      </view>
    </uni-popup>
    <coupon :is-coupon="isCoupon" :discount="discount" :coupon-list="discount.product_coupon" @close="closeCouponFunc" />
    <product-buy-popup
      v-if="showBuyPopup"
      :visible="showBuyPopup"
      :product="buyProduct"
      :address-text="buyAddressText"
      :address-detail="selectedAddress || {}"
      :shipping-fee="buyShippingFee"
      :goods-amount="buyGoodsAmount"
      :total-price="buyTotalPrice"
      :discount-amount="buyDiscountAmount"
      :remark="buyRemark"
      :loading="buyLoading"
      :require-address="buyRequireAddress"
      :usable-coupons="usableCoupons"
      :unusable-coupons="unusableCoupons"
      :selected-coupon-id="selectedCouponId"
      :coupon-loading="couponLoading"
      :confirm-text="buyConfirmText"
      :allow-missing-address-confirm="buyAllowMissingAddressConfirm"
      @close="showBuyPopup = false"
      @select-address="openBuyAddressPopup"
      @update:remark="buyRemark = $event"
      @update:quantity="onBuyQuantityChange"
      @update:sku="onBuySkuChange"
      @select-coupon="onBuyCouponSelect"
      @confirm="onBuyConfirm"
    />
    <bottom-sheet-popup
      v-if="showAddressPopup"
      :visible="showAddressPopup"
      :height="addressList.length === 0 ? '66vh' : '78vh'"
      radius="24rpx 24rpx 0 0"
      :duration="500"
      :z-index="100000002"
      :with-mask="true"
      mask-color="rgba(0, 0, 0, 0.35)"
      @close="showAddressPopup = false"
    >
      <address-list-panel
        :list="addressList"
        :selected-id="selectedAddressId"
        title="地址管理"
        button-text="确定"
        :show-default-row="false"
        :button-disabled="!selectedAddressId"
        @select="selectedAddressId = $event"
        @save="confirmBuyAddress"
        @edit="onEditBuyAddress"
        @add="onAddBuyAddress"
        @delete="onDeleteBuyAddress"
        @import-wx="onImportWxAddress"
      />
    </bottom-sheet-popup>
    <address-form-popup
      v-if="showAddressFormPopup"
      :visible="showAddressFormPopup"
      :edit-data="editAddressData"
      popup-height="78vh"
      :z-index="100000003"
      @close="showAddressFormPopup = false"
      @saved="onBuyAddressSaved"
    />
    <uni-popup v-if="chatSetting !== null" :show="isKefuPop" type="middle" @hidePopup="hideKefuPop">
      <view class="kf-pop-view">
        <view class="kf-pop-title">客服二维码</view>
        <image mode="widthFix" :show-menu-by-longpress="true" :src="chatSetting.pic" style="width:75vw" />
        <view class="kf-pop-tip">长按识别图中二维码</view>
        <view class="kf-pop-tip">点击空白处关闭</view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import spec from './popup/spec.vue'
import share from './popup/share.vue'
import coupon from './popup/coupon.vue'
import previewProduct from './productinfo/previewProduct.vue'
import countdown from '../../../components/countdown/countdown-presale.vue'
import guarantee from '../../../components/guarantee.vue'
import ProductBuyPopup from '../../../components/product-buy-popup.vue'
import BottomSheetPopup from '../../../components/bottom-sheet-popup.vue'
import AddressListPanel from '../../../components/address-list-panel.vue'
import AddressFormPopup from '../../../components/address-form-popup.vue'
import { openCustomerServiceChat } from '../../../platform/weixin/navigation.js'
import { fetchProductDetail, normalizeProductDetail } from '../../../services/miniprogram-products.js'
import { addLocalCartItem } from '../../../services/local-cart.js'
import { useProductDetailPurchase } from '../../../composables/useProductDetailPurchase.js'

function sceneDecode(scene) {
  if (scene === undefined) return {}
  const parts = decodeURIComponent(scene).split(',')
  const data = {}
  parts.forEach((part) => {
    const item = part.split(':')
    if (item.length > 0 && item[0]) data[item[0]] = item[1] || null
  })
  return data
}

function getSceneData(query) {
  return query.scene ? sceneDecode(query.scene) : query
}

function formatContent(content = '') {
  return content
    .replace(/\<img/gi, '<img style="display:block; margin:0 auto; max-width:100%;"')
    .replace(/\<video/gi, '<video style="display:block; margin:0 auto; max-width:100%;"')
}

export default {
  components: {
    spec,
    share,
    coupon,
    countdown,
    previewProduct,
    guarantee,
    ProductBuyPopup,
    BottomSheetPopup,
    AddressListPanel,
    AddressFormPopup
  },
  setup() {
    return useProductDetailPurchase()
  },
  data() {
    return {
      ispresale: false,
      statusBarHeight: 0,
      titleBarHeight: 0,
      store_open: 0,
      phoneHeight: 0,
      scrollviewHigh: 0,
      loadding: true,
      indicatorDots: true,
      autoplay: false,
      interval: 2000,
      duration: 500,
      isPopup: false,
      product_id: null,
      detail: {
        product_sku: {},
        show_sku: { product_price: '', product_sku_id: 0, line_price: '', stock_num: 0, sku_image: '' },
        image: [],
        supplier: {},
        server: '',
        commentData: [],
        contentImage: []
      },
      specData: null,
      productModel: {},
      buyNow: false,
      url: '',
      productSpecArr: [],
      cart_total_num: 0,
      isbottmpanel: false,
      isguarantee: false,
      isCreatedImg: false,
      poster_img: '',
      alreadyChioce: '',
      shop_info: '',
      isfollow: '',
      shop_supplier_id: '',
      serverList: '',
      room_id: '',
      room_code: '',
      term_id: '',
      tenant_id: '',
      share_code: '',
      isAppShare: false,
      appParams: { title: '', summary: '', path: '' },
      service_type: 0,
      user_id: 0,
      is_virtual: 1,
      couponList: [],
      isCoupon: false,
      middle: 1,
      isVideoPlay: false,
      isContentVideoPlay: false,
      show_discount: '',
      discount: { product_coupon: [], product_reduce: [], give_points: '' },
      activeName: '',
      activePrice: '',
      activeText: '',
      skuName: '',
      is_preview: 0,
      sTop: 0,
      topId: '',
      scrollId: '',
      commentTop: 0,
      contentTop: 0,
      isMPH5: false,
      specDisabled: false,
      referee_id: '',
      is_fav: false,
      chatSetting: null,
      isKefuPop: false,
      showFavorite: false,
      showComments: false
    }
  },
  computed: {
    topHeaderStyle() {
      return this.topBarHeight && this.topBarHeight() === 0 ? '' : `height:${this.topBarHeight()}px;padding-top:${this.topBarTop()}px`
    },
    topBackStyle() {
      return this.topBarHeight && this.topBarHeight() === 0 ? '' : `height:${this.topBarHeight()}px;`
    }
  },
  onLoad(query) {
    this.GetStatusBarHeight()
    const sceneData = getSceneData(query)
    this.user_id = uni.getStorageSync('user_id')
    this.room_id = query.room_id || query.roomId || query.liveRoomId || query.live_room_id || query.liveId || query.live_id || ''
    this.room_code = query.roomCode || query.room_code || ''
    this.term_id = query.termId || query.term_id || query.liveTermId || query.live_term_id || ''
    this.tenant_id = query.tenantId || query.tenant_id || ''
    this.share_code = query.shareCode || query.share_code || ''
    this.product_id = query.product_id || query.productId || query.goodsId || query.goods_id || sceneData.gid
    if (query.referee_id) uni.setStorageSync('referee_id', query.referee_id)
    this.referee_id = uni.getStorageSync('referee_id') || ''
  },
  onReady() {
    this.init()
    this.getData()
  },
  onShow() {
    this.checkPendingProductOrder()
  },
  onShareAppMessage() {
    const params = this.getShareUrlParams({
      product_id: this.product_id,
      referee_id: this.getUserId()
    })
    return {
      title: this.detail.product_name,
      path: '/pages/product/detail/detail?' + params,
      imageUrl: this.detail.image ? this.detail.image[0].file_path : ''
    }
  },
  methods: {
    scrollFunc(event) {
      this.scrollId = event.detail.scrollTop.toFixed(1)
    },
    GetStatusBarHeight() {
      const rect = uni.getMenuButtonBoundingClientRect ? uni.getMenuButtonBoundingClientRect() : { top: 0, height: 0 }
      this.statusBarHeight = rect.top
      this.titleBarHeight = rect.height
    },
    init() {
      uni.getSystemInfo({
        success: (res) => {
          this.phoneHeight = res.windowHeight
          uni.createSelectorQuery().select('.btns-wrap').boundingClientRect(() => {
            this.scrollviewHigh = this.phoneHeight
          }).exec()
        }
      })
    },
    initScroll() {
      const offset = this.topBarHeight && this.topBarHeight() ? this.topBarHeight() + this.topBarTop() + 50 : 50
      uni.getSystemInfo({
        success: () => {
          uni.createSelectorQuery().select('#product-comment').boundingClientRect((rect) => {
            if (rect) this.commentTop = rect.top - offset
          }).exec()
          uni.createSelectorQuery().select('#product-content').boundingClientRect((rect) => {
            if (rect) this.contentTop = rect.top - offset
          }).exec()
        }
      })
    },
    getData() {
      uni.showLoading({ title: '加载中' })
      fetchProductDetail(this.product_id).then((product) => {
        const data = normalizeProductDetail(product || {})
        this.service_type = data.mp_service == null ? 10 : data.mp_service.service_type
        if (data.detail.is_preview === 1 && new Date().valueOf() / 1000 < data.detail.preview_time) {
          this.is_preview = data.detail.is_preview
          this.activeText = '预告'
          this.activeName = 'preview'
          this.activePrice = 'preview_price'
          this.specDisabled = true
          data.detail.preview = {
            start_time: new Date().valueOf() / 1000,
            end_time: data.detail.preview_time
          }
        } else if (data.detail.advance && data.detail.advance != null) {
          this.ispresale = true
          this.activeName = 'advance'
          this.activeText = '预售'
          this.activePrice = 'advance_price'
          this.skuName = 'sku'
        }
        if (data.detail.secKill) this.skuName = 'seckill'
        this.shop_supplier_id = data.detail.supplier ? data.detail.supplier.shop_supplier_id : 0
        this.shop_info = data.detail.supplier || {}
        this.isfollow = data.detail.isfollow || 0
        this.is_virtual = data.detail.is_virtual
        this.is_fav = false
        this.couponList = []
        this.cart_total_num = data.cart_total_num || 0
        this.store_open = 0
        data.detail.content = formatContent(data.detail.content)
        if (this.activeName && this.activeName !== 'advance' && this.activeName !== 'preview') {
          if (data.detail[this.activeName].specData) this.initSpecData(data.detail[this.activeName].specData)
        } else if (data.detail.spec_type === 20) {
          this.initSpecData(data.specData)
        }
        this.detail = data.detail
        this.show_discount = false
        this.discount = { product_coupon: [], product_reduce: [], give_points: 0 }
        this.showFavorite = false
        this.showComments = false
        this.getServer()
        this.chatSetting = null
        this.loadding = false
        uni.hideLoading()
        this.$nextTick(() => {
          this.initScroll()
        })
      }).catch(() => {
        this.loadding = false
        uni.hideLoading()
        uni.showToast({ title: '商品加载失败', icon: 'none' })
      })
    },
    getServer() {
      const list = []
      if (this.detail && this.detail.server) {
        this.detail.server.forEach((item) => {
          list.push(item.name)
        })
      }
      this.serverList = list.join('·')
    },
    changeTopId(top) {
      const nextTop = Number(top) + (this.topId === top ? 1 : 0)
      this.topId = nextTop
    },
    initSpecData(specData) {
      if (!specData) return
      for (const index in specData.spec_attr) {
        for (const itemIndex in specData.spec_attr[index].spec_items) {
          specData.spec_attr[index].spec_items[itemIndex].checked = false
        }
      }
      this.specData = specData
      if (this.specData.spec_attr) {
        this.alreadyChioce = ''
        this.specData.spec_attr.forEach((item) => {
          this.alreadyChioce += item.group_name
          this.alreadyChioce += ' / '
        })
        this.alreadyChioce = this.alreadyChioce.replace(/(\s\/\s)$/gi, '')
      }
    },
    openPopup(type) {
      const model = {
        specData: this.specData,
        detail: this.detail,
        productSpecArr: this.specData != null ? new Array(this.specData.spec_attr.length) : [],
        show_sku: {
          sku_image: '',
          price: 0,
          product_sku_id: 0,
          line_price: 0,
          stock: 0,
          sum: 1
        },
        plus_sku: null,
        type,
        plus_name: ''
      }
      if (this.detail.single_num > 0) model.show_sku.sum = this.detail.single_num
      if (this.activeName === 'advance') {
        model.plus_sku = this.detail.advance.sku
        model.plus_name = 'advance'
      }
      if (this.activeName === 'secKill') {
        model.plus_sku = this.detail.secKill.seckillSku
        model.plus_name = 'seckill'
      }
      this.productModel = model
      this.isPopup = true
    },
    handleAddCartClick() {
      if (this.ispresale) {
        uni.showToast({ title: '预售商品请点击立即购买', icon: 'none' })
        return
      }
      if (this.detail.custom_form) {
        uni.showToast({ title: '该商品需填写表单，暂不支持加入购物车', icon: 'none' })
        return
      }
      if (this.detail.spec_type !== 20 || !this.specData) {
        this.addCurrentProductToCart()
        return
      }
      this.openPopup('card')
    },
    addCurrentProductToCart() {
      const sku = this.detail.product_sku || {}
      const image = Array.isArray(this.detail.image) && this.detail.image[0] ? this.detail.image[0].file_path : this.detail.product_image
      const totalNum = this.detail.single_num > 0 ? this.detail.single_num : 1
      const summary = addLocalCartItem({
        ...this.detail,
        product_image: image,
        product_price: sku.product_price || this.detail.product_price,
        line_price: sku.line_price || this.detail.line_price,
        stock_num: sku.stock_num || this.detail.product_stock,
        spec_sku_id: sku.spec_sku_id || sku.product_sku_id || 0,
        product_attr: sku.product_attr || ''
      }, totalNum)
      this.cart_total_num = summary.totalNum
      uni.showToast({ title: '已加入购物车', icon: 'success' })
    },
    getBuyOrderType() {
      if (this.detail.custom_form) return 'custom_form'
      if (this.ispresale || this.activeName === 'advance') return 'deposit'
      if (this.detail.secKill) return 'seckill'
      return 'buy'
    },
    handleBuyNowClick() {
      this.openProductDetailBuyPopup({
        detail: this.detail,
        productId: this.product_id,
        specData: this.specData,
        orderType: this.getBuyOrderType(),
        liveContext: {
          roomId: this.room_id,
          roomCode: this.room_code,
          termId: this.term_id,
          tenantId: this.tenant_id,
          shareCode: this.share_code
        }
      })
    },
    closePopup(specData, cartTotalNum) {
      this.isPopup = false
      if (specData && specData.spec_attr) {
        this.alreadyChioce = ''
        let selectedText = '已选：'
        let unselectedText = ''
        specData.spec_attr.forEach((attr) => {
          if (attr.spec_items) {
            let valueText = ''
            for (let i = 0; i < attr.spec_items.length; i++) {
              const item = attr.spec_items[i]
              if (item.checked) {
                valueText = item.spec_value + ' / '
                break
              }
            }
            if (valueText !== '') selectedText += valueText
            else unselectedText += attr.group_name
          }
        })
        if (unselectedText !== '') this.alreadyChioce = unselectedText
        else {
          selectedText = selectedText.replace(/(\s\/\s)$/gi, '')
          this.alreadyChioce = selectedText
        }
      }
      if (cartTotalNum) this.cart_total_num = cartTotalNum
    },
    lookEvaluate(productId) {
      this.gotoPage('/pages/product/detail/look-evaluate/look-evaluate?product_id=' + productId)
    },
    goback() {
      const pages = getCurrentPages()
      if (pages.length <= 1) this.gotoPage('/pages/index/index')
      else uni.navigateBack()
    },
    gotocart() {
      this.gotoPage('/pages/cart/cart')
    },
    closeBottmpanel(event) {
      this.isbottmpanel = false
      if (event.type === 2) {
        this.poster_img = event.poster_img
        this.isCreatedImg = true
      }
    },
    closeGuarantee() {
      this.isguarantee = false
    },
    showGuarantee() {
      this.isguarantee = true
    },
    showShare() {
      this.isbottmpanel = true
    },
    closeAppShare() {
      this.isAppShare = false
    },
    hidePopupFunc() {
      this.isCreatedImg = false
    },
    savePosterImg() {
      uni.showLoading({ title: '加载中' })
      uni.downloadFile({
        url: this.poster_img,
        success: (download) => {
          uni.hideLoading()
          uni.saveImageToPhotosAlbum({
            filePath: download.tempFilePath,
            success: () => {
              uni.showToast({ title: '保存成功', icon: 'success', duration: 2000 })
              this.isCreatedImg = false
            },
            fail: (err) => {
              if (err.errMsg === 'saveImageToPhotosAlbum:fail auth deny') {
                uni.showToast({ title: '请允许访问相册后重试', icon: 'none', duration: 1000 })
                setTimeout(() => {
                  uni.openSetting()
                }, 1000)
              }
            }
          })
        }
      })
    },
    openCoupon() {
      this.isCoupon = !this.isCoupon
    },
    closeCouponFunc() {
      this.isCoupon = false
    },
    goto_shop() {
      this.gotoPage('/pagesPlus/main/shop/shop?shop_supplier_id=' + this.shop_supplier_id)
    },
    favorite() {
      return false
    },
    changeSwiper() {
      this.isVideoPlay = false
    },
    returnValFunc() {},
    taskFunc() {
      return false
    },
    sendFunc(type) {
      this[type]()
    },
    openVideo(type) {
      if (type === 'video') {
        this.isVideoPlay = true
        this.isContentVideoPlay = false
      } else {
        this.isVideoPlay = false
        this.isContentVideoPlay = true
      }
    },
    getChatInfo() {
      this.chatSetting = null
    },
    contackBack() {},
    onKefuClick() {
      uni.navigateTo({ url: '/pagesPlus/main/webview/webview?url=' + encodeURIComponent(this.chatSetting.link) })
    },
    onWxKefuClick() {
      openCustomerServiceChat({
        extInfo: { url: this.chatSetting.url },
        corpId: this.chatSetting.corpId
      }).catch(() => {
        uni.showToast({ title: '暂时无法打开微信客服', icon: 'none' })
      })
    },
    onCodeKefuClick() {
      this.isKefuPop = true
    },
    hideKefuPop() {
      this.isKefuPop = false
    }
  }
}
</script>

<style scoped>
.product-detail { min-height: 100vh; background: #f7f7f7; padding-bottom: 120rpx; }
.pr { position: relative; }
.ww100 { width: 100%; }
.tc { text-align: center; }
.bg-white { background: #fff; }
.p30 { padding: 30rpx; }
.p20 { padding: 20rpx; }
.p-0-30 { padding-left: 30rpx; padding-right: 30rpx; }
.p-0-20 { padding-left: 20rpx; padding-right: 20rpx; }
.p-10-0 { padding-top: 10rpx; padding-bottom: 10rpx; }
.mb16 { margin-bottom: 16rpx; }
.mb20 { margin-bottom: 20rpx; }
.mb21 { margin-bottom: 21rpx; }
.mb22 { margin-bottom: 22rpx; }
.mt20 { margin-top: 20rpx; }
.mt-down-box { margin-top: -80rpx; }
.ml10 { margin-left: 10rpx; }
.mr10 { margin-right: 10rpx; }
.f22 { font-size: 22rpx; }
.f24 { font-size: 24rpx; }
.f26 { font-size: 26rpx; }
.f28 { font-size: 28rpx; }
.f30 { font-size: 30rpx; }
.f32 { font-size: 32rpx; }
.f42 { font-size: 42rpx; }
.fb { font-weight: 700; }
.fn { font-weight: 400; }
.gray3 { color: #333; }
.gray6 { color: #666; }
.gray9 { color: #999; }
.redF11 { color: #f11e0b; }
.line-h-50 { line-height: 50rpx; }
.lh150 { line-height: 1.5; }
.border-b-e { border-bottom: 1rpx solid #eee; }
.border-b-d9 { border-bottom: 1rpx solid #d9d9d9; }
.header { position: fixed; left: 0; right: 0; top: 0; z-index: 30; pointer-events: none; }
.header image { width: 48rpx; height: 48rpx; }
.reg180 { display: flex; align-items: center; justify-content: center; width: 88rpx; pointer-events: auto; }
.scroll-box { background: #f7f7f7; }
.product-pic { position: relative; background: #fff; }
.swiper, .swiper image, .swiper video { width: 100%; height: 750rpx; }
.play-icon { position: absolute; left: 50%; top: 50%; z-index: 2; transform: translate(-50%,-50%); width: 96rpx; height: 96rpx; border-radius: 50%; background: rgba(0,0,0,.45); color: #fff; line-height: 96rpx; text-align: center; font-size: 54rpx; }
.product-comment { margin-bottom: 20rpx; background: #fff; }
.already-choice { min-height: 88rpx; padding: 0 30rpx; display: flex; align-items: center; border-bottom: 1rpx solid #f5f5f5; }
.group-hd { display: flex; align-items: center; flex: 1; }
.center-content { color: #333; }
.comment-list .item { padding: 20rpx 30rpx; border-top: 1rpx solid #f5f5f5; }
.cmt-user { display: flex; align-items: center; justify-content: space-between; }
.cmt-user .left { display: flex; align-items: center; }
.photo { width: 56rpx; height: 56rpx; margin-right: 14rpx; border-radius: 50%; }
.shop-box { display: flex; align-items: center; padding: 30rpx; }
.shop-logo image { width: 108rpx; height: 108rpx; margin-right: 20rpx; border-radius: 12rpx; background: #f5f5f5; }
.theme-borderbtn { margin-top: 12rpx; height: 52rpx; border: 1rpx solid #ff5704; border-radius: 26rpx; color: #ff5704; background: #fff; line-height: 50rpx; font-size: 24rpx; }
.product-content { background: #fff; }
.content-box { padding: 20rpx 0; }
.contentVideo { position: relative; width: 100%; min-height: 360rpx; background: #111; }
.contentVideo image, .contentVideo video { width: 100%; height: 420rpx; }
.sage-bottom { height: 120rpx; }
.cart_num { position: absolute; right: 6rpx; top: 2rpx; min-width: 28rpx; height: 28rpx; padding: 0 6rpx; border-radius: 14rpx; background: #ff5704; color: #fff; font-size: 20rpx; line-height: 28rpx; }
.create-img image { width: 70vw; }
.btn-red { background: #ff5704; color: #fff; }
.kf-pop-view { padding: 30rpx; text-align: center; background: #fff; border-radius: 16rpx; }
.kf-pop-title { margin-bottom: 20rpx; font-size: 32rpx; font-weight: 700; }
.kf-pop-tip { margin-top: 12rpx; color: #999; font-size: 24rpx; }

/* Recovered from root pages/product/detail/detail.wxss. */
button {
    border: none;
    margin: 0
}

button.active-btn:after {
    width: 0
}

.sage-bottom {
    height: calc(100rpx + env(safe-area-inset-bottom));
    width: 100%
}

.contentVideo image,.contentVideo {
    height: 702rpx;
    position: relative;
    width: 702rpx
}

.product-detail .product-pic .swiper,.product-detail .product-pic image,.product-detail .product-pic {
    height: 750rpx;
    width: 750rpx
}

.contentVideo .icon.icon-bofang,.product-detail .product-pic .swiper .icon-bofang {
    -webkit-align-items: center;
    align-items: center;
    background-color: rgba(0,0,0,.5);
    border: 4rpx solid #fff;
    border-radius: 50%;
    bottom: 0;
    box-sizing: border-box;
    color: #fff;
    display: -webkit-flex;
    display: flex;
    font-size: 48rpx;
    height: 120rpx;
    -webkit-justify-content: center;
    justify-content: center;
    left: 0;
    margin: auto;
    padding-left: 16rpx;
    position: absolute;
    right: 0;
    top: 0;
    width: 120rpx;
    z-index: 10
}

.product-detail .price-wrap {
    -webkit-align-items: center;
    align-items: center;
    display: -webkit-flex;
    display: flex;
    -webkit-justify-content: space-between;
    justify-content: space-between
}

.product-detail .price-wrap .left {
    -webkit-align-items: flex-end;
    align-items: flex-end;
    display: -webkit-flex;
    display: flex;
    -webkit-justify-content: flex-start;
    justify-content: flex-start
}

.product-detail .price-wrap .new-price {
    font-size: 30rpx;
    font-weight: 700;
    margin-right: 14rpx
}

[data-theme=theme0] .product-detail .price-wrap .new-price {
    color: #ff4c01!important
}

[data-theme=theme1] .product-detail .price-wrap .new-price {
    color: #e31c28!important
}

[data-theme=theme2] .product-detail .price-wrap .new-price {
    color: #f55234!important
}

[data-theme=theme3] .product-detail .price-wrap .new-price {
    color: #ff4645!important
}

[data-theme=theme4] .product-detail .price-wrap .new-price {
    color: #ff4d4d!important
}

[data-theme=theme5] .product-detail .price-wrap .new-price {
    color: #e7032c!important
}

[data-theme=theme6] .product-detail .price-wrap .new-price {
    color: #e31c28!important
}

.product-detail .price-wrap .new-price .num {
    font-size: 40rpx;
    padding: 0 4rpx
}

.product-detail .price-wrap .old-price {
    color: #999;
    font-size: 22rpx;
    font-weight: 400;
    margin-left: 10rpx
}

.product-detail .price-wrap .is-user-grade {
    border: 2rpx solid #e2231a;
    border-radius: 12rpx;
    color: #e2231a;
    margin-left: 10rpx;
    padding: 0 10rpx
}

.product-detail .already-sale {
    color: #999;
    font-size: 24rpx
}

.product-detail .product-name {
    color: #333;
    font-size: 30rpx;
    font-weight: 500;
    padding-top: 26rpx
}

.product-detail .product-describe {
    color: #666;
    font-size: 24rpx;
    line-height: 38rpx;
    margin-top: 28rpx;
    word-break: break-all
}

.already-choice {
    background: #fff;
    border-bottom: 1px solid #eee
}

.already-choice:last-child {
    border: none
}

.product-choice,.product-comment,.product-content {
    background: #fff;
    margin-top: 20rpx
}

.product-content .content-box p image {
    width: 100%
}

.product-content .content-box {
    font-size: 36rpx
}

.btns-wrap {
    -webkit-align-items: center;
    align-items: center;
    background: #fff;
    bottom: 0;
    display: -webkit-flex;
    display: flex;
    height: 100rpx;
    left: 0;
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: 5rpx;
    position: fixed;
    right: 0;
    z-index: 100
}

.btns-wrap .icon-box {
    height: 100rpx;
    width: 92rpx
}

.btns-wrap .icon-box .iconfont {
    color: #999;
    font-size: 40rpx
}

.btns-wrap .icon-box .iconfont .num {
    background: red;
    border-radius: 15rpx;
    color: #fff;
    font-size: 20rpx;
    height: 30rpx;
    left: 50%;
    line-height: 32rpx;
    min-width: 30rpx;
    overflow: hidden;
    position: absolute;
    top: 10rpx
}

.btns-wrap button,.btns-wrap button:after {
    border: 0;
    border-radius: 0;
    -webkit-flex: 1;
    flex: 1;
    height: 100rpx;
    line-height: 100rpx;
    margin: 0;
    padding: 0
}

.btns-wrap button.add-cart {
    border-bottom-left-radius: 40rpx;
    border-top-left-radius: 40rpx;
    font-size: 28rpx;
    height: 75rpx;
    line-height: 75rpx;
    margin-left: 17rpx;
    width: 214rpx
}

[data-theme=theme0] .btns-wrap button.add-cart,[data-theme=theme1] .btns-wrap button.add-cart,[data-theme=theme2] .btns-wrap button.add-cart,[data-theme=theme3] .btns-wrap button.add-cart {
    color: #fff!important
}

[data-theme=theme4] .btns-wrap button.add-cart {
    color: #333!important
}

[data-theme=theme5] .btns-wrap button.add-cart,[data-theme=theme6] .btns-wrap button.add-cart {
    color: #fff!important
}

[data-theme=theme0] .btns-wrap button.add-cart {
    background: linear-gradient(45deg,#ffcb05,#fd9f01)!important
}

[data-theme=theme1] .btns-wrap button.add-cart {
    background: linear-gradient(0deg,rgba(25,173,87,.65),rgba(20,141,71,.65))!important
}

[data-theme=theme2] .btns-wrap button.add-cart {
    background: linear-gradient(0deg,#fc0,#fd9f01)!important
}

[data-theme=theme3] .btns-wrap button.add-cart {
    background: linear-gradient(0deg,rgba(23,116,255,.55),rgba(14,107,245,.55))!important
}

[data-theme=theme4] .btns-wrap button.add-cart {
    background: linear-gradient(45deg,#e4e4e4,#e4e4e4)!important
}

[data-theme=theme5] .btns-wrap button.add-cart {
    background: linear-gradient(0deg,hsla(43,27%,65%,.6),hsla(43,31%,69%,.6))!important
}

[data-theme=theme6] .btns-wrap button.add-cart {
    background: linear-gradient(45deg,rgba(89,46,247,.45),rgba(98,60,235,.45))!important
}

.btns-wrap button.add-cart-no {
    background: #ccc;
    border-bottom-left-radius: 40rpx;
    border-top-left-radius: 40rpx;
    color: #fff;
    font-size: 28rpx;
    height: 75rpx;
    line-height: 75rpx;
    margin-left: 17rpx;
    width: 214rpx
}

.btns-wrap button.buy {
    border-bottom-right-radius: 40rpx;
    border-top-right-radius: 40rpx;
    font-size: 28rpx;
    height: 75rpx;
    line-height: 75rpx;
    margin-right: 30rpx;
    width: 214rpx
}

[data-theme=theme0] .btns-wrap button.buy,[data-theme=theme1] .btns-wrap button.buy,[data-theme=theme2] .btns-wrap button.buy,[data-theme=theme3] .btns-wrap button.buy,[data-theme=theme4] .btns-wrap button.buy,[data-theme=theme5] .btns-wrap button.buy,[data-theme=theme6] .btns-wrap button.buy {
    color: #fff!important
}

[data-theme=theme0] .btns-wrap button.buy {
    background: linear-gradient(-45deg,#fe632a,#ff7a04)!important
}

[data-theme=theme1] .btns-wrap button.buy {
    background: linear-gradient(0deg,#19ad57,#148d47)!important
}

[data-theme=theme2] .btns-wrap button.buy {
    background: linear-gradient(0deg,#fc4528,#fc7639)!important
}

[data-theme=theme3] .btns-wrap button.buy {
    background: linear-gradient(0deg,#1774ff,#0e6bf5)!important
}

[data-theme=theme4] .btns-wrap button.buy {
    background: linear-gradient(-45deg,#2e2e2e,#424242)!important
}

[data-theme=theme5] .btns-wrap button.buy {
    background: linear-gradient(0deg,#bfb18f,#c8ba97)!important
}

[data-theme=theme6] .btns-wrap button.buy {
    background: linear-gradient(-45deg,#592ef7,#623ceb)!important
}

.btns-wrap button.buy.ispresale {
    -webkit-flex-direction: column;
    flex-direction: column;
    line-height: 1
}

.btns-wrap button.buy.ispresale,.shoucang-box {
    -webkit-align-items: center;
    align-items: center;
    display: -webkit-flex;
    display: flex;
    -webkit-justify-content: center;
    justify-content: center
}

.shoucang-box {
    background: rgba(0,0,0,.8);
    border-radius: 16rpx 0 0 16rpx;
    bottom: 270rpx;
    height: 80rpx;
    padding-right: 10rpx;
    position: fixed;
    right: 0;
    width: 80rpx
}

.shoucang-box button {
    background: 0;
    line-height: 60rpx;
    padding: 0
}

.shoucang-box .iconfont {
    color: #fff;
    font-size: 50rpx;
    margin-bottom: 10rpx;
    position: relative;
    top: 5rpx
}

.share-box {
    bottom: -16rpx;
    position: absolute;
    right: 0
}

.share-box button {
    background: 0;
    border-radius: 0;
    line-height: 1;
    padding: 0
}

.share-box .iconfont {
    color: #fff;
    font-size: 50rpx;
    margin-bottom: 10rpx
}

.sc-box {
    bottom: -16rpx;
    position: absolute;
    right: 78rpx
}

.sc-box button {
    background: 0;
    border-radius: 0;
    line-height: 1;
    padding: 0
}

.sc-box .iconfont.icon {
    font-size: 38rpx
}

.create-img {
    box-sizing: border-box;
    padding: 20rpx;
    width: 100%
}

.create-img image {
    width: 100%
}

.create-img button {
    border-radius: 44rpx;
    height: 88rpx;
    line-height: 88rpx;
    width: 100%
}

.shop_head_info {
    padding: 30rpx
}

.shop-box {
    display: -webkit-flex;
    display: flex;
    height: 120rpx;
    -webkit-justify-content: space-between;
    justify-content: space-between;
    width: 100%
}

.shop-logo {
    height: 120rpx;
    width: 120rpx
}

.shop-logo image {
    background-color: rgba(0,0,0,.1);
    border-radius: 12rpx;
    height: 100%;
    width: 100%
}

.shop-box-info {
    margin-left: 20rpx
}

.shop-box-info,.shop-infobox {
    box-sizing: border-box;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: column;
    flex-direction: column;
    -webkit-justify-content: space-between;
    justify-content: space-between;
    padding-top: 0
}

.shop-infobox {
    text-align: right
}

.shop-infobox button {
    border: 1rpx solid;
    border-radius: 30rpx;
    font-family: PingFang SC;
    font-size: 26rpx;
    font-weight: 500;
    height: 60rpx;
    line-height: 60rpx;
    padding: 0;
    text-align: center;
    width: 160rpx
}

.store_type {
    border-radius: 7rpx;
    display: inline-block;
    font-size: 21rpx;
    font-weight: 200;
    height: 35rpx;
    line-height: 35rpx;
    margin-right: 20rpx;
    padding: 0 10rpx
}

[data-theme=theme0] .store_type {
    background-color: #ff5704!important
}

[data-theme=theme1] .store_type {
    background-color: #19ad57!important
}

[data-theme=theme2] .store_type {
    background-color: #fc0!important
}

[data-theme=theme3] .store_type {
    background-color: #33a7ff!important
}

[data-theme=theme4] .store_type {
    background-color: #e4e4e4!important
}

[data-theme=theme5] .store_type {
    background-color: #c8ba97!important
}

[data-theme=theme6] .store_type {
    background-color: #623ceb!important
}

[data-theme=theme0] .store_type,[data-theme=theme1] .store_type,[data-theme=theme2] .store_type,[data-theme=theme3] .store_type,[data-theme=theme4] .store_type,[data-theme=theme5] .store_type,[data-theme=theme6] .store_type {
    color: #fff!important
}

.share_img {
    height: 42rpx;
    margin: 0 auto 4rpx;
    width: 42rpx
}

.fn {
    font-weight: 400
}

.share_img.img_gray {
    -webkit-filter: grayscale(100%);
    filter: grayscale(100%)
}

.share_text {
    line-height: 34rpx
}

.reg180 {
    -webkit-align-items: center;
    align-items: center;
    display: -webkit-flex;
    display: flex;
    -webkit-justify-content: flex-end;
    justify-content: flex-end;
    padding-right: 20rpx;
    text-align: center;
    -webkit-transform: rotateY(180deg);
    transform: rotateY(180deg)
}

.header {
    height: 30px;
    left: 0;
    line-height: 30px;
    padding-top: var(--status-bar-height);
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 99
}

.header .reg180 .icon-you {
    background: rgba(0,0,0,.6);
    border-radius: 50%;
    color: #fff;
    display: block;
    height: 44rpx;
    line-height: 44rpx;
    width: 44rpx
}

.btn_btom {
    height: 90rpx;
    line-height: 45rpx
}

.btnname {
    bottom: -16px;
    left: 0;
    position: absolute;
    right: 0
}

.icon-kefu2,.icon-stores {
    color: #333
}

.cart_num {
    -webkit-align-items: center;
    align-items: center;
    border-radius: 50%;
    color: #fff;
    display: -webkit-flex;
    display: flex;
    font-size: 22rpx;
    height: 30rpx;
    -webkit-justify-content: center;
    justify-content: center;
    position: absolute;
    right: 4rpx;
    top: 4rpx;
    width: 30rpx
}

[data-theme=theme0] .cart_num {
    background-color: #ff5704!important
}

[data-theme=theme1] .cart_num {
    background-color: #19ad57!important
}

[data-theme=theme2] .cart_num {
    background-color: #fc0!important
}

[data-theme=theme3] .cart_num {
    background-color: #33a7ff!important
}

[data-theme=theme4] .cart_num {
    background-color: #e4e4e4!important
}

[data-theme=theme5] .cart_num {
    background-color: #c8ba97!important
}

[data-theme=theme6] .cart_num {
    background-color: #623ceb!important
}

.video {
    height: 100%;
    width: 100%
}

.scroll-box {
    box-sizing: border-box
}

.coupon_item {
    background-color: #fff2f1;
    border-radius: 6rpx;
    font-size: 22rpx;
    height: 40rpx;
    line-height: 40rpx;
    margin-left: 10rpx;
    padding: 0 16rpx;
    text-align: center
}

[data-theme=theme0] .coupon_item {
    color: #ff5704!important
}

[data-theme=theme1] .coupon_item {
    color: #19ad57!important
}

[data-theme=theme2] .coupon_item {
    color: #fc0!important
}

[data-theme=theme3] .coupon_item {
    color: #33a7ff!important
}

[data-theme=theme4] .coupon_item {
    color: #e4e4e4!important
}

[data-theme=theme5] .coupon_item {
    color: #c8ba97!important
}

[data-theme=theme6] .coupon_item {
    color: #623ceb!important
}

.group-hd {
    -webkit-align-items: center;
    align-items: center;
    box-sizing: border-box;
    display: -webkit-flex;
    display: flex;
    -webkit-justify-content: flex-start;
    justify-content: flex-start;
    padding-left: 0rpx;
    position: relative
}

.text-box {
    border-radius: 4rpx;
    font-size: 22rpx;
    line-height: 1;
    margin-right: 10rpx;
    padding: 6rpx 7rpx
}

[data-theme=theme0] .text-box {
    color: #ff5704!important
}

[data-theme=theme1] .text-box {
    color: #19ad57!important
}

[data-theme=theme2] .text-box {
    color: #fc0!important
}

[data-theme=theme3] .text-box {
    color: #33a7ff!important
}

[data-theme=theme4] .text-box {
    color: #e4e4e4!important
}

[data-theme=theme5] .text-box {
    color: #c8ba97!important
}

[data-theme=theme6] .text-box {
    color: #623ceb!important
}

[data-theme=theme0] .text-box {
    background-color: rgba(255,204,0,.09)!important
}

[data-theme=theme1] .text-box {
    background-color: rgba(25,173,87,.05)!important
}

[data-theme=theme2] .text-box {
    background-color: rgba(255,204,0,.05)!important
}

[data-theme=theme3] .text-box {
    background-color: rgba(51,167,255,.05)!important
}

[data-theme=theme4] .text-box {
    background-color: hsla(0,0%,89%,.09)!important
}

[data-theme=theme5] .text-box {
    background-color: hsla(43,31%,69%,.05)!important
}

[data-theme=theme6] .text-box {
    background-color: rgba(98,60,235,.05)!important
}

.text-box-coupon {
    -webkit-align-items: center;
    align-items: center;
    border-radius: 42rpx;
    color: #fff;
    display: -webkit-flex;
    display: flex;
    font-size: 22rpx;
    height: 42rpx;
    -webkit-justify-content: center;
    justify-content: center;
    width: 102rpx
}

[data-theme=theme0] .text-box-coupon {
    background-color: #ff5704!important
}

[data-theme=theme1] .text-box-coupon {
    background-color: #19ad57!important
}

[data-theme=theme2] .text-box-coupon {
    background-color: #fc0!important
}

[data-theme=theme3] .text-box-coupon {
    background-color: #33a7ff!important
}

[data-theme=theme4] .text-box-coupon {
    background-color: #e4e4e4!important
}

[data-theme=theme5] .text-box-coupon {
    background-color: #c8ba97!important
}

[data-theme=theme6] .text-box-coupon {
    background-color: #623ceb!important
}

.text-box-coupon .icon.icon-you {
    -webkit-align-items: center;
    align-items: center;
    border-radius: 50%;
    display: -webkit-flex;
    display: flex;
    font-size: 14rpx;
    font-weight: 700;
    height: 22rpx;
    -webkit-justify-content: center;
    justify-content: center;
    margin-left: 10rpx;
    width: 22rpx
}

[data-theme=theme0] .text-box-coupon .icon.icon-you,[data-theme=theme1] .text-box-coupon .icon.icon-you,[data-theme=theme2] .text-box-coupon .icon.icon-you,[data-theme=theme3] .text-box-coupon .icon.icon-you,[data-theme=theme4] .text-box-coupon .icon.icon-you,[data-theme=theme5] .text-box-coupon .icon.icon-you,[data-theme=theme6] .text-box-coupon .icon.icon-you {
    color: #fff!important
}

.group-hd.d-b-s {
    -webkit-align-items: flex-start;
    align-items: flex-start;
    display: -webkit-flex;
    display: flex;
    height: auto;
    -webkit-justify-content: space-between;
    justify-content: space-between
}

.hide.group-hd:after {
    width: 0
}

.group-hd .line-h-90 {
    line-height: 90rpx
}

.group-hd .line-h-50 {
    line-height: 50rpx
}

.product-detail .limited-spike {
    background: linear-gradient(140deg,#f11e0b,#f77737);
    border-radius: 15rpx;
    box-sizing: border-box;
    color: #fff;
    height: 278rpx;
    margin-top: -112rpx;
    padding: 40rpx 21rpx;
    position: relative;
    z-index: 2
}

.product-detail .limited-spike .left-name {
    color: #fff;
    font-size: 22rpx
}

.product-detail .limited-spike .right-time {
    position: absolute;
    right: 20rpx;
    top: 58rpx
}

.product-detail .limited-spike .right-time .jiantou {
    height: 20rpx;
    margin-left: 9rpx;
    width: 20rpx
}

.mt-down-box {
    border-radius: 20rpx;
    margin-top: -80rpx;
    position: relative;
    z-index: 3
}

.tips-box {
    background-color: hsla(0,0%,100%,.45);
    border-radius: 20rpx;
    box-sizing: border-box;
    color: #fff;
    font-size: 20rpx;
    font-weight: 500;
    height: 40rpx;
    line-height: 40rpx;
    margin-left: 8rpx;
    padding: 0 24rpx 0 14rpx
}

.product-detail .product-presale {
    background-color: rgba(49,193,158,.1);
    border-radius: 12rpx;
    color: #666;
    font-size: 26rpx;
    line-height: 40rpx;
    margin-top: 28rpx;
    padding: 26rpx;
    word-break: break-all
}

.manjian-box {
    background: #ffe6e4;
    border-radius: 12rpx;
    font-family: Source Han Sans CN;
    font-size: 22rpx;
    font-weight: 400;
    margin-right: 8rpx;
    padding: 6rpx 16rpx
}

[data-theme=theme0] .manjian-box {
    color: #ff5704!important
}

[data-theme=theme1] .manjian-box {
    color: #19ad57!important
}

[data-theme=theme2] .manjian-box {
    color: #fc0!important
}

[data-theme=theme3] .manjian-box {
    color: #33a7ff!important
}

[data-theme=theme4] .manjian-box {
    color: #e4e4e4!important
}

[data-theme=theme5] .manjian-box {
    color: #c8ba97!important
}

[data-theme=theme6] .manjian-box {
    color: #623ceb!important
}

.top-scroll-nav {
    background: #fff;
    border-bottom: 1px solid #f2f2f2;
    left: 0;
    overflow: hidden;
    position: fixed;
    top: 0;
    transition: background .3s;
    width: 100%;
    z-index: 100
}

.top-scroll-nav .top-title {
    -webkit-flex: 1;
    flex: 1;
    padding-right: 42rpx;
    text-align: center
}

.top-scroll-nav.close {
    background: hsla(0,0%,100%,0);
    height: 0;
    padding: 0!important
}

.top-scroll-nav-item.active {
    position: relative
}

.top-scroll-nav-item.active:after {
    border: 4rpx;
    bottom: -10rpx;
    content: "";
    height: 4rpx;
    left: 0;
    margin: auto;
    position: absolute;
    right: 0;
    width: 20%
}

[data-theme=theme0] .top-scroll-nav-item.active:after {
    background-color: #ff5704!important
}

[data-theme=theme1] .top-scroll-nav-item.active:after {
    background-color: #19ad57!important
}

[data-theme=theme2] .top-scroll-nav-item.active:after {
    background-color: #fc0!important
}

[data-theme=theme3] .top-scroll-nav-item.active:after {
    background-color: #33a7ff!important
}

[data-theme=theme4] .top-scroll-nav-item.active:after {
    background-color: #e4e4e4!important
}

[data-theme=theme5] .top-scroll-nav-item.active:after {
    background-color: #c8ba97!important
}

[data-theme=theme6] .top-scroll-nav-item.active:after {
    background-color: #623ceb!important
}

.product-info {
    background: #fff
}

.seckill-tips {
    background: #ffe6e4;
    border-radius: 40rpx;
    color: #ff5649;
    font-size: 22rpx;
    height: 52rpx;
    line-height: 52rpx;
    padding: 0 14rpx
}

.seckill-tips .icon {
    color: #ff5649;
    font-size: 26rpx;
    margin-right: 8rpx
}

.kf-pop-view {
    background-color: #fff;
    border-radius: 15px;
    padding: 30rpx 30rpx 50rpx
}

.kf-pop-title {
    font-size: 32rpx;
    padding: 30rpx;
    text-align: center
}

.kf-pop-tip {
    color: #999;
    font-size: 24rpx;
    padding-top: 30rpx;
    text-align: center
}

/* Final uni-app overrides for the legacy detail layout. */
.product-detail .product-pic,
.product-detail .product-pic .swiper,
.product-detail .product-pic image {
    display: block;
    height: 750rpx;
    max-width: 100vw;
    width: 100%;
}

.product-detail .product-info {
    margin-bottom: 16rpx;
    padding: 22rpx 30rpx 26rpx;
}

.product-detail .price-wrap {
    display: block;
}

.product-detail .price-wrap > .d-s-s {
    position: relative;
}

.product-detail .price-wrap .mb16 {
    min-height: 48rpx;
    padding-right: 76rpx;
}

.product-detail .price-wrap .new-price {
    align-items: baseline;
    display: flex;
    margin-right: 0;
    min-width: 0;
}

.product-detail .price-wrap .new-price .num {
    line-height: 1;
}

.product-detail .price-wrap .share-box,
.product-detail .price-wrap .sc-box {
    bottom: -14rpx;
    position: absolute;
}

.product-detail .price-wrap .share-box {
    right: 0;
}

.product-detail .price-wrap .sc-box {
    right: 78rpx;
}

.product-detail .price-wrap .share-box button,
.product-detail .price-wrap .sc-box button {
    align-items: center;
    background: transparent;
    border-radius: 0;
    display: flex;
    height: 58rpx;
    justify-content: center;
    line-height: 1;
    padding: 0;
    width: 58rpx;
}

.product-detail .price-wrap .share_img {
    height: 38rpx;
    margin: 0;
    width: 38rpx;
}

.product-detail .product-name {
    clear: both;
    line-height: 42rpx;
    padding-top: 22rpx;
}

.product-detail .product-content {
    margin-top: 16rpx;
}

.product-detail .product-content > .p-0-30 {
    height: 74rpx;
}

.product-detail .product-content .group-hd {
    height: 74rpx;
}

.product-detail .product-content .content-box {
    font-size: 0;
    padding: 0;
}

.product-detail .content-box image,
.product-detail .content-box rich-text,
.product-detail .content-box .ww100 {
    max-width: 100%;
    width: 100%;
}

.btns-wrap {
    box-sizing: content-box;
    overflow: hidden;
}

.btns-wrap .icon-box button {
    color: #333;
    height: 100rpx;
}

.btns-wrap .icon-box .detail-tab-text {
    height: 32rpx;
    line-height: 32rpx;
    margin-top: 4rpx;
}

.btns-wrap .detail-tab-icon {
    display: block;
    height: 38rpx;
    width: 38rpx;
}

.btns-wrap button.add-cart,
.btns-wrap button.add-cart-no,
.btns-wrap button.buy {
    flex-shrink: 0;
}
</style>
