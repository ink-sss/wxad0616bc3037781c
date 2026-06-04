<template>
  <view v-if="activeModal === 'taskCouponNotice'" class="taskCouponBox">
    <view class="taskCouponBc"></view>
    <view class="taskCouponCon">
      <image class="taskCollection" :src="image.collection" mode="widthFix" />
      <image class="taskClose" :src="image.taskClose" mode="aspectFill" @click="emit('close')" />
      <view class="taskCouponUl">
        <CouponTicket />
        <view class="taskCouponTips">
          <text>领取结果在</text>
          <text class="task_r">我的-优惠券</text>
          <text>查看</text>
        </view>
      </view>
      <view class="setTaskCouponBox">
        <view class="setTaskCouponHead">
          <text>任务领券提示</text>
          <text class="setSendCoupon">手动提示</text>
        </view>
        <text class="setTaskCouponTip">每点击一次，直播间在线用户将弹出一次任务领券提示</text>
      </view>
    </view>
  </view>

  <view v-if="activeModal === 'taskCouponReceive'" class="taskCouponSuccBox">
    <view class="taskCouponSuccBc"></view>
    <view class="taskCouponSuccCon">
      <view class="subscribings">
        <image :src="image.subscribing" mode="widthFix" />
        <text>订阅</text>
      </view>
      <image class="taskCouponSuccBg" :src="image.succBg" mode="widthFix" />
      <view class="taskCouponUl">
        <CouponTicket />
        <CouponTicket type="discount" />
      </view>
      <view class="taskCouponSuccBottom">
        <view class="task_tips1">
          <text>领取结果在</text>
          <text class="task_tips_r">我的-优惠券</text>
          <text>查看</text>
        </view>
        <view class="task_tips2">
          <text class="task_countdown">10</text>
          <text>秒后自动关闭</text>
        </view>
      </view>
      <image class="taskCouponClose" :src="image.closeIcon" mode="aspectFill" @click="emit('close')" />
    </view>
  </view>

  <view v-if="activeModal === 'taskCouponShare'" class="taskCouponShareBox">
    <view class="taskCouponShareBc"></view>
    <view class="taskCouponShareCon">
      <image class="task_share_arrow" :src="image.shareArrow" mode="widthFix" />
      <view class="task_share_con">
        <text>成功邀请<text class="task_share_num">2</text>位好友进入直播间</text>
        <text>即可获得优惠券</text>
      </view>
      <view class="task_share_way">
        <text>点击屏幕右上角</text>
        <image :src="image.icon1" mode="aspectFill" />
        <text>将本页面发送给好友</text>
        <image :src="image.icon2" mode="aspectFill" />
      </view>
      <text class="task_share_btn2" @click="emit('close')">我知道了</text>
    </view>
  </view>

  <view v-if="activeModal === 'taskCouponSubscribe'" class="taskCouponSubsBox">
    <view class="taskCouponSubsBc"></view>
    <view class="taskCouponSubsCon">
      <view class="task_subs_top">
        <image :src="image.subsChecked" mode="aspectFill" />
        <text class="task_subs_title">直播间名字</text>
        <text>申请</text>
      </view>
      <view class="task_subs_msg">
        <text>发送以下消息</text>
      </view>
      <view class="task_subs_remind">
        <image :src="image.subsChecked" mode="aspectFill" />
        <text>直播开播提醒</text>
      </view>
      <view class="task_subs_btn2">
        <text class="task_subs_cancel" @click="emit('close')">取消</text>
        <text class="task_subs_allow">允许</text>
      </view>
      <view class="task_subs_bottom">
        <view></view>
        <text>总是保持以上选择不再询问</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import CouponTicket from "./coupon/CouponTicket.vue";

defineProps({
  activeModal: {
    type: String,
    required: true
  }
});

const emit = defineEmits(["close"]);

const image = {
  collection: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-num-taskcollection-icon-c6bfd903.png",
  taskClose: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-num-taskclose-168e48f0.png",
  subscribing: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-ebusiness-subscribing-fcd5c5e0.png",
  succBg: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-num-task-coupon-succ-bg-86670f96.png",
  closeIcon: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-num-close-icon-2cdee8d1.png",
  shareArrow: "https://man.lqjy.cc/static/remote-icons/i-nuoyun-task-coupon-share-arrow.png",
  icon1: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-mobile-images-icon-1-ff1d58ca.png",
  icon2: "https://man.lqjy.cc/static/remote-icons/nyfs-oss-bcvdata-com-public-mobile-images-icon-2-e1e9b114.png",
  subsChecked: "https://man.lqjy.cc/static/remote-icons/i-nuoyun-task-coupon-subs-checked.png"
};
</script>

<style lang="scss" scoped>
.taskCouponBox,
.taskCouponSuccBox,
.taskCouponShareBox,
.taskCouponSubsBox {
  position: fixed;
  inset: 0;
  z-index: 99999;
}

.taskCouponBc,
.taskCouponSuccBc,
.taskCouponShareBc,
.taskCouponSubsBc {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.58);
}

