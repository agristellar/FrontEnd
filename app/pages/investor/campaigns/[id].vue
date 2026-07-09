<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/investor/campaigns" class="text-gray-400 hover:text-gray-600">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      </NuxtLink>
      <h1 class="page-title">{{ campaign?.campaignCode || 'Campaign' }}</h1>
      <StatusBadge v-if="campaign" :status="campaign.status" />
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="campaign" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Info -->
      <div class="lg:col-span-2 space-y-6">
        <BaseCard :title="$t('investor.campaignOverview')">
          <dl class="grid grid-cols-2 gap-4">
            <div><dt class="text-sm text-gray-500">{{ $t('investor.product') }}</dt><dd class="text-sm font-medium mt-1">{{ campaign.product || campaign.contractId?.product }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('investor.buyer') }}</dt><dd class="text-sm font-medium mt-1">{{ campaign.contractId?.buyerName }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('investor.contractValue') }}</dt><dd class="text-sm font-medium mt-1">${{ Number(campaign.contractId?.contractValue || 0).toLocaleString() }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('investor.tenor') }}</dt><dd class="text-sm font-medium mt-1">{{ campaign.tenorDays }} days</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('investor.expectedReturn') }}</dt><dd class="text-sm font-medium mt-1 text-green-600">{{ campaign.expectedReturn }}%</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('investor.riskScore') }}</dt><dd class="mt-1"><RiskBadge :grade="campaign.riskScore" /></dd></div>
          </dl>
        </BaseCard>

        <!-- Milestones -->
        <BaseCard title="Milestones">
          <div class="space-y-3">
            <div v-for="(m, idx) in campaign.milestones" :key="idx" class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold', m.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600']">
                {{ idx + 1 }}
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">{{ m.name }}</p>
                <p class="text-xs text-gray-500">{{ m.percentage }}% - ${{ Number(m.disbursementAmount).toLocaleString() }}</p>
              </div>
              <StatusBadge :status="m.status" />
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Sidebar: Funding -->
      <div class="space-y-6">
        <BaseCard :title="$t('investor.fundingStatus')">
          <div class="mb-4">
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-500">{{ $t('investor.progress') }}</span>
              <span class="font-medium">{{ fundingPercent }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class="bg-primary-600 h-3 rounded-full transition-all" :style="{ width: `${fundingPercent}%` }" />
            </div>
          </div>
          <dl class="space-y-2">
            <div class="flex justify-between text-sm"><dt class="text-gray-500">{{ $t('investor.target') }}</dt><dd class="font-medium">${{ Number(campaign.fundingTarget).toLocaleString() }}</dd></div>
            <div class="flex justify-between text-sm"><dt class="text-gray-500">{{ $t('investor.fundedAmount') }}</dt><dd class="font-medium text-green-600">${{ Number(campaign.fundedAmount).toLocaleString() }}</dd></div>
            <div class="flex justify-between text-sm"><dt class="text-gray-500">{{ $t('investor.remaining') }}</dt><dd class="font-medium">${{ remaining.toLocaleString() }}</dd></div>
            <div class="flex justify-between text-sm"><dt class="text-gray-500">{{ $t('investor.deadline') }}</dt><dd>{{ campaign.fundingDeadline ? new Date(campaign.fundingDeadline).toLocaleDateString() : '-' }}</dd></div>
          </dl>

          <!-- Invest Form -->
          <div v-if="canInvest" class="mt-6 pt-4 border-t border-gray-100">
            <BaseInput v-model="investAmount" :label="$t('investor.investmentAmount')" type="number" :placeholder="$t('investor.investMinMax', { max: remaining.toLocaleString() })" />
            <BaseButton class="w-full mt-3" :loading="investing" @click="handleInvest">
              {{ $t('investor.investNow') }}
            </BaseButton>
          </div>
        </BaseCard>

        <!-- Supplier Info -->
        <BaseCard :title="$t('investor.supplierInfo')">
          <dl class="space-y-2">
            <div class="flex justify-between text-sm"><dt class="text-gray-500">{{ $t('investor.name') }}</dt><dd class="font-medium">{{ campaign.supplierId?.legalName || campaign.supplierId?.userId?.fullName || '-' }}</dd></div>
            <div class="flex justify-between text-sm"><dt class="text-gray-500">{{ $t('investor.capabilityScore') }}</dt><dd class="font-medium">{{ campaign.supplierId?.capabilityScore || '-' }}/100</dd></div>
          </dl>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'investor', middleware: ['auth', 'role'] });

const { t } = useI18n();
const route = useRoute();
const api = useApi();
const { success, error: notifyError } = useNotification();

const loading = ref(true);
const investing = ref(false);
const campaign = ref<any>(null);
const investAmount = ref('');

const fundingPercent = computed(() => {
  if (!campaign.value) return 0;
  return Math.min(100, Math.round((campaign.value.fundedAmount / campaign.value.fundingTarget) * 100));
});

const remaining = computed(() => {
  if (!campaign.value) return 0;
  return Math.max(0, campaign.value.fundingTarget - campaign.value.fundedAmount);
});

const canInvest = computed(() => {
  return campaign.value && ['OpenForFunding'].includes(campaign.value.status) && remaining.value > 0;
});

const handleInvest = async () => {
  const amount = Number(investAmount.value);
  if (!amount || amount < 100) {
    notifyError(t('investor.investMin'), t('investor.investMin'));
    return;
  }
  if (amount > remaining.value) {
    notifyError(t('investor.investMax', { max: remaining.value.toLocaleString() }), t('investor.investMax', { max: remaining.value.toLocaleString() }));
    return;
  }
  investing.value = true;
  try {
    const res = await api.post(`/investor/campaigns/${route.params.id}/fund`, { amount });
    if (res.success) {
      campaign.value = res.data.campaign || res.data;
      investAmount.value = '';
      success(t('investor.investmentMade'), t('investor.investedSuccess', { amount: amount.toLocaleString() }));
    }
  } catch (err: any) {
    notifyError('Error', err?.data?.error?.message || t('investor.investMin'));
  }
  investing.value = false;
};

onMounted(async () => {
  try {
    const res = await api.get(`/campaigns/${route.params.id}`);
    if (res.success) campaign.value = res.data;
  } catch { /* ignore */ }
  loading.value = false;
});
</script>
