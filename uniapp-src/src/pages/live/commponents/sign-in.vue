<template>
  <view>
    <view v-if="visible && Number(type) === 1" class="item-icon" @tap="handleClick">
      <image mode="aspectFill" :src="signIcon" />
      <view v-if="countdown > 0" class="icon-tit">{{ formatTime(countdown) }}</view>
      <view v-else class="icon-tit">签到</view>
    </view>
    <view v-if="visible && Number(type) === 2" class="float-sign-btn" @tap="handleClick">
      <image class="sign-icon" mode="aspectFill" :src="signIcon" />
      <view v-if="countdown > 0" class="icon-tit">{{ formatTime(countdown) }}</view>
      <view v-else class="icon-tit">签到</view>
    </view>

    <uni-popup
      ref="signinPop"
      type="center"
      background-color="#fff"
      border-radius="20rpx"
      :mask-click="false"
      :is-mask-click="false"
    >
      <view class="red-packet-modal">
        <view class="modal-title">{{ currentTask.name || '签到' }}</view>
        <view class="condition-box">
          <view class="getTitle">领取条件</view>
          <view class="condition-content">
            <view class="watch-time">
              <view class="label">观看满 {{ currentTask.title || '00:00' }}</view>
              <view class="time">已看 {{ currentTask.title || '00:00' }}</view>
            </view>
            <view class="plus">+</view>
            <view class="check-in">
              <view class="label">已经打卡({{ currentTask.id || 0 }}/{{ currentTask.num || 0 }})次</view>
              <view class="status" />
            </view>
          </view>
        </view>
        <button class="get-btn" :disabled="submitting || submitLocked" @tap="submit">{{ submitting ? '签到中...' : '签到' }}</button>
        <view class="tips">{{ currentTask.reward || '' }}</view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import UniPopup from '../../../uni_modules/uni-popup/components/uni-popup/uni-popup.vue'
import { requestWithVm } from '../page-tools.js'

