<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <nav class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center">
          <img src="~/assets/images/logo.png" alt="AgriStellar" class="h-9" />
        </NuxtLink>
        <div class="flex items-center gap-3">
          <LangSwitcher />
          <NuxtLink to="/login" class="text-sm font-medium text-gray-700 hover:text-gray-900">{{ $t('common.signIn') }}</NuxtLink>
          <NuxtLink to="/register?role=Investor" class="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm">{{ $t('public.investNow') }}</NuxtLink>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Back -->
      <NuxtLink to="/campaigns" class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        {{ $t('public.backToCampaigns') }}
      </NuxtLink>

      <div v-if="loading" class="flex justify-center py-16">
        <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>

      <div v-else-if="campaign" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Header Card -->
          <div class="bg-white rounded-xl border border-gray-100 p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{{ campaign.campaignCode }}</span>
                  <StatusBadge :status="campaign.status" />
                  <RiskBadge :grade="campaign.riskScore" />
                </div>
                <h1 class="text-2xl font-bold text-gray-900">{{ campaign.product || campaign.contractId?.product }}</h1>
                <p class="text-gray-500 mt-1">{{ campaign.contractId?.buyerName }} &mdash; {{ campaign.buyerRegion }}</p>
              </div>
            </div>

            <!-- Key Metrics -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div class="bg-gray-50 rounded-lg p-3 text-center">
                <p class="text-xs text-gray-500">{{ $t('public.fundingTarget') }}</p>
                <p class="text-lg font-bold text-gray-900">${{ Number(campaign.fundingTarget).toLocaleString() }}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-3 text-center">
                <p class="text-xs text-gray-500">{{ $t('public.expectedReturn') }}</p>
                <p class="text-lg font-bold text-green-600">{{ campaign.expectedReturn }}%</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-3 text-center">
                <p class="text-xs text-gray-500">{{ $t('public.tenor') }}</p>
                <p class="text-lg font-bold text-gray-900">{{ campaign.tenorDays }} {{ $t('public.days') }}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-3 text-center">
                <p class="text-xs text-gray-500">{{ $t('public.contractValue') }}</p>
                <p class="text-lg font-bold text-gray-900">${{ Number(campaign.contractId?.contractValue || 0).toLocaleString() }}</p>
              </div>
            </div>
          </div>

          <!-- Contract Details -->
          <div class="bg-white rounded-xl border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('public.contractDetails') }}</h2>
            <dl class="grid grid-cols-2 gap-4">
              <div><dt class="text-sm text-gray-500">{{ $t('public.buyer') }}</dt><dd class="text-sm font-medium mt-1">{{ campaign.contractId?.buyerName }}</dd></div>
              <div><dt class="text-sm text-gray-500">{{ $t('public.region') }}</dt><dd class="text-sm font-medium mt-1">{{ campaign.buyerRegion }}</dd></div>
              <div><dt class="text-sm text-gray-500">{{ $t('public.quantity') }}</dt><dd class="text-sm font-medium mt-1">{{ campaign.contractId?.quantity?.toLocaleString() }} {{ campaign.contractId?.unit }}</dd></div>
              <div><dt class="text-sm text-gray-500">{{ $t('public.paymentTerm') }}</dt><dd class="text-sm font-medium mt-1">{{ campaign.contractId?.paymentTerm }}</dd></div>
              <div><dt class="text-sm text-gray-500">{{ $t('public.incoterm') }}</dt><dd class="text-sm font-medium mt-1">{{ campaign.contractId?.incoterm || '-' }}</dd></div>
              <div><dt class="text-sm text-gray-500">{{ $t('public.publishedAt') }}</dt><dd class="text-sm font-medium mt-1">{{ campaign.publishedAt ? new Date(campaign.publishedAt).toLocaleDateString() : '-' }}</dd></div>
            </dl>
          </div>

          <!-- Milestones -->
          <div class="bg-white rounded-xl border border-gray-100 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('public.milestones') }}</h2>
            <div class="space-y-3">
              <div v-for="(m, idx) in campaign.milestones" :key="idx" class="flex items-center gap-4 p-4 rounded-lg" :class="m.status === 'Disbursed' ? 'bg-green-50' : m.status === 'Approved' ? 'bg-blue-50' : 'bg-gray-50'">
                <div :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                  m.status === 'Disbursed' ? 'bg-green-500 text-white' : m.status === 'Approved' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                ]">
                  <svg v-if="m.status === 'Disbursed'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  <span v-else>{{ idx + 1 }}</span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ m.name }}</p>
                  <p v-if="m.description" class="text-xs text-gray-500 mt-0.5">{{ m.description }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900">{{ m.percentage }}%</p>
                  <p class="text-xs text-gray-500">${{ Number(m.disbursementAmount).toLocaleString() }}</p>
                </div>
                <StatusBadge :status="m.status" />
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Funding Progress -->
          <div class="bg-white rounded-xl border border-gray-100 p-6">
            <h3 class="text-base font-semibold text-gray-900 mb-4">{{ $t('public.fundingProgress') }}</h3>
            <div class="text-center mb-4">
              <p class="text-4xl font-bold text-primary-600">{{ fundingPercent }}%</p>
              <p class="text-sm text-gray-500 mt-1">{{ $t('public.funded') }}</p>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-3 mb-4">
              <div class="bg-primary-500 h-3 rounded-full transition-all" :style="{ width: `${fundingPercent}%` }" />
            </div>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between"><dt class="text-gray-500">{{ $t('public.raised') }}</dt><dd class="font-medium">${{ Number(campaign.fundedAmount || 0).toLocaleString() }}</dd></div>
              <div class="flex justify-between"><dt class="text-gray-500">{{ $t('public.target') }}</dt><dd class="font-medium">${{ Number(campaign.fundingTarget).toLocaleString() }}</dd></div>
              <div class="flex justify-between"><dt class="text-gray-500">{{ $t('public.remaining') }}</dt><dd class="font-medium">${{ remaining.toLocaleString() }}</dd></div>
              <div class="flex justify-between"><dt class="text-gray-500">{{ $t('public.deadline') }}</dt><dd class="font-medium">{{ campaign.fundingDeadline ? new Date(campaign.fundingDeadline).toLocaleDateString() : '-' }}</dd></div>
            </dl>

            <NuxtLink to="/register?role=Investor" class="block w-full mt-6 px-4 py-3 text-center text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition shadow-sm">
              {{ $t('public.startInvesting') }}
            </NuxtLink>
          </div>

          <!-- Supplier Info -->
          <div class="bg-white rounded-xl border border-gray-100 p-6">
            <h3 class="text-base font-semibold text-gray-900 mb-4">{{ $t('public.supplierInfo') }}</h3>
            <div class="flex items-center gap-3 mb-4">
              <TablerIcon v-if="campaign.supplierId?.icon" :name="campaign.supplierId.icon" :size="36" class="text-primary-600" />
              <div>
                <p class="text-sm font-medium text-gray-900">{{ campaign.supplierId?.legalName }}</p>
                <p v-if="campaign.supplierId?.verificationStatus === 'Verified'" class="text-xs text-green-600 flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  {{ $t('public.verified') }}
                </p>
              </div>
            </div>
            <dl class="space-y-2 text-sm">
              <div v-if="campaign.supplierId?.growingArea" class="flex justify-between"><dt class="text-gray-500">{{ $t('public.location') }}</dt><dd class="font-medium text-right">{{ campaign.supplierId.growingArea }}</dd></div>
              <div v-if="campaign.supplierId?.capabilityScore" class="flex justify-between"><dt class="text-gray-500">{{ $t('public.capabilityScore') }}</dt><dd class="font-medium">{{ campaign.supplierId.capabilityScore }}/100</dd></div>
              <div v-if="campaign.supplierId?.productTypes?.length">
                <dt class="text-gray-500 mb-1">{{ $t('public.products') }}</dt>
                <dd class="flex flex-wrap gap-1">
                  <span v-for="p in campaign.supplierId.productTypes" :key="p" class="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{{ p }}</span>
                </dd>
              </div>
              <div v-if="campaign.supplierId?.certificates?.length">
                <dt class="text-gray-500 mb-1">{{ $t('public.certificates') }}</dt>
                <dd class="flex flex-wrap gap-1">
                  <span v-for="c in campaign.supplierId.certificates" :key="c.name" class="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{{ c.name }}</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' });

const { t } = useI18n();
const route = useRoute();
const api = useApi();

const loading = ref(true);
const campaign = ref<any>(null);

const seoTitle = computed(() => {
  if (!campaign.value) return t('public.campaignsTitle');
  return `${campaign.value.product || campaign.value.campaignCode} — ${campaign.value.supplierId?.legalName || 'AgriStellar'}`;
});
const seoDesc = computed(() => {
  if (!campaign.value) return '';
  const c = campaign.value;
  return `Invest in ${c.product} from ${c.supplierId?.legalName || 'Vietnam'}. Funding target: $${Number(c.fundingTarget).toLocaleString()}, expected return: ${c.expectedReturn}%, tenor: ${c.tenorDays} days. Risk grade: ${c.riskScore}.`;
});
useSeoMeta({
  title: seoTitle,
  description: seoDesc,
  ogTitle: seoTitle,
  ogDescription: seoDesc,
});
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => {
        if (!campaign.value) return '{}';
        const c = campaign.value;
        return JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'InvestmentOrDeposit',
          name: c.campaignCode,
          description: seoDesc.value,
          amount: { '@type': 'MonetaryAmount', value: c.fundingTarget, currency: 'USD' },
          provider: { '@type': 'Organization', name: c.supplierId?.legalName || 'AgriStellar' },
        });
      }),
    },
  ],
});

const fundingPercent = computed(() => {
  if (!campaign.value) return 0;
  return Math.min(100, Math.round(((campaign.value.fundedAmount || 0) / campaign.value.fundingTarget) * 100));
});

const remaining = computed(() => {
  if (!campaign.value) return 0;
  return Math.max(0, campaign.value.fundingTarget - (campaign.value.fundedAmount || 0));
});

onMounted(async () => {
  try {
    const res = await api.get(`/campaigns/public/${route.params.id}`);
    if (res.success) campaign.value = res.data;
  } catch { /* ignore */ }
  loading.value = false;
});
</script>
