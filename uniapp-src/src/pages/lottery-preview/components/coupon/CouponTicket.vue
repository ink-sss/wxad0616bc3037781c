<template>
  <view class="taskCouponLi">
    <view class="taskCouponTop">
      <view class="taskCouponTopLeft" :class="{ task_tc: type === 'cash' }">
        <view v-if="type === 'cash'" class="taskCouponTopLeftTop">
          <text class="task_s task_unit">¥</text>
          <text class="task_sl">10</text>
        </view>
        <template v-else>
          <text class="task_sl">8</text>
          <text class="task_s task_unit_l">折</text>
        </template>
        <text class="task_s">{{ type === "cash" ? "无门槛" : "指定商品" }}</text>
      </view>
      <view class="taskCouponTopRight">
        <text class="task_m task_mb10">{{ type === "cash" ? "无门槛优惠券" : "满 100 可用" }}</text>
        <text class="task_s task_mb5">全部商品可用，允许叠加其他优惠活动</text>
        <text class="task_s">有效期：领取当日3天内可用</text>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: "cash"
  }
});
</script>

<style lang="scss" scoped>
.taskCouponLi {
  width: 100%;
  margin-bottom: 64rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  position: relative;
  overflow: visible;
  background: transparent;
}

.taskCouponTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 188rpx;
  margin-top: 12rpx;
  background: url("../static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-num-taskcouponbottonsbg-87b730a1.png") no-repeat;
  background-size: 100% 100%;
}

.taskCouponTopLeft {
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 234rpx;
  margin-top: -8rpx;
  color: #ff0e4c;
  text-align: center;
}

.taskCouponTopLeftTop {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.task_sl {
  color: #ff0e4c;
  font-size: 60rpx;
  font-weight: 700;
  line-height: 84rpx;
}

.task_s {
  display: block;
  color: #ff0e4c;
  font-size: 24rpx;
  line-height: 36rpx;
}

.task_unit {
  margin-right: 4rpx;
  font-size: 28rpx;
}

.task_unit_l {
  margin-left: 4rpx;
}

.taskCouponTopRight {
  flex: 1;
  min-width: 0;
  height: 188rpx;
  padding-right: 26rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
}

.task_m {
  display: block;
  color: #333;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 40rpx;
}

.task_mb10 {
  margin-bottom: 8rpx;
}

.task_mb5 {
  margin-bottom: 10rpx;
}

.taskCouponTopRight .task_s {
  color: #808080;
}
</style>
