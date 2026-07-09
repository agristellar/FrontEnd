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
  { to: '/admin/dashboard', label: t('common.dashboard') },
  { to: '/admin/suppliers', label: t('admin.suppliers') },
  { to: '/admin/investors', label: t('admin.investors') },
  { to: '/admin/contracts', label: t('admin.contracts') },
  { to: '/admin/applications', label: t('admin.applications') },
  { to: '/admin/campaigns', label: t('admin.campaigns') },
  { to: '/admin/repayments', label: t('admin.repayments') },
  { to: '/admin/disputes', label: t('admin.disputes') },
  { to: '/admin/audit-logs', label: t('admin.auditLogs') },
]);
</script>
