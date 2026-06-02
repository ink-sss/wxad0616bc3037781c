<template>
  <view class="broadcast-stage-host">
    <view v-if="loading" class="live-page live-state-page">
      <view class="state-card">
        <text class="state-title">直播间加载中...</text>
      </view>
    </view>

    <view v-else-if="errorText" class="live-page live-state-page">
      <view class="state-card">
        <image v-if="coverImage" class="state-cover" :src="coverImage" mode="aspectFill" />
        <text class="state-title">{{ errorText }}</text>
        <text v-if="liveCandidates.length" class="state-subtitle">已尝试 {{ liveCandidateIndex + 1 }}/{{ liveCandidates.length }} 条线路</text>
        <button class="state-btn" @tap="loadRoom">重新加载</button>
      </view>
    </view>

    <template v-else>
      <view v-if="viewerLimitReached" class="viewer-limit">
        <view class="viewer-limit__image"></view>
        <text class="viewer-limit__text">{{ viewerLimitText || '观看人数已达上限' }}</text>
      </view>

      <view v-else-if="accessDenied" class="access-denied-overlay">
        <view class="access-denied-card">
          <view class="access-denied-lock">!</view>
          <text class="access-denied-title">{{ accessDeniedTitle }}</text>
          <view class="access-denied-anchor">
            <image class="access-denied-anchor-avatar" :src="accessDeniedAvatar || defaultAvatar" mode="aspectFill" />
            <view class="access-denied-anchor-meta">
              <text class="access-denied-anchor-name">{{ accessDeniedUserName }}</text>
              <text class="access-denied-anchor-id" @tap="copyAccessUid">{{ accessDeniedUidText }}</text>
            </view>
          </view>
        </view>
      </view>

      <view
        v-else-if="!isLandscape"
        class="live-page live-portrait"
        :class="{
          'live-room--live': isLiveMode,
          'live-room--replay': isReplay,
          'live-portrait--live': isLiveMode,
          'live-portrait--replay': isReplay,
        }"
      >
        <view v-if="showReplayFirstVideoLoading" class="replay-first-loading">
          <view class="replay-first-loading__image">
            <text class="replay-first-loading__dot"></text>
          </view>
        </view>
        <live-player
          v-if="useLivePlayer && playerUrl"
          id="broadcastLivePlayer"
          class="live-video"
          :src="playerUrl"
          mode="live"
          autoplay
          :muted="muted"
          :controls="false"
          object-fit="fillCrop"
          picture-in-picture-mode="push,pop"
          @statechange="onLiveStateChange"
          @netstatus="onNetStatus"
          @error="onLivePlayerError"
          @fullscreenchange="onFullscreenChange"
        />
        <video
          v-else-if="playerUrl"
          id="broadcastVideoPlayer"
          class="live-video replay-video"
          :class="{ 'live-video--replay': isReplay }"
          :src="playerUrl"
          autoplay
          :muted="muted"
          :controls="isReplay"
          :initial-time="replayInitialTime"
          object-fit="cover"
          :show-center-play-btn="true"
          :show-fullscreen-btn="isReplay"
          :enable-progress-gesture="true"
          picture-in-picture-mode="push,pop"
          @play="markPlaybackReady"
          @loadedmetadata="markPlaybackReady"
          @timeupdate="onVideoTimeUpdate"
          @ended="onVideoEnded"
          @error="onVideoError"
        />
        <view v-else-if="coverImage" class="live-video live-video--poster">
          <image class="live-video-poster-img" :src="coverImage" mode="aspectFill" />
        </view>
        <view v-else class="live-video live-video--poster empty-cover">
          <text>暂无可播放内容</text>
        </view>
        <view
          v-if="shouldRenderPortraitReplayPoster"
          class="live-video live-video--replay-poster"
          :class="{ 'live-video--replay-poster-hidden': replayPosterHidden }"
        >
          <image class="live-video-replay-poster-img" :src="replayCoverPoster" mode="aspectFill" />
        </view>

        <view class="screen-tap-effects"></view>

        <view v-if="shouldShowMarquee" class="live-marquee-ad" :class="marqueePositionClass">
          <view class="live-marquee-ad__track" :style="marqueeTrackStyle" @tap.stop>
            <text class="live-marquee-ad__text">{{ marqueeText }}</text>
            <view class="live-marquee-ad__close" @tap.stop="dismissMarquee">
              <view class="live-marquee-ad__close-line live-marquee-ad__close-line--a"></view>
              <view class="live-marquee-ad__close-line live-marquee-ad__close-line--b"></view>
            </view>
          </view>
        </view>

        <view v-if="showExternalLotteryTools" class="external-lottery-tools" @tap.stop>
          <view v-if="showCommentLotteryEntry" class="external-lottery-tools__comment">
            <view v-if="commentLotteryBubbleVisible" class="external-lottery-tools__bubble" @tap.stop="handleMarketingAction('lottery')">
              <text class="external-lottery-tools__bubble-text">
                发送评论“<text class="external-lottery-tools__keyword">{{ commentLotteryKeyword }}</text>”可参与抽大奖
              </text>
              <text class="external-lottery-tools__bubble-close" @tap.stop="hideCommentLotteryBubble">x</text>
            </view>
            <view class="external-lottery-tools__comment-entry" @tap.stop="handleMarketingAction('lottery')">
              <text class="external-lottery-tools__comment-icon">奖</text>
            </view>
          </view>
          <view v-if="showWatchRewardEntry" class="external-lottery-tools__lucky-bag" @tap.stop="handleMarketingAction('reward')">
            <text class="external-lottery-tools__comment-icon">福</text>
            <text class="external-lottery-tools__entry-label">{{ watchRewardEntryLabel }}</text>
          </view>
        </view>

        <view v-if="showBuyingNotice" class="buying-notice">
          <text class="buying-notice__text">{{ buyingNoticeText }}</text>
        </view>

        <view v-if="marketingNoticeText" class="marketing-notice">
          <text class="marketing-notice__text">{{ marketingNoticeText }}</text>
        </view>

        <view v-if="showPlaybackDebug" class="live-playback-debug-float">
          <text class="live-playback-debug-float__line">url: {{ playerUrl ? 'ready' : 'empty' }}</text>
          <text class="live-playback-debug-float__line">source: {{ activeLiveCandidate.type || activePlaybackComponent }}</text>
          <text class="live-playback-debug-float__line">socket: {{ socketState }}</text>
          <text class="live-playback-debug-float__line">replay: {{ replayLastTime }}s</text>
        </view>

        <view class="anchor-row">
          <view class="anchor-left">
            <view class="anchor-info" :class="{ 'anchor-info--hidden': !anchorName }">
              <view class="anchor-avatar-wrap">
                <image class="anchor-avatar" :src="anchorAvatar || defaultAvatar" mode="aspectFill" />
              </view>
              <view class="anchor-meta">
                <text class="anchor-name">{{ anchorName }}</text>
                <text class="anchor-likes">{{ anchorSubText }}</text>
              </view>
            </view>
            <view v-if="!isReplay" class="live-status-badge live-status-badge--inline" :class="liveStatusClass">
              <view v-if="isLivePushing" class="live-status-dot"></view>
              <text class="live-status-text">{{ liveStatusLabel }}</text>
            </view>
          </view>
          <view class="viewer-area">
            <view class="viewer-badge">
              <image class="viewer-icon" src="/static/icons/eye.png" mode="aspectFit" />
              <text class="viewer-num">{{ displayViewerCount }}</text>
            </view>
            <view class="report-btn" @tap="goReport">
              <image class="report-icon" src="/static/icons/tousu2.png" mode="aspectFit" />
              <text class="report-text">投诉</text>
            </view>
          </view>
        </view>

        <view v-if="noticeText" class="pinned-bar pinned-bar--inline notice-bar">
          <view class="pinned-bar__bubble">
            <text class="pinned-bar__nick">公告：</text>
            <text class="pinned-bar__content">{{ noticeText }}</text>
          </view>
        </view>

        <view v-if="pinnedMessage" class="pinned-bar pinned-bar--inline">
          <view class="pinned-bar__bubble">
            <text class="pinned-bar__nick">{{ pinnedMessage.nick }}：</text>
            <text class="pinned-bar__content">{{ pinnedMessage.content }}</text>
          </view>
          <text class="pinned-bar__tag">置顶</text>
        </view>

        <scroll-view
          v-if="shouldShowComments"
          class="chat-area"
          scroll-y
          :scroll-into-view="scrollToId"
          :scroll-with-animation="true"
        >
          <view class="chat-bubble system-bubble">
            <text class="chat-content">平台官方倡导文明直播，诚信交易，将会对内容进行24小时的在线巡查，任何传播违法、违规、低俗、暴力等不良信息将会封停账号。</text>
          </view>
          <view
            v-for="msg in visibleMessages"
            :id="`msg-${msg.id}`"
            :key="msg.id"
            class="chat-bubble"
            :class="{
              'system-bubble': msg.type === 'system',
              'enter-bubble': msg.type === 'enter' || msg.type === 'leave',
            }"
          >
            <text v-if="msg.type === 'system'" class="system-text">{{ msg.content }}</text>
            <text v-else-if="msg.type === 'enter' || msg.type === 'leave'" class="enter-text">{{ msg.content }}</text>
            <template v-else>
              <text v-if="msg.isAdmin" class="admin-tag">管理员</text>
              <text class="chat-nick">{{ msg.nick }}：</text>
              <text class="chat-content">{{ msg.content }}</text>
            </template>
          </view>
        </scroll-view>

        <view v-if="currentProductName" class="product-area">
          <view class="product-card-mini" @tap="openProduct(currentProduct)">
            <view class="product-card-cover-wrap">
              <image v-if="currentProductImage" class="product-card-cover" :src="currentProductImage" mode="aspectFill" />
              <view v-else class="product-card-cover product-card-cover--empty"></view>
              <text class="product-card-tag">讲解中</text>
            </view>
            <view class="product-card-body">
              <text class="product-card-title">{{ currentProductName }}</text>
              <text class="product-card-price">¥{{ formatProductPrice(currentProduct) }}</text>
            </view>
            <view class="product-card-buy">去购买</view>
          </view>
        </view>

        <view v-if="chatDisabled" class="mute-tip-bar">
          <text class="mute-tip-text">当前不可评论</text>
        </view>

        <view class="bottom-bar bottom-bar--portrait" :class="{ 'bottom-bar--focused': inputFocused }">
          <view class="bottom-bar-main">
            <scroll-view
              v-if="quickReplies.length && !inputFocused && !chatDisabled"
              class="quick-replies-bar"
              scroll-x
              :show-scrollbar="false"
            >
              <view class="quick-replies-inner">
                <view
                  v-for="item in quickReplies"
                  :key="item.id"
                  class="quick-reply-tag"
                  @tap="useQuickReply(item.content)"
                >
                  <text class="quick-reply-text">{{ item.label }}</text>
                </view>
              </view>
            </scroll-view>
            <view class="bottom-bar-input-row">
              <view
                v-if="roomSetting.showProduct !== 0"
                class="goods-box goods-box-left product-cart-btn"
                @tap="toggleProducts"
              >
                <text class="goodsNumber">{{ productTotalText }}</text>
              </view>
              <view class="input-wrap" :class="{ 'input-disabled': chatDisabled }" @tap="focusCommentInput">
                <input
                  class="msg-input"
                  v-model="inputText"
                  confirm-type="send"
                  :disabled="chatDisabled"
                  :placeholder="chatDisabled ? '当前不可评论' : '说点什么吧~'"
                  placeholder-style="color:rgba(255,255,255,0.72);"
                  :adjust-position="false"
                  @focus="inputFocused = true"
                  @blur="inputFocused = false"
                  @confirm="sendComment"
                />
              </view>
              <view v-if="inputFocused" class="send-btn" @tap="sendComment">发送</view>
              <view v-else class="toolbar-icons">
                <view class="tool-btn" @tap="goCenter">
                  <image class="tool-icon-img" src="/static/icons/center.png" mode="aspectFit" />
                </view>
                <view class="tool-btn" @tap="toggleProducts">
                  <image class="tool-icon-img" src="/static/icons/cart.png" mode="aspectFit" />
                </view>
                <view class="tool-btn" @tap="openShare">
                  <text class="tool-text">分享</text>
                </view>
                <view class="like-btn-wrap">
                  <view class="tool-btn tool-btn-like" @tap="sendLikeTap">
                    <image class="tool-icon-img" src="/static/icons/zan/zan_1.png" mode="aspectFit" />
                    <text class="like-number zanval">{{ likeCountText }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-if="showEntryOverlay" class="entry-overlay-content" @tap="enterLiveByGesture">
          <view class="entry-btn">
            <view class="bars-anim">
              <view class="bar bar1"></view>
              <view class="bar bar2"></view>
              <view class="bar bar3"></view>
            </view>
            <text class="entry-btn-text">点击进入直播间</text>
          </view>
        </view>

        <view v-if="showEndedOverlay" class="live-ended-overlay live-ended-overlay--portrait">
          <view class="live-ended-content">
            <text class="live-ended-title">{{ endedOverlayTitle }}</text>
            <text class="live-ended-views">{{ displayViewerCount }}人看过</text>
            <view class="live-ended-avatar-wrap">
              <image class="live-ended-avatar" :src="anchorAvatar || defaultAvatar" mode="aspectFill" />
            </view>
            <text class="live-ended-name">{{ anchorName || '主播' }}</text>
          </view>
        </view>
      </view>

      <view
        v-else
        class="live-page live-landscape"
        :class="{
          'no-bottom': activeTab === 'products',
          'live-room--live': isLiveMode,
          'live-room--replay': isReplay,
          'live-landscape--live': isLiveLandscapeStyle,
          'live-landscape--replay': !isLiveLandscapeStyle,
          'live-landscape--stage-collapsed': stageCollapsed,
        }"
      >
        <view
          class="video-section"
          :class="{
            'video-section--playing': !!playerUrl,
            'video-section--mini-hidden': miniHidden && stageCollapsed,
          }"
        >
          <live-player
            v-if="useLivePlayer && playerUrl"
            id="broadcastLivePlayer"
            class="replay-video"
            :src="playerUrl"
            mode="live"
            autoplay
            :muted="muted"
            :controls="false"
            object-fit="contain"
            picture-in-picture-mode="push,pop"
            @statechange="onLiveStateChange"
            @netstatus="onNetStatus"
            @error="onLivePlayerError"
            @fullscreenchange="onFullscreenChange"
          />
          <video
            v-else-if="playerUrl"
            id="broadcastVideoPlayer"
            class="replay-video"
            :src="playerUrl"
            autoplay
            :muted="muted"
            :controls="isReplay"
            :initial-time="replayInitialTime"
            object-fit="contain"
            :show-center-play-btn="true"
            :show-fullscreen-btn="true"
            :enable-progress-gesture="true"
            picture-in-picture-mode="push,pop"
            @play="markPlaybackReady"
            @loadedmetadata="markPlaybackReady"
            @timeupdate="onVideoTimeUpdate"
            @ended="onVideoEnded"
            @error="onVideoError"
          />
          <view v-else-if="coverImage" class="replay-video replay-video--poster">
            <image class="replay-video-poster-img" :src="coverImage" mode="aspectFill" />
          </view>
          <view v-else class="replay-video replay-video--poster empty-cover">
            <text>暂无可播放内容</text>
          </view>
          <view
            v-if="shouldRenderLandscapePoster"
            class="replay-video replay-video--poster"
            :class="{ 'replay-video--poster-hidden': replayPosterHidden }"
          >
            <image class="replay-video-poster-img" :src="landscapePoster" mode="aspectFill" />
          </view>
          <view v-if="showLiveLandscapePreview" class="live-landscape-preview">
            <image class="live-landscape-preview__cover" :src="landscapePoster" mode="aspectFill" />
          </view>
          <view
            v-if="isLiveLandscapeStyle && watchRewardTasks.length"
            class="live-landscape-reward"
            @tap="handleMarketingAction('reward')"
          >
            <view class="live-landscape-reward__image">
              <text class="live-landscape-reward__mark">R</text>
            </view>
            <text class="live-landscape-reward__text">领取</text>
          </view>

          <view class="video-controls">
            <view class="video-controls__left">
              <view v-if="isLivePushing" class="video-controls__live-tag">
                <view class="video-controls__live-dot"></view>
                <text class="video-controls__live-text">直播</text>
              </view>
            </view>
            <view class="video-controls__right">
              <view class="video-controls__btn" @tap="toggleMute">
                <text class="video-controls__text">{{ muted ? '开声' : '静音' }}</text>
              </view>
              <view v-if="isLiveLandscapeStyle" class="video-controls__btn live-landscape-collapse" @tap="toggleCollapse">
                <text
                  class="live-landscape-collapse__image"
                  :class="{ 'live-landscape-collapse__image--flipped': stageCollapsed }"
                >^</text>
              </view>
            </view>
          </view>
          <view v-if="stageCollapsed" class="video-mini-controls" @tap.stop>
            <text class="video-mini-controls__close" @tap.stop="closeMiniWindow">x</text>
            <view class="video-mini-controls__mute" @tap.stop="toggleMute">
              <text class="video-mini-controls__icon">{{ muted ? 'M' : 'S' }}</text>
            </view>
          </view>

          <view v-if="showEntryOverlay" class="entry-overlay-content entry-overlay-content--landscape" @tap="enterLiveByGesture">
            <view class="entry-btn">
              <view class="bars-anim">
                <view class="bar bar1"></view>
                <view class="bar bar2"></view>
                <view class="bar bar3"></view>
              </view>
              <text class="entry-btn-text">点击进入直播间</text>
            </view>
          </view>

          <view v-if="showEndedOverlay" class="live-ended-overlay">
            <view class="live-ended-content">
              <text class="live-ended-title">{{ endedOverlayTitle }}</text>
              <text class="live-ended-views">{{ displayViewerCount }}人看过</text>
              <view class="live-ended-avatar-wrap">
                <image class="live-ended-avatar" :src="anchorAvatar || defaultAvatar" mode="aspectFill" />
              </view>
              <text class="live-ended-name">{{ anchorName || '主播' }}</text>
            </view>
          </view>
        </view>

        <view v-show="!stageCollapsed" class="video-top">
          <view class="anchor-left">
            <view class="anchor-info" :class="{ 'anchor-info--hidden': !anchorName }">
              <view class="anchor-avatar-wrap">
                <image class="anchor-avatar" :src="anchorAvatar || defaultAvatar" mode="aspectFill" />
              </view>
              <view class="anchor-meta">
                <text class="anchor-name">{{ anchorName }}</text>
                <text class="anchor-likes">{{ displayViewerCount }}</text>
              </view>
            </view>
            <view v-if="!isReplay" class="live-status-badge live-status-badge--inline" :class="liveStatusClass">
              <view v-if="isLivePushing" class="live-status-dot"></view>
              <text class="live-status-text">{{ liveStatusLabel }}</text>
            </view>
          </view>
          <view class="live-landscape-tool-group">
            <view class="live-landscape-report" @tap="goReport">
              <text class="live-landscape-report__text">投诉</text>
            </view>
            <view class="live-landscape-round-tool live-landscape-round-tool--ghost" @tap="goCenter">
              <text class="live-landscape-round-tool__text">我的</text>
            </view>
            <view class="live-landscape-fire-count">
              <image class="live-landscape-fire-count__icon" src="/static/icons/eye.png" mode="aspectFit" />
              <text class="live-landscape-fire-count__text">{{ displayViewerCount }}</text>
            </view>
          </view>
        </view>

        <view class="interact-section">
          <view v-if="stageCollapsed" class="live-landscape-collapsed-header" @tap.stop>
            <view class="live-landscape-collapsed-header__left">
              <image class="live-landscape-collapsed-header__fire" src="/static/icons/eye.png" mode="aspectFit" />
              <text class="live-landscape-collapsed-header__count">{{ displayViewerCount }}</text>
            </view>
            <view class="live-landscape-collapsed-header__restore" @tap.stop="toggleCollapse">
              <text
                class="live-landscape-collapse__image live-landscape-collapse__image--flipped"
              >^</text>
            </view>
          </view>
          <view v-if="shouldShowMarquee" class="live-marquee-ad live-marquee-ad--landscape">
            <view class="live-marquee-ad__track" :style="marqueeTrackStyle" @tap.stop>
              <text class="live-marquee-ad__text">{{ marqueeText }}</text>
              <view class="live-marquee-ad__close" @tap.stop="dismissMarquee">
                <view class="live-marquee-ad__close-line live-marquee-ad__close-line--a"></view>
                <view class="live-marquee-ad__close-line live-marquee-ad__close-line--b"></view>
              </view>
            </view>
          </view>
          <view class="landscape-tab-bar">
            <view
              class="landscape-tab"
              :class="{ active: activeTab === 'interact' }"
              @tap="setActiveTab('interact')"
            >
              <text>{{ landscapeInteractTitle }}</text>
            </view>
            <view
              v-if="signState.enabled"
              class="landscape-tab"
              :class="{ active: activeTab === 'sign' }"
              @tap="setActiveTab('sign')"
            >
              <text>签到</text>
            </view>
            <view
              class="landscape-tab"
              :class="{ active: activeTab === 'products' }"
              @tap="setActiveTab('products')"
            >
              <text>{{ landscapeProductTitle }}{{ productTotal ? `(${productTotal})` : '' }}</text>
            </view>
          </view>

          <view v-show="activeTab === 'interact'" class="interact-content">
            <view v-if="noticeText" class="comment-item comment-item--pinned">
              <view class="comment-body">
                <view class="comment-bubble">
                  <text class="comment-content">公告：{{ noticeText }}</text>
                </view>
              </view>
            </view>
            <view v-if="pinnedMessage" class="comment-item comment-item--pinned">
              <image class="comment-avatar" :src="pinnedMessage.avatar || defaultAvatar" mode="aspectFill" />
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
              scroll-y
              :scroll-into-view="scrollToId"
              :scroll-with-animation="true"
            >
              <view
                v-for="msg in visibleMessages"
                :id="`msg-${msg.id}`"
                :key="msg.id"
                class="comment-item"
              >
                <image class="comment-avatar" :src="msg.avatar || defaultAvatar" mode="aspectFill" />
                <view class="comment-body">
                  <view class="comment-nick-row">
                    <text v-if="msg.isAdmin" class="admin-tag">管理员</text>
                    <text class="comment-nick">{{ msg.nick }}</text>
                  </view>
                  <view class="comment-bubble" :class="{ 'gift-bubble': msg.type === 'system' }">
                    <text class="comment-content">{{ msg.content }}</text>
                  </view>
                </view>
              </view>
            </scroll-view>
          </view>

          <view v-show="activeTab === 'products'" class="products-content">
            <scroll-view scroll-y class="landscape-products-scroll">
              <view v-if="productsLoading" class="sheet-empty">商品加载中...</view>
              <view v-else-if="!products.length" class="sheet-empty">暂无商品</view>
              <view
                v-for="item in products"
                :key="item.id || item.productId"
                class="goods-list-item"
                @tap="openProduct(item)"
              >
                <image class="goods-list-image" :src="productImage(item)" mode="aspectFill" />
                <view class="goods-list-info">
                  <text class="goods-list-name">{{ productName(item) }}</text>
                  <text class="goods-list-price">¥{{ formatProductPrice(item) }}</text>
                </view>
                <view class="goods-list-buy">去购买</view>
              </view>
            </scroll-view>
          </view>

          <view v-show="activeTab === 'sign'" class="sign-content">
            <text class="marketing-title">{{ signState.signed ? '今日已签到' : '直播签到' }}</text>
            <text class="marketing-desc">{{ signWelcomeText }}</text>
            <button class="marketing-btn" :disabled="signState.signed || marketingLoading" @tap="submitLiveSign">
              {{ signState.signed ? '已完成' : '立即签到' }}
            </button>
          </view>
        </view>

        <view v-if="chatDisabled && activeTab === 'interact'" class="mute-tip-bar">
          <text class="mute-tip-text">当前不可评论</text>
        </view>

        <view
          v-if="currentProductName && activeTab === 'interact'"
          class="landscape-product-anchor"
          @tap="openProduct(currentProduct)"
        >
          <view class="product-card-mini product-card-mini--landscape">
            <image v-if="currentProductImage" class="product-card-cover" :src="currentProductImage" mode="aspectFill" />
            <view class="product-card-body">
              <text class="product-card-title">{{ currentProductName }}</text>
              <text class="product-card-price">¥{{ formatProductPrice(currentProduct) }}</text>
            </view>
            <view class="product-card-buy">购买</view>
          </view>
        </view>

        <view
          v-if="activeTab === 'interact'"
          class="bottom-bar bottom-bar--landscape"
          :class="{ 'bottom-bar--focused': inputFocused }"
        >
          <view class="bottom-bar-main">
            <scroll-view
              v-if="quickReplies.length && !inputFocused && !chatDisabled"
              class="quick-replies-bar quick-replies-bar--landscape"
              scroll-x
              :show-scrollbar="false"
            >
              <view class="quick-replies-inner">
                <view
                  v-for="item in quickReplies"
                  :key="item.id"
                  class="quick-reply-tag quick-reply-tag--landscape"
                  @tap="useQuickReply(item.content)"
                >
                  <text class="quick-reply-text">{{ item.label }}</text>
                </view>
              </view>
            </scroll-view>
            <view class="bottom-bar-input-row">
              <view class="input-wrap" :class="{ 'input-disabled': chatDisabled }" @tap="focusCommentInput">
                <input
                  class="msg-input"
                  v-model="inputText"
                  confirm-type="send"
                  :disabled="chatDisabled"
                  :placeholder="chatDisabled ? '当前不可评论' : '说点什么吧~'"
                  placeholder-style="color:#9a9a9a;"
                  :adjust-position="false"
                  @focus="inputFocused = true"
                  @blur="inputFocused = false"
                  @confirm="sendComment"
                />
              </view>
              <view v-if="inputFocused" class="send-btn" @tap="sendComment">发送</view>
              <view v-else class="toolbar-icons">
                <view class="tool-btn" @tap="openShare"><text class="tool-text dark">分享</text></view>
                <view class="like-btn-wrap">
                  <view class="tool-btn tool-btn-like" @tap="sendLikeTap">
                    <image class="tool-icon-img" src="/static/icons/zan/zan_1.png" mode="aspectFit" />
                    <text class="like-number zanval">{{ likeCountText }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-if="showReplayList && !viewerLimitReached && !accessDenied" class="replay-list">
        <scroll-view scroll-x class="replay-scroll">
          <view
            v-for="(item, index) in replayVideos"
            :key="item.id || item.videoId || index"
            class="replay-item"
            :class="{ active: index === replayIndex }"
            @tap="playReplay(index)"
          >
            <text>{{ item.videoName || item.name || `第${index + 1}节` }}</text>
          </view>
        </scroll-view>
      </view>

      <view v-if="showProducts && !viewerLimitReached && !accessDenied" class="sheet-mask" @tap="toggleProducts">
        <view class="product-list-mask" @tap="toggleProducts">
          <view class="product-list-popup goods-list-box" @tap.stop>
            <view class="popup-header">全部宝贝（{{ productTotal }}）</view>
            <scroll-view scroll-y class="goods-all-box product-list">
              <view v-if="productsLoading" class="sheet-empty">商品加载中...</view>
              <view v-else-if="!products.length" class="sheet-empty">暂无商品</view>
              <view
                v-for="item in products"
                :key="item.id || item.productId"
                class="goods-list-item"
                @tap="openProduct(item)"
              >
                <image class="goods-list-image" :src="productImage(item)" mode="aspectFill" />
                <view class="goods-list-info">
                  <text class="goods-list-name">{{ productName(item) }}</text>
                  <text class="goods-list-price">¥{{ formatProductPrice(item) }}</text>
                </view>
                <view class="goods-list-buy">去购买</view>
              </view>
            </scroll-view>
          </view>
        </view>
      </view>

      <view v-if="!viewerLimitReached && !accessDenied && (marketingActions.length || isReplay)" class="marketing-float-actions" :class="{ 'marketing-float-actions--landscape': isLandscape }">
        <view
          v-for="action in marketingActions"
          :key="action.type"
          class="marketing-float-btn"
          @tap="handleMarketingAction(action.type)"
        >
          <text>{{ action.label }}</text>
        </view>
        <view v-if="isReplay" class="marketing-float-btn" @tap="returnToLive">
          <text>回直播</text>
        </view>
      </view>

      <view v-if="showMarketingPanel && !viewerLimitReached && !accessDenied" class="sheet-mask" @tap="closeMarketingPanel">
        <view class="marketing-sheet" @tap.stop>
          <view class="sheet-head">
            <text class="sheet-title">{{ marketingPanelTitle }}</text>
            <text class="sheet-close" @tap="closeMarketingPanel">关闭</text>
          </view>
          <view v-if="marketingPanelType === 'sign'" class="marketing-content">
            <text class="marketing-title">{{ signState.signed ? '今日已签到' : '直播签到' }}</text>
            <text class="marketing-desc">{{ signWelcomeText }}</text>
            <button class="marketing-btn" :disabled="signState.signed || marketingLoading" @tap="submitLiveSign">
              {{ signState.signed ? '已完成' : '立即签到' }}
            </button>
          </view>
          <scroll-view v-else scroll-y class="marketing-list">
            <view v-if="!activeMarketingItems.length" class="sheet-empty">暂无可参与活动</view>
            <view v-for="item in activeMarketingItems" :key="item.key" class="marketing-item">
              <view class="marketing-info">
                <text class="marketing-title">{{ item.name }}</text>
                <text class="marketing-desc">{{ item.desc }}</text>
              </view>
              <button class="marketing-btn" @tap="handleMarketingItem(item)">参与</button>
            </view>
          </scroll-view>
        </view>
      </view>
    </template>
  </view>
</template>

<script>
import { getH5ApiBaseUrl } from '../../api/h5.js'
import {
  checkSigned,
  claimCommentReward,
  claimWatchReward,
  enterLiveRoom,
  getCurrentProduct,
  getCommentLotteryList,
  getCommentHistory,
  getLotteryParticipants,
  getLiveDetail,
  getLiveProducts,
  getLiveStatus,
  getLiveStreamInf,
  getReplayFirstVideo,
  getReplaySimMessages,
  getWsSignKey,
  leaveLiveRoom,
  liveHeartbeat,
  reportViewProgress,
  sendBuyReminder,
  sendLike,
  sendLiveComment,
  submitSign,
} from '../../api/h5-live.js'
import { MiniLiveSocket } from '../../utils/mini-live-socket.js'
import {
  buildBroadcastEntryUrl,
  getBestLiveUrl,
  getBestReplayUrl,
  getMiniProgramLiveCandidates,
  isLivePlayerSource,
  isReplayEntry,
  normalizeLiveRouteOptions,
  normalizeRoomDetail,
} from '../../utils/live-route.js'
import { saveLiveRoomContext } from '../../utils/live-room-context.js'
import { ensureH5Authenticated } from '../../services/h5-auth-context.js'
import { createReplayProductScheduleController, normalizeScheduleNodes } from './useReplayProductSchedule.js'

function uniqueId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

const REPLAY_SIM_WINDOW_SIZE = 20
const REPLAY_SIM_PRELOAD_LEAD_SECONDS = 5
const LIVE_PLAYER_FAILURE_CODES = [-2301, -2302, -2303, -2304, -2305]
const LIVE_PLAYER_READY_CODES = [2004]

function replaySimSecond(item = {}) {
  const value = Number(
    item.triggerAtSec ??
      item.trigger_at_sec ??
      item.timelineSeconds ??
      item.timeline_seconds ??
      item.second ??
      item.time ??
      0,
  )
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
}

function replaySimWindowStart(second = 0) {
  const value = Math.max(0, Math.floor(Number(second) || 0))
  return Math.floor(value / REPLAY_SIM_WINDOW_SIZE) * REPLAY_SIM_WINDOW_SIZE
}

function replaySimMessageKey(item = {}, videoId = 0, fallback = 0) {
  return String(
    item.id ||
      item.msgId ||
      item.messageId ||
      `${videoId}-${replaySimSecond(item)}-${item.content || item.message || item.text || fallback}`,
  )
}

function truncateQuickReply(text = '') {
  const chars = [...String(text || '')]
  return chars.length > 6 ? `${chars.slice(0, 6).join('')}...` : chars.join('')
}

function normalizeQuickReplies(source = []) {
  const list = Array.isArray(source)
    ? source
    : typeof source === 'string'
      ? source.split(/[,\n]/)
      : Array.isArray(source?.list)
        ? source.list
        : []
  return list
    .map((item, index) => {
      const content = String(item?.content || item?.text || item?.value || item || '').trim()
      if (!content) return null
      return {
        id: item?.id || item?.replyId || `quick-${index}-${content}`,
        content,
        label: truncateQuickReply(content),
      }
    })
    .filter(Boolean)
}

function extractErrorPayload(error = {}) {
  if (!error || typeof error !== 'object') return {}
  return error.data && typeof error.data === 'object' ? error.data : error
}

export default {
  data() {
    return {
      options: {},
      loading: true,
      errorText: '',
      detail: {},
      playerUrl: '',
      liveCandidates: [],
      liveCandidateIndex: 0,
      liveStreamInfo: {},
      replayVideos: [],
      replayIndex: 0,
      replayInitialTime: 0,
      replayLastTime: 0,
      showReplayFirstVideoLoading: false,
      playbackFrameReady: false,
      replayPosterFadeReady: false,
      isReplay: false,
      isLandscape: false,
      stageCollapsed: false,
      miniHidden: false,
      muted: true,
      fullscreen: false,
      messages: [],
      scrollToId: '',
      inputText: '',
      inputFocused: false,
      activeTab: 'interact',
      chatDisabled: false,
      likeCount: 0,
      viewerCount: 0,
      products: [],
      productsLoading: false,
      showProducts: false,
      currentProduct: null,
      showMarketingPanel: false,
      marketingPanelType: '',
      marketingLoading: false,
      signState: {
        enabled: false,
        signed: false,
        fields: [],
        welcomeText: '',
      },
      watchRewardTasks: [],
      normalLotteryActivities: [],
      commentLotteryActivities: [],
      socket: null,
      socketState: 'idle',
      sessionId: '',
      enteredAt: 0,
      heartbeatTimer: null,
      lastProgressReportAt: 0,
      lastProgressReportedSecond: 0,
      replaySimLoadedUntil: 0,
      replaySimVideoId: 0,
      replaySimTimeline: [],
      replaySimCursor: 0,
      replaySimLoading: false,
      replaySimSeen: {},
      replayProductSchedule: createReplayProductScheduleController(),
      scheduleExplainActiveId: 0,
      watchSeconds: 0,
      showEntryOverlay: true,
      accessDenied: false,
      accessDeniedReason: '',
      viewerLimitReached: false,
      viewerLimitText: '观看人数已达上限',
      liveEnded: false,
      liveEndedReason: '',
      marqueeDismissed: false,
      commentLotteryBubbleVisible: true,
      buyingNoticeText: '',
      buyingNoticeTimer: null,
      marketingNoticeText: '',
      marketingNoticeTimer: null,
      defaultAvatar: '/static/login-default.png',
    }
  },
  computed: {
    roomId() {
      return this.detail.id || this.options.liveId || this.options.roomId || ''
    },
    roomCode() {
      return this.detail.roomCode || this.options.roomCode || ''
    },
    roomName() {
      return this.detail.roomName || '直播间'
    },
    coverImage() {
      return this.detail.coverImage || ''
    },
    anchorName() {
      return this.detail.anchorName || '官方直播间'
    },
    anchorAvatar() {
      return this.detail.anchorAvatar || ''
    },
    noticeText() {
      return this.detail.notice || ''
    },
    currentProductName() {
      const item = this.currentProduct || {}
      return item.name || item.productName || item.product_name || ''
    },
    currentProductImage() {
      const item = this.currentProduct || {}
      return item.image || item.productImage || item.product_image || ''
    },
    isLiveMode() {
      return !this.isReplay
    },
    isLiveLandscapeStyle() {
      return this.isLandscape && this.isLiveMode
    },
    currentReplayVideo() {
      return this.replayVideos[this.replayIndex] || {}
    },
    replayCoverPoster() {
      const video = this.currentReplayVideo || {}
      return (
        video.cover ||
        video.coverImage ||
        video.cover_image ||
        video.image ||
        video.poster ||
        video.videoCover ||
        video.video_cover ||
        this.detail.replayCover ||
        this.detail.replay_cover ||
        this.coverImage ||
        ''
      )
    },
    landscapePoster() {
      return this.isReplay ? this.replayCoverPoster : (this.coverImage || this.detail.liveCover || '')
    },
    shouldRenderPortraitReplayPoster() {
      return !this.isLandscape && this.isReplay && !!this.playerUrl && !!this.replayCoverPoster
    },
    shouldRenderLandscapePoster() {
      return this.isLandscape && !!this.playerUrl && !!this.landscapePoster && (this.isReplay || !this.playbackFrameReady)
    },
    showLiveLandscapePreview() {
      return this.isLiveLandscapeStyle && !!this.landscapePoster && !this.playbackFrameReady
    },
    replayPosterHidden() {
      return !!this.replayPosterFadeReady
    },
    landscapeInteractTitle() {
      return this.isLiveLandscapeStyle ? '互动' : '直播互动'
    },
    landscapeProductTitle() {
      return this.isLiveLandscapeStyle ? '商品' : '商品列表'
    },
    roomSetting() {
      return this.detail.setting || {}
    },
    quickReplies() {
      return normalizeQuickReplies(
        this.detail.quickReplies ||
          this.detail.quickReplyList ||
          this.detail.quick_reply_list ||
          this.roomSetting.quickReplies ||
          this.roomSetting.quickReplyList ||
          this.roomSetting.quickReply ||
          [],
      )
    },
    accessDeniedTitle() {
      return this.accessDeniedReason || this.detail.accessDeniedTitle || this.roomName || '暂无观看权限'
    },
    accessDeniedAvatar() {
      return this.detail.customerAvatar || this.detail.userAvatar || this.anchorAvatar || this.defaultAvatar
    },
    accessDeniedUserName() {
      return this.detail.customerName || this.detail.userName || this.anchorName || '用户'
    },
    accessDeniedUidText() {
      const uid = this.detail.unionId || this.detail.unionID || this.detail.uid || this.detail.userId || '--'
      return `UID:${uid || '--'}`
    },
    showEndedOverlay() {
      if (this.isReplay || this.accessDenied || this.viewerLimitReached) return false
      return this.liveEnded || Number(this.detail.pushStatus ?? this.detail.live_status ?? 0) === 2
    },
    endedOverlayTitle() {
      return this.liveEndedReason || '直播已结束'
    },
    marqueeText() {
      return String(this.roomSetting.marqueeText || this.detail.marqueeText || '').trim()
    },
    shouldShowMarquee() {
      return Number(this.roomSetting.marqueeEnabled ?? this.detail.marqueeEnabled ?? 0) === 1 && !!this.marqueeText && !this.marqueeDismissed
    },
    marqueePositionClass() {
      const position = Number(this.roomSetting.marqueePosition ?? this.detail.marqueePosition ?? 1)
      if (position === 2) return 'live-marquee-ad--middle'
      if (position === 3) return 'live-marquee-ad--bottom'
      return 'live-marquee-ad--top'
    },
    marqueeTrackStyle() {
      return {
        color: this.roomSetting.marqueeTextColor || this.detail.marqueeTextColor || 'rgba(255,255,255,1)',
        backgroundColor: this.roomSetting.marqueeBgColor || this.detail.marqueeBgColor || 'rgba(240,74,98,.7)',
      }
    },
    commentLotteryKeyword() {
      const activity = this.commentLotteryActivities[0] || {}
      return activity.keyword || activity.password || activity.passwordText || activity.displayPasswordText || '发送指定评论'
    },
    showCommentLotteryEntry() {
      return this.commentLotteryActivities.length > 0
    },
    showWatchRewardEntry() {
      return this.watchRewardTasks.length > 0
    },
    showExternalLotteryTools() {
      return !this.isLandscape && (this.showCommentLotteryEntry || this.showWatchRewardEntry)
    },
    watchRewardEntryLabel() {
      const task = this.watchRewardTasks[0] || {}
      return task.entryLabel || task.watchRewardLabel || task.label || '领取'
    },
    showBuyingNotice() {
      return !!this.buyingNoticeText
    },
    showPlaybackDebug() {
      return String(this.options.debug || this.options.liveDebug || this.detail.debug || '') === '1'
    },
    activeLiveCandidate() {
      return this.liveCandidates[this.liveCandidateIndex] || {}
    },
    activePlaybackComponent() {
      if (this.isReplay) return 'video'
      if (this.activeLiveCandidate.component) return this.activeLiveCandidate.component
      return isLivePlayerSource(this.playerUrl) ? 'live-player' : 'video'
    },
    useLivePlayer() {
      return this.isLiveMode && this.activePlaybackComponent === 'live-player'
    },
    isLivePushing() {
      return Number(this.detail.pushStatus ?? this.detail.live_status ?? 0) === 1
    },
    liveStatusLabel() {
      if (this.isReplay) return '回放'
      if (this.isLivePushing) return '直播'
      const statusText = this.detail.liveStatusText || this.detail.statusText || this.detail.live_status_text || ''
      return statusText || '未开播'
    },
    liveStatusClass() {
      return this.isLivePushing ? 'live-status-badge--live' : 'live-status-badge--waiting'
    },
    anchorSubText() {
      return `${this.displayViewerCount}观看`
    },
    displayViewerCount() {
      return Number(this.viewerCount || 0)
    },
    likeCountText() {
      const count = Number(this.likeCount || 0)
      if (count >= 10000) return `${(count / 10000).toFixed(1)}w`
      return String(count)
    },
    productTotal() {
      return this.products.length
    },
    productTotalText() {
      return this.productTotal > 99 ? '99+' : String(this.productTotal || 0)
    },
    shouldShowComments() {
      return this.roomSetting.enableChat !== 0
    },
    pinnedMessage() {
      return this.messages.find((item) => Number(item.isTop || 0) === 1) || null
    },
    visibleMessages() {
      return this.messages
        .filter((item) => Number(item.isTop || 0) !== 1)
        .slice(-60)
        .map((item, index) => ({
          ...item,
          id: item.id || item.msgId || `${index}`,
          type: item.type || 'chat',
          nick: item.nick || item.nickname || item.userName || '用户',
          content: item.content || item.text || item.message || this.formatSystemMessage(item),
        }))
    },
    showReplayList() {
      return this.isReplay && this.replayVideos.length > 1
    },
    marketingActions() {
      const actions = []
      if (this.signState.enabled) actions.push({ type: 'sign', label: this.signState.signed ? '已签' : '签到' })
      if (this.watchRewardTasks.length) actions.push({ type: 'reward', label: '福利' })
      if (this.normalLotteryActivities.length) actions.push({ type: 'normalLottery', label: '抽奖' })
      if (this.commentLotteryActivities.length) actions.push({ type: 'lottery', label: '抽奖' })
      return actions
    },
    signWelcomeText() {
      return this.signState.welcomeText || '完成签到后可参与直播间互动权益'
    },
    marketingPanelTitle() {
      if (this.marketingPanelType === 'sign') return '直播签到'
      if (this.marketingPanelType === 'reward') return '观看福利'
      if (this.marketingPanelType === 'normalLottery') return '普通抽奖'
      if (this.marketingPanelType === 'lottery') return '评论抽奖'
      return '直播活动'
    },
    activeMarketingItems() {
      if (this.marketingPanelType === 'reward') {
        return this.watchRewardTasks.map((item, index) => ({
          key: `reward-${item.activityId || item.id || index}`,
          type: 'reward',
          raw: item,
          name: item.activityName || item.name || item.title || '观看福利',
          desc: item.rewardName || item.prizeName || item.description || '达到观看条件后可领取',
        }))
      }
      if (this.marketingPanelType === 'lottery') {
        return this.commentLotteryActivities.map((item, index) => ({
          key: `lottery-${item.activityId || item.id || index}`,
          type: 'lottery',
          raw: item,
          name: item.activityName || item.name || item.title || '评论抽奖',
          desc: item.displayPasswordText || item.tipText || item.description || '发送指定评论参与抽奖',
        }))
      }
      if (this.marketingPanelType === 'normalLottery') {
        return this.normalLotteryActivities.map((item, index) => ({
          key: `normal-lottery-${item.activityId || item.id || index}`,
          type: 'normalLottery',
          raw: item,
          name: item.activityName || item.name || item.title || '直播抽奖',
          desc: item.rewardName || item.prizeName || item.description || '等待主播开奖',
        }))
      }
      return []
    },
  },
  onLoad(query = {}) {
    this.options = normalizeLiveRouteOptions(query)
    this.isLandscape = this.options.mode === 'landscape' || this.options.orientation === 'horizontal'
    this.sessionId = uniqueId()
    this.showEntryOverlay = true
    this.muted = uni.getStorageSync('broadcast_sound_intent') === 'sound' ? false : true
    uni.setKeepScreenOn?.({ keepScreenOn: true })
    if (!ensureH5Authenticated({ ...query, ...this.options, redirect: buildBroadcastEntryUrl(this.options) })) {
      this.loading = false
      return
    }
    this.loadRoom()
  },
  onShow() {
    uni.setKeepScreenOn?.({ keepScreenOn: true })
    if (!this.loading && !this.errorText && this.roomId) {
      this.refreshLiveStatusNow()
    }
  },
  onHide() {
    uni.setKeepScreenOn?.({ keepScreenOn: false })
    if (this.isReplay) this.reportReplayProgress(this.replayLastTime, 1, true)
  },
  onUnload() {
    uni.setKeepScreenOn?.({ keepScreenOn: false })
    this.teardownRoom()
    this.clearPlaybackPosterTimer()
    this.clearNoticeTimers()
  },
  onShareAppMessage() {
    return {
      title: this.roomName,
      path: `/pages/broadcast/entry?${this.roomCode ? `roomCode=${encodeURIComponent(this.roomCode)}` : `liveId=${encodeURIComponent(this.roomId)}`}`,
      imageUrl: this.coverImage,
    }
  },
  onShareTimeline() {
    return {
      title: this.roomName,
      query: this.roomCode ? `roomCode=${encodeURIComponent(this.roomCode)}` : `liveId=${encodeURIComponent(this.roomId)}`,
      imageUrl: this.coverImage,
    }
  },
  methods: {
    resetPlaybackPosterState() {
      this.clearPlaybackPosterTimer()
      this.playbackFrameReady = false
      this.replayPosterFadeReady = false
    },
    clearPlaybackPosterTimer() {
      if (this.replayPosterHideTimer) {
        clearTimeout(this.replayPosterHideTimer)
        this.replayPosterHideTimer = null
      }
    },
    markPlaybackReady() {
      if (!this.playerUrl) return
      this.playbackFrameReady = true
      this.clearPlaybackPosterTimer()
      this.replayPosterHideTimer = setTimeout(() => {
        if (this.playerUrl && this.playbackFrameReady) this.replayPosterFadeReady = true
        this.replayPosterHideTimer = null
      }, 240)
    },
    clearNoticeTimers() {
      if (this.buyingNoticeTimer) clearTimeout(this.buyingNoticeTimer)
      if (this.marketingNoticeTimer) clearTimeout(this.marketingNoticeTimer)
      this.buyingNoticeTimer = null
      this.marketingNoticeTimer = null
    },
    showTransientBuyingNotice(text = '') {
      const value = String(text || '').trim()
      if (!value) return
      if (this.buyingNoticeTimer) clearTimeout(this.buyingNoticeTimer)
      this.buyingNoticeText = value
      this.buyingNoticeTimer = setTimeout(() => {
        this.buyingNoticeText = ''
        this.buyingNoticeTimer = null
      }, 3600)
    },
    showTransientMarketingNotice(text = '') {
      const value = String(text || '').trim()
      if (!value) return
      if (this.marketingNoticeTimer) clearTimeout(this.marketingNoticeTimer)
      this.marketingNoticeText = value
      this.marketingNoticeTimer = setTimeout(() => {
        this.marketingNoticeText = ''
        this.marketingNoticeTimer = null
      }, 3600)
    },
    enterLiveByGesture() {
      this.showEntryOverlay = false
      this.muted = false
      uni.setStorageSync('broadcast_sound_intent', 'sound')
      this.manualPlayVideo()
    },
    manualPlayVideo() {
      const contextId = this.useLivePlayer ? 'broadcastLivePlayer' : 'broadcastVideoPlayer'
      try {
        const context = this.useLivePlayer
          ? uni.createLivePlayerContext(contextId, this)
          : uni.createVideoContext(contextId, this)
        context?.play?.()
      } catch (error) {}
    },
    dismissMarquee() {
      this.marqueeDismissed = true
    },
    hideCommentLotteryBubble() {
      this.commentLotteryBubbleVisible = false
    },
    copyAccessUid() {
      uni.setClipboardData?.({
        data: this.accessDeniedUidText,
        success: () => uni.showToast({ title: '已复制', icon: 'none' }),
      })
    },
    applyViewerLimitReached(data = {}) {
      this.viewerLimitText = data.viewerLimitText || data.message || data.msg || '观看人数已达上限'
      this.viewerLimitReached = true
      this.accessDenied = false
      this.showEntryOverlay = false
      this.playerUrl = ''
      this.socket?.close()
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    },
    applyAccessRestrictions(detail = {}) {
      if (!detail || typeof detail !== 'object') return false
      if (detail.viewerLimitReached) {
        this.applyViewerLimitReached(detail)
        return true
      }
      if (detail.isBlocked || detail.userBlocked || detail.trafficExceeded || (detail.needAuth && detail.hasAccess === false)) {
        this.accessDenied = true
        this.viewerLimitReached = false
        this.accessDeniedReason = detail.trafficExceedMsg || detail.accessDeniedText || detail.message || detail.msg || '暂无观看权限'
        this.showEntryOverlay = false
        this.playerUrl = ''
        return true
      }
      return false
    },
    useQuickReply(content = '') {
      const text = String(content || '').trim()
      if (!text || this.chatDisabled) return
      this.inputText = text
      this.sendComment()
    },
    productHasReplaySchedule(item = {}) {
      return normalizeScheduleNodes(item).length > 0
    },
    toggleCollapse() {
      this.stageCollapsed = !this.stageCollapsed
      if (!this.stageCollapsed) this.miniHidden = false
    },
    closeMiniWindow() {
      this.miniHidden = true
    },
    async loadRoom() {
      this.loading = true
      this.errorText = ''
      this.accessDenied = false
      this.viewerLimitReached = false
      this.liveEnded = false
      this.liveEndedReason = ''
      this.marqueeDismissed = false
      this.commentLotteryBubbleVisible = true
      this.showReplayFirstVideoLoading = false
      this.resetPlaybackPosterState()
      try {
        let raw
        try {
          raw = await getLiveDetail({
            roomCode: this.options.roomCode,
            roomId: this.options.roomId || this.options.liveId,
            liveId: this.options.liveId,
          })
        } catch (error) {
          raw = await this.loadLegacyRoom()
        }

        this.detail = normalizeRoomDetail(raw || {}, this.options)
        this.isReplay = isReplayEntry(this.options, this.detail)
        if (this.applyAccessRestrictions(this.detail)) return
        this.viewerCount = this.detail.onlineCount || 0
        this.likeCount = Number(this.detail.likeCount || 0)
        this.replayVideos = this.detail.replayVideos || []
        await this.hydrateFastPlaybackInfo()
        this.restoreReplayIndex()
        this.applyInitialPlaybackSource()

        if (this.roomId) {
          saveLiveRoomContext({
            roomId: this.roomId,
            liveId: this.roomId,
            roomCode: this.roomCode,
            liveName: this.roomName,
            cover: this.coverImage,
            liveType: this.isReplay ? 'replay' : 'live',
          })
        }

        uni.setNavigationBarTitle({ title: this.roomName })
        await Promise.all([this.loadComments(), this.loadProducts(), this.loadCurrentProduct(), this.loadMarketing()])
        this.connectRoom()
        this.enterRoom()
      } catch (error) {
        const payload = extractErrorPayload(error)
        if (payload.viewerLimitReached) {
          this.applyViewerLimitReached(payload)
        } else if (payload.isBlocked || payload.userBlocked || payload.trafficExceeded || (payload.needAuth && payload.hasAccess === false)) {
          this.applyAccessRestrictions(payload)
        } else {
          this.errorText = payload?.msg || payload?.message || error?.msg || error?.message || '直播间加载失败'
        }
      } finally {
        this.loading = false
      }
    },
    applyInitialPlaybackSource() {
      this.liveCandidateIndex = 0
      this.liveCandidates = []
      this.playerUrl = ''
      this.replayProductSchedule.resetScheduleState()
      this.scheduleExplainActiveId = 0
      this.resetPlaybackPosterState()
      if (this.isReplay) {
        this.playerUrl = getBestReplayUrl(this.detail, this.replayVideos[this.replayIndex] || {})
        return
      }

      this.liveCandidates = getMiniProgramLiveCandidates(this.detail, this.liveStreamInfo)
      const preferredUrl = getBestLiveUrl(this.detail, { streamInfo: this.liveStreamInfo })
      const preferredIndex = preferredUrl
        ? this.liveCandidates.findIndex((candidate) => candidate.url === preferredUrl)
        : -1
      this.liveCandidateIndex = preferredIndex >= 0 ? preferredIndex : 0
      this.playerUrl = this.activeLiveCandidate.url || ''
      if (!this.playerUrl) this.errorText = '暂无可播放直播线路'
    },
    switchToLiveCandidate(index, reason = '') {
      const candidate = this.liveCandidates[index]
      if (!candidate?.url) return false
      this.liveCandidateIndex = index
      this.errorText = ''
      this.playerUrl = ''
      this.resetPlaybackPosterState()
      const applyUrl = () => {
        this.playerUrl = candidate.url
      }
      if (typeof this.$nextTick === 'function') {
        this.$nextTick(applyUrl)
      } else {
        setTimeout(applyUrl, 0)
      }
      if (reason) {
        uni.showToast({
          title: `正在切换直播线路${index + 1}`,
          icon: 'none',
        })
      }
      return true
    },
    tryNextLiveCandidate(reason = '') {
      if (!this.isLiveMode) return false
      const nextIndex = this.liveCandidateIndex + 1
      if (nextIndex < this.liveCandidates.length) {
        return this.switchToLiveCandidate(nextIndex, reason)
      }
      this.playerUrl = ''
      this.errorText = '直播播放失败，请稍后重试'
      return false
    },
    loadLegacyRoom() {
      return new Promise((resolve, reject) => {
        if (!this.options.liveId || typeof this._post !== 'function') {
          reject(new Error('缺少直播间参数'))
          return
        }
        this._post('live.index/index', { live_id: this.options.liveId }, (res) => resolve(res.data || res), reject)
      })
    },
    async hydrateFastPlaybackInfo() {
      const roomCode = this.options.roomCode || this.detail.roomCode || ''
      if (!roomCode) return

      if (this.isReplay && !getBestReplayUrl(this.detail, this.replayVideos[0] || {})) {
        this.showReplayFirstVideoLoading = !this.isLandscape
        try {
          const data = await getReplayFirstVideo(roomCode).catch(() => null)
          const firstVideo = data?.video || data?.replayVideo || data?.firstVideo || (Array.isArray(data?.list) ? data.list[0] : data)
          if (firstVideo && typeof firstVideo === 'object') {
            this.replayVideos = [firstVideo]
            this.detail = { ...this.detail, replayVideos: this.replayVideos }
          }
        } finally {
          this.showReplayFirstVideoLoading = false
        }
        return
      }

      if (!this.isReplay) {
        const streamInfo = await getLiveStreamInf(roomCode).catch(() => null)
        if (streamInfo && typeof streamInfo === 'object') {
          this.liveStreamInfo = streamInfo
          this.detail = { ...this.detail, streamInf: streamInfo, ...streamInfo }
        }
      }
    },
    restoreReplayIndex() {
      if (!this.replayVideos.length) {
        this.replayIndex = 0
        this.replayInitialTime = 0
        this.replayLastTime = 0
        return
      }
      const targetId = Number(this.options.videoId || this.options.replayVideoId || 0)
      const found = targetId ? this.replayVideos.findIndex((item) => Number(item.id || item.videoId) === targetId) : -1
      this.replayIndex = found >= 0 ? found : 0
      const current = this.replayVideos[this.replayIndex]
      const key = `replay_progress_${this.roomId}_${current?.id || current?.videoId || this.replayIndex}`
      this.replayInitialTime = Number(uni.getStorageSync(key) || 0)
      this.replayLastTime = this.replayInitialTime
    },
    async loadComments() {
      if (!this.roomId) return
      try {
        const data = await getCommentHistory(this.roomId, 30, this.currentReplayVideoId())
        const list = Array.isArray(data) ? data : data?.list || data?.data || []
        this.messages = list.map((item, index) => {
          const extra = item.data && typeof item.data === 'object' ? item.data : {}
          const type = Number(item.type) === 1 ? 'chat' : (item.type || 'chat')
          return {
            id: item.id || item.commentId || extra.commentId || index,
            commentId: item.commentId || item.id || extra.commentId || 0,
            msgId: item.msgId || item.messageId || '',
            type,
            nick: item.nick || item.nickname || item.userName,
            content: item.content || item.comment || item.text,
            isTop: Number(item.isTop || extra.isTop || 0),
          }
        })
        this.scrollToBottom()
      } catch (error) {
        this.messages = []
      }
    },
    async loadProducts() {
      if (!this.roomId) return
      this.productsLoading = true
      try {
        const data = await getLiveProducts(this.roomId, 1, 50)
        this.products = Array.isArray(data) ? data : data?.list || data?.data || []
      } catch (error) {
        this.products = []
      } finally {
        this.productsLoading = false
      }
    },
    async loadCurrentProduct() {
      if (!this.roomId) return
      const data = await getCurrentProduct(this.roomId).catch(() => null)
      const item = data?.product || data?.currentProduct || data?.data || data
      this.currentProduct = item && typeof item === 'object' && Object.keys(item).length ? item : null
    },
    async loadMarketing() {
      this.syncMarketingFromDetail()
      if (!this.roomId) return
      if (this.signState.enabled) {
        const sign = await checkSigned(this.roomId).catch(() => null)
        if (sign) {
          this.signState.signed = !!(sign.signed || sign.hasSigned)
          this.signState.enabled = sign.enabled !== undefined ? !!sign.enabled : this.signState.enabled
        }
      }
      const lottery = await getCommentLotteryList({ roomId: this.roomId, termId: this.options.termId }).catch(() => null)
      const list = lottery?.list || lottery?.activities || lottery?.data || []
      if (Array.isArray(list) && list.length) this.commentLotteryActivities = list
    },
    syncMarketingFromDetail() {
      const signConfig = this.detail.signConfig || this.detail.sign_config || this.detail.sign || {}
      this.signState = {
        enabled: signConfig.enabled === true || Number(signConfig.enabled || 0) === 1,
        signed: !!(signConfig.signed || signConfig.hasSigned),
        fields: Array.isArray(signConfig.fields) ? signConfig.fields : [],
        welcomeText: signConfig.welcomeText || signConfig.title || '',
      }

      const watchSource = this.detail.watchRewardTasks || this.detail.watchRewards || this.detail.watchRewardList || []
      this.watchRewardTasks = Array.isArray(watchSource)
        ? watchSource
        : Array.isArray(watchSource.tasks)
          ? watchSource.tasks
          : []

      const normalLotterySource = this.detail.normalLotteryActivities || this.detail.lotteryActivities || this.detail.lotteryList || this.detail.lotteries || []
      this.normalLotteryActivities = Array.isArray(normalLotterySource)
        ? normalLotterySource
        : Array.isArray(normalLotterySource.list)
          ? normalLotterySource.list
          : []

      const lotterySource = this.detail.commentLotteryActivities || this.detail.commentLotteryList || this.detail.commentLottery || []
      this.commentLotteryActivities = Array.isArray(lotterySource)
        ? lotterySource
        : Array.isArray(lotterySource.list)
          ? lotterySource.list
          : []
    },
    async connectRoom() {
      if (!this.roomId) return
      this.socket?.close()
      const apiBase = getH5ApiBaseUrl()
      const wsBase = apiBase.replace(/^https:/i, 'wss:').replace(/^http:/i, 'ws:')
      const sign = await getWsSignKey().catch(() => null)
      const signKey = sign?.signKey || ''
      this.socket = new MiniLiveSocket({
        url: `${wsBase}/h5/live/ws?roomId=${encodeURIComponent(this.roomId)}`,
        token: uni.getStorageSync('h5_token') || uni.getStorageSync('token') || '',
        liveId: this.roomId,
        signKey,
        onMessage: this.handleSocketMessage,
        onStateChange: (state) => {
          this.socketState = state
        },
        onOpen: (event) => {
          if (event?.isReconnect) this.loadComments()
        },
      })
      this.socket.connect()
    },
    async refreshLiveStatusNow() {
      if (!this.roomId || this.isReplay) return
      const status = await getLiveStatus(this.roomId).catch(() => null)
      if (status && typeof status === 'object') this.applyLiveStatusSnapshot(status.data || status)
    },
    async enterRoom() {
      if (!this.roomId) return
      this.enteredAt = Date.now()
      await enterLiveRoom(this.roomId, this.sessionId, this.roomCode, this.options.termId).catch((error) => {
        const payload = extractErrorPayload(error)
        if (payload.viewerLimitReached || /观看人数.*上限|人数已达上限/.test(String(payload.msg || payload.message || ''))) {
          this.applyViewerLimitReached(payload)
        } else if (payload.isBlocked || payload.userBlocked || payload.trafficExceeded || (payload.needAuth && payload.hasAccess === false)) {
          this.applyAccessRestrictions(payload)
        }
      })
      if (this.viewerLimitReached || this.accessDenied) return
      this.heartbeatTimer = setInterval(() => {
        this.watchSeconds = Math.floor((Date.now() - this.enteredAt) / 1000)
        liveHeartbeat(this.roomId, this.sessionId, this.watchSeconds).catch(() => {})
      }, 15000)
    },
    teardownRoom() {
      if (this.isReplay) this.reportReplayProgress(this.replayLastTime, 1, true)
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
      this.socket?.close()
      this.socket = null
      if (this.roomId && this.enteredAt) {
        const duration = Math.floor((Date.now() - this.enteredAt) / 1000)
        leaveLiveRoom(this.roomId, this.sessionId, duration).catch(() => {})
      }
    },
    handleSocketMessage(message = {}) {
      if (!message) return
      const payload = message.data && typeof message.data === 'object' ? message.data : message
      if (message.type === 'viewer_count') {
        this.viewerCount = message.count || message.onlineCount || this.viewerCount
        return
      }
      if (message.type === 'like') {
        this.likeCount = Number(message.totalLikes || message.likeCount || this.likeCount)
        return
      }
      if (message.type === 'product') {
        const item = message.product || message.data || message
        this.currentProduct = item && typeof item === 'object' ? item : this.currentProduct
        return
      }
      if (['product_status_update', 'product_list', 'product_stock'].includes(message.type)) {
        this.loadProducts()
        this.loadCurrentProduct()
        return
      }
      if (message.type === 'live_status_update') {
        this.applyLiveStatusSnapshot(message.data || message.snapshot || message)
        return
      }
      if (message.type === 'r_to_buy' || (message.type === 'system' && (payload.buyReminder || payload.simOrder || payload.paidOrder))) {
        this.handleBuyingNoticeMessage(message, payload)
        return
      }
      if (message.type === 'chat' || message.type === 'comment_audit' || message.type === 'enter' || message.type === 'system') {
        this.messages.push({
          id: message.id || message.msgId || uniqueId(),
          commentId: payload.commentId || message.commentId || 0,
          msgId: message.msgId || payload.msgId || '',
          type: message.type === 'comment_audit' ? 'chat' : message.type,
          nick: message.nick || message.nickname,
          content: message.content || message.text || message.message,
          isTop: Number(payload.isTop || message.isTop || 0),
        })
        this.scrollToBottom()
        return
      }
      if (['win_notify', 'lottery_result', 'win_record_update', 'comment_lottery', 'comment_lottery_event', 'watch_reward_lifecycle', 'watch_reward_broadcast'].includes(message.type)) {
        this.handleMarketingSocketMessage(message, payload)
        return
      }
      if (['comment_delete', 'comment_top', 'comment_clear', 'mute_word_filtered'].includes(message.type)) {
        this.handleCommentControlMessage(message, payload)
        return
      }
      if (message.type === 'setting_update') {
        const setting = payload.setting || payload
        this.applyLiveStatusSnapshot({ setting })
        const muteAll = setting.muteAll ?? payload.muteAll
        if (muteAll !== undefined) this.chatDisabled = Number(muteAll || 0) === 1
        return
      }
      if (message.type === 'user_muted') {
        this.chatDisabled = true
        uni.showToast({ title: '您已被禁言', icon: 'none' })
        return
      }
      if (message.type === 'user_unblocked') {
        this.chatDisabled = false
        uni.showToast({ title: '禁言已解除', icon: 'none' })
        return
      }
      if (message.type === 'user_blocked') {
        this.chatDisabled = true
        this.errorText = '您已被限制观看'
        return
      }
      if (message.type === 'live_ended') {
        this.playerUrl = ''
        this.liveEnded = true
        this.liveEndedReason = payload.reason || message.reason || '直播已结束'
        this.messages = []
        this.appendSystemMessage(this.liveEndedReason, '系统')
        return
      }
      if (message.type === 'video_loop_restart') {
        this.resetReplaySimState()
        this.replayLastTime = 0
        try {
          const video = uni.createVideoContext('broadcastVideoPlayer', this)
          video.seek(0)
          video.play()
        } catch (error) {}
      }
    },
    appendSystemMessage(content = '', nick = '系统', extra = {}) {
      const text = String(content || '').trim()
      if (!text) return
      this.messages.push({
        id: extra.id || extra.msgId || uniqueId(),
        type: 'system',
        nick,
        content: text,
        ...extra,
      })
      this.scrollToBottom()
    },
    handleBuyingNoticeMessage(message = {}, payload = {}) {
      const nick = message.nick || message.nickname || payload.nickname || payload.customerName || '观众'
      const productName = payload.productName || payload.goods_name || payload.goodsName || message.productName || ''
      const noticeText = message.noticeText || payload.noticeText || (payload.paidOrder ? '刚刚下单成功' : '正在去购买')
      const content = productName ? `${nick}${noticeText}${productName}` : `${nick}${noticeText}`
      this.showTransientBuyingNotice(content)
      this.appendSystemMessage(content, '购买')
      if (payload.productId || payload.goods_id || payload.goodsId) this.loadProducts()
    },
    handleMarketingSocketMessage(message = {}, payload = {}) {
      const text = (
        message.content ||
        message.message ||
        payload.content ||
        payload.message ||
        payload.title ||
        payload.activityName ||
        '直播活动状态已更新'
      )
      this.showTransientMarketingNotice(text)
      this.appendSystemMessage(text, '活动', { msgId: message.msgId || payload.msgId || '' })
      this.loadMarketing()
    },
    applyLiveStatusSnapshot(payload = {}) {
      if (!payload || typeof payload !== 'object') return
      if (payload.onlineCount !== undefined || payload.count !== undefined) {
        this.viewerCount = payload.onlineCount ?? payload.count ?? this.viewerCount
      }
      if (payload.likeCount !== undefined || payload.totalLikes !== undefined) {
        const nextLike = Number(payload.likeCount ?? payload.totalLikes)
        if (Number.isFinite(nextLike)) this.likeCount = Math.max(Number(this.likeCount || 0), nextLike)
      }
      const nextSetting = payload.setting || payload.roomSetting
      if (nextSetting && typeof nextSetting === 'object') {
        this.detail = {
          ...this.detail,
          setting: {
            ...(this.detail.setting || {}),
            ...nextSetting,
            ...(nextSetting.marqueePosition === undefined && nextSetting.marqueeEnabled !== undefined ? { marqueePosition: 1 } : {}),
          },
        }
        this.marqueeDismissed = false
        if (nextSetting.enableChat !== undefined && Number(nextSetting.enableChat) === 0) this.activeTab = 'products'
      }
      const nextDetail = { ...this.detail, ...payload }
      if (nextSetting && typeof nextSetting === 'object') {
        nextDetail.setting = { ...(this.detail.setting || {}) }
      }
      this.detail = nextDetail
      if (Number(payload.pushStatus ?? payload.live_status ?? this.detail.pushStatus ?? 0) === 2) {
        this.liveEnded = true
        this.liveEndedReason = payload.reason || payload.message || '直播已结束'
        this.playerUrl = ''
        this.messages = []
        return
      }
      if (this.isLiveMode) {
        const candidates = getMiniProgramLiveCandidates(nextDetail, payload.streamInf || payload.streamInfo || payload)
        if (candidates.length) {
          const currentUrl = this.playerUrl
          this.liveCandidates = candidates
          const currentIndex = candidates.findIndex((candidate) => candidate.url === currentUrl)
          this.liveCandidateIndex = currentIndex >= 0 ? currentIndex : 0
          const nextUrl = candidates[this.liveCandidateIndex]?.url || ''
          if (nextUrl && nextUrl !== currentUrl) {
            this.switchToLiveCandidate(this.liveCandidateIndex, 'status')
          }
        }
      }
    },
    handleCommentControlMessage(message = {}, payload = {}) {
      if (message.type === 'comment_clear') {
        this.messages = []
        return
      }
      if (message.type === 'comment_delete') {
        const ids = payload.commentIds || payload.ids || message.commentIds || []
        const idSet = new Set((Array.isArray(ids) ? ids : [ids]).map((id) => Number(id || 0)).filter(Boolean))
        if (!idSet.size) return
        this.messages = this.messages.filter((item) => !idSet.has(Number(item.commentId || item.id || 0)))
        return
      }
      if (message.type === 'comment_top') {
        const commentId = Number(payload.commentId || message.commentId || 0)
        const isTop = Number(payload.isTop ?? message.isTop ?? 0)
        if (!commentId) return
        this.messages = this.messages.map((item) => ({
          ...item,
          isTop: Number(item.commentId || item.id || 0) === commentId ? isTop : (isTop === 1 ? 0 : Number(item.isTop || 0)),
        }))
        return
      }
      if (message.type === 'mute_word_filtered') {
        const content = String(message.content || payload.content || '').trim()
        if (!content) return
        this.messages = this.messages.map((item) => (
          item.type === 'chat' && item.content === content ? { ...item, private: true, content: '该评论已被过滤' } : item
        ))
      }
    },
    scrollToBottom() {
      const updateScrollId = () => {
        const last = this.visibleMessages[this.visibleMessages.length - 1]
        if (last) this.scrollToId = `msg-${last.id}`
      }
      if (typeof this.$nextTick === 'function') {
        this.$nextTick(updateScrollId)
        return
      }
      setTimeout(updateScrollId, 0)
    },
    async sendComment() {
      const text = String(this.inputText || '').trim()
      if (!text || this.chatDisabled) return
      this.inputText = ''
      const optimistic = { id: uniqueId(), type: 'chat', nick: '我', content: text }
      this.messages.push(optimistic)
      this.scrollToBottom()
      this.socket?.sendChat(text, { replayVideoId: this.currentReplayVideoId() })
      await sendLiveComment(this.roomId, text, { replayVideoId: this.currentReplayVideoId() }).catch(() => {})
      await this.tryClaimCommentReward(text)
    },
    async tryClaimCommentReward(text) {
      const activity = this.commentLotteryActivities.find((item) => Number(item.status || item.drawStatus || 0) === 1) || this.commentLotteryActivities[0]
      if (!activity?.activityId && !activity?.id) return
      await claimCommentReward({
        activityId: activity.activityId || activity.id,
        prizeId: activity.activePrizeId || activity.prizeId,
        comment: text,
      }).catch(() => {})
    },
    async sendLikeTap() {
      this.likeCount += 1
      this.socket?.sendLike(1)
      await sendLike(this.roomId, 1).catch(() => {})
    },
    focusCommentInput() {
      if (!this.chatDisabled) this.inputFocused = true
    },
    setActiveTab(tab) {
      this.activeTab = tab
    },
    toggleMute() {
      this.muted = !this.muted
      uni.setStorageSync('broadcast_sound_intent', this.muted ? 'muted' : 'sound')
    },
    toggleProducts() {
      this.showProducts = !this.showProducts
    },
    productName(item = {}) {
      return item.name || item.productName || item.product_name || item.title || '直播商品'
    },
    productImage(item = {}) {
      return item.image || item.productImage || item.product_image || item.cover || ''
    },
    formatProductPrice(item = {}) {
      const value = item.price ?? item.productPrice ?? item.minPrice ?? item.salePrice ?? item.product_price ?? '0.00'
      const number = Number(value)
      if (!Number.isFinite(number)) return String(value || '0.00')
      return number.toFixed(number % 1 === 0 ? 0 : 2)
    },
    handleMarketingAction(type) {
      this.marketingPanelType = type
      this.showMarketingPanel = true
    },
    closeMarketingPanel() {
      this.showMarketingPanel = false
      this.marketingPanelType = ''
    },
    async submitLiveSign() {
      if (this.signState.signed || this.marketingLoading) return
      this.marketingLoading = true
      try {
        await submitSign(this.roomId, { source: 'mp-weixin', roomCode: this.roomCode })
        this.signState.signed = true
        uni.showToast({ title: '签到成功', icon: 'success' })
      } catch (error) {
        uni.showToast({ title: error?.msg || error?.message || '签到失败', icon: 'none' })
      } finally {
        this.marketingLoading = false
      }
    },
    async handleMarketingItem(item = {}) {
      if (item.type === 'reward') {
        const activityId = item.raw?.activityId || item.raw?.id
        if (!activityId) {
          uni.showToast({ title: '活动信息缺失', icon: 'none' })
          return
        }
        try {
          await claimWatchReward({ activityId, roomId: this.roomId, watchDuration: this.watchSeconds })
          uni.showToast({ title: '领取成功', icon: 'success' })
          this.loadMarketing()
        } catch (error) {
          uni.showToast({ title: error?.msg || error?.message || '暂未满足领取条件', icon: 'none' })
        }
        return
      }
      if (item.type === 'lottery') {
        const hint = item.raw?.displayPasswordText || item.raw?.tipText || '请在评论区发送指定口令参与'
        uni.showToast({ title: hint, icon: 'none' })
        this.closeMarketingPanel()
      }
      if (item.type === 'normalLottery') {
        const activityId = item.raw?.activityId || item.raw?.id
        const data = await getLotteryParticipants({
          activityId,
          drawId: item.raw?.drawId,
          participantsUrl: item.raw?.participantsUrl,
        }).catch(() => null)
        const count = data?.total || data?.list?.length || item.raw?.participantCount || 0
        uni.showToast({ title: count ? `${count}人已参与` : '等待主播开奖', icon: 'none' })
      }
    },
    openShare() {
      uni.showShareMenu && uni.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] })
      uni.showToast({ title: '请点击右上角分享', icon: 'none' })
    },
    goCenter() {
      const query = this.roomCode ? `roomCode=${encodeURIComponent(this.roomCode)}` : `roomId=${encodeURIComponent(this.roomId)}`
      uni.switchTab({
        url: '/pages/user/index/index',
        fail: () => uni.navigateTo({ url: `/pages/user/index/index?${query}` }),
      })
      saveLiveRoomContext({ roomId: this.roomId, roomCode: this.roomCode, liveName: this.roomName, cover: this.coverImage })
    },
    goReport() {
      const fromPath = encodeURIComponent('/pages/broadcast/entry')
      const room = this.roomCode ? `&roomCode=${encodeURIComponent(this.roomCode)}` : `&roomId=${encodeURIComponent(this.roomId)}`
      uni.navigateTo({ url: `/pages/report/report-type?fromPath=${fromPath}${room}` })
    },
    openProduct(item = {}) {
      const productId = item.productId || item.product_id || item.id || ''
      const skuId = item.productSkuId || item.product_sku_id || item.skuId || ''
      if (!productId) return
      saveLiveRoomContext({ roomId: this.roomId, roomCode: this.roomCode, liveName: this.roomName, cover: this.coverImage })
      sendBuyReminder({ roomId: this.roomId, productId }).catch(() => {})
      uni.navigateTo({
        url: `/pages/product/detail/detail?product_id=${productId}&product_sku_id=${skuId}&room_id=${this.roomId}&roomCode=${encodeURIComponent(this.roomCode)}`,
      })
    },
    returnToLive() {
      const options = {
        roomCode: this.roomCode,
        liveId: this.roomId,
        roomId: this.roomId,
      }
      uni.redirectTo({ url: `/pages/broadcast/entry?${this.roomCode ? `roomCode=${encodeURIComponent(this.roomCode)}` : `liveId=${encodeURIComponent(this.roomId)}`}` })
      saveLiveRoomContext(options)
    },
    playReplay(index) {
      this.replayIndex = index
      this.replayInitialTime = 0
      this.replayLastTime = 0
      this.lastProgressReportAt = 0
      this.lastProgressReportedSecond = 0
      this.resetPlaybackPosterState()
      this.resetReplaySimState()
      this.replayProductSchedule.resetScheduleState()
      this.scheduleExplainActiveId = 0
      this.playerUrl = getBestReplayUrl(this.detail, this.replayVideos[index] || {})
      this.loadComments()
    },
    currentReplayVideoId() {
      const current = this.replayVideos[this.replayIndex] || {}
      return current.id || current.videoId || current.video_id || 0
    },
    syncReplayProductSchedule(currentTime = 0) {
      if (!this.isReplay || !this.products.length) return
      const result = this.replayProductSchedule.syncReplaySchedule({
        productList: this.products,
        currentTime,
        currentVideoUrl: this.playerUrl,
        currentVideoId: this.currentReplayVideoId(),
      })
      if (result.shouldActivate && result.product) {
        this.currentProduct = result.product
        this.scheduleExplainActiveId = result.product.id || result.product.productId || 0
        return
      }
      if (result.shouldDeactivate && this.scheduleExplainActiveId) {
        this.scheduleExplainActiveId = 0
        const fallback = this.products.find((item) => Number(item.isCurrent || item.is_current || 0) === 1)
        this.currentProduct = fallback || null
      }
    },
    async onVideoTimeUpdate(event) {
      this.markPlaybackReady()
      const currentTime = Math.floor(event?.detail?.currentTime || 0)
      const previousTime = this.replayLastTime
      this.replayLastTime = currentTime
      if (this.isReplay && currentTime + 2 < previousTime) this.resetReplaySimState()
      await this.loadReplaySimMessages(currentTime)
      this.syncReplayProductSchedule(currentTime)
      const current = this.replayVideos[this.replayIndex] || {}
      const id = current.id || current.videoId || current.video_id || this.replayIndex
      if (!this.roomId || !id) return
      uni.setStorageSync(`replay_progress_${this.roomId}_${id}`, currentTime)
      this.reportReplayProgress(currentTime, 1, false)
    },
    onVideoEnded() {
      if (this.isReplay) this.reportReplayProgress(this.replayLastTime, 2, true)
      if (this.isReplay && this.replayIndex < this.replayVideos.length - 1) this.playReplay(this.replayIndex + 1)
    },
    reportReplayProgress(lastPosition = 0, watchStatus = 1, force = false) {
      if (!this.isReplay || !this.roomId) return
      const current = this.replayVideos[this.replayIndex] || {}
      const videoId = current.id || current.videoId || current.video_id || 0
      const termId = current.termId || current.term_id || this.options.termId || this.detail.termId || this.detail.term_id || 0
      const position = Math.floor(Number(lastPosition || 0))
      if (!videoId || !termId || position <= 0) return

      const now = Date.now()
      if (!force && now - this.lastProgressReportAt < 15000 && Math.abs(position - this.lastProgressReportedSecond) < 10) return

      this.lastProgressReportAt = now
      this.lastProgressReportedSecond = position
      reportViewProgress({
        roomId: this.roomId,
        termId,
        videoId,
        lastPosition: position,
        watchDuration: position,
        watchStatus,
      }).catch(() => {})
    },
    resetReplaySimState() {
      this.replaySimLoadedUntil = 0
      this.replaySimVideoId = 0
      this.replaySimTimeline = []
      this.replaySimCursor = 0
      this.replaySimLoading = false
      this.replaySimSeen = {}
    },
    async loadReplaySimMessages(currentTime = 0) {
      if (!this.isReplay) return
      const videoId = this.currentReplayVideoId()
      if (!videoId) return
      if (this.replaySimVideoId !== Number(videoId)) {
        this.resetReplaySimState()
        this.replaySimVideoId = Number(videoId)
      }
      if (!this.replaySimLoadedUntil || currentTime >= this.replaySimLoadedUntil - REPLAY_SIM_PRELOAD_LEAD_SECONDS) {
        await this.loadReplaySimWindow(videoId, this.replaySimLoadedUntil || replaySimWindowStart(currentTime))
      }
      this.consumeReplaySimMessages(currentTime)
    },
    async loadReplaySimWindow(videoId, startSec = 0) {
      if (this.replaySimLoading) return
      this.replaySimLoading = true
      const alignedStart = replaySimWindowStart(startSec)
      const endSec = alignedStart + REPLAY_SIM_WINDOW_SIZE
      try {
        const data = await getReplaySimMessages(videoId, alignedStart, endSec).catch(() => null)
        const list = Array.isArray(data) ? data : data?.list || data?.data || []
        const existing = new Set(this.replaySimTimeline.map((item, index) => replaySimMessageKey(item, videoId, index)))
        list.forEach((item, index) => {
          const next = { ...item, triggerAtSec: replaySimSecond(item) }
          const id = replaySimMessageKey(next, videoId, index)
          if (existing.has(id)) return
          existing.add(id)
          this.replaySimTimeline.push(next)
        })
        this.replaySimTimeline.sort((a, b) => replaySimSecond(a) - replaySimSecond(b))
        this.replaySimLoadedUntil = endSec
      } finally {
        this.replaySimLoading = false
      }
    },
    consumeReplaySimMessages(currentTime = 0) {
      const second = Math.floor(Number(currentTime || 0))
      let appended = false
      while (this.replaySimCursor < this.replaySimTimeline.length) {
        const item = this.replaySimTimeline[this.replaySimCursor]
        if (replaySimSecond(item) > second) break
        this.replaySimCursor += 1
        const id = replaySimMessageKey(item, this.currentReplayVideoId(), this.replaySimCursor)
        if (this.replaySimSeen[id]) continue
        this.replaySimSeen[id] = true
        const payload = item.data && typeof item.data === 'object' ? item.data : item
        const type = String(item.type || item.msgType || item.event || '').toLowerCase()
        if (
          type === 'r_to_buy' ||
          type === 'buying_notice' ||
          payload.paidOrder ||
          payload.simOrder ||
          payload.orderNo ||
          payload.productName ||
          payload.goodsName ||
          payload.goods_name
        ) {
          this.handleBuyingNoticeMessage(item, payload)
          appended = true
          continue
        }
        this.messages.push({
          id,
          type: item.type || 'system',
          nick: item.nick || item.nickname || item.userName || '观众',
          content: item.content || item.message || item.text || item.productName || '正在观看直播回放',
        })
        appended = true
      }
      if (appended) this.scrollToBottom()
    },
    onLiveStateChange(event) {
      const code = Number(event.detail?.code)
      if (LIVE_PLAYER_READY_CODES.includes(code)) this.markPlaybackReady()
      if (LIVE_PLAYER_FAILURE_CODES.includes(code)) {
        this.tryNextLiveCandidate(`state:${code}`)
      }
    },
    onLivePlayerError(event) {
      this.tryNextLiveCandidate(`error:${event?.detail?.errCode || ''}`)
    },
    onVideoError(event) {
      if (this.isLiveMode && this.tryNextLiveCandidate(`video:${event?.detail?.errCode || ''}`)) return
      if (this.isReplay) this.errorText = '回放播放失败，请稍后重试'
    },
    onNetStatus(event) {
      const info = event.detail?.info || {}
      if (info.netQualityLevel >= 5) uni.showToast({ title: '当前网络不稳定', icon: 'none' })
    },
    onFullscreenChange(event) {
      this.fullscreen = !!event.detail?.fullScreen
    },
    formatSystemMessage(item = {}) {
      if (item.type === 'enter') return '进入直播间'
      if (item.type === 'system') return item.content || '系统消息'
      return ''
    },
  },
}
</script>

