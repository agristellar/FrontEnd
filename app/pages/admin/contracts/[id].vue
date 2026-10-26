<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/contracts" class="text-gray-400 hover:text-gray-600">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      </NuxtLink>
      <h1 class="page-title">{{ $t('admin.contractReview') }}</h1>
      <StatusBadge v-if="contract" :status="contract.verificationStatus" />
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
    </div>

    <div v-else-if="contract" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <!-- Contract Details -->
        <BaseCard :title="$t('supplier.contractInfo')">
          <dl class="grid grid-cols-2 gap-4">
            <div><dt class="text-sm text-gray-500">{{ $t('supplier.buyerName') }}</dt><dd class="text-sm font-medium mt-1">{{ contract.buyerName }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('supplier.buyerRegion') }}</dt><dd class="text-sm font-medium mt-1">{{ contract.buyerRegion || '-' }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('supplier.productLabel') }}</dt><dd class="text-sm font-medium mt-1">{{ contract.product }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('supplier.quantity') }}</dt><dd class="text-sm font-medium mt-1">{{ Number(contract.quantity).toLocaleString() }} {{ contract.unit }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('supplier.contractValue') }}</dt><dd class="text-sm font-medium mt-1">${{ Number(contract.contractValue).toLocaleString() }} {{ contract.currency }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('supplier.paymentTerm') }}</dt><dd class="text-sm font-medium mt-1">{{ contract.paymentTerm || '-' }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('supplier.incoterm') }}</dt><dd class="text-sm font-medium mt-1">{{ contract.incoterm || '-' }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('supplier.deliveryDate') }}</dt><dd class="text-sm font-medium mt-1">{{ contract.deliveryDate ? new Date(contract.deliveryDate).toLocaleDateString() : '-' }}</dd></div>
          </dl>
        </BaseCard>

        <!-- Supplier Info -->
        <BaseCard :title="$t('admin.supplierInformation')">
          <dl class="grid grid-cols-2 gap-4">
            <div><dt class="text-sm text-gray-500">{{ $t('admin.legalName') }}</dt><dd class="text-sm font-medium mt-1">{{ contract.supplierId?.legalName }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('admin.taxId') }}</dt><dd class="text-sm mt-1">{{ contract.supplierId?.taxId }}</dd></div>
          </dl>
        </BaseCard>

        <!-- Documents -->
        <BaseCard :title="$t('supplier.documents')">
          <div v-if="contract.documentFiles?.length" class="space-y-2">
            <div v-for="doc in contract.documentFiles" :key="doc.fileUrl" class="flex flex-wrap items-center justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2 text-sm">
              <span class="text-gray-700">{{ doc.name }}</span>
              <span class="text-xs text-gray-400">{{ doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '' }}</span>
              <LegacyDocumentDownload :file-url="doc.fileUrl" :name="doc.name" />
            </div>
          </div>
          <p v-else class="text-sm text-gray-500">{{ $t('common.noData') }}</p>
        </BaseCard>
      </div>

      <!-- Review Actions -->
      <div>
        <BaseCard v-if="contract.verificationStatus === 'Pending'" :title="$t('admin.reviewActions')">
          <div class="space-y-4">
            <BaseButton class="w-full" :loading="processing" @click="handleVerify">
              {{ $t('admin.verifyContract') }}
            </BaseButton>

            <div class="border-t pt-4">
              <BaseTextarea v-model="rejectReason" :label="$t('admin.contractRejectionReason')" rows="2" :placeholder="$t('admin.contractRejectionPlaceholder')" />
              <BaseButton variant="danger" class="w-full mt-2" :loading="processing" :disabled="!rejectReason" @click="handleReject">
                {{ $t('admin.rejectContract') }}
              </BaseButton>
            </div>
          </div>
        </BaseCard>

        <BaseCard v-else-if="contract.verificationStatus === 'Rejected'">
          <div class="p-3 bg-red-50 rounded-lg">
            <p class="text-sm font-medium text-red-800">{{ $t('admin.contractRejected') }}</p>
            <p v-if="contract.rejectionReason" class="text-sm text-red-700 mt-1">{{ contract.rejectionReason }}</p>
          </div>
        </BaseCard>

        <BaseCard v-else>
          <div class="p-3 bg-green-50 rounded-lg">
            <p class="text-sm font-medium text-green-800">{{ $t('admin.contractVerified') }}</p>
            <p v-if="contract.verifiedAt" class="text-xs text-green-600 mt-1">{{ new Date(contract.verifiedAt).toLocaleDateString() }}</p>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'role'] });

const { t } = useI18n();
const route = useRoute();
const api = useApi();
const { success, error: notifyError } = useNotification();

const loading = ref(true);
const processing = ref(false);
const contract = ref<any>(null);
const rejectReason = ref('');

onMounted(async () => {
  try {
    const res = await api.get(`/admin/contracts/${route.params.id}`);
    if (res.success) contract.value = res.data;
  } catch { /* ignore */ }
  loading.value = false;
});

const handleVerify = async () => {
  processing.value = true;
  try {
    const res = await api.post(`/admin/contracts/${route.params.id}/verify`);
    if (res.success) {
      contract.value = res.data;
      success(t('admin.verifyContract'), t('admin.contractVerified'));
    }
  } catch (err: any) {
    notifyError('Error', err?.data?.error?.message || 'Failed to verify');
  }
  processing.value = false;
};

const handleReject = async () => {
  processing.value = true;
  try {
    const res = await api.post(`/admin/contracts/${route.params.id}/reject`, { rejectionReason: rejectReason.value });
    if (res.success) {
      contract.value = res.data;
      success(t('admin.rejectContract'), t('admin.contractRejected'));
    }
  } catch (err: any) {
    notifyError('Error', err?.data?.error?.message || 'Failed to reject');
  }
  processing.value = false;
};
</script>
