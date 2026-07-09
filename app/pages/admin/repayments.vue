<template>
  <div>
    <h1 class="page-title mb-6">{{ $t('admin.repaymentManagement') }}</h1>

    <div class="flex flex-wrap gap-3 mb-4">
      <BaseSelect v-model="filters.status" :options="statusOptions" :placeholder="$t('common.allStatuses')" class="w-44" @update:model-value="fetchRepayments" />
    </div>

    <BaseCard :padding="false">
      <BaseTable :columns="columns" :data="repayments" :loading="loading" :empty-text="$t('admin.noRepayments')">
        <template #campaignId.campaignCode="{ value }">
          <span class="font-medium text-gray-900">{{ value }}</span>
        </template>
        <template #amount="{ value }">
          ${{ Number(value).toLocaleString() }}
        </template>
        <template #status="{ value }">
          <StatusBadge :status="value" />
        </template>
        <template #createdAt="{ value }">
          {{ new Date(value).toLocaleDateString() }}
        </template>
        <template #actions="{ row }">
          <div v-if="row.status === 'Pending'" class="flex gap-2">
            <BaseButton size="sm" @click="verifyRepayment(row._id)" :loading="processing">{{ $t('admin.verify') }}</BaseButton>
            <BaseButton size="sm" variant="danger" @click="rejectRepayment(row._id)" :loading="processing">{{ $t('common.reject') }}</BaseButton>
          </div>
          <BaseBadge v-else-if="row.complianceHold" color="orange">{{ $t('admin.complianceHold') }}</BaseBadge>
        </template>
      </BaseTable>
      <BasePagination :page="pagination.page" :limit="pagination.limit" :total="pagination.total" :total-pages="pagination.totalPages" @change="(p: number) => { pagination.page = p; fetchRepayments(); }" />
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const { success, error: notifyError } = useNotification();

const loading = ref(true);
const processing = ref(false);
const repayments = ref<any[]>([]);
const filters = reactive({ status: '' });
const pagination = reactive({ page: 1, limit: 10, total: 0, totalPages: 0 });

const columns = computed(() => [
  { key: 'campaignId.campaignCode', label: t('common.campaign') },
  { key: 'amount', label: t('common.amount') },
  { key: 'paymentMethod', label: t('admin.method') },
  { key: 'status', label: t('common.status') },
  { key: 'createdAt', label: t('common.date') },
  { key: 'actions', label: '' },
]);

const statusOptions = computed(() => [
  { value: '', label: t('common.allStatuses') },
  { value: 'Pending', label: 'Pending' },
  { value: 'Verified', label: 'Verified' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'ComplianceHold', label: t('admin.complianceHold') },
]);

const fetchRepayments = async () => {
  loading.value = true;
  try {
    const params: any = { page: pagination.page, limit: pagination.limit };
    if (filters.status) params.status = filters.status;
    const res = await api.get('/admin/repayments', params);
    if (res.success) {
      repayments.value = res.data;
      const meta = res.pagination || res.meta; if (meta) Object.assign(pagination, meta);
    }
  } catch { /* ignore */ }
  loading.value = false;
};

const verifyRepayment = async (id: string) => {
  processing.value = true;
  try {
    await api.post(`/admin/repayments/${id}/verify`);
    success(t('admin.verify'), t('admin.repaymentVerified'));
    fetchRepayments();
  } catch (err: any) { notifyError('Error', err?.data?.error?.message || 'Failed'); }
  processing.value = false;
};

const rejectRepayment = async (id: string) => {
  processing.value = true;
  try {
    await api.post(`/admin/repayments/${id}/reject`, { reason: 'Invalid payment proof' });
    success(t('common.reject'), t('admin.repaymentRejected'));
    fetchRepayments();
  } catch (err: any) { notifyError('Error', err?.data?.error?.message || 'Failed'); }
  processing.value = false;
};

onMounted(fetchRepayments);
</script>
