<template>
  <view class="address-page">
    <view class="form-card">
      <view class="form-row">
        <text class="row-label">收货人</text>
        <input
          v-model="form.name"
          class="row-input"
          placeholder="请输入收货人姓名"
        />
      </view>
      <view class="form-row">
        <text class="row-label">手机号</text>
        <view class="phone-wrap">
          <text class="phone-prefix">+86 ˇ</text>
          <input
            v-model="form.mobile"
            class="row-input"
            placeholder="请输入手机号"
          />
        </view>
      </view>
      <picker
        mode="multiSelector"
        :range="regionPickerRange"
        :value="regionIndexes"
        @columnchange="onRegionColumnChange"
        @change="onRegionConfirm"
      >
        <view class="form-row form-row-arrow">
          <text class="row-label">所在地区</text>
          <view class="row-right">
            <text
              :class="['row-placeholder', regionText ? 'row-value-text' : '']"
              >{{ regionText || "请选择所在地区" }}</text
            >
            <text class="row-arrow">›</text>
          </view>
        </view>
      </picker>
      <view class="form-row">
        <text class="row-label">详细地址</text>
        <input
          v-model="form.detail"
          class="row-input"
          placeholder="请输入街道、楼牌号"
        />
      </view>
      <view class="form-row form-row-switch">
        <text class="row-label">设置默认地址</text>
        <switch
          :checked="form.isDefault"
          color="#ff7a1a"
          @change="onSwitchChange"
        />
      </view>
    </view>

    <view class="save-bar">
      <view class="save-btn" @click="onSave">保存</view>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
  createAddress,
  updateAddress,
  deleteAddress,
  getAddressList,
} from "@/api/address";
import { ensureH5PageAuth } from "@/services/h5-auth-context";
import areaData from "@/utils/area.json";

const isEdit = ref(false);
const addressId = ref(0);
const form = reactive({
  name: "",
  mobile: "",
  province: "",
  city: "",
  district: "",
  detail: "",
  isDefault: false,
});
function onSwitchChange(event) {
  form.isDefault = !!event.detail.value;
}

function mapAreaOptions(list = []) {
  return list.map((item) => ({
    label: item.name,
    value: item.code,
  }));
}

function getProvinceList() {
  return areaData || [];
}

function getCityList(provinceCode) {
  return (
    getProvinceList().find((item) => item.code === provinceCode)?.children || []
  );
}

function getDistrictList(provinceCode, cityCode) {
  return (
    getCityList(provinceCode).find((item) => item.code === cityCode)
      ?.children || []
  );
}

function findAreaByCodes(codes = []) {
  const [provinceCode, cityCode, districtCode] = codes;
  const province = getProvinceList().find((item) => item.code === provinceCode);
  const city = (province?.children || []).find(
    (item) => item.code === cityCode,
  );
  const district = (city?.children || []).find(
    (item) => item.code === districtCode,
  );
  return { province, city, district };
}

function findCodesByNames(provinceName, cityName, districtName) {
  const province = getProvinceList().find((item) => item.name === provinceName);
  const city = (province?.children || []).find(
    (item) => item.name === cityName,
  );
  const district = (city?.children || []).find(
    (item) => item.name === districtName,
  );
  if (!province || !city || !district) return [];
  return [province.code, city.code, district.code];
}

const regionValue = ref([]);
const regionColumns = ref([]);
const regionIndexes = ref([0, 0, 0]);
const regionPickerRange = computed(() =>
  regionColumns.value.map((column) => column.map((item) => item.label)),
);

function indexOfCode(options = [], code = "") {
  const index = options.findIndex((item) => item.value === code);
  return index >= 0 ? index : 0;
}

function setRegionColumns(codes = []) {
  const provinceList = getProvinceList();
  const provinceCode = codes[0] || provinceList[0]?.code || "";
  const cityList = getCityList(provinceCode);
  const cityCode = codes[1] || cityList[0]?.code || "";
  const districtList = getDistrictList(provinceCode, cityCode);
  const columns = [
    mapAreaOptions(provinceList),
    mapAreaOptions(cityList),
    mapAreaOptions(districtList),
  ];
  regionColumns.value = columns;
  regionIndexes.value = [
    indexOfCode(columns[0], provinceCode),
    indexOfCode(columns[1], cityCode),
    indexOfCode(columns[2], codes[2] || columns[2]?.[0]?.value || ""),
  ];
}

function syncRegionByCodes(codes = []) {
  if (!codes.length) {
    regionValue.value = [];
    setRegionColumns();
    return;
  }
  setRegionColumns(codes);
  regionValue.value = codes;
  const { province, city, district } = findAreaByCodes(codes);
  form.province = province?.name || "";
  form.city = city?.name || "";
  form.district = district?.name || "";
}

const regionText = computed(() => {
  if (!form.province || !form.city || !form.district) return "";
  return `${form.province} ${form.city} ${form.district}`;
});

