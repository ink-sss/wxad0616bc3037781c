<template>
  <bottom-sheet-popup
    :visible="visible"
    :height="popupHeight"
    radius="24rpx 24rpx 0 0"
    :duration="500"
    :z-index="zIndex"
    :with-mask="true"
    mask-color="rgba(0, 0, 0, 0.35)"
    @close="emit('close')"
  >
    <view class="address-form-popup">
      <view class="popup-header">
        <text class="popup-title">{{
          editId ? "编辑收货地址" : "新增收货地址"
        }}</text>
      </view>

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
            @change="form.isDefault = !!$event.detail.value"
          />
        </view>
      </view>

      <view class="popup-footer">
        <view class="save-btn" @click="onSave">保存</view>
      </view>
    </view>
  </bottom-sheet-popup>
</template>

<script setup>
import { reactive, computed, watch, ref } from "vue";
import BottomSheetPopup from "@/components/bottom-sheet-popup.vue";
import { saveAddressForm } from "@/services/address-form";
import areaData from "@/utils/area.json";

const props = defineProps({
  visible: { type: Boolean, default: false },
  editData: { type: Object, default: null },
  popupHeight: { type: String, default: "66vh" },
  zIndex: { type: Number, default: 80 },
});

const emit = defineEmits(["close", "saved"]);

const editId = computed(() => props.editData?.id || 0);

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

const form = reactive({
  name: "",
  mobile: "",
  province: "",
  city: "",
  district: "",
  detail: "",
  isDefault: false,
});

watch(
  () => props.visible,
  (val) => {
    if (val && props.editData) {
      form.name = props.editData.receiverName || props.editData.name || "";
      form.mobile = props.editData.receiverPhone || props.editData.mobile || "";
      form.province = props.editData.province || "";
      form.city = props.editData.city || "";
      form.district = props.editData.district || "";
      form.detail = props.editData.address || props.editData.detail || "";
      form.isDefault = props.editData.isDefault === 1;
      syncRegionByCodes(
        findCodesByNames(form.province, form.city, form.district),
      );
    } else if (val) {
      form.name = "";
      form.mobile = "";
      form.province = "";
      form.city = "";
      form.district = "";
      form.detail = "";
      form.isDefault = false;
      syncRegionByCodes([]);
    }
  },
);

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
    province: form.province || "未选择",
    city: form.city || "未选择",
    district: form.district || "未选择",
    address: form.detail.trim(),
    isDefault: form.isDefault ? 1 : 0,
  };

  try {
    await saveAddressForm(payload, editId.value);
    uni.showToast({ title: "保存成功", icon: "success" });
    emit("saved");
  } catch (err) {
    uni.showToast({ title: err?.message || "保存失败", icon: "none" });
  }
}
</script>

<style lang="scss" scoped>
.address-form-popup {
  height: 100%;
  background: #f7f7f7;
  border-radius: 24rpx 24rpx 0 0;
  display: flex;
  flex-direction: column;
  padding-bottom: 20rpx;
  box-sizing: border-box;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 100rpx;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
}

.form-card {
  background: #fff;
  margin-top: 16rpx;
  flex: 1;
}

.form-card picker {
  display: block;
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

.row-input {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}
.row-placeholder {
  flex: 1;
  font-size: 30rpx;
  color: #b7b7b7;
}

.row-value-text {
  color: #333;
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

.popup-footer {
  margin-top: auto;
  padding: 28rpx 32rpx 0;
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
