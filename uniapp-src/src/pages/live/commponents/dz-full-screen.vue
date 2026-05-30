<template>
  <view class="dz-full-screen" @tap="$emit('clikeLike')"></view>
</template>

<script>
export default {
  emits: ['clikeLike'],
}
</script>

<style scoped>
.dz-full-screen { position: absolute; inset: 0; }
</style>
