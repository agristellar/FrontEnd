<template>
  <div class="stat-card">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-500">{{ title }}</p>
        <p class="mt-1 text-2xl font-bold text-gray-900">{{ formattedValue }}</p>
        <p v-if="subtitle" class="mt-1 text-xs text-gray-500">{{ subtitle }}</p>
      </div>
      <div v-if="icon" :class="['p-3 rounded-xl', iconBg]">
        <component :is="icon" class="h-6 w-6" :class="iconColor" />
      </div>
    </div>
    <div v-if="change !== undefined" class="mt-3 flex items-center text-sm">
      <span :class="change >= 0 ? 'text-green-600' : 'text-red-600'">
        {{ change >= 0 ? '+' : '' }}{{ change }}%
      </span>
      <span class="ml-1 text-gray-500">{{ $t('common.vsLastPeriod') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: any;
  iconBg?: string;
  iconColor?: string;
  change?: number;
  format?: 'number' | 'currency' | 'percent';
}>();

const { locale } = useI18n();

const localeCode = computed(() => locale.value === 'vi' ? 'vi-VN' : 'en-US');

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value;
  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat(localeCode.value, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(props.value);
    case 'percent':
      return `${props.value}%`;
    case 'number':
    default:
      return new Intl.NumberFormat(localeCode.value).format(props.value);
  }
});
</script>
