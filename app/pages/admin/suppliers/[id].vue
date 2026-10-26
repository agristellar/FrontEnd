<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/suppliers" class="text-gray-400 hover:text-gray-600">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      </NuxtLink>
      <h1 class="page-title">{{ $t('admin.supplierReview') }}</h1>
      <StatusBadge v-if="supplier" :status="supplier.verificationStatus" />
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="supplier" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <!-- Business Info -->
        <BaseCard :title="$t('admin.businessInformation')">
          <dl class="grid grid-cols-2 gap-4">
            <div><dt class="text-sm text-gray-500">{{ $t('admin.legalName') }}</dt><dd class="text-sm font-medium mt-1">{{ supplier.legalName }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('admin.taxId') }}</dt><dd class="text-sm font-medium mt-1">{{ supplier.taxId }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('admin.representative') }}</dt><dd class="text-sm font-medium mt-1">{{ supplier.representativeName }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('admin.growingArea') }}</dt><dd class="text-sm font-medium mt-1">{{ supplier.growingArea }}</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('admin.areaSize') }}</dt><dd class="text-sm font-medium mt-1">{{ supplier.areaSize }} ha</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('admin.capacity') }}</dt><dd class="text-sm font-medium mt-1">{{ supplier.estimatedCapacity }} tons/season</dd></div>
            <div><dt class="text-sm text-gray-500">{{ $t('admin.products') }}</dt><dd class="mt-1"><div class="flex flex-wrap gap-1"><BaseBadge v-for="p in supplier.productTypes" :key="p" color="green">{{ p }}</BaseBadge></div></dd></div>
          </dl>
        </BaseCard>

        <BaseCard v-if="supplier.businessLicense" :title="$t('supplier.businessLicense')" data-kyb-license>
          <LegacyDocumentDownload :file-url="supplier.businessLicense" :name="$t('supplier.businessLicense')" />
        </BaseCard>

        <!-- Certificates -->
        <BaseCard :title="$t('admin.certTitle')">
          <div v-if="!supplier.certificates?.length" class="text-sm text-gray-500 text-center py-4">{{ $t('admin.noCerts') }}</div>
          <ul v-else class="space-y-3">
            <li v-for="cert in supplier.certificates" :key="cert.name" class="flex flex-wrap items-center justify-between gap-3 bg-gray-50 rounded-lg px-4 py-3 min-w-0">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ cert.name }}</p>
                <p class="text-xs text-gray-500">{{ $t('admin.issuedBy') }}: {{ cert.issuedBy }} | {{ $t('admin.expires') }}: {{ cert.expiredAt ? new Date(cert.expiredAt).toLocaleDateString() : 'N/A' }}</p>
              </div>
              <LegacyDocumentDownload v-if="cert.fileUrl" :file-url="cert.fileUrl" :name="cert.name" />
            </li>
          </ul>
        </BaseCard>
      </div>

      <!-- Action Sidebar -->
      <div class="space-y-6">
        <BaseCard :title="$t('admin.reviewActions')">
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-500 mb-1">{{ $t('admin.capabilityScore') }}</p>
              <p class="text-3xl font-bold" :class="supplier.capabilityScore >= 70 ? 'text-green-600' : supplier.capabilityScore >= 40 ? 'text-yellow-600' : 'text-red-600'">
                {{ supplier.capabilityScore }}<span class="text-sm text-gray-400">/100</span>
              </p>
            </div>

            <div v-if="supplier.verificationStatus === 'Pending'" class="space-y-3 pt-4 border-t">
              <BaseButton class="w-full" @click="handleVerify" :loading="processing">
                {{ $t('admin.approveSupplier') }}
              </BaseButton>
              <div>
                <BaseTextarea v-model="rejectionReason" :label="$t('admin.rejectionReason')" rows="3" :placeholder="$t('admin.rejectionPlaceholder')" />
                <BaseButton variant="danger" class="w-full mt-2" @click="handleReject" :loading="processing" :disabled="!rejectionReason">
                  {{ $t('common.reject') }}
                </BaseButton>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Account Info -->
        <BaseCard :title="$t('admin.accountInfo')">
          <dl class="space-y-2">
            <div class="flex justify-between text-sm"><dt class="text-gray-500">{{ $t('admin.email') }}</dt><dd>{{ supplier.userId?.email }}</dd></div>
            <div class="flex justify-between text-sm"><dt class="text-gray-500">{{ $t('common.name') }}</dt><dd>{{ supplier.userId?.fullName }}</dd></div>
            <div class="flex justify-between text-sm"><dt class="text-gray-500">{{ $t('admin.joined') }}</dt><dd>{{ new Date(supplier.createdAt).toLocaleDateString() }}</dd></div>
          </dl>
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
const supplier = ref<any>(null);
const rejectionReason = ref('');

onMounted(async () => {
  try {
    const res = await api.get(`/suppliers/${route.params.id}`);
    if (res.success) supplier.value = res.data;
  } catch { /* ignore */ }
  loading.value = false;
});

const handleVerify = async () => {
  processing.value = true;
  try {
    const res = await api.post(`/suppliers/${route.params.id}/verify`, { expectedVersion: supplier.value.__v || 0 });
    if (res.success) {
      supplier.value = res.data;
      success(t('common.approve'), t('admin.supplierApproved'));
    }
  } catch (err: any) {
    notifyError('Error', (err?.status === 409 || err?.statusCode === 409 ? t('admin.kybVersionChanged') : err?.data?.error?.message) || 'Failed to verify');
  }
  processing.value = false;
};

const handleReject = async () => {
  processing.value = true;
  try {
    const res = await api.post(`/suppliers/${route.params.id}/reject`, { rejectionReason: rejectionReason.value, expectedVersion: supplier.value.__v || 0 });
    if (res.success) {
      supplier.value = res.data;
      success(t('common.reject'), t('admin.supplierRejected'));
    }
  } catch (err: any) {
    notifyError('Error', (err?.status === 409 || err?.statusCode === 409 ? t('admin.kybVersionChanged') : err?.data?.error?.message) || 'Failed to reject');
  }
  processing.value = false;
};
</script>
