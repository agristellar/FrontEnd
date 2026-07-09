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
          <NuxtLink to="/register" class="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm">{{ $t('common.getStarted') }}</NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Header -->
    <div class="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 py-16">
      <div class="max-w-7xl mx-auto px-6 text-center">
        <h1 class="text-3xl sm:text-4xl font-bold text-white mb-4">{{ $t('public.campaignsTitle') }}</h1>
        <p class="text-primary-200 text-lg max-w-2xl mx-auto">{{ $t('public.campaignsSubtitle') }}</p>
        <!-- Stats -->
        <div class="flex justify-center gap-8 mt-8">
          <div><p class="text-2xl font-bold text-white">{{ stats.totalCampaigns }}</p><p class="text-sm text-primary-300">{{ $t('public.totalCampaigns') }}</p></div>
          <div><p class="text-2xl font-bold text-gold-400">${{ formatAmount(stats.totalFunded) }}</p><p class="text-sm text-primary-300">{{ $t('public.totalFunded') }}</p></div>
          <div><p class="text-2xl font-bold text-green-400">{{ stats.settledCount }}</p><p class="text-sm text-primary-300">{{ $t('public.settledCampaigns') }}</p></div>
          <div><p class="text-2xl font-bold text-white">{{ stats.supplierCount }}</p><p class="text-sm text-primary-300">{{ $t('public.verifiedSuppliers') }}</p></div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="max-w-7xl mx-auto px-6 -mt-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <input v-model="filters.product" type="text" :placeholder="$t('public.searchProduct')" class="input-field w-60" @input="debouncedFetch" />
        <BaseSelect v-model="filters.riskScore" :options="riskOptions" :placeholder="$t('public.allRiskGrades')" class="w-44" @update:model-value="resetAndFetch" />
        <span class="text-sm text-gray-500 ml-auto">{{ pagination.total }} {{ $t('public.campaignsFound') }}</span>
      </div>
    </div>

    <!-- Campaign Grid -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <div v-if="loading" class="flex justify-center py-16">
        <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>

      <div v-else-if="!campaigns.length" class="text-center py-16 text-gray-500">
        <p class="text-lg">{{ $t('public.noCampaigns') }}</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink v-for="c in campaigns" :key="c._id" :to="`/campaigns/${c._id}`" class="bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all duration-300 overflow-hidden group">
          <!-- Top bar -->
          <div class="px-5 pt-5 pb-3">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">{{ c.campaignCode }}</span>
              <StatusBadge :status="c.status" />
            </div>
            <h3 class="text-base font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">{{ c.product || c.contractId?.product }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ c.supplierId?.legalName || c.supplierId?.userId?.fullName }}</p>
          </div>

          <!-- Progress -->
          <div class="px-5 pb-4">
            <div class="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>${{ Number(c.fundedAmount || 0).toLocaleString() }} / ${{ Number(c.fundingTarget).toLocaleString() }}</span>
              <span class="font-medium text-primary-600">{{ Math.round(((c.fundedAmount || 0) / c.fundingTarget) * 100) }}%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div class="bg-primary-500 h-2 rounded-full transition-all" :style="{ width: `${Math.min(100, ((c.fundedAmount || 0) / c.fundingTarget) * 100)}%` }" />
            </div>
          </div>

          <!-- Footer -->
          <div class="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div class="flex items-center gap-3">
              <RiskBadge :grade="c.riskScore" />
              <span>{{ c.expectedReturn }}% {{ $t('public.returnLabel') }}</span>
            </div>
            <span>{{ c.tenorDays }}d</span>
          </div>
        </NuxtLink>
      </div>

      <div v-if="hasMore" class="mt-10 flex justify-center">
        <button
          class="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold text-primary-700 bg-primary-50 rounded-xl hover:bg-primary-100 transition border border-primary-200"
          :disabled="loadingMore"
          @click="loadMore"
        >
          <svg v-if="loadingMore" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ loadingMore ? $t('public.loading') : $t('public.loadMore') }}
          <span class="text-xs text-primary-400">({{ campaigns.length }}/{{ pagination.total }})</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' });

const { t } = useI18n();

useSeoMeta({
  title: () => t('public.campaignsTitle'),
  description: () => t('public.campaignsSubtitle'),
  ogTitle: () => t('public.campaignsTitle'),
  ogDescription: () => t('public.campaignsSubtitle'),
});
const api = useApi();

const loading = ref(true);
const loadingMore = ref(false);
const campaigns = ref<any[]>([]);
const filters = reactive({ product: '', riskScore: '' });
const pagination = reactive({ page: 1, limit: 12, total: 0, totalPages: 0 });

const hasMore = computed(() => campaigns.value.length < pagination.total);
const stats = ref({ totalCampaigns: 0, totalFunded: 0, settledCount: 0, supplierCount: 0 });

const riskOptions = [
  { value: '', label: t('public.allRiskGrades') },
  { value: 'A', label: 'Grade A' },
  { value: 'B', label: 'Grade B' },
  { value: 'C', label: 'Grade C' },
  { value: 'D', label: 'Grade D' },
];

const formatAmount = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

let debounceTimer: ReturnType<typeof setTimeout>;
const debouncedFetch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(resetAndFetch, 300);
};

const fetchCampaigns = async (append = false) => {
  if (!append) loading.value = true;
  try {
    const params: any = { page: pagination.page, limit: pagination.limit };
    if (filters.product) params.product = filters.product;
    if (filters.riskScore) params.riskScore = filters.riskScore;
    const res = await api.get('/campaigns/public', params);
    if (res.success) {
      if (append) campaigns.value.push(...res.data);
      else campaigns.value = res.data;
      const meta = res.pagination || res.meta;
      if (meta) Object.assign(pagination, meta);
    }
  } catch { /* ignore */ }
  loading.value = false;
  loadingMore.value = false;
};

const loadMore = () => {
  if (!hasMore.value || loadingMore.value) return;
  loadingMore.value = true;
  pagination.page++;
  fetchCampaigns(true);
};

const resetAndFetch = () => {
  pagination.page = 1;
  campaigns.value = [];
  fetchCampaigns();
};

onMounted(async () => {
  try {
    const statsRes = await api.get('/campaigns/public/stats');
    if (statsRes.success) stats.value = statsRes.data;
  } catch { /* ignore */ }
  fetchCampaigns();
});
</script>
