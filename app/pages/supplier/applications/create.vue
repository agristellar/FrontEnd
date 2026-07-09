<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/supplier/applications" class="text-gray-400 hover:text-gray-600">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      </NuxtLink>
      <h1 class="page-title">{{ $t('supplier.newFinancingApp') }}</h1>
    </div>

    <!-- No verified contracts -->
    <div v-if="!loadingContracts && !verifiedContracts.length" class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
      <svg class="h-12 w-12 text-yellow-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      <p class="text-sm text-yellow-800 mb-4">{{ $t('supplier.noVerifiedContracts') }}</p>
      <NuxtLink to="/supplier/contracts/create" class="btn-primary">
        + {{ $t('supplier.newContract') }}
      </NuxtLink>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Select Contract -->
      <BaseCard :title="$t('supplier.exportContract')">
        <div class="space-y-4">
          <BaseSelect
            v-model="form.contractId"
            :label="$t('supplier.selectContract')"
            :options="contractOptions"
            :placeholder="$t('supplier.selectContract')"
            required
            :error="fieldErrors.contractId"
          />

          <!-- Contract Summary -->
          <div v-if="selectedContract" class="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
            <h4 class="text-sm font-semibold text-gray-700 mb-2">{{ $t('supplier.contractSummary') }}</h4>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-gray-500">{{ $t('supplier.buyerName') }}</span>
                <p class="font-medium text-gray-900">{{ selectedContract.buyerName }}</p>
              </div>
              <div>
                <span class="text-gray-500">{{ $t('supplier.productLabel') }}</span>
                <p class="font-medium text-gray-900">{{ selectedContract.product }}</p>
              </div>
              <div>
                <span class="text-gray-500">{{ $t('supplier.quantity') }}</span>
                <p class="font-medium text-gray-900">{{ Number(selectedContract.quantity).toLocaleString() }} {{ selectedContract.unit }}</p>
              </div>
              <div>
                <span class="text-gray-500">{{ $t('supplier.contractValue') }}</span>
                <p class="font-medium text-gray-900">${{ Number(selectedContract.contractValue).toLocaleString() }}</p>
              </div>
              <div v-if="selectedContract.paymentTerm">
                <span class="text-gray-500">{{ $t('supplier.paymentTerm') }}</span>
                <p class="font-medium text-gray-900">{{ selectedContract.paymentTerm }}</p>
              </div>
              <div v-if="selectedContract.incoterm">
                <span class="text-gray-500">{{ $t('supplier.incoterm') }}</span>
                <p class="font-medium text-gray-900">{{ selectedContract.incoterm }}</p>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Financing Details -->
      <BaseCard :title="$t('supplier.financingDetails')">
        <div class="space-y-4">
          <BaseInput v-model="form.requestedAmount" :label="$t('supplier.requestedAmount')" type="number" required :error="fieldErrors.requestedAmount" />
          <p v-if="selectedContract" class="text-xs text-gray-500 -mt-2">
            {{ $t('supplier.maxAmount', { amount: '$' + Math.floor(selectedContract.contractValue * 0.8).toLocaleString() }) }}
          </p>
          <BaseInput v-model="form.tenorDays" :label="$t('supplier.tenorDays')" type="number" required :error="fieldErrors.tenorDays" :placeholder="$t('supplier.tenorPlaceholder')" />
          <BaseTextarea v-model="form.purpose" :label="$t('supplier.purpose')" rows="3" :placeholder="$t('supplier.purposePlaceholder')" required :error="fieldErrors.purpose" />
          <BaseInput v-model="form.repaymentSource" :label="$t('supplier.repaymentSource')" :placeholder="$t('supplier.repaymentSourcePlaceholder')" />
        </div>

        <div class="mt-6 flex gap-3">
          <BaseButton type="button" variant="outline" :loading="saving" @click="saveDraft">
            {{ $t('supplier.saveDraft') }}
          </BaseButton>
          <BaseButton type="submit" :loading="submitting">
            {{ $t('supplier.submitApplication') }}
          </BaseButton>
        </div>
      </BaseCard>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'supplier', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const { success, error: notifyError } = useNotification();
const router = useRouter();

const saving = ref(false);
const submitting = ref(false);
const loadingContracts = ref(true);
const verifiedContracts = ref<any[]>([]);
const fieldErrors = ref<Record<string, string>>({});

const form = reactive({
  contractId: '',
  requestedAmount: '',
  tenorDays: '',
  purpose: '',
  repaymentSource: '',
});

const contractOptions = computed(() =>
  verifiedContracts.value.map((c) => ({
    value: c._id,
    label: `${c.product} — ${c.buyerName} ($${Number(c.contractValue).toLocaleString()})`,
  }))
);

const selectedContract = computed(() =>
  verifiedContracts.value.find((c) => c._id === form.contractId)
);

const buildPayload = () => ({
  contractId: form.contractId,
  requestedAmount: Number(form.requestedAmount),
  tenorDays: Number(form.tenorDays),
  purpose: form.purpose,
  repaymentSource: form.repaymentSource || undefined,
});

const handleApiError = (err: any) => {
  const apiError = err?.data?.error;
  if (apiError?.details?.length) {
    for (const d of apiError.details) {
      fieldErrors.value[d.field] = d.message;
    }
  }
  notifyError('Error', apiError?.message || 'Failed to submit');
};

const saveDraft = async () => {
  saving.value = true;
  fieldErrors.value = {};
  try {
    const res = await api.post('/applications', buildPayload());
    if (res.success) {
      success(t('supplier.saved'), t('supplier.savedDesc'));
      router.push(`/supplier/applications/${res.data._id}`);
    }
  } catch (err: any) {
    handleApiError(err);
  }
  saving.value = false;
};

const handleSubmit = async () => {
  submitting.value = true;
  fieldErrors.value = {};
  try {
    const createRes = await api.post('/applications', buildPayload());
    if (createRes.success) {
      const submitRes = await api.post(`/applications/${createRes.data._id}/submit`);
      if (submitRes.success) {
        success(t('supplier.submitted'), t('supplier.submittedDesc'));
        router.push('/supplier/applications');
      }
    }
  } catch (err: any) {
    handleApiError(err);
  }
  submitting.value = false;
};

onMounted(async () => {
  try {
    const res = await api.get('/contracts', { status: 'Verified', limit: 100 });
    if (res.success) verifiedContracts.value = res.data;
  } catch { /* ignore */ }
  loadingContracts.value = false;
});
</script>
