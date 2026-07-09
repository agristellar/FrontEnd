<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-black/50 transition-opacity" @click="closeOnBackdrop && $emit('update:modelValue', false)" />

          <!-- Panel -->
          <div :class="['relative bg-white rounded-xl shadow-xl transform transition-all w-full', sizeClass]">
            <!-- Header -->
            <div v-if="title" class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
              <button @click="$emit('update:modelValue', false)" class="text-gray-400 hover:text-gray-600">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="px-6 py-4">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineEmits(['update:modelValue']);
const props = withDefaults(defineProps<{
  modelValue: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
}>(), {
  size: 'md',
  closeOnBackdrop: true,
});

const sizeClass = computed(() => {
  const map: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };
  return map[props.size];
});
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