export default {
  components: { UniPopup },
  props: {
    liveId: { type: [Number, String], default: '' },
    appId: { type: [Number, String], default: '' },
    supplierId: { type: [Number, String], default: '' },
    allowManualEnd: { type: Boolean, default: true },
    type: { type: [Number, String], default: 1 },
    config: { type: Object, default: () => ({}) },
    chatInfo: { type: Object, default: () => ({}) },
    isLogin: {
      type: Number,
      default: 0,
      validator(value) {
        return [0, 1].includes(value)
      },
    },
  },
  emits: ['taskEnd', 'signinSuccess', 'signinFail', 'manualEnd'],
  data() {
    return {
      disabled: false,
      tasks: [],
      userId: 0,
      taskId: 0,
      currentTask: {},
      countdown: 0,
      isPopOpen: false,
      visible: false,
      mountedReady: false,
      submitting: false,
      clickLocked: false,
      submitLocked: false,
      countdownTimer: null,
      cacheTimer: null,
      delayedOpenTimer: null,
      checkId: '',
    }
  },
  computed: {
    requestParams() {
      return {
        app_id: this.chatInfo?.app_id || this.appId,
        supplier_id: this.chatInfo?.shop_supplier_id || this.supplierId,
        live_id: this.liveId,
      }
    },
    canRequest() {
      return Boolean(this.requestParams.live_id && this.requestParams.app_id && this.requestParams.supplier_id)
    },
    signIcon() {
      const base = this.config?.pic_url || 'https://weilive.yukelive.com'
      return `${base}/202512081258135e2e81819.png`
    },
    cacheKey() {
      return `sign_task_${this.liveId}_${this.requestParams.app_id || ''}_${this.checkId || ''}`
    },
  },
  watch: {
    isLogin() {
      this.loadCheckId()
    },
    liveId() {
      this.loadCheckId()
    },
    'chatInfo.app_id'() {
      this.loadCheckId()
    },
    'chatInfo.shop_supplier_id'() {
      this.loadCheckId()
    },
  },
  mounted() {
    this.cleanExpiredCache()
    this.userId = uni.getStorageSync('user_id')
    this.mountedReady = true
    this.loadCheckId()
  },
  beforeUnmount() {
    this.clearAllTimers()
    this.closeModal(false)
    if (this.delayedOpenTimer) clearTimeout(this.delayedOpenTimer)
  },
  methods: {
    refreshTasks() {
      return this.loadTasks()
    },
    loadCheckId() {
      if (!this.canRequest) return
      requestWithVm(this, '_post', 'live.roomNew/getCheckid', this.requestParams)
        .then((res) => {
          if (!res.data) {
            this.resetTasks()
            return
          }
          this.checkId = res.data
          this.restoreCache()
        })
        .catch(() => {
          this.resetTasks()
        })
    },
    restoreCache() {
      const cached = this.readCache()
      if (cached && this.checkId === cached.tasksId) {
        this.tasks = cached.signTasks || []
        this.currentTask = cached.currentTask || {}
        this.countdown = cached.countdown || 0
        this.taskId = cached.tasksId || 0
        this.isPopOpen = !!cached.isSigninPopOpen
        this.visible = !this.disabled && (this.tasks.length > 0 || !!this.currentTask.id)
        if (!this.disabled && this.countdown > 0 && this.currentTask.id) this.startCountdown()
        else if (!this.disabled && this.countdown <= 0 && this.currentTask.id) {
          this.isPopOpen ? this.openModal() : this.showModalWhenReady()
        } else if (!this.disabled) this.nextTask()
        return
      }
      if (!this.disabled) this.loadTasks()
    },
    loadTasks() {
      if (this.disabled || !this.canRequest) {
        this.visible = false
        return Promise.resolve()
      }
      return requestWithVm(this, '_post', 'live.roomNew/getCheckList', this.requestParams)
        .then((res) => {
          this.tasks = (res.data && res.data.checkin_config) || []
          this.taskId = (res.data && res.data.taskId) || 0
          this.visible = true
          this.clearAllTimers()
          this.nextTask()
        })
        .catch(() => {
          this.tasks = []
          this.visible = false
          this.clearCache()
        })
    },
    nextTask() {
      if (this.disabled) {
        this.visible = false
        this.$emit('taskEnd', '打卡临时关闭，任务暂停')
        return
      }
      this.clearAllTimers()
      if (!this.tasks.length) {
        this.currentTask = {}
        this.countdown = 0
        this.visible = false
        this.clearCache()
        this.$emit('taskEnd', '所有签到任务已完成')
        return
      }
      this.currentTask = this.tasks.shift()
      this.countdown = Number(this.currentTask.watchTime || 0)
      this.visible = true
      this.saveCache()
      if (this.countdown > 0) this.startCountdown()
      else this.showModalWhenReady()
    },
    startCountdown() {
      this.clearAllTimers()
      let tickCount = 0
      this.countdownTimer = setInterval(() => {
        if (this.disabled) {
          this.clearAllTimers()
          return
        }
        if (this.countdown > 0) {
          this.countdown -= 1
          tickCount += 1
          if (tickCount >= 5) {
            this.saveCache()
            tickCount = 0
          }
          if (this.countdown <= 0) {
            this.clearAllTimers()
            this.showModalWhenReady()
          }
        }
      }, 1000)
    },
    showModalWhenReady() {
      if (this.disabled || this.isPopOpen) return
      this.isPopOpen = true
      this.saveCache()
      this.openModal()
    },
    openModal() {
      this.$nextTick(() => {
        this.delayedOpenTimer = setTimeout(() => {
          this.$refs.signinPop && this.$refs.signinPop.open()
        }, 50)
      })
    },
    closeModal(advance = true) {
      this.isPopOpen = false
      this.saveCache()
      this.$refs.signinPop && this.$refs.signinPop.close()
      if (advance) {
        setTimeout(() => this.nextTask(), 300)
      }
    },
    submit() {
      if (this.submitting || this.submitLocked || !this.currentTask.id || this.disabled) return
      this.submitting = true
      this.submitLocked = true
      requestWithVm(this, '_post', 'live.roomNew/doSignin', {
        app_id: this.chatInfo?.app_id || this.appId,
        room_id: this.liveId,
        red_id: this.taskId,
        shop_supplier_id: this.chatInfo?.shop_supplier_id || this.supplierId,
        watch_time: this.currentTask.watchTime,
        set_content: this.currentTask,
        user_id: this.userId,
      })
        .then((res) => {
          if (res.code === 1) {
            uni.showToast({ title: res.msg || '签到成功', icon: 'success', duration: 4000 })
            this.$emit('signinSuccess', {
              taskId: this.currentTask.id,
              reward: this.currentTask.reward,
            })
            this.closeModal(true)
          } else {
            uni.showToast({ title: res.msg || '签到失败', icon: 'none', duration: 1500 })
            this.$emit('signinFail', res.msg || '签到失败')
          }
        })
        .catch(() => {
          uni.showToast({ title: '网络异常，签到失败', icon: 'none', duration: 1500 })
          this.$emit('signinFail', '网络异常，签到失败')
        })
        .finally(() => {
          setTimeout(() => {
            this.submitting = false
            this.submitLocked = false
          }, 1500)
        })
    },
    handleClick() {
      if (this.clickLocked) return
      this.clickLocked = true
      setTimeout(() => {
        this.clickLocked = false
      }, 500)
      if (this.disabled) {
        uni.showToast({ title: '当前打卡已关闭，暂无法签到', icon: 'none', duration: 1500 })
        return
      }
      if (this.countdown > 0) {
        uni.showToast({ title: `请观看${this.formatTime(this.countdown)}后签到`, icon: 'none', duration: 1500 })
        return
      }
      if (!this.currentTask.id) {
        uni.showToast({ title: '暂无签到任务', icon: 'none', duration: 1500 })
        return
      }
      if (this.delayedOpenTimer) clearTimeout(this.delayedOpenTimer)
      this.delayedOpenTimer = setTimeout(() => {
        this.showModalWhenReady()
        this.delayedOpenTimer = null
      }, 300)
    },
    formatTime(value) {
      if (value <= 0) return '00:00'
      const seconds = value % 60
      return `${Math.floor(value / 60).toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },
    clearAllTimers() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
      if (this.cacheTimer) {
        clearInterval(this.cacheTimer)
        this.cacheTimer = null
      }
    },
    saveCache() {
      try {
        if (!this.cacheKey) return
        uni.setStorageSync(this.cacheKey, JSON.stringify({
          signTasks: this.tasks,
          currentTask: this.currentTask,
          countdown: this.countdown,
          tasksId: this.checkId,
          isSigninPopOpen: this.isPopOpen,
          expireTime: Date.now() + 86400000,
        }))
      } catch (error) {
        console.error('保存签到缓存失败:', error)
      }
    },
    readCache() {
      try {
        const raw = uni.getStorageSync(this.cacheKey)
        if (!raw) return null
        const data = JSON.parse(raw)
        if ((data.expireTime && Date.now() > data.expireTime) || !data.currentTask) {
          uni.removeStorageSync(this.cacheKey)
          return null
        }
        return data
      } catch (error) {
        console.error('读取签到缓存失败:', error)
        uni.removeStorageSync(this.cacheKey)
        return null
      }
    },
    clearCache() {
      if (this.cacheKey) uni.removeStorageSync(this.cacheKey)
      if (this.taskId) uni.setStorageSync('last_check_id', this.taskId)
      this.visible = this.tasks.length > 0 || !!this.currentTask.id
    },
    resetTasks() {
      this.clearAllTimers()
      this.tasks = []
      this.currentTask = {}
      this.countdown = 0
      this.taskId = 0
      this.isPopOpen = false
      this.visible = false
      this.clearCache()
    },
    cleanExpiredCache() {
      try {
        const info = uni.getStorageInfoSync()
        if (!info || !info.keys) return
        info.keys.forEach((key) => {
          if (!key.startsWith('sign_task_')) return
          try {
            const data = JSON.parse(uni.getStorageSync(key))
            if (!data || (data.expireTime && Date.now() > data.expireTime)) uni.removeStorageSync(key)
          } catch (error) {
            uni.removeStorageSync(key)
          }
        })
      } catch (error) {
        console.error('清除sign_task_缓存失败：', error)
      }
    },
    manualEndAllTasks() {
      if (!this.allowManualEnd) {
        uni.showToast({ title: '当前不允许结束任务', icon: 'none' })
        return
      }
      this.resetTasks()
      this.$emit('manualEnd', {
        taskId: null,
        remainingTasks: 0,
        isAllEnd: true,
      })
    },
  },
}
</script>

<style scoped>
.item-icon {
  align-items: center;
  background-color: rgba(0, 0, 0, .2);
  border-radius: 10rpx;
  display: flex;
  height: 70rpx;
  justify-content: center;
  margin-right: 10rpx;
  padding: 5rpx;
  position: relative;
  width: 70rpx;
}

.item-icon image {
  display: block !important;
  height: 60rpx;
  width: 60rpx;
}

.item-icon .icon-tit,
.float-sign-btn .icon-tit {
  background-color: rgba(0, 0, 0, .5);
  border-radius: 0 0 10rpx 10rpx;
  bottom: 0;
  color: #fff;
  font-size: 17rpx;
  left: 0;
  line-height: 24rpx;
  position: absolute;
  text-align: center;
  width: 100%;
}

.float-sign-btn {
  align-items: center;
  background: linear-gradient(180deg, rgba(0, 0, 0, .3), rgba(0, 0, 0, .1));
  border-radius: 10rpx;
  display: flex;
  height: 70rpx;
  justify-content: center;
  position: fixed;
  right: 20rpx;
  top: 780rpx;
  touch-action: none;
  width: 70rpx;
  z-index: 180;
}

.float-sign-btn .sign-icon {
  display: block !important;
  height: 60rpx;
  width: 60rpx;
}

.red-packet-modal {
  background: linear-gradient(180deg, #ff6b3b, #ff3a3a);
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, .2);
  color: #fff;
  font-family: PingFang SC, Microsoft YaHei, sans-serif;
  max-width: 400px;
  overflow: hidden;
  position: relative;
  text-align: center;
  width: 85vw;
}

.modal-title {
  color: #f5debc;
  font-size: 28px;
  font-weight: 700;
  margin: 15px 0;
  text-align: center;
}

.condition-box {
  background: #fff4e6;
  border-radius: 12px;
  box-sizing: border-box;
  color: #333;
  height: 250rpx;
  margin: 0 15px 15px;
  padding: 0 15px;
  width: calc(100% - 30px);
}

.condition-content {
  align-items: center;
  display: flex !important;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
}

.watch-time {
  background: #fff;
  border-radius: 20rpx;
  flex: 1;
  padding: 8px;
}

.watch-time .label,
.check-in .label {
  font-size: 12px;
  margin-bottom: 5px;
}

.watch-time .time,
.check-in .status {
  color: #ff3a3a;
  font-size: 14px;
  font-weight: 700;
}

.plus {
  background-color: red;
  border-radius: 50rpx;
  color: #fff;
  font-size: 20px;
  height: 25px;
  line-height: 17px;
  margin: auto -14rpx;
  padding: 8rpx;
  width: 25px;
  z-index: 9;
}

.check-in {
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  display: flex;
  flex: 1;
  justify-content: center;
  padding: 20px 0;
}

.get-btn {
  background-color: #ffe4b5;
  border: none;
  border-radius: 22px;
  color: #333;
  font-size: 16px;
  font-weight: 700;
  height: 44px;
  line-height: 44px;
  margin: 0 auto 10px;
  width: 80%;
}

.tips {
  color: #fff;
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 20px;
  padding: 10px 33px;
  text-align: center;
}

.getTitle {
  color: #b27b68;
  font-weight: 700;
  height: 62rpx;
  line-height: 62rpx;
  text-align: center;
}
</style>
