<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/campaigns" class="text-gray-400 hover:text-gray-600">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      </NuxtLink>

      <!-- Editable Campaign Code -->
      <div v-if="!editing" class="flex items-center gap-2">
        <h1 class="page-title">{{ campaign?.campaignCode || 'Campaign' }}</h1>
        <button v-if="campaign" class="text-gray-400 hover:text-gray-600" @click="startEditing" :title="$t('admin.renameCampaign')">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </button>
      </div>
      <div v-else class="flex items-center gap-2">
        <input
          ref="editInput"
          v-model="editCode"
          class="text-xl font-bold border border-primary-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          @keyup.enter="saveRename"
          @keyup.escape="cancelEditing"
        />
        <button class="text-green-600 hover:text-green-700" @click="saveRename" :disabled="renaming">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
        </button>
        <button class="text-gray-400 hover:text-gray-600" @click="cancelEditing">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <StatusBadge v-if="campaign" :status="campaign.status" />
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="campaign" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <!-- Overview -->
        <BaseCard :title="$t('admin.campaignDetails')">
          <dl class="grid grid-cols-2 gap-4">
            <div><dt class="text-sm text-gray-500">{{ $t('common.product') }}</dt><dd class="text-sm font-medium mt-1">{{ campaign.product || campaign.contractId?.product }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('admin.supplier') }}</dt><dd class="text-sm font-medium mt-1">{{ campaign.supplierId?.legalName || campaign.supplierId?.userId?.fullName }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('admin.fundingTarget') }}</dt><dd class="text-sm font-medium mt-1">${{ Number(campaign.fundingTarget).toLocaleString() }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('admin.fundedAmount') }}</dt><dd class="text-sm font-medium mt-1 text-green-600">${{ Number(campaign.fundedAmount).toLocaleString() }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('common.expectedReturn') }}</dt><dd class="text-sm font-medium mt-1">{{ campaign.expectedReturn }}%</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('common.riskGrade') }}</dt><dd class="mt-1"><RiskBadge :grade="campaign.riskScore" /></dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('common.startDate') }}</dt><dd class="text-sm mt-1">{{ campaign.publishedAt ? new Date(campaign.publishedAt).toLocaleDateString() : '-' }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('common.endDate') }}</dt><dd class="text-sm mt-1">{{ campaign.fundingDeadline ? new Date(campaign.fundingDeadline).toLocaleDateString() : '-' }}</dd></div>
          </dl>
        </BaseCard>

        <!-- Milestones -->
        <BaseCard :title="$t('common.milestones')">
          <div class="space-y-3">
            <div v-for="(m, idx) in campaign.milestones" :key="idx" class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gray-200 text-gray-600">{{ idx + 1 }}</div>
              <div class="flex-1">
                <p class="text-sm font-medium">{{ m.name }}</p>
                <p class="text-xs text-gray-500">{{ m.percentage }}% - ${{ Number(m.disbursementAmount).toLocaleString() }}</p>
              </div>
              <StatusBadge :status="m.status" />
              <div v-if="m.status === 'EvidenceSubmitted'" class="flex gap-2">
                <BaseButton size="sm" @click="approveMilestone(m._id)" :loading="processing">{{ $t('common.approve') }}</BaseButton>
                <BaseButton size="sm" variant="danger" @click="rejectMilestone(m._id)" :loading="processing">{{ $t('common.reject') }}</BaseButton>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Actions -->
      <div class="space-y-6">
        <BaseCard :title="$t('common.actions')">
          <div class="space-y-3">
            <BaseButton v-if="campaign.status === 'Draft'" class="w-full" :loading="processing" @click="publishCampaign">
              {{ $t('admin.publishCampaign') }}
            </BaseButton>
            <BaseButton v-if="campaign.status === 'AwaitingRepayment'" class="w-full" :loading="processing" @click="settleCampaign">
              {{ $t('admin.settleCampaign') }}
            </BaseButton>
          </div>
        </BaseCard>

        <!-- Funding Progress -->
        <BaseCard :title="$t('admin.fundingProgress')">
          <div class="mb-3">
            <div class="flex justify-between text-sm mb-1">
              <span>{{ Math.round((campaign.fundedAmount / campaign.fundingTarget) * 100) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class="bg-primary-600 h-3 rounded-full" :style="{ width: `${Math.min(100, (campaign.fundedAmount / campaign.fundingTarget) * 100)}%` }" />
            </div>
          </div>
          <p class="text-xs text-gray-500">${{ (campaign.fundingTarget - campaign.fundedAmount).toLocaleString() }} {{ $t('admin.remaining') }}</p>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'role'] });

