<template>
  <CommentPrizeRuleModal
    :active-modal="activeModal"
    @close="emit('close')"
  />
</template>

<script setup>
import CommentPrizeRuleModal from "@/components/comment-prize-rule-modal.vue";

defineProps({
  activeModal: {
    type: String,
    required: true
  }
});

const emit = defineEmits(["close"]);
</script>
