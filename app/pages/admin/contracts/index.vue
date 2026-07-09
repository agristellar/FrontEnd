<template>
  <div>
    <h1 class="page-title mb-6">{{ $t('admin.contractReview') }}</h1>

    <div class="flex flex-wrap gap-3 mb-4">
      <BaseSelect
        v-model="filters.status"
        :options="statusOptions"
        :placeholder="$t('common.allStatuses')"
        class="w-44"
        @update:model-value="fetchContracts"
      />
    </div>

    <BaseCard :padding="false">
      <BaseTable :columns="columns" :data="contracts" :loading="loading">
        <template #supplierId.legalName="{ value }">
          <span class="font-medium text-gray-900">{{ value }}</span>
        </template>
        <template #contractValue="{ value }">
          ${{ Number(value).toLocaleString() }}
        </template>
        <template #verificationStatus="{ value }">
          <StatusBadge :status="value" />
        </template>
        <template #createdAt="{ value }">
          {{ new Date(value).toLocaleDateString() }}
        </template>
        <template #actions="{ row }">
          <NuxtLink :to="`/admin/contracts/${row._id}`" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            {{ $t('admin.review') }}
          </NuxtLink>
        </template>
      </BaseTable>
      <BasePagination
        :page="pagination.page"
        :limit="pagination.limit"
        :total="pagination.total"
        :total-pages="pagination.totalPages"
        @change="(p: number) => { pagination.page = p; fetchContracts(); }"
      />
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const loading = ref(true);
const contracts = ref<any[]>([]);
const filters = reactive({ status: '' });
const pagination = reactive({ page: 1, limit: 10, total: 0, totalPages: 0 });

const columns = computed(() => [
  { key: 'supplierId.legalName', label: t('admin.supplier') },
  { key: 'product', label: t('admin.products') },
  { key: 'buyerName', label: t('common.buyer') },
  { key: 'contractValue', label: t('common.amount') },
  { key: 'verificationStatus', label: t('common.status') },
  { key: 'createdAt', label: t('common.date') },
  { key: 'actions', label: '' },
]);

const statusOptions = computed(() => [
  { value: '', label: t('common.allStatuses') },
  { value: 'Pending', label: 'Pending' },
  { value: 'Verified', label: 'Verified' },
  { value: 'Rejected', label: 'Rejected' },
]);

const fetchContracts = async () => {
  loading.value = true;
  try {
    const params: any = { page: pagination.page, limit: pagination.limit };
    if (filters.status) params.status = filters.status;
    const res = await api.get('/admin/contracts', params);
    if (res.success) {
      contracts.value = res.data;
      if (res.meta) Object.assign(pagination, res.meta);
    }
  } catch { /* ignore */ }
  loading.value = false;
};

onMounted(fetchContracts);
</script>
