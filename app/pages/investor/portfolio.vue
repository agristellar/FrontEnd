<template>
  <div>
    <h1 class="page-title mb-6">{{ $t('investor.portfolio') }}</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard :title="$t('investor.totalInvested')" :value="portfolio?.totalInvested || 0" format="currency" />
      <StatCard :title="$t('investor.totalPayout')" :value="portfolio?.totalPayout || 0" format="currency" />
      <StatCard :title="$t('investor.activeNotes')" :value="portfolio?.activeNotes || 0" format="number" />
      <StatCard :title="$t('investor.netReturn')" :value="netReturn" format="currency" />
    </div>

    <BaseCard :title="$t('investor.investmentByCampaign')" :padding="false">
      <BaseTable :columns="columns" :data="investments" :loading="loading" :empty-text="$t('investor.noInvestmentsYet')">
        <template #campaignCode="{ value }">
          <span class="font-medium text-gray-900">{{ value }}</span>
        </template>
        <template #amount="{ value }">
          ${{ Number(value).toLocaleString() }}
        </template>
        <template #expectedPayout="{ value }">
          <span class="text-green-600">${{ Number(value).toLocaleString() }}</span>
        </template>
        <template #status="{ value }">
          <StatusBadge :status="value" />
        </template>
        <template #riskScore="{ value }">
          <RiskBadge :grade="value" />
        </template>
      </BaseTable>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'investor', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const investorStore = useInvestorStore();

const loading = ref(true);
const investments = ref<any[]>([]);

const portfolio = computed(() => investorStore.portfolio);
const netReturn = computed(() => {
  if (!portfolio.value) return 0;
  return portfolio.value.totalPayout - portfolio.value.totalInvested;
});

const columns = computed(() => [
  { key: 'campaignCode', label: t('investor.investmentByCampaign').split(' ')[0] || 'Campaign' },
  { key: 'product', label: t('investor.product') },
  { key: 'amount', label: t('investor.invested') },
  { key: 'expectedPayout', label: t('investor.expectedPayoutLabel') },
  { key: 'riskScore', label: t('investor.riskScore') },
  { key: 'status', label: t('common.status') },
]);

onMounted(async () => {
  try {
    const res = await api.get('/investor/portfolio');
    if (res.success) {
      investorStore.setPortfolio(res.data);
      investments.value = res.data.activeCampaigns || [];
    }
  } catch { /* ignore */ }
  loading.value = false;
});
</script>
