<template>
  <div>
    <h1 class="page-title mb-6">{{ $t('investor.fundingCampaigns') }}</h1>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-4">
      <BaseSelect
        v-model="filters.status"
        :options="statusOptions"
        :placeholder="$t('common.allStatuses')"
        class="w-44"
        @update:model-value="fetchCampaigns"
      />
      <BaseSelect
        v-model="filters.riskScore"
        :options="riskOptions"
        :placeholder="$t('investor.allRiskGrades')"
        class="w-44"
        @update:model-value="fetchCampaigns"
      />
    </div>

    <!-- Campaign Cards -->
    <div v-if="loading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="!campaigns.length" class="text-center py-12 text-gray-500">
      {{ $t('investor.noCampaigns') }}
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="c in campaigns" :key="c._id" class="card hover:shadow-md transition-shadow cursor-pointer" @click="$router.push(`/investor/campaigns/${c._id}`)">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-bold text-gray-900">{{ c.campaignCode }}</span>
          <StatusBadge :status="c.status" />
        </div>

        <p class="text-sm text-gray-600 mb-3">{{ c.product || c.contractId?.product || 'Agricultural Product' }}</p>

        <!-- Funding Progress -->
        <div class="mb-4">
          <div class="flex justify-between text-xs text-gray-500 mb-1">
            <span>${{ Number(c.fundedAmount).toLocaleString() }}</span>
            <span>${{ Number(c.fundingTarget).toLocaleString() }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div class="bg-primary-600 h-2.5 rounded-full transition-all" :style="{ width: `${Math.min(100, (c.fundedAmount / c.fundingTarget) * 100)}%` }" />
          </div>
          <p class="text-xs text-gray-500 mt-1">{{ $t('investor.funded', { percent: Math.round((c.fundedAmount / c.fundingTarget) * 100) }) }}</p>
        </div>

        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-2">
            <RiskBadge :grade="c.riskScore" />
            <span class="text-gray-500">{{ $t('investor.return', { percent: c.expectedReturn }) }}</span>
          </div>
          <span class="text-xs text-gray-400">{{ daysLeft(c.fundingDeadline) }}</span>
        </div>
      </div>
    </div>

    <BasePagination
      class="mt-6"
      :page="pagination.page"
      :limit="pagination.limit"
      :total="pagination.total"
      :total-pages="pagination.totalPages"
      @change="(p: number) => { pagination.page = p; fetchCampaigns(); }"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'investor', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const campaignStore = useCampaignStore();

const loading = ref(true);
const campaigns = ref<any[]>([]);
const filters = reactive({ status: '', riskScore: '' });
const pagination = reactive({ page: 1, limit: 12, total: 0, totalPages: 0 });

const statusOptions = computed(() => [
  { value: '', label: t('common.allStatuses') },
  { value: 'Published', label: 'Published' },
  { value: 'Funding', label: 'Funding' },
  { value: 'FullyFunded', label: 'Fully Funded' },
  { value: 'Active', label: 'Active' },
]);

const riskOptions = computed(() => [
  { value: '', label: t('investor.allRiskGrades') },
  { value: 'A', label: t('investor.gradeA') },
  { value: 'B', label: t('investor.gradeB') },
  { value: 'C', label: t('investor.gradeC') },
  { value: 'D', label: t('investor.gradeD') },
]);

const daysLeft = (deadline: string) => {
  if (!deadline) return '';
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return t('investor.ended');
  return t('investor.daysLeft', { days: diff });
};

const fetchCampaigns = async () => {
  loading.value = true;
  try {
    const params: any = { page: pagination.page, limit: pagination.limit };
    if (filters.status) params.status = filters.status;
    if (filters.riskScore) params.riskScore = filters.riskScore;
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
