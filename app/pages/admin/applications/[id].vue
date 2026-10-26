<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/applications" class="text-gray-400 hover:text-gray-600">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      </NuxtLink>
      <h1 class="page-title">{{ $t('admin.applicationReview') }}</h1>
      <StatusBadge v-if="app" :status="app.status" />
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="app" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <!-- Contract Details -->
        <BaseCard :title="$t('admin.exportContract')">
          <dl class="grid grid-cols-2 gap-4">
            <div><dt class="text-sm text-gray-500">{{ $t('common.buyer') }}</dt><dd class="text-sm font-medium mt-1">{{ app.contractId?.buyerName }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('admin.country') }}</dt><dd class="text-sm font-medium mt-1">{{ app.contractId?.buyerRegion }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('common.product') }}</dt><dd class="text-sm font-medium mt-1">{{ app.contractId?.product }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('common.quantity') }}</dt><dd class="text-sm font-medium mt-1">{{ app.contractId?.quantity }} {{ app.contractId?.unit }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('common.contractValue') }}</dt><dd class="text-sm font-medium mt-1">${{ Number(app.contractId?.contractValue).toLocaleString() }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('common.paymentTerm') }}</dt><dd class="text-sm font-medium mt-1">{{ app.contractId?.paymentTerm }}</dd></div>
          </dl>
        </BaseCard>

        <!-- Financing Details -->
        <BaseCard :title="$t('admin.financingRequest')">
          <dl class="grid grid-cols-2 gap-4">
            <div><dt class="text-sm text-gray-500">{{ $t('admin.requestedAmount') }}</dt><dd class="text-sm font-medium mt-1">${{ Number(app.requestedAmount).toLocaleString() }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('common.tenor') }}</dt><dd class="text-sm font-medium mt-1">{{ app.tenorDays }} days</dd></div>
            <div class="col-span-2"><dt class="text-sm text-gray-500">{{ $t('common.purpose') }}</dt><dd class="text-sm mt-1">{{ app.purpose }}</dd></div>
            <div class="col-span-2"><dt class="text-sm text-gray-500">{{ $t('admin.repaymentPlan') }}</dt><dd class="text-sm mt-1">{{ app.repaymentPlan || '-' }}</dd></div>
          </dl>
        </BaseCard>

        <!-- Supplier Info -->
        <BaseCard :title="$t('admin.supplierInformation')">
          <dl class="grid grid-cols-2 gap-4">
            <div><dt class="text-sm text-gray-500">{{ $t('common.name') }}</dt><dd class="text-sm font-medium mt-1">{{ app.supplierId?.fullName }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('admin.email') }}</dt><dd class="text-sm mt-1">{{ app.supplierId?.email }}</dd></div>
          </dl>
        </BaseCard>

        <!-- Create Campaign Form (shown when Approved and no campaign yet) -->
        <BaseCard v-if="app.status === 'Approved' && !app.campaignId" title="Create Funding Campaign">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <BaseInput v-model="campaign.fundingTarget" label="Funding Target (USD)" type="number" :placeholder="`e.g. ${app.requestedAmount}`" />
              <BaseInput v-model="campaign.expectedReturn" label="Expected Return (%)" type="number" placeholder="e.g. 10" />
              <BaseInput v-model="campaign.tenorDays" label="Tenor (days)" type="number" :placeholder="`e.g. ${app.tenorDays}`" />
              <BaseSelect v-model="campaign.riskScore" :options="riskOptions" label="Risk Score" placeholder="Select grade" />
              <BaseInput v-model="campaign.fundingDeadlineDays" label="Funding Deadline (days from publish)" type="number" placeholder="e.g. 14" />
              <BaseInput v-model="campaign.platformFeePercent" label="Platform Fee (%)" type="number" placeholder="1.5" />
            </div>

            <!-- Milestones -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-sm font-medium text-gray-700">Milestones</h4>
                <button v-if="campaign.milestones.length < 5" type="button" class="text-sm text-primary-600 hover:text-primary-700 font-medium" @click="addMilestone">+ Add Milestone</button>
              </div>
              <div v-for="(ms, idx) in campaign.milestones" :key="idx" class="flex items-start gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                <div class="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">{{ idx + 1 }}</div>
                <div class="flex-1 grid grid-cols-2 gap-3">
                  <BaseInput v-model="ms.name" label="Name" placeholder="e.g. Procurement" class="col-span-2" />
                  <BaseInput v-model="ms.percentage" label="Percentage (%)" type="number" placeholder="e.g. 40" />
                  <div>
                    <p class="label mb-1">Required Evidence</p>
                    <div class="flex flex-wrap gap-2">
                      <label v-for="ev in evidenceOptions" :key="ev.value" class="inline-flex items-center gap-1 text-xs cursor-pointer">
                        <input type="checkbox" :value="ev.value" :checked="ms.evidenceTypes.includes(ev.value)" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" @change="toggleEvidence(ms, ev.value)" />
                        {{ ev.label }}
                      </label>
                    </div>
                  </div>
                </div>
                <button v-if="campaign.milestones.length > 1" type="button" class="mt-1 text-red-400 hover:text-red-600" @click="campaign.milestones.splice(idx, 1)">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p v-if="milestoneTotal !== 100" class="text-xs text-red-500">Total percentage: {{ milestoneTotal }}% (must be 100%)</p>
            </div>

            <BaseButton class="w-full" :loading="creating" :disabled="!canCreate" @click="handleCreateCampaign">
              Create Campaign
            </BaseButton>
          </div>
        </BaseCard>

        <BaseCard :title="$t('supplier.documents')">
          <ul v-if="app.supportingDocuments?.length" class="space-y-3">
            <li v-for="doc in app.supportingDocuments" :key="doc._id || doc.fileUrl" class="flex flex-wrap gap-3 justify-between rounded-lg bg-gray-50 p-3 text-sm">
              <span>{{ doc.docType || $t('supplier.documents') }}</span>
              <LegacyDocumentDownload :file-url="doc.fileUrl" />
            </li>
          </ul>
          <p v-else class="text-sm text-gray-500">{{ $t('common.noData') }}</p>
        </BaseCard>

        <!-- Campaign Created -->
        <BaseCard v-if="app.campaignId" title="Funding Campaign">
          <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-green-800">Campaign created: {{ app.campaignId.campaignCode || app.campaignId }}</p>
              <p class="text-xs text-green-600 mt-1">{{ app.campaignId.status || '' }}</p>
            </div>
            <NuxtLink :to="`/admin/campaigns/${typeof app.campaignId === 'string' ? app.campaignId : app.campaignId._id}`" class="text-sm text-primary-600 font-medium">
              {{ $t('admin.manage') }}
            </NuxtLink>
          </div>
        </BaseCard>
      </div>

      <!-- Review Actions -->
      <div class="space-y-6">
        <BaseCard :title="$t('admin.riskAssessment')">
          <div class="text-center mb-4">
            <RiskBadge v-if="app.riskScore" :grade="app.riskScore" class="w-16 h-16 text-2xl" />
            <p class="text-sm text-gray-500 mt-2">{{ app.riskScore ? `Grade ${app.riskScore}` : $t('admin.notAssessed') }}</p>
          </div>
        </BaseCard>

        <BaseCard v-if="['Submitted', 'UnderReview'].includes(app.status)" :title="$t('admin.reviewDecision')">
          <div class="space-y-4">
            <div>
              <BaseInput v-model="approveData.expectedReturn" :label="$t('admin.expectedReturnInput')" type="number" placeholder="e.g. 12" />
              <BaseButton class="w-full mt-2" :loading="processing" @click="handleApprove">
                {{ $t('admin.approveApplication') }}
              </BaseButton>
            </div>

            <div class="border-t pt-4">
              <BaseButton variant="outline" class="w-full" :loading="processing" @click="handleRequestInfo">
                {{ $t('admin.requestMoreInfo') }}
              </BaseButton>
            </div>

            <div class="border-t pt-4">
              <BaseTextarea v-model="rejectReason" :label="$t('admin.rejectionReason')" rows="2" />
              <BaseButton variant="danger" class="w-full mt-2" :loading="processing" :disabled="!rejectReason" @click="handleReject">
                {{ $t('common.reject') }}
              </BaseButton>
            </div>
          </div>
        </BaseCard>

        <!-- Status summary for approved -->
        <BaseCard v-if="app.status === 'Approved'" title="Status">
          <div class="p-3 bg-green-50 rounded-lg">
            <p class="text-sm text-green-800 font-medium">Application Approved</p>
            <p v-if="!app.campaignId" class="text-xs text-green-600 mt-1">Create a funding campaign to proceed.</p>
            <p v-else class="text-xs text-green-600 mt-1">Campaign created. Publish it to open for funding.</p>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'role'] });

