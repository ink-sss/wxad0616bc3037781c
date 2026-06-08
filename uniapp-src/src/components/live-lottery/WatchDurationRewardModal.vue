<template>
  <view
    v-if="activeModal === 'watchGoodsReward'"
    class="watch-duration-reward-source"
    @click.self="emit('close')"
  >
    <view class="source-overlay"></view>
    <view class="center-watch-bg source-goods-reward-box enable-receive">
      <view class="source-goods-reward-content">
        <view class="source-goods-reward-title">获得商品 {{ goodsRewardQuantity }} 件</view>
        <view class="source-goods-reward-card">
          <image
            class="source-goods-reward-image"
            :src="goodsRewardImage"
            mode="aspectFill"
          />
          <view class="source-goods-reward-info">
            <view class="source-goods-reward-name van-multi-ellipsis--l3">{{ goodsRewardName }}</view>
            <view class="source-goods-reward-stock">{{ goodsRewardStockText }}</view>
          </view>
        </view>
        <view class="source-goods-reward-tip">数量有限，先到先得～</view>
        <view class="source-goods-reward-button" @click="emit('close')">
          {{ goodsRewardButtonText }}
        </view>
        <view v-if="rewardResult" class="source-goods-reward-record" @click="openPrizeRecord">
          前往 <text class="source-goods-reward-record-link">中奖记录</text> 查看详情
        </view>
      </view>
      <view class="source-goods-reward-close-row">
        <view class="source-goods-reward-close" @click="emit('close')"></view>
      </view>
    </view>
  </view>

  <view v-if="isWatchDurationRewardVisible" class="watch-duration-reward-source">
    <view class="source-overlay" @click="closeModal" @tap="closeModal"></view>
    <view class="source-popup w-full bg-transparent pt-52">
      <view class="bottom-reward-popup bg-white relative pt-52 safe-area-inset-bottom">
        <image
          :src="assets.watchRewardPopupBg"
          class="absolute top-0 left-0 w-750 h-52"
          mode="aspectFill"
        />
        <image
          :src="assets.watchRewardCloseIcon"
          class="watch-duration-reward-close absolute right-32 top--26 w-60 h-60"
          mode="aspectFill"
          @click.stop="closeModal"
          @tap.stop="closeModal"
        />

        <view class="list max-h-72vh overflow-auto">
          <view class="px-32">
            <view
              v-for="(reward, index) in displayRewards"
              :key="getRewardKey(reward, index)"
              class="pb-56"
            >
              <view class="flex justify-between">
                <view class="flex border-0">
                  <image
                    :src="assets.watchRewardBottomIcon"
                    class="w-88 h-88 min-w-88 mr-20"
                    mode="aspectFill"
                  />
                  <view>
                    <view class="leading-80rpx mb-4 text-c333 font-bold text-28">
                      <text>观看</text>
                      <text class="mx-6 bold-ping-fang">{{ formatProgress(reward) }}</text>
                      <text>分钟直播</text>
                    </view>
                    <view class="text-c999 h-40 leading-80rpx f-vc text-24">
                      <text>可获得</text>
                      <image
                        :src="getRewardIcon(reward)"
                        class="w-36 h-36 mx-4"
                        mode="aspectFill"
                      />
                      <view class="f-vc" @click.stop="toggleCollapse(reward)">
                        <text class="text-red-primary text-28 font-bold"> {{ formatRewardLabel(reward) }} </text>
                        <text
                          class="iconfont icon-arrow_down text-24-important"
                          :class="{ 'reward-collapse': isCollapsed(reward) }"
                        >{{ ARROW_DOWN_ICON }}</text>
                      </view>
                    </view>
                  </view>
                </view>
                <view class="w-128 h-88 f-vc ml-20">
                  <view
                    class="bottom-reward-go-watch rounded-28 w-128 h-56 text-24 text-white font-bold d-c-c lh-ny-normal"
                    :class="{ 'is-disabled': isActionDisabled(reward), 'is-claimed': Number(reward.claimStatus) === 3 }"
                    @click.stop="handleRewardAction(reward)"
                    @tap.stop="handleRewardAction(reward)"
                  >
                    {{ getActionText(reward) }}
                  </view>
                </view>
              </view>

              <view v-if="Number(reward.rewardType) === 2" class="overflow-hidden">
                <view
                  class="w-686 h-176 mt-12 flex pr-20 pl-6 info-cont coupon-info-cont"
                  :class="{ 'reward-collapse': isCollapsed(reward) }"
                  :style="{ backgroundImage: `url(${assets.watchRewardCouponBg})` }"
                >
                  <view class="min-w-200 text-red-primary text-40 text-center py-16">
                    <view class="font-bold mt-24 mb-12 leading-112rpx">{{ formatCouponAmount(reward) }}</view>
                    <view class="text-22 leading-64rpx">{{ formatCouponLimit(reward) }}</view>
                  </view>
                  <view class=" flex flex-col justify-between flex-1 min-w-0 p-16 card-box">
                    <view>
                      <view class="text-28 text-c333 text-ellipsis mb-2 h-40 leading-80rpx font-bold">
                        {{ formatRewardName(reward) }}
                      </view>
                      <view class="text-24 text-c666 leading-68rpx text-ellipsis-2">
                        {{ formatCouponDesc(reward) }}
                      </view>
                    </view>
                    <view class="text-20 text-c999 text-right min-h-32 h-32 leading-64rpx pr-6 detail-validity">
                      {{ formatCouponValidity(reward) }}
                    </view>
                  </view>
                </view>
              </view>

              <view v-else class="overflow-hidden">
                <view
                  class="bg-white w-686 h-176 rounded-16 mt-16 flex px-16 info-cont goods-info-cont"
                  :class="{ 'reward-collapse': isCollapsed(reward) }"
                >
                  <view class="h-176 py-16">
                    <image
                      class="min-w-144 w-144 h-144 mr-20 object-cover rounded-12"
                      :src="getRewardImage(reward)"
                      mode="aspectFill"
                    />
                  </view>
                  <view class="flex-1 min-w-0 py-16 h-176">
                    <view class="text-28 text-c333 leading-80rpx text-ellipsis-2 mb-8">
                      {{ formatRewardName(reward) }}
                    </view>
                    <view class="text-22 text-c999 h-32 leading-64rpx">
                      {{ formatStock(reward) }}
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { navigateToPrizeRecord } from "@/utils/route-navigation";

