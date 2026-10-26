<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/supplier/contracts" class="text-gray-400 hover:text-gray-600">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      </NuxtLink>
      <h1 class="page-title">{{ $t('supplier.contractDetails') }}</h1>
      <StatusBadge v-if="contract" :status="contract.verificationStatus" />
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
    </div>

    <template v-else-if="contract">
      <!-- Rejection Banner -->
      <div v-if="contract.verificationStatus === 'Rejected'" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
        <p class="text-sm font-medium text-red-800">{{ $t('supplier.verificationRejected') }}</p>
        <p v-if="contract.rejectionReason" class="text-sm text-red-700 mt-1">{{ $t('supplier.rejectionReason') }}: {{ contract.rejectionReason }}</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Contract Info -->
        <BaseCard :title="$t('supplier.contractInfo')">
          <dl class="space-y-3">
            <div class="flex justify-between text-sm">
              <dt class="text-gray-500">{{ $t('supplier.buyerName') }}</dt>
              <dd class="font-medium text-gray-900">{{ contract.buyerName }}</dd>
            </div>
            <div v-if="contract.buyerRegion" class="flex justify-between text-sm">
              <dt class="text-gray-500">{{ $t('supplier.buyerRegion') }}</dt>
              <dd class="text-gray-900">{{ contract.buyerRegion }}</dd>
            </div>
            <div v-if="contract.buyerContactEmail" class="flex justify-between text-sm">
              <dt class="text-gray-500">{{ $t('supplier.buyerContactEmail') }}</dt>
              <dd class="text-gray-900">{{ contract.buyerContactEmail }}</dd>
            </div>
            <div class="flex justify-between text-sm">
              <dt class="text-gray-500">{{ $t('supplier.productLabel') }}</dt>
              <dd class="font-medium text-gray-900">{{ contract.product }}</dd>
            </div>
            <div class="flex justify-between text-sm">
              <dt class="text-gray-500">{{ $t('supplier.quantity') }}</dt>
              <dd class="text-gray-900">{{ Number(contract.quantity).toLocaleString() }} {{ contract.unit }}</dd>
            </div>
            <div class="flex justify-between text-sm">
              <dt class="text-gray-500">{{ $t('supplier.contractValue') }}</dt>
              <dd class="font-medium text-gray-900">${{ Number(contract.contractValue).toLocaleString() }} {{ contract.currency }}</dd>
            </div>
            <div v-if="contract.paymentTerm" class="flex justify-between text-sm">
              <dt class="text-gray-500">{{ $t('supplier.paymentTerm') }}</dt>
              <dd class="text-gray-900">{{ contract.paymentTerm }}</dd>
            </div>
            <div v-if="contract.incoterm" class="flex justify-between text-sm">
              <dt class="text-gray-500">{{ $t('supplier.incoterm') }}</dt>
              <dd class="text-gray-900">{{ contract.incoterm }}</dd>
            </div>
            <div v-if="contract.deliveryDate" class="flex justify-between text-sm">
              <dt class="text-gray-500">{{ $t('supplier.deliveryDate') }}</dt>
              <dd class="text-gray-900">{{ new Date(contract.deliveryDate).toLocaleDateString() }}</dd>
            </div>
            <div class="flex justify-between text-sm">
              <dt class="text-gray-500">{{ $t('supplier.created') }}</dt>
              <dd class="text-gray-900">{{ new Date(contract.createdAt).toLocaleDateString() }}</dd>
            </div>
          </dl>
        </BaseCard>

        <!-- Documents -->
        <BaseCard :title="$t('supplier.documents')">
          <div v-if="contract.documentFiles?.length" class="space-y-2 mb-4">
            <div v-for="doc in contract.documentFiles" :key="doc.fileUrl" class="flex flex-wrap items-center justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2 text-sm">
              <span class="text-gray-700">{{ doc.name }}</span>
              <span class="text-xs text-gray-400">{{ doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '' }}</span>
              <LegacyDocumentDownload :file-url="doc.fileUrl" :name="doc.name" />
            </div>
          </div>
          <p v-else class="text-sm text-gray-500 mb-4">{{ $t('common.noData') }}</p>

          <div v-if="contract.verificationStatus === 'Pending'">
            <FileUploader
              :label="$t('supplier.contractDocuments')"
              accept=".pdf,.jpg,.png"
              :multiple="true"
              @update:model-value="(files: File[]) => newFiles = files"
            />
            <BaseButton v-if="newFiles.length" :loading="uploading" class="mt-3" @click="uploadDocs">
              {{ $t('supplier.uploadDocuments') }}
            </BaseButton>
          </div>
        </BaseCard>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'supplier', middleware: ['auth', 'role'] });

const { t } = useI18n();
const api = useApi();
const { uploadFiles } = useFileUpload();
const { success, error: notifyError } = useNotification();
const route = useRoute();

const loading = ref(true);
const uploading = ref(false);
const contract = ref<any>(null);
const newFiles = ref<File[]>([]);

const fetchContract = async () => {
  loading.value = true;
  try {
    const res = await api.get(`/contracts/${route.params.id}`);
    if (res.success) contract.value = res.data;
  } catch (err: any) {
    notifyError('Error', err?.data?.error?.message || 'Failed to load contract');
  }
  loading.value = false;
};

const uploadDocs = async () => {
  uploading.value = true;
  try {
    await uploadFiles(`/contracts/${route.params.id}/documents`, newFiles.value);
    success(t('supplier.uploaded'), t('supplier.uploadedDesc'));
    newFiles.value = [];
    await fetchContract();
  } catch (err: any) {
    notifyError('Error', err?.data?.error?.message || 'Upload failed');
  }
  uploading.value = false;
};

onMounted(fetchContract);
</script>
