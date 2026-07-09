<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="page-title">{{ $t('supplier.contracts') }}</h1>
      <NuxtLink to="/supplier/contracts/create" class="btn-primary">
        + {{ $t('supplier.newContract') }}
      </NuxtLink>
    </div>

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
        <template #product="{ value }">
          <span class="font-medium text-gray-900">{{ value }}</span>
        </template>
        <template #contractValue="{ value }">
          ${{ Number(value).toLocaleString() }}
        </template>
        <template #verificationStatus="{ value }">
          <StatusBadge :status="value" />
        </template>
        <template #deliveryDate="{ value }">
          {{ value ? new Date(value).toLocaleDateString() : '-' }}
        </template>
        <template #createdAt="{ value }">
          {{ new Date(value).toLocaleDateString() }}
        </template>
        <template #actions="{ row }">
          <NuxtLink :to="`/supplier/contracts/${row._id}`" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            {{ $t('common.view') }}
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
definePageMeta({ layout: 'supplier', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const loading = ref(true);
const contracts = ref<any[]>([]);
const filters = reactive({ status: '' });
const pagination = reactive({ page: 1, limit: 10, total: 0, totalPages: 0 });

const columns = computed(() => [
  { key: 'product', label: t('supplier.product') },
  { key: 'buyerName', label: t('supplier.buyerName') },
  { key: 'contractValue', label: t('supplier.contractValue') },
  { key: 'verificationStatus', label: t('common.status') },
  { key: 'deliveryDate', label: t('supplier.deliveryDate') },
  { key: 'createdAt', label: t('supplier.created') },
  { key: 'actions', label: '' },
]);

const statusOptions = [
  { value: '', label: t('common.allStatuses') },
  { value: 'Pending', label: t('supplier.pending') },
  { value: 'Verified', label: t('statuses.Verified') },
  { value: 'Rejected', label: t('statuses.Rejected') },
];

const fetchContracts = async () => {
  loading.value = true;
  try {
    const params: any = { page: pagination.page, limit: pagination.limit };
    if (filters.status) params.status = filters.status;
    const res = await api.get('/contracts', params);
    if (res.success) {
      contracts.value = res.data;
      if (res.meta) Object.assign(pagination, res.meta);
    }
  } catch { /* ignore */ }
  loading.value = false;
};

onMounted(fetchContracts);
</script>
