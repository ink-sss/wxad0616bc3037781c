<template>
  <view :class="visible ? 'pop-bg open' : 'pop-bg close'" @tap="closePop(null)">
    <view class="pop-content" @tap.stop>
      <view class="recharge-top theme-bg mb30">
        <view class="recharge-icon left"></view>
        <view class="recharge-icon right"></view>
      </view>
      <view class="title">{{ pointsTitle }}提现</view>
      <view class="input-box">
        <input v-model="value" :placeholder="'请输入兑换' + pointsTitle + '值'" type="digit" />
        <image class="input-err" mode="aspectFit" :src="clearIcon" @tap="value = ''" />
      </view>
      <view class="hint">注:1{{ pointsTitle }} = {{ discountRatio }} 余额</view>
      <view class="actions">
        <view class="sub-btn theme-btn" @tap="submit">确认</view>
        <view class="close-btn theme-borderbtn" @tap="closePop(null)">取消</view>
      </view>
    </view>
  </view>
</template>

<script>
import { _imports_0$18 as inputErrIcon } from '../../../../../common/assets.js'

export default {
  name: 'Recharge',
  props: {
    isPop: { type: Boolean, default: false },
    discountRatio: { type: [String, Number], default: '0' },
  },
  emits: ['close'],
  data() {
    return {
      input_len: 6,
      visible: false,
      value: '',
      is_send: false,
    }
  },
  computed: {
    pointsTitle() {
      return typeof this.points_name === 'function' ? this.points_name() : '积分'
    },
    clearIcon() {
      return inputErrIcon
    },
  },
  watch: {
    isPop: {
      immediate: true,
      handler(value) {
        this.visible = value
      },
    },
  },
  methods: {
    submit() {
      if (this.is_send) return
      this.is_send = true
      this._get(
        'user.User/transPoints',
        { points: this.value },
        (res) => {
          this.is_send = false
          this.showSuccess(res.msg, () => {
            this.closePop(true)
          })
        },
        () => {
          this.is_send = false
        },
      )
    },
    closePop(value) {
      this.$emit('close', value)
      this.value = ''
    },
  },
}
</script>

<style scoped>
.recharge-top {
  border-radius: 25rpx 25rpx 0 0;
  height: 75rpx;
  position: relative;
}

.recharge-top .recharge-icon {
  background: #fff;
  border-radius: 6rpx;
  box-shadow: 0 8rpx 3rpx rgba(6, 0, 1, 0.03);
  height: 49rpx;
  position: absolute;
  top: -15rpx;
  width: 12rpx;
}

.recharge-top .recharge-icon.left {
  left: 156rpx;
}

.recharge-top .recharge-icon.right {
  right: 156rpx;
}

.title {
  color: #333;
  font-size: 30rpx;
  font-weight: 700;
  margin-bottom: 35rpx;
  text-align: center;
  width: 100%;
}

.input-box {
  align-items: center;
  border: 1rpx solid #eee;
  border-radius: 15rpx;
  display: flex;
  height: 72rpx;
  justify-content: center;
  margin: 0 auto;
  padding: 0 14rpx 0 21rpx;
  width: 428rpx;
}

.input-box input {
  border: none;
  color: #999;
  flex: 1;
  font-size: 26rpx;
}

.input-err {
  flex-shrink: 0;
  height: 42rpx;
  margin-left: 18rpx;
  width: 42rpx;
}

.hint {
  color: #999;
  font-size: 26rpx;
  margin: 30rpx 0 56rpx;
  text-align: center;
}

.actions {
  align-items: center;
  display: flex;
  justify-content: center;
  width: 100%;
}

.sub-btn {
  margin-right: 93rpx;
}

.close-btn,
.sub-btn {
  align-content: center;
  border-radius: 36rpx;
  color: #fff;
  display: flex;
  font-size: 28rpx;
  height: 48rpx;
  justify-content: center;
  line-height: 48rpx;
  width: 148rpx;
}

.dominant {
  color: #e2231a;
}

.pop-bg {
  background: rgba(0, 0, 0, 0.5);
  height: 100vh;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 99;
}

.pop-bg .pop-content {
  background-color: #fff;
  border-radius: 25rpx;
  bottom: 0;
  box-sizing: border-box;
  height: 477rpx;
  left: 0;
  margin: auto;
  padding: 0 0 32rpx;
  position: fixed;
  right: 0;
  top: 0;
  transform: translateZ(0);
  transition: transform 0.2s cubic-bezier(0, 0, 0.25, 1);
  width: 516rpx;
  z-index: 100;
}

.pop-bg.close {
  height: 0;
}

.pop-bg.close .pop-content {
  transform: translate3d(0, 2000rpx, 0);
}
</style>