.taskCouponCon {
  position: absolute;
  left: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 75%;
  box-sizing: border-box;
  overflow: hidden;
  text-align: center;
  border-radius: 48rpx 48rpx 0 0;
  background: linear-gradient(270deg, #fff9f2 0%, #fff6f8 100%);
}

.taskCollection {
  display: block;
  width: 100%;
  height: 106rpx;
  object-fit: cover;
  margin-bottom: 40rpx;
}

.taskClose {
  position: absolute;
  top: 36rpx;
  right: 32rpx;
  width: 48rpx;
  height: 48rpx;
  object-fit: cover;
}

.taskCouponUl {
  padding: 0 32rpx;
  overflow-y: auto;
}

.taskCouponTips {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -16rpx 0 72rpx;
  color: #999;
  font-size: 24rpx;
}

.task_r,
.task_tips_r,
.task_countdown {
  margin: 0 8rpx;
  color: #ff0e4c;
  font-weight: 700;
}

.setTaskCouponBox {
  margin: 0 32rpx 32rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.78);
}

.setTaskCouponHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #333;
  font-size: 30rpx;
  font-weight: 700;
}

.setSendCoupon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 164rpx;
  height: 60rpx;
  color: #fff;
  font-size: 26rpx;
  border-radius: 30rpx;
  background: linear-gradient(270deg, #ff0e4c 0%, #ff6089 100%);
}

.setTaskCouponTip {
  display: block;
  margin-top: 20rpx;
  color: #888;
  font-size: 24rpx;
  line-height: 36rpx;
}

.subscribings {
  position: absolute;
  top: 58rpx;
  right: 0;
  display: flex;
  align-items: center;
  padding: 8rpx 12rpx 8rpx 16rpx;
  color: #ff0e4c;
  font-size: 28rpx;
  border-radius: 28rpx 0 0 28rpx;
  background: #ffdee4;
}

.subscribings image {
  width: 36rpx;
  height: 36rpx;
  margin-right: 4rpx;
}

.taskCouponSuccBg {
  display: block;
  width: 100%;
  height: auto;
}

.taskCouponSuccCon {
  position: absolute;
  left: 50%;
  top: 42%;
  width: 590rpx;
  padding-bottom: 48rpx;
  text-align: center;
  border-radius: 50rpx;
  background: linear-gradient(180deg, #ff839e 0%, #ff4168 100%);
  transform: translate(-50%, -50%);
}

.taskCouponSuccBox .taskCouponUl {
  margin-top: 42rpx;
  padding: 0 48rpx;
}

.taskCouponSuccBottom {
  display: block;
  margin-top: 24rpx;
}

.task_tips1,
.task_tips2 {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  line-height: 34rpx;
}

.task_tips1 {
  margin-bottom: 16rpx;
  color: rgba(255, 255, 255, 0.7);
}

.task_tips2,
.task_tips_r {
  color: #fff;
}

.taskCouponClose {
  position: absolute;
  left: 50%;
  bottom: -112rpx;
  z-index: 2;
  width: 64rpx;
  height: 64rpx;
  transform: translateX(-50%);
}

.taskCouponShareCon {
  position: absolute;
  inset: 0;
  text-align: center;
  background: transparent;
}

.task_share_arrow {
  position: absolute;
  right: 32rpx;
  top: 12rpx;
  width: 184rpx;
  height: 280rpx;
}

.task_share_con {
  margin-top: 300rpx;
  color: #fff;
  font-size: 36rpx;
  font-weight: 700;
  line-height: 38rpx;
}

.task_share_con text {
  display: block;
  margin-bottom: 20rpx;
}

.task_share_num {
  display: inline !important;
  margin: 0 10rpx;
  color: #fe424d;
}

.task_share_way {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 40rpx;
  color: #fff;
  font-size: 28rpx;
  line-height: 30rpx;
}

.task_share_way image {
  width: 54rpx;
  height: 48rpx;
  margin: 0 10rpx;
}

.task_share_btn2 {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 300rpx;
  height: 88rpx;
  margin: 158rpx auto;
  color: #fff;
  font-size: 32rpx;
  border: 2rpx dashed #fff;
  border-radius: 44rpx;
}

.taskCouponSubsCon {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  overflow: hidden;
  text-align: center;
  border-radius: 30rpx 30rpx 0 0;
  background: #fff;
}

.task_subs_top {
  display: flex;
  align-items: center;
  padding: 30rpx 30rpx 0;
  margin-bottom: 54rpx;
  color: #333;
  font-size: 32rpx;
}

.task_subs_top image {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}

.task_subs_title {
  margin: 0 24rpx;
  font-weight: 700;
}

.task_subs_msg {
  padding: 0 30rpx 30rpx;
  color: #333;
  font-size: 32rpx;
  font-weight: bold;
  text-align: left;
  border-bottom: 2rpx solid #ededed;
}

.task_subs_remind {
  display: flex;
  align-items: center;
  padding: 30rpx;
  color: #333;
  font-size: 32rpx;
  font-weight: bold;
  border-bottom: 2rpx solid #ededed;
}

.task_subs_remind image {
  width: 34rpx;
  height: 34rpx;
  margin-right: 20rpx;
  border-radius: 50%;
}

.task_subs_btn2 {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 54rpx;
}

.task_subs_cancel,
.task_subs_allow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200rpx;
  height: 68rpx;
  margin-right: 30rpx;
  font-size: 28rpx;
  border-radius: 10rpx;
}

.task_subs_cancel {
  color: #333;
  background: #e8e8e8;
}

.task_subs_allow {
  color: #fff;
  background: #03c161;
}

.task_subs_bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 40rpx;
  margin-bottom: 120rpx;
  color: #999;
  font-size: 28rpx;
}

.task_subs_bottom view {
  width: 28rpx;
  height: 28rpx;
  margin-right: 12rpx;
  border: 2rpx solid #ccc;
  border-radius: 50%;
}
</style>
