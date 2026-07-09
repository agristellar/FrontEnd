<template>
  <!-- Mobile overlay -->
  <div v-if="open" class="fixed inset-0 bg-black/50 z-40 lg:hidden" @click="$emit('close')" />

  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto',
      open ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <div class="flex flex-col h-full pt-16 lg:pt-0">
      <!-- Nav items -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive(item.to)
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          ]"
          @click="$emit('close')"
        >
          <component :is="item.icon" v-if="item.icon" class="h-5 w-5 flex-shrink-0" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineEmits(['close']);
defineProps<{
  items: { to: string; label: string; icon?: any }[];
  open: boolean;
}>();

const route = useRoute();
const isActive = (path: string) => route.path === path || route.path.startsWith(path + '/');
</script>
