<template>
  <!-- ====== 竖屏模式 ====== -->
  <view
    v-if="mode === 'portrait' && !accessDenied"
    class="live-page live-portrait"
    :class="{
      'live-room--live': useLiveVisualStyle,
      'live-room--replay-visual': !useLiveVisualStyle,
    }"
    :style="rootStyle"
  >
    <view v-if="showReplayFirstVideoLoading" class="replay-first-loading">
      <image
        class="replay-first-loading__image"
        src="https://man.lqjy.cc/static/icons/competitor-live/loading.gif"
        mode="aspectFit"
      />
    </view>
    <!-- 顶部信息区：主播资料、观看人数与投诉入口 -->
    <view class="anchor-row" >
      <view class="anchor-left">
        <view class="anchor-info" :class="{ 'anchor-info--hidden': !anchorName }">
          <view class="anchor-avatar-wrap">
            <image class="anchor-avatar" :src="anchorAvatar" mode="aspectFill" />
          </view>
          <view class="anchor-meta">
            <text class="anchor-name">{{ anchorName  }}</text>
            <text class="anchor-likes">{{ anchorSubText }}</text>
          </view>
        </view>
        <view v-if="roomGroupType !== 1 && roomSetting.showStatus !== 0" class="live-status-badge live-status-badge--inline" :class="liveStatusClass">
          <text class="live-status-text">{{ liveStatusLabel }}</text>
        </view>
      </view>
      <view v-if="showTopViewerTools" class="viewer-area">
        <view v-if="roomSetting.showViewerData !== 0" class="viewer-badge">
          <image
            class="viewer-icon"
            :src="topViewerIcon"
            mode="aspectFit"
          />
          <text
            class="viewer-num"
            :class="{ 'viewer-num-animate': viewerCountAnimating }"
            >{{ displayViewerCount }}</text
          >
        </view>
        <view class="report-btn" @click="goReport">
          <image
            class="report-icon"
            :src="topReportIcon"
            mode="aspectFit"
          />
          <text v-if="!useH5ReplayTopStyle" class="report-text">投诉</text>
        </view>
      </view>
    </view>
    <live-external-lottery-tools
      v-if="!(isWaitingSchedule && warmUpVideoUrl)"
      :comment-lottery-visible="commentLotteryEntryVisible"
      :keyword="commentLotteryEntryKeyword"
      :bubble-visible="commentLotteryBubbleVisible"
      :watch-reward-visible="hasVisibleWatchRewardTasks"
      :watch-reward-label="watchRewardEntryLabel"
      @open-comment-lottery="openCommentPrizeRuleModal"
      @open-watch-reward="openWatchRewardPanel"
    />
    <!-- [iOS 微信 demo 对齐] v-show + :src 让 <video> 元素和 src 在 Vue 渲染同 tick 一起
         注入 DOM，对齐 demo 的"HTML 解析时 video+src+autoplay 全齐"格局，
         争取 iOS WKWebView "用户导航 autoplay 评估窗口"内的资格授予。其他平台无副作用。 -->
    <live-player
      v-if="shouldUseLivePlayer && displayVideoUrl"
      :key="'live-player-' + videoRenderKey"
      id="liveVideo"
      class="live-video"
      :src="displayVideoUrl"
      mode="live"
      object-fit="fillCrop"
      :autoplay="true"
      :muted="isMuted"
      sound-mode="speaker"
      :mute-on-audio-conflict="false"
      :min-cache="1"
      :max-cache="3"
      :orientation="mode === 'portrait' ? 'vertical' : 'horizontal'"
      :style="{
        backgroundImage: videoPoster ? 'url(' + videoPoster + ')' : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#000',
      }"
      @statechange="handleLivePlayerStateChange"
      @netstatus="handleLivePlayerNetStatus"
      @error="handleLivePlayerError"
      @click="onVideoTap"
    />
    <video
      v-if="!shouldUseLivePlayer && displayVideoUrl"
      :key="videoRenderKey"
      id="liveVideo"
      class="live-video"
      :src="displayVideoUrl"
      :loop="isWaitingSchedule && !!warmUpVideoUrl"
      :controls="false"
      :show-play-btn="false"
      :show-center-play-btn="false"
      :show-fullscreen-btn="false"
      :show-mute-btn="false"
      :enable-progress-gesture="false"
      object-fit="cover"
      :style="{
        backgroundImage: videoPoster ? 'url(' + videoPoster + ')' : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#000',
      }"
      :muted="isMuted"
      :autoplay="true"
      preload="auto"
      :poster="videoPoster"
      playsinline
      webkit-playsinline
      x5-playsinline
      x5-video-player-type="h5"
      x5-video-player-fullscreen="false"
      @play="handleVideoPlay"
      @playing="markVideoFrameReady"
      @loadedmetadata="markVideoFrameReady"
      @loadeddata="markVideoFrameReady"
      @pause="handleVideoPause"
      @timeupdate="handleVideoTimeUpdate"
      @ended="handleVideoEnded"
      @error="handleVideoError($event, displayVideoUrl)"
      @click="onVideoTap"
    />
    <!-- [2026-04-28] 跨域 wxPick 跳回兜底播放按钮（仅 wxAddrDone=1 后显示，且未在播放时） -->
    <view
      v-if="showManualPlayButton"
      class="video-play-btn"
      @click.stop="manualPlayVideo"
    >
      <view class="video-play-btn__triangle">
        <view class="video-play-btn__triangle-shape"></view>
      </view>
    </view>

      <!-- 未开始/已结束/直播加载中：显示封面海报占位（无暖场视频且有封面） -->
      <!-- 使用 v-show 而非 v-if：避免 DOM 创建延迟导致视频黑屏先于封面显示 -->
        <view
          v-if="shouldRenderLivePoster"
          class="live-video live-video--poster"
          :class="{ 'live-video--poster-hidden': !showLivePoster }"
        >
          <image class="live-video-poster-img" :src="liveCover" mode="aspectFill" />
        </view>

        <view
          v-if="shouldRenderReplayPoster"
          class="live-video live-video--replay-poster"
          :class="{ 'live-video--replay-poster-hidden': replayPosterHidden }"
        >
          <image class="live-video-replay-poster-img" :src="replayCoverPoster" mode="aspectFill" />
        </view>

        <view
          v-if="playbackErrorVisible"
          class="playback-failure"
          @click.stop="retryPlayback"
        >
          <text class="playback-failure__title">{{ playbackErrorText || '播放失败，请重试' }}</text>
          <text class="playback-failure__action">点击重试</text>
        </view>

    <!-- 竖屏点击空白区域点赞特效：渲染层 -->
    <view class="screen-tap-effects">
      <image
        v-for="effect in tapEffects"
        :key="effect.slotId + '-' + effect.runId"
        class="tap-heart-img"
        :src="effect.img"
        mode="aspectFit"
        :style="{
          left: effect.x + 'px',
          top: effect.y + 'px',
        }"
        @animationend="finishTapEffect(effect.slotId, effect.runId)"
      />
      <!-- 连击计数器 -->
      <view
        v-if="comboInfo.visible"
        :key="comboInfo.key"
        class="combo-counter"
        :style="{
          left: comboInfo.x + 'px',
          top: comboInfo.y + 'px',
        }"
      >
        <text class="combo-text">x{{ comboInfo.count }}</text>
      </view>
    </view>
    <live-marquee-ad
      :room-setting="roomSetting"
      variant="portrait"
    />

    <!-- 置顶评论栏：评论气泡 + 置顶独立小标签，不随评论滚动 -->
    <view
      v-if="shouldShowComments && pinnedMessage"
      class="pinned-bar pinned-bar--inline"
      :style="pinnedBarStyle"
    >
      <view class="pinned-bar__bubble">
        <text class="pinned-bar__nick">{{ pinnedMessage.nick }}：</text>
        <text class="pinned-bar__content">{{ pinnedMessage.content }}</text>
      </view>
      <text class="pinned-bar__tag">置顶</text>
    </view>
    <!-- 互动消息区：系统消息、进出场消息与用户评论 -->
    <scroll-view
      v-if="shouldShowComments"
      class="chat-area"
      :class="{ 'chat-area--scrolled': isChatAreaScrolled }"
      :scroll-y="!inputFocused"
      :style="chatAreaStyle"
      :scroll-into-view="scrollToId"
      :scroll-with-animation="commentScrollWithAnimation"
      @scroll="handleChatAreaScroll"
    >
      <!-- 平台提示（仅竖屏） -->
      <view class="chat-bubble system-bubble">
        <text class="chat-content">平台官方倡导文明直播，诚信交易，将会对内容进行24小时的在线巡查，任何传播违法、违规、低俗、暴力等不良信息将会封停账号。</text>
      </view>
      <view
        v-for="msg in visibleMessages"
        :key="msg._visibleIndex"
        :id="'msg-' + msg._visibleIndex"
        :class="[
          'chat-bubble',
          msg.type === 'system' ? 'system-bubble' : '',
          msg.type === 'lottery_win' ? 'lottery-win-bubble' : '',
          (msg.type === 'enter' || msg.type === 'leave') ? 'enter-bubble' : '',
        ]"
      >
        <text v-if="msg.type === 'system'" class="system-text">{{
          msg.content
        }}</text>
        <template v-else-if="msg.type === 'lottery_win'">
          <view class="lottery-win-pill">
            <image class="lottery-win-icon" :src="msg.icon" mode="aspectFit" />
            <text class="lottery-win-text">
              恭喜
              <text class="lottery-win-name">{{ msg.nick }}</text>
              获得
              <text class="lottery-win-prize">{{ msg.prizeName }}</text>
            </text>
          </view>
        </template>
        <!-- enter/leave 消息：仅显示 content，不显示 nick（避免重复显示名字） -->
        <text
          v-else-if="msg.type === 'enter' || msg.type === 'leave'"
          class="enter-text"
        >{{ msg.content }}</text>
        <template v-else>
          <text v-if="msg.isAdmin" class="admin-tag">管理员</text>
          <text class="chat-nick">{{ msg.nick }}：</text>
          <text class="chat-content">{{ msg.content }}</text>
        </template>
      </view>
    </scroll-view>
    <view
      v-if="enterNotice.visible && !shouldShowEntryOverlay"
      :key="enterNotice.key"
      class="enter-notice"
      :class="{ 'enter-notice--leave': enterNotice.leaving }"
      :style="enterNoticeStyle"
    >
      <view class="enter-notice__content">
        <template v-if="enterNotice.noticeType === 'leave'">
          <text class="enter-notice__nick">{{ enterNotice.nick }}</text>
          <text class="enter-notice__text">离开了直播间</text>
        </template>
        <template v-else>
          <text class="enter-notice__text">欢迎</text>
          <text class="enter-notice__nick">{{ enterNotice.nick }}</text>
          <text class="enter-notice__text">进入直播间</text>
        </template>
      </view>
    </view>
    <!-- 购买通知飘屏：xx正在去购买 / xx刚刚购买了 -->
    <view
      v-if="buyingNotice.visible"
      :key="buyingNotice.key"
      class="buying-notice"
      :class="{ 'buying-notice--leave': buyingNotice.leaving }"
      :style="buyingNoticeStyle"
    >
      <view class="buying-notice__content">
        <image class="buying-notice__icon" src="https://man.lqjy.cc/static/icons/shopping-icon.png" mode="aspectFit" />
        <text class="buying-notice__nick">{{ buyingNotice.nick }}</text>
        <text v-if="buyingNotice.count > 1" class="buying-notice__text">等{{ buyingNotice.count }}人</text>
        <text class="buying-notice__text">{{ buyingNotice.noticeText || '正在去购买' }}</text>
      </view>
    </view>
    <!-- 去购买提醒：用户点击商品卡片后推送，样式来自竞品 HAR toShopping -->
    <view
      v-if="goShoppingNotice.visible"
      :key="goShoppingNotice.key"
      class="go-shopping-notice"
      :class="{ 'go-shopping-notice--leave': goShoppingNotice.leaving }"
      :style="goShoppingNoticeStyle"
    >
      <view class="goods-shopping-li">
        <view class="toShopping">
          <view v-if="goShoppingNotice.productImage" class="goods-thumb">
            <image class="goodsPic" :src="goShoppingNotice.productImage" mode="aspectFill" />
          </view>
          <view class="shoppingText">
            <view class="shoppingTextName">
              <text class="glad">{{ goShoppingNotice.nick }}</text>
              <text>{{ goShoppingNotice.count > 1 ? `等${goShoppingNotice.count}人在购买` : (goShoppingNotice.noticeText || '正在去购买') }}</text>
            </view>
            <text v-if="goShoppingNotice.productName" class="goodsName">{{ goShoppingNotice.productName }}</text>
          </view>
          <view class="goodsBuy" @click.stop="openGoShoppingNoticeProduct">
            <text>去购买</text>
          </view>
        </view>
      </view>
    </view>
    <!-- 商品浮层：当前讲解商品、商品卡片轮播与竖屏商品列表 -->
    <live-product-shelf
      mode="portrait"
      :show-product="showProduct"
      :show-product-list="showProductList"
      :current-product="currentProduct"
      :product-card-items="productCardItems"
      :product-card-active-index="productCardActiveIndex"
      :product-list="productList"
      :product-total="productTotal"
      :product-loading="productLoading"
      :product-finished="productFinished"
      :success-notice="productListSuccessNotice"
      :show-hot-sale="Number(roomSetting.showHotSale ?? 1) === 1"
      @update:show-product="setShowProduct($event)"
      @update:show-product-list="setShowProductList($event)"
      @product-card-change="onProductCardChange"
      @buy="onProductBuy"
      @detail="onProductDetail"
      @loadmore="loadProductList()"
    />
    <!-- 禁言/拉黑提示条 -->
    <view v-if="muteTipVisible" class="mute-tip-bar">
      <text class="mute-tip-text">
        {{
          userBlocked
            ? "您已被拉黑，无法参与互动"
            : muteRemainText
              ? `您已被禁言，剩余${muteRemainText}`
              : "您已被禁言"
        }}
      </text>
    </view>
    <!-- 竖屏：预约开播倒计时(底部) -->
    <!-- <live-countdown
      v-if="isWaitingSchedule && hasSubscribeConfig"
      variant="portrait"
      :countdown="countdownParts"
      :push-time="pushTime"
      :bottom-offset="60"
      @subscribe="onSubscribePush"
    /> -->
    <!-- 底部操作栏：聊天输入、个人中心、商品入口与点赞 -->
    <live-chat-bar
      ref="portraitInputRef"
      :model-value="inputText"
      variant="portrait"
      :show="!isWaitingSchedule"
      :focused="inputFocused"
      :disabled-text="chatDisabled"
      :bottom-style="bottomBarStyle"
      :room-setting="roomSetting"
      :product-count="productTotal || productList.length"
      :live-toolbar="useLiveVisualStyle"
      :hearts="hearts"
      :like-count="likeCount"
      :quick-replies="quickReplies"
      :is-distributor="isDistributor"
      :distributor-status="distributorStatus"
      @request-focus="focusInput"
      @update:model-value="setInputText"
      @focus="onInputFocus"
      @confirm="handleSendClick"
      @blur="onInputBlur"
      @send="handleSendClick"
      @center="toggleCenter"
      @product="toggleProduct"
      @like="doLike"
      @heart-animation-end="finishHeartAnimation"
      @quick-reply="handleQuickReply"
      @share="setShowShare(true)"
    >
    </live-chat-bar>
    <!-- 弹窗层：分享、个人中心、购买、地址、投诉与进出场蒙层 -->
    <share-popup
      v-if="renderSharePopup"
      :visible="showShare"
      :room-id="liveId"
      :room-code="roomCode"
      :share-code="shareCode"
      :bind-id="liveBindId"
      :tenant-id="liveTenantId"
      :is-replay="isReplay"
      :replay-video-id="replayCurrentVideoId"
      :anchor-name="anchorName"
      :anchor-avatar="anchorAvatar"
      :live-name="liveName"
      :live-cover="liveCover"
      :push-time="pushTime"
      :schedule-time="scheduleTimeStr"
      :live-date="liveDate"
      :is-distributor="isDistributor"
      :distributor-status="distributorStatus"
      @close="setShowShare(false)"
      @share="onShareAction"
    />
    <center-popup
      v-if="renderCenterPopup"
      :visible="showCenterPopup"
      :name="centerPopupName"
      :avatar="centerPopupAvatar"
      :order-stats="centerPopupOrderStats"
      :is-distributor="isDistributor"
      :distributor-status="distributorStatus"
      :enable-share="roomSetting.enableShare"
      @close="setShowCenterPopup(false)"
      @action="onCenterAction"
    />
    <product-buy-popup
      v-if="renderBuyPopup"
      :visible="showBuyPopup"
      :z-index="BUY_POPUP_Z_INDEX"
      :coupon-z-index="BUY_POPUP_Z_INDEX + 1"
      :product="buyProduct"
      :address-text="buyAddressText"
      :address-detail="selectedAddress || {}"
      :shipping-fee="buyShippingFee"
      :goods-amount="buyGoodsAmount"
      :total-price="buyTotalPrice"
      :discount-amount="buyDiscountAmount"
      :remark="buyRemark"
      :loading="buyLoading"
      :require-address="buyProduct.requireAddress || 1"
      :usable-coupons="usableCoupons"
      :unusable-coupons="unusableCoupons"
      :selected-coupon-id="selectedCouponId"
      :coupon-loading="couponLoading"
      @close="setShowBuyPopup(false)"
      @select-address="openBuyAddressPopup"
      @update:remark="setBuyRemark($event)"
      @update:quantity="onBuyQuantityChange"
      @update:sku="onBuySkuChange"
      @select-coupon="onBuyCouponSelect"
      @confirm="onBuyConfirm"
    />
    <live-report-popup
      v-if="renderLiveReportPopup"
      :visible="showLiveReportPopup"
      :live-id="liveId"
      :room-code="roomCode"
      :tenant-id="liveTenantId"
      :term-id="roomCurrentTermId"
      :customer-id="myUserId"
      :user-id="myUserId"
      :is-replay="isReplay"
      :replay-video-id="replayCurrentVideoId"
      :live-name="liveName"
      :cover="liveCover"
      :from-path="broadcastReturnPath"
      @update:visible="setShowLiveReportPopup"
    />
    <bottom-sheet-popup
      v-if="renderAddressPopup"
      :visible="showAddressPopup"
      :height="addressList.length === 0 ? '52vh' : '78vh'"
      radius="24rpx 24rpx 0 0"
      :duration="500"
      :z-index="BUY_POPUP_Z_INDEX + 2"
      :with-mask="true"
      mask-color="rgba(0, 0, 0, 0.35)"
      @close="setShowAddressPopup(false)"
    >
      <address-list-panel
        :list="addressList"
        :selected-id="selectedAddressId"
        title="地址管理"
        button-text="新增"
        :show-default-row="false"
        :button-disabled="false"
        @select="onSelectBuyAddress"
        @save="onAddBuyAddress"
        @edit="onEditBuyAddress"
        @add="onAddBuyAddress"
        @delete="onDeleteBuyAddress"
        @import-wx="onImportWxAddress"
      />
    </bottom-sheet-popup>
    <address-form-popup
      v-if="renderAddressFormPopup"
      :visible="showAddressFormPopup"
      :edit-data="editAddressData"
      popup-height="78vh"
      :z-index="BUY_POPUP_Z_INDEX + 4"
      @close="setShowAddressFormPopup(false)"
      @saved="onBuyAddressSaved"
    />
    <!-- 竖屏签到弹窗 -->
    <wd-overlay
      v-if="isTruthyFlag(signConfig.enabled) && renderSignPopup"
      :show="showSignPopup"
      custom-style="z-index:950;background:rgba(0,0,0,0.5);"
      @click="!isTruthyFlag(signConfig.forceEnabled) && (setShowSignPopup(false))"
    />
    <wd-transition
      v-if="isTruthyFlag(signConfig.enabled) && renderSignPopup"
      :show="showSignPopup"
      :duration="500"
      custom-style="position:fixed;left:0;top:0;right:0;bottom:0;z-index:951;"
    >
      <view
        class="sign-popup-mask"
        @click="
          !isTruthyFlag(signConfig.forceEnabled) && (setShowSignPopup(false))
        "
      >
        <view class="sign-popup-container" @click.stop>
          <view class="popup-header">
            <text class="popup-title">签到</text>
            <view
              v-if="!isTruthyFlag(signConfig.forceEnabled)"
              class="popup-close"
              @click="setShowSignPopup(false)"
            >
              <text class="popup-close-icon">✕</text>
            </view>
          </view>
          <view class="sign-popup-body">
            <live-sign-in
              :room-id="liveId"
              :room-code="roomCode"
              :tenant-id="liveTenantId"
              :share-code="shareCode"
              :bind-id="liveBindId"
              :live-type="isReplay ? 'replay' : 'live'"
              :term-id="roomCurrentTermId"
              :customer-id="myUserId"
              :user-id="myUserId"
              :config="signConfig"
              :fields="signFields"
              :signed="hasSigned"
              :show-welcome-text="true"
              :show-skip="!isTruthyFlag(signConfig.forceEnabled)"
              submit-text="确定"
              success-mode="toast"
              @signed="onSignedDone"
              @skip="setShowSignPopup(false)"
            />
          </view>
        </view>
      </view>
    </wd-transition>
    <!-- 直播未开始 蒙层（直播结束后不再显示遮罩） -->
    <live-ended-overlay
      :visible="
        showNotStartedOverlay &&
        !(roomGroupType === 0 && isReplay) &&
        !showProductList &&
        !showBuyPopup &&
        !showAddressPopup &&
        !showAddressFormPopup
      "
      :portrait="true"
      :title="liveOverlayTitle"
      :show-views="false"
      :viewer-count="displayViewerCount"
      :avatar="anchorAvatar"
      :name="anchorName"
    />
    <!-- 进入直播间蒙层 -->
    <live-entry-overlay :show="shouldShowEntryOverlay" @enter="enterLive" />
  </view>
