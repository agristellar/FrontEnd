<template>
  <div class="fixed top-4 right-4 z-[100] space-y-2 w-80">
    <TransitionGroup name="notif">
      <div
        v-for="n in notifications"
        :key="n.id"
        :class="['rounded-lg p-4 shadow-lg border', typeClasses[n.type]]"
      >
        <div class="flex items-start gap-3">
          <div class="flex-1">
            <p class="text-sm font-semibold">{{ n.title }}</p>
            <p v-if="n.message" class="mt-1 text-sm opacity-80">{{ n.message }}</p>
          </div>
          <button @click="remove(n.id)" class="opacity-60 hover:opacity-100">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { notifications, remove } = useNotification();

const typeClasses: Record<string, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};
</script>

<style scoped>
.notif-enter-active { transition: all 0.3s ease-out; }
.notif-leave-active { transition: all 0.2s ease-in; }
.notif-enter-from { opacity: 0; transform: translateX(100%); }
.notif-leave-to { opacity: 0; transform: translateX(100%); }
</style>
