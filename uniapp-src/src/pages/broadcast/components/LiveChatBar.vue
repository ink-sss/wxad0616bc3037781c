<template>
  <view
    ref="barRef"
    v-if="visible"
    v-show="show"
    class="bottom-bar"
    :class="[
      { 'bottom-bar--focused': focused },
      { 'bottom-bar--live-toolbar': useLiveToolbar },
      variant === 'landscape' ? 'bottom-bar--landscape' : 'bottom-bar--portrait',
    ]"
    :style="bottomStyle"
  >
    <slot name="prefix"></slot>
    <!-- 快捷回复完整内容气泡：放在 scroll-view 外层避免被裁剪 -->
    <view
      v-if="expandedQuickReply"
      ref="popoverRef"
      class="quick-reply-popover"
      :style="{ '--popover-left': popoverLeft, '--arrow-left': popoverArrowLeft }"
      @click.stop="onQuickReply(expandedQuickReply.content)"
    >{{ expandedQuickReply.content }}</view>
    <view class="bottom-bar-main">
      <!-- 快捷回复横滑条：聚焦时隐藏（用户自己打字，不需要占位） -->
      <scroll-view
        v-if="quickReplies.length > 0 && !focused"
        class="quick-replies-bar"
        scroll-x
        :show-scrollbar="false"
      >
        <view class="quick-replies-inner">
          <view
            v-for="item in quickReplies"
            :key="item.id"
            class="quick-reply-tag"
            @click="onQuickReply(item.content)"
          >
            <text class="quick-reply-text">{{ truncateText(item.content) }}</text>
            <view
              v-if="needTruncate(item.content)"
              class="quick-reply-eye"
              :class="{ 'quick-reply-eye--active': expandedId === item.id }"
              :data-reply-id="item.id"
              @click.stop="toggleExpand(item.id)"
            >
              <wd-icon
                name="view"
                size="22px"
                :color="variant === 'portrait' ? '#fff' : '#666'"
              />
            </view>
          </view>
        </view>
      </scroll-view>
      <!-- 输入行 -->
      <view class="bottom-bar-input-row">
        <view
          v-if="useLiveToolbar && variant === 'portrait' && roomSetting.showProduct !== 0 && !focused"
          class="goods-box goods-box-left product-cart-btn"
          @click="emit('product')"
        >
          <text class="goodsNumber">{{ productCountText }}</text>
        </view>
        <view
          class="input-wrap"
          :class="{ 'input-disabled': disabledText }"
          @click="emit('request-focus')"
          @touchend.stop="emit('request-focus')"
    >
      <input
        ref="inputRef"
        class="msg-input"
        :value="modelValue"
        :placeholder="disabledText || '说点什么吧~'"
        :placeholder-style="placeholderStyle"
        confirm-type="send"
        :adjust-position="false"
        :disabled="!!disabledText"
        @input="onInput"
        @focus="emit('focus', $event)"
        @confirm="emit('confirm', $event)"
        @blur="emit('blur', $event)"
      />
    </view>
    <view
      v-if="focused"
      class="send-btn"
      @mousedown.stop.prevent
      @touchend.stop.prevent="onSendTouchEnd"
      @click.stop="onSendClick"
      >发送</view
    >
    <view v-else class="toolbar-icons">
      <view
        v-if="roomSetting.showUserCenter !== 0"
        class="tool-btn d-c-c live-toolbar-center-btn"
        @click="emit('center')"
        ><image
          class="tool-icon-img"
          src="https://man.lqjy.cc/static/icons/center.png"
          mode="aspectFit"
      /></view>
      <view
        v-if="!useLiveToolbar && variant === 'portrait' && roomSetting.showProduct !== 0"
        class="tool-btn d-c-c"
        @click="emit('product')"
        ><image
          class="tool-icon-img"
          src="https://man.lqjy.cc/static/icons/cart.png"
          mode="aspectFit"
      /></view>
      <view
        v-if="useLiveToolbar && roomSetting.enableShare !== 0 && isDistributor && distributorStatus === 1"
        class="invite-icon-btn default-share"
        @click="emit('share')"
      >
        <image
          class="invite-icon-img"
          src="https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-ebu-invite-86c59add.png"
          mode="aspectFit"
        />
      </view>
      <view v-if="roomSetting.enableLike !== 0" class="like-btn-wrap">
        <view class="like-anim-area">
          <view
            v-for="heart in hearts"
            :key="heart.slotId + '-' + heart.runId"
            class="float-heart"
            :style="{
              left: heart.x + 'rpx',
              animationDuration: heart.dur + 's',
            }"
            @animationend="emit('heart-animation-end', heart.slotId, heart.runId)"
          >
            <image class="heart-emoji-img" :src="heart.img" mode="aspectFit" />
          </view>
        </view>
        <view
          v-if="useLiveToolbar"
          class="like sectionli tool-btn d-c-c tool-btn-like"
          @click="emit('like')"
        >
          <view class="sectionliImg like_container">
            <image
              class="clickXin tool-icon-img"
              src="https://man.lqjy.cc/static/zan/zan_1.png"
              mode="aspectFit"
            />
          </view>
          <text class="like-number zanval">{{ likeCountText }}</text>
        </view>
        <view
          v-else
          class="tool-btn d-c-c tool-btn-like"
          @click="emit('like')"
        >
          <image
            class="tool-icon-img"
            src="https://man.lqjy.cc/static/zan/zan_1.png"
            mode="aspectFit"
          />
          <text v-if="variant === 'landscape'" class="like-number zanval">{{ likeCountText }}</text>
        </view>
      </view>
      <slot name="toolbar-extra"></slot>
    </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, getCurrentInstance, ref, nextTick } from "vue";
