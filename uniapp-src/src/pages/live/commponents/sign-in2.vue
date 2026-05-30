<template>
  <sign-in v-bind="$props" @signinSuccess="$emit('signinSuccess', $event)" @signinFail="$emit('signinFail', $event)" />
</template>
<script>
import SignIn from './sign-in.vue'
export default {
  components: { SignIn },
  props: {
    liveId: { type: [Number, String], default: '' },
    taskId: { type: [Number, String], default: '' },
  },
  emits: ['signinSuccess', 'signinFail'],
}
</script>