</template>

<script setup>
import { ref, toRefs, computed, getCurrentInstance, onBeforeUnmount, watch } from "vue";
import SharePopup from "@/components/share-popup.vue";
import CenterPopup from "@/components/center-popup.vue";
import ProductBuyPopup from "@/components/product-buy-popup.vue";
import BottomSheetPopup from "@/components/bottom-sheet-popup.vue";
import AddressListPanel from "@/components/address-list-panel.vue";
import AddressFormPopup from "@/components/address-form-popup.vue";
import LiveSignIn from "@/components/live-sign-in.vue";
import LiveReportPopup from "@/components/live-report-popup.vue";
import LiveChatBar from "./LiveChatBar.vue";
import LiveEndedOverlay from "./LiveEndedOverlay.vue";
import LiveEntryOverlay from "./LiveEntryOverlay.vue";
import LiveExternalLotteryTools from "./LiveExternalLotteryTools.vue";
import LiveMarqueeAd from "./LiveMarqueeAd.vue";
import LiveProductShelf from "./LiveProductShelf.vue";
import { formatLikeCount, isLiveCoverOnlyStatusText } from "../utils/entry-format.js";
import { LIVE_PLAYER_READY_CODES, hasLivePlayerNetActivity } from "../utils/live-player-status.js";
import { isLivePlayerSource } from "@/utils/live-route.js";
import { shouldPreferMiniProgramHlsPlayback } from "../utils/live-source.js";