import { formatLikeCount } from "../utils/entry-format.js";

const props = defineProps({
  variant: {
    type: String,
    default: "portrait",
  },
  visible: {
    type: Boolean,
    default: true,
  },
  show: {
    type: Boolean,
    default: true,
  },
  focused: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: String,
    default: "",
  },
  disabledText: {
    type: String,
    default: "",
  },
  bottomStyle: {
    type: Object,
    default: () => ({}),
  },
  roomSetting: {
    type: Object,
    default: () => ({}),
  },
  hearts: {
    type: Array,
    default: () => [],
  },
  quickReplies: {
    type: Array,
    default: () => [],
  },
  productCount: {
    type: Number,
    default: 0,
  },
  likeCount: {
    type: [Number, String],
    default: 0,
  },
  liveToolbar: {
    type: Boolean,
    default: false,
  },
  // [2026-05-21] 分销员状态：仅 isDistributor && distributorStatus===1 才展示分享邀请 icon
  isDistributor: {
    type: Boolean,
    default: false,
  },
  distributorStatus: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits([
  "update:modelValue",
  "request-focus",
  "focus",
  "confirm",
  "blur",
  "send",
  "center",
  "product",
  "like",
  "heart-animation-end",
  "quick-reply",
  "share",
]);

const barRef = ref(null);
const inputRef = ref(null);
const popoverRef = ref(null);
const componentInstance = getCurrentInstance();

const placeholderStyle = computed(() => {
  if (props.variant === "portrait") {
    return props.focused ? "color:#bcbcc0;" : "color:rgba(255,255,255,0.7);";
  }
  return "color:#bcbcc0;";
});
const useLiveToolbar = computed(() => props.liveToolbar);
const productCountText = computed(() => {
  const count = Number(props.productCount || 0);
  if (count > 99) return "99+";
  return String(count);
});
const likeCountText = computed(() => formatLikeCount(props.likeCount));

const QUICK_REPLY_TRUNCATE_LEN = 6;
const POPOVER_EDGE_PADDING_RPX = 24;
const TOUCH_CLICK_SUPPRESS_MS = 500;
const expandedId = ref(null);
const popoverArrowLeft = ref('50%');
const popoverLeft = ref('24rpx');
let lastTouchSendAt = 0;
const expandedQuickReply = computed(() => {
  if (expandedId.value == null) return null;
  return props.quickReplies.find((item) => item.id === expandedId.value) || null;
});

function needTruncate(text) {
  return !!text && [...text].length > QUICK_REPLY_TRUNCATE_LEN;
}

function truncateText(text) {
  if (!text) return '';
  const chars = [...text];
  if (chars.length > QUICK_REPLY_TRUNCATE_LEN) {
    return chars.slice(0, QUICK_REPLY_TRUNCATE_LEN).join('') + '...';
  }
  return text;
}

function createComponentSelectorQuery() {
  const query = uni.createSelectorQuery();
  if (componentInstance?.proxy && typeof query.in === "function") {
    return query.in(componentInstance.proxy);
  }
  return query;
}

function queryQuickReplyPopoverRects() {
  return new Promise((resolve) => {
    const query = createComponentSelectorQuery();
    query.select(".quick-reply-eye--active").boundingClientRect();
    query.select(".bottom-bar").boundingClientRect();
    query.select(".quick-reply-popover").boundingClientRect();
    query.exec((rects = []) => resolve(rects));
  });
}

function resetQuickReplyPopoverPosition() {
  popoverLeft.value = `${POPOVER_EDGE_PADDING_RPX}rpx`;
  popoverArrowLeft.value = "50%";
}

async function updateQuickReplyPopoverPosition() {
  await nextTick();
  const [eyeRect, barRect, popoverRect] = await queryQuickReplyPopoverRects();
  if (!eyeRect || !barRect || !popoverRect) {
    resetQuickReplyPopoverPosition();
    return;
  }
  const barWidth = Number(barRect.width || 0);
  const popoverWidth = Number(popoverRect.width || 0);
  if (!barWidth || !popoverWidth) {
    resetQuickReplyPopoverPosition();
    return;
  }

  // Keep the H5 placement math, with selector-query rects instead of DOM APIs.
  const rpx = barWidth / 750;
  const edge = POPOVER_EDGE_PADDING_RPX * rpx;
  const eyeCenter = Number(eyeRect.left || 0) + Number(eyeRect.width || 0) / 2 - Number(barRect.left || 0);
  const idealLeft = eyeCenter - popoverWidth / 2;
  const maxLeft = Math.max(edge, barWidth - popoverWidth - edge);
  const finalLeft = Math.min(Math.max(idealLeft, edge), maxLeft);
  popoverLeft.value = `${finalLeft}px`;
  popoverArrowLeft.value = `${eyeCenter - finalLeft}px`;
}

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id;
  if (expandedId.value != null) {
    updateQuickReplyPopoverPosition();
  }
}

