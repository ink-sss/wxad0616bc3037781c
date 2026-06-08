<template>
  <view class="sign-in-container">
    <!-- 已签到状态 -->
    <view v-if="hasSigned" class="signed-done">
      <image
        class="signed-backdrop"
        src="https://man.lqjy.cc/static/icons/sign-back.png"
        mode="aspectFill"
      />
      <image
        class="signed-success-image"
        src="https://man.lqjy.cc/static/icons/sign-success.png"
        mode="widthFix"
      />
    </view>

    <!-- 签到表单 -->
    <view v-else class="sign-form-wrapper">
      <scroll-view class="sign-scroll-body" scroll-y>
        <!-- 签到封面图 -->
        <view class="sign-cover" v-if="config.coverImage">
          <image
            :src="config.coverImage "
            mode="widthFix"
            class="sign-cover-img"
          />
        </view>

        <!-- 签到提示词 -->
        <view v-if="showWelcomeText && config.welcomeText" class="sign-welcome">
          <text class="sign-welcome-text">{{ config.welcomeText }}</text>
        </view>

        <!-- 动态表单字段 -->
        <view class="sign-fields">
          <view
            v-for="field in fields"
            :key="field.key"
            class="sign-field-item"
          >
            <view class="field-label">
              <text class="field-label-text">{{ field.label }}</text>
              <text v-if="field.required" class="field-required">*</text>
            </view>

            <wd-radio-group
              v-if="isGenderField(field)"
              v-model="formData[field.key]"
              shape="dot"
              class="field-gender-radio-group"
            >
              <wd-radio :value="1">男</wd-radio>
              <wd-radio :value="2">女</wd-radio>
            </wd-radio-group>

            <!-- 文本输入 -->
            <input
              v-else-if="
                field.type === 'name' ||
                field.type === 'mobile' ||
                field.type === 'text' ||
                field.type === 'number' ||
                field.type === 'phone' ||
                field.type === 'email'
              "
              class="field-input"
              :type="
                field.type === 'phone' ||
                field.type === 'mobile' ||
                field.type === 'number'
                  ? 'number'
                  : 'text'
              "
              :placeholder="field.placeholder || `请输入${field.label}`"
              :value="formData[field.key]"
              @input="onFieldInput(field.key, $event)"
            />

            <!-- 日期 -->
            <picker
              v-else-if="field.type === 'date'"
              mode="date"
              fields="day"
              :value="formData[field.key] || ''"
              @change="onDateChange(field.key, $event)"
            >
              <view class="field-picker">
                <text :class="{ 'picker-placeholder': !formData[field.key] }">
                  {{ formData[field.key] || field.placeholder || "请选择日期" }}
                </text>
                <text class="picker-arrow">▾</text>
              </view>
            </picker>

            <!-- 城市 -->
            <picker
              v-else-if="field.type === 'city'"
              mode="region"
              :value="getRegionPickerValue(field)"
              @change="onRegionConfirm(field, $event)"
            >
              <view class="field-picker">
                <text :class="{ 'picker-placeholder': !formData[field.key] }">
                  {{
                    formData[field.key] ||
                    field.placeholder ||
                    (field.subType === "province-city-district"
                      ? "请选择省/市/区"
                      : "请选择省/市")
                  }}
                </text>
                <text class="picker-arrow">▾</text>
              </view>
            </picker>

            <!-- 多行文本 -->
            <textarea
              v-else-if="field.type === 'textarea'"
              class="field-textarea"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :value="formData[field.key]"
              @input="onFieldInput(field.key, $event)"
            />

            <!-- 单选 -->
            <view v-else-if="field.type === 'radio'" class="field-radio-group">
              <view
                v-for="opt in field.options || []"
                :key="opt.key || opt.label"
                class="field-radio-item"
                @click="formData[field.key] = opt.label"
              >
                <view
                  class="radio-dot"
                  :class="{ active: formData[field.key] === opt.label }"
                />
                <text class="radio-label">{{ opt.label }}</text>
              </view>
            </view>

            <!-- 多选 -->
            <view
              v-else-if="field.type === 'checkbox'"
              class="field-checkbox-group"
            >
              <view
                v-for="opt in field.options || []"
                :key="opt.key || opt.label"
                class="field-checkbox-item"
                @click="toggleCheckbox(field.key, opt.label)"
              >
                <view
                  class="checkbox-box"
                  :class="{
                    active: (formData[field.key] || []).includes(opt.label),
                  }"
                >
                  <text
                    v-if="(formData[field.key] || []).includes(opt.label)"
                    class="checkbox-tick"
                    >✓</text
                  >
                </view>
                <text class="checkbox-label">{{ opt.label }}</text>
              </view>
            </view>

            <!-- 下拉选择 -->
            <picker
              v-else-if="field.type === 'select'"
              :range="(field.options || []).map((o) => o.label || o)"
              @change="onPickerChange(field.key, $event, field.options)"
            >
              <view class="field-picker">
                <text :class="{ 'picker-placeholder': !formData[field.key] }">
                  {{
                    formData[field.key] ||
                    field.placeholder ||
                    `请选择${field.label}`
                  }}
                </text>
                <text class="picker-arrow">▾</text>
              </view>
            </picker>

            <!-- 兜底：普通文本输入 -->
            <input
              v-else
              class="field-input"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :value="formData[field.key]"
              @input="onFieldInput(field.key, $event)"
            />
          </view>
        </view>
      </scroll-view>

      <!-- 底部按钮 -->
      <view class="sign-btn-group">
        <view v-if="showSkip" class="sign-btn sign-btn-skip" @click="onSkip">
          <text class="sign-btn-text">跳过</text>
        </view>
        <view
          class="sign-btn sign-btn-submit"
          :class="{ 'sign-btn-full': !showSkip }"
          @click="onSubmit"
        >
          <text class="sign-btn-text sign-btn-text-white">{{
            submitting ? "提交中..." : submitText
          }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { submitLiveSign } from "@/services/live-sign";

const props = defineProps({
  roomId: { type: [Number, String], default: 0 },
  roomCode: { type: String, default: "" },
  tenantId: { type: [Number, String], default: 0 },
  shareCode: { type: String, default: "" },
  bindId: { type: [Number, String], default: "" },
  liveType: { type: String, default: "" },
  termId: { type: [Number, String], default: 0 },
  customerId: { type: [Number, String], default: 0 },
  userId: { type: [Number, String], default: 0 },
  config: {
    type: Object,
    default: () => ({
      enabled: 0,
      ruleType: 1,
      welcomeText: "",
      coverImage: "",
      forceEnabled: 0,
      fields: [],
    }),
  },
  fields: { type: Array, default: () => [] },
  signed: { type: Boolean, default: false },
  showWelcomeText: { type: Boolean, default: true },
  showSkip: { type: Boolean, default: true },
  submitText: { type: String, default: "确定" },
  successMode: { type: String, default: "state" },
});

const emit = defineEmits(["signed", "skip"]);

const hasSigned = ref(props.signed);
const submitting = ref(false);
const formData = reactive({});

// 初始化表单数据
watch(
  () => props.fields,
  (newFields) => {
    if (!Array.isArray(newFields)) return;
    newFields.forEach((f) => {
      if (!(f.key in formData)) {
        if (isGenderField(f)) {
          formData[f.key] = 1;
          return;
        }
        formData[f.key] = f.type === "checkbox" ? [] : "";
      }
    });
  },
  { immediate: true },
);

watch(
  () => props.signed,
  (val) => {
    if (props.successMode === "toast") return;
    hasSigned.value = val;
  },
);

function onFieldInput(key, e) {
  formData[key] = e.detail?.value ?? e.target?.value ?? "";
}

function onDateChange(key, e) {
  formData[key] = e.detail?.value || "";
}

function getRegionPickerValue(field) {
  const value = formData[field.key];
  return typeof value === "string" ? value.split("/").filter(Boolean) : [];
}

function onRegionConfirm(field, event) {
  const names = Array.isArray(event?.detail?.value) ? event.detail.value : [];
  const selectedNames =
    field.subType === "province-city-district"
      ? names.slice(0, 3)
      : names.slice(0, 2);
  formData[field.key] = selectedNames.filter(Boolean).join("/");
}

function toggleCheckbox(key, opt) {
  if (!Array.isArray(formData[key])) {
    formData[key] = [];
  }
  const idx = formData[key].indexOf(opt);
  if (idx >= 0) {
    formData[key].splice(idx, 1);
  } else {
    formData[key].push(opt);
  }
}

function isGenderField(field) {
  const key = String(field?.key || "").toLowerCase();
  const label = String(field?.label || "");
  return key === "gender" || label === "性别";
}

function onPickerChange(key, e, options) {
  const idx = Number(e.detail?.value ?? 0);
  const opt = (options || [])[idx];
  formData[key] = opt?.label || opt || "";
}

function validate() {
  if (!props.fields || props.fields.length === 0) {
    return "";
  }
  for (const field of props.fields) {
    const isRequired =
      field.required === true ||
      field.required === 1 ||
      field.required === "true" ||
      field.required === "1";
    if (!isRequired) continue;
    const val = formData[field.key];
    if (field.type === "checkbox") {
      if (!Array.isArray(val) || val.length === 0) {
        return `请填写${field.label}`;
      }
    } else {
      if (!val || (typeof val === "string" && !val.trim())) {
        return `请填写${field.label}`;
      }
    }
    if (
      (field.type === "phone" || field.type === "mobile") &&
      !/^1\d{10}$/.test(val)
    ) {
      return "请输入正确的手机号";
    }
  }
  return "";
}

async function onSubmit() {
  if (submitting.value) return;
  const validateMessage = validate();
  if (validateMessage) {
    uni.showToast({ title: validateMessage, icon: "none" });
    return;
  }

  submitting.value = true;
  try {
    await submitLiveSign(props.roomId, { ...formData }, {
      roomCode: props.roomCode,
      room_code: props.roomCode,
      tenantId: props.tenantId,
      tenant_id: props.tenantId,
      shareCode: props.shareCode,
      share_code: props.shareCode,
      bindId: props.bindId,
      bind_id: props.bindId,
      liveType: props.liveType,
      live_type: props.liveType,
      termId: props.termId,
      term_id: props.termId,
      liveTermId: props.termId,
      live_term_id: props.termId,
      customerId: props.customerId || props.userId,
      customer_id: props.customerId || props.userId,
      userId: props.userId || props.customerId,
      user_id: props.userId || props.customerId,
    });
    uni.showToast({ title: "签到成功", icon: "success" });
    if (props.successMode !== "toast") {
      hasSigned.value = true;
      emit("signed");
    } else {
      setTimeout(() => {
        emit("signed");
      }, 600);
    }
  } catch (err) {
    const msg = err?.message || err?.msg || "签到失败";
    uni.showToast({ title: msg, icon: "none" });
  } finally {
    submitting.value = false;
  }
}

function onSkip() {
  emit("skip");
}
</script>

<style lang="scss" scoped>
.sign-in-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
}

