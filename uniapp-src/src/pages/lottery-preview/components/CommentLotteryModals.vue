<template>
  <CommentPrizeRuleModal
    :active-modal="activeModal"
    :activity="activity"
    :prizes="prizes"
    :tip-text="tipText"
    @close="emit('close')"
    @send-comment="emit('send-comment')"
  />
  <CommentPrizeConfirmModal
    :active-modal="activeModal"
    @close="emit('close')"
  />
</template>

<script setup>
import CommentPrizeConfirmModal from "./comment-lottery/CommentPrizeConfirmModal.vue";
import CommentPrizeRuleModal from "@/components/comment-prize-rule-modal.vue";

defineProps({
  activeModal: {
    type: String,
    required: true
  },
  winners: {
    type: Array,
    required: true
  },
  activity: {
    type: Object,
    default: () => ({})
  },
  prizes: {
    type: Array,
    default: () => []
  },
  tipText: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["close", "send-comment"]);
</script>