function onQuickReply(text) {
  expandedId.value = null;
  emit('quick-reply', text)
}

function onSendTouchEnd() {
  lastTouchSendAt = Date.now();
  emit("send");
}

function onSendClick() {
  if (Date.now() - lastTouchSendAt < TOUCH_CLICK_SUPPRESS_MS) return;
  emit("send");
}

function onInput(event) {
  emit(
    "update:modelValue",
    event?.detail?.value ?? event?.target?.value ?? event
  );
}

defineExpose({
  focus: () => inputRef.value?.focus?.(),
  blur: () => inputRef.value?.blur?.(),
  barRef,
});
</script>

<style lang="scss" scoped>
/* 底部栏主体（包裹快捷回复 + 输入行） */
.bottom-bar-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 12rpx;
}
.bottom-bar-input-row {
  display: flex;
  align-items: center;
  // gap: 24rpx;
}

/* 快捷回复横滑条 */
.quick-replies-bar {
  width: 100%;
  overflow: hidden;
  margin-bottom: 8rpx;
}
.quick-replies-inner {
  display: inline-flex;
  gap: 12rpx;
  padding: 10rpx 0 8rpx;
}
.quick-reply-tag {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 0 18rpx 0 24rpx;
  height: 56rpx;
  border-radius: 28rpx;
  font-size: 26rpx;
  white-space: nowrap;
  flex-shrink: 0;
}
.quick-reply-text {
  line-height: 1.2;
  white-space: nowrap;
  word-break: keep-all;
  overflow: hidden;
}
.quick-reply-eye {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 4rpx;
  padding: 0 4rpx;
}
.quick-reply-popover {
  position: absolute;
  left: var(--popover-left, 24rpx);
  bottom: calc(100% + 12rpx);
  padding: 18rpx 22rpx;
  background: #fff;
  color: #333;
  font-size: 26rpx;
  line-height: 1.5;
  border-radius: 16rpx;
  white-space: normal;
  word-break: break-all;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.18);
  z-index: 30;
  box-sizing: border-box;
  width: max-content;
  max-width: calc(100% - 48rpx);
}
.quick-reply-popover::after {
  content: '';
  position: absolute;
  top: 100%;
  left: clamp(12rpx, var(--arrow-left, 50%), calc(100% - 12rpx));
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border: 12rpx solid transparent;
  border-top-color: #fff;
}
.bottom-bar--portrait .quick-reply-tag {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: 1rpx solid rgba(255, 255, 255, 0.4);
}
.bottom-bar--landscape .quick-reply-tag {
  background: #f0f0f4;
  color: #333;
}