const props = defineProps({
  activeModal: {
    type: String,
    required: true
  },
  assets: {
    type: Object,
    required: true
  },
  watchRewards: {
    type: Array,
    default: () => []
  },
  openKey: {
    type: Number,
    default: 0
  },
  rewardResult: {
    type: Object,
    default: null
  },
  recordUrl: {
    type: String,
    default: "/pagesPlus/main/prize-record/index"
  }
});

const emit = defineEmits(["close", "claim"]);
const ARROW_DOWN_ICON = "\ue694";
const hiddenWatchDurationReward = ref(false);

const fallbackRewards = [
  {
    activityId: "preview-coupon",
    duration: 1,
    thresholdSec: 60,
    watchedSec: 60,
    claimStatus: 1,
    rewardType: 2,
    rewardName: "测试",
    rewardQuantity: 1,
    couponAmount: "",
    couponMinAmount: "1.00",
    couponDesc: "全部商品可用，不允许与折扣价或秒杀优惠等营销活动使用，优惠券不可叠加使用",
    validityText: "领取当日1天内可用",
  },
  {
    activityId: "preview-goods",
    duration: 1,
    thresholdSec: 60,
    watchedSec: 60,
    claimStatus: 1,
    rewardType: 1,
    rewardName: "测试商品",
    rewardImage: props.assets.watchRewardGoodsProduct,
    rewardQuantity: 1,
    remainingStock: 98,
  },
];
const collapsedMap = reactive({});

