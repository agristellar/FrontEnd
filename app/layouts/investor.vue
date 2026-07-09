<template>
  <div class="min-h-screen bg-gray-50">
    <AppNotifications />
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <div class="flex">
      <AppSidebar :items="navItems" :open="sidebarOpen" @close="sidebarOpen = false" />
      <main class="flex-1 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const sidebarOpen = ref(false);

const navItems = computed(() => [
  { to: '/investor/dashboard', label: t('common.dashboard') },
  { to: '/investor/campaigns', label: t('investor.campaigns') },
  { to: '/investor/portfolio', label: t('investor.portfolio') },
  { to: '/investor/harvest-notes', label: t('investor.harvestNotes') },
  { to: '/investor/payouts', label: t('investor.payouts') },
]);
</script>
