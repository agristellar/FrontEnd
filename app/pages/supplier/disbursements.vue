<template>
  <div>
    <h1 class="page-title mb-6">{{ $t('supplier.disbursements') }}</h1>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <StatCard :title="$t('supplier.totalDisbursed')" :value="totalDisbursed" format="currency" />
      <StatCard :title="$t('supplier.pendingMilestones')" :value="pendingCount" format="number" />
      <StatCard :title="$t('supplier.completed')" :value="completedCount" format="number" />
    </div>

    <BaseCard :title="$t('supplier.disbursementHistory')" :padding="false">
      <BaseTable :columns="columns" :data="disbursements" :loading="loading" :empty-text="$t('supplier.noDisbursements')">
        <template #amount="{ value }">
          <span class="font-medium text-gray-900">${{ Number(value).toLocaleString() }}</span>
        </template>
        <template #status="{ value }">
          <StatusBadge :status="value" />
        </template>
        <template #createdAt="{ value }">
          {{ new Date(value).toLocaleDateString() }}
        </template>
        <template #transactionHash="{ value }">
          <span v-if="value" class="text-xs font-mono text-gray-500">{{ value.slice(0, 12) }}...</span>
          <span v-else class="text-gray-400">-</span>
        </template>
      </BaseTable>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'supplier', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const loading = ref(true);
const disbursements = ref<any[]>([]);
const totalDisbursed = ref(0);
const pendingCount = ref(0);
const completedCount = ref(0);

const columns = computed(() => [
  { key: 'milestoneId.title', label: t('supplier.milestone') },
  { key: 'amount', label: t('common.amount') },
  { key: 'status', label: t('common.status') },
  { key: 'transactionHash', label: t('supplier.txHash') },
  { key: 'createdAt', label: t('common.date') },
]);

onMounted(async () => {
  try {
    const res = await api.get('/milestones/disbursements');
    if (res.success) {
      disbursements.value = res.data;
      totalDisbursed.value = res.data.filter((d: any) => d.status === 'Completed').reduce((sum: number, d: any) => sum + d.amount, 0);
      completedCount.value = res.data.filter((d: any) => d.status === 'Completed').length;
      pendingCount.value = res.data.filter((d: any) => d.status === 'Pending').length;
    }
  } catch { /* ignore */ }
  loading.value = false;
});
</script>