const displayRewards = computed(() => {
  return props.watchRewards.length ? props.watchRewards : fallbackRewards;
});
const isWatchDurationRewardVisible = computed(() => (
  props.activeModal === "watchDurationReward" && !hiddenWatchDurationReward.value
));
const goodsReward = computed(() => props.rewardResult || fallbackRewards[1]);
const goodsRewardQuantity = computed(() => Number(goodsReward.value.rewardQuantity || 1) || 1);
const goodsRewardName = computed(() => formatRewardName(goodsReward.value) || "大米");
const goodsRewardImage = computed(() => getRewardImage(goodsReward.value));
const goodsRewardStockText = computed(() => {
  if (props.rewardResult?.needReceiver) return "请在订单中补充收货信息";
  if (props.rewardResult) return "领取成功，请在订单中查看";
  return "库存: 1斤";
});
const goodsRewardButtonText = computed(() => (props.rewardResult ? "我知道了" : "立即领取"));

function getRewardKey(reward, index) {
  return reward.activityId || `${reward.rewardType}-${index}`;
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function isCollapsed(reward) {
  return Boolean(collapsedMap[getRewardKey(reward, 0)]);
}

function toggleCollapse(reward) {
  const key = getRewardKey(reward, 0);
  collapsedMap[key] = !collapsedMap[key];
}

function getRewardIcon(reward) {
  return Number(reward.rewardType) === 1 ? props.assets.watchRewardGoodsIcon : props.assets.watchRewardCouponIcon;
}

function getRewardImage(reward) {
  return reward.rewardImage || reward.productImage || props.assets.watchRewardGoodsProduct;
}

function formatRewardName(reward) {
  return reward.rewardName || reward.productName || reward.couponName || "观看奖励";
}

function formatRewardLabel(reward) {
  const quantity = toNumber(reward.rewardQuantity, 1) || 1;
  return Number(reward.rewardType) === 1 ? `商品${quantity}件` : `优惠券${quantity}张`;
}

function formatProgress(reward) {
  const duration = toNumber(reward.duration, Math.ceil(toNumber(reward.thresholdSec) / 60)) || 0;
  const watchedMin = Math.min(Math.floor(toNumber(reward.watchedSec) / 60), duration);
  return `${watchedMin}/${duration}`;
}

function getActionText(reward) {
  const status = Number(reward.claimStatus);
  if (status === 3) return "已领取";
  if (status === 5) return "已抢光";
  if (status === 2) return "领取中";
  if (status === 1) return "立即领取";
  const remaining = toNumber(reward.remainingSec);
  return remaining > 0 && remaining < 60 ? `${remaining}s` : "去观看";
}

function isActionDisabled(reward) {
  return Number(reward.claimStatus) !== 1;
}

function handleRewardAction(reward) {
  if (Number(reward.claimStatus) === 1) {
    emit("claim", reward);
    return;
  }
  if (Number(reward.claimStatus) === 0) {
    emit("close");
  }
}

function closeModal() {
  hiddenWatchDurationReward.value = true;
  emit("close");
}

function openPrizeRecord() {
  navigateToPrizeRecord(props.recordUrl);
}

watch(
  () => props.activeModal,
  (activeModal, oldActiveModal) => {
    if (activeModal === "watchDurationReward" && oldActiveModal !== "watchDurationReward") {
      hiddenWatchDurationReward.value = false;
    }
    if (activeModal !== "watchDurationReward") {
      hiddenWatchDurationReward.value = false;
    }
  },
);

watch(
  () => props.openKey,
  () => {
    if (props.activeModal === "watchDurationReward") {
      hiddenWatchDurationReward.value = false;
    }
  },
);

function formatCouponAmount(reward) {
  return reward.couponAmount ? `¥${reward.couponAmount}` : "随机立减";
}

function formatCouponLimit(reward) {
  return reward.couponMinAmount ? `满${reward.couponMinAmount}元可用` : "无门槛";
}

function formatCouponDesc(reward) {
  return reward.couponDesc || reward.description || "领取后可在我的优惠券查看适用范围";
}

function formatCouponValidity(reward) {
  if (reward.couponStartTime && reward.couponEndTime) {
    return `${reward.couponStartTime} 至 ${reward.couponEndTime}`;
  }
  return reward.validityText || "有效期以券包为准";
}

function formatStock(reward) {
  if (Number(reward.claimStatus) === 5 || reward.stockExhausted) {
    return "已抢光";
  }
  if (reward.remainingStock !== undefined && reward.remainingStock !== null) {
    return `库存：${reward.remainingStock}份`;
  }
  return "数量有限，先到先得";
}
</script>

<style lang="scss" scoped>
@font-face {
  font-family: iconfont;
  src:
    url("https://man.lqjy.cc/static/remote-icons/s-nuoyun-iconfont.woff2") format("woff2"),
    url("https://man.lqjy.cc/static/remote-icons/s-nuoyun-iconfont.woff") format("woff"),
    url("https://man.lqjy.cc/static/remote-icons/s-nuoyun-iconfont.ttf") format("truetype");
}

.watch-duration-reward-source {
  position: fixed;
  inset: 0;
  z-index: 99999;
  font-family: PingFang SC, -apple-system, BlinkMacSystemFont, Helvetica Neue, Helvetica, sans-serif;

  .source-overlay {
    position: fixed;
    inset: 0;
    z-index: 1;
    background: rgba(0, 0, 0, 0.5);
  }

  .source-popup {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
    box-sizing: border-box;
    width: 100%;
    max-height: 100%;
    overflow-y: auto;
    color: #323233;
    transition: transform 0.3s;
  }

  .center-watch-bg {
    position: fixed;
    left: 50%;
    top: 50%;
    z-index: 2;
    box-sizing: border-box;
    width: 590rpx;
    background-repeat: no-repeat;
    background-size: 100% calc(100% - 128rpx);
    transform: translate(-50%, -50%);
  }

  .center-watch-bg.enable-receive {
    background-image: url("https://man.lqjy.cc/static/remote-icons/s-nuoyun-center-watch-enable-receive-bg.png");
  }

  .source-goods-reward-box {
    height: 752rpx;
  }

  .source-goods-reward-content {
    width: 590rpx;
    height: 624rpx;
    padding: 64rpx 48rpx 0;
    box-sizing: border-box;
  }

  .source-goods-reward-title {
    height: 56rpx;
    margin-bottom: 48rpx;
    color: #fff;
    font-size: 40rpx;
    font-weight: 700;
    line-height: 56rpx;
    text-align: center;
  }

  .source-goods-reward-card {
    display: flex;
    width: 494rpx;
    height: 200rpx;
    margin: 32rpx 0 24rpx;
    padding: 12rpx;
    box-sizing: border-box;
    border-radius: 16rpx;
    background: #fff;
  }

  .source-goods-reward-image {
    min-width: 176rpx;
    width: 176rpx;
    height: 176rpx;
    margin-right: 16rpx;
    border-radius: 15rpx;
    object-fit: cover;
  }

  .source-goods-reward-info {
    flex: 1 1 0%;
    min-width: 256rpx;
  }

  .source-goods-reward-name {
    margin-bottom: 8rpx;
    color: #333;
    font-size: 28rpx;
    line-height: 40rpx;
  }

  .source-goods-reward-stock {
    height: 32rpx;
    color: #999;
    font-size: 22rpx;
    line-height: 32rpx;
  }

  .source-goods-reward-tip {
    height: 40rpx;
    margin-bottom: 24rpx;
    color: rgba(255, 255, 255, 0.7);
    font-size: 28rpx;
    font-weight: 400;
    line-height: 40rpx;
    text-align: center;
  }

  .source-goods-reward-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 494rpx;
    height: 88rpx;
    border-radius: 44rpx;
    color: #fe6b33;
    font-size: 28rpx;
    font-weight: 700;
    background: #fff;
  }

  .source-goods-reward-record {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.78);
    font-size: 26rpx;
    line-height: 32rpx;
    height: 80rpx;
  }

  .source-goods-reward-record-link {
    color: #fff;
    font-weight: 700;
  }

  .source-goods-reward-close-row {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 64rpx;
    margin-top: 64rpx;
  }

  .source-goods-reward-close {
    width: 64rpx;
    height: 64rpx;
    background: url("https://man.lqjy.cc/static/remote-icons/s-nuoyun-icon-close.png") center / contain no-repeat;
  }

  .bottom-reward-popup {
    border-radius: 48rpx 48rpx 0 0;
    background: linear-gradient(270deg, #ffefe5, #fff8f0);
  }

  .bottom-reward-go-watch {
    background: linear-gradient(90deg, #ffa785, #fe6b33);
  }

  .bottom-reward-go-watch.is-disabled {
    background: #c8c8c8;
  }

  .bottom-reward-go-watch.is-claimed {
    color: #999;
    background: #e5e5e5;
  }

  .info-cont {
    max-height: 176rpx;
    overflow: hidden;
    transition: max-height 0.3s cubic-bezier(0.39, 0.58, 0.57, 1) 0s;
  }

  .info-cont.reward-collapse {
    max-height: 0;
  }

  .coupon-info-cont {
    background-repeat: no-repeat;
    background-size: 686rpx 176rpx;
  }

  .goods-info-cont {
    box-sizing: border-box;
  }

  .card-box {
    position: relative;
  }

  .card-box .detail-validity {
    position: absolute;
    right: 30rpx;
    bottom: 12rpx;
    white-space: nowrap;
    box-sizing: border-box;
  }

  .list {
    overscroll-behavior: none;
  }

  .relative {
    position: relative;
  }

  .absolute {
    position: absolute;
  }

  .top-0 {
    top: 0;
  }

  .left-0 {
    left: 0;
  }

  .right-32 {
    right: 32rpx;
  }

  .top--26 {
    top: -26rpx;
  }

  .flex {
    display: flex;
  }

  .flex-col {
    flex-direction: column;
  }

  .flex-1 {
    flex: 1 1 0%;
  }

  .justify-between {
    justify-content: space-between;
  }

  .items-center {
    align-items: center;
  }

  .f-vc {
    display: flex;
    align-items: center;
  }

  .border-0 {
    border-width: 0;
  }

  .overflow-auto {
    overflow: auto;
  }

  .overflow-hidden {
    overflow: hidden;
  }

  .safe-area-inset-bottom {
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
  }

  .bold-ping-fang {
    font-family: PingFang SC, -apple-system, BlinkMacSystemFont, Helvetica Neue, Helvetica, sans-serif;
    font-weight: 700;
  }

  .font-bold {
    font-weight: 700;
  }

  .text-center {
    text-align: center;
  }

  .text-right {
    text-align: right;
  }

  .van-multi-ellipsis--l3 {
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  .lh-ny-normal {
    line-height: normal;
  }

  .iconfont {
    font-family: iconfont !important;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .icon-arrow_down {
    display: inline-block;
    color: #999;
    line-height: 1;
    transform: rotate(0deg);
    transition: transform 0.3s ease-in-out 0s;
  }

  .icon-arrow_down.reward-collapse {
    transform: rotate(-180deg);
  }

  .text-24-important {
    font-size: 24rpx !important;
  }

  .w-full {
    width: 100%;
  }

  .w-750 {
    width: 750rpx;
  }

  .w-686 {
    width: 686rpx;
  }

  .w-144 {
    width: 144rpx;
  }

  .w-128 {
    width: 128rpx;
  }

  .w-88 {
    width: 88rpx;
  }

  .w-60 {
    width: 60rpx;
  }

  .w-36 {
    width: 36rpx;
  }

  .h-176 {
    height: 176rpx;
  }

  .h-144 {
    height: 144rpx;
  }

  .h-88 {
    height: 88rpx;
  }

  .h-60 {
    height: 60rpx;
  }

  .h-56 {
    height: 56rpx;
  }

  .h-52 {
    height: 52rpx;
  }

  .h-40 {
    height: 40rpx;
  }

  .h-36 {
    height: 36rpx;
  }

  .h-32 {
    height: 32rpx;
  }

  .min-h-32 {
    min-height: 32rpx;
  }

  .min-w-438 {
    min-width: 438rpx;
  }

  .min-w-490 {
    min-width: 490rpx;
  }

  .min-w-0 {
    min-width: 0;
  }

  .min-w-200 {
    min-width: 200rpx;
  }

  .min-w-144 {
    min-width: 144rpx;
  }

  .min-w-88 {
    min-width: 88rpx;
  }

  .max-h-72vh {
    max-height: 72vh;
  }

  .rounded-28 {
    border-radius: 28rpx;
  }

  .rounded-16 {
    border-radius: 16rpx;
  }

  .rounded-12 {
    border-radius: 12rpx;
  }

  .object-cover {
    object-fit: cover;
  }

  .bg-transparent {
    background-color: transparent;
  }

  .bg-white {
    background-color: #fff;
  }

  .text-white {
    color: #fff;
  }

  .text-c333 {
    color: #333;
  }

  .text-c999 {
    color: #999;
  }

  .text-c666 {
    color: #666;
  }

  .text-red-primary {
    color: #ff0e4c;
  }

  .pt-52 {
    padding-top: 52rpx;
  }

  .pb-56 {
    padding-bottom: 56rpx;
  }

  .px-32 {
    padding-right: 32rpx;
    padding-left: 32rpx;
  }

  .px-16 {
    padding-right: 16rpx;
    padding-left: 16rpx;
  }

  .py-16 {
    padding-top: 16rpx;
    padding-bottom: 16rpx;
  }
  .p-16{
    padding: 16rpx;
  }

  .pr-20 {
    padding-right: 20rpx;
  }

  .pl-6 {
    padding-left: 6rpx;
  }

  .pr-6 {
    padding-right: 6rpx;
  }

  .mt-24 {
    margin-top: 24rpx;
  }

  .mt-12 {
    margin-top: 12rpx;
  }

  .mt-16 {
    margin-top: 16rpx;
  }

  .mb-12 {
    margin-bottom: 12rpx;
  }

  .mb-8 {
    margin-bottom: 8rpx;
  }

  .mb-4 {
    margin-bottom: 4rpx;
  }

  .mb-2 {
    margin-bottom: 2rpx;
  }

  .ml-20 {
    margin-left: 20rpx;
  }

  .mr-20 {
    margin-right: 20rpx;
  }

  .mx-6 {
    margin-right: 6rpx;
    margin-left: 6rpx;
  }

  .mx-4 {
    margin-right: 4rpx;
    margin-left: 4rpx;
  }

  .text-40 {
    font-size: 40rpx;
  }

  .text-28 {
    font-size: 28rpx;
  }

  .text-24 {
    font-size: 24rpx;
  }

  .text-22 {
    font-size: 22rpx;
  }

  .text-20 {
    font-size: 20rpx;
  }

  .leading-112rpx {
    line-height: 56rpx;
  }

  .leading-80rpx {
    line-height: 40rpx;
  }

  .leading-68rpx {
    line-height: 34rpx;
  }

  .leading-64rpx {
    line-height: 32rpx;
  }
}
</style>
