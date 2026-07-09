<template>
  <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', colorClasses]">
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple' | 'orange';
}>(), {
  color: 'gray',
});

const colorClasses = computed(() => {
  const map: Record<string, string> = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
  };
  return map[props.color];
});
</script>
