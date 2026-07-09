<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            :class="col.class"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-if="loading">
          <td :colspan="columns.length" class="px-4 py-8 text-center text-gray-500">
            <svg class="animate-spin h-6 w-6 mx-auto text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </td>
        </tr>
        <tr v-else-if="!data.length">
          <td :colspan="columns.length" class="px-4 py-8 text-center text-gray-500">
            {{ emptyText }}
          </td>
        </tr>
        <tr v-else v-for="(row, idx) in data" :key="idx" class="hover:bg-gray-50 transition-colors">
          <td v-for="col in columns" :key="col.key" class="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
            <slot :name="col.key" :row="row" :value="getNestedValue(row, col.key)">
              {{ getNestedValue(row, col.key) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  columns: { key: string; label: string; class?: string }[];
  data: any[];
  loading?: boolean;
  emptyText?: string;
}>();

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? '-';
};
</script>
