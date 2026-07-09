<template>
  <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3">
    <div class="text-sm text-gray-700">
      {{ $t('common.showing') }} <span class="font-medium">{{ (page - 1) * limit + 1 }}</span> {{ $t('common.to') }}
      <span class="font-medium">{{ Math.min(page * limit, total) }}</span> {{ $t('common.of') }}
      <span class="font-medium">{{ total }}</span> {{ $t('common.results') }}
    </div>
    <nav class="flex gap-1">
      <button
        :disabled="page <= 1"
        class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        @click="$emit('change', page - 1)"
      >
        {{ $t('common.previous') }}
      </button>
      <button
        v-for="p in visiblePages"
        :key="p"
        :class="['px-3 py-1.5 text-sm rounded-lg border', p === page ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 hover:bg-gray-50']"
        @click="$emit('change', p)"
      >
        {{ p }}
      </button>
      <button
        :disabled="page >= totalPages"
        class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        @click="$emit('change', page + 1)"
      >
        {{ $t('common.next') }}
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
defineEmits(['change']);
const props = defineProps<{
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}>();

const visiblePages = computed(() => {
  const pages: number[] = [];
  const start = Math.max(1, props.page - 2);
  const end = Math.min(props.totalPages, props.page + 2);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});
</script>