/* 点赞动画 */
.like-btn-wrap {
  position: relative;
}
.sectionli {
  position: relative;
  display: block;
}
.sectionli .sectionliImg {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 4;
  width: 100%;
  height: 100%;
  text-align: center;
}
.sectionli .sectionliImg .clickXin {
  width: 100%;
  height: 100%;
}
.like-number {
  position: absolute;
  left: 50%;
  top: -18rpx;
  z-index: 5;
  min-width: 48rpx;
  height: 26rpx;
  padding: 0 8rpx;
  border-radius: 14rpx;
  background: rgba(254, 74, 110, 0.8);
  color: #fff;
  font-size: 20rpx;
  line-height: 26rpx;
  text-align: center;
  white-space: nowrap;
  transform: translateX(-50%);
  box-sizing: border-box;
}
.like-anim-area {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 100rpx;
  height: 520rpx;
  pointer-events: none;
  overflow: hidden;
  z-index: 19;
}
.float-heart {
  position: absolute;
  bottom: 0;
  animation: floatUp linear forwards;
  opacity: 1;
  will-change: transform, opacity;
}
@keyframes floatUp {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  30% {
    transform: translateY(-130rpx) scale(1.3);
    opacity: 1;
  }
  60% {
    transform: translateY(-280rpx) scale(1.3);
    opacity: 0.95;
  }
  85% {
    transform: translateY(-410rpx) scale(1.3);
    opacity: 0.6;
  }
  100% {
    transform: translateY(-480rpx) scale(1.3);
    opacity: 0;
  }
}
.heart-emoji-img {
  width: 64rpx;
  height: 64rpx;
}