const route = useRoute();
const router = useRouter();
const api = useApi();
const { t } = useI18n();
const { success, error: notifyError } = useNotification();

const loading = ref(true);
const processing = ref(false);
const creating = ref(false);
const app = ref<any>(null);
const rejectReason = ref('');
const approveData = reactive({ expectedReturn: '' });

const campaign = reactive({
  fundingTarget: '',
  expectedReturn: '',
  tenorDays: '',
  riskScore: '',
  fundingDeadlineDays: '14',
  platformFeePercent: '1.5',
  milestones: [
    { name: '', percentage: '', evidenceTypes: [] as string[] },
  ] as Array<{ name: string; percentage: string; evidenceTypes: string[] }>,
});

const riskOptions = [
  { value: 'A', label: 'A - Low Risk' },
  { value: 'B', label: 'B - Medium Risk' },
  { value: 'C', label: 'C - High Risk' },
  { value: 'D', label: 'D - Very High Risk' },
];

const evidenceOptions = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'qc_report', label: 'QC Report' },
  { value: 'bill_of_lading', label: 'Bill of Lading' },
  { value: 'packing_list', label: 'Packing List' },
  { value: 'photo', label: 'Photo' },
  { value: 'video', label: 'Video' },
];

const milestoneTotal = computed(() =>
  campaign.milestones.reduce((sum, ms) => sum + (Number(ms.percentage) || 0), 0)
);

