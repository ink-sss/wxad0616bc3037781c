<template>
  <RedEnvelopeOpenModal
    :active-modal="activeModal"
    :assets="assets"
    @close="emit('close')"
  />
  <RedEnvelopeWinnerModal
    :active-modal="activeModal"
    :assets="assets"
    @close="emit('close')"
  />
  <RedLuckDetailModal
    :active-modal="activeModal"
    :assets="assets"
    :red-records="redRecords"
    @close="emit('close')"
  />
  <RewardPanelModal
    :active-modal="activeModal"
    :assets="assets"
    @close="emit('close')"
  />
  <RedRecordModal
    :active-modal="activeModal"
    :assets="assets"
    :red-records="redRecords"
    @close="emit('close')"
  />
  <EnvelopePayCodeModal
    :active-modal="activeModal"
    :assets="assets"
    @close="emit('close')"
  />
</template>

<script setup>
import EnvelopePayCodeModal from "./envelope-reward/EnvelopePayCodeModal.vue";
import RedEnvelopeOpenModal from "./envelope-reward/RedEnvelopeOpenModal.vue";
import RedEnvelopeWinnerModal from "./envelope-reward/RedEnvelopeWinnerModal.vue";
import RedLuckDetailModal from "./envelope-reward/RedLuckDetailModal.vue";
import RedRecordModal from "./envelope-reward/RedRecordModal.vue";
import RewardPanelModal from "./envelope-reward/RewardPanelModal.vue";

defineProps({
  activeModal: {
    type: String,
    required: true
  },
  assets: {
    type: Object,
    required: true
  },
  redRecords: {
    type: Array,
    required: true
  },
  rewardRecords: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(["close"]);
</script>

<style lang="scss" scoped>
.envelope-reward-modal {
  position: fixed;
  inset: 0;
  z-index: 99999;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
}

.envelope-mask {
  background: rgba(0, 0, 0, 0.58);
}

.txt-center {
  text-align: center;
}

.common-close-icon {
  width: 64rpx;
  height: 64rpx;
  background-image: url("../static/remote-icons/nyfs-oss-bcvdata-com-public-home-images-default-icon-close-0cb4224d.png");
  background-size: contain;
  background-repeat: no-repeat;
}
</style>
