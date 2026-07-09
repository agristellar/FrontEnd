<template>
  <div>
    <h1 class="page-title mb-6">{{ $t('investor.dashboard') }}</h1>

    <!-- Wallet Connection -->
    <div v-if="!walletConnected" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-blue-800">{{ $t('investor.connectWalletDesc') }}</p>
        <p class="text-xs text-blue-600 mt-1">{{ $t('investor.connectWalletHint') }}</p>
      </div>
      <BaseButton size="sm" @click="showWalletModal = true">{{ $t('investor.connectWallet') }}</BaseButton>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard :title="$t('investor.totalInvested')" :value="portfolio?.totalInvested || 0" format="currency" />
      <StatCard :title="$t('investor.totalPayout')" :value="portfolio?.totalPayout || 0" format="currency" />
      <StatCard :title="$t('investor.activeNotes')" :value="portfolio?.activeNotes || 0" format="number" />
      <StatCard :title="$t('investor.returnRate')" :value="returnRate" format="percent" />
    </div>

    <!-- Active Campaigns -->
    <BaseCard :title="$t('investor.yourInvestments')">
      <template #header>
        <NuxtLink to="/investor/campaigns" class="text-sm text-primary-600 hover:text-primary-700 font-medium">{{ $t('investor.browseCampaigns') }}</NuxtLink>
      </template>
      <div v-if="!activeCampaigns.length" class="text-center py-8 text-gray-500">
        <p>{{ $t('investor.noInvestments') }}</p>
        <NuxtLink to="/investor/campaigns" class="text-primary-600 font-medium mt-2 inline-block">{{ $t('investor.exploreCampaigns') }}</NuxtLink>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="c in activeCampaigns" :key="c._id" class="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-900">{{ c.campaignCode }}</span>
            <StatusBadge :status="c.status" />
          </div>
          <div class="mb-3">
            <div class="flex justify-between text-xs text-gray-500 mb-1">
              <span>{{ $t('investor.fundedAmount') }}</span>
              <span>${{ Number(c.fundedAmount).toLocaleString() }} / ${{ Number(c.fundingTarget).toLocaleString() }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-primary-600 h-2 rounded-full" :style="{ width: `${Math.min(100, (c.fundedAmount / c.fundingTarget) * 100)}%` }" />
            </div>
          </div>
          <div class="flex items-center justify-between">
            <RiskBadge :grade="c.riskScore" />
            <NuxtLink :to="`/investor/campaigns/${c._id}`" class="text-sm text-primary-600 font-medium">{{ $t('common.view') }}</NuxtLink>
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- Wallet Modal -->
    <BaseModal v-model="showWalletModal" :title="$t('investor.connectWalletTitle')">
      <div class="space-y-4">
        <BaseInput v-model="walletAddress" :label="$t('investor.walletAddress')" placeholder="G..." required />
        <p class="text-xs text-gray-500">{{ $t('investor.walletAddressHint') }}</p>
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showWalletModal = false">{{ $t('common.cancel') }}</BaseButton>
        <BaseButton :loading="connecting" @click="connectWallet">{{ $t('investor.connectWallet') }}</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'investor', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const investorStore = useInvestorStore();
const { success, error: notifyError } = useNotification();

const loading = ref(true);
const connecting = ref(false);
const showWalletModal = ref(false);
const walletAddress = ref('');
const walletConnected = ref(false);
const activeCampaigns = ref<any[]>([]);

const portfolio = computed(() => investorStore.portfolio);
const returnRate = computed(() => {
  if (!portfolio.value || portfolio.value.totalInvested === 0) return 0;
  return Number(((portfolio.value.totalPayout - portfolio.value.totalInvested) / portfolio.value.totalInvested * 100).toFixed(2));
});

const connectWallet = async () => {
  if (!walletAddress.value || !walletAddress.value.startsWith('G')) {
    notifyError(t('investor.walletInvalid'), t('investor.walletAddressHint'));
    return;
  }
  connecting.value = true;
  try {
    await api.post('/investor/wallet', { stellarWalletAddress: walletAddress.value });
    walletConnected.value = true;
    showWalletModal.value = false;
    success(t('investor.walletConnected'), t('investor.walletConnected'));
  } catch (err: any) {
    notifyError('Error', err?.data?.error?.message || t('investor.walletInvalid'));
  }
  connecting.value = false;
};

onMounted(async () => {
  try {
    const res = await api.get('/investor/portfolio');
    if (res.success) {
      investorStore.setPortfolio(res.data);
      activeCampaigns.value = res.data.activeCampaigns || [];
      walletConnected.value = !!res.data.walletAddress;
    }
  } catch { /* ignore */ }
  loading.value = false;
});
</script>