<style scoped>
.broadcast-stage-host,
.live-page {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  overflow: hidden;
  color: #fff;
  background: #000;
}
.live-state-page {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56rpx;
  box-sizing: border-box;
}
.state-card {
  display: flex;
  width: 100%;
  align-items: center;
  flex-direction: column;
}
.state-cover {
  width: 196rpx;
  height: 196rpx;
  margin-bottom: 28rpx;
  border-radius: 18rpx;
  background: #161616;
}
.state-title {
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  text-align: center;
}
.state-subtitle {
  margin-top: 14rpx;
  color: rgba(255, 255, 255, 0.65);
  font-size: 24rpx;
}
.state-btn {
  width: 188rpx;
  height: 68rpx;
  margin-top: 30rpx;
  border-radius: 34rpx;
  background: #ff6b2e;
  color: #fff;
  font-size: 26rpx;
  line-height: 68rpx;
}
.live-portrait {
  background: #000;
}
.live-portrait .live-video {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  width: 750rpx;
  height: 100vh;
}
.replay-first-loading {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100000001;
  display: flex;
  width: 100vw;
  height: 100vh;
  align-items: center;
  justify-content: center;
  background: #fff;
}
.replay-first-loading__image {
  display: flex;
  width: 118rpx;
  height: 118rpx;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ff6b2e;
}
.replay-first-loading__dot {
  display: block;
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  background: #fff;
}
.live-video--replay-poster {
  z-index: 1;
  pointer-events: none;
  opacity: 1;
  transition: opacity 320ms ease-out;
}
.live-video--replay-poster-hidden,
.live-video--poster-hidden,
.replay-video--poster-hidden {
  opacity: 0;
}
.live-video--poster,
.replay-video--poster,
.empty-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  color: rgba(255, 255, 255, 0.72);
  font-size: 26rpx;
  pointer-events: none;
  opacity: 1;
  transition: opacity 280ms ease;
}
.live-video-poster-img,
.live-video-replay-poster-img,
.replay-video-poster-img {
  width: 100%;
  height: 100%;
}
.screen-tap-effects {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 15;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.anchor-row {
  position: relative;
  z-index: 4;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18rpx 28rpx 0;
  box-sizing: border-box;
}
.anchor-left {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12rpx;
}
.anchor-info {
  display: flex;
  min-width: 0;
  max-width: 410rpx;
  align-items: center;
  padding: 4rpx 14rpx 4rpx 4rpx;
  border-radius: 78rpx;
  background: rgba(0, 0, 0, 0.32);
}
.anchor-info--hidden {
  visibility: hidden;
  pointer-events: none;
}
.anchor-avatar-wrap,
.anchor-avatar {
  width: 62rpx;
  height: 62rpx;
  border-radius: 50%;
}
.anchor-avatar-wrap {
  flex-shrink: 0;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.14);
}
.anchor-meta {
  display: flex;
  min-width: 0;
  flex-direction: column;
  margin-left: 12rpx;
}
.anchor-name {
  max-width: 270rpx;
  overflow: hidden;
  color: #fff;
  font-size: 24rpx;
  line-height: 34rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.anchor-likes {
  color: rgba(255, 255, 255, 0.78);
  font-size: 18rpx;
  line-height: 26rpx;
}
.viewer-area {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 12rpx;
}
.viewer-badge,
.report-btn {
  display: flex;
  height: 46rpx;
  align-items: center;
  gap: 6rpx;
  padding: 0 16rpx;
  border-radius: 46rpx;
  background: rgba(0, 0, 0, 0.28);
}
.viewer-icon,
.report-icon {
  width: 24rpx;
  height: 24rpx;
}
.viewer-num,
.report-text {
  color: #fff;
  font-size: 20rpx;
}
.live-status-badge {
  display: inline-flex;
  height: 42rpx;
  align-items: center;
  gap: 8rpx;
  padding: 0 14rpx;
  border-radius: 42rpx;
  background: rgba(0, 0, 0, 0.32);
}
.live-status-badge--live {
  background: rgba(255, 73, 73, 0.88);
}
.live-status-badge--waiting {
  background: rgba(0, 0, 0, 0.36);
}
.live-status-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #fff;
}
.live-status-text {
  color: #fff;
  font-size: 20rpx;
}
.pinned-bar {
  position: absolute;
  left: 32rpx;
  right: 150rpx;
  bottom: calc(432rpx + env(safe-area-inset-bottom));
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.notice-bar {
  bottom: calc(486rpx + env(safe-area-inset-bottom));
}
.pinned-bar__bubble {
  display: flex;
  min-width: 0;
  max-width: 100%;
  padding: 8rpx 14rpx;
  border-radius: 18rpx;
  background: rgba(0, 0, 0, 0.38);
}
.pinned-bar__nick,
.chat-nick {
  color: #ffd15a;
}
.pinned-bar__content {
  min-width: 0;
  overflow: hidden;
  color: #fff;
  font-size: 23rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pinned-bar__tag,
.pinned-tag {
  flex-shrink: 0;
  padding: 3rpx 8rpx;
  border-radius: 8rpx;
  background: #ffd15a;
  color: #3a2600;
  font-size: 18rpx;
}
.chat-area {
  position: absolute;
  left: 32rpx;
  bottom: calc(112rpx + env(safe-area-inset-bottom));
  z-index: 4;
  width: 402rpx;
  height: 315rpx;
}
.chat-bubble {
  display: table;
  max-width: 382rpx;
  margin-top: 10rpx;
  padding: 8rpx 14rpx;
  border-radius: 16rpx;
  background: rgba(0, 0, 0, 0.36);
  color: #fff;
  font-size: 24rpx;
  line-height: 34rpx;
}
.system-bubble {
  background: rgba(0, 0, 0, 0.26);
}
.system-text,
.enter-text {
  color: #ffe6a6;
}
.admin-tag {
  margin-right: 8rpx;
  padding: 2rpx 7rpx;
  border-radius: 7rpx;
  background: #ff6b2e;
  color: #fff;
  font-size: 18rpx;
}
.product-area {
  position: absolute;
  right: 32rpx;
  bottom: calc(190rpx + env(safe-area-inset-bottom));
  z-index: 8;
}
.product-card-mini {
  display: flex;
  width: 342rpx;
  align-items: center;
  padding: 12rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.24);
  color: #1f1f1f;
  box-sizing: border-box;
}
.product-card-cover-wrap {
  position: relative;
  flex-shrink: 0;
}
.product-card-cover {
  width: 92rpx;
  height: 92rpx;
  border-radius: 12rpx;
  background: #f2f2f2;
}
.product-card-cover--empty {
  background: #ececec;
}
.product-card-tag {
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 2rpx 8rpx;
  border-radius: 0 8rpx 8rpx 12rpx;
  background: #ff6b2e;
  color: #fff;
  font-size: 18rpx;
}
.product-card-body {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  margin-left: 12rpx;
}
.product-card-title {
  overflow: hidden;
  color: #222;
  font-size: 24rpx;
  line-height: 32rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.product-card-price {
  margin-top: 8rpx;
  color: #f03b2f;
  font-size: 26rpx;
  font-weight: 700;
}
.product-card-buy {
  flex-shrink: 0;
  margin-left: 10rpx;
  padding: 8rpx 12rpx;
  border-radius: 24rpx;
  background: #ff6b2e;
  color: #fff;
  font-size: 20rpx;
}
.mute-tip-bar {
  position: absolute;
  left: 32rpx;
  right: 32rpx;
  bottom: calc(98rpx + env(safe-area-inset-bottom));
  z-index: 9;
  display: flex;
  justify-content: center;
}
.mute-tip-text {
  padding: 8rpx 20rpx;
  border-radius: 28rpx;
  background: rgba(0, 0, 0, 0.56);
  color: #fff;
  font-size: 22rpx;
}
.bottom-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  padding: 14rpx 22rpx calc(14rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.bottom-bar--portrait {
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.68), rgba(0, 0, 0, 0));
}
.bottom-bar-main,
.bottom-bar-input-row {
  display: flex;
  width: 100%;
  align-items: center;
}
.bottom-bar-input-row {
  gap: 14rpx;
}
.goods-box {
  display: flex;
  width: 72rpx;
  height: 72rpx;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.42);
}
.goodsNumber {
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
}
.input-wrap {
  display: flex;
  height: 68rpx;
  min-width: 0;
  flex: 1;
  align-items: center;
  padding: 0 24rpx;
  border-radius: 36rpx;
  background: rgba(255, 255, 255, 0.18);
  box-sizing: border-box;
}
.bottom-bar--landscape .input-wrap {
  background: #f4f4f4;
}
.input-disabled {
  opacity: 0.72;
}
.msg-input {
  width: 100%;
  height: 68rpx;
  color: #fff;
  font-size: 26rpx;
}
.bottom-bar--landscape .msg-input {
  color: #222;
}
.send-btn {
  width: 108rpx;
  height: 64rpx;
  flex-shrink: 0;
  border-radius: 32rpx;
  background: #ff6b2e;
  color: #fff;
  font-size: 25rpx;
  line-height: 64rpx;
  text-align: center;
}
.toolbar-icons {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 14rpx;
}
.tool-btn {
  display: flex;
  min-width: 64rpx;
  height: 64rpx;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.36);
}
.bottom-bar--landscape .tool-btn {
  background: #f4f4f4;
}
.tool-icon-img {
  width: 42rpx;
  height: 42rpx;
}
.tool-text,
.like-number {
  color: #fff;
  font-size: 20rpx;
}
.tool-text.dark,
.bottom-bar--landscape .like-number {
  color: #333;
}
.tool-btn-like {
  min-width: 76rpx;
  padding: 0 10rpx;
  border-radius: 34rpx;
  gap: 4rpx;
}
.live-landscape {
  display: flex;
  height: 100vh;
  min-height: 100vh;
  flex-direction: column;
  padding-bottom: calc(88rpx + env(safe-area-inset-bottom));
  background: #fff;
  color: #202020;
  box-sizing: border-box;
}
.live-landscape.no-bottom,
.live-landscape--stage-collapsed {
  padding-bottom: 0;
}
.live-landscape--replay {
  background: #f6f6f6;
}
.video-section {
  position: relative;
  width: 750rpx;
  height: 422rpx;
  flex-shrink: 0;
  overflow: hidden;
  background: linear-gradient(89.94deg, #fec06b 0.05%, #fc8376 48.07%, #fe8bcf 99.94%);
}
.live-landscape--live .video-section,
.live-landscape--live .video-section--playing {
  background: #000;
}
.live-landscape--stage-collapsed .video-section {
  position: fixed;
  right: 24rpx;
  bottom: calc(140rpx + env(safe-area-inset-bottom));
  z-index: 60;
  width: 280rpx;
  height: 158rpx;
  min-height: 0;
  border-radius: 16rpx;
  background: #000;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.35);
}
.live-landscape--stage-collapsed .video-section--mini-hidden {
  visibility: hidden;
  pointer-events: none;
}
.replay-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
}
.live-landscape--stage-collapsed .video-section .video-controls,
.live-landscape--stage-collapsed .video-section .live-landscape-preview,
.live-landscape--stage-collapsed .video-section .live-landscape-reward,
.live-landscape--stage-collapsed .video-section .replay-video--poster {
  display: none;
}
.live-landscape-preview {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 3;
}
.live-landscape-preview__cover {
  width: 100%;
  height: 100%;
}
.live-landscape-reward {
  position: absolute;
  top: 218rpx;
  right: 22rpx;
  z-index: 6;
  display: flex;
  width: 74rpx;
  height: 74rpx;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
}
.live-landscape-reward__image {
  display: flex;
  width: 74rpx;
  height: 74rpx;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(180deg, #ff8b2c, #ff3d2e);
}
.live-landscape-reward__mark {
  color: #fff;
  font-size: 34rpx;
  font-weight: 800;
}
.live-landscape-reward__text {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 4rpx;
  color: #fff;
  font-size: 18rpx;
  font-weight: 700;
  line-height: 22rpx;
  text-align: center;
}
.video-controls {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 8;
  display: flex;
  height: 80rpx;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%);
  box-sizing: border-box;
}
.video-controls__live-tag,
.video-controls__btn {
  display: flex;
  height: 42rpx;
  align-items: center;
  gap: 8rpx;
  padding: 0 16rpx;
  border-radius: 24rpx;
  background: rgba(0, 0, 0, 0.42);
}
.video-controls__right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.live-landscape--live .video-controls__btn {
  width: 56rpx;
  height: 56rpx;
  justify-content: center;
  padding: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.15);
}
.live-landscape-collapse {
  background: transparent;
}
.live-landscape-collapse__image {
  display: flex;
  width: 40rpx;
  height: 40rpx;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 40rpx;
  transition: transform 0.2s ease;
}
.live-landscape-collapse__image--flipped {
  transform: rotate(180deg);
}
.video-mini-controls {
  display: none;
}
.live-landscape--stage-collapsed .video-mini-controls {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 2;
  display: block;
  pointer-events: none;
}
.video-mini-controls__close {
  position: absolute;
  top: 4rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  color: #fff;
  font-size: 38rpx;
  line-height: 36rpx;
  text-align: center;
  pointer-events: auto;
}
.video-mini-controls__mute {
  position: absolute;
  right: 8rpx;
  bottom: 8rpx;
  display: flex;
  width: 36rpx;
  height: 36rpx;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  pointer-events: auto;
}
.video-mini-controls__icon {
  color: #fff;
  font-size: 20rpx;
}
.video-controls__live-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #ff4141;
}
.video-controls__live-text,
.video-controls__text {
  color: #fff;
  font-size: 20rpx;
}
.video-top {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 6;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24rpx 32rpx 0;
  box-sizing: border-box;
  pointer-events: none;
}
.video-top .anchor-left,
.video-top .live-landscape-tool-group {
  pointer-events: auto;
}
.live-landscape--live .video-top {
  top: 20rpx;
  padding: 0 28rpx;
}
.live-landscape--live .anchor-left {
  flex-direction: column;
  align-items: flex-start;
}
.live-landscape--live .anchor-info {
  display: none;
}
.live-landscape-tool-group {
  display: flex;
  align-items: center;
  gap: 18rpx;
}
.live-landscape-report,
.live-landscape-round-tool,
.live-landscape-fire-count {
  display: flex;
  min-width: 58rpx;
  height: 46rpx;
  align-items: center;
  justify-content: center;
  padding: 0 14rpx;
  border-radius: 28rpx;
  background: rgba(0, 0, 0, 0.32);
}
.live-landscape-report__text,
.live-landscape-round-tool__text,
.live-landscape-fire-count__text {
  color: #fff;
  font-size: 20rpx;
}
.live-landscape-fire-count__icon {
  width: 24rpx;
  height: 24rpx;
  margin-right: 6rpx;
}
.live-landscape--live .live-landscape-report {
  min-width: 114rpx;
  height: 48rpx;
}
.live-landscape--live .live-landscape-round-tool {
  width: 52rpx;
  min-width: 52rpx;
  height: 52rpx;
  padding: 0;
  border-radius: 50%;
  background: transparent;
}
.live-landscape--live .live-landscape-fire-count {
  min-width: 86rpx;
  height: 48rpx;
  background: rgba(0, 0, 0, 0.15);
}
.interact-section {
  position: relative;
  display: flex;
  width: 100%;
  min-width: 0;
  height: 0;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  background: #f6f6f6;
}
.live-landscape-collapsed-header {
  display: flex;
  width: 100%;
  height: 80rpx;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  background: linear-gradient(135deg, #1a0533 0%, #3d1a6e 50%, #6b21a8 100%);
  box-sizing: border-box;
}
.live-landscape-collapsed-header__left {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.live-landscape-collapsed-header__fire {
  width: 36rpx;
  height: 36rpx;
}
.live-landscape-collapsed-header__count {
  color: #fff;
  font-size: 26rpx;
  font-weight: 600;
}
.live-landscape-collapsed-header__restore {
  display: flex;
  width: 56rpx;
  height: 56rpx;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}
.landscape-tab-bar {
  display: flex;
  height: 88rpx;
  flex-shrink: 0;
  align-items: center;
  padding: 0 22rpx;
  border-bottom: 1rpx solid #ededed;
  background: #fff;
  box-sizing: border-box;
}
.live-landscape--live .landscape-tab-bar {
  height: 80rpx;
  border-bottom-color: rgba(0, 0, 0, 0.08);
}
.landscape-tab {
  position: relative;
  margin-right: 34rpx;
  color: #7f7f7f;
  font-size: 28rpx;
  line-height: 88rpx;
}
.live-landscape--live .landscape-tab {
  line-height: 80rpx;
}
.landscape-tab.active {
  color: #000;
  font-weight: 700;
}
.landscape-tab.active::after {
  position: absolute;
  left: 12rpx;
  right: 12rpx;
  bottom: 10rpx;
  height: 5rpx;
  border-radius: 5rpx;
  background: #ff6b2e;
  content: "";
}
.interact-content,
.products-content,
.sign-content {
  position: relative;
  min-height: 0;
  flex: 1;
  overflow: hidden;
}
.comment-list,
.landscape-products-scroll {
  height: 100%;
  padding: 18rpx 22rpx 116rpx;
  box-sizing: border-box;
}
.comment-item {
  display: flex;
  margin-bottom: 18rpx;
}
.comment-avatar {
  width: 58rpx;
  height: 58rpx;
  flex-shrink: 0;
  border-radius: 50%;
  background: #dedede;
}
.comment-body {
  min-width: 0;
  flex: 1;
  margin-left: 12rpx;
}
.comment-nick-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.comment-nick {
  color: #666;
  font-size: 22rpx;
}
.comment-bubble {
  display: inline-flex;
  max-width: 100%;
  margin-top: 6rpx;
  padding: 10rpx 14rpx;
  border-radius: 14rpx;
  background: #fff;
}
.gift-bubble {
  background: #fff6de;
}
.comment-content {
  color: #333;
  font-size: 25rpx;
  line-height: 36rpx;
  word-break: break-all;
}
.comment-item--pinned {
  padding: 18rpx 22rpx 0;
  box-sizing: border-box;
}
.bottom-bar--landscape {
  position: absolute;
  background: #fff;
  box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.04);
}
.landscape-product-anchor {
  position: absolute;
  left: 22rpx;
  right: 22rpx;
  bottom: calc(104rpx + env(safe-area-inset-bottom));
  z-index: 8;
}
.product-card-mini--landscape {
  width: 100%;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
}
.sign-content {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  padding: 48rpx;
  box-sizing: border-box;
  background: #fff;
}
.replay-list {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(92rpx + env(safe-area-inset-bottom));
  z-index: 11;
  padding: 10rpx 20rpx;
  background: rgba(0, 0, 0, 0.24);
  box-sizing: border-box;
}
.live-landscape + .replay-list {
  top: 356rpx;
  bottom: auto;
  left: 0;
  right: auto;
  width: 750rpx;
}
.replay-scroll {
  white-space: nowrap;
}
.replay-item {
  display: inline-flex;
  max-width: 260rpx;
  height: 56rpx;
  align-items: center;
  margin-right: 12rpx;
  padding: 0 20rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-size: 24rpx;
}
.replay-item.active {
  background: #ff6b2e;
}
.sheet-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 90;
  display: flex;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.48);
}
.product-list-mask {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: flex-end;
}
.product-list-popup {
  display: flex;
  width: 100%;
  height: 75vh;
  overflow: hidden;
  flex-direction: column;
  border-top-left-radius: 48rpx;
  border-top-right-radius: 48rpx;
  background: rgba(255, 255, 255, 0.96);
}
.popup-header {
  height: 96rpx;
  flex-shrink: 0;
  padding: 0 32rpx;
  color: #666;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 96rpx;
}
.goods-all-box,
.product-list {
  min-height: 0;
  flex: 1;
}
.sheet-empty {
  padding: 80rpx 0;
  color: #999;
  font-size: 26rpx;
  text-align: center;
}
.goods-list-item {
  display: flex;
  align-items: center;
  padding: 22rpx 28rpx;
  border-bottom: 1rpx solid #f1f1f1;
  box-sizing: border-box;
}
.goods-list-image {
  width: 132rpx;
  height: 132rpx;
  flex-shrink: 0;
  border-radius: 12rpx;
  background: #f3f3f3;
}
.goods-list-info {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  margin-left: 18rpx;
}
.goods-list-name {
  display: -webkit-box;
  overflow: hidden;
  color: #222;
  font-size: 27rpx;
  line-height: 38rpx;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.goods-list-price {
  margin-top: 16rpx;
  color: #f03b2f;
  font-size: 30rpx;
  font-weight: 700;
}
.goods-list-buy {
  width: 116rpx;
  height: 58rpx;
  flex-shrink: 0;
  border-radius: 29rpx;
  background: #ff6b2e;
  color: #fff;
  font-size: 24rpx;
  line-height: 58rpx;
  text-align: center;
}
.marketing-float-actions {
  position: absolute;
  right: 22rpx;
  bottom: calc(186rpx + env(safe-area-inset-bottom));
  z-index: 12;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}
.marketing-float-actions--landscape {
  left: 22rpx;
  right: auto;
  bottom: 98rpx;
}
.marketing-float-btn {
  display: flex;
  width: 82rpx;
  height: 82rpx;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(180deg, #ff8b2c, #ff3d2e);
  color: #fff;
  font-size: 22rpx;
  box-shadow: 0 8rpx 18rpx rgba(255, 86, 35, 0.32);
}
.marketing-sheet {
  width: 100%;
  max-height: 62vh;
  padding-bottom: env(safe-area-inset-bottom);
  border-radius: 24rpx 24rpx 0 0;
  background: #fff;
  color: #222;
}
.sheet-head {
  display: flex;
  height: 96rpx;
  align-items: center;
  justify-content: space-between;
  padding: 0 28rpx;
  border-bottom: 1rpx solid #f1f1f1;
  box-sizing: border-box;
}
.sheet-title {
  color: #222;
  font-size: 32rpx;
  font-weight: 600;
}
.sheet-close {
  color: #777;
  font-size: 26rpx;
}
.marketing-content {
  padding: 44rpx 32rpx 56rpx;
  box-sizing: border-box;
}
.marketing-list {
  max-height: calc(62vh - 96rpx);
}
.marketing-item {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 26rpx 28rpx;
  border-bottom: 1rpx solid #f5f5f5;
  box-sizing: border-box;
}
.marketing-info {
  min-width: 0;
  flex: 1;
}
.marketing-title {
  display: block;
  color: #222;
  font-size: 30rpx;
  font-weight: 600;
}
.marketing-desc {
  display: block;
  margin-top: 12rpx;
  color: #777;
  font-size: 25rpx;
  line-height: 36rpx;
}
.marketing-btn {
  width: 156rpx;
  height: 62rpx;
  margin: 32rpx 0 0;
  border-radius: 31rpx;
  background: #ff6b2e;
  color: #fff;
  font-size: 25rpx;
  line-height: 62rpx;
}
.marketing-item .marketing-btn {
  margin: 0;
}
.marketing-btn[disabled] {
  background: #bbb;
  color: #fff;
}
.entry-overlay-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 88;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.18);
}
.entry-overlay-content--landscape {
  z-index: 14;
}
.entry-btn {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 48rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.25);
  border-radius: 60rpx;
  background: rgba(255, 255, 255, 0.15);
}
.entry-btn-text {
  color: #fff;
  font-size: 30rpx;
  font-weight: 500;
}
.bars-anim {
  display: flex;
  height: 36rpx;
  align-items: flex-end;
  gap: 6rpx;
}
.bar {
  width: 6rpx;
  border-radius: 3rpx;
  background: #fff;
  animation: barBounce 0.8s ease-in-out infinite alternate;
}
.bar1 {
  height: 20rpx;
}
.bar2 {
  height: 32rpx;
  animation-delay: 0.2s;
}
.bar3 {
  height: 20rpx;
  animation-delay: 0.4s;
}
@keyframes barBounce {
  0% {
    transform: scaleY(0.4);
  }
  100% {
    transform: scaleY(1);
  }
}
.live-ended-overlay {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
}
.live-ended-overlay--portrait {
  position: fixed;
  z-index: 100;
}
.live-ended-content {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20rpx;
}
.live-ended-title {
  color: #fff;
  font-size: 40rpx;
  font-weight: 600;
}
.live-ended-views {
  margin-bottom: 20rpx;
  color: rgba(255, 255, 255, 0.6);
  font-size: 28rpx;
}
.live-ended-avatar-wrap,
.live-ended-avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
}
.live-ended-avatar-wrap {
  overflow: hidden;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}