const route = useRoute();
const api = useApi();
const { t } = useI18n();
const { success, error: notifyError } = useNotification();

const loading = ref(true);
const processing = ref(false);
const campaign = ref<any>(null);

const editing = ref(false);
const editCode = ref('');
const renaming = ref(false);
const editInput = ref<HTMLInputElement | null>(null);

const startEditing = () => {
  editCode.value = campaign.value?.campaignCode || '';
  editing.value = true;
  nextTick(() => editInput.value?.select());
};

const cancelEditing = () => {
  editing.value = false;
};

const saveRename = async () => {
  const newCode = editCode.value.trim();
  if (!newCode || newCode === campaign.value?.campaignCode) {
    cancelEditing();
    return;
  }
  renaming.value = true;
  try {
    const res = await api.patch(`/campaigns/${route.params.id}/rename`, { campaignCode: newCode });
    if (res.success) {
      campaign.value.campaignCode = newCode;
      success(t('admin.renameCampaign'), t('admin.campaignRenamed'));
    }
  } catch (err: any) {
    notifyError('Error', err?.data?.error?.message || 'Failed to rename');
  }
  renaming.value = false;
  editing.value = false;
};

onMounted(async () => {
  try {
    const res = await api.get(`/campaigns/${route.params.id}`);
    if (res.success) campaign.value = res.data;
  } catch { /* ignore */ }
  loading.value = false;
});

const publishCampaign = async () => {
  processing.value = true;
  try {
    const res = await api.post(`/campaigns/${route.params.id}/publish`);
    if (res.success) { campaign.value = res.data; success(t('admin.publishCampaign'), t('admin.campaignPublished')); }
  } catch (err: any) { notifyError('Error', err?.data?.error?.message || 'Failed'); }
  processing.value = false;
};

const settleCampaign = async () => {
  processing.value = true;
  try {
    const res = await api.post(`/campaigns/${route.params.id}/settle`);
    if (res.success) { campaign.value = res.data; success(t('admin.settleCampaign'), t('admin.campaignSettled')); }
  } catch (err: any) { notifyError('Error', err?.data?.error?.message || 'Failed'); }
  processing.value = false;
};

const approveMilestone = async (milestoneId: string) => {
  processing.value = true;
  try {
    await api.post(`/admin/milestones/${milestoneId}/approve`);
    success(t('common.approve'), t('admin.milestoneApproved'));
    const res = await api.get(`/campaigns/${route.params.id}`);
    if (res.success) campaign.value = res.data;
  } catch (err: any) { notifyError('Error', err?.data?.error?.message || 'Failed'); }
  processing.value = false;
};

const rejectMilestone = async (milestoneId: string) => {
  processing.value = true;
  try {
    await api.post(`/admin/milestones/${milestoneId}/reject`, { reason: 'Evidence not sufficient' });
    success(t('common.reject'), t('admin.milestoneRejected'));
    const res = await api.get(`/campaigns/${route.params.id}`);
    if (res.success) campaign.value = res.data;
  } catch (err: any) { notifyError('Error', err?.data?.error?.message || 'Failed'); }
  processing.value = false;
};
</script>