.signed-done {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0 140rpx;
  overflow: hidden;
}
.signed-backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.95;
  pointer-events: none;
}
.signed-success-image {
  position: relative;
  z-index: 1;
  width: 260rpx;
  margin-bottom: 28rpx;
}
.signed-text {
  position: relative;
  z-index: 1;
  font-size: 32rpx;
  color: #b7b7b7;
  font-weight: 500;
}

.sign-form-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding: 0;
}
.sign-scroll-body {
  height: 60vh;
  box-sizing: border-box;
  padding-bottom: 140rpx;
}

.sign-cover {
  width: 100%;
  padding: 24rpx 32rpx 0;
  box-sizing: border-box;
  overflow: hidden;
}
.sign-cover-img {
  width: 100%;
  display: block;
  border-radius: 24rpx;
}

.sign-welcome {
  padding: 24rpx 32rpx 8rpx;
}
.sign-welcome-text {
  font-size: 28rpx;
  color: #666;
}

.sign-fields {
  padding: 16rpx 32rpx;
  box-sizing: border-box;
}

.sign-field-item {
  margin-bottom: 28rpx;
}
.field-label {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}
.field-label-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
.field-required {
  color: #f56c6c;
  margin-left: 4rpx;
  font-size: 28rpx;
}

.field-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #e5e5e5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
  background: #f9f9f9;
  box-sizing: border-box;
}

