<template>
  <div>
    <h1 class="page-title mb-6">{{ $t('supplier.dashboard') }}</h1>

    <!-- KYB Alert -->
    <div v-if="!isVerified" class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
      <div class="flex items-center gap-3">
        <svg class="h-5 w-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div>
          <p class="text-sm font-medium text-yellow-800">{{ $t('supplier.kybRequired') }}</p>
          <p class="text-sm text-yellow-700">{{ $t('supplier.kybRequiredDesc') }}</p>
        </div>
        <NuxtLink to="/supplier/kyb" class="ml-auto btn-primary text-xs">{{ $t('supplier.completeKyb') }}</NuxtLink>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard :title="$t('supplier.totalApplications')" :value="stats.totalApplications" format="number" />
      <StatCard :title="$t('supplier.approvedAmount')" :value="stats.approvedAmount" format="currency" />
      <StatCard :title="$t('supplier.activeCampaigns')" :value="stats.activeCampaigns" format="number" />
      <StatCard :title="$t('supplier.disbursedAmount')" :value="stats.disbursedAmount" format="currency" />
    </div>

    <!-- Recent Applications -->
    <BaseCard :title="$t('supplier.recentApplications')">
      <template #header>
        <NuxtLink to="/supplier/applications" class="text-sm text-primary-600 hover:text-primary-700 font-medium">{{ $t('common.viewAll') }}</NuxtLink>
      </template>
      <BaseTable :columns="appColumns" :data="recentApps" :loading="loading">
        <template #status="{ value }">
          <StatusBadge :status="value" />
        </template>
        <template #requestedAmount="{ value }">
          ${{ Number(value).toLocaleString() }}
        </template>
        <template #createdAt="{ value }">
          {{ new Date(value).toLocaleDateString() }}
        </template>
      </BaseTable>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'supplier', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const supplierStore = useSupplierStore();
const loading = ref(true);

const stats = ref({
  totalApplications: 0,
  approvedAmount: 0,
  activeCampaigns: 0,
  disbursedAmount: 0,
});

const recentApps = ref<any[]>([]);
const isVerified = computed(() => supplierStore.isVerified);

const appColumns = computed(() => [
  { key: 'contractId.product', label: t('supplier.product') },
  { key: 'requestedAmount', label: t('common.amount') },
  { key: 'status', label: t('common.status') },
  { key: 'createdAt', label: t('common.date') },
]);

onMounted(async () => {
  try {
    const [profileRes, appsRes] = await Promise.all([
      api.get('/suppliers/me'),
      api.get('/applications', { page: 1, limit: 5 }),
    ]);
    if (profileRes.success) supplierStore.setProfile(profileRes.data);
    if (appsRes.success) {
      recentApps.value = appsRes.data;
      stats.value.totalApplications = appsRes.pagination?.total || appsRes.data.length;
    }
  } catch { /* ignore */ }
  loading.value = false;
});
</script>
