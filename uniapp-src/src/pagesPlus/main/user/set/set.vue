<template>
  <view class="set-page" :data-theme="theme && theme()">
    <view class="profile-card">
      <button class="avatar-button" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <image class="avatar" :src="userInfo.avatarUrl || 'https://man.lqjy.cc/static/login-default.png'" />
      </button>
      <view class="id">用户ID：{{ userInfo.user_id || '--' }}</view>
    </view>

    <view class="card">
      <view class="row">
        <text>昵称</text>
        <input v-model="userInfo.nickName" class="value" placeholder="请输入昵称" @blur="type = 'nickName'; update()" />
      </view>
      <view class="row" @tap="isPhoneOpen">
        <text>手机号</text>
        <view class="value text">{{ maskPhone(userInfo.mobile) || '去绑定' }}</view>
      </view>
      <radio-group class="row gender" @change="changeGender">
        <text>性别</text>
        <label><radio value="1" :checked="Number(userInfo.gender) === 1" color="#19ad57" />男</label>
        <label><radio value="0" :checked="Number(userInfo.gender) === 0" color="#19ad57" />女</label>
      </radio-group>
      <view class="row" @tap="isPasswordOpen">
        <text>登录密码</text>
        <view class="value text">{{ userInfo.password ? '修改' : '设置' }}</view>
      </view>
    </view>

    <view v-if="isPhone" class="modal">
      <view class="modal-card">
        <view class="modal-title">修改手机号</view>
        <input v-model="mobileModel.mobile" class="input" type="number" maxlength="11" placeholder="请输入手机号" />
        <view v-if="sms_open" class="code-row">
          <input v-model="mobileModel.code" class="input flex" type="number" placeholder="验证码" />
          <button class="code-btn" :disabled="is_send" @tap="sendCode('mobileModel')">{{ send_btn_txt }}</button>
        </view>
        <button class="primary" @tap="changePhone">保存</button>
        <button class="ghost" @tap="isPhone = false">取消</button>
      </view>
    </view>

    <view v-if="isPassword" class="modal">
      <view class="modal-card">
        <view class="modal-title">修改密码</view>
        <input v-model="passwordModel.mobile" class="input" type="number" maxlength="11" placeholder="手机号" />
        <view v-if="sms_open" class="code-row">
          <input v-model="passwordModel.code" class="input flex" type="number" placeholder="验证码" />
          <button class="code-btn" :disabled="is_send" @tap="sendCode('passwordModel')">{{ send_btn_txt }}</button>
        </view>
        <input v-model="passwordModel.password" class="input" type="password" placeholder="新密码" />
        <input v-model="passwordModel.repassword" class="input" type="password" placeholder="确认新密码" />
        <button class="primary" @tap="changePassword">保存</button>
        <button class="ghost" @tap="isPassword = false">取消</button>
      </view>
    </view>

    <button class="logout" @tap="logout">退出登录</button>
    <button class="danger" @tap="deleteAccount">删除账号</button>
  </view>
</template>

<script>
import { normalizeAvatarEvent } from '../../../../platform/weixin/index.js'
import { mobileValid, toast } from '../../../../pages/user/page-tools.js'
import { uploadFileWithComplaintUploadUrl } from '../../../../api/upload.js'

