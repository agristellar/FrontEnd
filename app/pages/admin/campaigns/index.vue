<template>
  <div>
    <h1 class="page-title mb-6">{{ $t('admin.campaignManagement') }}</h1>

    <div class="flex flex-wrap gap-3 mb-4">
      <BaseSelect v-model="filters.status" :options="statusOptions" :placeholder="$t('common.allStatuses')" class="w-48" @update:model-value="fetchCampaigns" />
    </div>

    <BaseCard :padding="false">
      <BaseTable :columns="columns" :data="campaigns" :loading="loading">
        <template #campaignCode="{ value }">
          <span class="font-medium text-gray-900">{{ value }}</span>
        </template>
        <template #fundingTarget="{ value }">
          ${{ Number(value).toLocaleString() }}
        </template>
        <template #fundedAmount="{ row }">
          <div>
            <span class="text-sm">${{ Number(row.fundedAmount).toLocaleString() }}</span>
            <span class="text-xs text-gray-400 ml-1">({{ Math.round((row.fundedAmount / row.fundingTarget) * 100) }}%)</span>
          </div>
        </template>
        <template #riskScore="{ value }">
          <RiskBadge :grade="value" />
        </template>
        <template #status="{ value }">
          <StatusBadge :status="value" />
        </template>
        <template #actions="{ row }">
          <NuxtLink :to="`/admin/campaigns/${row._id}`" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            {{ $t('admin.manage') }}
          </NuxtLink>
        </template>
      </BaseTable>
      <BasePagination :page="pagination.page" :limit="pagination.limit" :total="pagination.total" :total-pages="pagination.totalPages" @change="(p: number) => { pagination.page = p; fetchCampaigns(); }" />
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const loading = ref(true);
const campaigns = ref<any[]>([]);
const filters = reactive({ status: '' });
const pagination = reactive({ page: 1, limit: 10, total: 0, totalPages: 0 });

const columns = computed(() => [
  { key: 'campaignCode', label: t('admin.code') },
  { key: 'product', label: t('admin.products') },
  { key: 'fundingTarget', label: t('admin.fundingTarget') },
  { key: 'fundedAmount', label: t('admin.fundedAmount') },
  { key: 'riskScore', label: 'Risk' },
  { key: 'status', label: t('common.status') },
  { key: 'actions', label: '' },
]);

const statusOptions = computed(() => [
  { value: '', label: t('common.allStatuses') },
  { value: 'Draft', label: 'Draft' },
  { value: 'Published', label: 'Published' },
  { value: 'Funding', label: 'Funding' },
  { value: 'FullyFunded', label: 'Fully Funded' },
  { value: 'Active', label: 'Active' },
  { value: 'AwaitingRepayment', label: 'Awaiting Repayment' },
  { value: 'Settled', label: 'Settled' },
  { value: 'Defaulted', label: 'Defaulted' },
  { value: 'OnHold', label: 'On Hold' },
]);

const fetchCampaigns = async () => {
  loading.value = true;
  try {
    const params: any = { page: pagination.page, limit: pagination.limit };
    if (filters.status) params.status = filters.status;
    const res = await api.get('/campaigns', params);
    if (res.success) {
      campaigns.value = res.data;
      const meta = res.pagination || res.meta; if (meta) Object.assign(pagination, meta);
    }
  } catch { /* ignore */ }
  loading.value = false;
};

onMounted(fetchCampaigns);
</script>