const props = defineProps({
  s: {
    type: Object,
    required: true,
  },
  a: {
    type: Object,
    required: true,
  },
});

const BUY_POPUP_Z_INDEX = 100000000;
const {
  mode, accessDenied, isWechatH5, isIOS, anchorName, anchorAvatar, likeCount, isWaitingSchedule,
  broadcastNavHeight,
  warmUpVideoUrl, roomSetting, viewerCountAnimating, displayViewerCount, displayVideoUrl, mediaSourceComponent, mediaSourceType, videoRenderKey, isReplay, isLiveVisualMode,
  hasReplay, liveStatusText, quickReplies, roomGroupType, videoPoster, replayCover, isMuted, showWxAddrDonePlayBtn,
  autoplayBlocked, playbackErrorVisible, playbackErrorText,
  showReplayFirstVideoLoading, isPlaying, videoFrameReady, isIOSH5, liveCover, tapEffects, comboInfo, shouldShowComments,
  scrollToId, commentScrollWithAnimation, visibleMessages, enterNotice, buyingNotice, goShoppingNotice, productListSuccessNotice, pinnedMessage, showProduct,
  showProductList, currentProduct, productCardItems, productCardActiveIndex, productList, productTotal, productLoading, productFinished,
  muteTipVisible, userBlocked, muteRemainText, inputText, inputFocused, keyboardHeight, chatDisabled, bottomBarStyle,
  hearts, showShare, showCenterPopup, centerPopupName, centerPopupAvatar, centerPopupOrderStats, showBuyPopup, buyProduct,
  buyAddressText, selectedAddress, buyShippingFee, buyGoodsAmount, buyTotalPrice, buyDiscountAmount, buyRemark, buyLoading,
  usableCoupons, unusableCoupons, selectedCouponId, couponLoading, showLiveReportPopup, liveId, roomCode, replayCurrentVideoId, roomCurrentTermId, myUserId, shareCode, liveBindId, liveTenantId, broadcastReturnPath, liveName, showAddressPopup,
  addressList, selectedAddressId, showAddressFormPopup, editAddressData, signConfig, showSignPopup, signFields, hasSigned,
  pushStatus, pushTime, showNotStartedOverlay, liveOverlayTitle, shouldShowEntryOverlay, activeTab, activeTabIndex, showLandscapeSubscribe,
  scheduleTimeStr, liveDate, commentListStyle, defaultAvatar, hasVisibleWatchRewardTasks, watchRewardEntryLabel, commentLotteryEntryVisible, commentLotteryEntryKeyword,
  commentLotteryBubbleVisible, isDistributor, distributorStatus
} = toRefs(props.s);

