<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[variantClasses, sizeClasses, 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed', $attrs.class]"
    @click="$emit('click', $event)"
  >
    <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <slot />
  </button>
</template>

<script setup lang="ts">
defineEmits(['click']);

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
});

const variantClasses = computed(() => {
  const map: Record<string, string> = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm border border-transparent',
    secondary: 'bg-primary-50 text-primary-700 hover:bg-primary-100 focus:ring-primary-500 border border-primary-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm border border-transparent',
    outline: 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500 shadow-sm border border-gray-300',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-primary-500 border border-transparent',
  };
  return map[props.variant];
});

const sizeClasses = computed(() => {
  const map: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return map[props.size];
});
</script>
