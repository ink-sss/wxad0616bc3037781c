import { reactive } from "vue";

/**
 * 页面壳到横竖屏舞台组件的状态/动作绑定。
 * 职责边界：只把 entry 的 ref/computed/action 组合成 s/a 对象；不在这里派生新业务状态。
 */
function buildVideoState(ctx) {
  return {
    isWechatH5: false,
    isIOS: false,
    mode: ctx.mode,
    accessDenied: ctx.accessDenied,
    liveInitResolved: ctx.liveInitResolved,
    anchorName: ctx.anchorName,
    anchorAvatar: ctx.anchorAvatar,
    broadcastNavHeight: ctx.broadcastNavHeight,
    isWaitingSchedule: ctx.isWaitingSchedule,
    warmUpVideoUrl: ctx.warmUpVideoUrl,
    displayVideoUrl: ctx.displayVideoUrl,
    mediaSourceComponent: ctx.mediaSourceComponent,
    mediaSourceType: ctx.mediaSourceType,
    videoRenderKey: ctx.videoRenderKey,
    isReplay: ctx.isReplay,
    isLiveVisualMode: ctx.isLiveVisualMode,
    hasReplay: ctx.hasReplay,
    liveStatusText: ctx.liveStatusText,
    roomGroupType: ctx.roomGroupType,
    videoPoster: ctx.videoPoster,
    replayCover: ctx.replayCover,
    isMuted: ctx.isMuted,
    showWxAddrDonePlayBtn: ctx.showWxAddrDonePlayBtn,
    autoplayBlocked: ctx.autoplayBlocked,
    playbackErrorVisible: ctx.playbackErrorVisible,
    playbackErrorText: ctx.playbackErrorText,
    showReplayFirstVideoLoading: ctx.showReplayFirstVideoLoading,
    isPlaying: ctx.isPlaying,
    videoFrameReady: ctx.videoFrameReady,
    isIOSH5: ctx.isIOSH5,
    liveCover: ctx.liveCover,
    pushStatus: ctx.pushStatus,
    showNotStartedOverlay: ctx.showNotStartedOverlay,
    liveOverlayTitle: ctx.liveOverlayTitle,
    shouldShowEntryOverlay: ctx.shouldShowEntryOverlay,
    showLandscapeSubscribe: ctx.showLandscapeSubscribe,
    scheduleTimeStr: ctx.scheduleTimeStr,
    liveDate: ctx.liveDate,
  };
}

function buildRoomState(ctx) {
  return {
    likeCount: ctx.likeCount,
    roomSetting: ctx.roomSetting,
    viewerCountAnimating: ctx.viewerCountAnimating,
    displayViewerCount: ctx.displayViewerCount,
    quickReplies: ctx.quickReplies,
    tapEffects: ctx.tapEffects,
    comboInfo: ctx.comboInfo,
    shouldShowComments: ctx.shouldShowComments,
    scrollToId: ctx.scrollToId,
    commentScrollWithAnimation: ctx.commentScrollWithAnimation,
    messages: ctx.messages,
    visibleMessages: ctx.visibleMessages,
    enterNotice: ctx.enterNotice,
    buyingNotice: ctx.buyingNotice,
    goShoppingNotice: ctx.goShoppingNotice,
    productListSuccessNotice: ctx.productListSuccessNotice,
    pinnedMessage: ctx.pinnedMessage,
    muteTipVisible: ctx.muteTipVisible,
    userBlocked: ctx.userBlocked,
    muteRemainText: ctx.muteRemainText,
    inputText: ctx.inputText,
    inputFocused: ctx.inputFocused,
    keyboardHeight: ctx.keyboardHeight,
    chatDisabled: ctx.chatDisabled,
    bottomBarStyle: ctx.bottomBarStyle,
    hearts: ctx.hearts,
    commentListStyle: ctx.commentListStyle,
    defaultAvatar: ctx.defaultAvatar,
  };
}

function buildProductState(ctx) {
  return {
    showProduct: ctx.showProduct,
    showProductList: ctx.showProductList,
    currentProduct: ctx.currentProduct,
    productCardItems: ctx.productCardItems,
    productCardActiveIndex: ctx.productCardActiveIndex,
    productList: ctx.productList,
    productTotal: ctx.productTotal,
    productLoading: ctx.productLoading,
    productFinished: ctx.productFinished,
    showBuyPopup: ctx.showBuyPopup,
    buyProduct: ctx.buyProduct,
  };
}

