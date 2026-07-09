<template>
  <div>
    <h1 class="page-title mb-6">{{ $t('supplier.milestones') }}</h1>

    <BaseCard :padding="false">
      <BaseTable :columns="columns" :data="milestones" :loading="loading" :empty-text="$t('common.noData')">
        <template #campaignId.campaignCode="{ value }">
          <span class="font-medium text-gray-900">{{ value }}</span>
        </template>
        <template #percentage="{ value }">
          {{ value }}%
        </template>
        <template #disbursementAmount="{ value }">
          ${{ Number(value).toLocaleString() }}
        </template>
        <template #status="{ value }">
          <StatusBadge :status="value" />
        </template>
        <template #actions="{ row }">
          <BaseButton v-if="row.status === 'Pending' || row.status === 'EvidenceRejected'" size="sm" @click="openEvidence(row)">
            {{ $t('supplier.uploadEvidence') }}
          </BaseButton>
          <span v-else class="text-sm text-gray-400">-</span>
        </template>
      </BaseTable>
    </BaseCard>

    <!-- Evidence Upload Modal -->
    <BaseModal v-model="showModal" :title="$t('supplier.uploadEvidenceTitle')" size="lg">
      <div class="space-y-4">
        <p class="text-sm text-gray-600">{{ $t('supplier.evidenceFor') }} <strong>{{ selectedMilestone?.title }}</strong></p>
        <BaseSelect
          v-model="evidenceType"
          :label="$t('supplier.evidenceType')"
          :options="evidenceTypeOptions"
          required
        />
        <FileUploader
          :label="$t('supplier.evidenceFiles')"
          accept=".pdf,.jpg,.png"
          :multiple="true"
          @update:model-value="(files: File[]) => evidenceFiles = files"
        />
        <BaseTextarea v-model="evidenceNote" :label="$t('supplier.notes')" rows="2" />
      </div>
      <template #footer>
        <BaseButton variant="outline" @click="showModal = false">{{ $t('common.cancel') }}</BaseButton>
        <BaseButton :loading="uploading" @click="submitEvidence">{{ $t('supplier.submitEvidence') }}</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'supplier', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const { uploadFiles } = useFileUpload();
const { success, error: notifyError } = useNotification();

const loading = ref(true);
const uploading = ref(false);
const milestones = ref<any[]>([]);
const showModal = ref(false);
const selectedMilestone = ref<any>(null);
const evidenceType = ref('');
const evidenceNote = ref('');
const evidenceFiles = ref<File[]>([]);

const columns = computed(() => [
  { key: 'campaignId.campaignCode', label: t('supplier.campaign') },
  { key: 'title', label: t('supplier.milestone') },
  { key: 'percentage', label: '%' },
  { key: 'disbursementAmount', label: t('common.amount') },
  { key: 'status', label: t('common.status') },
  { key: 'actions', label: '' },
]);

const evidenceTypeOptions = computed(() => [
  { value: 'invoice', label: t('supplier.invoice') },
  { value: 'receipt', label: t('supplier.receipt') },
  { value: 'photo', label: t('supplier.photoEvidence') },
  { value: 'inspection', label: t('supplier.inspectionReport') },
  { value: 'shipping', label: t('supplier.shippingDocument') },
  { value: 'other', label: t('supplier.other') },
]);

const openEvidence = (milestone: any) => {
  selectedMilestone.value = milestone;
  evidenceType.value = '';
  evidenceNote.value = '';
  evidenceFiles.value = [];
  showModal.value = true;
};

const submitEvidence = async () => {
  if (!evidenceFiles.value.length || !evidenceType.value) {
    notifyError(t('common.required'), t('supplier.evidenceRequired'));
    return;
  }
  uploading.value = true;
  try {
    const formData = new FormData();
    evidenceFiles.value.forEach((f) => formData.append('files', f));
    formData.append('fileType', evidenceType.value);
    formData.append('note', evidenceNote.value);

    const { $api } = useNuxtApp();
    await $api(`/milestones/${selectedMilestone.value._id}/evidence`, {
      method: 'POST',
      body: formData,
    });
    success(t('supplier.submitted'), t('supplier.evidenceSubmitted'));
    showModal.value = false;
    await fetchMilestones();
  } catch (err: any) {
    notifyError('Error', err?.data?.error?.message || 'Failed to submit evidence');
  }
  uploading.value = false;
};

const fetchMilestones = async () => {
  loading.value = true;
  try {
    const res = await api.get('/milestones');
    if (res.success) milestones.value = res.data;
  } catch { /* ignore */ }
  loading.value = false;
};

onMounted(fetchMilestones);
</script>