const POPUP_RENDER_LEAVE_DELAY = 500;

function useDelayedRender(source, delay = POPUP_RENDER_LEAVE_DELAY) {
  const shouldRender = ref(Boolean(source.value));
  let timer = null;

  watch(source, (visible) => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (visible) {
      shouldRender.value = true;
      return;
    }
    if (!shouldRender.value) return;
    timer = setTimeout(() => {
      shouldRender.value = false;
      timer = null;
    }, delay);
  }, { immediate: true });

  onBeforeUnmount(() => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  });

  return shouldRender;
}

const renderSharePopup = useDelayedRender(showShare);
const renderCenterPopup = useDelayedRender(showCenterPopup);
const renderBuyPopup = useDelayedRender(showBuyPopup);
const renderAddressPopup = useDelayedRender(showAddressPopup);
const renderAddressFormPopup = useDelayedRender(showAddressFormPopup);
const renderLiveReportPopup = useDelayedRender(showLiveReportPopup);
const renderSignPopup = useDelayedRender(showSignPopup);

const rootStyle = computed(() => {
  const style = {
    "--broadcast-nav-height": broadcastNavHeight.value || "0px",
  };
  if (isWechatH5.value && isIOS.value) {
    style.opacity = 1;
    style.transition = "opacity 0.3s";
  }
  return style;
});