function buildPurchaseState(ctx) {
  return {
    buyAddressText: ctx.buyAddressText,
    selectedAddress: ctx.selectedAddress,
    buyShippingFee: ctx.buyShippingFee,
    buyGoodsAmount: ctx.buyGoodsAmount,
    buyTotalPrice: ctx.buyTotalPrice,
    buyDiscountAmount: ctx.buyDiscountAmount,
    buyRemark: ctx.buyRemark,
    buyLoading: ctx.buyLoading,
    usableCoupons: ctx.usableCoupons,
    unusableCoupons: ctx.unusableCoupons,
    selectedCouponId: ctx.selectedCouponId,
    couponLoading: ctx.couponLoading,
    showAddressPopup: ctx.showAddressPopup,
    addressList: ctx.addressList,
    selectedAddressId: ctx.selectedAddressId,
    showAddressFormPopup: ctx.showAddressFormPopup,
    editAddressData: ctx.editAddressData,
  };
}

function buildPanelState(ctx) {
  return {
    showShare: ctx.showShare,
    showCenterPopup: ctx.showCenterPopup,
    centerPopupName: ctx.centerPopupName,
    centerPopupAvatar: ctx.centerPopupAvatar,
    centerPopupOrderStats: ctx.centerPopupOrderStats,
    showLiveReportPopup: ctx.showLiveReportPopup,
    liveId: ctx.liveId,
    roomCode: ctx.roomCode,
    replayCurrentVideoId: ctx.replayCurrentVideoId,
    roomCurrentTermId: ctx.roomCurrentTermId,
    myUserId: ctx.myUserId,
    shareCode: ctx.shareCode,
    liveBindId: ctx.liveBindId,
    liveTenantId: ctx.liveTenantId,
    broadcastReturnPath: ctx.broadcastReturnPath,
    liveName: ctx.liveName,
    signConfig: ctx.signConfig,
    showSignPopup: ctx.showSignPopup,
    signFields: ctx.signFields,
    hasSigned: ctx.hasSigned,
    activeTab: ctx.activeTab,
    activeTabIndex: ctx.activeTabIndex,
    // [分销员] 控制分享按钮可见性：isDistributor && distributorStatus === 1 才显示
    isDistributor: ctx.isDistributor,
    distributorStatus: ctx.distributorStatus,
  };
}

function buildMarketingState(ctx) {
  return {
    hasVisibleWatchRewardTasks: ctx.hasVisibleWatchRewardTasks,
    watchRewardEntryLabel: ctx.watchRewardEntryLabel,
    commentLotteryEntryVisible: ctx.commentLotteryEntryVisible,
    commentLotteryEntryKeyword: ctx.commentLotteryEntryKeyword,
    commentLotteryBubbleVisible: ctx.commentLotteryBubbleVisible,
  };
}

function buildStageState(ctx) {
  return reactive({
    ...buildVideoState(ctx),
    ...buildRoomState(ctx),
    ...buildProductState(ctx),
    ...buildPurchaseState(ctx),
    ...buildPanelState(ctx),
    ...buildMarketingState(ctx),
  });
}

function buildSetterActions(ctx) {
  return {
    setIsPlaying(value) {
      ctx.isPlaying.value = value;
    },
    setShowProduct(value) {
      ctx.showProduct.value = value;
    },
    setShowProductList(value) {
      ctx.showProductList.value = value;
    },
    setShowShare(value) {
      ctx.showShare.value = value;
    },
    setShowCenterPopup(value) {
      ctx.showCenterPopup.value = value;
    },
    setShowBuyPopup(value) {
      ctx.showBuyPopup.value = value;
    },
    setShowAddressPopup(value) {
      ctx.showAddressPopup.value = value;
    },
    setShowAddressFormPopup(value) {
      ctx.showAddressFormPopup.value = value;
    },
    setShowSignPopup(value) {
      ctx.showSignPopup.value = value;
    },
    setBuyRemark(value) {
      ctx.buyRemark.value = value;
    },
    setActiveTab(value) {
      ctx.activeTab.value = value;
    },
    setActiveTabIndex(value) {
      ctx.activeTabIndex.value = value;
    },
    setInputText(value) {
      ctx.inputText.value = value;
    },
    setShowLiveReportPopup(value) {
      ctx.showLiveReportPopup.value = value;
    },
    setLandscapeMiniActive(value) {
      ctx.setLandscapeMiniActive?.(value);
    },
  };
}

