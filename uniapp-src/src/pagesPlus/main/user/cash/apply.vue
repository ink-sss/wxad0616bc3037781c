<template>
  <view class="cash-page" :data-theme="theme && theme()">
    <view class="hero">
      <view>可提现余额</view>
      <text>¥{{ balance || '0.00' }}</text>
    </view>

    <view v-if="payType.length > 1" class="types">
      <view v-for="type in payType" :key="type" :class="{ active: withdraw_type === type }" @tap="typeFunc(type)">
        {{ payTypeText(type) }}
      </view>
    </view>

    <view class="card">
      <input v-model="money" class="input" type="digit" :placeholder="'最低提现￥' + min_money" />
      <button class="mini" @tap="getAll">全部提现</button>
    </view>

    <view v-if="withdraw_type === 20" class="card">
      <input v-model="form.alipay_name" class="input" placeholder="请输入支付宝姓名" />
      <input v-model="form.alipay_account" class="input" placeholder="请输入支付宝账号" />
    </view>

    <view v-if="withdraw_type === 30" class="card">
      <input v-model="form.bank_account" class="input" placeholder="请输入开户名" />
      <input v-model="form.bank_card" class="input" placeholder="请输入银行卡号" />
      <input v-model="form.bank_name" class="input" placeholder="请输入开户行名称" />
    </view>

    <view class="tips">
      <view>当前余额：¥{{ balance || '0.00' }}</view>
      <view>手续费比例：{{ cash_ratio }}%</view>
      <view>预计手续费：¥{{ overMoney }}</view>
    </view>

    <button class="primary" :loading="clock" @tap="formSubmit">提交申请</button>
  </view>
</template>

<script>
import { requestTransfer } from '../../../../pages/user/page-tools.js'

export default {
  data() {
    return {
      loadding: true,
      withdraw_type: 10,
      payType: [],
      money: '',
      clock: false,
      cash_ratio: 0,
      overMoney: '0.00',
      balance: '',
      form: {},
      min_money: '',
    }
  },
  watch: {
    money() {
      this.overMoney = this.overprice()
    },
  },
  mounted() {
    this.getData()
  },
  methods: {
    payTypeText(type) {
      return { 10: '微信', 20: '支付宝', 30: '银行卡', 40: '微信零钱' }[type] || '提现'
    },
    typeFunc(type) {
      this.withdraw_type = type
    },
    getData() {
      uni.showLoading({ title: '加载中' })
      this.loadding = true
      this._get(
        'user.cash/index',
        { platform: this.getPlatform() },
        (res) => {
          const bankInfo = res.data.bankInfo
          if (bankInfo) {
            this.form.bank_account = bankInfo.bank_account
            this.form.bank_card = bankInfo.bank_card
            this.form.bank_name = bankInfo.bank_name
          }
          this.min_money = res.data.min_money
          this.balance = res.data.balance
          this.cash_ratio = res.data.cash_ratio
          this.payType = res.data.pay_type || []
          this.withdraw_type = this.payType[0] || 10
          this.loadding = false
          uni.hideLoading()
        },
        false,
        () => uni.hideLoading(),
      )
    },
    getAll() {
      this.money = this.balance
    },
    overprice() {
      const fee = Number(this.money || 0) * Number(this.cash_ratio || 0) / 100
      return fee.toFixed(2)
    },
    formSubmit() {
      if (this.clock) return
      this.clock = true
      const form = Object.assign({}, this.form, {
        pay_type: this.withdraw_type,
        money: this.money,
        source: this.getPlatform(),
      })
      uni.showLoading({ title: '正在提交', mask: true })
      this._post(
        'user.cash/submit',
        { data: JSON.stringify(form) },
        (res) => {
          uni.hideLoading()
          if (res.code === 1 && res.data && res.data.package_info) {
            requestTransfer({
              mchId: res.data.mchid,
              appId: res.data.wx_app_id,
              package: res.data.package_info,
            })
              .then(() => this.submitResult(res.data.out_bill_no, 40))
              .catch(() => this.submitResult(res.data.out_bill_no, 60))
          } else {
            uni.showModal({
              title: '提示',
              content: res.msg,
              showCancel: false,
              success: () => uni.navigateBack(),
            })
          }
        },
        () => {
          this.clock = false
          uni.hideLoading()
        },
      )
    },
    submitResult(outBillNo, status) {
      this._post('user.cash/submitResult', { out_bill_no: outBillNo, apply_status: status }, () => {
        this.clock = false
        this.getData()
      })
    },
  },
}
</script>

<style scoped>
.cash-page { min-height: 100vh; padding: 24rpx; background: #f5f5f5; box-sizing: border-box; }
.hero { padding: 42rpx 32rpx; color: #fff; background: linear-gradient(135deg, #2b2b2b, #616161); border-radius: 8rpx; font-size: 26rpx; }
.hero text { display: block; margin-top: 14rpx; font-size: 54rpx; font-weight: 700; }
.types { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16rpx; margin: 24rpx 0; }
.types view { height: 70rpx; line-height: 70rpx; text-align: center; color: #555; background: #fff; border-radius: 8rpx; font-size: 26rpx; }
.types .active { color: #fff; background: #19ad57; }
.card { margin-bottom: 24rpx; padding: 24rpx; background: #fff; border-radius: 8rpx; }
.input { height: 84rpx; padding: 0 18rpx; margin-bottom: 16rpx; background: #f7f7f7; border-radius: 8rpx; box-sizing: border-box; font-size: 28rpx; }
.mini { color: #19ad57; background: #eef8f2; font-size: 26rpx; border-radius: 8rpx; }
.tips { padding: 24rpx; color: #777; font-size: 26rpx; line-height: 44rpx; background: #fff; border-radius: 8rpx; }
.primary { margin-top: 34rpx; color: #fff; background: #19ad57; border-radius: 8rpx; }
</style>
