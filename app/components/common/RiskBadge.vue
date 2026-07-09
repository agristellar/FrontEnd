<template>
  <span :class="['inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white', bgClass]">
    {{ grade }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{ grade: string }>();

const bgClass = computed(() => {
  const map: Record<string, string> = {
    A: 'bg-risk-A',
    B: 'bg-risk-B',
    C: 'bg-risk-C',
    D: 'bg-risk-D',
  };
  return map[props.grade] || 'bg-gray-500';
});
</script>
