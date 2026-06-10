<template>
  <view class="address-list-page">
    <address-list-panel
      :list="addressList"
      :selected-id="selectedAddressId"
      button-text="新增地址"
      :page-mode="true"
      @select="onSelect"
      @save="onAdd"
      @edit="onEdit"
      @add="onAdd"
      @delete="onDelete"
      @import-wx="onImportWx"
    />
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import AddressListPanel from "@/components/address-list-panel.vue";
import { getAddressList, deleteAddress } from "@/api/address";
import { importWxAddress } from "@/services/wechat-address";

const addressList = ref([]);
const selectedAddressId = ref(null);
const selectMode = ref(false);

async function loadAddresses() {
  try {
    const list = await getAddressList();
    const safeList = Array.isArray(list) ? list : [];
    addressList.value = safeList.map((item) => ({
      id: item.id,
      name: item.receiverName,
      mobile: item.receiverPhone,
      tag: item.isDefault === 1 ? "默认" : "",
      fullAddress:
        item.fullAddress ||
        `${item.province || ""}${item.city || ""}${item.district || ""}${item.address || ""}`,
      receiverName: item.receiverName,
      receiverPhone: item.receiverPhone,
      province: item.province,
      city: item.city,
      district: item.district,
      address: item.address,
      isDefault: item.isDefault,
      _raw: item,
    }));

    const defaultAddr = safeList.find((a) => a.isDefault === 1);
    if (defaultAddr && !selectedAddressId.value) {
      selectedAddressId.value = defaultAddr.id;
    }
    if (!safeList.length) {
      selectedAddressId.value = null;
    }
  } catch (err) {
    console.error("[Address] loadAddresses fail:", err);
  }
}

onLoad((options) => {
  if (options?.select === "1") {
    selectMode.value = true;
  }
  if (options?.selectedId) {
    selectedAddressId.value = Number(options.selectedId);
  }
  // 从授权域名wxPick页回来
  if (options?.wxAddrDone === "1") {
    uni.showToast({ title: "地址导入成功", icon: "none" });
  }
  loadAddresses();
});

onShow(() => {
  loadAddresses();
});

function onSelect(id) {
  selectedAddressId.value = id;
  if (selectMode.value) {
    const selected = addressList.value.find((item) => item.id === id);
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage) {
      uni.$emit("address-selected", {
        id,
        addressId: id,
        address: selected?._raw || selected || null,
      });
    } else {
      uni.showToast({ title: "无法返回订单详情", icon: "none" });
      return;
    }
    uni.navigateBack({
      fail(err) {
        console.error("[Address] navigateBack after select fail:", err);
        uni.showToast({ title: "返回订单详情失败", icon: "none" });
      },
    });
  }
}

function onAdd() {
  uni.navigateTo({ url: "/pagesPlus/main/address/edit" });
}

function onEdit(item) {
  const id = item?.id || item;
  uni.navigateTo({ url: "/pagesPlus/main/address/edit?id=" + id });
}

async function onImportWx() {
  const ok = await importWxAddress();
  if (ok) await loadAddresses();
}

async function onDelete(item) {
  try {
    await deleteAddress(item.id);
    uni.showToast({ title: "删除成功", icon: "success" });
    if (selectedAddressId.value === item.id) {
      selectedAddressId.value = null;
    }
    await loadAddresses();
  } catch (err) {
    console.error("[Address] deleteAddress fail:", err);
    uni.showToast({ title: "删除失败", icon: "none" });
  }
}
</script>

<style lang="scss" scoped>
.address-list-page {
  min-height: 100vh;
  background: #f7f7f7;
}
</style>