export default {
  data() {
    return {
      userInfo: {},
      imageList: [],
      type: '',
      loading: false,
      mobileModel: { mobile: '', code: '' },
      passwordModel: { mobile: '', code: '', password: '', repassword: '' },
      is_send: false,
      send_btn_txt: '获取验证码',
      second: 60,
      isPhone: false,
      isPassword: false,
      sms_open: false,
    }
  },
  onShow() {
    this.getData()
    this.getCodeType()
  },
  methods: {
    getCodeType() {
      this._post('index/loginSetting', {}, (res) => {
        this.sms_open = !!(res.data.setting && res.data.setting.h5_sms_open)
      })
    },
    maskPhone(value) {
      return value && value.length === 11 ? value.replace(/(\d{3})\d{4}(\d{4})/, '$1***$2') : value
    },
    getData() {
      uni.showLoading({ title: '加载中' })
      this._get(
        'user.index/setting',
        {},
        (res) => {
          this.userInfo = res.data.userInfo || {}
          uni.hideLoading()
        },
        false,
        () => uni.hideLoading(),
      )
    },
    onChooseAvatar(event) {
      const avatar = normalizeAvatarEvent(event).avatarUrl
      if (avatar) this.uploadFile([avatar])
    },
    async uploadFile(files) {
      this.imageList = []
      let done = 0
      uni.showLoading({ title: '图片上传中' })
      await Promise.all(files.map(async (filePath) => {
        try {
          const uploaded = await uploadFileWithComplaintUploadUrl({
            filePath,
            fileType: 'image',
          })
          this.imageList.push(uploaded)
        } catch (error) {
          this.showError(error?.message || '上传失败')
        } finally {
          done += 1
        }
      }))
      if (done === files.length) {
        uni.hideLoading()
        this.getImgsFunc(this.imageList)
      }
    },
    getImgsFunc(files) {
      if (files && files[0]) {
        this.userInfo.avatarUrl = files[0].file_path
        this.update()
      }
    },
    changeGender(event) {
      this.userInfo.gender = event.detail.value
      this.type = 'gender'
      this.update()
    },
    update() {
      if (this.loading) return
      this.loading = true
      uni.showLoading({ title: '加载中' })
      this._post(
        'user.user/updateInfo',
        this.userInfo,
        () => {
          this.showSuccess('修改成功', () => {
            this.loading = false
            uni.hideLoading()
            this.getData()
          })
        },
        false,
        () => {
          this.loading = false
          uni.hideLoading()
        },
      )
    },
    isPhoneOpen() {
      this.isPhone = true
      this.mobileModel = { mobile: '', code: '' }
    },
    isPasswordOpen() {
      if (!this.userInfo.mobile) {
        toast('请先绑定手机号')
        return
      }
      this.isPassword = true
      this.passwordModel = { mobile: this.userInfo.mobile, code: '', password: '', repassword: '' }
    },
    changePhone() {
      if (this.sms_open && !this.mobileModel.code) return toast('请输入验证码')
      this._post('user.Useropen/changeMobile', this.mobileModel, () => {
        uni.showModal({ title: '提示', content: '修改成功', success: () => { this.isPhone = false; this.getData() } })
      })
    },
    changePassword() {
      const model = this.passwordModel
      if (!model.mobile) return toast('请输入手机号')
      if (this.sms_open && !model.code) return toast('请输入验证码')
      if (!model.password) return toast('请输入密码')
      if (model.password.length < 6) return toast('请输入6位以上的密码')
      if (model.password !== model.repassword) return toast('两次密码输入不一致')
      this._post('user.Useropen/changePassword', model, () => {
        uni.showModal({ title: '提示', content: '修改成功', success: () => { this.isPassword = false; this.getData() } })
      })
    },
    sendCode(modelName) {
      const model = this[modelName]
      if (!mobileValid(model.mobile)) return toast('手机有误,请重填！')
      this._post('user.userweb/sendCode', { mobile: model.mobile, type: modelName === 'mobileModel' ? 'register' : 'login' }, (res) => {
        if (res.code === 1) {
          uni.showToast({ title: '发送成功' })
          this.is_send = true
          this.changeMsg()
        }
      })
    },
    changeMsg() {
      if (this.second > 0) {
        this.send_btn_txt = this.second + '秒'
        this.second -= 1
        setTimeout(() => this.changeMsg(), 1000)
      } else {
        this.send_btn_txt = '获取验证码'
        this.second = 60
        this.is_send = false
      }
    },
    logout() {
      this._post('/user.User/logOut', {}, () => {
        uni.removeStorageSync('token')
        uni.removeStorageSync('user_id')
        uni.removeStorageSync('shop_supplier_id')
        uni.removeStorageSync('supplier_user_id')
        const app = getApp()
        if (app && typeof app.imLogout === 'function') app.imLogout()
        this.gotoPage('/pages/index/index')
      })
    },
    deleteAccount() {
      uni.showModal({
        title: '提示',
        content: '是否确认删除账号？删除后您将无法用此账号登录，此账户下的数据也将删除',
        success: (modal) => {
          if (modal.confirm) {
            this._post('user.user/deleteAccount', {}, () => {
              this.showSuccess('删除成功', () => {
                uni.removeStorageSync('token')
                uni.removeStorageSync('user_id')
                this.gotoPage('/pages/index/index')
              })
            })
          }
        },
      })
    },
  },
}
</script>

<style scoped>
.set-page { min-height: 100vh; padding: 24rpx; background: #f5f5f5; box-sizing: border-box; }
.profile-card, .card { margin-bottom: 24rpx; padding: 28rpx; background: #fff; border-radius: 8rpx; }
.avatar-button { width: 140rpx; height: 140rpx; margin: 0 auto 16rpx; padding: 0; border-radius: 50%; background: transparent; }
.avatar { width: 140rpx; height: 140rpx; border-radius: 50%; }
.id { text-align: center; color: #777; font-size: 24rpx; }
.row { display: flex; align-items: center; min-height: 92rpx; border-bottom: 1px solid #eee; color: #333; font-size: 28rpx; }
.row:last-child { border-bottom: 0; }
.row text:first-child { width: 160rpx; color: #555; }
.value { flex: 1; text-align: right; font-size: 28rpx; }
.text { color: #777; }
.gender { gap: 24rpx; }
.modal { position: fixed; z-index: 5; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.35); }
.modal-card { width: 620rpx; padding: 32rpx; background: #fff; border-radius: 8rpx; box-sizing: border-box; }
.modal-title { margin-bottom: 26rpx; text-align: center; font-size: 32rpx; font-weight: 600; }
.input { height: 84rpx; padding: 0 20rpx; margin-bottom: 18rpx; background: #f7f7f7; border-radius: 8rpx; font-size: 28rpx; box-sizing: border-box; }
.code-row { display: flex; gap: 16rpx; }
.flex { flex: 1; }
.code-btn { width: 190rpx; height: 84rpx; line-height: 84rpx; color: #19ad57; background: #eef8f2; border-radius: 8rpx; font-size: 24rpx; }
button { border-radius: 8rpx; }
.primary { color: #fff; background: #19ad57; }
.ghost { margin-top: 18rpx; color: #666; background: #f7f7f7; }
.logout { margin-top: 40rpx; color: #fff; background: #444; border-radius: 8rpx; }
.danger { margin-top: 20rpx; color: #fff; background: #e64340; border-radius: 8rpx; }
</style>
