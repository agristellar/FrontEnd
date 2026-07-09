<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="page-title">{{ $t('supplier.applications') }}</h1>
      <NuxtLink to="/supplier/applications/create" class="btn-primary">
        {{ $t('supplier.newApplication') }}
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-4">
      <BaseSelect
        v-model="filters.status"
        :options="statusOptions"
        :placeholder="$t('common.allStatuses')"
        class="w-44"
        @update:model-value="fetchApps"
      />
    </div>

    <BaseCard :padding="false">
      <BaseTable :columns="columns" :data="applications" :loading="loading">
        <template #contractId.product="{ value }">
          <span class="font-medium text-gray-900">{{ value }}</span>
        </template>
        <template #requestedAmount="{ value }">
          ${{ Number(value).toLocaleString() }}
        </template>
        <template #status="{ value }">
          <StatusBadge :status="value" />
        </template>
        <template #riskScore="{ value }">
          <RiskBadge v-if="value" :grade="value" />
          <span v-else class="text-gray-400">-</span>
        </template>
        <template #createdAt="{ value }">
          {{ new Date(value).toLocaleDateString() }}
        </template>
        <template #actions="{ row }">
          <NuxtLink :to="`/supplier/applications/${row._id}`" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            {{ $t('common.view') }}
          </NuxtLink>
        </template>
      </BaseTable>
      <BasePagination
        :page="pagination.page"
        :limit="pagination.limit"
        :total="pagination.total"
        :total-pages="pagination.totalPages"
        @change="(p: number) => { pagination.page = p; fetchApps(); }"
      />
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'supplier', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const loading = ref(true);
const applications = ref<any[]>([]);
const filters = reactive({ status: '' });
const pagination = reactive({ page: 1, limit: 10, total: 0, totalPages: 0 });

const columns = computed(() => [
  { key: 'contractId.product', label: t('supplier.product') },
  { key: 'requestedAmount', label: t('common.amount') },
  { key: 'tenorDays', label: t('supplier.tenor') },
  { key: 'status', label: t('common.status') },
  { key: 'riskScore', label: t('supplier.risk') },
  { key: 'createdAt', label: t('supplier.created') },
  { key: 'actions', label: '' },
]);

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'UnderReview', label: 'Under Review' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
];

const fetchApps = async () => {
  loading.value = true;
  try {
    const params: any = { page: pagination.page, limit: pagination.limit };
    if (filters.status) params.status = filters.status;
    const res = await api.get('/applications', params);
    if (res.success) {
      applications.value = res.data;
      const meta = res.pagination || res.meta; if (meta) Object.assign(pagination, meta);
    }
  } catch { /* ignore */ }
  loading.value = false;
};

onMounted(fetchApps);
</script>
