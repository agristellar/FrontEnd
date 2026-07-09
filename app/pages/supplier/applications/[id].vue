<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/supplier/applications" class="text-gray-400 hover:text-gray-600">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      </NuxtLink>
      <h1 class="page-title">{{ $t('supplier.applicationDetails') }}</h1>
      <StatusBadge v-if="app" :status="app.status" />
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="app" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Contract Info -->
      <BaseCard :title="$t('supplier.exportContract')">
        <dl class="space-y-3">
          <div class="flex justify-between"><dt class="text-sm text-gray-500">{{ $t('supplier.buyer') }}</dt><dd class="text-sm font-medium">{{ app.contractId?.buyerName }}</dd></div>
          <div class="flex justify-between"><dt class="text-sm text-gray-500">{{ $t('supplier.product') }}</dt><dd class="text-sm font-medium">{{ app.contractId?.product }}</dd></div>
          <div class="flex justify-between"><dt class="text-sm text-gray-500">{{ $t('supplier.quantity') }}</dt><dd class="text-sm font-medium">{{ app.contractId?.quantity }} tons</dd></div>
          <div class="flex justify-between"><dt class="text-sm text-gray-500">{{ $t('supplier.contractValueLabel') }}</dt><dd class="text-sm font-medium">${{ Number(app.contractId?.contractValue).toLocaleString() }}</dd></div>
          <div class="flex justify-between"><dt class="text-sm text-gray-500">{{ $t('supplier.paymentTerm') }}</dt><dd class="text-sm font-medium">{{ app.contractId?.paymentTerm }}</dd></div>
          <div class="flex justify-between"><dt class="text-sm text-gray-500">{{ $t('supplier.incoterm') }}</dt><dd class="text-sm font-medium">{{ app.contractId?.incoterm || '-' }}</dd></div>
        </dl>
      </BaseCard>

      <!-- Financing Info -->
      <BaseCard :title="$t('supplier.financingDetails')">
        <dl class="space-y-3">
          <div class="flex justify-between"><dt class="text-sm text-gray-500">{{ $t('supplier.requestedAmount') }}</dt><dd class="text-sm font-medium">${{ Number(app.requestedAmount).toLocaleString() }}</dd></div>
          <div class="flex justify-between"><dt class="text-sm text-gray-500">{{ $t('supplier.tenor') }}</dt><dd class="text-sm font-medium">{{ app.tenorDays }} days</dd></div>
          <div class="flex justify-between"><dt class="text-sm text-gray-500">{{ $t('supplier.purpose') }}</dt><dd class="text-sm">{{ app.purpose }}</dd></div>
          <div class="flex justify-between"><dt class="text-sm text-gray-500">{{ $t('supplier.riskScore') }}</dt><dd><RiskBadge v-if="app.riskScore" :grade="app.riskScore" /><span v-else class="text-sm text-gray-400">{{ $t('supplier.pending') }}</span></dd></div>
          <div class="flex justify-between"><dt class="text-sm text-gray-500">{{ $t('supplier.created') }}</dt><dd class="text-sm">{{ new Date(app.createdAt).toLocaleDateString() }}</dd></div>
        </dl>

        <!-- Action Buttons -->
        <div v-if="app.status === 'Draft'" class="mt-6 flex gap-3">
          <BaseButton :loading="submitting" @click="submitApp">{{ $t('supplier.submitForReview') }}</BaseButton>
        </div>
        <div v-if="app.status === 'NeedMoreInfo'" class="mt-6">
          <div class="p-3 bg-yellow-50 rounded-lg mb-3">
            <p class="text-sm text-yellow-800">{{ app.adminNotes || $t('supplier.additionalInfoRequested') }}</p>
          </div>
          <BaseTextarea v-model="additionalInfo" :label="$t('supplier.additionalInfo')" rows="3" />
          <BaseButton class="mt-3" :loading="submitting" @click="resubmit">{{ $t('supplier.resubmit') }}</BaseButton>
        </div>
      </BaseCard>

      <!-- Campaign Info (if exists) -->
      <BaseCard v-if="app.campaignId" :title="$t('supplier.fundingCampaign')">
        <dl class="space-y-3">
          <div class="flex justify-between"><dt class="text-sm text-gray-500">{{ $t('supplier.campaignCode') }}</dt><dd class="text-sm font-medium">{{ app.campaignId.campaignCode }}</dd></div>
          <div class="flex justify-between"><dt class="text-sm text-gray-500">{{ $t('common.status') }}</dt><dd><StatusBadge :status="app.campaignId.status" /></dd></div>
          <div class="flex justify-between"><dt class="text-sm text-gray-500">{{ $t('common.amount') }}</dt><dd class="text-sm font-medium">${{ Number(app.campaignId.fundedAmount).toLocaleString() }} / ${{ Number(app.campaignId.fundingTarget).toLocaleString() }}</dd></div>
        </dl>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'supplier', middleware: ['auth', 'role'] });

const { t } = useI18n();
const route = useRoute();
const api = useApi();
const { success, error: notifyError } = useNotification();

const loading = ref(true);
const submitting = ref(false);
const app = ref<any>(null);
const additionalInfo = ref('');

onMounted(async () => {
  try {
    const res = await api.get(`/applications/${route.params.id}`);
    if (res.success) app.value = res.data;
  } catch { /* ignore */ }
  loading.value = false;
});

const submitApp = async () => {
  submitting.value = true;
  try {
    const res = await api.post(`/applications/${route.params.id}/submit`);
    if (res.success) {
      app.value = res.data;
      success(t('supplier.submitted'), t('supplier.submittedDesc'));
    }
  } catch (err: any) {
    notifyError('Error', err?.data?.error?.message || 'Failed to submit');
  }
  submitting.value = false;
};

const resubmit = async () => {
  submitting.value = true;
  try {
    const res = await api.post(`/applications/${route.params.id}/submit`, { additionalInfo: additionalInfo.value });
    if (res.success) {
      app.value = res.data;
      success(t('supplier.resubmitted'), t('supplier.resubmittedDesc'));
    }
  } catch (err: any) {
    notifyError('Error', err?.data?.error?.message || 'Failed to resubmit');
  }
  submitting.value = false;
};
</script>