.live-ended-name {
  margin-top: 4rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
}
.access-denied-overlay {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 54rpx;
  background: #999;
  box-sizing: border-box;
}
.access-denied-card {
  position: relative;
  display: flex;
  width: 100%;
  max-width: 620rpx;
  min-height: 560rpx;
  align-items: center;
  flex-direction: column;
  padding: 90rpx 30rpx 52rpx;
  border-radius: 28rpx;
  background: #fff;
  box-sizing: border-box;
}
.access-denied-lock {
  display: flex;
  width: 150rpx;
  height: 150rpx;
  align-items: center;
  justify-content: center;
  margin-top: -140rpx;
  margin-bottom: 28rpx;
  border-radius: 50%;
  background: #ff6b2e;
  color: #fff;
  font-size: 70rpx;
  font-weight: 700;
}
.access-denied-title {
  width: 100%;
  margin-bottom: 24rpx;
  color: #111;
  font-size: 42rpx;
  font-weight: 700;
  line-height: 1.22;
  text-align: center;
  word-break: break-all;
}
.access-denied-anchor {
  display: flex;
  width: 100%;
  align-items: center;
  margin-top: auto;
}
.access-denied-anchor-avatar {
  width: 80rpx;
  height: 80rpx;
  flex-shrink: 0;
  border-radius: 50%;
  background: #f2f2f2;
}
.access-denied-anchor-meta {
  display: flex;
  min-width: 0;
  flex-direction: column;
  margin-left: 22rpx;
}
.access-denied-anchor-name {
  color: #1d1d1f;
  font-size: 38rpx;
  font-weight: 600;
}
.access-denied-anchor-id {
  margin-top: 8rpx;
  color: #b8bcc5;
  font-size: 24rpx;
  line-height: 1.35;
  word-break: break-all;
}
.viewer-limit {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;
  overflow: hidden;
  background: #fff;
}
.viewer-limit__image {
  width: 418rpx;
  height: 340rpx;
  margin: 202rpx auto 20rpx;
  border-radius: 40rpx;
  background: linear-gradient(180deg, #fff2e8, #ffd8c2);
}
.viewer-limit__text {
  display: block;
  width: 404rpx;
  margin: 0 auto;
  color: #999;
  font-size: 32rpx;
  line-height: 44rpx;
  text-align: center;
}
.live-marquee-ad {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 10000;
  height: 56rpx;
  overflow: hidden;
  pointer-events: none;
}
.live-marquee-ad--top {
  top: 156rpx;
}
.live-marquee-ad--middle {
  top: 50%;
  transform: translateY(-50%);
}
.live-marquee-ad--bottom {
  bottom: 38%;
}
.live-marquee-ad--landscape {
  position: relative;
  flex-shrink: 0;
  height: 72rpx;
  margin-top: 10rpx;
}
.live-marquee-ad__track {
  position: absolute;
  left: 0;
  top: 4rpx;
  display: flex;
  min-width: 750rpx;
  height: 48rpx;
  align-items: center;
  padding: 0 12rpx;
  border-radius: 10rpx;
  box-shadow: 0 8rpx 22rpx rgba(0, 0, 0, 0.16);
  box-sizing: border-box;
  white-space: nowrap;
  pointer-events: auto;
  animation: liveMarqueeAdMove 9s linear infinite;
}
.live-marquee-ad__text {
  font-size: 24rpx;
  font-weight: 700;
  line-height: 24rpx;
  white-space: nowrap;
}
.live-marquee-ad__close {
  position: relative;
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
  margin-left: 10rpx;
}
.live-marquee-ad__close-line {
  position: absolute;
  left: 7rpx;
  top: 15rpx;
  width: 18rpx;
  height: 2rpx;
  border-radius: 2rpx;
  background: currentColor;
}
.live-marquee-ad__close-line--a {
  transform: rotate(45deg);
}
.live-marquee-ad__close-line--b {
  transform: rotate(-45deg);
}
@keyframes liveMarqueeAdMove {
  0% {
    transform: translateX(750rpx);
  }
  100% {
    transform: translateX(-100%);
  }
}
.external-lottery-tools {
  position: absolute;
  top: 96rpx;
  right: 16rpx;
  z-index: 7;
  display: flex;
  width: 96rpx;
  align-items: center;
  flex-direction: column;
  gap: 10rpx;
  pointer-events: auto;
}
.external-lottery-tools__comment {
  position: relative;
  display: flex;
  width: 96rpx;
  min-height: 112rpx;
  align-items: flex-start;
  justify-content: center;
}
.external-lottery-tools__bubble {
  position: absolute;
  top: 12rpx;
  right: 104rpx;
  width: 214rpx;
  min-height: 116rpx;
  padding: 14rpx 18rpx;
  border-radius: 12rpx;
  background: #fff;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
  box-sizing: border-box;
  color: #333;
}
.external-lottery-tools__bubble-text {
  display: block;
  font-size: 24rpx;
  line-height: 36rpx;
  white-space: normal;
  word-break: break-all;
}
.external-lottery-tools__keyword {
  color: #b942ff;
  font-size: 25rpx;
  font-weight: 700;
  line-height: 36rpx;
  word-break: break-all;
}
.external-lottery-tools__bubble-close {
  position: absolute;
  top: 0;
  right: 0;
  width: 32rpx;
  height: 32rpx;
  color: #999;
  font-size: 24rpx;
  line-height: 32rpx;
  text-align: center;
}
.external-lottery-tools__comment-entry,
.external-lottery-tools__lucky-bag {
  position: relative;
  display: flex;
  width: 96rpx;
  min-height: 96rpx;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.external-lottery-tools__comment-icon {
  display: flex;
  width: 88rpx;
  height: 88rpx;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(180deg, #ff8b2c, #ff3d2e);
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
}
.external-lottery-tools__entry-label {
  position: absolute;
  bottom: 9rpx;
  left: 50%;
  min-width: 48rpx;
  max-width: 78rpx;
  height: 24rpx;
  padding: 2rpx 8rpx;
  border-radius: 12rpx;
  background: rgba(0, 0, 0, 0.38);
  color: #fff;
  font-size: 16rpx;
  line-height: 20rpx;
  text-align: center;
  transform: translateX(-50%);
  box-sizing: border-box;
}
.bottom-bar-main {
  flex-direction: column;
  align-items: stretch;
}
.quick-replies-bar {
  width: 100%;
  height: 56rpx;
  margin-bottom: 10rpx;
  white-space: nowrap;
}
.quick-replies-inner {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.quick-reply-tag {
  display: inline-flex;
  height: 48rpx;
  align-items: center;
  padding: 0 18rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}
.quick-reply-tag--landscape {
  background: #f4f4f4;
  color: #333;
}
.quick-reply-text {
  font-size: 22rpx;
  white-space: nowrap;
}
.buying-notice,
.marketing-notice {
  position: absolute;
  left: 32rpx;
  right: 32rpx;
  z-index: 13;
  display: flex;
  justify-content: center;
  pointer-events: none;
}
.buying-notice {
  bottom: calc(500rpx + env(safe-area-inset-bottom));
}
.marketing-notice {
  bottom: calc(554rpx + env(safe-area-inset-bottom));
}
.buying-notice__text,
.marketing-notice__text {
  max-width: 610rpx;
  overflow: hidden;
  padding: 10rpx 20rpx;
  border-radius: 28rpx;
  background: rgba(255, 107, 46, 0.9);
  color: #fff;
  font-size: 23rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.marketing-notice__text {
  background: rgba(185, 66, 255, 0.9);
}
.live-playback-debug-float {
  position: absolute;
  left: 20rpx;
  top: 230rpx;
  z-index: 10001;
  display: flex;
  max-width: 520rpx;
  flex-direction: column;
  gap: 4rpx;
  padding: 12rpx 16rpx;
  border-radius: 12rpx;
  background: rgba(0, 0, 0, 0.62);
  color: #fff;
  pointer-events: none;
}
.live-playback-debug-float__line {
  max-width: 500rpx;
  overflow: hidden;
  font-size: 20rpx;
  line-height: 28rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
