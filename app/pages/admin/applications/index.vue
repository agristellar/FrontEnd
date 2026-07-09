<template>
  <div>
    <h1 class="page-title mb-6">{{ $t('admin.applicationReview') }}</h1>

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
        <template #supplierId.fullName="{ value }">
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
          <NuxtLink :to="`/admin/applications/${row._id}`" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            {{ $t('admin.review') }}
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
definePageMeta({ layout: 'admin', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const loading = ref(true);
const applications = ref<any[]>([]);
const filters = reactive({ status: '' });
const pagination = reactive({ page: 1, limit: 10, total: 0, totalPages: 0 });

const columns = computed(() => [
  { key: 'supplierId.fullName', label: t('admin.supplier') },
  { key: 'contractId.product', label: t('admin.products') },
  { key: 'requestedAmount', label: t('common.amount') },
  { key: 'tenorDays', label: 'Tenor' },
  { key: 'riskScore', label: 'Risk' },
  { key: 'status', label: t('common.status') },
  { key: 'createdAt', label: t('common.date') },
  { key: 'actions', label: '' },
]);

const statusOptions = computed(() => [
  { value: '', label: t('common.allStatuses') },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'UnderReview', label: 'Under Review' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'NeedMoreInfo', label: 'Need More Info' },
]);

const fetchApps = async () => {
  loading.value = true;
  try {
    const params: any = { page: pagination.page, limit: pagination.limit };
    if (filters.status) params.status = filters.status;
    const res = await api.get('/admin/applications', params);
    if (res.success) {
      applications.value = res.data;
      const meta = res.pagination || res.meta; if (meta) Object.assign(pagination, meta);
    }
  } catch { /* ignore */ }
  loading.value = false;
};

onMounted(fetchApps);
</script>