function parseStageStartTs(value) {
  if (!value) return 0
  const ts = new Date(String(value).replace(/-/g, '/')).getTime()
  return Number.isFinite(ts) ? ts : 0
}

const isLiveNotStarted = computed(() => {
  if (isLiveCoverOnlyStatusText(liveStatusText.value)) return true
  if (isWaitingSchedule.value && !warmUpVideoUrl.value) return true
  const startTs = parseStageStartTs(liveDate.value)
  return pushStatus.value !== 1 && startTs > Date.now()
})

// 直播状态标签：直接读后端 liveStatusText，不存在时按本地规则兜底
const liveStatusLabel = computed(() => {
  if (isReplay.value) return '回放'
  if (liveStatusText.value) return liveStatusText.value
  if (isLiveNotStarted.value) return '未开始'
  if (hasReplay.value && pushStatus.value !== 1) return '回放'
  if (pushStatus.value === 1) return '直播中'
  if (!hasReplay.value && pushStatus.value !== 1) return '已结束'
  return '未开始'
})
const liveStatusClass = computed(() => {
  if (isReplay.value) return 'live-status--replay'
  if (isLiveNotStarted.value) return 'live-status--pending'
  if (hasReplay.value && pushStatus.value !== 1) return 'live-status--replay'
  if (pushStatus.value === 1) return 'live-status--live'
  return 'live-status--pending'
})
const useLiveVisualStyle = computed(() => isLiveVisualMode.value)
const allowWarmupInteraction = computed(() =>
  roomGroupType.value === 1 && isWaitingSchedule.value && !!warmUpVideoUrl.value
)
const useH5ReplayTopStyle = computed(() => isReplay.value && !useLiveVisualStyle.value)
const showTopViewerTools = computed(() =>
  useH5ReplayTopStyle.value ||
  !isWaitingSchedule.value ||
  allowWarmupInteraction.value
)
const topViewerIcon = computed(() =>
  useH5ReplayTopStyle.value
    ? "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-fire-6f37634f.png"
    : "https://man.lqjy.cc/static/icons/eye.png"
)
const topReportIcon = computed(() =>
  useH5ReplayTopStyle.value
    ? "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-complaint-text-52b0a134.png"
    : "https://man.lqjy.cc/static/icons/tousu2.png"
)
const shouldUseLivePlayer = computed(() => {
  const url = String(displayVideoUrl.value || "");
  if (!url || isReplay.value) return false;
  if (shouldPreferMiniProgramHlsPlayback()) return false;
  if (isWaitingSchedule.value && warmUpVideoUrl.value) return false;
  if (mediaSourceComponent.value === "video") return false;
  if (mediaSourceComponent.value === "live-player") return true;
  return isLivePlayerSource(url);
})
const anchorSubText = computed(() =>
  useLiveVisualStyle.value ? displayViewerCount.value : `${formatLikeCount(likeCount.value)}本场点赞`
)
const isChatAreaScrolled = ref(false)

