<template>
  <div>
    <h1 class="page-title mb-6">{{ $t('admin.investorManagement') }}</h1>

    <div class="flex flex-wrap gap-3 mb-4">
      <BaseSelect
        v-model="filters.status"
        :options="statusOptions"
        :placeholder="$t('common.allStatuses')"
        class="w-44"
        @update:model-value="fetchInvestors"
      />
    </div>

    <BaseCard :padding="false">
      <BaseTable :columns="columns" :data="investors" :loading="loading">
        <template #userId.fullName="{ row }">
          <div>
            <p class="font-medium text-gray-900">{{ row.userId?.fullName || '-' }}</p>
            <p class="text-xs text-gray-500">{{ row.userId?.email }}</p>
          </div>
        </template>
        <template #totalInvested="{ value }">
          <span class="font-medium">${{ Number(value || 0).toLocaleString() }}</span>
        </template>
        <template #totalPayout="{ value }">
          <span class="text-green-600">${{ Number(value || 0).toLocaleString() }}</span>
        </template>
        <template #verificationStatus="{ value }">
          <StatusBadge :status="value" />
        </template>
        <template #actions="{ row }">
          <NuxtLink :to="`/admin/investors/${row._id}`" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            {{ $t('admin.review') }}
          </NuxtLink>
        </template>
      </BaseTable>
      <BasePagination
        :page="pagination.page"
        :limit="pagination.limit"
        :total="pagination.total"
        :total-pages="pagination.totalPages"
        @change="(p: number) => { pagination.page = p; fetchInvestors(); }"
      />
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const loading = ref(true);
const investors = ref<any[]>([]);
const filters = reactive({ status: '' });
const pagination = reactive({ page: 1, limit: 10, total: 0, totalPages: 0 });

const columns = computed(() => [
  { key: 'userId.fullName', label: t('common.name') },
  { key: 'totalInvested', label: t('admin.totalInvested') },
  { key: 'totalPayout', label: t('admin.totalPayout') },
  { key: 'verificationStatus', label: t('common.status') },
  { key: 'actions', label: '' },
]);

const statusOptions = computed(() => [
  { value: '', label: t('common.allStatuses') },
  { value: 'Pending', label: 'Pending' },
  { value: 'Verified', label: 'Verified' },
  { value: 'Rejected', label: 'Rejected' },
]);

const fetchInvestors = async () => {
  loading.value = true;
  try {
    const params: any = { page: pagination.page, limit: pagination.limit };
    if (filters.status) params.status = filters.status;
    const res = await api.get('/admin/investors', params);
    if (res.success) {
      investors.value = res.data;
      const meta = res.pagination || res.meta; if (meta) Object.assign(pagination, meta);
    }
  } catch { /* ignore */ }
  loading.value = false;
};

onMounted(fetchInvestors);
</script>
