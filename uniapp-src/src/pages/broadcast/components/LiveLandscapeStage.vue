<template>
  <!-- ====== 横屏模式 ====== -->
  <view
    v-if="!accessDenied"
    class="live-page live-landscape"
    :class="{
      'no-bottom': activeTab === 'products',
      'live-room--live': isLiveVisualMode,
      'live-landscape--live': isLiveVisualMode,
      'live-landscape--replay': !isLiveVisualMode,
      'live-landscape--stage-collapsed': stageCollapsed,
    }"
    :style="landscapeBottomStyle"
  >
    <!-- 视频主区域：播放器、兜底播放按钮、封面占位与结束/未开播蒙层 -->
    <view
      class="video-section"
      :class="{
        'video-section--mini-hidden': miniHidden && stageCollapsed,
        'video-section--fullscreen': isFakeFullscreen,
        'video-section--playing': isPlaying || videoFrameReady,
      }"
      :style="miniWindowStyle"
      @touchstart="onMiniDragStart"
      @touchmove="onMiniDragMove"
      @touchend="onMiniDragEnd"
      @touchcancel="onMiniDragEnd"
    >
      <!-- [iOS 微信 demo 对齐] 同竖屏：v-show + :src 让 video 元素和 src 同 tick 注入 -->
      <live-player
        v-if="shouldUseLivePlayer && displayVideoUrl"
        :key="'live-player-' + videoRenderKey"
        id="liveVideo"
        class="replay-video"
        :src="displayVideoUrl"
        mode="live"
        object-fit="contain"
        :autoplay="true"
        :muted="false"
        sound-mode="speaker"
        :mute-on-audio-conflict="false"
        :min-cache="1"
        :max-cache="3"
        orientation="horizontal"
        :style="{
          backgroundImage: showLivePoster ? 'url(' + videoPoster + ')' : 'none',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#000',
        }"
        @statechange="handleLivePlayerStateChange"
        @netstatus="handleLivePlayerNetStatus"
        @error="handleLivePlayerError"
      />
      <video
        v-if="!shouldUseLivePlayer && displayVideoUrl"
        :key="videoRenderKey"
        id="liveVideo"
        class="replay-video"
        :src="displayVideoUrl"
        :loop="isWaitingSchedule && !!warmUpVideoUrl"
        :controls="false"
        :show-play-btn="false"
        :show-center-play-btn="false"
        :show-fullscreen-btn="false"
        :show-mute-btn="false"
        :enable-progress-gesture="false"
        object-fit="contain"
        :style="{
          backgroundImage: showLivePoster ? 'url(' + videoPoster + ')' : 'none',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#000',
        }"
        :muted="false"
        :autoplay="true"
        preload="auto"
        :poster="showLivePoster ? videoPoster : ''"
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
        @ended="handleVideoEnded"
        @timeupdate="handleVideoTimeUpdate"
        @error="handleVideoError($event, displayVideoUrl)"
      />
      <!-- 横屏未开始/已结束/直播加载中：封面占位 -->
      <!-- 使用 v-show 而非 v-if：避免 DOM 创建延迟导致视频黑屏先于封面显示 -->
      <view
        v-if="showLivePoster"
        class="replay-video replay-video--poster"
        :class="{ 'replay-video--poster-hidden': !showLivePoster }"
      >
        <image class="replay-video-poster-img" :src="liveCover" mode="aspectFill" />
      </view>
      <!-- 横屏直播未开始 蒙层（直播结束后不再显示遮罩） -->
      <live-ended-overlay
        :visible="showNotStartedOverlay && !(roomGroupType === 0 && isReplay)"
        :title="liveOverlayTitle"
        :show-views="false"
        :viewer-count="displayViewerCount"
        :avatar="anchorAvatar"
        :name="anchorName"
      />
      <view
        v-if="showLiveLandscapePreview && (liveCover || videoPoster)"
        class="live-landscape-preview"
        @click.stop="manualPlayVideo"
      >
        <image
          class="live-landscape-preview__cover"
          :src="liveCover || videoPoster"
          mode="aspectFill"
        />
      </view>
      <view
        v-if="playbackErrorVisible"
        class="playback-failure playback-failure--landscape"
        @click.stop="retryPlayback"
      >
        <text class="playback-failure__title">{{ playbackErrorText || '播放失败，请重试' }}</text>
        <text class="playback-failure__action">点击重试</text>
      </view>
      <view
        v-if="isLiveLandscapeStyle && hasVisibleWatchRewardTasks"
        class="live-landscape-reward"
        @click.stop="openWatchRewardPanel"
      >
        <image
          class="live-landscape-reward__image"
          src="https://man.lqjy.cc/static/icons/competitor-live/watch_reward-new.png"
          mode="aspectFit"
        />
        <!-- 文案与竖屏一致：watchRewardEntryLabel 在有进行中任务时返回 MM:SS 倒计时；可领取或异常空串时回落"领取" -->
        <text class="live-landscape-reward__text">{{ watchRewardEntryLabel || '领取' }}</text>
      </view>
      <!-- 底部视频控制栏（竞品 DPlayer 风格） -->
      <view v-if="isLiveLandscapeStyle" class="video-controls">
        <view class="video-controls__left">
          <view v-if="pushStatus === 1" class="video-controls__live-tag">
            <view class="video-controls__live-dot"></view>
            <text class="video-controls__live-text">直播</text>
          </view>
        </view>
        <view class="video-controls__right">
          <view class="video-controls__btn" @click.stop="toggleFullscreen">
            <image
              class="video-controls__icon"
              src="https://man.lqjy.cc/static/icons/competitor-live/icon-fullscreen.svg"
              mode="aspectFit"
            />
          </view>
          <!-- 折叠/收起按钮：紧贴全屏按钮右侧，与图2 对齐 -->
          <view v-if="isLiveLandscapeStyle" class="video-controls__btn live-landscape-collapse" @click.stop="toggleCollapse">
            <image
              class="live-landscape-collapse__image"
              :class="{ 'live-landscape-collapse__image--flipped': stageCollapsed }"
              src="https://man.lqjy.cc/static/icons/competitor-live/hall-room-up.png"
              mode="aspectFit"
            />
          </view>
        </view>
      </view>
      <!-- 折叠态小窗浮控：关闭(仅隐藏小窗，不联动折叠按钮)。仅折叠态显示，由 css 控制。 -->
      <view v-if="stageCollapsed" class="video-mini-controls" @click.stop @touchstart.stop>
        <text class="video-mini-controls__close" @click.stop="closeMiniWindow" @touchstart.stop>×</text>
      </view>
    </view>
    <!-- 顶部信息区：主播资料、观看人数与投诉入口 -->
    <view v-show="!stageCollapsed" class="video-top">
      <view class="anchor-left">
        <view class="anchor-info" :class="{ 'anchor-info--hidden': !anchorName }">
          <view class="anchor-avatar-wrap">
            <image
              class="anchor-avatar"
              :src="anchorAvatar"
              mode="aspectFill"
            />
          </view>
          <view class="anchor-meta">
            <text class="anchor-name">{{ anchorName }}</text>
            <text class="anchor-likes">{{ displayViewerCount }}</text>
          </view>
        </view>
        <view v-if="roomGroupType !== 1 && roomSetting.showStatus !== 0" class="live-status-badge live-status-badge--inline" :class="liveStatusClass">
          <view v-if="pushStatus === 1 && !isReplay" class="live-status-dot"></view>
          <text class="live-status-text">{{ isLiveLandscapeStyle ? liveLandscapeStatusText : liveStatusLabel }}</text>
        </view>
      </view>
      <view v-if="isLiveLandscapeStyle" class="live-landscape-tool-group">
        <view class="live-landscape-report" @click.stop="goReport">
          <image
            class="live-landscape-report__image"
            src="https://man.lqjy.cc/static/icons/competitor-live/complaint-text-2.png"
            mode="aspectFit"
          />
        </view>
        <view class="live-landscape-round-tool live-landscape-round-tool--ghost" @click.stop="toggleCenter">
          <image
            class="live-landscape-round-tool__image"
            src="https://man.lqjy.cc/static/icons/competitor-live/portal-icon_light.png"
            mode="aspectFit"
          />
        </view>
        <!-- 隐藏音符按钮：按图1需求移除（保留 dom 注释占位，避免后续误新增重复） -->
        <view v-if="roomSetting.showViewerData !== 0" class="live-landscape-fire-count">
          <image
            class="live-landscape-fire-count__icon"
            src="https://man.lqjy.cc/static/icons/competitor-live/fire.png"
            mode="aspectFit"
          />
          <text
            class="live-landscape-fire-count__text"
            :class="{ 'viewer-num-animate': viewerCountAnimating }"
            >{{ displayViewerCount }}</text
          >
        </view>
      </view>
      <view v-if="!(isWaitingSchedule && warmUpVideoUrl)" class="viewer-area">
        <view v-if="roomSetting.showViewerData !== 0" class="viewer-badge">
          <image
            class="viewer-icon"
            src="https://man.lqjy.cc/static/icons/eye.png"
            mode="aspectFit"
          />
          <text
            class="viewer-num"
            :class="{ 'viewer-num-animate': viewerCountAnimating }"
          >
            {{ displayViewerCount }}
          </text>
        </view>
        <view class="report-btn" @click="goReport">
          <image
            class="report-icon"
            src="https://man.lqjy.cc/static/icons/tousu2.png"
            mode="aspectFit"
          />
          <text class="report-text">投诉</text>
        </view>
      </view>
    </view>
    <live-external-lottery-tools
      v-if="!(isWaitingSchedule && warmUpVideoUrl) && !anyBusinessPopupOpen"
      class="landscape-lottery-tools"
      :comment-lottery-visible="showLandscapeCommentLotteryEntry"
      :keyword="commentLotteryEntryKeyword"
      :bubble-visible="commentLotteryBubbleVisible"
      :watch-reward-visible="!isLiveLandscapeStyle && hasVisibleWatchRewardTasks"
      :watch-reward-label="watchRewardEntryLabel"
      @open-comment-lottery="openCommentPrizeRuleModal"
      @open-watch-reward="openWatchRewardPanel"
    />
    <!-- 右侧内容区：互动评论、商品列表与签到页签 -->
    <view class="interact-section">
      <!-- 横屏：预约开播倒计时(tabs上方) -->
      <!-- <live-countdown
        v-if="isWaitingSchedule"
        variant="landscape"
        :countdown="countdownParts"
        :push-time="pushTime"
        @subscribe="onSubscribePush"
      /> -->
      <!-- 折叠态顶部栏：参考诺云，渐变背景 + 火焰热度 + ∨收回按钮 -->
      <view v-if="stageCollapsed" class="live-landscape-collapsed-header" @click.stop>
        <view class="live-landscape-collapsed-header__left">
          <image
            class="live-landscape-collapsed-header__fire"
            src="https://man.lqjy.cc/static/icons/competitor-live/fire.png"
            mode="aspectFit"
          />
          <text class="live-landscape-collapsed-header__count">{{ displayViewerCount }}</text>
        </view>
        <view class="live-landscape-collapsed-header__restore" @click.stop="toggleCollapse">
          <image
            class="live-landscape-collapse__image live-landscape-collapse__image--flipped"
            src="https://man.lqjy.cc/static/icons/competitor-live/hall-room-up.png"
            mode="aspectFit"
          />
        </view>
      </view>
      <view
        class="landscape-tab-bar"
        :class="{ 'landscape-tab-bar--with-subscribe': showLandscapeSubscribe }"
      >
        <wd-tabs
          class="custom-tabs"
          :model-value="activeTabIndex"
          color="#000000"
          inactive-color="#7f7f7f"
          @update:model-value="setActiveTabIndex"
          @change="onTabChange"
        >
          <wd-tab v-if="roomSetting.enableChat !== 0" :title="landscapeInteractTitle" name="0" />
          <wd-tab v-if="isTruthyFlag(signConfig.enabled)" title="签到" name="2" />
          <wd-tab
            v-if="roomSetting.showProduct !== 0"
            :title="landscapeProductTitle"
            name="1"
          />
        </wd-tabs>
        <view
          v-if="showLandscapeSubscribe"
          class="landscape-tab-subscribe"
          @click.stop="onSubscribePush"
        >
          <text class="landscape-tab-subscribe__plus">＋</text>
          <text class="landscape-tab-subscribe__text">订阅</text>
        </view>
      </view>
      <!-- 直播互动 -->
      <view
        v-if="roomSetting.enableChat !== 0"
        v-show="activeTab === 'interact'"
        class="interact-content"
        :style="commentListStyle"
      >
        <!-- <text class="date-text">{{ liveDate }}</text> -->
        <live-marquee-ad
          :room-setting="roomSetting"
          variant="landscape"
        />
        <!-- 置顶评论固定栏：复用 comment-item 结构，昵称右侧加黄色置顶标识 -->
        <view v-if="pinnedMessage" class="comment-item comment-item--pinned">
          <image
            class="comment-avatar"
            :src="pinnedMessage.avatar || defaultAvatar"
            mode="aspectFill"
          />
          <view class="comment-body">
            <view class="comment-nick-row">
              <text class="comment-nick">{{ pinnedMessage.nick }}</text>
              <text class="pinned-tag">置顶</text>
            </view>
            <view class="comment-bubble">
              <text class="comment-content">{{ pinnedMessage.content }}</text>
            </view>
          </view>
        </view>
        <scroll-view
          v-if="shouldShowComments"
          class="comment-list"
          :scroll-y="!inputFocused"
          :scroll-into-view="scrollToId"
          :scroll-with-animation="commentScrollWithAnimation"
          @scroll="handleCommentWindowScroll"
        >
          <view
            v-for="msg in visibleMessages"
            :key="msg._visibleIndex"
            :id="'msg-' + msg._visibleIndex"
            :class="[
              'comment-item',
              msg.type === 'lottery_win' ? 'comment-item--lottery-win' : '',
            ]"
          >
            <image
              v-if="msg.type !== 'lottery_win'"
              class="comment-avatar"
              :src="msg.avatar || defaultAvatar"
              mode="aspectFill"
            />
            <view class="comment-body">
              <view v-if="msg.type !== 'lottery_win'" class="comment-nick-row">
                <text v-if="msg.isAdmin" class="admin-tag">管理员</text>
                <text class="comment-nick">{{ msg.nick }}</text>
              </view>
              <view
                :class="[
                  'comment-bubble',
                  msg.type === 'gift' ? 'gift-bubble' : '',
                  msg.type === 'lottery_win' ? 'lottery-win-landscape-bubble' : '',
                ]"
              >
                <template v-if="msg.type === 'lottery_win'">
                  <image class="lottery-win-icon" :src="msg.icon" mode="aspectFit" />
                  <text class="lottery-win-text">
                    恭喜
                    <text class="lottery-win-name">{{ msg.nick }}</text>
                    获得
                    <text class="lottery-win-prize">{{ msg.prizeName }}</text>
                  </text>
                </template>
                <text
                  v-if="msg.type !== 'lottery_win'"
                  :class="[
                    'comment-content',
                    msg.type === 'gift' ? 'gift-text' : '',
                  ]"
                  >{{ msg.content }}</text
                >
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
      <!-- 商品列表 -->
      <view v-show="activeTab === 'products'" class="products-content">
        <live-product-shelf
          mode="landscape-list"
          :product-list="productList"
          :product-loading="productLoading"
          :product-finished="productFinished"
          :success-notice="productListSuccessNotice"
          @buy="onProductBuy"
          @detail="onProductDetail"
          @loadmore="loadProductList()"
        />
      </view>
      <!-- 签到 -->
      <view
        v-if="isTruthyFlag(signConfig.enabled)"
        v-show="activeTab === 'sign'"
        class="sign-content"
      >
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
          :show-welcome-text="false"
          :show-skip="false"
          submit-text="提交"
          @signed="onSignedDone"
          @skip="
            setActiveTab('interact');
            setActiveTabIndex('0');
          "
        />
      </view>
    </view>
    <!-- 禁言/拉黑提示条 -->
    <view
      v-if="roomSetting.enableChat !== 0 && muteTipVisible && activeTab === 'interact'"
      class="mute-tip-bar"
    >
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
    <!-- 底部操作栏：聊天输入、个人中心、商品快捷入口与点赞 -->
    <live-chat-bar
      ref="landscapeInputRef"
      :model-value="inputText"
      variant="landscape"
      :visible="roomSetting.enableChat !== 0 && !isWaitingSchedule"
      :show="activeTab === 'interact'"
      :focused="inputFocused"
      :disabled-text="chatDisabled"
      :bottom-style="bottomBarStyle"
      :room-setting="roomSetting"
      :live-toolbar="isLiveLandscapeStyle"
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
      @like="doLike"
      @heart-animation-end="finishHeartAnimation"
      @quick-reply="handleQuickReply"
      @share="setShowShare(true)"
    >
      <template #prefix>
      <live-product-shelf
        mode="landscape-anchor"
        :show-product="showProduct"
        :current-product="currentProduct"
        :product-card-items="productCardItems"
        :product-card-active-index="productCardActiveIndex"
        :show-hot-sale="Number(roomSetting.showHotSale ?? 1) === 1"
        @update:show-product="setShowProduct($event)"
        @product-card-change="onProductCardChange"
        @buy="onProductBuy"
      />
      </template>
      <template #toolbar-extra>
      </template>
    </live-chat-bar>
    <!-- 弹窗层：分享、购买、地址、个人中心、进场蒙层与投诉 -->
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
    <center-popup
      v-if="renderCenterPopup"
      :visible="showCenterPopup"
      :name="centerPopupName"
      :show-close="false"
      :avatar="centerPopupAvatar"
      :order-stats="centerPopupOrderStats"
      :is-distributor="isDistributor"
      :distributor-status="distributorStatus"
      :enable-share="roomSetting.enableShare"
      @close="setShowCenterPopup(false)"
      @action="onCenterAction"
    />
    <!-- 进场飘屏（横屏 stage） -->
    <view
      v-if="enterNotice.visible && !shouldShowEntryOverlay"
      :key="enterNotice.key"
      class="enter-notice"
      :class="{ 'enter-notice--leave': enterNotice.leaving }"
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
    <!-- 购买胶囊飘屏（横屏 stage） -->
    <view
      v-if="buyingNotice.visible"
      :key="buyingNotice.key"
      class="buying-notice"
      :class="{ 'buying-notice--leave': buyingNotice.leaving }"
    >
      <view class="buying-notice__content">
        <image class="buying-notice__icon" src="https://man.lqjy.cc/static/icons/shopping-icon.png" mode="aspectFit" />
        <text class="buying-notice__nick">{{ buyingNotice.nick }}</text>
        <text v-if="buyingNotice.count > 1" class="buying-notice__text">等{{ buyingNotice.count }}人</text>
        <text class="buying-notice__text">{{ buyingNotice.noticeText || '正在去购买' }}</text>
      </view>
    </view>
    <!-- 去购买提醒飘屏（横屏 stage） -->
    <view
      v-if="goShoppingNotice.visible"
      :key="goShoppingNotice.key"
      class="go-shopping-notice"
      :class="{ 'go-shopping-notice--leave': goShoppingNotice.leaving }"
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
        </view>
      </view>
    </view>
    <!-- 进入直播间蒙层(横屏) -->
    <live-entry-overlay
      :show="shouldShowEntryOverlay"
      :landscape="true"
      @enter="enterLive"
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
  </view>