function handleChatAreaScroll(event) {
  const scrollTop = Number(event?.detail?.scrollTop || 0)
  isChatAreaScrolled.value = scrollTop > 2
  handleCommentWindowScroll(event)
}

const CHAT_AREA_HEIGHT_RPX = 320;
const CHAT_STACK_GAP_RPX = 8;
const CHAT_NOTICE_STEP_RPX = 56;
// 置顶栏 / 进场提示 / 购买飘屏 / 去购买浮框 四层浮层相对聊天区顶沿的整体上抬量，≈5px
const NOTICE_STACK_LIFT_RPX = 10;

const chatAreaBottomRpx = computed(() => {
  
  return useLiveVisualStyle.value ? 190 : 190;
})
const chatTopAnchorBottomRpx = computed(
  () => chatAreaBottomRpx.value + CHAT_AREA_HEIGHT_RPX + CHAT_STACK_GAP_RPX + NOTICE_STACK_LIFT_RPX
)
const keyboardAvoidancePx = computed(() => {
  if (!inputFocused.value) return 0;
  const height = Number(keyboardHeight.value || 0);
  return height > 0 ? height : 0;
})

function buildKeyboardAwareBottomStyle(bottomRpx, extraStyle = {}) {
  const keyboardOffset = keyboardAvoidancePx.value;
  return {
    ...extraStyle, bottom: keyboardOffset > 0
      ? `calc(${bottomRpx}rpx + env(safe-area-inset-bottom) + ${keyboardOffset}px)`
      : `calc(${bottomRpx}rpx + env(safe-area-inset-bottom))`, };
}

// 快捷回复条高度约 76rpx：有快捷回复时聊天区域底部上移
const chatAreaStyle = computed(() => buildKeyboardAwareBottomStyle(chatAreaBottomRpx.value))

const chatTopAnchorStyle = computed(() => buildKeyboardAwareBottomStyle(
  chatTopAnchorBottomRpx.value, { zIndex: useLiveVisualStyle.value ? 9 : 3 },
  ))
const pinnedBarStyle = computed(() => chatTopAnchorStyle.value)

const enterNoticeStyle = computed(() => {
  // [2026-05-23] 无置顶评论时下沉一个槽位（占据原本置顶栏的位置），避免出现空白
  // 有置顶时：贴在置顶栏上方 56rpx（消息高 48rpx + 8rpx 间距）
  const pinnedOffset = pinnedMessage.value ? CHAT_NOTICE_STEP_RPX : 0;
  const bottom = chatTopAnchorBottomRpx.value + pinnedOffset;
  return buildKeyboardAwareBottomStyle(bottom);
})

const buyingNoticeStyle = computed(() => {
  // 进/离场提示存在时上抬一层；不存在时贴同一底锚，避免小屏空出无效高度。
  // [2026-05-23] 无置顶评论时同步下沉一个槽位，与进场提示保持布局一致
  const pinnedOffset = pinnedMessage.value ? CHAT_NOTICE_STEP_RPX : 0;
  const baseBottom = chatTopAnchorBottomRpx.value + pinnedOffset;
  const enterVisible = !!(enterNotice.value?.visible && !shouldShowEntryOverlay.value);
  const bottom = enterVisible ? baseBottom + CHAT_NOTICE_STEP_RPX : baseBottom;
  return buildKeyboardAwareBottomStyle(bottom);
})

const goShoppingNoticeStyle = computed(() => {
  // 对齐 enterNotice / buyingNotice 的动态底锢语义：
  //   基线 = chatTopAnchorBottomRpx + (有置顶 ? STEP : 0)
  //   有进/离场提示再 +STEP；有购买飘屏再 +STEP
  //   快捷回复高度已由 chatAreaBottomRpx 递传，无需重复处理
  const pinnedOffset = pinnedMessage.value ? CHAT_NOTICE_STEP_RPX : 0;
  const baseBottom = chatTopAnchorBottomRpx.value + pinnedOffset;
  const enterVisible = !!(enterNotice.value?.visible && !shouldShowEntryOverlay.value);
  const buyingVisible = !!buyingNotice.value?.visible;
  const bottom =
    baseBottom +
    (enterVisible ? CHAT_NOTICE_STEP_RPX : 0) +
    (buyingVisible ? CHAT_NOTICE_STEP_RPX : 0);
  return buildKeyboardAwareBottomStyle(bottom);
})

