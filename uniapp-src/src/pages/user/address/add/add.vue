<template>
  <view class="address-form" :data-theme="theme && theme()">
    <view class="card">
      <input v-model="address.name" name="name" class="input" placeholder="收货人姓名" />
      <input v-model="address.phone" name="phone" class="input" type="number" maxlength="11" placeholder="手机号码" />
      <picker mode="region" @change="onRegionChange">
        <view class="picker">{{ selectCity }}</view>
      </picker>
      <textarea v-model="address.detail" name="detail" class="textarea" placeholder="街道、小区、楼牌号等" />
      <label class="default-row">
        <switch :checked="is_default" color="#19ad57" @change="is_default = $event.detail.value" />
        <text>设为默认地址</text>
      </label>
    </view>

    <view class="parse">
      <view class="parse-title" @tap="ztIsShow">粘贴地址智能识别</view>
      <view v-if="zt_is_show">
        <textarea v-model="rawAddress" class="textarea raw" placeholder="粘贴完整收货信息" />
        <button class="ghost" @tap="parseAddress">识别地址</button>
      </view>
    </view>

    <button class="primary" @tap="chooseAddress">获取微信地址</button>
    <button class="primary" @tap="formSubmit">保存地址</button>
  </view>
</template>

<script>
import { mobileValid, toast } from '../../page-tools.js'

export default {
  data() {
    return {
      selectCity: '选择省,市,区',
      province_id: 0,
      city_id: 0,
      region_id: 0,
      address: { name: '', phone: '', detail: '' },
      delta: 1,
      province: [],
      city: [],
      area: [],
      is_default: false,
      zt_is_show: false,
      rawAddress: '',
    }
  },
  onLoad(query = {}) {
    this.delta = query.delta || 1
    this.getData()
  },
  methods: {
    getData() {
      this._post('settings/getRegion', {}, (res) => {
        const regionData = res.data.regionData || []
        this.province = regionData[0] || []
        this.city = regionData[1] || []
        this.area = regionData[2] || []
      })
    },
    onRegionChange(event) {
      const [provinceName, cityName, regionName] = event.detail.value
      this.regionMatch(provinceName, cityName, regionName)
    },
    chooseAddress() {
      // TODO:migration Address book has no platform/weixin wrapper yet; preserve uni.chooseAddress semantics for mp-weixin.
      uni.chooseAddress({
        success: (res) => {
          this.address.name = res.userName
          this.address.phone = res.telNumber
          this.address.detail = res.detailInfo
          this.regionMatch(res.provinceName, res.cityName, res.countyName)
        },
      })
    },
    regionMatch(provinceName, cityName, regionName) {
      let provinceId = 0
      let cityId = 0
      let regionId = 0
      const provinceIndex = this.province.findIndex((item) => item.label === provinceName || item.name === provinceName)
      if (provinceIndex > -1) {
        const province = this.province[provinceIndex]
        provinceId = province.value || province.id || 0
        const cityIndex = (this.city[provinceIndex] || []).findIndex((item) => item.label === cityName || item.name === cityName)
        if (cityIndex > -1) {
          const city = this.city[provinceIndex][cityIndex]
          cityId = city.value || city.id || 0
          const areaItem = ((this.area[provinceIndex] || [])[cityIndex] || []).find((item) => item.label === regionName || item.name === regionName)
          regionId = areaItem ? areaItem.value || areaItem.id || 0 : 0
        }
      }
      if (provinceId && cityId && regionId) {
        this.province_id = provinceId
        this.city_id = cityId
        this.region_id = regionId
        this.selectCity = [provinceName, cityName, regionName].join(',')
      } else {
        toast('所在地区匹配错误，请手动选择')
      }
    },
    ztIsShow() {
      this.zt_is_show = !this.zt_is_show
    },
    parseAddress() {
      const text = this.rawAddress.trim()
      if (!text) return
      const phone = text.match(/1[3-9]\d{9}/)
      if (phone) this.address.phone = phone[0]
      const name = text.replace(phone ? phone[0] : '', '').trim().match(/^[\u4e00-\u9fa5]{2,4}/)
      if (name) this.address.name = name[0]
      this.address.detail = text.replace(this.address.name || '', '').replace(this.address.phone || '', '').trim()
    },
    formSubmit() {
      const payload = {
        name: this.address.name,
        phone: this.address.phone,
        detail: this.address.detail,
        province_id: this.province_id,
        city_id: this.city_id,
        region_id: this.region_id,
        is_default: this.is_default ? 1 : 0,
      }
      if (!payload.name) return toast('请输入收货人姓名')
      if (!mobileValid(payload.phone)) return toast('请输入正确手机号')
      if (!payload.province_id || !payload.city_id || !payload.region_id) return toast('请选择完整省市区')
      if (!payload.detail) return toast('请输入街道小区楼牌号等')
      this._post('user.address/add', payload, (res) => {
        this.showSuccess(res.msg, () => uni.navigateBack({ delta: parseInt(this.delta, 10) || 1 }))
      })
    },
  },
}
</script>

<style scoped>
.address-form { min-height: 100vh; padding: 24rpx; background: #f5f5f5; box-sizing: border-box; }
.card, .parse { margin-bottom: 24rpx; padding: 24rpx; background: #fff; border-radius: 8rpx; }
.input, .picker { height: 88rpx; line-height: 88rpx; border-bottom: 1px solid #eee; font-size: 28rpx; color: #333; }
.textarea { width: 100%; min-height: 150rpx; padding: 20rpx 0; font-size: 28rpx; box-sizing: border-box; }
.default-row { display: flex; align-items: center; gap: 18rpx; padding-top: 20rpx; color: #666; font-size: 26rpx; }
.parse-title { color: #333; font-size: 28rpx; }
.raw { margin-top: 20rpx; padding: 20rpx; background: #f7f7f7; border-radius: 8rpx; }
button { margin-top: 22rpx; border-radius: 8rpx; }
.primary { color: #fff; background: #19ad57; }
.ghost { color: #19ad57; background: #eef8f2; }
</style>