/* 底部工具栏 */
.bottom-bar {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 750rpx;
  // padding: 12rpx 32rpx;
  padding-bottom: calc(12rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  gap: 24rpx;
  z-index: 10;
  box-sizing: border-box;
}
.toolbar-icons {
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.send-btn {
  min-width: 132rpx;
  height: 74rpx;
  padding: 0 30rpx;
  border-radius: 37rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 500;
  flex-shrink: 0;
  margin-left: 6rpx;
  box-sizing: border-box;
  background: #ff6e2d;
  color: #fff;
}
.tool-icon-img {
  width: 42rpx;
  height: 42rpx;
}
.tool-sign-text {
  font-size: 22rpx;
  color: #fff;
  font-weight: 500;
}
.tool-btn-raw {
  width: 74rpx;
  height: 74rpx;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}
.tool-share-img {
  width: 74rpx;
  height: 74rpx;
}
.goods-box {
  position: relative;
  top: 4rpx;
  width: 80rpx;
  height: 80rpx;
  margin-top: -12rpx;
  flex: 0 0 80rpx;
  background-image: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-gdl-icon-2-eeed29c4.png");
  background-repeat: no-repeat;
  background-size: contain;
  color: #fff;
  cursor: pointer;
}
.goodsNumber {
  position: absolute;
  top: 32%;
  left: 56%;
  transform: translate(-50%, 0);
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1;
}
.invite-icon-btn {
  width: 72rpx;
  height: 72rpx;
  flex-shrink: 0;
}
.invite-icon-img {
  width: 72rpx;
  height: 72rpx;
  display: block;
}

/* ===== 禁用态输入框 ===== */
.input-disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* 竖屏底部栏 */
.bottom-bar--portrait {
  // background: transparent;
}
.bottom-bar--portrait.bottom-bar--focused {
  background: #fff;
  padding-bottom: 12rpx;
}
.bottom-bar--portrait .input-wrap {
  position: relative;
  flex: 1;
  height: 74rpx;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
}
.bottom-bar--portrait.bottom-bar--focused .input-wrap {
  background: #f0f0f4;
}
.bottom-bar--portrait .msg-input {
  position: relative;
  z-index: 1;
  flex: 1;
  font-size: 26rpx;
  color: #fff;
  height: 74rpx;
}
.bottom-bar--portrait.bottom-bar--focused .msg-input {
  color: #333;
}
.bottom-bar--portrait .send-btn {
  background: #ff6e2d;
  color: #fff;
}
.bottom-bar--portrait .tool-btn {
  width: 74rpx;
  height: 74rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
}
.bottom-bar--portrait.bottom-bar--live-toolbar {
  padding-bottom: calc(10rpx + env(safe-area-inset-bottom));
  gap: 8rpx;
}
.bottom-bar--portrait.bottom-bar--live-toolbar .bottom-bar-input-row {
  border-radius: 12rpx;
}
.bottom-bar--portrait.bottom-bar--live-toolbar.bottom-bar--focused .bottom-bar-input-row {
  padding: 0;
  border-radius: 0;
  background: transparent;
}
.bottom-bar--portrait.bottom-bar--live-toolbar .quick-replies-inner {
  gap: 20rpx;
  padding: 10rpx 0 12rpx;
}
.bottom-bar--portrait.bottom-bar--live-toolbar .quick-reply-tag {
  height: 40rpx;
  max-width: 252rpx;
  padding: 6rpx 16rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.7);
  border-radius: 28rpx;
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  font-size: 28rpx;
  backdrop-filter: blur(10rpx);
}
.bottom-bar--portrait.bottom-bar--live-toolbar .input-wrap {
  height: 72rpx;
  padding: 0 18rpx;
  border: none;
  border-radius: 46rpx;
  box-shadow: none;
  backdrop-filter: none;
}
.bottom-bar--portrait.bottom-bar--live-toolbar.bottom-bar--focused .input-wrap {
  background: #f0f0f4;
}
.bottom-bar--portrait.bottom-bar--live-toolbar .msg-input {
  height: 72rpx;
  color: #fff;
  font-size: 26rpx;
  line-height: 72rpx;
}
.bottom-bar--portrait.bottom-bar--live-toolbar.bottom-bar--focused .msg-input {
  color: #333;
}
.bottom-bar--portrait.bottom-bar--live-toolbar .toolbar-icons {
  gap: 8rpx;
}
.bottom-bar--portrait.bottom-bar--live-toolbar .goods-box-left {
  width: 80rpx;
  height: 80rpx;
}
.bottom-bar--portrait.bottom-bar--live-toolbar .tool-btn {
  width: 72rpx;
  height: 72rpx;
  border: none;
  border-radius: 50%;
  background-color: transparent;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  box-shadow: none;
  backdrop-filter: none;
}
.bottom-bar--portrait.bottom-bar--live-toolbar .live-toolbar-center-btn {
  background-image: url("https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-ebu-add-86ea0992.png");
}
.bottom-bar--portrait.bottom-bar--live-toolbar .invite-icon-btn {
  width: 72rpx;
  height: 72rpx;
}
.bottom-bar--portrait.bottom-bar--live-toolbar .tool-btn-like {
  background-image: url("https://man.lqjy.cc/static/zan/zan_1.png");
}
.bottom-bar--portrait.bottom-bar--live-toolbar .tool-icon-img {
  width: 100%;
  height: 100%;
  opacity: 0;
}
.bottom-bar--portrait.bottom-bar--live-toolbar .send-btn {
  min-width: 112rpx;
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 36rpx;
  background: #ff6e2d;
  color: #fff;
  font-size: 28rpx;
  box-shadow: none;
}

/* 横屏底部栏 */
.bottom-bar--landscape {
  background: #fff;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.1);
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 58;
}
.bottom-bar--landscape .input-wrap {
  position: relative;
  flex: 1;
  height: 74rpx;
  background: #f0f0f4;
  border-radius: 74rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
}
.bottom-bar--landscape .msg-input {
  position: relative;
  z-index: 1;
  flex: 1;
  font-size: 26rpx;
  color: #333;
  height: 74rpx;
  background: transparent;
}
.bottom-bar--landscape .send-btn {
  background: #ff6e2d;
  color: #fff;
}
.bottom-bar--landscape .tool-btn {
  width: 74rpx;
  height: 74rpx;
  border-radius: 50%;
  background: #f0f0f4;
}
</style>