const shouldRenderLivePoster = computed(() => !isReplay.value && !warmUpVideoUrl.value && !!liveCover.value)
const showManualPlayButton = computed(() =>
  (
    !!showWxAddrDonePlayBtn.value ||
    (
      !!autoplayBlocked?.value &&
      !!displayVideoUrl.value &&
      !isReplay.value &&
      (!isPlaying.value || !videoFrameReady.value)
    )
  )
)
const showLivePoster = computed(() =>
  shouldRenderLivePoster.value &&
  (
    isLiveNotStarted.value ||
    isWaitingSchedule.value ||
    (!hasReplay.value && pushStatus.value !== 1) ||
    (pushStatus.value === 1 && !videoFrameReady.value && !isReplay.value)
  )
)
const shouldRenderReplayPoster = computed(() =>
  mode.value === "portrait" &&
  isReplay.value &&
  !!displayVideoUrl.value &&
  !!replayCoverPoster.value
)
const replayPosterHidden = computed(() =>
  shouldRenderReplayPoster.value && !!replayPosterFadeReady.value
)
const replayCoverPoster = computed(() => {
  return isReplay.value ? replayCover.value || "" : "";
})
const replayPlaybackConfirmed = ref(false)
const replayPosterFadeReady = ref(false)
let replayPosterHideTimer = null

onBeforeUnmount(() => {
  if (replayReadyFallbackTimer) {
    clearTimeout(replayReadyFallbackTimer)
    replayReadyFallbackTimer = null
  }
  if (replayPosterHideTimer) {
    clearTimeout(replayPosterHideTimer)
    replayPosterHideTimer = null
  }
})

watch(displayVideoUrl, () => {
  replayPlaybackConfirmed.value = false
  replayPosterFadeReady.value = false
})

watch(
  () => [
    shouldRenderReplayPoster.value, videoFrameReady.value, isPlaying.value || replayPlaybackConfirmed.value, displayVideoUrl.value, ], ([renderPoster, frameReady,
  playbackReady]) => {
    if (replayPosterHideTimer) {
      clearTimeout(replayPosterHideTimer)
      replayPosterHideTimer = null
    }
    if (!renderPoster || !frameReady || !playbackReady) {
      replayPosterFadeReady.value = false
      return
    }
    replayPosterHideTimer = setTimeout(() => {
      replayPosterHideTimer = null
      if (
        shouldRenderReplayPoster.value &&
        videoFrameReady.value &&
        (isPlaying.value || replayPlaybackConfirmed.value)
      ) {
        replayPosterFadeReady.value = true
      }
    }, 240)
  }, { immediate: true }, )

const {
  setIsPlaying, setShowProduct, setShowProductList, setShowShare, setShowCenterPopup,
	  setShowBuyPopup, setShowAddressPopup, setShowAddressFormPopup, setShowSignPopup, setBuyRemark, setActiveTab, setActiveTabIndex, setInputText,
	  setShowLiveReportPopup, goReport, onVideoPlay, onVideoTimeUpdate, onVideoTap, manualPlayVideo, setVideoFrameReady, onProductCardChange,
	  onGrab, onProductBuy, onProductDetail, loadProductList, focusInput, onInputFocus, sendMessage, onInputBlur,
	  handleSendClick, handleCommentWindowScroll, toggleCenter, toggleProduct, doLike, finishHeartAnimation, finishTapEffect, onShareAction, onCenterAction, openBuyAddressPopup, onBuyQuantityChange,
	  onBuySkuChange, onBuyCouponSelect, onBuyConfirm, onSelectBuyAddress, onAddBuyAddress, onEditBuyAddress, onDeleteBuyAddress, onImportWxAddress,
	  onBuyAddressSaved, isTruthyFlag, onSignedDone, enterLive, onSubscribePush, onTabChange, openCommentPrizeRuleModal, openWatchRewardPanel,
	  handleLivePlayerFailure, markPlaybackReady, retryPlayback
	} = props.a;
const recordPlaybackDebugEvent = props.a.recordPlaybackDebugEvent || (() => {});
const handleVideoPlayerEnded = props.a.handleVideoPlayerEnded || (() => {});

let frameCallbackPending = false;
let replayReadyFallbackTimer = null;
function commitVideoFrameReady(source) {
  setVideoFrameReady(true);
  markPlaybackReady?.(source);
}

function scheduleReplayReadyFallback(el, source) {
  if (!el || replayReadyFallbackTimer) return;
  replayReadyFallbackTimer = setTimeout(() => {
    replayReadyFallbackTimer = null;
    if (videoFrameReady.value) return;
    if (Number(el.readyState || 0) >= 2 && !el.paused) {
      commitVideoFrameReady(`${source || "media"}-stable-readyState`);
    }
  }, 180);
}

function markReplayVideoFrameReady(event) {
  if (videoFrameReady.value) return;
  const el = event?.target;
  if (event?.type === "playing") {
    replayPlaybackConfirmed.value = true;
  }
  if (!el) {
    if (event?.type === "loadeddata" || event?.type === "playing") {
      commitVideoFrameReady(event?.type || "media-event");
    }
    return;
  }
  if (typeof el.requestVideoFrameCallback === "function" && event?.type !== "timeupdate") {
    if (frameCallbackPending) return;
    frameCallbackPending = true;
    el.requestVideoFrameCallback(() => {
      frameCallbackPending = false;
      commitVideoFrameReady(event?.type || "frame-callback");
    });
    return;
  }
  const currentTime = Number(el.currentTime ?? event?.detail?.currentTime ?? 0);
  if (event?.type === "timeupdate" && currentTime > 0) {
    commitVideoFrameReady("timeupdate-progress");
    return;
  }
  if (typeof el.requestVideoFrameCallback !== "function") {
    scheduleReplayReadyFallback(el, event?.type || "media-event");
  }
}