function onRegionColumnChange(event) {
  const columnIndex = Number(event.detail.column || 0);
  const selectedIndex = Number(event.detail.value || 0);
  const nextIndexes = [...regionIndexes.value];
  nextIndexes[columnIndex] = selectedIndex;

  if (columnIndex === 0) {
    const province = regionColumns.value[0]?.[selectedIndex];
    const cityList = mapAreaOptions(getCityList(province?.value));
    const firstCityCode = cityList[0]?.value || "";
    const districtList = mapAreaOptions(getDistrictList(province?.value, firstCityCode));
    regionColumns.value = [regionColumns.value[0], cityList, districtList];
    nextIndexes[1] = 0;
    nextIndexes[2] = 0;
  } else if (columnIndex === 1) {
    const province = regionColumns.value[0]?.[nextIndexes[0]];
    const city = regionColumns.value[1]?.[selectedIndex];
    const districtList = mapAreaOptions(getDistrictList(province?.value, city?.value));
    regionColumns.value = [regionColumns.value[0], regionColumns.value[1], districtList];
    nextIndexes[2] = 0;
  }

  regionIndexes.value = nextIndexes;
}

function onRegionConfirm(event) {
  const indexes = event?.detail?.value || regionIndexes.value;
  regionIndexes.value = indexes;
  const province = regionColumns.value[0]?.[indexes[0]];
  const city = regionColumns.value[1]?.[indexes[1]];
  const district = regionColumns.value[2]?.[indexes[2]];
  syncRegionByCodes([province?.value, city?.value, district?.value].filter(Boolean));
}

function fillForm(d) {
  form.name = d.receiverName || "";
  form.mobile = d.receiverPhone || "";
  form.province = d.province || "";
  form.city = d.city || "";
  form.district = d.district || "";
  form.detail = d.address || "";
  form.isDefault = d.isDefault === 1;
  syncRegionByCodes(findCodesByNames(form.province, form.city, form.district));
}

async function loadAddressDetail(id) {
  try {
    const list = await getAddressList();
    if (Array.isArray(list)) {
      const found = list.find((a) => a.id === id);
      if (found) {
        fillForm(found);
      }
    }
  } catch (err) {
    console.error("[AddressEdit] loadAddressDetail fail:", err);
  }
}

onLoad((options) => {
  if (!ensureH5PageAuth(options)) return;
  setRegionColumns();
  if (options?.id) {
    isEdit.value = true;
    addressId.value = Number(options.id);
  }
  if (options?.data) {
    try {
      const d = JSON.parse(decodeURIComponent(options.data));
      fillForm(d);
    } catch (e) {}
  } else if (addressId.value) {
    loadAddressDetail(addressId.value);
  }
});

async function onSave() {
  if (!form.name.trim()) {
    uni.showToast({ title: "请输入收货人", icon: "none" });
    return;
  }
  if (!/^1\d{10}$/.test(form.mobile)) {
    uni.showToast({ title: "请输入正确手机号", icon: "none" });
    return;
  }
  if (!form.province || !form.city || !form.district) {
    uni.showToast({ title: "请选择所在地区", icon: "none" });
    return;
  }
  if (!form.detail.trim()) {
    uni.showToast({ title: "请输入详细地址", icon: "none" });
    return;
  }

  const payload = {
    receiverName: form.name.trim(),
    receiverPhone: form.mobile.trim(),
    province: form.province,
    city: form.city,
    district: form.district,
    address: form.detail.trim(),
    isDefault: form.isDefault ? 1 : 0,
  };

  try {
    if (isEdit.value) {
      await updateAddress({ id: addressId.value, ...payload });
    } else {
      await createAddress(payload);
    }
    uni.showToast({ title: "保存成功", icon: "success" });
    setTimeout(() => {
      uni.navigateBack({
        fail: () => uni.reLaunch({ url: "/pages/center/index" }),
      });
    }, 300);
  } catch (err) {
    uni.showToast({ title: err?.message || "保存失败", icon: "none" });
  }
}

async function onDelete() {
  if (!isEdit.value || !addressId.value) return;
  uni.showModal({
    title: "确认删除",
    content: "确定删除此地址吗？",
    success: async (res) => {
      if (!res.confirm) return;
      try {
        await deleteAddress(addressId.value);
        uni.showToast({ title: "已删除", icon: "success" });
        setTimeout(() => uni.navigateBack(), 300);
      } catch (err) {
        uni.showToast({ title: err?.message || "删除失败", icon: "none" });
      }
    },
  });
}
</script>

<style lang="scss" scoped>
.address-page {
  min-height: 100vh;
  background: #f7f7f7;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.form-card {
  background: #fff;
}

.form-row {
  min-height: 112rpx;
  display: flex;
  align-items: center;
  padding: 0 28rpx;
  border-bottom: 1rpx solid #efefef;
  box-sizing: border-box;
}

.row-label {
  width: 184rpx;
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  flex-shrink: 0;
}

.row-input,
.row-placeholder {
  flex: 1;
  font-size: 30rpx;
  color: #b7b7b7;
}

.phone-wrap {
  flex: 1;
  display: flex;
  align-items: center;
}

.phone-prefix {
  font-size: 30rpx;
  color: #666;
  margin-right: 22rpx;
}

.form-row-arrow,
.form-row-switch {
  justify-content: space-between;
}

.row-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.row-arrow {
  font-size: 34rpx;
  color: #9f9f9f;
}

.save-bar {
  position: fixed;
  left: 32rpx;
  right: 32rpx;
  bottom: calc(32rpx + env(safe-area-inset-bottom));
}

.save-btn {
  height: 92rpx;
  border-radius: 46rpx;
  background: linear-gradient(90deg, #ff8d1a 0%, #ff6c17 100%);
  color: #fff;
  font-size: 34rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