.field-textarea {
  width: 100%;
  min-height: 160rpx;
  border: 1rpx solid #e5e5e5;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: #333;
  background: #f9f9f9;
  box-sizing: border-box;
}

.field-radio-group,
.field-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.field-gender-radio-group {
  display: flex;
  align-items: center;
  gap: 40rpx;
  min-height: 80rpx;
  padding: 0 8rpx;
}
.field-gender-radio-group :deep(.wd-radio) {
  margin-right: 0;
}
.field-gender-radio-group :deep(.wd-radio.is-dot .wd-radio__shape) {
  border-color: #dcdcdc;
  color: #dcdcdc;
}
.field-gender-radio-group :deep(.wd-radio.is-dot.is-checked .wd-radio__shape) {
  border-color: #ff6a00;
  color: #ff6a00;
}
.field-gender-radio-group :deep(.wd-radio__label) {
  margin-right: 8rpx;
  font-size: 28rpx;
  color: #333;
}
.field-radio-item,
.field-checkbox-item {
  display: flex;
  align-items: center;
  padding: 12rpx 20rpx;
}
.radio-dot {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 2rpx solid #ccc;
  margin-right: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.radio-dot.active {
  border-color: #ff6a00;
  background: #ff6a00;
}
.radio-label,
.checkbox-label {
  font-size: 26rpx;
  color: #333;
}
.checkbox-box {
  width: 32rpx;
  height: 32rpx;
  border-radius: 6rpx;
  border: 2rpx solid #ccc;
  margin-right: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.checkbox-box.active {
  border-color: #ff6a00;
  background: #ff6a00;
}
.checkbox-tick {
  color: #fff;
  font-size: 22rpx;
}

.field-picker {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #e5e5e5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
  background: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}
.picker-placeholder {
  color: #bbb;
}
.picker-arrow {
  color: #999;
  font-size: 24rpx;
}

.sign-btn-group {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  display: flex;
  padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
  gap: 24rpx;
  background: #fff;
  box-sizing: border-box;
}
.sign-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sign-btn-skip {
  background: #f5f5f5;
  border: 1rpx solid #ddd;
}
.sign-btn-submit {
  background: linear-gradient(135deg, #ff8c2e, #ff6a00);
}
.sign-btn-full {
  flex: 1;
}
.sign-btn-text {
  font-size: 30rpx;
  color: #666;
  font-weight: 500;
}
.sign-btn-text-white {
  color: #fff;
}
</style>