const canCreate = computed(() =>
  Number(campaign.fundingTarget) > 0 &&
  Number(campaign.expectedReturn) > 0 &&
  Number(campaign.tenorDays) >= 7 &&
  campaign.riskScore &&
  Number(campaign.fundingDeadlineDays) > 0 &&
  campaign.milestones.length > 0 &&
  campaign.milestones.every(ms => ms.name && Number(ms.percentage) > 0 && ms.evidenceTypes.length > 0) &&
  milestoneTotal.value === 100
);

const toggleEvidence = (ms: { evidenceTypes: string[] }, value: string) => {
  const idx = ms.evidenceTypes.indexOf(value);
  if (idx >= 0) ms.evidenceTypes.splice(idx, 1);
  else ms.evidenceTypes.push(value);
};

const addMilestone = () => {
  campaign.milestones.push({ name: '', percentage: '', evidenceTypes: [] });
};

const prefillCampaign = () => {
  if (!app.value) return;
  campaign.fundingTarget = String(app.value.requestedAmount || '');
  campaign.tenorDays = String(app.value.tenorDays || '');
};

onMounted(async () => {
  try {
    const res = await api.get(`/admin/applications/${route.params.id}`);
    if (res.success) {
      app.value = res.data;
      prefillCampaign();
    }
  } catch { /* ignore */ }
  loading.value = false;
});

const handleCreateCampaign = async () => {
  creating.value = true;
  try {
    const body = {
      applicationId: app.value._id,
      fundingTarget: Number(campaign.fundingTarget),
      expectedReturn: Number(campaign.expectedReturn),
      tenorDays: Number(campaign.tenorDays),
      riskScore: campaign.riskScore,
      fundingDeadlineDays: Number(campaign.fundingDeadlineDays),
      platformFeePercent: Number(campaign.platformFeePercent),
      milestones: campaign.milestones.map(ms => ({
        name: ms.name,
        percentage: Number(ms.percentage),
        requiredEvidenceTypes: ms.evidenceTypes,
      })),
    };
    const res = await api.post('/campaigns', body);
    if (res.success) {
      success('Campaign Created', 'Funding campaign has been created. Publish it to open for investors.');
      router.push(`/admin/campaigns/${res.data._id}`);
    }
  } catch (err: any) {
    notifyError('Error', err?.data?.error?.message || 'Failed to create campaign');
  }
  creating.value = false;
};

const handleApprove = async () => {
  processing.value = true;
  try {
    const res = await api.post(`/admin/applications/${route.params.id}/approve`, {
      expectedReturn: Number(approveData.expectedReturn) || undefined,
    });
    if (res.success) {
      app.value = res.data;
      prefillCampaign();
      success(t('common.approve'), t('admin.applicationApproved'));
    }
  } catch (err: any) {
    notifyError('Error', err?.data?.error?.message || 'Failed to approve');
  }
  processing.value = false;
};

const handleRequestInfo = async () => {
  processing.value = true;
  try {
    const res = await api.post(`/admin/applications/${route.params.id}/request-more-info`);
    if (res.success) {
      app.value = res.data;
      success(t('admin.requestMoreInfo'), t('admin.infoRequested'));
    }
  } catch (err: any) {
    notifyError('Error', err?.data?.error?.message || 'Failed');
  }
  processing.value = false;
};

const handleReject = async () => {
  processing.value = true;
  try {
    const res = await api.post(`/admin/applications/${route.params.id}/reject`, { reason: rejectReason.value });
    if (res.success) {
      app.value = res.data;
      success(t('common.reject'), t('admin.applicationRejected'));
    }
  } catch (err: any) {
    notifyError('Error', err?.data?.error?.message || 'Failed to reject');
  }
  processing.value = false;
};
</script>