function buildVideoActions(ctx) {
  return {
    goReport: ctx.goReport,
    onVideoPlay: ctx.onVideoPlay,
    onVideoTimeUpdate: ctx.onVideoTimeUpdate,
    onVideoTap: ctx.onVideoTap,
    manualPlayVideo: ctx.manualPlayVideo,
    retryPlayback: ctx.retryPlayback,
    handleVideoPlayerEnded: ctx.handleVideoPlayerEnded,
    handleLivePlayerFailure: ctx.handleLivePlayerFailure,
    markPlaybackReady: ctx.markPlaybackReady,
    setVideoFrameReady: ctx.setVideoFrameReady,
    enterLive: ctx.enterLive,
    onSubscribePush: ctx.onSubscribePush,
    onTabChange: ctx.onTabChange,
    getVideoPlayer: ctx.getVideoPlayer,
    toggleMute() {
      const muted = !ctx.isMuted.value;
      ctx.isMuted.value = muted;
      const player = typeof ctx.getVideoPlayer === "function" ? ctx.getVideoPlayer() : null;
      if (player && typeof player.setMuted === "function") {
        player.setMuted(muted);
      }
      if (muted) {
        ctx.clearStoredSoundIntentRestore?.();
      }
      ctx.setIOSWechatBridgeSoundAutoPlayAllowed?.(!muted);
      ctx.syncLiveMiniWindowState?.({
        force: true,
        muted,
        canPlayWithSound: !muted,
        soundMutedByUser: muted,
      });
    },
  };
}

function buildProductActions(ctx) {
  return {
    onProductCardChange: ctx.onProductCardChange,
    onGrab: ctx.onGrab,
    onProductBuy: ctx.onProductBuy,
    onProductDetail: ctx.onProductDetail,
    loadProductList: ctx.loadProductList,
    toggleProduct: ctx.toggleProduct,
    openBuyAddressPopup: ctx.openBuyAddressPopup,
    onBuyQuantityChange: ctx.onBuyQuantityChange,
    onBuySkuChange: ctx.onBuySkuChange,
    onBuyCouponSelect: ctx.onBuyCouponSelect,
    onBuyConfirm: ctx.onBuyConfirm,
  };
}

function buildInputActions(ctx) {
  return {
    focusInput: ctx.focusInput,
    onInputFocus: ctx.onInputFocus,
    sendMessage: ctx.sendMessage,
    onInputBlur: ctx.onInputBlur,
    handleSendClick: ctx.handleSendClick,
    handleCommentWindowScroll: ctx.handleCommentWindowScroll,
    loadPreviousCommentWindow: ctx.loadPreviousCommentWindow,
    loadNextCommentWindow: ctx.loadNextCommentWindow,
    doLike: ctx.doLike,
    finishHeartAnimation: ctx.finishHeartAnimation,
    finishTapEffect: ctx.finishTapEffect,
  };
}

function buildPanelActions(ctx) {
  return {
    toggleCenter: ctx.toggleCenter,
    onShareAction: ctx.onShareAction,
    onCenterAction: ctx.onCenterAction,
    onSignedDone: ctx.onSignedDone,
    isTruthyFlag: ctx.isTruthyFlag,
  };
}

function buildAddressActions(ctx) {
  return {
    onSelectBuyAddress: ctx.onSelectBuyAddress,
    onAddBuyAddress: ctx.onAddBuyAddress,
    onEditBuyAddress: ctx.onEditBuyAddress,
    onDeleteBuyAddress: ctx.onDeleteBuyAddress,
    onImportWxAddress: ctx.onImportWxAddress,
    onBuyAddressSaved: ctx.onBuyAddressSaved,
  };
}

function buildMarketingActions(ctx) {
  return {
    openCommentPrizeRuleModal: ctx.openCommentPrizeRuleModal,
    openWatchRewardPanel: ctx.openWatchRewardPanel,
  };
}

function buildStageActions(ctx) {
  return {
    ...buildSetterActions(ctx),
    ...buildVideoActions(ctx),
    ...buildProductActions(ctx),
    ...buildInputActions(ctx),
    ...buildPanelActions(ctx),
    ...buildAddressActions(ctx),
    ...buildMarketingActions(ctx),
  };
}

export function useLiveStageBinding(ctx) {
  return {
    stageState: buildStageState(ctx),
    stageActions: buildStageActions(ctx),
  };
}
