<template>
  <address-add ref="inner" @close="(...args) => $emit('close', ...args)" />
</template>

<script>
import AddressAdd from './add.vue'

export default {
  components: { AddressAdd },
  emits: ['close'],
  methods: {
    open(data = {}) {
      this.$refs.inner.form = { ...this.$refs.inner.form, ...data }
      this.$refs.inner.open()
    },
    closePopup() {
      this.$refs.inner.closePopup()
    },
  },
}
</script>
