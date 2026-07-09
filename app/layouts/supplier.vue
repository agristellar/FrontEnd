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
  { to: '/supplier/dashboard', label: t('common.dashboard') },
  { to: '/supplier/kyb', label: t('supplier.kybVerification') },
  { to: '/supplier/contracts', label: t('supplier.contracts') },
  { to: '/supplier/applications', label: t('supplier.applications') },
  { to: '/supplier/milestones', label: t('supplier.milestones') },
  { to: '/supplier/disbursements', label: t('supplier.disbursements') },
]);
</script>