</template>

<script setup>
import { ref, toRefs, computed, getCurrentInstance, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
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
import { isLiveCoverOnlyStatusText } from "../utils/entry-format.js";
import { LIVE_PLAYER_READY_CODES, hasLivePlayerNetActivity } from "../utils/live-player-status.js";
import { isLivePlayerSource } from "@/utils/live-route.js";

const props = defineProps({
  s: { type: Object, required: true },
  a: { type: Object, required: true },
});

const BUY_POPUP_Z_INDEX = 100000000;
const {
  mode, accessDenied, isWechatH5, isIOS, anchorName, anchorAvatar, likeCount, isWaitingSchedule,
  warmUpVideoUrl, roomSetting, viewerCountAnimating, displayViewerCount, displayVideoUrl, mediaSourceComponent, mediaSourceType, videoRenderKey, isReplay,
  isLiveVisualMode, hasReplay, liveStatusText, quickReplies, roomGroupType, videoPoster, isMuted,
  playbackErrorVisible, playbackErrorText, isPlaying, videoFrameReady, isIOSH5, liveCover, tapEffects, comboInfo, shouldShowComments, scrollToId,
  commentScrollWithAnimation, visibleMessages, pinnedMessage, productListSuccessNotice, showProduct, showProductList, currentProduct, productCardItems, productCardActiveIndex,
  productList, productLoading, productFinished, muteTipVisible, userBlocked, muteRemainText, inputText, inputFocused,
  chatDisabled, bottomBarStyle, hearts, showShare, showCenterPopup, centerPopupName, centerPopupAvatar, centerPopupOrderStats,
  showBuyPopup, buyProduct, buyAddressText, selectedAddress, buyShippingFee, buyGoodsAmount, buyTotalPrice, buyDiscountAmount,
  buyRemark, buyLoading, usableCoupons, unusableCoupons, selectedCouponId, couponLoading, showLiveReportPopup, liveId,
  roomCode, replayCurrentVideoId, roomCurrentTermId, myUserId, shareCode, liveBindId, liveTenantId, broadcastReturnPath, liveName, showAddressPopup, addressList, selectedAddressId, showAddressFormPopup, editAddressData, signConfig, showSignPopup,
  signFields, hasSigned, pushStatus, pushTime, showNotStartedOverlay, liveOverlayTitle, shouldShowEntryOverlay, activeTab,
  activeTabIndex, showLandscapeSubscribe, scheduleTimeStr, liveDate, commentListStyle, hasVisibleWatchRewardTasks, watchRewardEntryLabel, commentLotteryEntryVisible,
  commentLotteryEntryKeyword, commentLotteryBubbleVisible, defaultAvatar, isDistributor, distributorStatus, enterNotice, buyingNotice, goShoppingNotice
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

function parseStageStartTs(value) {
  if (!value) return 0
  const ts = new Date(String(value).replace(/-/g,
  '/')).getTime()
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
const isLiveLandscapeStyle = computed(() => isLiveVisualMode.value)
const shouldUseLivePlayer = computed(() => {
  const url = String(displayVideoUrl.value || "");
  if (!url || isReplay.value) return false;
  if (isWaitingSchedule.value && warmUpVideoUrl.value) return false;
  if (mediaSourceComponent.value === "video") return false;
  if (mediaSourceComponent.value === "live-player") return true;
  return isLivePlayerSource(url);
})

// 折叠状态：点击后下方内容区扩全屏（视频隐藏），再点收回
const stageCollapsed = ref(false)
function toggleCollapse() {
  stageCollapsed.value = !stageCollapsed.value
}

// 折叠态小窗独立关闭：点 × 仅隐藏小窗本身，不联动折叠按钮（使用仍保留折叠态）
// 隐藏手法采用 visibility 而非 display:none，避免 video 被某些浏览器停止播放导致直播流断开
const miniHidden = ref(false)
function closeMiniWindow() {
  miniHidden.value = true
}
watch(stageCollapsed, (val) => {
  setLandscapeMiniActive?.(!!val)
  // 恢复为非折叠态时重置小窗隐藏与拖拽偏移，保证下次折叠从默认位置开始
  if (!val) {
    miniHidden.value = false
    miniWindowOffset.value = { x: 0, y: 0 }
  }
})

// 折叠态小窗拖拽：以 transform 偏移叠加在默认 right/bottom 上，仅折叠态生效
const miniWindowOffset = ref({ x: 0, y: 0 })
let miniDragState = null
const miniWindowStyle = computed(() => {
  if (!stageCollapsed.value) return {}
  const { x, y } = miniWindowOffset.value
  if (!x && !y) return {}
  return { transform: `translate(${x}px, ${y}px)` }
})
function onMiniDragStart(e) {
  if (!stageCollapsed.value || miniHidden.value) return
  // 点击小窗控件（× / 静音）不启动拖拽
  const target = e.target
  if (target && typeof target.closest === 'function' && target.closest('.video-mini-controls')) {
    return
  }
  const t = (e.touches && e.touches[0]) || e
  miniDragState = {
    startX: t.clientX, startY: t.clientY, baseX: miniWindowOffset.value.x,
  baseY: miniWindowOffset.value.y, }
}
function onMiniDragMove(e) {
  if (!miniDragState) return
  const t = (e.touches && e.touches[0]) || e
  miniWindowOffset.value = {
    x: miniDragState.baseX + (t.clientX - miniDragState.startX), y: miniDragState.baseY + (t.clientY - miniDragState.startY), }
  // 阻止页面随之滚动，仅在拖拽中生效
  if (e && typeof e.preventDefault === 'function') {
    try { e.preventDefault() } catch (err) { /* passive listener 忿略 */ }
  }
}
function onMiniDragEnd() {
  miniDragState = null
}

function handleVideoPause() {
  setIsPlaying(false)
}

function handleVideoEnded() {
  setIsPlaying(false)
  handleVideoPlayerEnded()
}

// 横屏视频全屏切换：纯 CSS 伪全屏方案（跳过原生 Fullscreen API）
// 选择伪全屏的原因：
// - Qoder Mobile Preview / 嵌套 iframe 环境下，原生 requestFullscreen 即使 resolve 也只能全屏到 iframe 内，视觉上无效
// - iOS Safari/微信的 webkitEnterFullscreen 会进系统原生播放器，丢失营销浮层/控制条/领奖入口，不是直播间该要的全屏形态
// - .video-section 套上 fixed 全屏类，保留原有 video / video-controls / live-landscape-reward / 营销浮层全部层级
// - 跨平台稳定：Qoder 模拟器 / iOS 微信 / Android Chrome / 桌面浏览器 表现一致
const isFakeFullscreen = ref(false)
function toggleFullscreen() {
  isFakeFullscreen.value = !isFakeFullscreen.value
  // 进全屏时如果处于折叠态小窗，先退出折叠避免小窗 fixed 与全屏 fixed 冲突
  if (isFakeFullscreen.value && stageCollapsed.value) {
    stageCollapsed.value = false
  }
}
// [2026-05-22 修复] 原逻辑仅按 pushStatus===1 二元判断，会把后端返回的「已结束/回放/未开始」一律显示为「未直播」。
//   改为复用 liveStatusLabel（优先后端 liveStatusText + 本地藠底），与竖屏保持一致。
const liveLandscapeStatusText = liveStatusLabel
const showLiveLandscapePreview = computed(() => {
  if (!isLiveLandscapeStyle.value) return false
  if (isLiveNotStarted.value) return false
  if (liveCover.value) return false
  if (!displayVideoUrl.value) return true
  return showNotStartedOverlay.value || (isWaitingSchedule.value && !warmUpVideoUrl.value)
})
const shouldRenderLivePoster = computed(() =>
  !warmUpVideoUrl.value &&
  !!liveCover.value &&
  !showLiveLandscapePreview.value &&
  !(pushStatus.value === 1 && videoFrameReady.value)
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
const landscapeInteractTitle = computed(() => isLiveLandscapeStyle.value ? '互动' : '直播互动')
const landscapeProductTitle = computed(() => isLiveLandscapeStyle.value ? '商品' : '商品列表')

// 动态测量底部输入栏（含快捷回复条）实际高度，作为 .live-page 的 padding-bottom，
// 避免 fixed 的 .bottom-bar 遮挡评论列表最后一条；写死数值无法覆盖快捷回复条数/聚焦/popover 展开等差异。
const bottomBarHeight = ref(0)

function bindBottomBarObserver() {
  bottomBarHeight.value = quickReplies.value?.length > 0 ? 180 : 110
}

onMounted(() => {
  nextTick(bindBottomBarObserver)
})

// 切换 tab / 快捷回复列表变化时，bottom-bar 可能被销毁重建或高度变化，重新绑定测量
watch([activeTab, quickReplies,
  inputFocused], () => {
  nextTick(bindBottomBarObserver)
})

onBeforeUnmount(() => {
  setLandscapeMiniActive?.(false)
})

// 任意业务弹窗打开时，横屏评论抽奖入口（图标+气泡）应隐藏，避免入口浮在业务流程上方。
// 注意：showProduct / showProductList 是"讲解中商品卡"的显隐态，是直播间常态，不能当作弹窗计入。
const anyBusinessPopupOpen = computed(() => Boolean(
  showBuyPopup.value
  || showCenterPopup.value
  || showShare.value
  || showAddressPopup.value
  || showAddressFormPopup.value
  || showSignPopup.value
  || showLiveReportPopup.value, ))

const showLandscapeCommentLotteryEntry = computed(() => (
  activeTab.value === 'interact' && commentLotteryEntryVisible.value
))

const landscapeBottomStyle = computed(() => {
  if (activeTab.value !== 'interact') return {}
  if (bottomBarHeight.value > 0) {
    return { paddingBottom: `${bottomBarHeight.value}px` }
  }
  // 兜底：测量未就绪前，按当前是否有快捷回复给一个安全初值，避免首屏闪现遮挡
  if (quickReplies.value?.length > 0) {
    return { paddingBottom: 'calc(180rpx + env(safe-area-inset-bottom))' }
  }
  return { paddingBottom: 'calc(110rpx + env(safe-area-inset-bottom))' }
})

const {
  setIsPlaying, setShowProduct, setShowProductList, setShowShare, setShowCenterPopup, setShowBuyPopup,
  setShowAddressPopup, setShowAddressFormPopup, setShowSignPopup, setBuyRemark, setActiveTab, setActiveTabIndex, setInputText, setShowLiveReportPopup,
  goReport, onVideoPlay, onVideoTimeUpdate, onVideoTap, manualPlayVideo, setVideoFrameReady, onProductCardChange, onGrab,
  onProductBuy, onProductDetail, loadProductList, focusInput, onInputFocus, sendMessage, onInputBlur, handleSendClick,
  handleCommentWindowScroll,
  toggleCenter, toggleProduct, doLike, finishHeartAnimation, onShareAction, onCenterAction, openBuyAddressPopup, onBuyQuantityChange, onBuySkuChange,
  onBuyCouponSelect, onBuyConfirm, onSelectBuyAddress, onAddBuyAddress, onEditBuyAddress, onDeleteBuyAddress, onImportWxAddress, onBuyAddressSaved,
  isTruthyFlag, onSignedDone, enterLive, onSubscribePush, onTabChange, openCommentPrizeRuleModal, openWatchRewardPanel, toggleMute, setLandscapeMiniActive,
  handleLivePlayerFailure, markPlaybackReady, retryPlayback,
} = props.a;
const recordPlaybackDebugEvent = props.a.recordPlaybackDebugEvent || (() => {});
const handleVideoPlayerEnded = props.a.handleVideoPlayerEnded || (() => {});

let frameCallbackPending = false;
function markVideoFrameReady(event) {
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
      setVideoFrameReady(true);
      markPlaybackReady?.(event?.type || "media-event");
    }
    return;
  }
  if (el && typeof el.requestVideoFrameCallback === "function" && event?.type !== "timeupdate") {
    if (frameCallbackPending) return;
    frameCallbackPending = true;
    el.requestVideoFrameCallback(() => {
      frameCallbackPending = false;
      setVideoFrameReady(true);
      markPlaybackReady?.(event?.type || "frame-callback");
    });
    return;
  }
  if (
    event?.type === "loadeddata" ||
    event?.type === "playing" ||
    Number(el.readyState || 0) >= 2 ||
    currentTime > 0
  ) {
    setVideoFrameReady(true);
    markPlaybackReady?.(event?.type || "media-event");
  }
}

function handleVideoPlay(event) {
  setIsPlaying(true);
  recordPlaybackDebugEvent("stage_video_play", {
    mode: "landscape",
    type: event?.type || "",
    currentTime: Number(event?.target?.currentTime ?? event?.detail?.currentTime ?? 0),
  });
  if (typeof onVideoPlay === "function") {
    onVideoPlay(event);
  }
}

function handleVideoTimeUpdate(event) {
  const normalizedEvent = event?.type ? event : { ...(event || {}), type: "timeupdate" };
  recordPlaybackDebugEvent("stage_video_timeupdate", {
    mode: "landscape",
    type: normalizedEvent?.type || "",
    hasTarget: !!normalizedEvent?.target,
    currentTime: Number(normalizedEvent?.target?.currentTime ?? normalizedEvent?.detail?.currentTime ?? 0),
  });
  markVideoFrameReady(normalizedEvent);
  onVideoTimeUpdate(normalizedEvent);
}

function handleLivePlayerStateChange(event) {
  const code = Number(event?.detail?.code || 0);
  recordPlaybackDebugEvent("stage_live_player_state", {
    mode: "landscape",
    code,
    detail: event?.detail || {},
  });
  if (LIVE_PLAYER_READY_CODES.includes(code)) {
    setIsPlaying(true);
    setVideoFrameReady(true);
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
    mode: "landscape",
    info,
  });
  if (hasLivePlayerNetActivity(info)) {
    setIsPlaying(true);
    markVideoFrameReady({ ...event, type: "live-player-netstatus" });
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

// 快捷回复：点击标签直接发送消息，不填入输入框
function handleQuickReply(text) {
  handleSendClick(text)
}

const landscapeInputRef = ref(null);
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
    if (type !== "live-player" && typeof uni.createLivePlayerContext === "function") {
      return uni.createLivePlayerContext(id, component);
    }
  } catch (e) {}
  return null;
}

defineExpose({
  focus: () => landscapeInputRef.value?.focus?.(),
  blur: () => landscapeInputRef.value?.blur?.(),
  createMediaContext,
  createVideoContext: (id = "liveVideo") => createMediaContext(id, "video"),
  createLivePlayerContext: (id = "liveVideo") => createMediaContext(id, "live-player"),
});
</script>

<style lang="scss" scoped>
@import "../styles/live-landscape-stage.scss";
</style>
