<template>
  <div>
    <h1 class="page-title mb-6">{{ $t('investor.payoutHistory') }}</h1>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <StatCard :title="$t('investor.totalPayouts')" :value="totalPayouts" format="currency" />
      <StatCard :title="$t('investor.platformFees')" :value="totalFees" format="currency" />
      <StatCard :title="$t('investor.netReceived')" :value="totalPayouts - totalFees" format="currency" />
    </div>

    <BaseCard :padding="false">
      <BaseTable :columns="columns" :data="payouts" :loading="loading" :empty-text="$t('investor.noPayouts')">
        <template #campaignCode="{ value }">
          <span class="font-medium text-gray-900">{{ value }}</span>
        </template>
        <template #principal="{ value }">
          ${{ Number(value).toLocaleString() }}
        </template>
        <template #returnAmount="{ value }">
          <span class="text-green-600">+${{ Number(value).toLocaleString() }}</span>
        </template>
        <template #platformFee="{ value }">
          <span class="text-gray-500">-${{ Number(value).toLocaleString() }}</span>
        </template>
        <template #totalAmount="{ value }">
          <span class="font-semibold">${{ Number(value).toLocaleString() }}</span>
        </template>
        <template #status="{ value }">
          <StatusBadge :status="value" />
        </template>
        <template #paidAt="{ value }">
          {{ value ? new Date(value).toLocaleDateString() : '-' }}
        </template>
      </BaseTable>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'investor', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const loading = ref(true);
const payouts = ref<any[]>([]);
const totalPayouts = ref(0);
const totalFees = ref(0);

const columns = computed(() => [
  { key: 'campaignCode', label: 'Campaign' },
  { key: 'principal', label: t('investor.principal') },
  { key: 'returnAmount', label: t('investor.returnLabel') },
  { key: 'platformFee', label: t('investor.fee') },
  { key: 'totalAmount', label: t('investor.total') },
  { key: 'status', label: t('common.status') },
  { key: 'paidAt', label: t('common.date') },
]);

onMounted(async () => {
  try {
    const res = await api.get('/investor/payouts');
    if (res.success) {
      payouts.value = res.data;
      totalPayouts.value = res.data.reduce((sum: number, p: any) => sum + (p.totalAmount || 0), 0);
      totalFees.value = res.data.reduce((sum: number, p: any) => sum + (p.platformFee || 0), 0);
    }
  } catch { /* ignore */ }
  loading.value = false;
});
</script>
