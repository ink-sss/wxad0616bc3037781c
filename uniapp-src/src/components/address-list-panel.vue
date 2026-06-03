<template>
  <view :class="['address-panel', pageMode ? 'address-panel-page' : '']">
    <!-- 标题栏（弹窗模式） -->
    <view v-if="!pageMode && title" class="address-panel-header">
      <text class="address-panel-title">{{ title }}</text>
    </view>

    <!-- 空状态 -->
    <template v-if="list.length === 0">
      <view class="address-empty-body">
        <image
          class="address-empty-icon"
          src="./static/icons/empty-address.png"
          mode="aspectFit"
        />
        <text class="address-empty-title">暂无收货地址</text>
        <text class="address-empty-desc"
          >您还没有添加过任何收货地址，\n立即添加一个以便下单使用吧。</text
        >
      </view>
      <view class="address-empty-footer">
        <view class="address-empty-btn-row">
          <view class="address-empty-btn address-btn-add" @click="emit('add')">
            <text class="address-empty-btn-text">新增地址</text>
          </view>
          <view
            class="address-empty-btn address-btn-wx"
            @click="emit('import-wx')"
          >
            <text class="address-empty-btn-text address-btn-wx-text"
              >导入微信</text
            >
          </view>
        </view>
      </view>
    </template>

    <!-- 有数据 -->
    <template v-else-if="list.length > 0">
      <scroll-view class="address-scroll" scroll-y>
        <view
          v-for="item in list"
          :key="item.id"
          :class="['address-item', selectedId === item.id ? 'address-item-selected' : '']"
          @click="emit('select', item.id)"
        >
          <view class="address-item-top">
            <view class="address-user-row">
              <text class="address-name">{{ item.name }}</text>
              <text class="address-mobile">{{ item.mobile }}</text>
              <text v-if="item.tag" class="address-tag">{{ item.tag }}</text>
            </view>
            <view class="address-actions">
              <text class="address-edit" @click.stop="emit('edit', item)"
                >✎</text
              >
              <text class="address-delete" @click.stop="onDelete(item)"
                >删除</text
              >
            </view>
          </view>
          <text class="address-full">{{ item.fullAddress }}</text>
          <!-- <view class="address-default-row">
            <view
              :class="[
                'address-radio',
                selectedId === item.id ? 'address-radio-active' : '',
              ]"
            >
              <image
                v-if="selectedId === item.id"
                class="address-radio-icon"
                src="./static/icons/check.svg"
                mode="aspectFit"
              />
            </view>
            <text
              v-if="showDefaultRow"
              :class="[
                'address-default-text',
                selectedId === item.id ? 'address-default-text-active' : '',
              ]"
            >
              {{ selectedId === item.id ? "已设默认" : "默认" }}
            </text>
          </view> -->
        </view>
      </scroll-view>

      <view
        v-if="showFooter"
        :class="['address-footer', pageMode ? 'address-footer-page' : '']"
      >
        <view class="address-footer-btn-row">
          <view
            :class="[
              'address-save-btn address-btn-add',
              buttonDisabled ? 'address-save-btn-disabled' : '',
            ]"
            @click="onSave"
            >{{ buttonText }}</view
          >
          <view
            class="address-save-btn address-btn-wx"
            @click="emit('import-wx')"
          >
            <text class="address-btn-wx-text">导入微信</text>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
function onSave() {
  if (props.buttonDisabled) {
    return;
  }
  emit("save");
}

const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  selectedId: {
    type: [Number, null],
    default: null,
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  buttonText: {
    type: String,
    default: "保存",
  },
  pageMode: {
    type: Boolean,
    default: false,
  },
  showDefaultRow: {
    type: Boolean,
    default: true,
  },
  buttonDisabled: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
});

const emit = defineEmits([
  "select",
  "save",
  "edit",
  "add",
  "delete",
  "import-wx",
]);

function onDelete(item) {
  uni.showModal({
    title: "提示",
    content: "确定删除该收货地址吗？",
    success(res) {
      if (res.confirm) {
        emit("delete", item);
      }
    },
  });
}
</script>

<style lang="scss" scoped>
.address-panel {
  width: 750rpx;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f7f7f7;
}

.address-panel-header {
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  flex-shrink: 0;
}

.address-panel-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
}

.address-panel-page {
  width: auto;
  height: 100vh;
  // padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.address-scroll {
  flex: 1;
  height: 0;
}

.address-item {
  background: #fff;
  padding: 28rpx 24rpx 24rpx;
  border-bottom: 16rpx solid #f5f5f5;
}

.address-item-selected {
  background: #fef5f3;
}

.address-item-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.address-user-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16rpx;
  min-width: 0;
}

.address-name,
.address-mobile {
  font-size: 32rpx;
  color: #444;
}

.address-tag {
  height: 36rpx;
  padding: 0 14rpx;
  border-radius: 8rpx;
  background: #ffcfb4;
  color: #ff7a1a;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.address-actions {
  display: flex;
  align-items: center;
  gap: 24rpx;
  flex-shrink: 0;
}

.address-edit {
  font-size: 34rpx;
  color: #b3b3b3;
  line-height: 1;
}

.address-delete {
  font-size: 26rpx;
  color: #ff4d4f;
  line-height: 1;
}

.address-full {
  display: block;
  margin-top: 16rpx;
  font-size: 32rpx;
  color: #666;
  line-height: 1.5;
}

.address-default-row {
  margin-top: 22rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.address-radio {
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  border: 2rpx solid #d5d5d5;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.address-radio-active {
  border-color: #ff7a1a;
  background: #ff7a1a;
}

.address-radio-icon {
  width: 18rpx;
  height: 18rpx;
}

.address-default-text {
  font-size: 30rpx;
  color: #bdbdbd;
}

.address-default-text-active {
  color: #ff7a1a;
}

.address-footer {
  padding: 20rpx 16rpx;
  background: #f7f7f7;
}

.address-footer-page {
  position: sticky;
  bottom: 0;
}

.address-save-btn {
  flex: 1;
  height: 92rpx;
  border-radius: 46rpx;
  color: #fff;
  font-size: 34rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.address-save-btn-disabled {
  opacity: 0.45;
}

.address-empty-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 72rpx 40rpx 40rpx;
  box-sizing: border-box;
  min-height: 0;
}

.address-empty-icon {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 36rpx;
}

.address-empty-title {
  font-size: 34rpx;
  color: #999;
  text-align: center;
  line-height: 1.6;
}

.address-empty-desc {
  font-size: 26rpx;
  color: #999;
  text-align: center;
  line-height: 1.6;
}

.address-empty-footer {
  padding: 20rpx 32rpx;
  flex-shrink: 0;
  box-sizing: border-box;
}

.address-panel-page .address-empty-footer {
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.address-empty-btn-row,
.address-footer-btn-row {
  display: flex;
  gap: 24rpx;
}

.address-empty-btn {
  flex: 1;
  height: 92rpx;
  border-radius: 46rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.address-btn-add {
  background: linear-gradient(90deg, #ff8a21 0%, #ff5a2e 100%);
}

.address-btn-wx {
  background: #07c160;
}

.address-empty-btn-text {
  color: #fff;
  font-size: 34rpx;
  font-weight: 500;
}

.address-btn-wx-text {
  color: #fff;
  font-size: 34rpx;
  font-weight: 500;
}
</style>
