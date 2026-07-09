<template>
  <div :class="['bg-white rounded-xl shadow-sm border border-gray-100', padding ? 'p-6' : '', $attrs.class]">
    <div v-if="title || $slots.header" class="flex items-center justify-between mb-4">
      <h3 v-if="title" class="section-title">{{ title }}</h3>
      <slot name="header" />
    </div>
    <slot />
    <div v-if="$slots.footer" class="mt-4 pt-4 border-t border-gray-100">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string;
  padding?: boolean;
}>(), {
  padding: true,
});
</script>
