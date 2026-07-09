<template>
  <div>
    <h1 class="page-title mb-6">{{ $t('admin.dashboard') }}</h1>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard :title="$t('admin.totalSuppliers')" :value="stats.totalSuppliers" format="number" />
      <StatCard :title="$t('admin.activeCampaigns')" :value="stats.activeCampaigns" format="number" />
      <StatCard :title="$t('admin.totalFunded')" :value="stats.totalFunded" format="currency" />
      <StatCard :title="$t('admin.pendingReviews')" :value="stats.pendingReviews" format="number" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Pending KYB -->
      <BaseCard :title="$t('admin.pendingKyb')">
        <template #header>
          <NuxtLink to="/admin/suppliers" class="text-sm text-primary-600 font-medium">{{ $t('common.viewAll') }}</NuxtLink>
        </template>
        <div v-if="!pendingSuppliers.length" class="text-sm text-gray-500 py-4 text-center">{{ $t('admin.noPendingKyb') }}</div>
        <ul v-else class="space-y-3">
          <li v-for="s in pendingSuppliers" :key="s._id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">{{ s.legalName || s.userId?.fullName }}</p>
              <p class="text-xs text-gray-500">{{ s.productTypes?.join(', ') }}</p>
            </div>
            <NuxtLink :to="`/admin/suppliers/${s._id}`" class="text-sm text-primary-600 font-medium">{{ $t('admin.review') }}</NuxtLink>
          </li>
        </ul>
      </BaseCard>

      <!-- Pending Applications -->
      <BaseCard :title="$t('admin.appsUnderReview')">
        <template #header>
          <NuxtLink to="/admin/applications" class="text-sm text-primary-600 font-medium">{{ $t('common.viewAll') }}</NuxtLink>
        </template>
        <div v-if="!pendingApps.length" class="text-sm text-gray-500 py-4 text-center">{{ $t('admin.noPendingApps') }}</div>
        <ul v-else class="space-y-3">
          <li v-for="a in pendingApps" :key="a._id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-gray-900">{{ a.contractId?.product }}</p>
              <p class="text-xs text-gray-500">${{ Number(a.requestedAmount).toLocaleString() }} - {{ a.supplierId?.fullName }}</p>
            </div>
            <NuxtLink :to="`/admin/applications/${a._id}`" class="text-sm text-primary-600 font-medium">{{ $t('admin.review') }}</NuxtLink>
          </li>
        </ul>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const loading = ref(true);

const stats = ref({
  totalSuppliers: 0,
  activeCampaigns: 0,
  totalFunded: 0,
  pendingReviews: 0,
});

function mapDashboardData(data: any) {
  return {
    totalSuppliers: data.users?.totalSuppliers ?? 0,
    activeCampaigns: data.campaigns?.open ?? 0,
    totalFunded: data.financials?.totalFunded ?? 0,
    pendingReviews: (data.campaigns?.open ?? 0) + (data.users?.totalSuppliers ?? 0) - (data.users?.verifiedSuppliers ?? 0),
  };
}

const pendingSuppliers = ref<any[]>([]);
const pendingApps = ref<any[]>([]);

onMounted(async () => {
  try {
    const [dashRes, suppRes, appRes] = await Promise.all([
      api.get('/reports/dashboard'),
      api.get('/suppliers', { status: 'Pending', limit: 5 }),
      api.get('/admin/applications', { status: 'Submitted', limit: 5 }),
    ]);
    if (dashRes.success) stats.value = mapDashboardData(dashRes.data);
    if (suppRes.success) pendingSuppliers.value = suppRes.data;
    if (appRes.success) pendingApps.value = appRes.data;
  } catch { /* ignore */ }
  loading.value = false;
});
</script>