function markVideoFrameReady(event) {
  if (isReplay.value) {
    markReplayVideoFrameReady(event);
    return;
  }
  if (videoFrameReady.value) return;
  const el = event?.target;
  const currentTime = Number(el?.currentTime ?? event?.detail?.currentTime ?? 0);
  if (!el) {
    if (
      event?.type === "loadeddata" ||
      event?.type === "playing" ||
      event?.type === "live-player-netstatus" ||
      (event?.type === "timeupdate" && currentTime > 0)
    ) {
      commitVideoFrameReady(event?.type || "media-event");
    }
    return;
  }
  if (el && typeof el.requestVideoFrameCallback === "function" && event?.type !== "timeupdate") {
    if (frameCallbackPending) return;
    frameCallbackPending = true;
    el.requestVideoFrameCallback(() => {
      frameCallbackPending = false;
      commitVideoFrameReady(event?.type || "frame-callback");
    });
    return;
  }
  if (
    event?.type === "loadeddata" ||
    event?.type === "playing" ||
    Number(el.readyState || 0) >= 2 ||
    currentTime > 0
  ) {
    commitVideoFrameReady(event?.type || "media-event");
  }
}

function handleVideoPlay(event) {
  setIsPlaying(true);
  if (!isReplay.value && !videoFrameReady.value) {
    commitVideoFrameReady(event?.type || "play");
  }
  recordPlaybackDebugEvent("stage_video_play", {
    mode: "portrait",
    type: event?.type || "",
    currentTime: Number(event?.target?.currentTime ?? event?.detail?.currentTime ?? 0),
  });
  if (isReplay.value) {
    replayPlaybackConfirmed.value = true;
  }
  if (typeof onVideoPlay === "function") {
    onVideoPlay(event);
  }
}

function handleVideoPause() {
  setIsPlaying(false);
  recordPlaybackDebugEvent("stage_video_pause", {
    mode: "portrait",
  });
  replayPlaybackConfirmed.value = false;
}

function handleVideoEnded() {
  setIsPlaying(false);
  handleVideoPlayerEnded();
}

function handleLivePlayerStateChange(event) {
  const code = Number(event?.detail?.code || 0);
  recordPlaybackDebugEvent("stage_live_player_state", {
    mode: "portrait",
    code,
    detail: event?.detail || {},
  });
  if (LIVE_PLAYER_READY_CODES.includes(code)) {
    setIsPlaying(true);
    commitVideoFrameReady("live-player-state");
    markPlaybackReady?.("live-player-state");
    if (typeof onVideoPlay === "function") {
      onVideoPlay(event);
    }
    return;
  }
  if ([-2301, -2302, 2103, 2105].includes(code)) {
    setIsPlaying(false);
    handleLivePlayerFailure?.(event);
  }
}

function handleLivePlayerNetStatus(event) {
  const info = event?.detail?.info || event?.detail || {};
  recordPlaybackDebugEvent("stage_live_player_netstatus", {
    mode: "portrait",
    info,
  });
  if (hasLivePlayerNetActivity(info)) {
    setIsPlaying(true);
    commitVideoFrameReady("live-player-netstatus");
    if (typeof onVideoPlay === "function") {
      onVideoPlay(event);
    }
  }
}

function handleLivePlayerError(event) {
  console.warn("[Live] live-player error:", {
    src: displayVideoUrl.value,
    detail: event?.detail || event,
  });
  setIsPlaying(false);
  handleLivePlayerFailure?.(event);
}

function handleVideoError(event, sourceUrl = "") {
  const currentUrl = String(displayVideoUrl.value || "");
  const eventUrl = String(sourceUrl || "");
  if (shouldUseLivePlayer.value || (eventUrl && eventUrl !== currentUrl)) {
    console.warn("[Live] ignored stale video error:", {
      eventSrc: eventUrl,
      currentSrc: currentUrl,
      usingLivePlayer: shouldUseLivePlayer.value,
      detail: event?.detail || event,
    });
    return;
  }
  console.warn("[Live] video error:", {
    src: currentUrl,
    detail: event?.detail || event,
  });
  setIsPlaying(false);
  handleLivePlayerFailure?.({ ...event, type: "video-error" });
}

function handleVideoTimeUpdate(event) {
  const normalizedEvent = event?.type ? event : { ...(event || {}), type: "timeupdate" };
  recordPlaybackDebugEvent("stage_video_timeupdate", {
    mode: "portrait",
    type: normalizedEvent?.type || "",
    hasTarget: !!normalizedEvent?.target,
    currentTime: Number(normalizedEvent?.target?.currentTime ?? normalizedEvent?.detail?.currentTime ?? 0),
  });
  markVideoFrameReady(normalizedEvent);
  onVideoTimeUpdate(normalizedEvent);
}

// 快捷回复：点击标签直接发送消息，不填入输入框
function handleQuickReply(text) {
  handleSendClick(text)
}

function findNoticeProduct(productId) {
  const id = Number(productId || 0);
  if (!id) return null;
  return productList.value.find((item) => Number(item.id || item.productId || 0) === id) || null;
}

function buildGoShoppingNoticeProductFallback() {
  const notice = goShoppingNotice.value || {};
  const id = Number(notice.productId || 0);
  if (!id) return null;
  return {
    id,
    image: notice.productImage || "",
    title: notice.productName || "",
  };
}

function openGoShoppingNoticeProduct() {
  const product = findNoticeProduct(goShoppingNotice.value?.productId) || buildGoShoppingNoticeProductFallback();
  if (!product) return;
  onProductBuy({ item: product });
}

const portraitInputRef = ref(null);
const instance = getCurrentInstance();

function createMediaContext(id = "liveVideo", type = "video") {
  const component = instance?.proxy;
  try {
    if (type === "live-player" && typeof uni.createLivePlayerContext === "function") {
      return uni.createLivePlayerContext(id, component);
    }
    if (typeof uni.createVideoContext === "function") {
      return uni.createVideoContext(id, component);
    }
  } catch (e) {}
  return null;
}

defineExpose({
  focus: () => portraitInputRef.value?.focus?.(),
  blur: () => portraitInputRef.value?.blur?.(),
  createMediaContext,
  createVideoContext: (id = "liveVideo") => createMediaContext(id, "video"),
  createLivePlayerContext: (id = "liveVideo") => createMediaContext(id, "live-player"),
});
</script>

<style lang="scss" scoped>
@import "../styles/live-portrait-stage.scss";
</style>
