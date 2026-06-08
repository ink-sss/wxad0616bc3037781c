<template>
  <view :style="wrapStyle">
    <view class="drag optional">
      <view class="diy-Order" :style="orderStyle">
        <view class="list column-5">
          <view v-for="(item, index) in orderItem" :key="item.pop" class="item" @tap="openLink(item.url)">
            <view class="item-image">
              <image lazy-load mode="widthFix" :src="`https://man.lqjy.cc/static/order/${styleType}-${index}.png`" />
              <block v-if="orderCount">
                <text v-if="orderCount[item.pop] != null && Number(orderCount[item.pop]) > 0" class="dot">{{ orderCount[item.pop] }}</text>
              </block>
            </view>
            <view class="item-text text-ellipsis">{{ item.name }}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'DiyOrder',
  props: {
    itemData: { type: Object, default: () => ({}) },
    userInfo: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      orderItem: [
        { name: '待付款', url: '/pages/order/list?status=unpay', pop: 'payment' },
        { name: '待发货', url: '/pages/order/list?status=unsend', pop: 'delivery' },
        { name: '待收货', url: '/pages/order/list?status=unreceive', pop: 'received' },
        { name: '已完成', url: '/pages/order/list?status=finished', pop: 'comment' },
        { name: '退款/售后', url: '/pages/order/refund-list', pop: 'refund' },
      ],
    }
  },
  computed: {
    styleConfig() {
      return (this.itemData && this.itemData.style) || {}
    },
    styleType() {
      return this.styleConfig.type || 1
    },
    orderCount() {
      return this.userInfo && this.userInfo.orderCount
    },
    wrapStyle() {
      const style = this.styleConfig
      return [
        `background:${style.bgcolor || ''}`,
        `padding:${this.rpx(style.paddingTop)} ${this.rpx(style.paddingLeft)} ${this.rpx(style.paddingBottom)} ${this.rpx(style.paddingLeft)}`,
      ].join(';')
    },
    orderStyle() {
      const style = this.styleConfig
      return [
        `background:${style.background || '#fff'}`,
        `border-radius:${this.rpx(style.topRadio)} ${this.rpx(style.topRadio)} ${this.rpx(style.bottomRadio)} ${this.rpx(style.bottomRadio)}`,
      ].join(';')
    },
  },
  methods: {
    rpx(value) {
      const number = Number(value || 0) * 2
      return `${Number.isNaN(number) ? 0 : number}rpx`
    },
    openLink(url) {
      if (typeof this.gotoPage === 'function') this.gotoPage(url)
      else uni.navigateTo({ url })
    },
  },
}
</script>

<style scoped>
.diy-Order .list {
  display: flex;
}

.diy-Order .list .item {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 0;
}

.diy-Order .list.column-5 .item {
  width: 20%;
}

.diy-Order .list .item-image {
  align-items: center;
  display: flex;
  justify-content: center;
  position: relative;
  width: 60%;
}

.diy-Order .list .item-image image {
  margin: 0 auto;
  width: 80%;
}

.diy-Order .list .item-text {
  padding: 4px 0;
  text-align: center;
  width: 100%;
}

.diy-Order .dot {
  align-items: center;
  background: linear-gradient(180deg, #fc4133, #ff7a04);
  border-radius: 20rpx;
  color: #fff;
  display: flex;
  font-size: 20rpx;
  height: 25rpx;
  justify-content: center;
  min-width: 25rpx;
  padding: 4rpx;
  position: absolute;
  right: -8rpx;
  top: -10rpx;
}

</style>
