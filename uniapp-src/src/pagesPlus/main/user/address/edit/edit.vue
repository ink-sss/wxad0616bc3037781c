<template>
  <view class="address-form" :data-theme="theme && theme()">
    <view class="card">
      <input v-model="address.name" class="input" placeholder="收货人姓名" />
      <input v-model="address.phone" class="input" type="number" maxlength="11" placeholder="手机号码" />
      <picker mode="region" @change="onRegionChange">
        <view class="picker">{{ selectCity }}</view>
      </picker>
      <textarea v-model="address.detail" class="textarea" placeholder="街道、小区、楼牌号等" />
      <label class="default-row">
        <switch :checked="is_default" color="#19ad57" @change="is_default = $event.detail.value" />
        <text>设为默认地址</text>
      </label>
    </view>
    <button class="primary" @tap="formSubmit">保存修改</button>
  </view>
</template>

<script>
import { mobileValid, toast } from '../../../../../pages/user/page-tools.js'

export default {
  data() {
    return {
      selectCity: '选择省,市,区',
      province_id: 0,
      city_id: 0,
      region_id: 0,
      address_id: 0,
      address: { name: '', phone: '', detail: '' },
      region: [],
      province: [],
      city: [],
      area: [],
      is_default: false,
      delta: 1,
    }
  },
  onLoad(query = {}) {
    this.delta = query.delta || 1
    this.address_id = query.address_id
    this.getData()
  },
  methods: {
    getData() {
      this._get('user.address/detail', { address_id: this.address_id }, (res) => {
        const data = res.data || {}
        this.address = data.detail || {}
        this.address_id = this.address.address_id
        this.province_id = this.address.province_id
        this.city_id = this.address.city_id
        this.region_id = this.address.region_id
        this.region = data.region || []
        this.selectCity = this.region.join('') || '选择省,市,区'
        this.province = (data.regionData && data.regionData[0]) || []
        this.city = (data.regionData && data.regionData[1]) || []
        this.area = (data.regionData && data.regionData[2]) || []
        this.is_default = data.is_default === 1 || this.address.is_default === 1
      })
    },
    onRegionChange(event) {
      const [provinceName, cityName, regionName] = event.detail.value
      const provinceIndex = this.province.findIndex((item) => item.label === provinceName || item.name === provinceName)
      if (provinceIndex < 0) return toast('所在地区匹配错误，请手动选择')
      const cityIndex = (this.city[provinceIndex] || []).findIndex((item) => item.label === cityName || item.name === cityName)
      if (cityIndex < 0) return toast('所在地区匹配错误，请手动选择')
      const areaItem = ((this.area[provinceIndex] || [])[cityIndex] || []).find((item) => item.label === regionName || item.name === regionName)
      if (!areaItem) return toast('所在地区匹配错误，请手动选择')
      this.province_id = this.province[provinceIndex].value || this.province[provinceIndex].id
      this.city_id = this.city[provinceIndex][cityIndex].value || this.city[provinceIndex][cityIndex].id
      this.region_id = areaItem.value || areaItem.id
      this.region = [provinceName, cityName, regionName]
      this.selectCity = this.region.join(',')
    },
    formSubmit() {
      const payload = {
        address_id: this.address_id,
        name: this.address.name,
        phone: this.address.phone,
        detail: this.address.detail,
        province_id: this.province_id,
        city_id: this.city_id,
        region_id: this.region_id,
        region: this.region,
        is_default: this.is_default ? 1 : 0,
      }
      if (!payload.name) return toast('请输入收货人姓名')
      if (!mobileValid(payload.phone)) return toast('请输入正确手机号')
      if (!payload.province_id || !payload.city_id || !payload.region_id) return toast('请选择完整省市区')
      if (!payload.detail) return toast('请输入街道小区楼牌号等')
      this._post('user.address/edit', payload, (res) => {
        this.showSuccess(res.msg, () => uni.navigateBack({ delta: 1 }))
      })
    },
  },
}
</script>

<style scoped>
.address-form { min-height: 100vh; padding: 24rpx; background: #f5f5f5; box-sizing: border-box; }
.card { padding: 24rpx; background: #fff; border-radius: 8rpx; }
.input, .picker { height: 88rpx; line-height: 88rpx; border-bottom: 1px solid #eee; font-size: 28rpx; color: #333; }
.textarea { width: 100%; min-height: 150rpx; padding: 20rpx 0; font-size: 28rpx; box-sizing: border-box; }
.default-row { display: flex; align-items: center; gap: 18rpx; padding-top: 20rpx; color: #666; font-size: 26rpx; }
.primary { margin-top: 28rpx; color: #fff; background: #19ad57; border-radius: 8rpx; }
</style>
