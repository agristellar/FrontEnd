<template>
  <component :is="iconComponent" v-if="iconComponent" :size="size" :stroke="stroke" />
  <div v-else class="inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-400" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg :width="size * 0.6" :height="size * 0.6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /></svg>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';

const props = withDefaults(defineProps<{
  name: string;
  size?: number;
  stroke?: number;
}>(), {
  size: 24,
  stroke: 1.5,
});

const iconComponent = computed(() => {
  if (!props.name) return null;
  return defineAsyncComponent(() =>
    import('@tabler/icons-vue').then((mod: any) => mod[props.name] || mod.IconQuestionMark)
  );
});
</script>
